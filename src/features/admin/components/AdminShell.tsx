"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/features/auth/components/AuthGate";

/** 관리자 영역 전체를 admin 권한으로 보호한다 */
export function AdminShell({ children }: { children: ReactNode }) {
  return <AuthGate require="admin">{() => children}</AuthGate>;
}
