import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

/**
 * Firestore 커서 기반 페이지네이션.
 * cursor는 UI 입장에서 불투명(opaque) 토큰이며 내용을 해석하지 않는다.
 */
export type PageCursor = QueryDocumentSnapshot<DocumentData> | null;

export interface Page<T> {
  items: T[];
  cursor: PageCursor;
  hasMore: boolean;
}

export const DEFAULT_PAGE_SIZE = 12;

export function buildPage<T>(
  docs: Array<QueryDocumentSnapshot<DocumentData>>,
  pageSize: number,
  mapDoc: (doc: QueryDocumentSnapshot<DocumentData>) => T,
): Page<T> {
  const hasMore = docs.length > pageSize;
  const visible = hasMore ? docs.slice(0, pageSize) : docs;
  return {
    items: visible.map(mapDoc),
    cursor: visible.length > 0 ? visible[visible.length - 1] : null,
    hasMore,
  };
}
