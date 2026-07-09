export type PastorApplicationStatus = "pending" | "approved" | "rejected";

/** pastors/{uid} — 목회자 인증 신청서이자 승인 후 공개 프로필 */
export interface PastorProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  phone: string;
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

export type PastorApplicationInput = Pick<
  PastorProfile,
  | "name"
  | "phone"
  | "churchName"
  | "denomination"
  | "position"
  | "websiteUrl"
  | "youtubeUrl"
  | "introduction"
  | "photoUrl"
  | "ministryFields"
>;

export const PASTOR_STATUS_LABEL: Record<PastorApplicationStatus, string> = {
  pending: "승인 대기",
  approved: "승인됨",
  rejected: "반려됨",
};
