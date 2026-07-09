"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input } from "@/shared/components/ui/Field";
import { MarkdownView } from "@/shared/components/ui/MarkdownView";
import { ROUTES } from "@/shared/constants/routes";
import type { Testimony, TestimonyInput, User } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { toUserMessage } from "@/shared/utils/errors";
import { parseTags } from "@/shared/utils/text";
import {
  createTestimonyDraft,
  publishTestimony,
  updateTestimony,
} from "../repositories/testimonyRepository";

const AUTOSAVE_DELAY_MS = 2500;

type SaveState = "idle" | "saving" | "saved" | "error";

interface TestimonyEditorProps {
  author: User;
  /** 수정 모드일 때 기존 간증 */
  existing?: Testimony;
}

/** 간증 Markdown 에디터 — Draft 자동 저장 지원 */
export function TestimonyEditor({ author, existing }: TestimonyEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [tagsRaw, setTagsRaw] = useState(existing?.tags.join(", ") ?? "");
  const [preview, setPreview] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const draftIdRef = useRef<string | null>(existing?.id ?? null);
  const savingRef = useRef(false);
  const isPublished = existing?.status === "published";

  const currentInput = (): TestimonyInput => ({
    title: title.trim(),
    body: body.trim(),
    tags: parseTags(tagsRaw),
  });

  const save = async (): Promise<string> => {
    const input = currentInput();
    if (draftIdRef.current) {
      await updateTestimony(draftIdRef.current, author, input);
    } else {
      draftIdRef.current = await createTestimonyDraft(author, input);
    }
    return draftIdRef.current;
  };

  // Draft 자동 저장 — 게시된 글은 명시적 저장만 허용한다
  useEffect(() => {
    if (isPublished) return;
    if (title.trim().length === 0 && body.trim().length === 0) return;
    const timer = setTimeout(async () => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaveState("saving");
      try {
        await save();
        setSaveState("saved");
      } catch {
        setSaveState("error");
      } finally {
        savingRef.current = false;
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, tagsRaw, isPublished]);

  const handlePublish = async () => {
    if (publishing) return;
    if (title.trim().length === 0 || body.trim().length === 0) {
      setError("제목과 본문을 입력해주세요.");
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const id = await save();
      if (!isPublished) {
        await publishTestimony({
          id,
          authorId: author.uid,
          title: title.trim(),
          publishedAt: existing?.publishedAt ?? null,
        });
      }
      router.push(ROUTES.testimonyDetail(id));
    } catch (err) {
      setError(toUserMessage(err));
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-5">
      <Field label="제목" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="간증 제목"
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-1 rounded-lg bg-paper-warm p-1">
            <EditorTab active={!preview} onClick={() => setPreview(false)}>
              작성
            </EditorTab>
            <EditorTab active={preview} onClick={() => setPreview(true)}>
              미리보기
            </EditorTab>
          </div>
          <SaveIndicator state={saveState} isPublished={isPublished} />
        </div>
        {preview ? (
          <div className="min-h-[320px] rounded-lg border border-line bg-white px-4 py-3">
            {body.trim() ? (
              <MarkdownView content={body} />
            ) : (
              <p className="text-sm text-ink-faint">미리볼 내용이 없습니다.</p>
            )}
          </div>
        ) : (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            placeholder={
              "하나님께서 삶 가운데 행하신 일을 기록해주세요.\n\nMarkdown 문법을 사용할 수 있습니다."
            }
            className="w-full resize-y rounded-lg border border-line bg-white px-4 py-3 font-serif text-[15px] leading-loose text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
        )}
      </div>

      <Field label="태그" hint="쉼표로 구분, 최대 10개">
        <Input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="감사, 치유, 회복"
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end border-t border-line pt-5">
        <Button size="lg" loading={publishing} onClick={handlePublish}>
          {isPublished ? "수정 내용 저장하기" : "게시하기"}
        </Button>
      </div>
    </div>
  );
}

function EditorTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-white text-ink shadow-sm" : "text-ink-faint hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function SaveIndicator({
  state,
  isPublished,
}: {
  state: SaveState;
  isPublished: boolean;
}) {
  if (isPublished) return null;
  const label = {
    idle: "자동 저장 대기",
    saving: "저장 중…",
    saved: "Draft 자동 저장됨",
    error: "저장 실패 — 네트워크를 확인해주세요",
  }[state];
  return (
    <span
      className={cn(
        "text-xs",
        state === "error" ? "text-red-600" : "text-ink-faint",
      )}
    >
      {label}
    </span>
  );
}
