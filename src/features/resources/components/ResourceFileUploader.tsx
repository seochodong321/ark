"use client";

import { useRef, useState } from "react";
import {
  formatFileSize,
  RESOURCE_ALLOWED_EXTENSIONS,
  RESOURCE_FILE_MAX_BYTES,
  RESOURCE_FILES_MAX_COUNT,
} from "@/shared/constants/uploads";
import {
  resourceFilePath,
  uploadResourceFile,
} from "@/shared/firebase/storage";
import type { ResourceFile } from "@/shared/types";
import { Button } from "@/shared/components/ui/Button";

interface ResourceFileUploaderProps {
  uid: string;
  files: ResourceFile[];
  onChange: (files: ResourceFile[]) => void;
}

/** 자료 첨부 업로더 — 개당 25MB, 최대 5개, 허용 확장자만 */
export function ResourceFileUploader({
  uid,
  files,
  onChange,
}: ResourceFileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!RESOURCE_ALLOWED_EXTENSIONS.has(ext)) {
      return `${file.name}: 지원하지 않는 형식(.${ext})입니다.`;
    }
    if (file.size > RESOURCE_FILE_MAX_BYTES) {
      return `${file.name}: 파일당 ${formatFileSize(RESOURCE_FILE_MAX_BYTES)}까지 올릴 수 있습니다.`;
    }
    return null;
  };

  const handleSelect = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    setError(null);
    const incoming = Array.from(selected);
    if (files.length + incoming.length > RESOURCE_FILES_MAX_COUNT) {
      setError(`파일은 게시물당 최대 ${RESOURCE_FILES_MAX_COUNT}개까지 첨부할 수 있습니다.`);
      return;
    }
    for (const file of incoming) {
      const problem = validate(file);
      if (problem) {
        setError(problem);
        return;
      }
    }
    setUploading(true);
    try {
      const uploaded: ResourceFile[] = [];
      for (const file of incoming) {
        const path = resourceFilePath(uid, file.name);
        const url = await uploadResourceFile(path, file);
        uploaded.push({
          name: file.name,
          url,
          size: file.size,
          contentType: file.type || "application/octet-stream",
          storagePath: path,
        });
      }
      onChange([...files, ...uploaded]);
    } catch {
      setError("업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-faint">
          파일당 {formatFileSize(RESOURCE_FILE_MAX_BYTES)} · 최대{" "}
          {RESOURCE_FILES_MAX_COUNT}개 (ZIP·PDF·오피스·한글·이미지 등)
        </p>
        <Button
          variant="secondary"
          size="sm"
          loading={uploading}
          disabled={files.length >= RESOURCE_FILES_MAX_COUNT}
          onClick={() => inputRef.current?.click()}
        >
          파일 추가
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleSelect(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((file, i) => (
            <li
              key={file.storagePath || i}
              className="flex items-center justify-between gap-3 rounded-lg bg-paper-warm/60 px-3 py-2 text-sm"
            >
              <span className="truncate text-ink">
                📎 {file.name}
                <span className="ml-2 text-xs text-ink-faint">
                  {formatFileSize(file.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`${file.name} 제거`}
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="shrink-0 text-ink-faint hover:text-red-700"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
