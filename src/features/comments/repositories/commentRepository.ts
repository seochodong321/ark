import {
  collection,
  doc,
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
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import { asString, toMillis } from "@/shared/firebase/converters";
import {
  buildPage,
  type Page,
  type PageCursor,
} from "@/shared/firebase/pagination";
import type { Comment, ContentType, User } from "@/shared/types";

const COMMENT_PAGE_SIZE = 20;

const CONTENT_COLLECTION: Record<ContentType, string> = {
  sermon: COLLECTIONS.sermons,
  testimony: COLLECTIONS.testimonies,
  resource: COLLECTIONS.resources,
};

function mapComment(snap: QueryDocumentSnapshot<DocumentData>): Comment {
  const data = snap.data();
  return {
    id: snap.id,
    targetType: asString(data.targetType, "sermon") as ContentType,
    targetId: asString(data.targetId),
    authorId: asString(data.authorId),
    authorName: asString(data.authorName),
    authorUsername: asString(data.authorUsername),
    body: asString(data.body),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function fetchComments(
  targetType: ContentType,
  targetId: string,
  cursor: PageCursor = null,
): Promise<Page<Comment>> {
  const constraints = [
    where("targetType", "==", targetType),
    where("targetId", "==", targetId),
    orderBy("createdAt", "asc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(COMMENT_PAGE_SIZE + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.comments), ...constraints),
  );
  return buildPage(snap.docs, COMMENT_PAGE_SIZE, mapComment);
}

/** 댓글 작성 + 대상 콘텐츠 commentCount 증가를 원자적으로 처리 */
export async function addComment(
  author: User,
  targetType: ContentType,
  targetId: string,
  body: string,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.set(doc(collection(db, COLLECTIONS.comments)), {
    targetType,
    targetId,
    authorId: author.uid,
    authorName: author.name,
    authorUsername: author.username,
    body,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, CONTENT_COLLECTION[targetType], targetId), {
    commentCount: increment(1),
  });
  await batch.commit();
}

export async function updateComment(id: string, body: string): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.comments, id), {
    body,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteComment(comment: Comment): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.comments, comment.id));
  batch.update(
    doc(db, CONTENT_COLLECTION[comment.targetType], comment.targetId),
    { commentCount: increment(-1) },
  );
  await batch.commit();
}
