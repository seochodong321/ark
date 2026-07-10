"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState, LoadingState } from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { canWriteSermon, isAdmin, type User } from "@/shared/types";
import { useAuth } from "../hooks/AuthProvider";

type RequiredRole = "user" | "pastor" | "admin";

interface AuthGateProps {
  require?: RequiredRole;
  children: (user: User) => ReactNode;
}

function hasAccess(user: User, require: RequiredRole): boolean {
  if (require === "pastor") return canWriteSermon(user.role);
  if (require === "admin") return isAdmin(user.role);
  return true;
}

/**
 * 로그인/권한 가드.
 * 미로그인 시 로그인 페이지로 보내고, 권한 부족 시 안내를 보여준다.
 */
export function AuthGate({ require = "user", children }: AuthGateProps) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      router.replace(ROUTES.login);
    }
  }, [initializing, user, router]);

  if (initializing || !user) return <LoadingState />;

  if (!hasAccess(user, require)) {
    if (require === "pastor") {
      return (
        <EmptyState
          title="인증된 목회자만 이용할 수 있는 기능입니다"
          description="신뢰할 수 있는 아카이브를 위해 목회자 인증을 거칩니다."
          action={
            <Link
              href={ROUTES.pastorApply}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
            >
              목회자 인증 신청하기
            </Link>
          }
        />
      );
    }
    return <EmptyState title="접근 권한이 없습니다" />;
  }

  return <>{children(user)}</>;
}
