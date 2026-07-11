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
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { SEED_REWARD } from "@/shared/constants/seeds";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
  asString,
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
import type {
  ContentType,
  Report,
  ReportReason,
  ReportStatus,
} from "@/shared/types";

const CONTENT_COLLECTION: Record<ContentType, string> = {
  sermon: COLLECTIONS.sermons,
  testimony: COLLECTIONS.testimonies,
};

function mapReport(snap: QueryDocumentSnapshot<DocumentData>): Report {
  const data = snap.data();
  return {
    id: snap.id,
    targetType: asString(data.targetType, "sermon") as ContentType,
    targetId: asString(data.targetId),
    targetTitle: asString(data.targetTitle),
    reporterId: asString(data.reporterId),
    reason: asString(data.reason, "etc") as ReportReason,
    detail: asString(data.detail),
    status: asString(data.status, "pending") as ReportStatus,
    resolutionNote: asStringOrNull(data.resolutionNote),
    createdAt: toMillis(data.createdAt),
    resolvedAt: toMillisOrNull(data.resolvedAt),
  };
}

export async function submitReport(params: {
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  reporterId: string;
  reason: ReportReason;
  detail: string;
}): Promise<void> {
  await addDoc(collection(getDb(), COLLECTIONS.reports), {
    ...params,
    status: "pending",
    resolutionNote: null,
    createdAt: serverTimestamp(),
    resolvedAt: null,
  });
}

export async function fetchReportsByStatus(
  status: ReportStatus,
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<Report>> {
  const constraints = [
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.reports), ...constraints),
  );
  return buildPage(snap.docs, pageSize, mapReport);
}

export type ReportAction = "hide" | "delete" | "dismiss";

/**
 * 신고 처리. 콘텐츠 비공개/삭제와 신고 상태 변경을 원자적으로 수행한다.
 * - hide: 콘텐츠를 비공개(hidden) 처리
 * - delete: 콘텐츠 문서 삭제 + 공개 보상 회수
 * - dismiss: 신고 기각 (콘텐츠 유지)
 */
export async function resolveReport(
  report: Report,
  action: ReportAction,
  note: string,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  const contentRef = doc(
    db,
    CONTENT_COLLECTION[report.targetType],
    report.targetId,
  );
  if (action === "hide") {
    batch.update(contentRef, {
      status: "hidden",
      updatedAt: serverTimestamp(),
    });
  } else if (action === "delete") {
    // 보상 회수 판단을 위해 삭제 전에 콘텐츠를 읽는다
    const snap = await getDoc(contentRef);
    if (snap.exists()) {
      const data = snap.data();
      const authorId = asString(data.authorId);
      const wasPublished = toMillisOrNull(data.publishedAt) !== null;
      if (authorId && wasPublished) {
        const reward =
          report.targetType === "sermon"
            ? SEED_REWARD.sermonPublish
            : SEED_REWARD.testimonyPublish;
        batch.update(doc(db, COLLECTIONS.users, authorId), {
          seedBalance: increment(-reward),
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(collection(db, COLLECTIONS.seedTransactions)), {
          uid: authorId,
          amount: -reward,
          type: "contentDeleted",
          kind: "cheer",
          targetType: report.targetType,
          targetId: report.targetId,
          memo: `신고 처리 삭제 회수: ${report.targetTitle}`,
          createdAt: serverTimestamp(),
        });
      }
      batch.delete(contentRef);
    }
  }
  batch.update(doc(db, COLLECTIONS.reports, report.id), {
    status: action === "dismiss" ? "dismissed" : "resolved",
    resolutionNote: note || null,
    resolvedAt: serverTimestamp(),
  });
  await batch.commit();
}
