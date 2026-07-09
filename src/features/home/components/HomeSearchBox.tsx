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
    <form onSubmit={handleSubmit} className="relative">
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-5 top-1/2 size-[18px] -translate-y-1/2 text-ink-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="8.5" cy="8.5" r="5.75" />
        <path d="m13 13 4 4" strokeLinecap="round" />
      </svg>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="말씀, 간증, 목회자 검색"
        aria-label="검색어"
        className="w-full rounded-full border border-line bg-white py-4 pl-12 pr-28 text-base text-ink shadow-[0_2px_12px_rgba(27,24,19,0.05)] transition-colors placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
      >
        검색
      </button>
    </form>
  );
}
