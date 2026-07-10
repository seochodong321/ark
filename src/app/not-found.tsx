import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-28 text-center">
      <p className="font-serif text-6xl font-bold text-ink-faint">404</p>
      <h1 className="mt-4 font-serif text-xl font-bold text-ink">
        찾으시는 페이지가 없습니다
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        주소가 바뀌었거나 삭제된 기록일 수 있습니다.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={ROUTES.home}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          홈으로
        </Link>
        <Link
          href={ROUTES.search}
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          검색하기
        </Link>
      </div>
    </main>
  );
}
