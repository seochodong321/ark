"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { Button } from "@/shared/components/ui/Button";
import { Textarea } from "@/shared/components/ui/Field";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import type { Comment, ContentType } from "@/shared/types";
import { formatDateShort } from "@/shared/utils/date";
import { toUserMessage } from "@/shared/utils/errors";
import {
  addComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "../repositories/commentRepository";

interface CommentSectionProps {
  targetType: ContentType;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { user } = useAuth();
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchComments(targetType, targetId, cursor),
    [targetType, targetId],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || submitting || body.trim().length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await addComment(user, targetType, targetId, body.trim());
      setBody("");
      reload();
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="mb-4 text-lg font-semibold text-ink">댓글</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="은혜로운 나눔을 남겨주세요"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={submitting}>
              댓글 남기기
            </Button>
          </div>
        </form>
      ) : (
        <p className="mb-8 rounded-lg bg-paper-warm p-4 text-sm text-ink-soft">
          댓글을 남기려면{" "}
          <Link href={ROUTES.login} className="font-medium text-accent underline">
            로그인
          </Link>
          이 필요합니다.
        </p>
      )}

      {status === "loading" && <LoadingState message="댓글을 불러오는 중…" />}
      {status === "error" && <ErrorState onRetry={reload} />}
      {status === "success" && items.length === 0 && (
        <EmptyState title="첫 번째 댓글을 남겨보세요" />
      )}
      {status === "success" && items.length > 0 && (
        <ul className="space-y-6">
          {items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canManage={user?.uid === comment.authorId || user?.role === "admin"}
              onChanged={reload}
            />
          ))}
        </ul>
      )}
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </section>
  );
}

function CommentItem({
  comment,
  canManage,
  onChanged,
}: {
  comment: Comment;
  canManage: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [busy, setBusy] = useState(false);

  const handleUpdate = async () => {
    if (busy || draft.trim().length === 0) return;
    setBusy(true);
    try {
      await updateComment(comment.id, draft.trim());
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy || !window.confirm("댓글을 삭제할까요?")) return;
    setBusy(true);
    try {
      await deleteComment(comment);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li>
      <div className="mb-1.5 flex items-center gap-2 text-xs text-ink-faint">
        <Link
          href={ROUTES.pastorPage(comment.authorUsername)}
          className="font-medium text-ink-soft hover:text-accent"
        >
          {comment.authorName}
          <span className="ml-1 font-normal text-ink-faint">
            @{comment.authorUsername}
          </span>
        </Link>
        <span>·</span>
        <time>{formatDateShort(comment.createdAt)}</time>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button size="sm" loading={busy} onClick={handleUpdate}>
              저장
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setDraft(comment.body);
              }}
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
            {comment.body}
          </p>
          {canManage && (
            <div className="mt-1.5 flex gap-3 text-xs text-ink-faint">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="underline underline-offset-2 hover:text-ink"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="underline underline-offset-2 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
}
