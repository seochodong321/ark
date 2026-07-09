import type { Metadata } from "next";
import { SermonListView } from "@/features/sermons/components/SermonListView";

export const metadata: Metadata = {
  title: "설교 — ARK",
};

export default function SermonsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">설교</h1>
      <p className="mb-8 text-sm text-ink-soft">
        다음 세대가 다시 찾을 말씀의 기록
      </p>
      <SermonListView />
    </main>
  );
}
