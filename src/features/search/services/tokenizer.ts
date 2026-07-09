/**
 * 검색 토크나이저.
 * Firestore array-contains-any 기반 키워드 검색을 위해
 * 문서 저장 시 검색 키워드 배열을 생성한다.
 *
 * 한계: 형태소 분석 없는 토큰/접두사 매칭.
 * 향후 Algolia·Meilisearch 등 Full-text Search로 교체 시
 * 이 파일과 searchService만 수정하면 된다.
 */

const MAX_KEYWORDS = 300;
const MAX_BODY_TOKENS = 150;
const MAX_PREFIX_LENGTH = 8;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s:]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && token.length <= 30);
}

/** 토큰의 접두사(2자~8자)를 생성해 부분 일치를 지원한다 */
function prefixesOf(token: string): string[] {
  const result: string[] = [token];
  const max = Math.min(token.length - 1, MAX_PREFIX_LENGTH);
  for (let len = 2; len <= max; len += 1) {
    result.push(token.slice(0, len));
  }
  return result;
}

interface KeywordSource {
  /** 제목·작성자·성경본문·태그 등 — 접두사까지 색인 */
  weighted: Array<string | null>;
  /** 본문 — 전체 토큰만 색인 */
  body?: string;
}

export function buildSearchKeywords(source: KeywordSource): string[] {
  const keywords = new Set<string>();

  for (const field of source.weighted) {
    if (!field) continue;
    for (const token of tokenize(field)) {
      for (const prefix of prefixesOf(token)) {
        keywords.add(prefix);
      }
    }
  }

  if (source.body) {
    const bodyTokens = tokenize(source.body).filter((t) => t.length >= 2);
    for (const token of bodyTokens.slice(0, MAX_BODY_TOKENS)) {
      keywords.add(token);
    }
  }

  return Array.from(keywords).slice(0, MAX_KEYWORDS);
}

/** 검색어 → 쿼리 토큰 (array-contains-any 제한에 맞춰 최대 10개) */
export function queryTokens(searchText: string): string[] {
  return tokenize(searchText).slice(0, 10);
}
