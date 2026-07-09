import type { ContentType } from "./common";

export interface Comment {
  id: string;
  targetType: ContentType;
  targetId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}
