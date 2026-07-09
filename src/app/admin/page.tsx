import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";

export const metadata: Metadata = {
  title: "관리자 — ARK",
};

const CARDS = [
  {
    href: ROUTES.adminPastors,
    title: "목회자 승인",
    description: "인증 신청을 검토하고 설교 작성 권한을 부여합니다.",
  },
  {
    href: ROUTES.adminReports,
    title: "신고 처리",
    description: "신고된 콘텐츠를 검토하여 비공개 또는 삭제합니다.",
  },
  {
    href: ROUTES.adminContents,
    title: "콘텐츠 관리",
    description: "보관된 설교와 간증 전체를 관리합니다.",
  },
  {
    href: ROUTES.adminSeeds,
    title: "씨앗 지급",
    description: "운영 이벤트 보상으로 씨앗을 지급합니다.",
  },
  {
    href: ROUTES.adminCuration,
    title: "메인 큐레이션",
    description: "홈 화면 추천 설교를 구성합니다.",
  },
];

export default function AdminHomePage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CARDS.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="rounded-xl border border-line bg-white p-5 transition-colors hover:border-accent"
        >
          <h2 className="font-semibold text-ink">{card.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {card.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
