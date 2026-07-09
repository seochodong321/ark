import type { Metadata } from "next";
import { SeedHistoryView } from "@/features/seeds/components/SeedHistoryView";

export const metadata: Metadata = {
  title: "씨앗 내역 — ARK",
};

export default function SeedsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-ink">씨앗</h1>
      <SeedHistoryView />
    </main>
  );
}
