"use client";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Field";
import type { SermonInput } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { excerpt } from "@/shared/utils/text";
import type { MigrationFailure } from "../services/migrationService";
import type { DraftRow } from "./MigrationWizard";

interface ReviewStepProps {
  rows: DraftRow[];
  failures: MigrationFailure[];
  publishing: boolean;
  onRowChange: (index: number, input: SermonInput) => void;
  onToggleRow: (index: number) => void;
  onFinish: () => void;
}

/** 3단계: 검토 — 기본은 비공개 보관, 공개할 설교만 직접 선택한다 */
export function ReviewStep({
  rows,
  failures,
  publishing,
  onRowChange,
  onToggleRow,
  onFinish,
}: ReviewStepProps) {
  const publishCount = rows.filter((r) => r.included).length;

  return (
    <div>
      <p className="mb-2 text-sm leading-relaxed text-ink-soft">
        {rows.length}편이 <strong className="text-ink">비공개로 보관</strong>
        되었습니다. 내용을 확인하고, 모두에게 공개할 설교만 선택하세요.
        선택하지 않은 설교는 나만 볼 수 있으며, 내 아카이브에서 언제든 공개할 수
        있습니다.
      </p>

      {failures.length > 0 && (
        <details className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <summary className="cursor-pointer font-medium">
            분석하지 못한 파일 {failures.length}개
          </summary>
          <ul className="mt-2 space-y-1 text-xs">
            {failures.map((f, i) => (
              <li key={i}>
                {f.fileName} — {f.reason}
              </li>
            ))}
          </ul>
        </details>
      )}

      <ul className="space-y-4">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className={cn(
              "rounded-xl border bg-white p-4 transition-colors",
              row.included ? "border-accent" : "border-line",
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="truncate text-xs text-ink-faint">
                {row.sourceFileName}
              </span>
              <label
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  row.included
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-line text-ink-soft hover:border-ink-faint",
                )}
              >
                <input
                  type="checkbox"
                  checked={row.included}
                  onChange={() => onToggleRow(index)}
                  className="size-3.5 accent-accent"
                />
                {row.included ? "공개됨" : "공개하기"}
              </label>
            </div>
            <div className="space-y-3">
              <Input
                value={row.input.title}
                onChange={(e) =>
                  onRowChange(index, { ...row.input, title: e.target.value })
                }
                placeholder="제목"
                aria-label="제목"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={row.input.sermonDate ?? ""}
                  onChange={(e) =>
                    onRowChange(index, {
                      ...row.input,
                      sermonDate: e.target.value || null,
                    })
                  }
                  aria-label="설교 날짜"
                />
                <Input
                  value={row.input.scripture ?? ""}
                  onChange={(e) =>
                    onRowChange(index, {
                      ...row.input,
                      scripture: e.target.value || null,
                    })
                  }
                  placeholder="성경 본문"
                  aria-label="성경 본문"
                />
              </div>
              <p className="text-xs leading-relaxed text-ink-faint">
                {excerpt(row.input.body, 100)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-0 mt-8 border-t border-line bg-paper py-4">
        <Button size="lg" className="w-full" loading={publishing} onClick={onFinish}>
          {publishCount > 0
            ? `${publishCount}편 공개하고 보관 완료`
            : "모두 비공개로 보관 완료"}
        </Button>
        <p className="mt-2 text-center text-xs text-ink-faint">
          공개 {publishCount}편 · 비공개 {rows.length - publishCount}편
        </p>
      </div>
    </div>
  );
}
