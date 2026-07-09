"use client";

import { useCallback, useState } from "react";
import {
  approvePastor,
  fetchApplicationsByStatus,
  rejectPastor,
} from "@/features/pastors/repositories/pastorRepository";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import type { PastorProfile } from "@/shared/types";
import { formatDateShort } from "@/shared/utils/date";

export function AdminPastorsView() {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchApplicationsByStatus("pending", cursor),
    [],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={reload} />;
  if (items.length === 0) {
    return <EmptyState title="대기 중인 인증 신청이 없습니다" />;
  }

  return (
    <>
      <ul className="space-y-4">
        {items.map((application) => (
          <ApplicationCard
            key={application.uid}
            application={application}
            onDone={reload}
          />
        ))}
      </ul>
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </>
  );
}

function ApplicationCard({
  application,
  onDone,
}: {
  application: PastorProfile;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    if (busy || !window.confirm(`${application.name} 님을 목회자로 승인할까요?`))
      return;
    setBusy("approve");
    try {
      await approvePastor(application.uid);
      onDone();
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    if (busy) return;
    const note = window.prompt("반려 사유를 입력하세요 (신청자에게 전달됩니다)");
    if (note === null) return;
    setBusy("reject");
    try {
      await rejectPastor(application.uid, note.trim());
      onDone();
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-start gap-4">
        <Avatar
          name={application.name}
          photoUrl={application.photoUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">
            {application.name}{" "}
            <span className="text-sm font-normal text-ink-faint">
              @{application.username}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {application.churchName} · {application.position} ·{" "}
            {application.denomination}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {application.email} · {application.phone} · 신청일{" "}
            {formatDateShort(application.appliedAt)}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {application.websiteUrl && (
              <a
                href={application.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                홈페이지 ↗
              </a>
            )}
            {application.youtubeUrl && (
              <a
                href={application.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                유튜브 ↗
              </a>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-paper-warm p-3 text-sm leading-relaxed text-ink-soft">
            {application.introduction}
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          loading={busy === "reject"}
          disabled={busy === "approve"}
          onClick={handleReject}
        >
          반려
        </Button>
        <Button
          size="sm"
          loading={busy === "approve"}
          disabled={busy === "reject"}
          onClick={handleApprove}
        >
          승인
        </Button>
      </div>
    </li>
  );
}
