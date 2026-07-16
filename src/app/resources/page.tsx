import type { Metadata } from "next";
import { ResourceListView } from "@/features/resources/components/ResourceListView";

export const metadata: Metadata = {
  title: "자료실 — ARK",
};

export default function ResourcesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1.5 font-serif text-3xl font-bold text-ink">자료실</h1>
      <p className="mb-8 text-sm text-ink-soft">
        기획안·템플릿·디자인 소스 — 사라지기 쉬운 사역 자료를 나누고 보존합니다
      </p>
      <ResourceListView />
    </main>
  );
}
