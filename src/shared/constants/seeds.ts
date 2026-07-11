/**
 * 응원 씨앗 획득/사용 정책. 정책 변경 시 이 파일만 수정한다.
 * 보상받은 기록을 삭제하면 같은 값이 회수된다.
 */
export const SEED_REWARD = {
  signup: 10,
  attendance: 1,
  sermonPublish: 5,
  testimonyPublish: 3,
  share: 1,
} as const;

/** 응원 1회당 소모되는 응원 씨앗 */
export const CHEER_COST = 1;

/**
 * 후원 씨앗 정책 (2단계 — 미구현 설계 예약).
 * 실결제·환전은 PG 연동과 Cloud Functions 서버 검증이 전제 조건이다.
 * 구현 전까지 클라이언트에서 이 값을 사용하지 않는다.
 */
export const SUPPORT_SEED = {
  /** 구매가: 1 후원 씨앗  = (비공개) */
  purchasePriceKrw: 0,
  /** 환전가: 1 후원 씨앗  = (비공개) (세금·수수료 처리 후 관리자 정산) */
  payoutPriceKrw: 0,
} as const;
