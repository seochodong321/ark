export type PastorApplicationStatus = "pending" | "approved" | "rejected";

/** 인증 신청 주체 — 개인 목회자 / 교회·단체 */
export type ApplicantType = "individual" | "organization";

/**
 * 개인 목회자의 직분 분류.
 * - evangelist(전도사): 일반 나무 🌲
 * - pastor(목사): 열매 맺은 나무 🌳
 * - other: 겸직 등 직접 입력.
 */
export type PositionCategory = "evangelist" | "pastor" | "other";

/** 단체 유형 (교회·매체 등) — 정보용, 배지는 유형과 무관하게 ⛪ */
export type OrganizationType =
  | "church"
  | "mission"
  | "seminary"
  | "media"
  | "other";

export const ORGANIZATION_TYPE_LABEL: Record<OrganizationType, string> = {
  church: "교회",
  mission: "선교단체",
  seminary: "신학교·기관",
  media: "매체·출판",
  other: "기타 단체",
};

/**
 * 이름 옆 인증 배지("나무체크") 분류.
 * 개인은 직분(전도사/목사/기타), 단체는 organization(⛪).
 */
export type AuthorBadge = PositionCategory | "organization";

/** 배지 이모지·라벨을 이 한 곳에서 관리한다 (교체 용이) */
export const AUTHOR_BADGE: Record<
  AuthorBadge,
  { emoji: string; label: string }
> = {
  evangelist: { emoji: "🌲", label: "전도사 인증" },
  pastor: { emoji: "🌳", label: "목사 인증" },
  other: { emoji: "🌲", label: "인증 목회자" },
  organization: { emoji: "⛪", label: "인증 교회·단체" },
};

export const POSITION_CATEGORY_LABEL: Record<PositionCategory, string> = {
  evangelist: "전도사",
  pastor: "목사",
  other: "기타 (직접 입력)",
};

/**
 * 직분 분류를 결정한다. 명시적 값이 있으면 사용하고, 없으면(레거시 문서)
 * 직분 문자열에서 추론해 기존 목회자도 배지가 보이게 한다.
 */
export function derivePositionCategory(
  explicit: string | undefined | null,
  positionLabel: string,
): PositionCategory {
  if (explicit === "evangelist" || explicit === "pastor" || explicit === "other") {
    return explicit;
  }
  if (positionLabel.includes("목사")) return "pastor";
  if (positionLabel.includes("전도사")) return "evangelist";
  return "other";
}

/** 프로필 → 배지 분류 (단체면 organization, 아니면 직분) */
export function authorBadgeOf(profile: {
  applicantType: ApplicantType;
  positionCategory: PositionCategory;
}): AuthorBadge {
  return profile.applicantType === "organization"
    ? "organization"
    : profile.positionCategory;
}

/**
 * pastors/{uid} — 목회자 인증 신청서이자 승인 후 공개 프로필.
 * 공개 읽기 대상이므로 연락처(전화·이메일) 등 개인정보는 담지 않는다.
 * 민감 정보는 pastors/{uid}/private/contact 문서에 분리 저장한다.
 */
export interface PastorProfile {
  uid: string;
  name: string;
  username: string;
  /** 개인 목회자 / 교회·단체 */
  applicantType: ApplicantType;
  churchName: string;
  denomination: string;
  /** 직분 표시 라벨 (개인: 전도사/목사/직접입력, 단체: 미사용) */
  position: string;
  /** 개인 직분 분류 */
  positionCategory: PositionCategory;
  /** 단체 유형 (단체일 때만) */
  organizationType: OrganizationType | null;
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
  applicantType: ApplicantType;
  phone: string;
  churchName: string;
  denomination: string;
  position: string;
  positionCategory: PositionCategory;
  organizationType: OrganizationType | null;
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
