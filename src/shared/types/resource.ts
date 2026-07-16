import type { ContentStatus } from "./common";
import type { AuthorBadge } from "./pastor";

/**
 * 자료실 — 교회학교 기획안, 영상 템플릿, 디자인 소스 등
 * 소멸되기 쉬운 사역 자료를 나누고 보존하는 게시판.
 * 회원 누구나 게시하며, 게시 즉시 공개된다(draft 없음).
 */
export type ResourceCategory =
  | "plan"
  | "design"
  | "video"
  | "education"
  | "form"
  | "etc";

export const RESOURCE_CATEGORY_LABEL: Record<ResourceCategory, string> = {
  plan: "기획·행사",
  design: "디자인",
  video: "영상·미디어",
  education: "교육·교재",
  form: "문서·양식",
  etc: "기타",
};

/** 게시물에 첨부된 파일. storagePath는 삭제 시 Storage 정리에 사용 */
export interface ResourceFile {
  name: string;
  url: string;
  size: number;
  contentType: string;
  storagePath: string;
}

export interface ResourcePost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  /** 작성자 인증 배지(비정규화) — 미인증 회원은 null */
  authorBadge: AuthorBadge | null;
  title: string;
  /** 자료 설명 (Markdown) */
  description: string;
  category: ResourceCategory;
  tags: string[];
  files: ResourceFile[];
  status: ContentStatus;
  viewCount: number;
  downloadCount: number;
  seedCount: number;
  commentCount: number;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
}

export interface ResourceInput {
  title: string;
  description: string;
  category: ResourceCategory;
  tags: string[];
  files: ResourceFile[];
}
