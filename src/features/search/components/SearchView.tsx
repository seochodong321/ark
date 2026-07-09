"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SermonCard } from "@/features/sermons/components/SermonCard";
import { TestimonyCard } from "@/features/testimonies/components/TestimonyCard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";
import {
  searchAll,
  type SearchResults,
} from "../services/searchService";

type SearchTab = "all" | "sermon" | "testimony";

type ViewState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "ready"; results: SearchResults };

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";

  const [input, setInput] = useState(q);
  const [tab, setTab] = useState<SearchTab>("all");
  const [state, setState] = useState<ViewState>(() =>
    q.length > 0 ? { phase: "loading" } : { phase: "idle" },
  );

  // URL 검색어가 바뀌면 렌더 중에 입력값/상태를 재조정한다
  const [activeQ, setActiveQ] = useState(q);
  if (activeQ !== q) {
    setActiveQ(q);
    setInput(q);
    setState(q.length > 0 ? { phase: "loading" } : { phase: "idle" });
  }

  useEffect(() => {
    if (q.length === 0) return;
    let cancelled = false;
    searchAll(q)
      .then((results) => {
        if (!cancelled) setState({ phase: "ready", results });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    router.push(`${ROUTES.search}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="제목, 본문, 작성자, 성경 본문, 태그로 검색"
            aria-label="검색어"
            className="w-full rounded-xl border border-line bg-white px-5 py-3.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            검색
          </button>
        </div>
      </form>

      {state.phase === "idle" && (
        <EmptyState
          title="말씀과 간증을 찾아보세요"
          description="예: 로마서, 감사, 목사님 성함"
        />
      )}
      {state.phase === "loading" && <LoadingState message="검색 중…" />}
      {state.phase === "error" && <ErrorState />}
      {state.phase === "ready" && (
        <SearchResultsView results={state.results} tab={tab} onTabChange={setTab} />
      )}
    </div>
  );
}

function SearchResultsView({
  results,
  tab,
  onTabChange,
}: {
  results: SearchResults;
  tab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
}) {
  const total = results.sermons.length + results.testimonies.length;
  if (total === 0) {
    return (
      <EmptyState
        title="검색 결과가 없습니다"
        description="다른 키워드로 다시 검색해보세요."
      />
    );
  }

  const showSermons = tab !== "testimony" && results.sermons.length > 0;
  const showTestimonies = tab !== "sermon" && results.testimonies.length > 0;

  const tabs: Array<{ key: SearchTab; label: string }> = [
    { key: "all", label: `전체 ${total}` },
    { key: "sermon", label: `설교 ${results.sermons.length}` },
    { key: "testimony", label: `간증 ${results.testimonies.length}` },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg bg-paper-warm p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange(t.key)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-white text-ink shadow-sm"
                : "text-ink-faint hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showSermons && (
        <section className="mb-8">
          {tab === "all" && (
            <h2 className="mb-2 text-sm font-semibold text-ink-faint">설교</h2>
          )}
          {results.sermons.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} />
          ))}
        </section>
      )}
      {showTestimonies && (
        <section>
          {tab === "all" && (
            <h2 className="mb-2 text-sm font-semibold text-ink-faint">간증</h2>
          )}
          {results.testimonies.map((testimony) => (
            <TestimonyCard key={testimony.id} testimony={testimony} />
          ))}
        </section>
      )}
    </div>
  );
}
