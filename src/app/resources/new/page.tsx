import type { Metadata } from "next";
import { ResourceCreateView } from "@/features/resources/components/ResourceCreateView";

export const metadata: Metadata = {
  title: "자료 나누기 — ARK",
};

export default function ResourceNewPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">자료 나누기</h1>
      <p className="mb-8 text-sm text-ink-soft">
        자료는 게시 즉시 공개됩니다. 저작권에 문제가 없는 자료만 올려주세요.
      </p>
      <ResourceCreateView />
    </main>
  );
}
