"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Textarea } from "@/shared/components/ui/Field";
import { cn } from "@/shared/utils/cn";

/** 1단계: 여러 설교 파일·ZIP 선택 또는 텍스트 붙여넣기 */
export function SelectStep({
  onAnalyze,
}: {
  onAnalyze: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pasteCountRef = useRef(1);

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

  /** 붙여넣은 텍스트를 .txt 파일로 변환해 파일과 동일한 분석 흐름에 태운다 */
  const addPastedText = () => {
    const text = pasteText.trim();
    if (text.length === 0) return;
    const file = new File([text], `붙여넣기-${pasteCountRef.current}.txt`, {
      type: "text/plain",
    });
    pasteCountRef.current += 1;
    setFiles((prev) => [...prev, file]);
    setPasteText("");
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
          HWP는 아직 지원하지 않습니다. Word에서 DOCX로 저장하거나, 아래
          텍스트 붙여넣기를 이용해주세요.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <button
          type="button"
          onClick={() => setPasteOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">
              파일이 없으신가요? 텍스트 붙여넣기
            </span>
            <span className="mt-0.5 block text-xs text-ink-faint">
              블로그·이메일·한글(HWP)에 있는 설교를 복사해서 붙여넣으세요
            </span>
          </span>
          <span className="text-ink-faint" aria-hidden>
            {pasteOpen ? "▲" : "▼"}
          </span>
        </button>
        {pasteOpen && (
          <div className="mt-4 space-y-3">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              placeholder={
                "설교 전문을 붙여넣으세요.\n\n첫 줄이 제목으로, 본문 속 날짜와 성경 구절이 자동으로 추출됩니다."
              }
              className="font-serif leading-relaxed"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-ink-faint">
                여러 편을 옮기시려면 한 편씩 붙여넣고 추가를 반복하세요.
              </p>
              <Button
                variant="secondary"
                size="sm"
                disabled={pasteText.trim().length === 0}
                onClick={addPastedText}
              >
                목록에 추가
              </Button>
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              선택된 항목 {files.length}개
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
            {files.length}개 항목 분석하기
          </Button>
        </div>
      )}
    </div>
  );
}
