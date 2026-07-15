import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/shared/constants/routes";
import { SITE_NAME } from "@/shared/constants/site";

export const metadata: Metadata = {
  title: "자주 묻는 질문 — ARK",
  description:
    "ARK는 설교와 간증을 보존하는 무료 디지털 아카이브입니다. 특정 교단의 플랫폼이 아니며, 설교를 판매하지 않습니다.",
};

interface FaqItem {
  q: string;
  a: ReactNode;
}

interface FaqGroup {
  heading: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    heading: "ARK는 무엇인가요",
    items: [
      {
        q: "ARK는 어떤 서비스인가요?",
        a: (
          <p>
            ARK는 설교와 간증이라는 신앙의 기록을 다음 세대까지 보존하는 디지털
            아카이브입니다. 수십 년 동안 Word 문서·USB·외장하드에 흩어져 있던
            설교가 사라지지 않도록 한곳에 안전하게 모으고, 누구나 다시 찾아 읽을
            수 있게 합니다. 오래 머무르게 하는 SNS가 아니라, 기록이 오래 남는
            아카이브를 지향합니다.
          </p>
        ),
      },
      {
        q: "왜 이런 서비스가 필요한가요?",
        a: (
          <p>
            한 편의 설교는 그 주만을 위한 말씀이 아니라, 시간이 지나 다시 찾을
            유산입니다. 그러나 대부분의 기록은 개인 저장장치에 흩어진 채
            잊히거나 유실됩니다. ARK는 그 기록을 가장 쉽고 안전하게 옮겨 평생
            보관하고, 다음 세대가 다시 읽을 수 있도록 돕습니다.
          </p>
        ),
      },
    ],
  },
  {
    heading: "자주 있는 오해",
    items: [
      {
        q: "특정 교단이나 단체의 서비스인가요? 혹시 이단과 관련이 있나요?",
        a: (
          <p>
            아닙니다. ARK는 특정 교단·교회의 플랫폼이 아니라, 신뢰할 수 있는
            신앙의 기록을 모으는 열린 아카이브입니다. 어느 한 교단을 대변하지
            않으며, 명백한 이단·사이비 단체는 인증 대상에서 제외합니다. 신고와
            검토 절차를 통해 건강한 기록만 남도록 관리합니다.
          </p>
        ),
      },
      {
        q: "설교를 사고파는 곳인가요?",
        a: (
          <p>
            아닙니다. ARK에서 설교와 간증을 읽고 나누는 것은 모두 무료입니다.
            설교를 상품으로 판매하지 않습니다. 기록을 보존하고, 다음 세대가 다시
            찾을 수 있게 하는 것이 유일한 목적입니다.
          </p>
        ),
      },
      {
        q: "씨앗은 돈인가요?",
        a: (
          <p>
            씨앗은 활동으로 얻는 무료 응원 포인트입니다. 마음에 남은 설교나
            간증에 응원을 보낼 때 사용하며, 실제 돈으로 환전되지 않습니다. 매일
            출석, 기록 남기기, 공유하기 같은 활동으로 모을 수 있습니다.
          </p>
        ),
      },
    ],
  },
  {
    heading: "이용 안내",
    items: [
      {
        q: "누가 설교를 올릴 수 있나요?",
        a: (
          <p>
            설교는 인증을 마친 목회자, 그리고 교회·단체만 등록할 수 있습니다.
            신뢰할 수 있는 출처를 위해 인증 절차를 거칩니다. 간증은 회원 누구나
            자유롭게 기록할 수 있습니다.
          </p>
        ),
      },
      {
        q: "이름 옆의 인증 배지(나무체크)는 무엇인가요?",
        a: (
          <p>
            인증을 마친 발행자임을 나타내는 표시입니다. 전도사는 🌲, 목사는 🌳,
            교회·단체는 ⛪ 로 구분합니다. 신뢰할 수 있는 출처가 남긴 기록임을
            한눈에 알 수 있습니다.
          </p>
        ),
      },
      {
        q: "글을 올리면 바로 공개되나요?",
        a: (
          <p>
            아닙니다. 모든 기록은 먼저 비공개로 보관되고, 작성자가 공개를 선택한
            글만 다른 사람에게 보입니다. 공개한 뒤에도 언제든 다시 비공개로
            되돌릴 수 있습니다.
          </p>
        ),
      },
      {
        q: "내가 올린 글의 저작권은 누구에게 있나요?",
        a: (
          <p>
            작성자 본인에게 있습니다. ARK는 기록을 보존·열람·검색할 수 있도록
            돕는 역할이며, 글을 삭제하거나 탈퇴하면 관련 권한도 함께 종료됩니다.
          </p>
        ),
      },
      {
        q: "성경 본문은 어떤 역본을 사용하나요?",
        a: (
          <p>
            설교에 성경 본문 표기가 있으면 개역한글판(1961)을 함께 보여줍니다.
            저작권 보호기간이 만료되어 자유롭게 인용할 수 있는 역본입니다.
          </p>
        ),
      },
      {
        q: "AI가 설교나 간증을 대신 써주나요?",
        a: (
          <p>
            아닙니다. ARK의 AI는 설교·간증·기도문을 작성하지 않으며, 사용자의
            원문을 임의로 수정하지 않습니다. 문서 분석과 검색 품질 향상 등,
            기록을 더 쉽게 보존하도록 돕는 역할만 합니다.
          </p>
        ),
      },
      {
        q: "개인정보는 어떻게 다루나요?",
        a: (
          <p>
            서비스에 필요한 최소한의 정보만 수집하고 안전하게 보관합니다. 자세한
            내용은{" "}
            <Link href={ROUTES.privacy} className="text-accent underline">
              개인정보처리방침
            </Link>
            과{" "}
            <Link href={ROUTES.terms} className="text-accent underline">
              이용약관
            </Link>
            을 참고해주세요.
          </p>
        ),
      },
      {
        q: "어떻게 시작하나요?",
        a: (
          <p>
            <Link href={ROUTES.signup} className="text-accent underline">
              회원가입
            </Link>{" "}
            후 간증을 기록하거나 설교를 읽어보세요. 목회자·교회·단체라면{" "}
            <Link href={ROUTES.pastorApply} className="text-accent underline">
              인증 신청
            </Link>{" "}
            후 설교를 보관할 수 있습니다.
          </p>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-14">
      <header className="mb-12">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-accent">
          About {SITE_NAME}
        </p>
        <h1 className="font-serif text-3xl font-bold leading-snug text-ink">
          자주 묻는 질문
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          ARK는 설교와 간증을 다음 세대까지 보존하는 무료 디지털 아카이브입니다.
          궁금하신 점을 아래에서 확인해보세요.
        </p>
      </header>

      <div className="space-y-12">
        {GROUPS.map((group) => (
          <section key={group.heading}>
            <h2 className="mb-3 font-serif text-lg font-bold text-ink">
              {group.heading}
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {group.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium text-ink marker:content-none">
                    {item.q}
                    <span
                      aria-hidden
                      className="shrink-0 text-ink-faint transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="pb-5 text-sm leading-relaxed text-ink-soft">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 rounded-2xl border border-line bg-paper-warm/40 p-6 text-center text-sm leading-relaxed text-ink-soft">
        더 궁금한 점이 있으신가요?
        <br />
        문의 창구를 준비하고 있습니다. 곧 안내해드리겠습니다.
      </p>
    </main>
  );
}
