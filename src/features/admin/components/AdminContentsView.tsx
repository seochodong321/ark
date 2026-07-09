"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  deleteSermon,
  fetchAllSermonsForAdmin,
  setSermonStatus,
} from "@/features/sermons/repositories/sermonRepository";
import {
  deleteTestimony,
  fetchAllTestimoniesForAdmin,
  setTestimonyStatus,
} from "@/features/testimonies/repositories/testimonyRepository";
import { Badge } from "@/shared/components/ui/Badge";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import type { ContentStatus, ContentType } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { formatDateShort } from "@/shared/utils/date";

const STATUS_LABEL: Record<
  ContentStatus,
  { label: string; tone: "neutral" | "accent" | "warning" }
> = {
  draft: { label: "비공개(작성자)", tone: "neutral" },
  published: { label: "공개", tone: "accent" },
  hidden: { label: "숨김(관리자)", tone: "warning" },
};

interface AdminContentItem {
  id: string;
  title: string;
  authorName: string;
  status: ContentStatus;
  updatedAt: number;
}

export function AdminContentsView() {
  const [tab, setTab] = useState<ContentType>("sermon");

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg bg-paper-warm p-1">
        {(["sermon", "testimony"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t
                ? "bg-white text-ink shadow-sm"
                : "text-ink-faint hover:text-ink",
            )}
          >
            {t === "sermon" ? "설교" : "간증"}
          </button>
        ))}
      </div>
      {tab === "sermon" ? (
        <ContentList
          fetchPage={fetchAllSermonsForAdmin}
          detailRoute={ROUTES.sermonDetail}
          onSetStatus={setSermonStatus}
          onDelete={deleteSermon}
        />
      ) : (
        <ContentList
          fetchPage={fetchAllTestimoniesForAdmin}
          detailRoute={ROUTES.testimonyDetail}
          onSetStatus={setTestimonyStatus}
          onDelete={deleteTestimony}
        />
      )}
    </div>
  );
}

function ContentList<T extends AdminContentItem>({
  fetchPage,
  detailRoute,
  onSetStatus,
  onDelete,
}: {
  fetchPage: (cursor: PageCursor) => Promise<{
    items: T[];
    cursor: PageCursor;
    hasMore: boolean;
  }>;
  detailRoute: (id: string) => string;
  onSetStatus: (id: string, status: ContentStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchPage(cursor),
    [fetchPage],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={reload} />;
  if (items.length === 0) return <EmptyState title="콘텐츠가 없습니다" />;

  const toggleHidden = async (item: T) => {
    if (busyId) return;
    setBusyId(item.id);
    try {
      await onSetStatus(
        item.id,
        item.status === "hidden" ? "published" : "hidden",
      );
      reload();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: T) => {
    if (busyId || !window.confirm(`"${item.title}"을(를) 삭제할까요? 되돌릴 수 없습니다.`))
      return;
    setBusyId(item.id);
    try {
      await onDelete(item.id);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <ul className="divide-y divide-line">
        {items.map((item) => {
          const badge = STATUS_LABEL[item.status];
          return (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  <Link
                    href={detailRoute(item.id)}
                    className="truncate font-medium text-ink hover:text-accent"
                  >
                    {item.title || "(제목 없음)"}
                  </Link>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {item.authorName} · {formatDateShort(item.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 text-xs">
                {item.status !== "draft" && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => toggleHidden(item)}
                    className="rounded-lg border border-line bg-white px-3 py-1.5 text-ink-soft hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    {item.status === "hidden" ? "공개" : "비공개"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleDelete(item)}
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-ink-soft hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </>
  );
}
