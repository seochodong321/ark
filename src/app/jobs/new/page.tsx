import type { Metadata } from "next";
import { JobCreateView } from "@/features/jobs/components/JobCreateView";

export const metadata: Metadata = {
  title: "채용 공고 올리기 — ARK",
};

export default function JobNewPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">채용 공고 올리기</h1>
      <p className="mb-8 text-sm text-ink-soft">
        공고는 게시 즉시 모두에게 공개됩니다. 연락처는 공고에 노출되니 공개
        가능한 정보만 적어주세요.
      </p>
      <JobCreateView />
    </main>
  );
}
