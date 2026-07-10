import type { Metadata } from "next";
import { JobListView } from "@/features/jobs/components/JobListView";

export const metadata: Metadata = {
  title: "채용 — ARK",
};

export default function JobsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1.5 font-serif text-3xl font-bold text-ink">채용</h1>
      <p className="mb-8 text-sm text-ink-soft">
        교회와 사역자를 잇는 자리 — 인증된 목회자가 올린 공고입니다
      </p>
      <JobListView />
    </main>
  );
}
