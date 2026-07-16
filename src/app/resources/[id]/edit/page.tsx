import { ResourceEditView } from "@/features/resources/components/ResourceEditView";

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-ink">자료 수정</h1>
      <ResourceEditView id={id} />
    </main>
  );
}
