import {
  collection,
  doc,
  getDoc,
  getDocs,
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
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import {
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
import { ROUTES } from "@/shared/constants/routes";
import {
  derivePositionCategory,
  type PastorApplicationInput,
  type PastorApplicationStatus,
  type PastorContact,
  type PastorProfile,
  type User,
} from "@/shared/types";

/** pastors/{uid}/private/contact — 연락처 서브문서 참조 */
function contactRef(uid: string) {
  return doc(getDb(), COLLECTIONS.pastors, uid, "private", "contact");
}

function mapPastor(id: string, data: DocumentData): PastorProfile {
  return {
    uid: id,
    name: asString(data.name),
    username: asString(data.username),
    churchName: asString(data.churchName),
    denomination: asString(data.denomination),
    position: asString(data.position),
    positionCategory: derivePositionCategory(
      asStringOrNull(data.positionCategory),
      asString(data.position),
    ),
    websiteUrl: asStringOrNull(data.websiteUrl),
    youtubeUrl: asStringOrNull(data.youtubeUrl),
    introduction: asString(data.introduction),
    photoUrl: asStringOrNull(data.photoUrl),
    ministryFields: asStringArray(data.ministryFields),
    status: asString(data.status, "pending") as PastorApplicationStatus,
    appliedAt: toMillis(data.appliedAt),
    reviewedAt: toMillisOrNull(data.reviewedAt),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function fetchPastorProfile(
  uid: string,
): Promise<PastorProfile | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.pastors, uid));
  return snap.exists() ? mapPastor(snap.id, snap.data()) : null;
}

/** 연락처 조회 — 보안 규칙상 본인·관리자만 성공한다 */
export async function fetchPastorContact(
  uid: string,
): Promise<PastorContact | null> {
  const snap = await getDoc(contactRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { phone: asString(data.phone), email: asString(data.email) };
}

/**
 * 목회자 인증 신청. 반려 후 재신청 시 기존 문서를 덮어쓴다.
 * 공개 프로필과 비공개 연락처를 분리해 하나의 batch로 저장한다.
 */
export async function submitPastorApplication(
  user: User,
  input: PastorApplicationInput,
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.set(doc(db, COLLECTIONS.pastors, user.uid), {
    name: input.name,
    username: user.username,
    churchName: input.churchName,
    denomination: input.denomination,
    position: input.position,
    positionCategory: input.positionCategory,
    websiteUrl: input.websiteUrl,
    youtubeUrl: input.youtubeUrl,
    introduction: input.introduction,
    photoUrl: input.photoUrl,
    ministryFields: input.ministryFields,
    status: "pending",
    appliedAt: serverTimestamp(),
    reviewedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(contactRef(user.uid), {
    phone: input.phone,
    email: user.email,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function fetchApplicationsByStatus(
  status: PastorApplicationStatus,
  cursor: PageCursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<PastorProfile>> {
  const constraints = [
    where("status", "==", status),
    orderBy("appliedAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.pastors), ...constraints),
  );
  return buildPage(snap.docs, pageSize, (d: QueryDocumentSnapshot) =>
    mapPastor(d.id, d.data()),
  );
}

/** 승인: 신청서 상태 + 사용자 권한 + 알림을 하나의 batch로 처리 */
export async function approvePastor(uid: string): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.pastors, uid), {
    status: "approved",
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, COLLECTIONS.users, uid), {
    role: "pastor",
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, COLLECTIONS.notifications)), {
    uid,
    type: "pastorApproved",
    message: "목회자 인증이 승인되었습니다. 이제 설교를 보관할 수 있습니다.",
    linkUrl: ROUTES.migration,
    read: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function rejectPastor(uid: string, note: string): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.pastors, uid), {
    status: "rejected",
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, COLLECTIONS.notifications)), {
    uid,
    type: "pastorRejected",
    message: note
      ? `목회자 인증이 반려되었습니다: ${note}`
      : "목회자 인증이 반려되었습니다.",
    linkUrl: ROUTES.pastorApply,
    read: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}
