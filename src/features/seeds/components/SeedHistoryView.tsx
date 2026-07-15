"use client";

import { useCallback } from "react";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { SEED_REWARD } from "@/shared/constants/seeds";
import { SEED_TRANSACTION_LABEL, type User } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { formatDateShort } from "@/shared/utils/date";
import { fetchSeedTransactions } from "../repositories/seedRepository";

export function SeedHistoryView() {
  return <AuthGate>{(user) => <SeedHistory user={user} />}</AuthGate>;
}

function SeedHistory({ user }: { user: User }) {
  const fetcher = useCallback(
    (cursor: PageCursor) => fetchSeedTransactions(user.uid, cursor),
    [user.uid],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  return (
    <div>
      <div className="mb-8 rounded-xl bg-accent-soft p-6 text-center">
        <p className="text-sm text-accent-strong">내 응원 씨앗</p>
        <p className="mt-1 font-serif text-3xl font-bold text-accent-strong">
          🌱 {user.seedBalance}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-accent-strong/80">
          매일 출석 +{SEED_REWARD.attendance} · 설교 공개 +
          {SEED_REWARD.sermonPublish} · 간증 공개 +
          {SEED_REWARD.testimonyPublish} · 공유 +{SEED_REWARD.share}
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-accent-strong/70">
          기록을 응원하는 데 쓰이며, 환전되지 않습니다.
        </p>
      </div>

      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState onRetry={reload} />}
      {status === "success" && items.length === 0 && (
        <EmptyState title="아직 씨앗 내역이 없습니다" />
      )}
      {status === "success" && items.length > 0 && (
        <ul className="divide-y divide-line">
          {items.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">
                  {tx.memo || SEED_TRANSACTION_LABEL[tx.type]}
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {SEED_TRANSACTION_LABEL[tx.type]} ·{" "}
                  {formatDateShort(tx.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold",
                  tx.amount >= 0 ? "text-accent-strong" : "text-red-700",
                )}
              >
                {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </div>
  );
}
