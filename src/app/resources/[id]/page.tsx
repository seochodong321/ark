import { ResourceDetailView } from "@/features/resources/components/ResourceDetailView";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <ResourceDetailView id={id} />
    </main>
  );
}
