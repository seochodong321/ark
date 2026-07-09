"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Textarea } from "@/shared/components/ui/Field";
import { sermonCoverPath, uploadImage } from "@/shared/firebase/storage";
import type { SermonInput, User } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { parseTags } from "@/shared/utils/text";
import { extractYouTubeVideoId } from "@/shared/utils/youtube";
import type { ParsedSermon } from "@/shared/types";
import {
  isSupportedFile,
  parseSermonFile,
  parseSermonText,
} from "../services/documentParser";

export type SermonFormAction = "draft" | "publish";

interface SermonFormProps {
  author: User;
  initial?: SermonInput;
  /** 신규 등록 화면에서만 파일 가져오기 노출 */
  showFileImport?: boolean;
  /** 이미 게시된 설교 수정 시 "게시" 대신 "저장"만 노출 */
  publishedMode?: boolean;
  onSave: (input: SermonInput, action: SermonFormAction) => Promise<void>;
}

export function SermonForm({
  author,
  initial,
  showFileImport = false,
  publishedMode = false,
  onSave,
}: SermonFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [sermonDate, setSermonDate] = useState(initial?.sermonDate ?? "");
  const [scripture, setScripture] = useState(initial?.scripture ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tagsRaw, setTagsRaw] = useState(initial?.tags.join(", ") ?? "");
  const [series, setSeries] = useState(initial?.series ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeVideoId ?? "");
  // 새 파일을 올리지 않으면 기존 대표 이미지를 유지한다
  const existingCoverUrl = initial?.coverImageUrl ?? null;
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [parsing, setParsing] = useState(false);
  const [parseNote, setParseNote] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [action, setAction] = useState<SermonFormAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** 파일·붙여넣기 공통 — 추출 결과를 양식에 채운다 */
  const applyParsed = (parsed: ParsedSermon, sourceLabel: string) => {
    setTitle(parsed.title);
    setBody(parsed.body);
    if (parsed.sermonDate) setSermonDate(parsed.sermonDate);
    if (parsed.scripture) setScripture(parsed.scripture);
    const extracted = [
      "제목",
      parsed.sermonDate && "설교 날짜",
      parsed.scripture && "성경 본문",
      "본문",
    ].filter(Boolean);
    setParseNote(
      `${sourceLabel}에서 ${extracted.join("·")}을 자동으로 추출했습니다. 부족한 부분만 수정하세요.`,
    );
  };

  const handleFileImport = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!isSupportedFile(file.name)) {
      setError("DOCX, MD, TXT 파일만 지원합니다. (HWP는 MVP에서 지원하지 않습니다)");
      return;
    }
    setParsing(true);
    try {
      applyParsed(await parseSermonFile(file), file.name);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setParsing(false);
    }
  };

  const handlePasteAnalyze = () => {
    setError(null);
    try {
      applyParsed(parseSermonText(pasteText, "붙여넣은 텍스트"), "붙여넣은 텍스트");
      setPasteText("");
      setPasteOpen(false);
    } catch (err) {
      setError(toUserMessage(err));
    }
  };

  const buildInput = async (): Promise<SermonInput> => {
    const youtubeVideoId = youtubeUrl.trim()
      ? extractYouTubeVideoId(youtubeUrl)
      : null;
    if (youtubeUrl.trim() && !youtubeVideoId) {
      throw new Error("유튜브 링크에서 영상 ID를 찾을 수 없습니다. 링크를 확인해주세요.");
    }
    const uploadedCover = coverFile
      ? await uploadImage(sermonCoverPath(author.uid), coverFile)
      : existingCoverUrl;
    return {
      title: title.trim(),
      sermonDate: sermonDate || null,
      scripture: scripture.trim() || null,
      body: body.trim(),
      tags: parseTags(tagsRaw),
      series: series.trim() || null,
      coverImageUrl: uploadedCover,
      youtubeVideoId,
    };
  };

  const handleSubmit = async (e: FormEvent, submitAction: SermonFormAction) => {
    e.preventDefault();
    if (action) return;
    setError(null);
    setAction(submitAction);
    try {
      await onSave(await buildInput(), submitAction);
    } catch (err) {
      setError(toUserMessage(err));
      setAction(null);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, "draft")} className="space-y-6">
      {showFileImport && (
        <div className="rounded-xl border-2 border-dashed border-line bg-white p-6 text-center">
          <p className="mb-1 font-medium text-ink">설교 불러오기</p>
          <p className="mb-4 text-xs text-ink-faint">
            파일(DOCX · Markdown · TXT) 또는 복사한 텍스트에서 제목, 날짜,
            성경 본문을 자동으로 추출합니다
          </p>
          <div className="flex items-center justify-center gap-3">
            <label className="inline-block cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong">
              {parsing ? "분석 중…" : "파일 선택"}
              <input
                type="file"
                accept=".docx,.md,.txt"
                className="hidden"
                disabled={parsing}
                onChange={(e) => handleFileImport(e.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              onClick={() => setPasteOpen((v) => !v)}
              className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              텍스트 붙여넣기
            </button>
          </div>
          {pasteOpen && (
            <div className="mt-4 space-y-3 text-left">
              <Textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={10}
                placeholder={
                  "설교 전문을 붙여넣으세요.\n\n첫 줄이 제목으로, 본문 속 날짜와 성경 구절이 자동으로 추출됩니다."
                }
                className="font-serif leading-relaxed"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={pasteText.trim().length === 0}
                  onClick={handlePasteAnalyze}
                >
                  자동 추출로 양식 채우기
                </Button>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-ink-faint">
            여러 편을 한 번에 옮기시려면 Migration Wizard를 이용하세요.
          </p>
          {parseNote && (
            <p className="mt-3 rounded-lg bg-accent-soft p-3 text-left text-xs leading-relaxed text-accent-strong">
              {parseNote}
            </p>
          )}
        </div>
      )}

      <Field label="제목" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          placeholder="설교 제목"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="설교 날짜">
          <Input
            type="date"
            value={sermonDate}
            onChange={(e) => setSermonDate(e.target.value)}
          />
        </Field>
        <Field label="성경 본문">
          <Input
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            maxLength={100}
            placeholder="예: 요한복음 3:16-21"
          />
        </Field>
      </div>

      <Field label="설교 본문" required hint="Markdown 문법을 사용할 수 있습니다">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={20}
          placeholder="설교 본문을 입력하세요"
          className="font-serif leading-loose"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="태그" hint="쉼표로 구분, 최대 10개">
          <Input
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="믿음, 소망, 사랑"
          />
        </Field>
        <Field label="시리즈명 (선택)">
          <Input
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            maxLength={50}
            placeholder="예: 로마서 강해"
          />
        </Field>
      </div>

      <Field
        label="유튜브 링크 (선택)"
        hint="영상은 텍스트를 보완하는 역할입니다"
      >
        <Input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
      </Field>

      <Field label="대표 이미지 (선택)">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          loading={action === "draft"}
          disabled={action !== null && action !== "draft"}
        >
          {publishedMode ? "저장하기" : "비공개로 저장"}
        </Button>
        {!publishedMode && (
          <Button
            type="button"
            size="lg"
            loading={action === "publish"}
            disabled={action !== null && action !== "publish"}
            onClick={(e) => handleSubmit(e, "publish")}
          >
            공개하기
          </Button>
        )}
      </div>
    </form>
  );
}
