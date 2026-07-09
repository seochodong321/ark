import { SermonDetailView } from "@/features/sermons/components/SermonDetailView";

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <SermonDetailView id={id} />
    </main>
  );
}
