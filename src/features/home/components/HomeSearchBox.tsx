"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";

/** 홈 Hero의 검색창 — 검색 페이지로 이동한다 */
export function HomeSearchBox() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (q.length === 0) return;
    router.push(`${ROUTES.search}?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="말씀, 간증, 목회자를 검색해보세요"
        aria-label="검색어"
        className="w-full rounded-xl border border-line bg-white px-5 py-3.5 text-base text-ink shadow-sm placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
      >
        검색
      </button>
    </form>
  );
}
