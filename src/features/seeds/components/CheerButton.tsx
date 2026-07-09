"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { ROUTES } from "@/shared/constants/routes";
import type { ContentType } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { cn } from "@/shared/utils/cn";
import { cheerContent } from "../repositories/seedRepository";

interface CheerButtonProps {
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  initialCount: number;
}

/** 씨앗 1개로 콘텐츠를 응원한다 */
export function CheerButton({
  targetType,
  targetId,
  targetTitle,
  initialCount,
}: CheerButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheer = async () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await cheerContent({ uid: user.uid, targetType, targetId, targetTitle });
      setCount((c) => c + 1);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleCheer}
        disabled={busy}
        className={cn(
          "flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink-soft transition-colors",
          "hover:border-accent hover:text-accent disabled:opacity-60",
        )}
      >
        <span aria-hidden>🌱</span>
        <span>씨앗으로 응원 {count > 0 && <strong>{count}</strong>}</span>
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
