"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/shared/components/ui/Field";
import {
  RESOURCE_CATEGORY_LABEL,
  type ResourceCategory,
  type ResourceFile,
  type ResourceInput,
  type ResourcePost,
  type User,
} from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { parseTags } from "@/shared/utils/text";
import { ResourceFileUploader } from "./ResourceFileUploader";

interface ResourceFormProps {
  author: User;
  initial?: ResourcePost;
  onSave: (input: ResourceInput) => Promise<void>;
}

export function ResourceForm({ author, initial, onSave }: ResourceFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<ResourceCategory>(
    initial?.category ?? "plan",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tagsRaw, setTagsRaw] = useState(initial?.tags.join(", ") ?? "");
  const [files, setFiles] = useState<ResourceFile[]>(initial?.files ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (files.length === 0) {
      setError("나눌 파일을 1개 이상 첨부해주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        tags: parseTags(tagsRaw),
        files,
      });
    } catch (err) {
      setError(toUserMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="제목" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={80}
          placeholder="예: 여름성경학교 전체 기획안 (PPT·포스터 포함)"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="카테고리" required>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory)}
          >
            {Object.entries(RESOURCE_CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="태그" hint="쉼표로 구분, 최대 10개">
          <Input
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="여름성경학교, 유치부"
          />
        </Field>
      </div>

      <Field
        label="자료 설명"
        required
        hint="어떤 자료인지, 어떻게 활용하면 좋은지 적어주세요. Markdown 사용 가능"
      >
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={8}
        />
      </Field>

      <Field label="첨부 파일" required>
        <ResourceFileUploader
          uid={author.uid}
          files={files}
          onChange={setFiles}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end border-t border-line pt-5">
        <Button type="submit" size="lg" loading={submitting}>
          {initial ? "수정 내용 저장" : "자료 나누기"}
        </Button>
      </div>
    </form>
  );
}
