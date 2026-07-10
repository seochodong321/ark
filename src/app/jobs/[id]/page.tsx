import { JobDetailView } from "@/features/jobs/components/JobDetailView";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <JobDetailView id={id} />
    </main>
  );
}
