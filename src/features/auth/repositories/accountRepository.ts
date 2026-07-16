import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  type Query,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";

/** 쿼리로 조회한 모든 문서를 batch(최대 400개)로 삭제한다 */
async function deleteQuery(q: Query): Promise<void> {
  const snap = await getDocs(q);
  const db = getDb();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = writeBatch(db);
    for (const d of snap.docs.slice(i, i + 400)) batch.delete(d.ref);
    await batch.commit();
  }
}

/**
 * 회원이 작성한 콘텐츠를 삭제한다 (설교·간증·댓글·북마크·팔로우).
 * 삭제 규칙상 본인 문서만 지워지며, 씨앗 거래 내역(불변)과 다른 사람이 남긴
 * 팔로우/댓글 수 카운터는 정리하지 않는다.
 */
export async function purgeUserContent(uid: string): Promise<void> {
  const db = getDb();
  await deleteQuery(
    query(collection(db, COLLECTIONS.sermons), where("authorId", "==", uid)),
  );
  await deleteQuery(
    query(collection(db, COLLECTIONS.testimonies), where("authorId", "==", uid)),
  );
  await deleteQuery(
    query(collection(db, COLLECTIONS.resources), where("authorId", "==", uid)),
  );
  await deleteQuery(
    query(collection(db, COLLECTIONS.comments), where("authorId", "==", uid)),
  );
  await deleteQuery(
    query(collection(db, COLLECTIONS.bookmarks), where("uid", "==", uid)),
  );
  await deleteQuery(
    query(collection(db, COLLECTIONS.follows), where("followerId", "==", uid)),
  );
}

/**
 * 회원의 프로필·식별 문서를 삭제한다.
 * 마지막에 users 문서까지 지운 뒤 호출부에서 Auth 계정을 삭제한다.
 */
export async function purgeUserProfile(
  uid: string,
  username: string,
): Promise<void> {
  const db = getDb();
  // 목회자/단체 인증 문서 + 비공개 연락처
  const pastorRef = doc(db, COLLECTIONS.pastors, uid);
  if ((await getDoc(pastorRef)).exists()) {
    await deleteDoc(doc(db, COLLECTIONS.pastors, uid, "private", "contact")).catch(
      () => undefined,
    );
    await deleteDoc(pastorRef);
  }
  if (username) {
    await deleteDoc(doc(db, COLLECTIONS.usernames, username)).catch(
      () => undefined,
    );
  }
  await deleteDoc(doc(db, COLLECTIONS.users, uid));
}
