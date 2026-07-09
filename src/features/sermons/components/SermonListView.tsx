"use client";

import { useCallback } from "react";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { fetchPublishedSermons } from "../repositories/sermonRepository";
import { SermonCard } from "./SermonCard";

export function SermonListView() {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchPublishedSermons(cursor),
    [],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={reload} />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="아직 보관된 설교가 없습니다"
        description="첫 번째 설교를 보관해보세요."
      />
    );
  }

  return (
    <>
      <div>
        {items.map((sermon) => (
          <SermonCard key={sermon.id} sermon={sermon} />
        ))}
      </div>
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </>
  );
}
