import type { ContentType } from "./common";

/**
 * bookmarks/{uid_targetType_targetId}
 * 결정적 문서 ID로 중복 북마크를 원천 차단한다.
 * 목록 화면에서 추가 Read 없이 렌더링하도록 제목/작성자를 비정규화한다.
 */
export interface Bookmark {
  id: string;
  uid: string;
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  targetAuthorName: string;
  createdAt: number;
}

export function bookmarkId(
  uid: string,
  targetType: ContentType,
  targetId: string,
): string {
  return `${uid}_${targetType}_${targetId}`;
}
