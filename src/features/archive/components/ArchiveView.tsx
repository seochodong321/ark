"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/features/auth/components/AuthGate";
import {
  deleteSermon,
  fetchSermonsByAuthor,
  publishSermon,
  setSermonStatus,
} from "@/features/sermons/repositories/sermonRepository";
import {
  deleteTestimony,
  fetchTestimoniesByAuthor,
  publishTestimony,
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
import {
  canWriteSermon,
  type ContentStatus,
  type ContentType,
  type User,
} from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { formatDateShort } from "@/shared/utils/date";

const STATUS_BADGE: Record<
  ContentStatus,
  { label: string; tone: "neutral" | "accent" | "warning" }
> = {
  draft: { label: "비공개", tone: "neutral" },
  published: { label: "공개", tone: "accent" },
  hidden: { label: "숨김(관리자)", tone: "warning" },
};

export function ArchiveView() {
  return <AuthGate>{(user) => <ArchiveTabs user={user} />}</AuthGate>;
}

function ArchiveTabs({ user }: { user: User }) {
  const isPastor = canWriteSermon(user.role);
  const [tab, setTab] = useState<ContentType>(isPastor ? "sermon" : "testimony");

  return (
    <div>
      {isPastor && (
        <div className="mb-6 flex gap-1 rounded-lg bg-paper-warm p-1">
          <TabButton active={tab === "sermon"} onClick={() => setTab("sermon")}>
            설교
          </TabButton>
          <TabButton
            active={tab === "testimony"}
            onClick={() => setTab("testimony")}
          >
            간증
          </TabButton>
        </div>
      )}
      {tab === "sermon" && isPastor ? (
        <SermonArchive user={user} />
      ) : (
        <TestimonyArchive user={user} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-white text-ink shadow-sm" : "text-ink-faint hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

interface ArchiveItem {
  id: string;
  title: string;
  status: ContentStatus;
  updatedAt: number;
  authorId: string;
  publishedAt: number | null;
}

function SermonArchive({ user }: { user: User }) {
  const fetcher = useCallback(
    (cursor: PageCursor) =>
      fetchSermonsByAuthor({ authorId: user.uid, scope: "all" }, cursor),
    [user.uid],
  );
  const list = usePagedList(fetcher);

  return (
    <ArchiveList
      items={list.items}
      status={list.status}
      hasMore={list.hasMore}
      loadingMore={list.loadingMore}
      onLoadMore={list.loadMore}
      onReload={list.reload}
      emptyTitle="아직 보관된 설교가 없습니다"
      emptyAction={
        <Link
          href={ROUTES.migration}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
        >
          설교 보관하기
        </Link>
      }
      detailRoute={ROUTES.sermonDetail}
      editRoute={ROUTES.sermonEdit}
      onPublish={(item) =>
        publishSermon({
          id: item.id,
          authorId: item.authorId,
          title: item.title,
          publishedAt: item.publishedAt,
        })
      }
      onUnpublish={(item) => setSermonStatus(item.id, "draft")}
      onDelete={(item) => deleteSermon(item.id)}
    />
  );
}

function TestimonyArchive({ user }: { user: User }) {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchTestimoniesByAuthor(user.uid, "all", cursor),
    [user.uid],
  );
  const list = usePagedList(fetcher);

  return (
    <ArchiveList
      items={list.items}
      status={list.status}
      hasMore={list.hasMore}
      loadingMore={list.loadingMore}
      onLoadMore={list.loadMore}
      onReload={list.reload}
      emptyTitle="아직 기록된 간증이 없습니다"
      emptyAction={
        <Link
          href={ROUTES.testimonyNew}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
        >
          간증 기록하기
        </Link>
      }
      detailRoute={ROUTES.testimonyDetail}
      editRoute={ROUTES.testimonyEdit}
      onPublish={(item) =>
        publishTestimony({
          id: item.id,
          authorId: item.authorId,
          title: item.title,
          publishedAt: item.publishedAt,
        })
      }
      onUnpublish={(item) => setTestimonyStatus(item.id, "draft")}
      onDelete={(item) => deleteTestimony(item.id)}
    />
  );
}

interface ArchiveListProps<T extends ArchiveItem> {
  items: T[];
  status: "loading" | "error" | "success";
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onReload: () => void;
  emptyTitle: string;
  emptyAction: React.ReactNode;
  detailRoute: (id: string) => string;
  editRoute: (id: string) => string;
  onPublish: (item: T) => Promise<void>;
  onUnpublish: (item: T) => Promise<void>;
  onDelete: (item: T) => Promise<void>;
}

function ArchiveList<T extends ArchiveItem>({
  items,
  status,
  hasMore,
  loadingMore,
  onLoadMore,
  onReload,
  emptyTitle,
  emptyAction,
  detailRoute,
  editRoute,
  onPublish,
  onUnpublish,
  onDelete,
}: ArchiveListProps<T>) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={onReload} />;
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} action={emptyAction} />;
  }

  const handlePublish = async (item: T) => {
    if (busyId) return;
    setBusyId(item.id);
    try {
      await onPublish(item);
      onReload();
    } finally {
      setBusyId(null);
    }
  };

  const handleUnpublish = async (item: T) => {
    if (
      busyId ||
      !window.confirm(
        "비공개로 전환할까요? 다른 사람에게 더 이상 보이지 않습니다.",
      )
    )
      return;
    setBusyId(item.id);
    try {
      await onUnpublish(item);
      onReload();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: T) => {
    if (busyId || !window.confirm(`"${item.title}"을(를) 삭제할까요? 되돌릴 수 없습니다.`)) {
      return;
    }
    setBusyId(item.id);
    try {
      await onDelete(item);
      onReload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <ul className="divide-y divide-line">
        {items.map((item) => {
          const badge = STATUS_BADGE[item.status];
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
                  마지막 수정 {formatDateShort(item.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                {item.status === "draft" && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handlePublish(item)}
                    className="rounded-lg bg-accent px-3 py-1.5 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
                  >
                    공개
                  </button>
                )}
                {item.status === "published" && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handleUnpublish(item)}
                    className="rounded-lg border border-line bg-white px-3 py-1.5 text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
                  >
                    비공개 전환
                  </button>
                )}
                <Link
                  href={editRoute(item.id)}
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-ink-soft hover:border-accent hover:text-accent"
                >
                  수정
                </Link>
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
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={onLoadMore} />
    </>
  );
}
