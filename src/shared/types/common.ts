/** 설교·간증 공통 콘텐츠 구분자 */
export type ContentType = "sermon" | "testimony";

/** 모든 콘텐츠는 Draft를 거쳐 공개된다 */
export type ContentStatus = "draft" | "published" | "hidden";

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  sermon: "설교",
  testimony: "간증",
};
