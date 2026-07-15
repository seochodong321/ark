"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { BookmarkButton } from "@/features/bookmarks/components/BookmarkButton";
import { CommentSection } from "@/features/comments/components/CommentSection";
import { ReportButton } from "@/features/reports/components/ReportButton";
import { CheerButton } from "@/features/seeds/components/CheerButton";
import { ShareButton } from "@/features/seeds/components/ShareButton";
import { PastorBadge } from "@/features/pastors/components/PastorBadge";
import { Badge } from "@/shared/components/ui/Badge";
import { MarkdownView } from "@/shared/components/ui/MarkdownView";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { isAdmin, type Testimony } from "@/shared/types";
import { formatDate } from "@/shared/utils/date";
import {
  deleteTestimony,
  fetchTestimony,
  incrementTestimonyView,
} from "../repositories/testimonyRepository";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; testimony: Testimony };

export function TestimonyDetailView({ id }: { id: string }) {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const viewCounted = useRef(false);
  const [busy, setBusy] = useState(false);

  // 다른 간증으로 이동하면 렌더 중에 로딩 상태로 재조정한다
  const [activeId, setActiveId] = useState(id);
  if (activeId !== id) {
    setActiveId(id);
    setState({ phase: "loading" });
  }

  useEffect(() => {
    let cancelled = false;
    fetchTestimony(id)
      .then((testimony) => {
        if (cancelled) return;
        setState(
          testimony ? { phase: "ready", testimony } : { phase: "notFound" },
        );
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
      state.testimony.status === "published" &&
      !viewCounted.current
    ) {
      viewCounted.current = true;
      incrementTestimonyView(id).catch(() => undefined);
    }
  }, [state, id]);

  if (state.phase === "loading" || initializing) return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={load} />;
  if (state.phase === "notFound") {
    return <EmptyState title="간증을 찾을 수 없습니다" />;
  }

  const { testimony } = state;
  const isOwner = user?.uid === testimony.authorId;
  const canManage = isOwner || isAdmin(user?.role);

  if (testimony.status !== "published" && !canManage) {
    return <EmptyState title="비공개 간증입니다" />;
  }

  const handleDelete = async () => {
    if (busy || !window.confirm("간증을 삭제할까요? 삭제한 기록은 되돌릴 수 없습니다.")) {
      return;
    }
    setBusy(true);
    try {
      await deleteTestimony(testimony);
      router.push(ROUTES.archive);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article>
      {testimony.status !== "published" && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {testimony.status === "draft"
            ? "비공개 — 나만 볼 수 있는 기록입니다."
            : "관리자에 의해 숨김 처리된 간증입니다."}
        </div>
      )}

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold leading-snug text-ink">
          {testimony.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          <Link
            href={ROUTES.pastorPage(testimony.authorUsername)}
            className="flex items-center gap-1 font-medium text-ink hover:text-accent"
          >
            {testimony.authorName}
            <PastorBadge badge={testimony.authorBadge} />
          </Link>
          {testimony.publishedAt && (
            <time>{formatDate(testimony.publishedAt)}</time>
          )}
          <span className="text-ink-faint">조회 {testimony.viewCount}</span>
        </div>
        {canManage && (
          <div className="mt-4 flex gap-2">
            <Link
              href={ROUTES.testimonyEdit(testimony.id)}
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

      <MarkdownView content={testimony.body} />

      {testimony.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {testimony.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      )}

      {testimony.status === "published" && (
        <>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-line pt-8">
            <CheerButton
              targetType="testimony"
              targetId={testimony.id}
              targetTitle={testimony.title}
              initialCount={testimony.seedCount}
            />
            <BookmarkButton
              targetType="testimony"
              targetId={testimony.id}
              targetTitle={testimony.title}
              targetAuthorName={testimony.authorName}
            />
            <ShareButton
              targetType="testimony"
              targetId={testimony.id}
              targetTitle={testimony.title}
            />
            <ReportButton
              targetType="testimony"
              targetId={testimony.id}
              targetTitle={testimony.title}
            />
          </div>
          <CommentSection targetType="testimony" targetId={testimony.id} />
        </>
      )}
    </article>
  );
}
