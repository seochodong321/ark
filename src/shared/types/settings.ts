/** settings/curation — 홈 화면 운영자 큐레이션 */
export interface CurationSettings {
  /** 추천 설교로 노출할 설교 ID (노출 순서 유지) */
  sermonIds: string[];
  /** 큐레이션 섹션 안내 문구 */
  headline: string;
  updatedAt: number;
}

export const CURATION_DOC_ID = "curation";
