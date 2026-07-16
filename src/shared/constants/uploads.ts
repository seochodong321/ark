/**
 * 자료실 파일 업로드 제한.
 * 개당 크기 제한은 storage.rules에도 동일하게 강제되어 있다 — 값을 바꾸면
 * 규칙도 함께 수정할 것.
 */
export const RESOURCE_FILE_MAX_BYTES = 25 * 1024 * 1024; // 25MB
export const RESOURCE_FILES_MAX_COUNT = 5;

/** 허용 확장자 — 실행 파일 등 위험 형식 차단 */
export const RESOURCE_ALLOWED_EXTENSIONS = new Set([
  "zip",
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "hwp",
  "hwpx",
  "key",
  "txt",
  "md",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "mp3",
  "mp4",
  "mov",
  "psd",
  "ai",
]);

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
