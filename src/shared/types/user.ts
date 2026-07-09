/**
 * 사용자 권한.
 * - member: 일반회원. 간증 작성 가능.
 * - pastorPending: 목회자 인증 대기. member와 동일한 권한.
 * - pastor: 인증된 목회자. 설교 작성 가능.
 * - admin: 관리자. Firebase Console에서 수동 부여한다.
 */
export type UserRole = "member" | "pastorPending" | "pastor" | "admin";

/** 회원가입 시 선택하는 유형 */
export type SignupRole = "member" | "pastor";

export interface User {
  uid: string;
  name: string;
  /** 서비스 전체에서 유일. URL(/@username)로 사용된다 */
  username: string;
  email: string;
  photoUrl: string | null;
  bio: string | null;
  role: UserRole;
  seedBalance: number;
  createdAt: number;
  updatedAt: number;
}

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export const ROLE_LABEL: Record<UserRole, string> = {
  member: "일반회원",
  pastorPending: "목회자 인증 대기",
  pastor: "목회자",
  admin: "관리자",
};

export function canWriteSermon(role: UserRole | undefined): boolean {
  return role === "pastor" || role === "admin";
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "admin";
}
