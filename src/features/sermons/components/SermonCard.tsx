import Link from "next/link";
import { PastorBadge } from "@/features/pastors/components/PastorBadge";
import { ROUTES } from "@/shared/constants/routes";
import type { Sermon } from "@/shared/types";
import { formatSermonDate } from "@/shared/utils/date";
import { excerpt } from "@/shared/utils/text";

/** 설교 목록 카드 — 텍스트 중심, 읽기 우선 */
export function SermonCard({ sermon }: { sermon: Sermon }) {
  return (
    <article className="group border-b border-line py-7 first:pt-0 last:border-b-0">
      <Link href={ROUTES.sermonDetail(sermon.id)} className="block">
        <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-faint">
          {sermon.scripture && (
            <span className="font-medium text-accent">{sermon.scripture}</span>
          )}
          {sermon.series && (
            <>
              <span aria-hidden>·</span>
              <span>{sermon.series}</span>
            </>
          )}
          {sermon.sermonDate && (
            <>
              <span aria-hidden>·</span>
              <time>{formatSermonDate(sermon.sermonDate)}</time>
            </>
          )}
        </div>
        <h3 className="font-serif text-xl font-bold leading-snug text-ink underline-offset-4 transition-colors group-hover:underline group-hover:decoration-accent/40">
          {sermon.title}
        </h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
          {excerpt(sermon.body)}
        </p>
        <div className="mt-3.5 flex items-center gap-3 text-xs text-ink-faint">
          <span className="flex items-center gap-1 font-medium text-ink-soft">
            {sermon.authorName}
            <PastorBadge badge={sermon.authorBadge} className="text-sm" />
          </span>
          <span>조회 {sermon.viewCount}</span>
          <span>🌱 {sermon.seedCount}</span>
          {sermon.commentCount > 0 && <span>댓글 {sermon.commentCount}</span>}
          {sermon.youtubeVideoId && <span>▶ 영상</span>}
          <span
            aria-hidden
            className="ml-auto translate-x-0 text-accent opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
          >
            읽기 →
          </span>
        </div>
      </Link>
    </article>
  );
}
