"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
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
import { canWriteSermon, type JobPost } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { formatDateShort, formatSermonDate } from "@/shared/utils/date";
import { fetchJobs, type JobListScope } from "../repositories/jobRepository";

export function JobListView() {
  const { user } = useAuth();
  const [scope, setScope] = useState<JobListScope>("open");
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchJobs(scope, cursor),
    [scope],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg bg-paper-warm p-1">
          {(
            [
              { key: "open", label: "모집 중" },
              { key: "all", label: "전체" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setScope(tab.key)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                scope === tab.key
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-faint hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {user && canWriteSermon(user.role) && (
          <Link
            href={ROUTES.jobNew}
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            공고 올리기
          </Link>
        )}
      </div>

      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState onRetry={reload} />}
      {status === "success" && items.length === 0 && (
        <EmptyState
          title={
            scope === "open"
              ? "모집 중인 공고가 없습니다"
              : "등록된 공고가 없습니다"
          }
          description="인증된 목회자는 교회의 동역자를 찾는 공고를 올릴 수 있습니다."
        />
      )}
      {status === "success" &&
        items.map((job) => <JobRow key={job.id} job={job} />)}
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </div>
  );
}

function JobRow({ job }: { job: JobPost }) {
  return (
    <article className="group border-b border-line py-6 first:pt-0 last:border-b-0">
      <Link href={ROUTES.jobDetail(job.id)} className="block">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge tone={job.status === "open" ? "accent" : "neutral"}>
            {job.status === "open" ? "모집 중" : "마감"}
          </Badge>
          <span className="font-medium text-accent">{job.position}</span>
          <span className="text-ink-faint">· {job.region}</span>
          {job.employmentType && (
            <span className="text-ink-faint">· {job.employmentType}</span>
          )}
        </div>
        <h3 className="font-serif text-lg font-bold leading-snug text-ink underline-offset-4 transition-colors group-hover:underline group-hover:decoration-accent/40">
          {job.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
          <span className="font-medium text-ink-soft">{job.churchName}</span>
          <span>
            {job.deadline
              ? `${formatSermonDate(job.deadline)} 마감`
              : "충원 시까지"}
          </span>
          <span>{formatDateShort(job.createdAt)} 등록</span>
        </div>
      </Link>
    </article>
  );
}
