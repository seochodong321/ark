import type { ContentType } from "./common";

export type ReportReason =
  | "heresy"
  | "falseInfo"
  | "copyright"
  | "abuse"
  | "spam"
  | "etc";

export type ReportStatus = "pending" | "resolved" | "dismissed";

export interface Report {
  id: string;
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  reporterId: string;
  reason: ReportReason;
  detail: string;
  status: ReportStatus;
  resolutionNote: string | null;
  createdAt: number;
  resolvedAt: number | null;
}

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  heresy: "이단·사이비 콘텐츠",
  falseInfo: "허위 정보",
  copyright: "저작권 침해",
  abuse: "비방·모욕",
  spam: "스팸·광고",
  etc: "기타",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  pending: "처리 대기",
  resolved: "처리 완료",
  dismissed: "기각",
};
