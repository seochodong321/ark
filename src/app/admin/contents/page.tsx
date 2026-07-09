import type { Metadata } from "next";
import { AdminContentsView } from "@/features/admin/components/AdminContentsView";

export const metadata: Metadata = {
  title: "콘텐츠 관리 — ARK 관리자",
};

export default function AdminContentsPage() {
  return <AdminContentsView />;
}
