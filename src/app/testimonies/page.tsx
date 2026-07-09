import type { Metadata } from "next";
import Link from "next/link";
import { TestimonyListView } from "@/features/testimonies/components/TestimonyListView";
import { ROUTES } from "@/shared/constants/routes";

export const metadata: Metadata = {
  title: "간증 — ARK",
};

export default function TestimoniesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-ink">간증</h1>
          <p className="text-sm text-ink-soft">
            삶 가운데 행하신 하나님의 일을 기록합니다
          </p>
        </div>
        <Link
          href={ROUTES.testimonyNew}
          className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          간증 기록하기
        </Link>
      </div>
      <TestimonyListView />
    </main>
  );
}
