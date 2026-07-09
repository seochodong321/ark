import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { ROUTES } from "@/shared/constants/routes";
import type { Testimony } from "@/shared/types";
import { formatDateShort } from "@/shared/utils/date";
import { excerpt } from "@/shared/utils/text";

export function TestimonyCard({ testimony }: { testimony: Testimony }) {
  return (
    <article className="border-b border-line py-6 first:pt-0">
      <Link
        href={ROUTES.testimonyDetail(testimony.id)}
        className="group block"
      >
        <h3 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-accent">
          {testimony.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {excerpt(testimony.body)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
          <span className="font-medium text-ink-soft">
            {testimony.authorName}
          </span>
          {testimony.publishedAt && (
            <time>{formatDateShort(testimony.publishedAt)}</time>
          )}
          <span>조회 {testimony.viewCount}</span>
          <span>🌱 {testimony.seedCount}</span>
          {testimony.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      </Link>
    </article>
  );
}
