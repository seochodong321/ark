import { JobEditView } from "@/features/jobs/components/JobEditView";

export default async function JobEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-ink">공고 수정</h1>
      <JobEditView id={id} />
    </main>
  );
}
