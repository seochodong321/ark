import type { Metadata } from "next";
import { ArchiveView } from "@/features/archive/components/ArchiveView";

export const metadata: Metadata = {
  title: "내 아카이브 — ARK",
};

export default function ArchivePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">내 아카이브</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Draft를 포함한 나의 모든 기록을 관리합니다.
      </p>
      <ArchiveView />
    </main>
  );
}
