"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { Badge } from "@/shared/components/ui/Badge";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { contentDetailRoute } from "@/shared/constants/routes";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { CONTENT_TYPE_LABEL, type User } from "@/shared/types";
import { formatDateShort } from "@/shared/utils/date";
import { fetchBookmarks } from "../repositories/bookmarkRepository";

export function BookmarkListView() {
  return <AuthGate>{(user) => <BookmarkList user={user} />}</AuthGate>;
}

function BookmarkList({ user }: { user: User }) {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchBookmarks(user.uid, cursor),
    [user.uid],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={reload} />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="북마크한 기록이 없습니다"
        description="다시 찾고 싶은 설교와 간증을 북마크해보세요."
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {items.map((bookmark) => {
          const href = contentDetailRoute(
            bookmark.targetType,
            bookmark.targetId,
          );
          return (
            <li key={bookmark.id}>
              <Link href={href} className="group block py-4">
                <div className="flex items-center gap-2">
                  <Badge tone="accent">
                    {CONTENT_TYPE_LABEL[bookmark.targetType]}
                  </Badge>
                  <span className="truncate font-medium text-ink group-hover:text-accent">
                    {bookmark.targetTitle}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {bookmark.targetAuthorName} · {formatDateShort(bookmark.createdAt)}{" "}
                  저장
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </>
  );
}
