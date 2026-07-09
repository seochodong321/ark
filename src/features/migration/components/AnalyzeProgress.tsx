import { Spinner } from "@/shared/components/ui/Spinner";

/** 2단계: 파일 분석 진행 상황 */
export function AnalyzeProgress({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="py-16 text-center">
      <Spinner className="mx-auto size-8 text-accent" />
      <p className="mt-6 font-medium text-ink">
        설교를 분석해 Draft를 만들고 있습니다
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {total > 0 ? `${done} / ${total} 파일` : "파일을 펼치는 중…"}
      </p>
      <div className="mx-auto mt-6 h-2 w-full max-w-sm overflow-hidden rounded-full bg-paper-warm">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
