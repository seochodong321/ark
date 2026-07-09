/** 씨앗 획득/사용 정책. 정책 변경 시 이 파일만 수정한다. */
export const SEED_REWARD = {
  signup: 10,
  sermonPublish: 5,
  testimonyPublish: 3,
} as const;

/** 응원 1회당 소모되는 씨앗 */
export const CHEER_COST = 1;
