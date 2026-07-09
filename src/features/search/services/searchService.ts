import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getDb } from "@/shared/firebase/client";
import { COLLECTIONS } from "@/shared/firebase/collections";
import { mapSermon } from "@/features/sermons/repositories/sermonRepository";
import { mapTestimony } from "@/features/testimonies/repositories/testimonyRepository";
import type { Sermon, Testimony } from "@/shared/types";
import { queryTokens } from "./tokenizer";

/**
 * 키워드 검색 (MVP).
 * 제목·본문·작성자·성경 본문·태그를 색인한 searchKeywords 배열에 대해
 * array-contains-any 쿼리 후 클라이언트에서 관련성 순으로 정렬한다.
 *
 * 향후 Full-text Search(Algolia 등) 도입 시 이 서비스의 구현만 교체한다.
 */

const CANDIDATE_LIMIT = 50;

interface Searchable {
  title: string;
  tags: string[];
  authorName: string;
  searchKeywords: string[];
  viewCount: number;
}

/** 관련성 점수: 매칭 토큰 수 > 제목 포함 > 태그/작성자 일치 > 조회수 */
function relevanceScore(item: Searchable, tokens: string[], raw: string): number {
  const keywordSet = new Set(item.searchKeywords);
  let score = 0;
  for (const token of tokens) {
    if (keywordSet.has(token)) score += 2;
  }
  const lowerTitle = item.title.toLowerCase();
  if (lowerTitle.includes(raw)) score += 6;
  for (const token of tokens) {
    if (lowerTitle.includes(token)) score += 2;
    if (item.tags.some((t) => t.toLowerCase() === token)) score += 2;
    if (item.authorName.toLowerCase().includes(token)) score += 2;
  }
  return score;
}

function sortByRelevance<T extends Searchable>(
  items: T[],
  tokens: string[],
  raw: string,
): T[] {
  return items
    .map((item) => ({ item, score: relevanceScore(item, tokens, raw) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || b.item.viewCount - a.item.viewCount,
    )
    .map(({ item }) => item);
}

export async function searchSermons(searchText: string): Promise<Sermon[]> {
  const tokens = queryTokens(searchText);
  if (tokens.length === 0) return [];
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.sermons),
      where("status", "==", "published"),
      where("searchKeywords", "array-contains-any", tokens),
      limit(CANDIDATE_LIMIT),
    ),
  );
  const candidates = snap.docs.map((d) => mapSermon(d.id, d.data()));
  return sortByRelevance(candidates, tokens, searchText.toLowerCase().trim());
}

export async function searchTestimonies(
  searchText: string,
): Promise<Testimony[]> {
  const tokens = queryTokens(searchText);
  if (tokens.length === 0) return [];
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.testimonies),
      where("status", "==", "published"),
      where("searchKeywords", "array-contains-any", tokens),
      limit(CANDIDATE_LIMIT),
    ),
  );
  const candidates = snap.docs.map((d) => mapTestimony(d.id, d.data()));
  return sortByRelevance(candidates, tokens, searchText.toLowerCase().trim());
}

export interface SearchResults {
  sermons: Sermon[];
  testimonies: Testimony[];
}

export async function searchAll(searchText: string): Promise<SearchResults> {
  const [sermons, testimonies] = await Promise.all([
    searchSermons(searchText),
    searchTestimonies(searchText),
  ]);
  return { sermons, testimonies };
}
