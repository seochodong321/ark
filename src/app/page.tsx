import Link from "next/link";
import { HomeSections } from "@/features/home/components/HomeSections";
import { HomeSearchBox } from "@/features/home/components/HomeSearchBox";
import { ROUTES } from "@/shared/constants/routes";

export default function HomePage() {
  return (
    <main>
      {/* Hero — 검색 중심 첫 화면 */}
      <section className="border-b border-line bg-paper-warm/50">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center sm:py-28">
          <h1 className="font-serif text-3xl font-bold leading-relaxed text-ink sm:text-4xl sm:leading-relaxed">
            당신의 설교는
            <br />
            이번 주만을 위한 말씀이 아닙니다.
          </h1>
          <p className="mt-4 font-serif text-lg text-ink-soft">
            다음 세대가 다시 찾을 기록입니다.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            <HomeSearchBox />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.migration}
              className="rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              설교 보관하기
            </Link>
            <Link
              href={ROUTES.sermons}
              className="rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              설교 읽기
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <HomeSections />
      </div>
    </main>
  );
}
