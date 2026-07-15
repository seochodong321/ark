"use client";

import { useEffect, useState } from "react";
import { fetchUserByUsername } from "@/features/auth/repositories/userRepository";
import { FollowButton } from "@/features/follows/components/FollowButton";
import { PastorBadge } from "@/features/pastors/components/PastorBadge";
import { SermonExplorer } from "@/features/sermons/components/SermonExplorer";
import { fetchAuthorSermonStats } from "@/features/sermons/repositories/sermonRepository";
import { AuthorTestimonyList } from "@/features/testimonies/components/AuthorTestimonyList";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { canWriteSermon, type PastorProfile, type User } from "@/shared/types";
import { formatMinistrySpan } from "@/shared/utils/date";
import { fetchPastorProfile } from "../repositories/pastorRepository";

interface SermonStats {
  count: number;
  firstDate: string | null;
  lastDate: string | null;
}

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "notFound" }
  | {
      phase: "ready";
      user: User;
      pastor: PastorProfile | null;
      stats: SermonStats | null;
    };

export function PastorPageView({ username }: { username: string }) {
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await fetchUserByUsername(username);
      if (cancelled) return;
      if (!user) {
        setState({ phase: "notFound" });
        return;
      }
      const isPastor = canWriteSermon(user.role);
      const [pastor, stats] = await Promise.all([
        isPastor ? fetchPastorProfile(user.uid) : Promise.resolve(null),
        isPastor ? fetchAuthorSermonStats(user.uid) : Promise.resolve(null),
      ]);
      if (!cancelled) setState({ phase: "ready", user, pastor, stats });
    })().catch(() => {
      if (!cancelled) setState({ phase: "error" });
    });
    return () => {
      cancelled = true;
    };
  }, [username, reloadToken]);

  const load = () => {
    setState({ phase: "loading" });
    setReloadToken((t) => t + 1);
  };

  if (state.phase === "loading") return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={load} />;
  if (state.phase === "notFound") {
    return <EmptyState title="사용자를 찾을 수 없습니다" />;
  }

  const { user, pastor, stats } = state;
  const isPastor = canWriteSermon(user.role);

  return (
    <div>
      <header className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-5">
            <Avatar name={user.name} photoUrl={user.photoUrl} size="lg" />
            <div className="min-w-0">
              <h1 className="flex items-center gap-1.5 text-2xl font-bold text-ink">
                {user.name}
                {pastor?.status === "approved" && (
                  <PastorBadge category={pastor.positionCategory} />
                )}
              </h1>
              <p className="text-sm text-ink-faint">@{user.username}</p>
              {user.bio && (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
          {isPastor && (
            <FollowButton
              pastor={{
                uid: user.uid,
                name: user.name,
                username: user.username,
              }}
              initialFollowerCount={user.followerCount}
            />
          )}
        </div>

        {pastor && pastor.status === "approved" && (
          <div className="mt-6 rounded-xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink">
              <Badge tone="accent">목회자</Badge>
              <span className="font-medium">{pastor.churchName}</span>
              <span className="text-ink-soft">{pastor.position}</span>
              <span className="text-ink-faint">{pastor.denomination}</span>
            </div>
            {pastor.ministryFields.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pastor.ministryFields.map((field) => (
                  <Badge key={field}>{field}</Badge>
                ))}
              </div>
            )}
            {pastor.introduction && (
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {pastor.introduction}
              </p>
            )}
            <div className="mt-3 flex gap-4 text-xs">
              {pastor.websiteUrl && (
                <a
                  href={pastor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  홈페이지 ↗
                </a>
              )}
              {pastor.youtubeUrl && (
                <a
                  href={pastor.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  유튜브 채널 ↗
                </a>
              )}
            </div>
          </div>
        )}

        {isPastor && stats && (
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-white p-4">
              <dt className="text-xs text-ink-faint">보관된 설교</dt>
              <dd className="mt-0.5 font-serif text-lg font-semibold text-ink">
                {stats.count}편
              </dd>
            </div>
            <div className="rounded-xl border border-line bg-white p-4">
              <dt className="text-xs text-ink-faint">사역 기간</dt>
              <dd className="mt-0.5 font-serif text-lg font-semibold text-ink">
                {formatMinistrySpan(stats.firstDate, stats.lastDate) || "—"}
              </dd>
            </div>
          </dl>
        )}
      </header>

      {isPastor ? (
        <SermonExplorer
          authorId={user.uid}
          firstDate={stats?.firstDate ?? null}
          lastDate={stats?.lastDate ?? null}
        />
      ) : (
        <AuthorTestimonyList authorId={user.uid} />
      )}
    </div>
  );
}
