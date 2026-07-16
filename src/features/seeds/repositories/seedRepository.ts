import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
  asNumber,
  asString,
  asStringOrNull,
  toMillis,
} from "@/shared/firebase/converters";
import {
  buildPage,
  DEFAULT_PAGE_SIZE,
  type Page,
  type PageCursor,
} from "@/shared/firebase/pagination";
import {
  CHEER_MAX_PER_ACTION,
  CHEER_MIN_PER_ACTION,
  SEED_REWARD,
} from "@/shared/constants/seeds";
import { todayString } from "@/shared/utils/date";
import type {
  ContentType,
  SeedKind,
  SeedTransaction,
  SeedTransactionType,
  User,
} from "@/shared/types";

function mapTransaction(
  snap: QueryDocumentSnapshot<DocumentData>,
): SeedTransaction {
  const data = snap.data();
  return {
    id: snap.id,
    uid: asString(data.uid),
    amount: asNumber(data.amount),
    type: asString(data.type, "event") as SeedTransactionType,
    kind: asString(data.kind, "cheer") as SeedKind,
    targetType: asStringOrNull(data.targetType) as ContentType | null,
    targetId: asStringOrNull(data.targetId),
    memo: asString(data.memo),
    createdAt: toMillis(data.createdAt),
  };
}

interface GrantSeedsParams {
  uid: string;
  amount: number;
  type: SeedTransactionType;
  memo: string;
  targetType?: ContentType;
  targetId?: string;
}

/** 씨앗 지급: 잔액 증가 + 거래 내역 기록을 원자적으로 수행 */
export async function grantSeeds(params: GrantSeedsParams): Promise<void> {
  const db = getDb();
  await runTransaction(db, async (tx) => {
    tx.update(doc(db, COLLECTIONS.users, params.uid), {
      seedBalance: increment(params.amount),
      updatedAt: serverTimestamp(),
    });
    tx.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: params.uid,
      amount: params.amount,
      type: params.type,
      kind: "cheer",
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      memo: params.memo,
      createdAt: serverTimestamp(),
    });
  });
}

/**
 * 매일 출석 보상. 하루 한 번, 로그인 후 첫 방문 시 자동 지급된다.
 * 사용자 문서의 lastAttendanceDate와 결정적 거래 ID로 중복을 차단한다.
 * @returns 보상이 지급되었으면 true
 */
export async function claimDailyAttendance(user: User): Promise<boolean> {
  const today = todayString();
  if (user.lastAttendanceDate === today) return false;
  const db = getDb();
  return runTransaction(db, async (tx) => {
    const userRef = doc(db, COLLECTIONS.users, user.uid);
    const snap = await tx.get(userRef);
    if (snap.data()?.lastAttendanceDate === today) return false;
    tx.update(userRef, {
      seedBalance: increment(SEED_REWARD.attendance),
      lastAttendanceDate: today,
      updatedAt: serverTimestamp(),
    });
    tx.set(
      doc(db, COLLECTIONS.seedTransactions, `attendance-${user.uid}-${today}`),
      {
        uid: user.uid,
        amount: SEED_REWARD.attendance,
        type: "attendance",
        kind: "cheer",
        targetType: null,
        targetId: null,
        memo: `매일 출석 (${today})`,
        createdAt: serverTimestamp(),
      },
    );
    return true;
  });
}

/**
 * 공유하기 보상. 같은 기록은 한 번만 보상한다 (결정적 거래 ID로 차단).
 * @returns 보상이 지급되었으면 true
 */
export async function grantShareReward(params: {
  uid: string;
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
}): Promise<boolean> {
  const db = getDb();
  const txRef = doc(
    db,
    COLLECTIONS.seedTransactions,
    `share-${params.uid}-${params.targetType}-${params.targetId}`,
  );
  return runTransaction(db, async (tx) => {
    const existing = await tx.get(txRef);
    if (existing.exists()) return false;
    tx.update(doc(db, COLLECTIONS.users, params.uid), {
      seedBalance: increment(SEED_REWARD.share),
      updatedAt: serverTimestamp(),
    });
    tx.set(txRef, {
      uid: params.uid,
      amount: SEED_REWARD.share,
      type: "share",
      kind: "cheer",
      targetType: params.targetType,
      targetId: params.targetId,
      memo: `공유: ${params.targetTitle}`,
      createdAt: serverTimestamp(),
    });
    return true;
  });
}

const CONTENT_COLLECTION: Record<ContentType, string> = {
  sermon: COLLECTIONS.sermons,
  testimony: COLLECTIONS.testimonies,
  resource: COLLECTIONS.resources,
};

/** 잔액 부족 시 UI가 구분해 처리할 수 있도록 던지는 sentinel 코드 */
export const SEED_INSUFFICIENT = "SEED_INSUFFICIENT";

/**
 * 응원: 선택한 개수(amount)만큼 씨앗 차감 + 콘텐츠 seedCount 증가 + 거래 기록.
 * amount는 1~CHEER_MAX_PER_ACTION 범위. 잔액 부족 시 트랜잭션이 실패한다.
 */
export async function cheerContent(params: {
  uid: string;
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  amount: number;
}): Promise<void> {
  const amount = Math.floor(params.amount);
  if (amount < CHEER_MIN_PER_ACTION || amount > CHEER_MAX_PER_ACTION) {
    throw new Error("보낼 씨앗 개수가 올바르지 않습니다.");
  }
  const db = getDb();
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, COLLECTIONS.users, params.uid);
    const userSnap = await tx.get(userRef);
    const balance = asNumber(userSnap.data()?.seedBalance);
    if (balance < amount) {
      throw new Error(SEED_INSUFFICIENT);
    }
    tx.update(userRef, {
      seedBalance: increment(-amount),
      updatedAt: serverTimestamp(),
    });
    tx.update(
      doc(db, CONTENT_COLLECTION[params.targetType], params.targetId),
      { seedCount: increment(amount) },
    );
    tx.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: params.uid,
      amount: -amount,
      type: "cheer",
      kind: "cheer",
      targetType: params.targetType,
      targetId: params.targetId,
      memo: `응원: ${params.targetTitle}`,
      createdAt: serverTimestamp(),
    });
  });
}

/** 내 씨앗 거래 내역 (최신순, 커서 페이지네이션) */
export async function fetchSeedTransactions(
  uid: string,
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<SeedTransaction>> {
  const constraints = [
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.seedTransactions), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapTransaction);
}
