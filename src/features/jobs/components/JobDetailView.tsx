"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { MarkdownView } from "@/shared/components/ui/MarkdownView";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { isAdmin, type JobPost } from "@/shared/types";
import { formatDateShort, formatSermonDate } from "@/shared/utils/date";
import {
  deleteJob,
  fetchJob,
  incrementJobView,
  setJobStatus,
} from "../repositories/jobRepository";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; job: JobPost };

export function JobDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const [busy, setBusy] = useState(false);
  const viewCounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchJob(id)
      .then((job) => {
        if (cancelled) return;
        setState(job ? { phase: "ready", job } : { phase: "notFound" });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  useEffect(() => {
    if (state.phase === "ready" && !viewCounted.current) {
      viewCounted.current = true;
      incrementJobView(id).catch(() => undefined);
    }
  }, [state, id]);

  const load = () => {
    setState({ phase: "loading" });
    setReloadToken((t) => t + 1);
  };

  if (state.phase === "loading") return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={load} />;
  if (state.phase === "notFound") {
    return <EmptyState title="공고를 찾을 수 없습니다" />;
  }

  const { job } = state;
  const canManage = user?.uid === job.authorId || isAdmin(user?.role);

  const handleToggleStatus = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setJobStatus(job.id, job.status === "open" ? "closed" : "open");
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy || !window.confirm("공고를 삭제할까요? 되돌릴 수 없습니다.")) return;
    setBusy(true);
    try {
      await deleteJob(job.id);
      router.push(ROUTES.jobs);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article>
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={job.status === "open" ? "accent" : "neutral"}>
            {job.status === "open" ? "모집 중" : "마감"}
          </Badge>
          <span className="text-xs text-ink-faint">
            {formatDateShort(job.createdAt)} 등록 · 조회 {job.viewCount}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold leading-snug text-ink">
          {job.title}
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          <Link
            href={ROUTES.pastorPage(job.authorUsername)}
            className="font-medium text-ink hover:text-accent"
          >
            {job.authorName}
          </Link>{" "}
          · {job.churchName}
        </p>
        {canManage && (
          <div className="mt-4 flex gap-2">
            <Link
              href={ROUTES.jobEdit(job.id)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-soft hover:border-accent hover:text-accent"
            >
              수정
            </Link>
            <Button
              variant="secondary"
              size="sm"
              className="h-auto rounded-lg px-3 py-1.5 text-xs"
              loading={busy}
              onClick={handleToggleStatus}
            >
              {job.status === "open" ? "마감 처리" : "다시 모집"}
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-soft hover:border-red-700 hover:text-red-700"
            >
              삭제
            </button>
          </div>
        )}
      </header>

      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaCard label="모집 분야" value={job.position} />
        <MetaCard label="지역" value={job.region} />
        <MetaCard label="고용 형태" value={job.employmentType ?? "협의"} />
        <MetaCard
          label="마감일"
          value={job.deadline ? formatSermonDate(job.deadline) : "충원 시까지"}
        />
      </dl>

      <MarkdownView content={job.description} />

      {(job.contactEmail || job.contactPhone) && (
        <div className="mt-10 rounded-2xl border border-accent-soft bg-accent-soft/40 p-6">
          <h2 className="text-sm font-semibold text-accent-strong">지원 문의</h2>
          <div className="mt-2 space-y-1 text-sm text-ink">
            {job.contactEmail && (
              <p>
                이메일:{" "}
                <a
                  href={`mailto:${job.contactEmail}`}
                  className="text-accent underline underline-offset-2"
                >
                  {job.contactEmail}
                </a>
              </p>
            )}
            {job.contactPhone && <p>전화: {job.contactPhone}</p>}
          </div>
        </div>
      )}
    </article>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
