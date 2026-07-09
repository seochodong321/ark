import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "로그인 — ARK",
};

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-ink">로그인</h1>
      <LoginForm />
    </main>
  );
}
