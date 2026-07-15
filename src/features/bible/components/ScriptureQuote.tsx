"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPassage, type BiblePassage } from "../services/bibleService";
import {
  formatReference,
  parseScriptureReference,
} from "../services/scriptureReference";

const COLLAPSED_VERSE_COUNT = 8;

/**
 * 설교의 성경 본문을 자동 인용한다 (개역한글 — 퍼블릭 도메인).
 * 참조를 해석할 수 없거나 본문을 찾지 못하면 아무것도 렌더링하지 않는다.
 */
export function ScriptureQuote({ scripture }: { scripture: string | null }) {
  const reference = useMemo(
    () => parseScriptureReference(scripture),
    [scripture],
  );
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    fetchPassage(reference)
      .then((result) => {
        if (!cancelled) setPassage(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (!reference || !passage) return null;

  const collapsed =
    !expanded && passage.verses.length > COLLAPSED_VERSE_COUNT;
  const visibleVerses = collapsed
    ? passage.verses.slice(0, COLLAPSED_VERSE_COUNT)
    : passage.verses;

  return (
    <figure className="my-8 rounded-2xl border border-accent-soft bg-accent-soft/40 px-6 py-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
          본문 말씀
        </span>
        <span className="text-xs text-ink-soft">
          {formatReference(reference)} · {passage.version}
        </span>
      </figcaption>
      <div className="mt-4 space-y-2.5">
        {visibleVerses.map((verse) => (
          <p
            key={verse.number}
            className="font-serif text-[16.5px] leading-loose text-ink"
          >
            <sup className="mr-1.5 font-sans text-[11px] font-medium text-accent">
              {verse.number}
            </sup>
            {verse.text}
          </p>
        ))}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
        >
          전체 {passage.verses.length}절 읽기
        </button>
      )}
      <p className="mt-4 text-[11px] text-ink-faint">개역한글판(1961)</p>
    </figure>
  );
}
