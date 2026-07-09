import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
  "auth/invalid-email": "올바른 이메일 형식이 아닙니다.",
  "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
  "auth/user-not-found": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth/wrong-password": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth/too-many-requests":
    "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.",
  "permission-denied": "권한이 없습니다.",
};

/** 사용자에게 보여줄 한국어 에러 메시지로 변환 */
export function toUserMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const known = AUTH_ERROR_MESSAGES[error.code];
    if (known) return known;
  }
  if (error instanceof Error && error.message) return error.message;
  return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
