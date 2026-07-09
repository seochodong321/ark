import type { Metadata } from "next";
import { AdminCurationView } from "@/features/admin/components/AdminCurationView";

export const metadata: Metadata = {
  title: "메인 큐레이션 — ARK 관리자",
};

export default function AdminCurationPage() {
  return <AdminCurationView />;
}
