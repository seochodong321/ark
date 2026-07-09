import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { ROUTES } from "@/shared/constants/routes";
import type { Sermon } from "@/shared/types";
import { formatSermonDate } from "@/shared/utils/date";
import { excerpt } from "@/shared/utils/text";

/** 설교 목록 카드 — 텍스트 중심, 읽기 우선 */
export function SermonCard({ sermon }: { sermon: Sermon }) {
  return (
    <article className="border-b border-line py-6 first:pt-0">
      <Link href={ROUTES.sermonDetail(sermon.id)} className="group block">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
          {sermon.scripture && <Badge tone="accent">{sermon.scripture}</Badge>}
          {sermon.series && <Badge>{sermon.series}</Badge>}
          {sermon.sermonDate && (
            <time>{formatSermonDate(sermon.sermonDate)}</time>
          )}
        </div>
        <h3 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-accent">
          {sermon.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {excerpt(sermon.body)}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-faint">
          <span className="font-medium text-ink-soft">{sermon.authorName}</span>
          <span>조회 {sermon.viewCount}</span>
          <span>🌱 {sermon.seedCount}</span>
          {sermon.commentCount > 0 && <span>댓글 {sermon.commentCount}</span>}
          {sermon.youtubeVideoId && <span>▶ 영상</span>}
        </div>
      </Link>
    </article>
  );
}
