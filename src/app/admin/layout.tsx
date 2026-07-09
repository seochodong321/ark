import type { ReactNode } from "react";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">관리자</h1>
      <p className="mb-6 text-sm text-ink-soft">
        신뢰할 수 있는 신앙 아카이브를 위한 운영 도구
      </p>
      <AdminShell>
        <AdminNav />
        <div className="mt-8">{children}</div>
      </AdminShell>
    </main>
  );
}
