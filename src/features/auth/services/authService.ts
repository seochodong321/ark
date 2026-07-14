import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/shared/firebase/client";
import { profilePhotoPath, uploadImage } from "@/shared/firebase/storage";
import { RESERVED_USERNAMES } from "@/shared/constants/reservedUsernames";
import { USERNAME_PATTERN, type SignupRole, type UserRole } from "@/shared/types";
import {
  createUserProfile,
  isUsernameAvailable,
} from "../repositories/userRepository";

export interface SignupParams {
  name: string;
  username: string;
  email: string;
  password: string;
  role: SignupRole;
  photoFile: File | null;
  bio: string;
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) {
    return "Username은 3~20자의 영문 소문자, 숫자, 밑줄(_)만 사용할 수 있습니다.";
  }
  if (RESERVED_USERNAMES.has(username)) {
    return "사용할 수 없는 Username입니다.";
  }
  return null;
}

/** 회원가입 시 선택한 유형 → 초기 권한. 목회자는 승인 전까지 PastorPending. */
function initialRole(role: SignupRole): UserRole {
  return role === "pastor" ? "pastorPending" : "member";
}

export async function signup(params: SignupParams): Promise<void> {
  const usernameError = validateUsername(params.username);
  if (usernameError) throw new Error(usernameError);
  if (!(await isUsernameAvailable(params.username))) {
    throw new Error("이미 사용 중인 Username입니다.");
  }

  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    params.email,
    params.password,
  );

  try {
    await updateProfile(credential.user, { displayName: params.name });
    const photoUrl = params.photoFile
      ? await uploadImage(profilePhotoPath(credential.user.uid), params.photoFile)
      : null;
    await createUserProfile({
      uid: credential.user.uid,
      name: params.name,
      username: params.username,
      photoUrl,
      bio: params.bio.trim() || null,
      role: initialRole(params.role),
    });
  } catch (error) {
    // 프로필 생성 실패 시 auth 계정을 남기지 않는다 (고아 계정 방지)
    await deleteUser(credential.user).catch(() => undefined);
    throw error;
  }
}

/**
 * 로그인.
 * @param keepSignedIn true(기본)면 브라우저를 닫아도 로그인 유지(자동 로그인),
 *                     false면 탭 세션 동안만 유지된다.
 */
export async function login(
  email: string,
  password: string,
  keepSignedIn = true,
): Promise<void> {
  const auth = getFirebaseAuth();
  await setPersistence(
    auth,
    keepSignedIn ? browserLocalPersistence : browserSessionPersistence,
  );
  await signInWithEmailAndPassword(auth, email, password);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

/**
 * 소셜 로그인 확장 지점.
 * Google/Apple/Kakao 추가 시 이 서비스에 loginWithProvider(provider)를 구현하고
 * 최초 로그인이면 username 선택 화면을 거쳐 createUserProfile을 호출한다.
 */
export type SocialProvider = "google" | "apple" | "kakao";
