import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";
import type { MigrationSummary } from "@/shared/types";
import { formatMinistrySpan, formatSermonDate } from "@/shared/utils/date";

/** 4단계: 완료 — 이전된 사역의 기록을 보여준다 */
export function DoneStep({
  summary,
  excludedCount,
  username,
}: {
  summary: MigrationSummary;
  excludedCount: number;
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
        이제 이 기록은 다음 세대가 다시 찾을 수 있습니다.
      </p>

      <dl className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-4">
        <StatCard label="총 설교 수" value={`${summary.totalCount}편`} />
        <StatCard label="총 사역 기간" value={span || "—"} />
        <StatCard
          label="첫 설교"
          value={formatSermonDate(summary.firstSermonDate) || "—"}
        />
        <StatCard
          label="최신 설교"
          value={formatSermonDate(summary.lastSermonDate) || "—"}
        />
      </dl>

      {excludedCount > 0 && (
        <p className="mt-6 text-xs text-ink-faint">
          게시하지 않은 {excludedCount}편은 내 아카이브에 Draft로 남아 있습니다.
        </p>
      )}

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={ROUTES.pastorPage(username)}
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          내 설교 아카이브 보기
        </Link>
        <Link
          href={ROUTES.archive}
          className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Draft 관리하기
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
