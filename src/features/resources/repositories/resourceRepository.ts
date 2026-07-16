import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
  asNumber,
  asString,
  asStringArray,
  asStringOrNull,
  toMillis,
  toMillisOrNull,
} from "@/shared/firebase/converters";
import {
  buildPage,
  DEFAULT_PAGE_SIZE,
  type Page,
  type PageCursor,
} from "@/shared/firebase/pagination";
import { deleteStorageFile } from "@/shared/firebase/storage";
import { SEED_REWARD } from "@/shared/constants/seeds";
import { fetchAuthorBadge } from "@/features/pastors/repositories/pastorRepository";
import type {
  AuthorBadge,
  ContentStatus,
  ResourceCategory,
  ResourceFile,
  ResourceInput,
  ResourcePost,
  User,
} from "@/shared/types";

function mapFiles(value: unknown): ResourceFile[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((f) => ({
      name: asString(f?.name),
      url: asString(f?.url),
      size: asNumber(f?.size),
      contentType: asString(f?.contentType),
      storagePath: asString(f?.storagePath),
    }))
    .filter((f) => f.url.length > 0);
}

function mapResource(id: string, data: DocumentData): ResourcePost {
  return {
    id,
    authorId: asString(data.authorId),
    authorName: asString(data.authorName),
    authorUsername: asString(data.authorUsername),
    authorBadge: asStringOrNull(data.authorBadge) as AuthorBadge | null,
    title: asString(data.title),
    description: asString(data.description),
    category: asString(data.category, "etc") as ResourceCategory,
    tags: asStringArray(data.tags),
    files: mapFiles(data.files),
    status: asString(data.status, "published") as ContentStatus,
    viewCount: asNumber(data.viewCount),
    downloadCount: asNumber(data.downloadCount),
    seedCount: asNumber(data.seedCount),
    commentCount: asNumber(data.commentCount),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    publishedAt: toMillisOrNull(data.publishedAt),
  };
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): ResourcePost {
  return mapResource(d.id, d.data());
}

/** 자료 게시 — 즉시 공개 + 나눔 보상을 하나의 batch로 처리 */
export async function createResource(
  author: User,
  input: ResourceInput,
): Promise<string> {
  const badge = await fetchAuthorBadge(author.uid);
  const db = getDb();
  const batch = writeBatch(db);
  const ref = doc(collection(db, COLLECTIONS.resources));
  batch.set(ref, {
    authorId: author.uid,
    authorName: author.name,
    authorUsername: author.username,
    authorBadge: badge,
    title: input.title,
    description: input.description,
    category: input.category,
    tags: input.tags,
    files: input.files,
    status: "published",
    viewCount: 0,
    downloadCount: 0,
    seedCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: serverTimestamp(),
  });
  batch.update(doc(db, COLLECTIONS.users, author.uid), {
    seedBalance: increment(SEED_REWARD.resourcePublish),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
    uid: author.uid,
    amount: SEED_REWARD.resourcePublish,
    type: "resourcePublish",
    kind: "cheer",
    targetType: "resource",
    targetId: ref.id,
    memo: `자료 나눔: ${input.title}`,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return ref.id;
}

export async function updateResource(
  resourceId: string,
  input: ResourceInput,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.resources, resourceId), {
    title: input.title,
    description: input.description,
    category: input.category,
    tags: input.tags,
    files: input.files,
    updatedAt: serverTimestamp(),
  });
}

/**
 * 자료 삭제. 보상 회수 + 첨부 파일 Storage 정리(본인 삭제 시).
 * 관리자가 타인 자료를 지울 때 Storage 파일은 남을 수 있다(권한상 불가) —
 * 문서가 사라지면 접근 경로도 사라지므로 허용한다.
 */
export async function deleteResource(
  resource: Pick<ResourcePost, "id" | "authorId" | "title" | "files">,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.resources, resource.id));
  batch.update(doc(db, COLLECTIONS.users, resource.authorId), {
    seedBalance: increment(-SEED_REWARD.resourcePublish),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
    uid: resource.authorId,
    amount: -SEED_REWARD.resourcePublish,
    type: "contentDeleted",
    kind: "cheer",
    targetType: "resource",
    targetId: resource.id,
    memo: `자료 삭제 회수: ${resource.title}`,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  await Promise.all(
    resource.files.map((f) =>
      f.storagePath ? deleteStorageFile(f.storagePath) : Promise.resolve(),
    ),
  );
}

export async function fetchResource(id: string): Promise<ResourcePost | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.resources, id));
  return snap.exists() ? mapResource(snap.id, snap.data()) : null;
}

export async function incrementResourceView(id: string): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.resources, id), {
    viewCount: increment(1),
  });
}

export async function incrementResourceDownload(id: string): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.resources, id), {
    downloadCount: increment(1),
  });
}

export async function setResourceStatus(
  id: string,
  status: ContentStatus,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.resources, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** 자료 목록 — 카테고리 필터 + 최신순 */
export async function fetchResources(
  category: ResourceCategory | null,
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<ResourcePost>> {
  const constraints: QueryConstraint[] = [where("status", "==", "published")];
  if (category) constraints.push(where("category", "==", category));
  constraints.push(
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  );
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.resources), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}
