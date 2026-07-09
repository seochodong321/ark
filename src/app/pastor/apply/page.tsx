import type { Metadata } from "next";
import { PastorApplyForm } from "@/features/pastors/components/PastorApplyForm";

export const metadata: Metadata = {
  title: "목회자 인증 신청 — ARK",
};

export default function PastorApplyPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold text-ink">목회자 인증 신청</h1>
      <p className="mb-8 text-sm leading-relaxed text-ink-soft">
        설교 보관은 인증된 목회자에게만 열려 있습니다. 신뢰할 수 있는 신앙
        아카이브를 위해 관리자가 신청 내용을 직접 검토합니다.
      </p>
      <PastorApplyForm />
    </main>
  );
}
