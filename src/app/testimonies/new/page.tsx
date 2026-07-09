import type { Metadata } from "next";
import { TestimonyNewView } from "@/features/testimonies/components/TestimonyNewView";

export const metadata: Metadata = {
  title: "간증 기록하기 — ARK",
};

export default function TestimonyNewPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">간증 기록하기</h1>
      <p className="mb-8 text-sm text-ink-soft">
        작성 중인 내용은 Draft로 자동 저장됩니다.
      </p>
      <TestimonyNewView />
    </main>
  );
}
