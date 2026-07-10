"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input } from "@/shared/components/ui/Field";
import { ROUTES } from "@/shared/constants/routes";
import { toUserMessage } from "@/shared/utils/errors";
import { useAuth } from "../hooks/AuthProvider";
import { login, requestPasswordReset } from "../services/authService";

const SAVED_EMAIL_KEY = "ark:savedEmail";

export function LoginForm() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveEmail, setSaveEmail] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // 이미 로그인된 상태면 홈으로
  useEffect(() => {
    if (!initializing && user) router.replace(ROUTES.home);
  }, [initializing, user, router]);

  // 저장된 아이디 불러오기 (hydration 이후 비동기로 반영)
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = window.localStorage.getItem(SAVED_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setSaveEmail(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await login(email, password, keepSignedIn);
      if (saveEmail) {
        window.localStorage.setItem(SAVED_EMAIL_KEY, email);
      } else {
        window.localStorage.removeItem(SAVED_EMAIL_KEY);
      }
      router.push(ROUTES.home);
    } catch (err) {
      setError(toUserMessage(err));
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (sendingReset) return;
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("비밀번호를 재설정할 이메일을 먼저 입력해주세요.");
      return;
    }
    setSendingReset(true);
    try {
      await requestPasswordReset(email.trim());
      setNotice("비밀번호 재설정 메일을 보냈습니다. 받은 편지함을 확인해주세요.");
    } catch (err) {
      // 존재하지 않는 이메일도 동일한 안내 — 계정 존재 여부 노출 방지
      if (
        err instanceof FirebaseError &&
        (err.code === "auth/user-not-found" || err.code === "auth/invalid-email")
      ) {
        setNotice("비밀번호 재설정 메일을 보냈습니다. 받은 편지함을 확인해주세요.");
      } else {
        setError(toUserMessage(err));
      }
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="이메일" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>

      <Field label="비밀번호" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={saveEmail}
              onChange={(e) => setSaveEmail(e.target.checked)}
              className="size-4 accent-accent"
            />
            아이디 저장
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="size-4 accent-accent"
            />
            자동 로그인
          </label>
        </div>
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={sendingReset}
          className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink disabled:opacity-50"
        >
          {sendingReset ? "전송 중…" : "비밀번호를 잊으셨나요?"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-accent-strong">{notice}</p>}

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        로그인
      </Button>

      <p className="text-center text-sm text-ink-soft">
        아직 계정이 없으신가요?{" "}
        <Link href={ROUTES.signup} className="font-medium text-accent underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
