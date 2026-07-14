"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { Unsubscribe } from "firebase/firestore";
import { claimDailyAttendance } from "@/features/seeds/repositories/seedRepository";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/shared/firebase/client";
import type { User } from "@/shared/types";
import { subscribeUser } from "../repositories/userRepository";

interface AuthContextValue {
  /** Firestore users 문서 기반 사용자. 미로그인 시 null */
  user: User | null;
  /** 최초 인증 상태 확인 중 */
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Firebase 환경 변수 미설정 시 비로그인 상태로 동작한다
  const [value, setValue] = useState<AuthContextValue>(() => ({
    user: null,
    initializing: isFirebaseConfigured(),
  }));

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    let unsubscribeUser: Unsubscribe | null = null;
    const unsubscribeAuth = onAuthStateChanged(
      getFirebaseAuth(),
      (firebaseUser) => {
        unsubscribeUser?.();
        unsubscribeUser = null;
        if (!firebaseUser) {
          setValue({ user: null, initializing: false });
          return;
        }
        // 이메일은 Firestore에 저장하지 않으므로 Auth 토큰 값으로 채운다
        const authEmail = firebaseUser.email ?? "";
        unsubscribeUser = subscribeUser(firebaseUser.uid, (user) =>
          setValue({
            user: user ? { ...user, email: authEmail } : null,
            initializing: false,
          }),
        );
      },
    );
    return () => {
      unsubscribeAuth();
      unsubscribeUser?.();
    };
  }, []);

  // 매일 출석 보상 — 로그인 후 세션당 한 번만 시도한다
  const attendanceUidRef = useRef<string | null>(null);
  useEffect(() => {
    const user = value.user;
    if (!user || attendanceUidRef.current === user.uid) return;
    attendanceUidRef.current = user.uid;
    claimDailyAttendance(user).catch(() => undefined);
  }, [value.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
