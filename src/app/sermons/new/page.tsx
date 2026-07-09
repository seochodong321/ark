import type { Metadata } from "next";
import { SermonCreateView } from "@/features/sermons/components/SermonCreateView";

export const metadata: Metadata = {
  title: "설교 보관하기 — ARK",
};

export default function SermonNewPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">설교 보관하기</h1>
      <p className="mb-8 text-sm text-ink-soft">
        설교는 먼저 비공개로 보관됩니다. 공개를 선택한 설교만 모두에게 보입니다.
      </p>
      <SermonCreateView />
    </main>
  );
}
