import type { Metadata } from "next";
import { AdminSeedsView } from "@/features/admin/components/AdminSeedsView";

export const metadata: Metadata = {
  title: "씨앗 지급 — ARK 관리자",
};

export default function AdminSeedsPage() {
  return <AdminSeedsView />;
}
