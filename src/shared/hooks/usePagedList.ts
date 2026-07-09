"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Page, PageCursor } from "@/shared/firebase/pagination";

type ListStatus = "loading" | "error" | "success";

/**
 * 커서 기반 페이지네이션 목록 훅.
 * fetcher는 반드시 useCallback으로 메모이즈해서 전달한다 —
 * fetcher 참조가 바뀌면 목록을 처음부터 다시 불러온다.
 */
export function usePagedList<T>(
  fetcher: (cursor: PageCursor) => Promise<Page<T>>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const cursorRef = useRef<PageCursor>(null);
  const requestIdRef = useRef(0);

  // fetcher(필터)가 바뀌면 렌더 중에 로딩 상태로 재조정한다
  const [activeFetcher, setActiveFetcher] = useState(() => fetcher);
  if (activeFetcher !== fetcher) {
    setActiveFetcher(() => fetcher);
    setItems([]);
    setStatus("loading");
    setHasMore(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    cursorRef.current = null;
    activeFetcher(null)
      .then((page) => {
        if (requestId !== requestIdRef.current) return;
        cursorRef.current = page.cursor;
        setItems(page.items);
        setHasMore(page.hasMore);
        setStatus("success");
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setStatus("error");
      });
  }, [activeFetcher, reloadToken]);

  const reload = useCallback(() => {
    setItems([]);
    setStatus("loading");
    setHasMore(false);
    setLoadingMore(false);
    setReloadToken((token) => token + 1);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    activeFetcher(cursorRef.current)
      .then((page) => {
        if (requestId !== requestIdRef.current) return;
        cursorRef.current = page.cursor;
        setItems((prev) => [...prev, ...page.items]);
        setHasMore(page.hasMore);
      })
      .catch(() => undefined)
      .finally(() => {
        if (requestId === requestIdRef.current) setLoadingMore(false);
      });
  }, [activeFetcher, hasMore, loadingMore]);

  return { items, status, hasMore, loadingMore, loadMore, reload };
}
