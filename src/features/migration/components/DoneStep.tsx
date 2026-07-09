import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";
import type { MigrationSummary } from "@/shared/types";
import { formatMinistrySpan, formatSermonDate } from "@/shared/utils/date";

/** 4단계: 완료 — 이전된 사역의 기록을 보여준다 */
export function DoneStep({
  summary,
  publishedCount,
  privateCount,
  username,
}: {
  summary: MigrationSummary;
  publishedCount: number;
  privateCount: number;
  username: string;
}) {
  const span = formatMinistrySpan(
    summary.firstSermonDate,
    summary.lastSermonDate,
  );

  return (
    <div className="py-8 text-center">
      <p className="text-4xl" aria-hidden>
        ⛵
      </p>
      <h2 className="mt-4 font-serif text-2xl font-bold text-ink">
        설교가 방주에 실렸습니다
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        이제 이 기록은 안전하게 보존됩니다.
      </p>

      <dl className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-4">
        <StatCard label="총 보관" value={`${summary.totalCount}편`} />
        <StatCard
          label="공개 / 비공개"
          value={`${publishedCount}편 / ${privateCount}편`}
        />
        <StatCard
          label="첫 설교"
          value={formatSermonDate(summary.firstSermonDate) || "—"}
        />
        <StatCard
          label="최신 설교"
          value={formatSermonDate(summary.lastSermonDate) || "—"}
        />
      </dl>

      {span && (
        <p className="mt-6 font-serif text-sm text-ink-soft">
          총 사역 기간 <strong className="text-ink">{span}</strong>의 기록입니다.
        </p>
      )}

      {privateCount > 0 && (
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          비공개 설교 {privateCount}편은 나만 볼 수 있습니다.
          <br />내 아카이브에서 언제든 한 편씩 공개할 수 있습니다.
        </p>
      )}

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={ROUTES.archive}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          내 아카이브에서 관리하기
        </Link>
        <Link
          href={ROUTES.pastorPage(username)}
          className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          공개된 내 페이지 보기
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-1 font-serif text-lg font-semibold text-ink">
        {value}
      </dd>
    </div>
  );
}
