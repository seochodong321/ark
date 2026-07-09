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
        모든 설교는 Draft로 저장된 뒤 게시를 거쳐 공개됩니다.
      </p>
      <SermonCreateView />
    </main>
  );
}
