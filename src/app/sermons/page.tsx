import type { Metadata } from "next";
import { SermonListView } from "@/features/sermons/components/SermonListView";

export const metadata: Metadata = {
  title: "설교 — ARK",
};

export default function SermonsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1.5 font-serif text-3xl font-bold text-ink">설교</h1>
      <p className="mb-10 text-sm text-ink-soft">
        오늘 다시 읽는 말씀 — 성경 본문과 주제로 찾아보세요
      </p>
      <SermonListView />
    </main>
  );
}
