export type PastorApplicationStatus = "pending" | "approved" | "rejected";

/**
 * pastors/{uid} — 목회자 인증 신청서이자 승인 후 공개 프로필.
 * 공개 읽기 대상이므로 연락처(전화·이메일) 등 개인정보는 담지 않는다.
 * 민감 정보는 pastors/{uid}/private/contact 문서에 분리 저장한다.
 */
export interface PastorProfile {
  uid: string;
  name: string;
  username: string;
  churchName: string;
  denomination: string;
  /** 직분 (담임목사, 부목사, 전도사 등) */
  position: string;
  websiteUrl: string | null;
  youtubeUrl: string | null;
  introduction: string;
  photoUrl: string | null;
  /** 사역 분야 */
  ministryFields: string[];
  status: PastorApplicationStatus;
  appliedAt: number;
  reviewedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/** pastors/{uid}/private/contact — 본인·관리자만 열람 가능한 연락처 */
export interface PastorContact {
  phone: string;
  email: string;
}

export interface PastorApplicationInput {
  name: string;
  phone: string;
  churchName: string;
  denomination: string;
  position: string;
  websiteUrl: string | null;
  youtubeUrl: string | null;
  introduction: string;
  photoUrl: string | null;
  ministryFields: string[];
}

export const PASTOR_STATUS_LABEL: Record<PastorApplicationStatus, string> = {
  pending: "승인 대기",
  approved: "승인됨",
  rejected: "반려됨",
};
