"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";

const ADMIN_MENU = [
  { href: ROUTES.adminPastors, label: "목회자 승인" },
  { href: ROUTES.adminReports, label: "신고 처리" },
  { href: ROUTES.adminContents, label: "콘텐츠 관리" },
  { href: ROUTES.adminSeeds, label: "씨앗 지급" },
  { href: ROUTES.adminCuration, label: "메인 큐레이션" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-line pb-4">
      {ADMIN_MENU.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-4 py-2 text-sm transition-colors",
            pathname === item.href
              ? "bg-accent font-medium text-white"
              : "bg-white text-ink-soft ring-1 ring-line hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
