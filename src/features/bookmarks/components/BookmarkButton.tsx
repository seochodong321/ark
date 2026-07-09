"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";
import {
  addBookmark,
  isBookmarked,
  removeBookmark,
  type BookmarkTarget,
} from "../repositories/bookmarkRepository";

/** 설교/간증 북마크 토글 */
export function BookmarkButton(target: BookmarkTarget) {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    isBookmarked(user.uid, target.targetType, target.targetId).then((v) => {
      if (!cancelled) setBookmarked(v);
    });
    return () => {
      cancelled = true;
    };
  }, [user, target.targetType, target.targetId]);

  // 로그아웃 상태에서는 항상 비활성으로 표시한다
  const displayBookmarked = user ? bookmarked : false;

  const handleToggle = async () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      if (next) {
        await addBookmark(user.uid, target);
      } else {
        await removeBookmark(user.uid, target.targetType, target.targetId);
      }
    } catch {
      setBookmarked(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      aria-pressed={displayBookmarked}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-60",
        displayBookmarked
          ? "border-accent bg-accent-soft text-accent-strong"
          : "border-line bg-white text-ink-soft hover:border-accent hover:text-accent",
      )}
    >
      <span aria-hidden>{displayBookmarked ? "★" : "☆"}</span>
      {displayBookmarked ? "북마크됨" : "북마크"}
    </button>
  );
}
