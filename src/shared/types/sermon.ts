import type { ContentStatus } from "./common";
import type { PositionCategory } from "./pastor";

export interface Sermon {
  id: string;
  authorId: string;
  /** 목록/검색 화면에서 추가 Read를 막기 위한 비정규화 필드 */
  authorName: string;
  authorUsername: string;
  /** 작성자 직분 분류(비정규화) — 나무체크 배지 표시용. 레거시 문서는 null */
  authorPositionCategory: PositionCategory | null;
  title: string;
  /** YYYY-MM-DD */
  sermonDate: string | null;
  /** 성경 본문 (예: 요한복음 3:16-21) */
  scripture: string | null;
  /** scripture에서 추출한 책 이름 — 성경본문별 탐색 필터용 */
  scriptureBook: string | null;
  body: string;
  tags: string[];
  series: string | null;
  coverImageUrl: string | null;
  youtubeVideoId: string | null;
  status: ContentStatus;
  viewCount: number;
  seedCount: number;
  commentCount: number;
  /** 검색용 토큰. 향후 외부 Full-text Search로 대체 가능 */
  searchKeywords: string[];
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
}

/** 설교 등록/수정 폼 입력값 */
export interface SermonInput {
  title: string;
  sermonDate: string | null;
  scripture: string | null;
  body: string;
  tags: string[];
  series: string | null;
  coverImageUrl: string | null;
  youtubeVideoId: string | null;
}

/** 파일 분석으로 자동 추출된 Draft 초안 */
export interface ParsedSermon {
  title: string;
  sermonDate: string | null;
  scripture: string | null;
  body: string;
  sourceFileName: string;
}

/** Migration 완료 화면 통계 */
export interface MigrationSummary {
  totalCount: number;
  firstSermonDate: string | null;
  lastSermonDate: string | null;
}
