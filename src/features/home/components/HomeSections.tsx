"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCuration } from "@/features/curation/repositories/curationRepository";
import { SermonCard } from "@/features/sermons/components/SermonCard";
import {
  fetchPopularSermons,
  fetchPublishedSermons,
  fetchSermonsByIds,
} from "@/features/sermons/repositories/sermonRepository";
import { TestimonyCard } from "@/features/testimonies/components/TestimonyCard";
import { fetchPublishedTestimonies } from "@/features/testimonies/repositories/testimonyRepository";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import type { Sermon, Testimony } from "@/shared/types";

interface HomeData {
  latestSermons: Sermon[];
  curatedSermons: Sermon[];
  curationHeadline: string;
  latestTestimonies: Testimony[];
  popularSermons: Sermon[];
}

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "ready"; data: HomeData };

async function loadHomeData(): Promise<HomeData> {
  const [latestPage, curation, testimonyPage, popularSermons] =
    await Promise.all([
      fetchPublishedSermons(null, 5),
      fetchCuration(),
      fetchPublishedTestimonies(null, 4),
      fetchPopularSermons(5),
    ]);
  const curatedSermons = curation
    ? await fetchSermonsByIds(curation.sermonIds.slice(0, 5))
    : [];
  return {
    latestSermons: latestPage.items,
    curatedSermons,
    curationHeadline: curation?.headline ?? "",
    latestTestimonies: testimonyPage.items,
    popularSermons,
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
    <div className="grid gap-14 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-14">
        {data.curatedSermons.length > 0 && (
          <HomeSection
            title="추천 설교"
            subtitle={data.curationHeadline || "운영자가 고른 기록"}
            moreHref={ROUTES.sermons}
          >
            {data.curatedSermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </HomeSection>
        )}

        {data.latestSermons.length > 0 && (
          <HomeSection title="최신 설교" moreHref={ROUTES.sermons}>
            {data.latestSermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </HomeSection>
        )}

        {data.latestTestimonies.length > 0 && (
          <HomeSection title="최신 간증" moreHref={ROUTES.testimonies}>
            {data.latestTestimonies.map((testimony) => (
              <TestimonyCard key={testimony.id} testimony={testimony} />
            ))}
          </HomeSection>
        )}
      </div>

      <aside>
        {data.popularSermons.length > 0 && (
          <div className="rounded-xl border border-line bg-white p-6 lg:sticky lg:top-24">
            <h2 className="mb-4 text-sm font-semibold text-ink">
              많이 읽힌 기록
            </h2>
            <ol className="space-y-4">
              {data.popularSermons.map((sermon, i) => (
                <li key={sermon.id}>
                  <Link
                    href={ROUTES.sermonDetail(sermon.id)}
                    className="group flex gap-3"
                  >
                    <span className="font-serif text-lg font-bold text-ink-faint">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink group-hover:text-accent">
                        {sermon.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-faint">
                        {sermon.authorName} · 조회 {sermon.viewCount}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
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
      <div className="mb-2 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
        </div>
        <Link
          href={moreHref}
          className="text-xs text-ink-faint hover:text-accent"
        >
          더 보기 →
        </Link>
      </div>
      {children}
    </section>
  );
}
