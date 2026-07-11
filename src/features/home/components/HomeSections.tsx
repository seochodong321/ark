"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCuration } from "@/features/curation/repositories/curationRepository";
import { SermonCard } from "@/features/sermons/components/SermonCard";
import {
  fetchMostCheeredSermons,
  fetchPopularSermons,
  fetchPublishedSermons,
  fetchSermonsByIds,
} from "@/features/sermons/repositories/sermonRepository";
import { TestimonyCard } from "@/features/testimonies/components/TestimonyCard";
import {
  fetchMostCheeredTestimonies,
  fetchPublishedTestimonies,
} from "@/features/testimonies/repositories/testimonyRepository";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import type { Sermon, Testimony } from "@/shared/types";

/** 응원받은 기록 — 설교·간증 통합 목록 항목 */
interface CheeredItem {
  id: string;
  title: string;
  authorName: string;
  seedCount: number;
  href: string;
}

interface HomeData {
  latestSermons: Sermon[];
  curatedSermons: Sermon[];
  curationHeadline: string;
  latestTestimonies: Testimony[];
  popularSermons: Sermon[];
  cheeredItems: CheeredItem[];
}

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "ready"; data: HomeData };

async function loadHomeData(): Promise<HomeData> {
  const [
    latestPage,
    curation,
    testimonyPage,
    popularSermons,
    cheeredSermons,
    cheeredTestimonies,
  ] = await Promise.all([
    fetchPublishedSermons(null, 5),
    fetchCuration(),
    fetchPublishedTestimonies(null, 4),
    fetchPopularSermons(5),
    fetchMostCheeredSermons(5),
    fetchMostCheeredTestimonies(5),
  ]);
  const curatedSermons = curation
    ? await fetchSermonsByIds(curation.sermonIds.slice(0, 5))
    : [];
  // 설교·간증을 응원 수 기준으로 통합해 상위 5개만 추천한다
  const cheeredItems: CheeredItem[] = [
    ...cheeredSermons.map((s) => ({
      id: s.id,
      title: s.title,
      authorName: s.authorName,
      seedCount: s.seedCount,
      href: ROUTES.sermonDetail(s.id),
    })),
    ...cheeredTestimonies.map((t) => ({
      id: t.id,
      title: t.title,
      authorName: t.authorName,
      seedCount: t.seedCount,
      href: ROUTES.testimonyDetail(t.id),
    })),
  ]
    .sort((a, b) => b.seedCount - a.seedCount)
    .slice(0, 5);
  return {
    latestSermons: latestPage.items,
    curatedSermons,
    curationHeadline: curation?.headline ?? "",
    latestTestimonies: testimonyPage.items,
    popularSermons,
    cheeredItems,
  };
}

export function HomeSections() {
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadHomeData()
      .then((data) => {
        if (!cancelled) setState({ phase: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const load = () => {
    setState({ phase: "loading" });
    setReloadToken((t) => t + 1);
  };

  if (state.phase === "loading") return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={load} />;

  const { data } = state;
  const isEmpty =
    data.latestSermons.length === 0 &&
    data.curatedSermons.length === 0 &&
    data.latestTestimonies.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        title="방주가 아직 비어 있습니다"
        description="첫 번째 설교를 보관하고 아카이브를 시작해보세요."
        action={
          <Link
            href={ROUTES.migration}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            설교 보관하기
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-16">
        {data.curatedSermons.length > 0 && (
          <HomeSection
            title="이번 주의 추천"
            subtitle={data.curationHeadline || "다시 꺼내 읽고 싶은 기록"}
            moreHref={ROUTES.sermons}
          >
            {data.curatedSermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </HomeSection>
        )}

        {data.latestSermons.length > 0 && (
          <HomeSection title="새로 올라온 설교" moreHref={ROUTES.sermons}>
            {data.latestSermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </HomeSection>
        )}

        {data.latestTestimonies.length > 0 && (
          <HomeSection title="새로 올라온 간증" moreHref={ROUTES.testimonies}>
            {data.latestTestimonies.map((testimony) => (
              <TestimonyCard key={testimony.id} testimony={testimony} />
            ))}
          </HomeSection>
        )}
      </div>

      <aside>
        <div className="space-y-10 lg:sticky lg:top-24">
          {data.cheeredItems.length > 0 && (
            <RankedList
              title="성도들이 응원한 기록"
              items={data.cheeredItems.map((item) => ({
                key: item.id,
                href: item.href,
                title: item.title,
                meta: `${item.authorName} · 🌱 ${item.seedCount}`,
              }))}
            />
          )}
          {data.popularSermons.length > 0 && (
            <RankedList
              title="많이 읽힌 기록"
              items={data.popularSermons.map((sermon) => ({
                key: sermon.id,
                href: ROUTES.sermonDetail(sermon.id),
                title: sermon.title,
                meta: `${sermon.authorName} · 조회 ${sermon.viewCount}`,
              }))}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function RankedList({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; href: string; title: string; meta: string }>;
}) {
  return (
    <div>
      <h2 className="border-b-2 border-ink pb-3 font-serif text-base font-bold text-ink">
        {title}
      </h2>
      <ol className="divide-y divide-line">
        {items.map((item, i) => (
          <li key={item.key}>
            <Link href={item.href} className="group flex gap-4 py-4">
              <span className="font-serif text-lg font-bold leading-none text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs text-ink-faint">
                  {item.meta}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HomeSection({
  title,
  subtitle,
  moreHref,
  children,
}: {
  title: string;
  subtitle?: string;
  moreHref: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between border-b-2 border-ink pb-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-ink">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>
          )}
        </div>
        <Link
          href={moreHref}
          className="shrink-0 text-xs font-medium text-ink-faint transition-colors hover:text-accent"
        >
          더 보기 →
        </Link>
      </div>
      {children}
    </section>
  );
}
