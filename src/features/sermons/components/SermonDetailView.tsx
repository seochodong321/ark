"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { ScriptureQuote } from "@/features/bible/components/ScriptureQuote";
import { BookmarkButton } from "@/features/bookmarks/components/BookmarkButton";
import { CommentSection } from "@/features/comments/components/CommentSection";
import { ReportButton } from "@/features/reports/components/ReportButton";
import { CheerButton } from "@/features/seeds/components/CheerButton";
import { ShareButton } from "@/features/seeds/components/ShareButton";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { MarkdownView } from "@/shared/components/ui/MarkdownView";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { isAdmin, type Sermon } from "@/shared/types";
import { formatSermonDate } from "@/shared/utils/date";
import {
  deleteSermon,
  fetchSermon,
  incrementSermonView,
  publishSermon,
} from "../repositories/sermonRepository";
import { YouTubeEmbed } from "./YouTubeEmbed";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; sermon: Sermon };

export function SermonDetailView({ id }: { id: string }) {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const viewCounted = useRef(false);
  const [busy, setBusy] = useState(false);

  // 다른 설교로 이동하면 렌더 중에 로딩 상태로 재조정한다
  const [activeId, setActiveId] = useState(id);
  if (activeId !== id) {
    setActiveId(id);
    setState({ phase: "loading" });
  }

  useEffect(() => {
    let cancelled = false;
    fetchSermon(id)
      .then((sermon) => {
        if (cancelled) return;
        setState(sermon ? { phase: "ready", sermon } : { phase: "notFound" });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const load = () => {
    setState({ phase: "loading" });
    setReloadToken((t) => t + 1);
  };

  useEffect(() => {
    if (
      state.phase === "ready" &&
      state.sermon.status === "published" &&
      !viewCounted.current
    ) {
      viewCounted.current = true;
      incrementSermonView(id).catch(() => undefined);
    }
  }, [state, id]);

  if (state.phase === "loading" || initializing) return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={load} />;
  if (state.phase === "notFound") {
    return <EmptyState title="설교를 찾을 수 없습니다" />;
  }

  const { sermon } = state;
  const isOwner = user?.uid === sermon.authorId;
  const canManage = isOwner || isAdmin(user?.role);

  if (sermon.status !== "published" && !canManage) {
    return <EmptyState title="비공개 설교입니다" />;
  }

  const handlePublish = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await publishSermon(sermon);
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy || !window.confirm("설교를 삭제할까요? 삭제한 기록은 되돌릴 수 없습니다.")) {
      return;
    }
    setBusy(true);
    try {
      await deleteSermon(sermon);
      router.push(ROUTES.archive);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article>
      {sermon.status !== "published" && (
        <div className="mb-6 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
          <span className="text-sm text-amber-800">
            {sermon.status === "draft"
              ? "비공개 — 나만 볼 수 있는 기록입니다."
              : "관리자에 의해 숨김 처리된 설교입니다."}
          </span>
          {isOwner && sermon.status === "draft" && (
            <Button size="sm" loading={busy} onClick={handlePublish}>
              공개하기
            </Button>
          )}
        </div>
      )}

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {sermon.scripture && <Badge tone="accent">{sermon.scripture}</Badge>}
          {sermon.series && <Badge>{sermon.series}</Badge>}
        </div>
        <h1 className="font-serif text-3xl font-bold leading-snug text-ink">
          {sermon.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          <Link
            href={ROUTES.pastorPage(sermon.authorUsername)}
            className="font-medium text-ink hover:text-accent"
          >
            {sermon.authorName}
          </Link>
          {sermon.sermonDate && (
            <time>{formatSermonDate(sermon.sermonDate)}</time>
          )}
          <span className="text-ink-faint">조회 {sermon.viewCount}</span>
        </div>
        {canManage && (
          <div className="mt-4 flex gap-2">
            <Link
              href={ROUTES.sermonEdit(sermon.id)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-soft hover:border-accent hover:text-accent"
            >
              수정
            </Link>
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

      {sermon.coverImageUrl && (
        <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl border border-line">
          <Image
            src={sermon.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>
      )}

      {sermon.youtubeVideoId && <YouTubeEmbed videoId={sermon.youtubeVideoId} />}

      <ScriptureQuote scripture={sermon.scripture} />

      <MarkdownView content={sermon.body} />

      {sermon.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {sermon.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      )}

      {sermon.status === "published" && (
        <>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-line pt-8">
            <CheerButton
              targetType="sermon"
              targetId={sermon.id}
              targetTitle={sermon.title}
              initialCount={sermon.seedCount}
            />
            <BookmarkButton
              targetType="sermon"
              targetId={sermon.id}
              targetTitle={sermon.title}
              targetAuthorName={sermon.authorName}
            />
            <ShareButton
              targetType="sermon"
              targetId={sermon.id}
              targetTitle={sermon.title}
            />
            <ReportButton
              targetType="sermon"
              targetId={sermon.id}
              targetTitle={sermon.title}
            />
          </div>
          <CommentSection targetType="sermon" targetId={sermon.id} />
        </>
      )}
    </article>
  );
}
