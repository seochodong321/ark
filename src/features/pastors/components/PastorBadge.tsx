import { AUTHOR_BADGE, type AuthorBadge } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

/**
 * 나무체크 — 인증 배지.
 * 전도사 🌲 / 목사 🌳 / 인증 교회·단체 ⛪ 를 이름 옆에 표시한다.
 */
export function PastorBadge({
  badge,
  className,
}: {
  badge: AuthorBadge | null | undefined;
  className?: string;
}) {
  const meta = badge ? AUTHOR_BADGE[badge] : undefined;
  if (!meta) return null;
  return (
    <span
      title={meta.label}
      aria-label={meta.label}
      role="img"
      className={cn("inline-block align-middle leading-none", className)}
    >
      {meta.emoji}
    </span>
  );
}
