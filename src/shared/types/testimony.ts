import type { ContentStatus } from "./common";
import type { AuthorBadge } from "./pastor";

export interface Testimony {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  /** 작성자 인증 배지 분류(비정규화) — 나무체크 표시용. 미인증은 null */
  authorBadge: AuthorBadge | null;
  title: string;
  /** Markdown 본문 */
  body: string;
  tags: string[];
  status: ContentStatus;
  viewCount: number;
  seedCount: number;
  commentCount: number;
  searchKeywords: string[];
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
}

export interface TestimonyInput {
  title: string;
  body: string;
  tags: string[];
}
