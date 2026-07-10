/**
 * 채용 게시판.
 * 작성은 인증된 목회자만, 열람은 누구나 가능하다.
 * 콘텐츠(설교·간증)와 달리 공고는 게시 즉시 공개된다.
 */
export type JobStatus = "open" | "closed";

export interface JobPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  title: string;
  churchName: string;
  /** 모집 직분·분야 (예: 부목사, 전도사, 찬양 사역자) */
  position: string;
  /** 사역 지역 (예: 서울 강남구) */
  region: string;
  /** 고용 형태 (예: 전임, 파트타임) */
  employmentType: string | null;
  /** 상세 내용 (Markdown) */
  description: string;
  contactEmail: string | null;
  contactPhone: string | null;
  /** 마감일 YYYY-MM-DD. null이면 충원 시까지 */
  deadline: string | null;
  status: JobStatus;
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}

export type JobInput = Pick<
  JobPost,
  | "title"
  | "churchName"
  | "position"
  | "region"
  | "employmentType"
  | "description"
  | "contactEmail"
  | "contactPhone"
  | "deadline"
>;

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  open: "모집 중",
  closed: "마감",
};
