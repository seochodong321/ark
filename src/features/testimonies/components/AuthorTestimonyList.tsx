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
import { fetchTestimoniesByAuthor } from "../repositories/testimonyRepository";
import { TestimonyCard } from "./TestimonyCard";

/** 사용자 페이지의 공개 간증 목록 */
export function AuthorTestimonyList({ authorId }: { authorId: string }) {
  const fetcher = useCallback(
    (cursor: PageCursor) =>
      fetchTestimoniesByAuthor(authorId, "published", cursor),
    [authorId],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-ink">간증</h2>
      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState onRetry={reload} />}
      {status === "success" && items.length === 0 && (
        <EmptyState title="아직 기록된 간증이 없습니다" />
      )}
      {status === "success" &&
        items.map((testimony) => (
          <TestimonyCard key={testimony.id} testimony={testimony} />
        ))}
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </section>
  );
}
