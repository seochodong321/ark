"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { BookmarkButton } from "@/features/bookmarks/components/BookmarkButton";
import { CommentSection } from "@/features/comments/components/CommentSection";
import { PastorBadge } from "@/features/pastors/components/PastorBadge";
import { ReportButton } from "@/features/reports/components/ReportButton";
import { CheerButton } from "@/features/seeds/components/CheerButton";
import { ShareButton } from "@/features/seeds/components/ShareButton";
import { Badge } from "@/shared/components/ui/Badge";
import { MarkdownView } from "@/shared/components/ui/MarkdownView";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { formatFileSize } from "@/shared/constants/uploads";
import {
  isAdmin,
  RESOURCE_CATEGORY_LABEL,
  type ResourcePost,
} from "@/shared/types";
import { formatDateShort } from "@/shared/utils/date";
import {
  deleteResource,
  fetchResource,
  incrementResourceDownload,
  incrementResourceView,
} from "../repositories/resourceRepository";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | { phase: "ready"; resource: ResourcePost };

export function ResourceDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const [busy, setBusy] = useState(false);
  const viewCounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchResource(id)
      .then((resource) => {
        if (cancelled) return;
        setState(
          resource ? { phase: "ready", resource } : { phase: "notFound" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  useEffect(() => {
    if (
      state.phase === "ready" &&
      state.resource.status === "published" &&
      !viewCounted.current
    ) {
      viewCounted.current = true;
      incrementResourceView(id).catch(() => undefined);
    }
  }, [state, id]);

  const load = () => {
    setState({ phase: "loading" });
    setReloadToken((t) => t + 1);
  };

  if (state.phase === "loading") return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={load} />;
  if (state.phase === "notFound") {
    return <EmptyState title="자료를 찾을 수 없습니다" />;
  }

  const { resource } = state;
  const canManage = user?.uid === resource.authorId || isAdmin(user?.role);

  if (resource.status !== "published" && !canManage) {
    return <EmptyState title="비공개 처리된 자료입니다" />;
  }

  const handleDelete = async () => {
    if (busy || !window.confirm("자료를 삭제할까요? 첨부 파일도 함께 삭제됩니다.")) {
      return;
    }
    setBusy(true);
    try {
      await deleteResource(resource);
      router.push(ROUTES.resources);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = (index: number) => {
    // 새 탭에서 파일 열기 + 다운로드 수 집계 (실패해도 다운로드는 진행)
    incrementResourceDownload(resource.id).catch(() => undefined);
    window.open(resource.files[index].url, "_blank", "noopener");
  };

  return (
    <article>
      {resource.status === "hidden" && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          관리자에 의해 숨김 처리된 자료입니다.
        </div>
      )}

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="accent">
            {RESOURCE_CATEGORY_LABEL[resource.category]}
          </Badge>
          <span className="text-xs text-ink-faint">
            {formatDateShort(resource.createdAt)} · 조회 {resource.viewCount} ·
            받기 {resource.downloadCount}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold leading-snug text-ink">
          {resource.title}
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          <Link
            href={ROUTES.pastorPage(resource.authorUsername)}
            className="inline-flex items-center gap-1 font-medium text-ink hover:text-accent"
          >
            {resource.authorName}
            <PastorBadge badge={resource.authorBadge} />
          </Link>
        </p>
        {canManage && (
          <div className="mt-4 flex gap-2">
            <Link
              href={ROUTES.resourceEdit(resource.id)}
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

      {/* 첨부 파일 */}
      <div className="mb-8 rounded-2xl border border-accent-soft bg-accent-soft/40 p-5">
        <h2 className="text-sm font-semibold text-accent-strong">
          첨부 파일 {resource.files.length}개
        </h2>
        <ul className="mt-3 space-y-2">
          {resource.files.map((file, i) => (
            <li key={file.storagePath || i}>
              <button
                type="button"
                onClick={() => handleDownload(i)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left text-sm transition-colors hover:border-accent"
              >
                <span className="truncate font-medium text-ink">
                  📎 {file.name}
                </span>
                <span className="shrink-0 text-xs text-ink-faint">
                  {formatFileSize(file.size)} · 받기 ↓
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <MarkdownView content={resource.description} />

      {resource.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      )}

      {resource.status === "published" && (
        <>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-line pt-8">
            <CheerButton
              targetType="resource"
              targetId={resource.id}
              targetTitle={resource.title}
              initialCount={resource.seedCount}
            />
            <BookmarkButton
              targetType="resource"
              targetId={resource.id}
              targetTitle={resource.title}
              targetAuthorName={resource.authorName}
            />
            <ShareButton
              targetType="resource"
              targetId={resource.id}
              targetTitle={resource.title}
            />
            <ReportButton
              targetType="resource"
              targetId={resource.id}
              targetTitle={resource.title}
            />
          </div>
          <CommentSection targetType="resource" targetId={resource.id} />
        </>
      )}
    </article>
  );
}
