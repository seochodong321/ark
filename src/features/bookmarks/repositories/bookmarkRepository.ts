import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import { asString, toMillis } from "@/shared/firebase/converters";
import {
  buildPage,
  DEFAULT_PAGE_SIZE,
  type Page,
  type PageCursor,
} from "@/shared/firebase/pagination";
import { bookmarkId, type Bookmark, type ContentType } from "@/shared/types";

function mapBookmark(snap: QueryDocumentSnapshot<DocumentData>): Bookmark {
  const data = snap.data();
  return {
    id: snap.id,
    uid: asString(data.uid),
    targetType: asString(data.targetType, "sermon") as ContentType,
    targetId: asString(data.targetId),
    targetTitle: asString(data.targetTitle),
    targetAuthorName: asString(data.targetAuthorName),
    createdAt: toMillis(data.createdAt),
  };
}

export async function isBookmarked(
  uid: string,
  targetType: ContentType,
  targetId: string,
): Promise<boolean> {
  const snap = await getDoc(
    doc(getDb(), COLLECTIONS.bookmarks, bookmarkId(uid, targetType, targetId)),
  );
  return snap.exists();
}

export interface BookmarkTarget {
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  targetAuthorName: string;
}

export async function addBookmark(
  uid: string,
  target: BookmarkTarget,
): Promise<void> {
  await setDoc(
    doc(
      getDb(),
      COLLECTIONS.bookmarks,
      bookmarkId(uid, target.targetType, target.targetId),
    ),
    { uid, ...target, createdAt: serverTimestamp() },
  );
}

export async function removeBookmark(
  uid: string,
  targetType: ContentType,
  targetId: string,
): Promise<void> {
  await deleteDoc(
    doc(getDb(), COLLECTIONS.bookmarks, bookmarkId(uid, targetType, targetId)),
  );
}

export async function fetchBookmarks(
  uid: string,
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Bookmark>> {
  const constraints = [
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.bookmarks), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapBookmark);
}
