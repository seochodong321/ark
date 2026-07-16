"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { PastorBadge } from "@/features/pastors/components/PastorBadge";
import { Badge } from "@/shared/components/ui/Badge";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { formatFileSize } from "@/shared/constants/uploads";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import {
  RESOURCE_CATEGORY_LABEL,
  type ResourceCategory,
  type ResourcePost,
} from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { formatDateShort } from "@/shared/utils/date";
import { excerpt } from "@/shared/utils/text";
import { fetchResources } from "../repositories/resourceRepository";

const CATEGORY_TABS: Array<{ key: ResourceCategory | null; label: string }> = [
  { key: null, label: "전체" },
  ...Object.entries(RESOURCE_CATEGORY_LABEL).map(([key, label]) => ({
    key: key as ResourceCategory,
    label,
  })),
];

export function ResourceListView() {
  const { user } = useAuth();
  const [category, setCategory] = useState<ResourceCategory | null>(null);
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchResources(category, cursor),
    [category],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key ?? "all"}
              type="button"
              onClick={() => setCategory(tab.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                category === tab.key
                  ? "bg-accent text-white"
                  : "bg-white text-ink-soft ring-1 ring-line hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {user && (
          <Link
            href={ROUTES.resourceNew}
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            자료 나누기
          </Link>
        )}
      </div>

      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState onRetry={reload} />}
      {status === "success" && items.length === 0 && (
        <EmptyState
          title={
            category
              ? "이 카테고리에는 아직 자료가 없습니다"
              : "아직 나눠진 자료가 없습니다"
          }
          description="교회학교 기획안, 영상 템플릿, 디자인 소스 — 사라지기 전에 나눠주세요."
        />
      )}
      {status === "success" &&
        items.map((resource) => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </div>
  );
}

function ResourceRow({ resource }: { resource: ResourcePost }) {
  const totalSize = resource.files.reduce((sum, f) => sum + f.size, 0);
  return (
    <article className="group border-b border-line py-6 first:pt-0 last:border-b-0">
      <Link href={ROUTES.resourceDetail(resource.id)} className="block">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge tone="accent">
            {RESOURCE_CATEGORY_LABEL[resource.category]}
          </Badge>
          <span className="text-ink-faint">
            📎 파일 {resource.files.length}개 · {formatFileSize(totalSize)}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold leading-snug text-ink underline-offset-4 transition-colors group-hover:underline group-hover:decoration-accent/40">
          {resource.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {excerpt(resource.description, 100)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
          <span className="flex items-center gap-1 font-medium text-ink-soft">
            {resource.authorName}
            <PastorBadge badge={resource.authorBadge} className="text-sm" />
          </span>
          <span>받기 {resource.downloadCount}</span>
          <span>🌱 {resource.seedCount}</span>
          <span>{formatDateShort(resource.createdAt)}</span>
        </div>
      </Link>
    </article>
  );
}
