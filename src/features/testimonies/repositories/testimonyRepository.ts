import {
  addDoc,
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
import { SEED_REWARD } from "@/shared/constants/seeds";
import { buildSearchKeywords } from "@/features/search/services/tokenizer";
import { fetchAuthorBadge } from "@/features/pastors/repositories/pastorRepository";
import type {
  AuthorBadge,
  ContentStatus,
  Testimony,
  TestimonyInput,
  User,
} from "@/shared/types";

export function mapTestimony(id: string, data: DocumentData): Testimony {
  return {
    id,
    authorId: asString(data.authorId),
    authorName: asString(data.authorName),
    authorUsername: asString(data.authorUsername),
    authorBadge: asStringOrNull(data.authorBadge) as AuthorBadge | null,
    title: asString(data.title),
    body: asString(data.body),
    tags: asStringArray(data.tags),
    status: asString(data.status, "draft") as ContentStatus,
    viewCount: asNumber(data.viewCount),
    seedCount: asNumber(data.seedCount),
    commentCount: asNumber(data.commentCount),
    searchKeywords: asStringArray(data.searchKeywords),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    publishedAt: toMillisOrNull(data.publishedAt),
  };
}

function testimonyKeywords(input: TestimonyInput, author: User): string[] {
  return buildSearchKeywords({
    weighted: [input.title, input.tags.join(" "), author.name, author.username],
    body: input.body,
  });
}

export async function createTestimonyDraft(
  author: User,
  input: TestimonyInput,
): Promise<string> {
  const badge = await fetchAuthorBadge(author.uid);
  const ref = await addDoc(collection(getDb(), COLLECTIONS.testimonies), {
    authorId: author.uid,
    authorName: author.name,
    authorUsername: author.username,
    authorBadge: badge,
    title: input.title,
    body: input.body,
    tags: input.tags,
    status: "draft",
    viewCount: 0,
    seedCount: 0,
    commentCount: 0,
    searchKeywords: testimonyKeywords(input, author),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
  });
  return ref.id;
}

export async function updateTestimony(
  testimonyId: string,
  author: User,
  input: TestimonyInput,
): Promise<void> {
  const badge = await fetchAuthorBadge(author.uid);
  await updateDoc(doc(getDb(), COLLECTIONS.testimonies, testimonyId), {
    title: input.title,
    body: input.body,
    tags: input.tags,
    authorBadge: badge,
    searchKeywords: testimonyKeywords(input, author),
    updatedAt: serverTimestamp(),
  });
}

/** 게시 + 최초 게시일 때만 씨앗 보상 */
export async function publishTestimony(
  testimony: Pick<Testimony, "id" | "authorId" | "title" | "publishedAt">,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  const isFirstPublish = testimony.publishedAt === null;
  batch.update(doc(db, COLLECTIONS.testimonies, testimony.id), {
    status: "published",
    publishedAt: isFirstPublish ? serverTimestamp() : testimony.publishedAt,
    updatedAt: serverTimestamp(),
  });
  if (isFirstPublish) {
    batch.update(doc(db, COLLECTIONS.users, testimony.authorId), {
      seedBalance: increment(SEED_REWARD.testimonyPublish),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: testimony.authorId,
      amount: SEED_REWARD.testimonyPublish,
      type: "testimonyPublish",
      kind: "cheer",
      targetType: "testimony",
      targetId: testimony.id,
      memo: `간증 공개: ${testimony.title}`,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function fetchTestimony(id: string): Promise<Testimony | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.testimonies, id));
  return snap.exists() ? mapTestimony(snap.id, snap.data()) : null;
}

export async function incrementTestimonyView(id: string): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.testimonies, id), {
    viewCount: increment(1),
  });
}

/**
 * 간증 삭제. 공개 이력이 있으면(보상을 받았으면) 공개 보상을 회수한다.
 * 잔액이 부족해도 차감한다 — 음수 잔액을 허용해 보상 채굴을 막는다.
 */
export async function deleteTestimony(
  testimony: Pick<Testimony, "id" | "authorId" | "title" | "publishedAt">,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.testimonies, testimony.id));
  if (testimony.publishedAt !== null) {
    batch.update(doc(db, COLLECTIONS.users, testimony.authorId), {
      seedBalance: increment(-SEED_REWARD.testimonyPublish),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: testimony.authorId,
      amount: -SEED_REWARD.testimonyPublish,
      type: "contentDeleted",
      kind: "cheer",
      targetType: "testimony",
      targetId: testimony.id,
      memo: `간증 삭제 회수: ${testimony.title}`,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function setTestimonyStatus(
  id: string,
  status: ContentStatus,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.testimonies, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): Testimony {
  return mapTestimony(d.id, d.data());
}

export async function fetchPublishedTestimonies(
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Testimony>> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.testimonies), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}

/** 응원(씨앗)을 많이 받은 간증 — 홈 추천 분류용 */
export async function fetchMostCheeredTestimonies(
  count = 5,
): Promise<Testimony[]> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.testimonies),
      where("status", "==", "published"),
      orderBy("seedCount", "desc"),
      limit(count),
    ),
  );
  return snap.docs.map(mapDoc).filter((t) => t.seedCount > 0);
}

/** 관리자 콘텐츠 관리 — 상태 무관 전체 간증 최신 수정순 */
export async function fetchAllTestimoniesForAdmin(
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Testimony>> {
  const constraints: QueryConstraint[] = [
    orderBy("updatedAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.testimonies), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}

export async function fetchTestimoniesByAuthor(
  authorId: string,
  scope: "published" | "all",
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Testimony>> {
  const constraints: QueryConstraint[] = [where("authorId", "==", authorId)];
  if (scope === "published") {
    constraints.push(
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
    );
  } else {
    constraints.push(orderBy("updatedAt", "desc"));
  }
  constraints.push(...(cursor ? [startAfter(cursor)] : []), limit(pageSize + 1));
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.testimonies), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapDoc);
}
