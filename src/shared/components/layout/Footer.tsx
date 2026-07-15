import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";

const FOOTER_LINKS = [
  { href: ROUTES.sermons, label: "설교" },
  { href: ROUTES.testimonies, label: "간증" },
  { href: ROUTES.jobs, label: "채용" },
  { href: ROUTES.search, label: "검색" },
  { href: ROUTES.migration, label: "설교 옮기기" },
  { href: ROUTES.pastorApply, label: "목회자 인증" },
];

const LEGAL_LINKS = [
  { href: ROUTES.faq, label: "자주 묻는 질문" },
  { href: ROUTES.terms, label: "이용약관" },
  { href: ROUTES.privacy, label: "개인정보처리방침" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-warm/40">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-14 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-serif text-lg font-bold tracking-tight text-ink">
            ARK<span className="text-accent">.</span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
            신앙의 기록을 보존하는 디지털 아카이브
            <br />
            오늘의 말씀은 다음 세대가 다시 찾을 기록입니다.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:items-end">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-ink-soft transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex gap-x-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] text-ink-faint underline underline-offset-2 transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
