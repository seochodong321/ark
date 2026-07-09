import { TestimonyDetailView } from "@/features/testimonies/components/TestimonyDetailView";

export default async function TestimonyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <TestimonyDetailView id={id} />
    </main>
  );
}
