import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
  asNumber,
  asString,
  asStringOrNull,
  toMillis,
} from "@/shared/firebase/converters";
import { SEED_REWARD } from "@/shared/constants/seeds";
import type { User, UserRole } from "@/shared/types";

function mapUser(uid: string, data: DocumentData): User {
  return {
    uid,
    name: asString(data.name),
    username: asString(data.username),
    email: asString(data.email),
    photoUrl: asStringOrNull(data.photoUrl),
    bio: asStringOrNull(data.bio),
    role: asString(data.role, "member") as UserRole,
    seedBalance: asNumber(data.seedBalance),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function fetchUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.users, uid));
  return snap.exists() ? mapUser(snap.id, snap.data()) : null;
}

/** 로그인 사용자 문서 실시간 구독 (씨앗 잔액·권한 변경 즉시 반영) */
export function subscribeUser(
  uid: string,
  onChange: (user: User | null) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getDb(), COLLECTIONS.users, uid),
    (snap) => onChange(snap.exists() ? mapUser(snap.id, snap.data()) : null),
    () => onChange(null),
  );
}

export async function fetchUserByUsername(
  username: string,
): Promise<User | null> {
  const db = getDb();
  const mapping = await getDoc(doc(db, COLLECTIONS.usernames, username));
  if (mapping.exists()) {
    const uid = asString(mapping.data().uid);
    return uid ? fetchUser(uid) : null;
  }
  // 매핑 문서가 없는 예외 상황 대비 fallback 쿼리
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.users),
      where("username", "==", username),
      limit(1),
    ),
  );
  return snap.empty
    ? null
    : mapUser(snap.docs[0].id, snap.docs[0].data());
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.usernames, username));
  return !snap.exists();
}

interface CreateUserProfileParams {
  uid: string;
  name: string;
  username: string;
  email: string;
  photoUrl: string | null;
  bio: string | null;
  role: UserRole;
}

/**
 * 사용자 문서 + username 매핑 + 가입 보상 씨앗을 하나의 트랜잭션으로 생성한다.
 * username이 선점되어 있으면 트랜잭션 전체가 실패한다.
 */
export async function createUserProfile(
  params: CreateUserProfileParams,
): Promise<void> {
  const db = getDb();
  await runTransaction(db, async (tx) => {
    const usernameRef = doc(db, COLLECTIONS.usernames, params.username);
    const existing = await tx.get(usernameRef);
    if (existing.exists()) {
      throw new Error("이미 사용 중인 Username입니다.");
    }
    tx.set(usernameRef, { uid: params.uid, createdAt: serverTimestamp() });
    tx.set(doc(db, COLLECTIONS.users, params.uid), {
      name: params.name,
      username: params.username,
      email: params.email,
      photoUrl: params.photoUrl,
      bio: params.bio,
      role: params.role,
      seedBalance: SEED_REWARD.signup,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: params.uid,
      amount: SEED_REWARD.signup,
      type: "signup",
      targetType: null,
      targetId: null,
      memo: "회원가입 보상",
      createdAt: serverTimestamp(),
    });
  });
}

/** 이름·소개·프로필 사진만 수정 가능. username은 변경하지 않는다. */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<User, "name" | "bio" | "photoUrl">>,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.users, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserRole(
  uid: string,
  role: UserRole,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.users, uid), {
    role,
    updatedAt: serverTimestamp(),
  });
}
