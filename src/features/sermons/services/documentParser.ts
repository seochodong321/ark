import {
  BIBLE_BOOKS,
  BIBLE_BOOK_ALIASES,
} from "@/shared/constants/bibleBooks";
import type { ParsedSermon } from "@/shared/types";

/** MVP 지원 파일. HWP는 지원하지 않는다. */
export const SUPPORTED_EXTENSIONS = ["docx", "md", "txt"] as const;

export function fileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isSupportedFile(fileName: string): boolean {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(
    fileExtension(fileName),
  );
}

/** 파일에서 순수 텍스트를 읽는다 */
async function readFileText(file: File): Promise<string> {
  const ext = fileExtension(file.name);
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    return result.value;
  }
  if (ext === "md" || ext === "txt") {
    return file.text();
  }
  throw new Error(
    `지원하지 않는 파일 형식입니다: .${ext} (DOCX, MD, TXT만 지원합니다)`,
  );
}

const DATE_PATTERNS = [
  /(20\d{2}|19\d{2})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})\s*일?/,
  /(20\d{2}|19\d{2})(\d{2})(\d{2})/,
];

/** 텍스트/파일명에서 설교 날짜(YYYY-MM-DD)를 추출한다 */
export function extractDate(text: string): string | null {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) continue;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return null;
}

const scripturePattern = (() => {
  const fullNames = [...BIBLE_BOOKS].sort((a, b) => b.length - a.length);
  const aliases = Object.keys(BIBLE_BOOK_ALIASES).sort(
    (a, b) => b.length - a.length,
  );
  const books = [...fullNames, ...aliases].join("|");
  // 예: 요한복음 3:16-21 / 요 3장 16절 / 시편 23편
  return new RegExp(
    `(${books})\\s?(\\d{1,3})\\s?[:장편]\\s?(\\d{1,3})?(?:\\s?[-~]\\s?(\\d{1,3}))?\\s?절?`,
  );
})();

/** 본문 상단에서 성경 본문 구절을 추출한다 */
export function extractScripture(text: string): string | null {
  const head = text.slice(0, 2000);
  const match = head.match(scripturePattern);
  if (!match) return null;
  return match[0].trim();
}

function cleanTitleCandidate(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^(제목|설교제목|설교)\s*[:：]\s*/, "")
    .trim();
}

/** 파일명에서 확장자·날짜·구분 기호를 제거해 제목 후보를 만든다 */
function titleFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/(20\d{2}|19\d{2})[-._ ]?(\d{1,2})[-._ ]?(\d{1,2})/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(text: string, fileName: string): string {
  const lines = text.split("\n").map((l) => l.trim());
  for (const line of lines.slice(0, 10)) {
    if (line.length === 0) continue;
    const candidate = cleanTitleCandidate(line);
    // 지나치게 길면 본문 문장으로 판단하고 파일명을 사용한다
    if (candidate.length > 0 && candidate.length <= 60) return candidate;
    break;
  }
  return titleFromFileName(fileName) || "제목 없음";
}

/**
 * 설교 텍스트 → Draft 초안 자동 추출.
 * 제목·설교 날짜·성경 본문을 최대한 추출하고, 부족한 부분은 사용자가 수정한다.
 * AI/파서는 사용자의 원문을 임의로 수정하지 않는다 — 본문은 원문 그대로 보존한다.
 * 파일 업로드와 복사·붙여넣기가 동일한 추출 파이프라인을 공유한다.
 */
export function parseSermonText(
  rawText: string,
  sourceName: string,
): ParsedSermon {
  const text = rawText.replace(/\r\n/g, "\n").trim();
  if (text.length === 0) {
    throw new Error(`내용이 비어 있습니다: ${sourceName}`);
  }
  return {
    title: extractTitle(text, sourceName),
    sermonDate: extractDate(text.slice(0, 2000)) ?? extractDate(sourceName),
    scripture: extractScripture(text),
    body: text,
    sourceFileName: sourceName,
  };
}

/** 설교 파일 → Draft 초안 자동 추출 */
export async function parseSermonFile(file: File): Promise<ParsedSermon> {
  return parseSermonText(await readFileText(file), file.name);
}
