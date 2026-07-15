import Link from "next/link";
import { PastorBadge } from "@/features/pastors/components/PastorBadge";
import { ROUTES } from "@/shared/constants/routes";
import type { Testimony } from "@/shared/types";
import { formatDateShort } from "@/shared/utils/date";
import { excerpt } from "@/shared/utils/text";

export function TestimonyCard({ testimony }: { testimony: Testimony }) {
  return (
    <article className="group border-b border-line py-7 first:pt-0 last:border-b-0">
      <Link href={ROUTES.testimonyDetail(testimony.id)} className="block">
        <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-faint">
          {testimony.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="font-medium text-accent">
              #{tag}
            </span>
          ))}
          {testimony.publishedAt && (
            <>
              {testimony.tags.length > 0 && <span aria-hidden>·</span>}
              <time>{formatDateShort(testimony.publishedAt)}</time>
            </>
          )}
        </div>
        <h3 className="font-serif text-xl font-bold leading-snug text-ink underline-offset-4 transition-colors group-hover:underline group-hover:decoration-accent/40">
          {testimony.title}
        </h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
          {excerpt(testimony.body)}
        </p>
        <div className="mt-3.5 flex items-center gap-3 text-xs text-ink-faint">
          <span className="flex items-center gap-1 font-medium text-ink-soft">
            {testimony.authorName}
            <PastorBadge badge={testimony.authorBadge} className="text-sm" />
          </span>
          <span>조회 {testimony.viewCount}</span>
          <span>🌱 {testimony.seedCount}</span>
          {testimony.commentCount > 0 && (
            <span>댓글 {testimony.commentCount}</span>
          )}
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
