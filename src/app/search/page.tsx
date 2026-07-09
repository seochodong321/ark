import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/features/search/components/SearchView";
import { LoadingState } from "@/shared/components/ui/StateView";

export const metadata: Metadata = {
  title: "검색 — ARK",
};

export default function SearchPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold text-ink">검색</h1>
      <Suspense fallback={<LoadingState />}>
        <SearchView />
      </Suspense>
    </main>
  );
}
