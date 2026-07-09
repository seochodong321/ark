import { Button } from "./Button";

/** Pagination 기본 UI — 커서 기반 "더 보기" */
export function LoadMore({
  hasMore,
  loading,
  onLoadMore,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center pt-8">
      <Button variant="secondary" loading={loading} onClick={onLoadMore}>
        더 보기
      </Button>
    </div>
  );
}
