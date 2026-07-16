import type { ContentType } from "@/shared/types/common";

/** 라우트 경로의 Single Source. 하드코딩된 경로 문자열 사용 금지. */
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  search: "/search",
  sermons: "/sermons",
  sermonDetail: (id: string) => `/sermons/${id}`,
  sermonNew: "/sermons/new",
  sermonEdit: (id: string) => `/sermons/${id}/edit`,
  migration: "/migration",
  testimonies: "/testimonies",
  testimonyDetail: (id: string) => `/testimonies/${id}`,
  testimonyNew: "/testimonies/new",
  testimonyEdit: (id: string) => `/testimonies/${id}/edit`,
  pastorApply: "/pastor/apply",
  pastorPage: (username: string) => `/@${username}`,
  archive: "/archive",
  bookmarks: "/bookmarks",
  seeds: "/seeds",
  settings: "/settings",
  resources: "/resources",
  resourceDetail: (id: string) => `/resources/${id}`,
  resourceNew: "/resources/new",
  resourceEdit: (id: string) => `/resources/${id}/edit`,
  jobs: "/jobs",
  jobDetail: (id: string) => `/jobs/${id}`,
  jobNew: "/jobs/new",
  jobEdit: (id: string) => `/jobs/${id}/edit`,
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
  admin: "/admin",
  adminPastors: "/admin/pastors",
  adminReports: "/admin/reports",
  adminContents: "/admin/contents",
  adminSeeds: "/admin/seeds",
  adminCuration: "/admin/curation",
} as const;

/** 콘텐츠 유형 → 상세 페이지 경로 (북마크·신고 등 공용) */
export function contentDetailRoute(type: ContentType, id: string): string {
  const routes: Record<ContentType, (id: string) => string> = {
    sermon: ROUTES.sermonDetail,
    testimony: ROUTES.testimonyDetail,
    resource: ROUTES.resourceDetail,
  };
  return routes[type](id);
}
