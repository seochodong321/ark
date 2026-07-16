"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  fetchReportsByStatus,
  resolveReport,
  type ReportAction,
} from "@/features/reports/repositories/reportRepository";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { contentDetailRoute } from "@/shared/constants/routes";
import type { PageCursor } from "@/shared/firebase/pagination";
import {
  CONTENT_TYPE_LABEL,
  REPORT_REASON_LABEL,
  type Report,
} from "@/shared/types";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { formatDateShort } from "@/shared/utils/date";

export function AdminReportsView() {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchReportsByStatus("pending", cursor),
    [],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={reload} />;
  if (items.length === 0) {
    return <EmptyState title="대기 중인 신고가 없습니다" />;
  }

  return (
    <>
      <ul className="space-y-4">
        {items.map((report) => (
          <ReportCard key={report.id} report={report} onDone={reload} />
        ))}
      </ul>
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </>
  );
}

function ReportCard({
  report,
  onDone,
}: {
  report: Report;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState<ReportAction | null>(null);
  const detailHref = contentDetailRoute(report.targetType, report.targetId);

  const handle = async (action: ReportAction, confirmMessage: string) => {
    if (busy || !window.confirm(confirmMessage)) return;
    setBusy(action);
    try {
      await resolveReport(report, action, "");
      onDone();
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="rounded-xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="danger">{REPORT_REASON_LABEL[report.reason]}</Badge>
        <Badge>{CONTENT_TYPE_LABEL[report.targetType]}</Badge>
        <span className="text-xs text-ink-faint">
          {formatDateShort(report.createdAt)}
        </span>
      </div>
      <Link
        href={detailHref}
        className="mt-2 block font-medium text-ink hover:text-accent"
      >
        {report.targetTitle} ↗
      </Link>
      {report.detail && (
        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-paper-warm p-3 text-sm leading-relaxed text-ink-soft">
          {report.detail}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          loading={busy === "dismiss"}
          disabled={busy !== null && busy !== "dismiss"}
          onClick={() => handle("dismiss", "신고를 기각할까요? 콘텐츠는 유지됩니다.")}
        >
          기각
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={busy === "hide"}
          disabled={busy !== null && busy !== "hide"}
          onClick={() => handle("hide", "해당 콘텐츠를 비공개 처리할까요?")}
        >
          비공개
        </Button>
        <Button
          variant="danger"
          size="sm"
          loading={busy === "delete"}
          disabled={busy !== null && busy !== "delete"}
          onClick={() =>
            handle("delete", "해당 콘텐츠를 삭제할까요? 되돌릴 수 없습니다.")
          }
        >
          삭제
        </Button>
      </div>
    </li>
  );
}
