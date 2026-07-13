/** Firestore 컬렉션 이름의 Single Source. 문자열 하드코딩 금지. */
export const COLLECTIONS = {
  users: "users",
  /** username 유일성 보장을 위한 매핑 컬렉션 (usernames/{username} → uid) */
  usernames: "usernames",
  pastors: "pastors",
  sermons: "sermons",
  testimonies: "testimonies",
  comments: "comments",
  bookmarks: "bookmarks",
  reports: "reports",
  seedTransactions: "seedTransactions",
  jobs: "jobs",
  /** 팔로우 관계 (follows/{followerUid}_{pastorUid}) */
  follows: "follows",
  notifications: "notifications",
  settings: "settings",
} as const;
