import type { Metadata } from "next";
import { DeleteAccountView } from "@/features/auth/components/DeleteAccountView";

export const metadata: Metadata = {
  title: "계정 설정 — ARK",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">계정 설정</h1>
      <p className="mb-8 text-sm text-ink-soft">
        계정과 관련한 설정을 관리합니다.
      </p>
      <DeleteAccountView />
    </main>
  );
}
