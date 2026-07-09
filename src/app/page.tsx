import Link from "next/link";
import { HomeSections } from "@/features/home/components/HomeSections";
import { HomeSearchBox } from "@/features/home/components/HomeSearchBox";
import { ROUTES } from "@/shared/constants/routes";

const VALUE_PROPS = [
  {
    title: "읽다",
    description:
      "수십 년의 설교와 간증을 성경 본문·주제·목회자별로 다시 찾아 읽습니다.",
  },
  {
    title: "나누다",
    description:
      "마음에 남은 기록에 댓글과 씨앗으로 은혜를 나누고, 북마크로 간직합니다.",
  },
  {
    title: "보존하다",
    description:
      "흩어져 있던 신앙의 기록이 다음 세대까지 안전하게 이어집니다.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero — 검색 중심, 읽는 사람을 먼저 환영한다 */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_-5%,var(--color-accent-soft)_0%,transparent_75%)]"
        />
        <div className="relative mx-auto w-full max-w-3xl px-6 pb-20 pt-20 text-center sm:pb-24 sm:pt-28">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
            Faith Archive
          </p>
          <h1 className="font-serif text-[34px] font-bold leading-[1.4] tracking-tight text-ink sm:text-5xl sm:leading-[1.35]">
            믿음의 기록이 모이고,
            <br />
            다시 읽히는 곳
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
            설교와 간증을 읽고, 마음에 남은 은혜를 나누세요.
            <br className="hidden sm:block" />
            오늘의 기록은 다음 세대가 다시 찾을 유산이 됩니다.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            <HomeSearchBox />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.sermons}
              className="w-full rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accent sm:w-auto"
            >
              설교 읽기
            </Link>
            <Link
              href={ROUTES.testimonies}
              className="w-full rounded-full border border-line bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink sm:w-auto"
            >
              간증 읽기
            </Link>
          </div>

          <p className="mt-7 text-sm text-ink-faint">
            목회자이신가요?{" "}
            <Link
              href={ROUTES.migration}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              흩어진 설교를 한 번에 옮겨 보관하세요 →
            </Link>
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <HomeSections />
      </div>

      {/* ARK가 하는 일 */}
      <section className="border-t border-line">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 sm:grid-cols-3">
          {VALUE_PROPS.map((prop, i) => (
            <div key={prop.title}>
              <p className="font-serif text-sm font-semibold text-gold">
                0{i + 1}
              </p>
              <h2 className="mt-2 font-serif text-xl font-bold text-ink">
                {prop.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
