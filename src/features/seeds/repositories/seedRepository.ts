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
import { CHEER_COST } from "@/shared/constants/seeds";
import type {
  ContentType,
  SeedTransaction,
  SeedTransactionType,
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
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      memo: params.memo,
      createdAt: serverTimestamp(),
    });
  });
}

const CONTENT_COLLECTION: Record<ContentType, string> = {
  sermon: COLLECTIONS.sermons,
  testimony: COLLECTIONS.testimonies,
};

/**
 * 응원: 씨앗 1개 차감 + 콘텐츠 seedCount 증가 + 거래 기록.
 * 잔액 부족 시 전체 트랜잭션이 실패한다.
 */
export async function cheerContent(params: {
  uid: string;
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
}): Promise<void> {
  const db = getDb();
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, COLLECTIONS.users, params.uid);
    const userSnap = await tx.get(userRef);
    const balance = asNumber(userSnap.data()?.seedBalance);
    if (balance < CHEER_COST) {
      throw new Error("씨앗이 부족합니다. 설교나 간증을 기록하고 씨앗을 모아보세요.");
    }
    tx.update(userRef, {
      seedBalance: increment(-CHEER_COST),
      updatedAt: serverTimestamp(),
    });
    tx.update(
      doc(db, CONTENT_COLLECTION[params.targetType], params.targetId),
      { seedCount: increment(1) },
    );
    tx.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
      uid: params.uid,
      amount: -CHEER_COST,
      type: "cheer",
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
