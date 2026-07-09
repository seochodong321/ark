import type { ContentType } from "./common";

/**
 * 씨앗: 무료 활동 포인트. 실제 돈으로 환전되지 않는다.
 * 획득: 회원가입, 설교 등록, 간증 등록, 운영 이벤트(관리자 지급)
 * 사용: 설교 응원, 간증 응원
 */
export type SeedTransactionType =
  | "signup"
  | "sermonPublish"
  | "testimonyPublish"
  | "event"
  | "cheer"
  | "adminGrant";

export interface SeedTransaction {
  id: string;
  uid: string;
  /** 획득은 양수, 사용은 음수 */
  amount: number;
  type: SeedTransactionType;
  targetType: ContentType | null;
  targetId: string | null;
  memo: string;
  createdAt: number;
}

export const SEED_TRANSACTION_LABEL: Record<SeedTransactionType, string> = {
  signup: "회원가입 보상",
  sermonPublish: "설교 등록 보상",
  testimonyPublish: "간증 등록 보상",
  event: "운영 이벤트",
  cheer: "응원",
  adminGrant: "관리자 지급",
};
