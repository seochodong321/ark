/**
 * 팔로우 — 성도가 목회자를 구독한다.
 * follows/{followerUid}_{pastorUid} 결정적 ID로 중복을 차단한다.
 * 목회자 정보를 비정규화해 두어 향후 "새 설교 업로드" 이메일 알림 발송 시
 * 이 컬렉션만 조회하면 된다.
 *
 * 팔로잉 수는 저장·표시하지 않는다 — 팔로워 수(users.followerCount)만 공개.
 */
export interface Follow {
  id: string;
  followerId: string;
  pastorId: string;
  pastorName: string;
  pastorUsername: string;
  createdAt: number;
}

export function followId(followerUid: string, pastorUid: string): string {
  return `${followerUid}_${pastorUid}`;
}

/** 홈 팔로잉 피드에서 조회할 최대 팔로우 수 (Firestore in 쿼리 청크 한도 내) */
export const FOLLOWING_FEED_MAX_PASTORS = 30;
