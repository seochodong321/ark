import type { ContentType } from "./common";

/**
 * 씨앗 종류.
 * - cheer(응원 씨앗): 활동으로 얻는 무료 포인트. 응원(추천)에 사용하며 환전 불가.
 * - support(후원 씨앗): 2단계 — 실제 결제로 구매해 창작자를 후원하고,
 *   받은 사람이 환전을 신청할 수 있는 유료 씨앗. 아직 미구현이며
 *   원장(ledger)에 kind 필드로 자리만 예약해 둔다.
 */
export type SeedKind = "cheer" | "support";

/**
 * 응원 씨앗 원장 규칙:
 * - 모든 증감은 seedTransactions에 기록을 남긴다 (잔액만 바꾸는 쓰기 금지)
 * - 획득: 회원가입, 매일 출석, 설교/간증 최초 공개, 공유하기, 운영 이벤트
 * - 사용: 설교/간증 응원
 * - 회수: 보상받은 기록(공개 이력 존재)을 삭제하면 보상만큼 차감.
 *   이미 사용해 잔액이 부족하면 음수 잔액을 허용한다 — 잔액이 0 이상이
 *   될 때까지 응원이 막히므로 "공개→사용→삭제" 반복 채굴이 불가능하다.
 */
export type SeedTransactionType =
  | "signup"
  | "attendance"
  | "sermonPublish"
  | "testimonyPublish"
  | "share"
  | "event"
  | "cheer"
  | "contentDeleted"
  | "adminGrant";

export interface SeedTransaction {
  id: string;
  uid: string;
  /** 획득은 양수, 사용·회수는 음수 */
  amount: number;
  type: SeedTransactionType;
  kind: SeedKind;
  targetType: ContentType | null;
  targetId: string | null;
  memo: string;
  createdAt: number;
}

export const SEED_TRANSACTION_LABEL: Record<SeedTransactionType, string> = {
  signup: "회원가입 보상",
  attendance: "매일 출석",
  sermonPublish: "설교 공개 보상",
  testimonyPublish: "간증 공개 보상",
  share: "공유하기",
  event: "운영 이벤트",
  cheer: "응원",
  contentDeleted: "삭제 보상 회수",
  adminGrant: "관리자 지급",
};
