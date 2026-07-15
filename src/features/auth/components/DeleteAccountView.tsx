"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input } from "@/shared/components/ui/Field";
import { ROUTES } from "@/shared/constants/routes";
import { canWriteSermon, type User } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { deleteAccount } from "../services/accountService";

const CONFIRM_WORD = "탈퇴합니다";

export function DeleteAccountView() {
  return <AuthGate>{(user) => <DeleteAccount user={user} />}</AuthGate>;
}

function DeleteAccount({ user }: { user: User }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPastor = canWriteSermon(user.role);
  const ready = confirmText.trim() === CONFIRM_WORD && password.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(user, password);
      router.replace(ROUTES.home);
    } catch (err) {
      // 재인증 비밀번호 오류를 사용자 친화적으로 안내
      if (
        err instanceof FirebaseError &&
        (err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential")
      ) {
        setError("비밀번호가 올바르지 않습니다.");
      } else {
        setError(toUserMessage(err));
      }
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/40 p-6">
      <h2 className="text-lg font-semibold text-red-800">회원 탈퇴</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
        <p>탈퇴하면 계정과 함께 아래 기록이 영구 삭제되며 되돌릴 수 없습니다.</p>
        <ul className="ml-5 list-disc space-y-1 text-ink-soft">
          {isPastor && <li>내가 보관한 설교 전체</li>}
          <li>내가 작성한 간증·댓글</li>
          <li>북마크·팔로우·프로필 정보</li>
        </ul>
        <p className="text-xs text-ink-faint">
          씨앗 활동 내역 등 일부 기록은 익명 처리되어 통계 목적으로 남을 수
          있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Field label="비밀번호 확인" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="본인 확인을 위해 비밀번호를 입력하세요"
          />
        </Field>
        <Field
          label={`확인을 위해 "${CONFIRM_WORD}"를 입력하세요`}
          required
        >
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          variant="danger"
          size="lg"
          loading={busy}
          disabled={!ready}
          className="w-full"
        >
          영구 탈퇴하기
        </Button>
      </form>
    </section>
  );
}
