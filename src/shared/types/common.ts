/** 설교·간증·자료 공통 콘텐츠 구분자 (댓글·북마크·응원·신고의 대상) */
export type ContentType = "sermon" | "testimony" | "resource";

/** 모든 콘텐츠는 Draft를 거쳐 공개된다 (자료는 게시 즉시 공개) */
export type ContentStatus = "draft" | "published" | "hidden";

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  sermon: "설교",
  testimony: "간증",
  resource: "자료",
};
