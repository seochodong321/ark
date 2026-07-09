import type { ReactNode } from "react";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

/** 목록/상세 화면의 Loading 상태 */
export function LoadingState({ message = "불러오는 중입니다…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-ink-faint">
      <Spinner className="size-6" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/** 목록/상세 화면의 Empty 상태 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-20 text-center">
      <p className="text-base font-medium text-ink-soft">{title}</p>
      {description && <p className="text-sm text-ink-faint">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** 목록/상세 화면의 Error 상태 */
export function ErrorState({
  message = "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
