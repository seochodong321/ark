import type { Metadata } from "next";
import { MigrationWizard } from "@/features/migration/components/MigrationWizard";

export const metadata: Metadata = {
  title: "Migration Wizard — ARK",
};

export default function MigrationPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">Migration Wizard</h1>
      <p className="mb-8 text-sm leading-relaxed text-ink-soft">
        Word 문서, USB, 외장하드에 흩어져 있던 수십 년의 설교를 한 번에
        옮겨보세요. 모든 파일은 먼저 비공개로 안전하게 보관되며, 공개할 설교만
        직접 선택합니다.
      </p>
      <MigrationWizard />
    </main>
  );
}
