import type { Metadata } from "next";
import { AdminPastorsView } from "@/features/admin/components/AdminPastorsView";

export const metadata: Metadata = {
  title: "목회자 승인 — ARK 관리자",
};

export default function AdminPastorsPage() {
  return <AdminPastorsView />;
}
