import type { Metadata } from "next";
import { BookmarkListView } from "@/features/bookmarks/components/BookmarkListView";

export const metadata: Metadata = {
  title: "북마크 — ARK",
};

export default function BookmarksPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-ink">북마크</h1>
      <BookmarkListView />
    </main>
  );
}
