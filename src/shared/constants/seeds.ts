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

// 참고: 유료 잔액과 관련한 단가·정산 등 민감한 정책 값은 클라이언트 코드에
// 두지 않는다. 도입 시 서버(비공개 환경 변수 + Admin SDK)에서만 다룬다.
