import type { ScriptureReference } from "./scriptureReference";

/**
 * 성경 본문 로더 — 개역한글판.
 *
 * 저작권: 개역한글판(1961)은 대한민국 저작권법상 보호기간(발행 후 50년)이
 * 만료되어 퍼블릭 도메인이다. (개역개정판은 대한성서공회 저작권이 유효하므로
 * 사용하지 않는다.) 데이터 출처: The Unbound Bible (Biola University) 공개
 * 배포본 → 책별 정적 JSON으로 변환해 서비스에 내장. 외부 API에 의존하지
 * 않으므로 10년 뒤에도 동일하게 동작한다.
 */

interface BibleBookData {
  book: string;
  version: string;
  chapters: string[][];
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BiblePassage {
  book: string;
  version: string;
  verses: BibleVerse[];
}

const bookCache = new Map<number, Promise<BibleBookData>>();

function loadBook(bookNumber: number): Promise<BibleBookData> {
  const cached = bookCache.get(bookNumber);
  if (cached) return cached;
  const promise = fetch(`/bible/krv/${bookNumber}.json`)
    .then((res) => {
      if (!res.ok) throw new Error("성경 본문을 불러올 수 없습니다.");
      return res.json() as Promise<BibleBookData>;
    })
    .catch((error) => {
      bookCache.delete(bookNumber);
      throw error;
    });
  bookCache.set(bookNumber, promise);
  return promise;
}

/** 참조 범위의 본문을 가져온다. 범위가 유효하지 않으면 null */
export async function fetchPassage(
  ref: ScriptureReference,
): Promise<BiblePassage | null> {
  const data = await loadBook(ref.bookNumber);
  const chapter = data.chapters[ref.chapter - 1];
  if (!chapter || chapter.length === 0) return null;

  const start = ref.verseStart ?? 1;
  const end = Math.min(ref.verseEnd ?? chapter.length, chapter.length);
  if (start < 1 || start > chapter.length) return null;

  const verses: BibleVerse[] = [];
  for (let v = start; v <= end; v += 1) {
    const text = chapter[v - 1];
    if (text) verses.push({ number: v, text });
  }
  return verses.length > 0
    ? { book: data.book, version: data.version, verses }
    : null;
}
