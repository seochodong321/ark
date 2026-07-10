import type { MetadataRoute } from "next";
import { ROUTES } from "@/shared/constants/routes";
import { SITE_URL } from "@/shared/constants/site";

/**
 * 정적 공개 라우트 사이트맵.
 * 개별 설교/간증 URL은 Admin SDK 도입(RSC 전환) 시 동적으로 추가한다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    ROUTES.home,
    ROUTES.sermons,
    ROUTES.testimonies,
    ROUTES.jobs,
    ROUTES.search,
    ROUTES.terms,
    ROUTES.privacy,
  ];
  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === ROUTES.home ? "daily" : "weekly",
    priority: path === ROUTES.home ? 1 : 0.7,
  }));
}
