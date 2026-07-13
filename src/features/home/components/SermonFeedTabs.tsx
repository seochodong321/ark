"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchFollowedPastorIds } from "@/features/follows/repositories/followRepository";
import { SermonCard } from "@/features/sermons/components/SermonCard";
import {
  fetchMostCheeredSermons,
  fetchPopularSermons,
  fetchPublishedSermons,
  fetchSermonsByAuthors,
} from "@/features/sermons/repositories/sermonRepository";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import type { Sermon } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

export type SermonFeedTab = "following" | "latest" | "cheered" | "popular";

const FEED_SIZE = 8;

const TABS: Array<{ key: SermonFeedTab; label: string }> = [
  { key: "following", label: "팔로잉" },
  { key: "latest", label: "최신순" },
  { key: "cheered", label: "씨앗추천" },
  { key: "popular", label: "조회순" },
];

async function fetchTabSermons(
  tab: SermonFeedTab,
  uid: string | null,
): Promise<Sermon[]> {
  switch (tab) {
    case "following": {
      if (!uid) return [];
      const pastorIds = await fetchFollowedPastorIds(uid);
      return fetchSermonsByAuthors(pastorIds, FEED_SIZE);
    }
    case "latest":
      return (await fetchPublishedSermons(null, FEED_SIZE)).items;
    case "cheered":
      return fetchMostCheeredSermons(FEED_SIZE);
    case "popular":
      return fetchPopularSermons(FEED_SIZE);
  }
}

interface SermonFeedTabsProps {
  uid: string | null;
  initialTab: SermonFeedTab;
  /** 홈 초기 로딩에서 이미 받아온 탭 데이터 — 클릭 시 재요청하지 않는다 */
  preloaded: Partial<Record<SermonFeedTab, Sermon[]>>;
}

/** 홈 설교 피드 — 팔로잉/최신순/씨앗추천/조회순 탭. 탭 데이터는 지연 로딩 후 캐시한다. */
export function SermonFeedTabs({
  uid,
  initialTab,
  preloaded,
}: SermonFeedTabsProps) {
  const [tab, setTab] = useState<SermonFeedTab>(initialTab);
  const [cache, setCache] =
    useState<Partial<Record<SermonFeedTab, Sermon[]>>>(preloaded);
  const [loadingTab, setLoadingTab] = useState<SermonFeedTab | null>(null);
  const [errorTab, setErrorTab] = useState<SermonFeedTab | null>(null);

  const loadTab = (target: SermonFeedTab) => {
    setErrorTab((prev) => (prev === target ? null : prev));
    setLoadingTab(target);
    fetchTabSermons(target, uid)
      .then((items) => setCache((prev) => ({ ...prev, [target]: items })))
      .catch(() => setErrorTab(target))
      .finally(() =>
        setLoadingTab((prev) => (prev === target ? null : prev)),
      );
  };

  const handleTabClick = (next: SermonFeedTab) => {
    setTab(next);
    if (cache[next] === undefined && loadingTab !== next) {
      loadTab(next);
    }
  };

  const items = cache[tab];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <h2 className="font-serif text-xl font-bold text-ink">설교 피드</h2>
        <div className="flex gap-1 rounded-lg bg-paper-warm p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabClick(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm",
                tab === t.key
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-faint hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {errorTab === tab ? (
        <ErrorState onRetry={() => loadTab(tab)} />
      ) : items === undefined || loadingTab === tab ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <FeedEmptyState tab={tab} isLoggedIn={uid !== null} />
      ) : (
        <>
          {items.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} />
          ))}
          <div className="pt-6 text-right">
            <Link
              href={ROUTES.sermons}
              className="text-xs font-medium text-ink-faint transition-colors hover:text-accent"
            >
              설교 전체 보기 →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

function FeedEmptyState({
  tab,
  isLoggedIn,
}: {
  tab: SermonFeedTab;
  isLoggedIn: boolean;
}) {
  if (tab === "following") {
    if (!isLoggedIn) {
      return (
        <EmptyState
          title="로그인하고 목회자를 팔로우해보세요"
          description="팔로우한 목회자의 새 설교가 이곳에 모입니다."
          action={
            <Link
              href={ROUTES.login}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
            >
              로그인
            </Link>
          }
        />
      );
    }
    return (
      <EmptyState
        title="아직 팔로우한 목회자가 없습니다"
        description="설교에서 목회자 이름을 누르고, 페이지에서 팔로우하면 새 설교가 여기에 모입니다."
        action={
          <Link
            href={ROUTES.sermons}
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink hover:border-ink"
          >
            설교 둘러보기
          </Link>
        }
      />
    );
  }
  if (tab === "cheered") {
    return (
      <EmptyState
        title="아직 응원받은 설교가 없습니다"
        description="마음에 남은 설교에 🌱 씨앗으로 응원을 보내보세요."
      />
    );
  }
  return (
    <EmptyState
      title="아직 보관된 설교가 없습니다"
      description="첫 번째 설교를 보관해보세요."
    />
  );
}
