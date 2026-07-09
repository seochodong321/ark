"use client";

import { useCallback, useState } from "react";
import { Input, Select } from "@/shared/components/ui/Field";
import { LoadMore } from "@/shared/components/ui/LoadMore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { BIBLE_BOOKS } from "@/shared/constants/bibleBooks";
import type { PageCursor } from "@/shared/firebase/pagination";
import { usePagedList } from "@/shared/hooks/usePagedList";
import {
  fetchSermonsByAuthor,
  type SermonSort,
} from "../repositories/sermonRepository";
import { SermonCard } from "./SermonCard";

interface SermonExplorerProps {
  authorId: string;
  firstDate: string | null;
  lastDate: string | null;
}

function yearOptions(
  firstDate: string | null,
  lastDate: string | null,
): number[] {
  if (!firstDate || !lastDate) return [];
  const first = Number(firstDate.slice(0, 4));
  const last = Number(lastDate.slice(0, 4));
  if (!first || !last || first > last) return [];
  const years: number[] = [];
  for (let y = last; y >= first; y -= 1) years.push(y);
  return years;
}

/** 목회자 페이지 설교 탐색 — 최신순/오래된순/연도별/성경본문별/태그별 */
export function SermonExplorer({
  authorId,
  firstDate,
  lastDate,
}: SermonExplorerProps) {
  const [sort, setSort] = useState<SermonSort>("latest");
  const [year, setYear] = useState<number | null>(null);
  const [book, setBook] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const fetcher = useCallback(
    (cursor: PageCursor) =>
      fetchSermonsByAuthor(
        {
          authorId,
          sort,
          year: year ?? undefined,
          scriptureBook: book ?? undefined,
          tag: tag ?? undefined,
        },
        cursor,
      ),
    [authorId, sort, year, book, tag],
  );
  const { items, status, hasMore, loadingMore, loadMore, reload } =
    usePagedList(fetcher);

  const years = yearOptions(firstDate, lastDate);
  const hasFilter = year !== null || book !== null || tag !== null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-ink">설교</h2>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SermonSort)}
          aria-label="정렬"
          className="w-auto py-2 text-sm"
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </Select>

        {years.length > 0 && (
          <Select
            value={year ?? ""}
            onChange={(e) =>
              setYear(e.target.value ? Number(e.target.value) : null)
            }
            aria-label="연도별"
            className="w-auto py-2 text-sm"
          >
            <option value="">모든 연도</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </Select>
        )}

        <Select
          value={book ?? ""}
          onChange={(e) => setBook(e.target.value || null)}
          aria-label="성경본문별"
          className="w-auto py-2 text-sm"
        >
          <option value="">모든 성경</option>
          {BIBLE_BOOKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTag(tagDraft.trim() || null);
          }}
        >
          <Input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            placeholder="태그로 찾기 (Enter)"
            aria-label="태그별"
            className="w-40 py-2 text-sm"
          />
        </form>

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setYear(null);
              setBook(null);
              setTag(null);
              setTagDraft("");
            }}
            className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
          >
            필터 초기화
          </button>
        )}
      </div>

      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState onRetry={reload} />}
      {status === "success" && items.length === 0 && (
        <EmptyState
          title={
            hasFilter
              ? "조건에 맞는 설교가 없습니다"
              : "아직 보관된 설교가 없습니다"
          }
        />
      )}
      {status === "success" &&
        items.map((sermon) => <SermonCard key={sermon.id} sermon={sermon} />)}
      <LoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
    </section>
  );
}
