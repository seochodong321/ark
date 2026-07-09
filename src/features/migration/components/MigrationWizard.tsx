"use client";

import { useState } from "react";
import { AuthGate } from "@/features/auth/components/AuthGate";
import {
  createSermonDrafts,
  parsedToInput,
  publishSermonsBulk,
  updateSermon,
} from "@/features/sermons/repositories/sermonRepository";
import type { MigrationSummary, SermonInput, User } from "@/shared/types";
import { chunk } from "@/shared/utils/array";
import { toUserMessage } from "@/shared/utils/errors";
import {
  computeMigrationSummary,
  expandSelectedFiles,
  parseAllFiles,
  type MigrationFailure,
} from "../services/migrationService";
import { AnalyzeProgress } from "./AnalyzeProgress";
import { DoneStep } from "./DoneStep";
import { ReviewStep } from "./ReviewStep";
import { SelectStep } from "./SelectStep";

export interface DraftRow {
  id: string;
  input: SermonInput;
  sourceFileName: string;
  included: boolean;
  /** 검토 단계에서 수정됨 — 게시 전에 Firestore에 반영 필요 */
  dirty: boolean;
}

type WizardState =
  | { step: "select" }
  | { step: "analyzing"; done: number; total: number }
  | { step: "review"; rows: DraftRow[]; failures: MigrationFailure[] }
  | { step: "publishing"; rows: DraftRow[]; failures: MigrationFailure[] }
  | { step: "done"; summary: MigrationSummary; excludedCount: number };

export function MigrationWizard() {
  return (
    <AuthGate require="pastor">{(user) => <Wizard user={user} />}</AuthGate>
  );
}

function Wizard({ user }: { user: User }) {
  const [state, setState] = useState<WizardState>({ step: "select" });
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (selected: File[]) => {
    setError(null);
    setState({ step: "analyzing", done: 0, total: 0 });
    try {
      const { files, failures: expandFailures } =
        await expandSelectedFiles(selected);
      if (files.length === 0) {
        setError("분석할 수 있는 파일이 없습니다. DOCX·MD·TXT·ZIP 파일을 선택해주세요.");
        setState({ step: "select" });
        return;
      }
      setState({ step: "analyzing", done: 0, total: files.length });
      const { parsed, failures: parseFailures } = await parseAllFiles(
        files,
        (done, total) => setState({ step: "analyzing", done, total }),
      );
      const failures = [...expandFailures, ...parseFailures];
      if (parsed.length === 0) {
        setError("모든 파일 분석에 실패했습니다.");
        setState({ step: "select" });
        return;
      }
      // 분석 즉시 Draft로 저장 — 검토 중 이탈해도 기록은 보존된다
      const inputs = parsed.map(parsedToInput);
      const ids = await createSermonDrafts(user, inputs);
      const rows: DraftRow[] = ids.map((id, i) => ({
        id,
        input: inputs[i],
        sourceFileName: parsed[i].sourceFileName,
        included: true,
        dirty: false,
      }));
      setState({ step: "review", rows, failures });
    } catch (err) {
      setError(toUserMessage(err));
      setState({ step: "select" });
    }
  };

  const handleRowChange = (index: number, input: SermonInput) => {
    if (state.step !== "review") return;
    const rows = state.rows.map((row, i) =>
      i === index ? { ...row, input, dirty: true } : row,
    );
    setState({ ...state, rows });
  };

  const handleToggleRow = (index: number) => {
    if (state.step !== "review") return;
    const rows = state.rows.map((row, i) =>
      i === index ? { ...row, included: !row.included } : row,
    );
    setState({ ...state, rows });
  };

  const handlePublishAll = async () => {
    if (state.step !== "review") return;
    const { rows, failures } = state;
    const included = rows.filter((r) => r.included);
    if (included.length === 0) {
      setError("게시할 설교를 선택해주세요.");
      return;
    }
    setError(null);
    setState({ step: "publishing", rows, failures });
    try {
      // 검토 중 수정된 Draft를 먼저 반영한 뒤 일괄 게시한다
      const dirtyRows = rows.filter((r) => r.dirty);
      for (const group of chunk(dirtyRows, 10)) {
        await Promise.all(
          group.map((row) => updateSermon(row.id, user, row.input)),
        );
      }
      await publishSermonsBulk(
        user.uid,
        included.map((r) => ({ id: r.id, title: r.input.title })),
      );
      setState({
        step: "done",
        summary: computeMigrationSummary(
          included.map((r) => r.input.sermonDate),
        ),
        excludedCount: rows.length - included.length,
      });
    } catch (err) {
      setError(toUserMessage(err));
      setState({ step: "review", rows, failures });
    }
  };

  return (
    <div>
      <StepIndicator step={state.step} />
      {error && (
        <p className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {state.step === "select" && <SelectStep onAnalyze={handleAnalyze} />}
      {state.step === "analyzing" && (
        <AnalyzeProgress done={state.done} total={state.total} />
      )}
      {(state.step === "review" || state.step === "publishing") && (
        <ReviewStep
          rows={state.rows}
          failures={state.failures}
          publishing={state.step === "publishing"}
          onRowChange={handleRowChange}
          onToggleRow={handleToggleRow}
          onPublishAll={handlePublishAll}
        />
      )}
      {state.step === "done" && (
        <DoneStep
          summary={state.summary}
          excludedCount={state.excludedCount}
          username={user.username}
        />
      )}
    </div>
  );
}

const STEP_LABELS: Array<{ key: string; label: string }> = [
  { key: "select", label: "파일 선택" },
  { key: "analyzing", label: "분석" },
  { key: "review", label: "검토" },
  { key: "done", label: "완료" },
];

function stepOrder(step: WizardState["step"]): number {
  if (step === "select") return 0;
  if (step === "analyzing") return 1;
  if (step === "review" || step === "publishing") return 2;
  return 3;
}

function StepIndicator({ step }: { step: WizardState["step"] }) {
  const current = stepOrder(step);
  return (
    <ol className="mb-8 flex items-center gap-2 text-xs">
      {STEP_LABELS.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint">→</span>}
          <span
            className={
              i === current
                ? "rounded-full bg-accent px-3 py-1 font-medium text-white"
                : i < current
                  ? "font-medium text-accent"
                  : "text-ink-faint"
            }
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
