"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { logout } from "@/features/auth/services/authService";
import { Avatar } from "@/shared/components/ui/Avatar";
import { ROUTES } from "@/shared/constants/routes";
import { canWriteSermon, isAdmin } from "@/shared/types";

const NAV_ITEMS = [
  { href: ROUTES.sermons, label: "설교" },
  { href: ROUTES.testimonies, label: "간증" },
  { href: ROUTES.jobs, label: "채용" },
  { href: ROUTES.search, label: "검색" },
];

export function Header() {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push(ROUTES.home);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-9">
          <Link
            href={ROUTES.home}
            className="font-serif text-[22px] font-bold tracking-tight text-ink"
          >
            ARK<span className="text-accent">.</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink-soft underline-offset-8 transition-colors hover:text-ink hover:underline hover:decoration-accent hover:decoration-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {initializing ? null : user ? (
            <>
              {canWriteSermon(user.role) && (
                <Link
                  href={ROUTES.migration}
                  className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong sm:block"
                >
                  설교 보관하기
                </Link>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="내 메뉴"
                  className="block rounded-full"
                >
                  <Avatar name={user.name} photoUrl={user.photoUrl} size="sm" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-56 rounded-2xl border border-line bg-white py-2 shadow-xl shadow-ink/5">
                    <div className="border-b border-line px-4 pb-2">
                      <p className="truncate text-sm font-semibold text-ink">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-ink-faint">
                        @{user.username} · 씨앗 {user.seedBalance}
                      </p>
                    </div>
                    <MenuLink
                      href={ROUTES.pastorPage(user.username)}
                      label="내 페이지"
                      onClick={() => setMenuOpen(false)}
                    />
                    <MenuLink
                      href={ROUTES.archive}
                      label="내 아카이브"
                      onClick={() => setMenuOpen(false)}
                    />
                    <MenuLink
                      href={ROUTES.bookmarks}
                      label="북마크"
                      onClick={() => setMenuOpen(false)}
                    />
                    <MenuLink
                      href={ROUTES.seeds}
                      label="씨앗 내역"
                      onClick={() => setMenuOpen(false)}
                    />
                    {user.role === "pastorPending" && (
                      <MenuLink
                        href={ROUTES.pastorApply}
                        label="목회자 인증 신청"
                        onClick={() => setMenuOpen(false)}
                      />
                    )}
                    {isAdmin(user.role) && (
                      <MenuLink
                        href={ROUTES.admin}
                        label="관리자"
                        onClick={() => setMenuOpen(false)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-ink-soft hover:bg-paper-warm hover:text-ink"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                로그인
              </Link>
              <Link
                href={ROUTES.signup}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent"
              >
                시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-ink-soft hover:bg-paper-warm hover:text-ink"
    >
      {label}
    </Link>
  );
}
