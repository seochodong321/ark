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
  where,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import { asString } from "@/shared/firebase/converters";
import {
  FOLLOWING_FEED_MAX_PASTORS,
  followId,
  type User,
} from "@/shared/types";

export async function isFollowing(
  followerUid: string,
  pastorUid: string,
): Promise<boolean> {
  const snap = await getDoc(
    doc(getDb(), COLLECTIONS.follows, followId(followerUid, pastorUid)),
  );
  return snap.exists();
}

/** 팔로우: 관계 문서 생성 + 목회자 팔로워 수 증가를 원자적으로 처리 */
export async function followPastor(
  follower: User,
  pastor: Pick<User, "uid" | "name" | "username">,
): Promise<void> {
  if (follower.uid === pastor.uid) {
    throw new Error("자신을 팔로우할 수 없습니다.");
  }
  const db = getDb();
  const batch = writeBatch(db);
  batch.set(doc(db, COLLECTIONS.follows, followId(follower.uid, pastor.uid)), {
    followerId: follower.uid,
    pastorId: pastor.uid,
    pastorName: pastor.name,
    pastorUsername: pastor.username,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, COLLECTIONS.users, pastor.uid), {
    followerCount: increment(1),
  });
  await batch.commit();
}

/** 언팔로우: 관계 문서 삭제 + 목회자 팔로워 수 감소 */
export async function unfollowPastor(
  followerUid: string,
  pastorUid: string,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.follows, followId(followerUid, pastorUid)));
  batch.update(doc(db, COLLECTIONS.users, pastorUid), {
    followerCount: increment(-1),
  });
  await batch.commit();
}

/** 홈 팔로잉 피드용 — 최근 팔로우한 목회자 uid 목록 (최대 30명) */
export async function fetchFollowedPastorIds(
  followerUid: string,
): Promise<string[]> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.follows),
      where("followerId", "==", followerUid),
      orderBy("createdAt", "desc"),
      limit(FOLLOWING_FEED_MAX_PASTORS),
    ),
  );
  return snap.docs
    .map((d) => asString(d.data().pastorId))
    .filter((id) => id.length > 0);
}
