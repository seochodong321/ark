"use client";

import { Button } from "@/shared/components/ui/Button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-28 text-center">
      <p className="text-4xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="mt-4 font-serif text-xl font-bold text-ink">
        일시적인 문제가 발생했습니다
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        잠시 후 다시 시도해주세요. 문제가 계속되면 새로고침해 주세요.
      </p>
      <Button className="mt-8" onClick={reset}>
        다시 시도
      </Button>
    </main>
  );
}
