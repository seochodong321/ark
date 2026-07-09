"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";

/** 1단계: 여러 설교 파일 또는 ZIP 선택 */
export function SelectStep({
  onAnalyze,
}: {
  onAnalyze: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const fresh = Array.from(incoming).filter(
        (f) => !existing.has(`${f.name}-${f.size}`),
      );
      return [...prev, ...fresh];
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
          dragging ? "border-accent bg-accent-soft" : "border-line bg-white",
        )}
      >
        <p className="mb-1 text-lg font-semibold text-ink">
          설교 파일을 이곳에 끌어다 놓으세요
        </p>
        <p className="mb-6 text-sm text-ink-soft">
          DOCX · Markdown · TXT · ZIP — 수십 년의 기록도 한 번에
        </p>
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          파일 선택
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".docx,.md,.txt,.zip"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-4 text-xs text-ink-faint">
          HWP는 아직 지원하지 않습니다. Word에서 DOCX로 저장 후 업로드해주세요.
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              선택된 파일 {files.length}개
            </p>
            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
            >
              모두 지우기
            </button>
          </div>
          <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-line bg-white p-3">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-3 text-sm text-ink-soft"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`${file.name} 제거`}
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-ink-faint hover:text-red-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <Button size="lg" className="mt-6 w-full" onClick={() => onAnalyze(files)}>
            {files.length}개 파일 분석하기
          </Button>
        </div>
      )}
    </div>
  );
}
