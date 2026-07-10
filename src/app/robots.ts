import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 개인 영역·관리 화면은 색인 제외
      disallow: ["/admin", "/archive", "/bookmarks", "/seeds", "/login", "/signup"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
