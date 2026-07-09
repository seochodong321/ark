import type { ContentStatus } from "./common";

export interface Testimony {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
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
