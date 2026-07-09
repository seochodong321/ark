import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "회원가입 — ARK",
};

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold text-ink">회원가입</h1>
      <p className="mb-8 text-sm text-ink-soft">
        신앙의 기록을 보존하는 디지털 아카이브, ARK에 오신 것을 환영합니다.
      </p>
      <SignupForm />
    </main>
  );
}
