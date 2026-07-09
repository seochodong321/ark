"use client";

import { useCallback } from "react";
import Link from "next/link";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { fetchPublishedTestimonies } from "../repositories/testimonyRepository";
import { TestimonyCard } from "./TestimonyCard";

export function TestimonyListView() {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchPublishedTestimonies(cursor),
    [],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={reload} />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="아직 기록된 간증이 없습니다"
        description="하나님께서 행하신 일을 첫 번째로 기록해보세요."
        action={
          <Link
            href={ROUTES.testimonyNew}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            간증 기록하기
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div>
        {items.map((testimony) => (
          <TestimonyCard key={testimony.id} testimony={testimony} />
        ))}
      </div>
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </>
  );
}
