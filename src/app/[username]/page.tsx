import { notFound } from "next/navigation";
import { PastorPageView } from "@/features/pastors/components/PastorPageView";

/**
 * ark.kr/@username — 목회자(사용자) 페이지.
 * 최상위 동적 세그먼트이므로 @ 접두사가 없으면 404 처리한다.
 */
export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith("@")) notFound();
  const username = decoded.slice(1);
  if (username.length === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <PastorPageView username={username} />
    </main>
  );
}
