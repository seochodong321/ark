"use client";

import { useEffect, useState } from "react";
import { fetchCuration, saveCuration } from "@/features/curation/repositories/curationRepository";
import {
  fetchPublishedSermons,
  fetchSermonsByIds,
} from "@/features/sermons/repositories/sermonRepository";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input } from "@/shared/components/ui/Field";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import type { Sermon } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";

type ViewState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "ready" };

/** 홈 화면 추천 설교 큐레이션 */
export function AdminCurationView() {
  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const [curated, setCurated] = useState<Sermon[]>([]);
  const [headline, setHeadline] = useState("");
  const [candidates, setCandidates] = useState<Sermon[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [curation, latestPage] = await Promise.all([
        fetchCuration(),
        fetchPublishedSermons(null, 20),
      ]);
      const curatedSermons = curation
        ? await fetchSermonsByIds(curation.sermonIds)
        : [];
      if (cancelled) return;
      if (curation) {
        setHeadline(curation.headline);
        setCurated(curatedSermons);
      }
      setCandidates(latestPage.items);
      setState({ phase: "ready" });
    })().catch(() => {
      if (!cancelled) setState({ phase: "error" });
    });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const load = () => {
    setState({ phase: "loading" });
    setReloadToken((t) => t + 1);
  };

  if (state.phase === "loading") return <LoadingState />;
  if (state.phase === "error") return <ErrorState onRetry={load} />;

  const curatedIds = new Set(curated.map((s) => s.id));

  const move = (index: number, delta: -1 | 1) => {
    const next = [...curated];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCurated(next);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveCuration(
        curated.map((s) => s.id),
        headline.trim(),
      );
      setMessage("큐레이션을 저장했습니다.");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Field label="큐레이션 문구" hint="추천 설교 섹션 아래에 표시됩니다">
        <Input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          maxLength={60}
          placeholder="예: 이 계절에 다시 읽는 말씀"
        />
      </Field>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink">
          추천 설교 ({curated.length}편, 최대 5편 노출)
        </h2>
        {curated.length === 0 ? (
          <EmptyState title="아래 목록에서 추천 설교를 추가하세요" />
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-white px-4">
            {curated.map((sermon, i) => (
              <li key={sermon.id} className="flex items-center gap-3 py-3">
                <span className="w-5 text-center font-serif text-sm font-bold text-ink-faint">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {sermon.title}
                  </p>
                  <p className="text-xs text-ink-faint">{sermon.authorName}</p>
                </div>
                <div className="flex shrink-0 gap-1 text-xs">
                  <IconButton label="위로" onClick={() => move(i, -1)}>
                    ↑
                  </IconButton>
                  <IconButton label="아래로" onClick={() => move(i, 1)}>
                    ↓
                  </IconButton>
                  <IconButton
                    label="제거"
                    onClick={() =>
                      setCurated((prev) => prev.filter((s) => s.id !== sermon.id))
                    }
                  >
                    ✕
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink">최신 게시 설교</h2>
        <ul className="divide-y divide-line rounded-xl border border-line bg-white px-4">
          {candidates.map((sermon) => (
            <li key={sermon.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {sermon.title}
                </p>
                <p className="text-xs text-ink-faint">{sermon.authorName}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={curatedIds.has(sermon.id)}
                onClick={() => setCurated((prev) => [...prev, sermon])}
              >
                {curatedIds.has(sermon.id) ? "추가됨" : "추가"}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {message && <p className="text-sm text-accent-strong">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="border-t border-line pt-6">
        <Button size="lg" loading={saving} onClick={handleSave}>
          큐레이션 저장
        </Button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded border border-line px-2 py-1 text-ink-soft hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}
