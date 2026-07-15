import { PASTOR_BADGE, type PositionCategory } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

/**
 * 나무체크 — 인증 목회자 배지.
 * 전도사(🌲 일반 나무) / 목사(🌳 열매 맺은 나무)를 이름 옆에 표시한다.
 */
export function PastorBadge({
  category,
  className,
}: {
  category: PositionCategory | null | undefined;
  className?: string;
}) {
  const badge = category ? PASTOR_BADGE[category] : undefined;
  if (!badge) return null;
  return (
    <span
      title={badge.label}
      aria-label={badge.label}
      role="img"
      className={cn("inline-block align-middle leading-none", className)}
    >
      {badge.emoji}
    </span>
  );
}
