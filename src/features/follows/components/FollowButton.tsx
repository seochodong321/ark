"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { ROUTES } from "@/shared/constants/routes";
import type { User } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import {
  followPastor,
  isFollowing,
  unfollowPastor,
} from "../repositories/followRepository";

interface FollowButtonProps {
  pastor: Pick<User, "uid" | "name" | "username">;
  /** 페이지 로드 시점의 팔로워 수 — 토글 시 화면에서 함께 증감한다 */
  initialFollowerCount: number;
}

export function FollowButton({
  pastor,
  initialFollowerCount,
}: FollowButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(initialFollowerCount);
  const [busy, setBusy] = useState(false);

  const isSelf = user?.uid === pastor.uid;

  useEffect(() => {
    if (!user || user.uid === pastor.uid) return;
    let cancelled = false;
    isFollowing(user.uid, pastor.uid).then((v) => {
      if (!cancelled) setFollowing(v);
    });
    return () => {
      cancelled = true;
    };
  }, [user, pastor.uid]);

  const handleToggle = async () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    if (busy || isSelf) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      if (next) {
        await followPastor(user, pastor);
      } else {
        await unfollowPastor(user.uid, pastor.uid);
      }
    } catch {
      setFollowing(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink-soft">
        팔로워 <strong className="text-ink">{Math.max(count, 0)}</strong>
      </span>
      {!isSelf && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy}
          aria-pressed={following}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-colors disabled:opacity-60",
            following
              ? "border border-line bg-white text-ink-soft hover:border-red-300 hover:text-red-700"
              : "bg-accent text-white hover:bg-accent-strong",
          )}
        >
          {following ? "팔로잉" : "팔로우"}
        </button>
      )}
    </div>
  );
}
