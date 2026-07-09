import {
  BIBLE_BOOK_ALIASES,
  BIBLE_BOOKS,
} from "@/shared/constants/bibleBooks";

/** 파싱된 성경 참조 — 단일 장 범위만 지원한다 */
export interface ScriptureReference {
  book: string;
  /** 1~66. public/bible/krv/{bookNumber}.json 파일 번호 */
  bookNumber: number;
  chapter: number;
  /** null이면 장 전체 */
  verseStart: number | null;
  verseEnd: number | null;
}

const BOOK_NUMBER = new Map(BIBLE_BOOKS.map((book, i) => [book, i + 1]));

const FULL_NAMES_BY_LENGTH = [...BIBLE_BOOKS].sort(
  (a, b) => b.length - a.length,
);
const ALIASES_BY_LENGTH = Object.keys(BIBLE_BOOK_ALIASES).sort(
  (a, b) => b.length - a.length,
);

function findBook(text: string): { book: string; rest: string } | null {
  for (const book of FULL_NAMES_BY_LENGTH) {
    const idx = text.indexOf(book);
    if (idx >= 0) return { book, rest: text.slice(idx + book.length) };
  }
  for (const alias of ALIASES_BY_LENGTH) {
    const match = text.match(new RegExp(`(^|\\s)${alias}\\s?(?=\\d)`));
    if (match && match.index !== undefined) {
      return {
        book: BIBLE_BOOK_ALIASES[alias],
        rest: text.slice(match.index + match[0].length),
      };
    }
  }
  return null;
}

/**
 * "요한복음 3:16-21", "요 3장 16절", "시편 23편" 등의 표기를 파싱한다.
 * 장을 특정할 수 없으면 null (인용을 렌더링하지 않는다).
 */
export function parseScriptureReference(
  scripture: string | null,
): ScriptureReference | null {
  if (!scripture) return null;
  const found = findBook(scripture.trim());
  if (!found) return null;

  const match = found.rest.match(
    /^\s*(\d{1,3})\s*(?:[:장편]\s*(\d{1,3}))?\s*절?\s*(?:[-~]\s*(\d{1,3}))?\s*절?/,
  );
  if (!match || !match[1]) return null;

  const chapter = Number(match[1]);
  if (chapter < 1) return null;
  const verseStart = match[2] ? Number(match[2]) : null;
  let verseEnd = match[3] ? Number(match[3]) : verseStart;
  if (verseStart !== null && verseEnd !== null && verseEnd < verseStart) {
    verseEnd = verseStart;
  }

  const bookNumber = BOOK_NUMBER.get(found.book);
  if (!bookNumber) return null;

  return { book: found.book, bookNumber, chapter, verseStart, verseEnd };
}

/** 참조를 표준 표기로 (예: 요한복음 3:16-21, 시편 23편, 창세기 1장) */
export function formatReference(ref: ScriptureReference): string {
  if (ref.verseStart === null) {
    const unit = ref.book === "시편" ? "편" : "장";
    return `${ref.book} ${ref.chapter}${unit}`;
  }
  const range =
    ref.verseEnd !== null && ref.verseEnd !== ref.verseStart
      ? `${ref.verseStart}-${ref.verseEnd}`
      : `${ref.verseStart}`;
  return `${ref.book} ${ref.chapter}:${range}`;
}
