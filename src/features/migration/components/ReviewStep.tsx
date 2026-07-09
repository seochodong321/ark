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
  onPublishAll: () => void;
}

/** 3단계: Draft 검토 — 부족한 부분만 고치고 한 번에 게시 */
export function ReviewStep({
  rows,
  failures,
  publishing,
  onRowChange,
  onToggleRow,
  onPublishAll,
}: ReviewStepProps) {
  const includedCount = rows.filter((r) => r.included).length;

  return (
    <div>
      <p className="mb-2 text-sm leading-relaxed text-ink-soft">
        {rows.length}개의 Draft가 만들어졌습니다. 제목·날짜·성경 본문을 확인하고
        한 번에 게시하세요. 체크를 해제한 설교는 게시되지 않고 Draft로 남습니다.
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
              "rounded-xl border bg-white p-4 transition-opacity",
              row.included ? "border-line" : "border-line opacity-50",
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-ink-faint">
                <input
                  type="checkbox"
                  checked={row.included}
                  onChange={() => onToggleRow(index)}
                  className="size-4 accent-accent"
                />
                {row.sourceFileName}
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
        <Button
          size="lg"
          className="w-full"
          loading={publishing}
          onClick={onPublishAll}
        >
          {includedCount}개 설교 한 번에 게시하기
        </Button>
      </div>
    </div>
  );
}
