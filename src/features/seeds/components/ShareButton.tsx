"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import type { ContentType } from "@/shared/types";
import { grantShareReward } from "../repositories/seedRepository";

interface ShareButtonProps {
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
}

/**
 * 공유하기 — 모바일은 시스템 공유 시트, 데스크톱은 링크 복사.
 * 로그인 회원에게는 기록당 1회 응원 씨앗을 지급한다.
 */
export function ShareButton({
  targetType,
  targetId,
  targetTitle,
}: ShareButtonProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    const url = window.location.href;
    let shared = false;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${targetTitle} — ARK`, url });
        shared = true;
        setFeedback("공유했습니다");
      } catch {
        // 사용자가 공유 시트를 닫음 — 보상 없음
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        shared = true;
        setFeedback("링크를 복사했습니다");
      } catch {
        setFeedback("복사에 실패했습니다");
      }
    }

    if (shared && user) {
      try {
        const rewarded = await grantShareReward({
          uid: user.uid,
          targetType,
          targetId,
          targetTitle,
        });
        if (rewarded) setFeedback("공유 완료 · 응원 씨앗 +1 🌱");
      } catch {
        // 보상 실패는 공유 자체를 방해하지 않는다
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
      >
        <span aria-hidden>↗</span>
        공유
      </button>
      {feedback && <p className="text-xs text-accent-strong">{feedback}</p>}
    </div>
  );
}
