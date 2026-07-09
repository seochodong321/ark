import type { Metadata } from "next";
import { AdminReportsView } from "@/features/admin/components/AdminReportsView";

export const metadata: Metadata = {
  title: "신고 처리 — ARK 관리자",
};

export default function AdminReportsPage() {
  return <AdminReportsView />;
}
