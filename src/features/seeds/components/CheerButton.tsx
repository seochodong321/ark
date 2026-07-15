"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { ROUTES } from "@/shared/constants/routes";
import {
  CHEER_MAX_PER_ACTION,
  CHEER_MIN_PER_ACTION,
} from "@/shared/constants/seeds";
import type { ContentType } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { cheerContent, SEED_INSUFFICIENT } from "../repositories/seedRepository";

interface CheerButtonProps {
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  initialCount: number;
}

/** 응원 씨앗을 원하는 개수만큼 골라 보낸다 */
export function CheerButton({
  targetType,
  targetId,
  targetTitle,
  initialCount,
}: CheerButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(CHEER_MIN_PER_ACTION);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const balance = Math.max(0, user?.seedBalance ?? 0);
  const maxSendable = Math.min(balance, CHEER_MAX_PER_ACTION);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const clamp = (n: number) =>
    Math.max(CHEER_MIN_PER_ACTION, Math.min(n, maxSendable));

  const toggle = () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    setError(null);
    setAmount(clamp(amount));
    setOpen((v) => !v);
  };

  const handleSend = async () => {
    if (busy || !user) return;
    setBusy(true);
    setError(null);
    const sent = clamp(amount);
    try {
      await cheerContent({ uid: user.uid, targetType, targetId, targetTitle, amount: sent });
      setCount((c) => c + sent);
      setOpen(false);
      setAmount(CHEER_MIN_PER_ACTION);
    } catch (err) {
      setError(
        err instanceof Error && err.message === SEED_INSUFFICIENT
          ? "씨앗이 부족해요."
          : "잠시 후 다시 시도해주세요.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm transition-colors",
          open
            ? "border-accent text-accent"
            : "border-line text-ink-soft hover:border-accent hover:text-accent",
        )}
      >
        <span aria-hidden>🌱</span>
        <span>씨앗으로 응원 {count > 0 && <strong>{count}</strong>}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="씨앗 보내기"
          className="absolute bottom-full left-1/2 z-30 mb-3 w-64 -translate-x-1/2 rounded-2xl border border-line bg-white p-4 shadow-xl shadow-ink/10"
        >
          {/* 말풍선 꼬리 */}
          <span
            aria-hidden
            className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-line bg-white"
          />

          {maxSendable < 1 ? (
            <div className="text-center">
              <p className="text-2xl" aria-hidden>
                🌱
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                보낼 씨앗이 없어요
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                읽고 기록하며 씨앗을 모아보세요
              </p>
              <Link
                href={ROUTES.seeds}
                onClick={() => setOpen(false)}
                className="mt-3 inline-block text-xs font-medium text-accent underline underline-offset-2"
              >
                씨앗 모으는 법
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">씨앗 보내기</span>
                <span className="text-xs text-ink-faint">보유 {balance}</span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <StepButton
                  label="줄이기"
                  disabled={amount <= CHEER_MIN_PER_ACTION}
                  onClick={() => setAmount((n) => clamp(n - 1))}
                >
                  −
                </StepButton>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  min={CHEER_MIN_PER_ACTION}
                  max={maxSendable}
                  onChange={(e) => setAmount(clamp(Number(e.target.value) || 1))}
                  aria-label="보낼 씨앗 개수"
                  className="w-16 rounded-lg border border-line px-2 py-1.5 text-center font-serif text-lg font-bold text-ink focus:border-accent focus:outline-none"
                />
                <StepButton
                  label="늘리기"
                  disabled={amount >= maxSendable}
                  onClick={() => setAmount((n) => clamp(n + 1))}
                >
                  +
                </StepButton>
              </div>
              {error && (
                <p className="mt-2 text-center text-xs text-red-600">{error}</p>
              )}
              <button
                type="button"
                onClick={handleSend}
                disabled={busy}
                className="mt-3 w-full rounded-full bg-accent py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
              >
                {busy ? "보내는 중…" : `🌱 ${amount}개 보내기`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-line text-lg text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
    >
      {children}
    </button>
  );
}
