import type { ContentType } from "./common";

/**
 * 씨앗 종류 구분자.
 * - cheer: 활동으로 얻는 무료 응원 포인트(환전 불가).
 * - support: 향후 확장을 위해 예약된 구분자. 관련 정책·구조는 서버·비공개로
 *   관리하며 클라이언트/저장소/문서에 두지 않는다.
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
  | "resourcePublish"
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
  resourcePublish: "자료 나눔 보상",
  share: "공유하기",
  event: "운영 이벤트",
  cheer: "응원",
  contentDeleted: "삭제 보상 회수",
  adminGrant: "관리자 지급",
};
