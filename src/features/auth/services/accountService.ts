import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "@/shared/firebase/client";
import type { User } from "@/shared/types";
import {
  purgeUserContent,
  purgeUserProfile,
} from "../repositories/accountRepository";

/**
 * 회원 탈퇴.
 * 1) 비밀번호 재인증(본인 확인) → 2) 콘텐츠·프로필 데이터 삭제 →
 * 3) 인증 계정 삭제. Firestore 삭제를 먼저 끝낸 뒤 계정을 지운다
 * (계정이 사라지면 이후 쓰기가 권한 거부되기 때문).
 */
export async function deleteAccount(
  user: User,
  password: string,
): Promise<void> {
  const auth = getFirebaseAuth();
  const current = auth.currentUser;
  if (!current || !current.email) {
    throw new Error("로그인이 필요합니다.");
  }

  const credential = EmailAuthProvider.credential(current.email, password);
  await reauthenticateWithCredential(current, credential);

  await purgeUserContent(user.uid);
  await purgeUserProfile(user.uid, user.username);

  await deleteUser(current);
}
