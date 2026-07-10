import type { ReactNode } from "react";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

/** 이용약관·개인정보처리방침 공통 레이아웃 */
export function LegalDocument({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string;
  effectiveDate: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="font-serif text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-xs text-ink-faint">시행일: {effectiveDate}</p>
      {intro && (
        <p className="mt-6 text-sm leading-relaxed text-ink-soft">{intro}</p>
      )}
      <div className="mt-10 space-y-10">
        {sections.map((section, i) => (
          <section key={i}>
            <h2 className="mb-3 font-serif text-lg font-bold text-ink">
              {section.heading}
            </h2>
            <div className="space-y-2 text-sm leading-relaxed text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
