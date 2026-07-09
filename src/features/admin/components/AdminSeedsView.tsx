"use client";

import { useState, type FormEvent } from "react";
import { fetchUserByUsername } from "@/features/auth/repositories/userRepository";
import { grantSeeds } from "@/features/seeds/repositories/seedRepository";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input } from "@/shared/components/ui/Field";
import { toUserMessage } from "@/shared/utils/errors";

/** 운영 이벤트 씨앗 지급 */
export function AdminSeedsView() {
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState(10);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const target = await fetchUserByUsername(
        username.trim().replace(/^@/, ""),
      );
      if (!target) {
        throw new Error("해당 Username의 사용자를 찾을 수 없습니다.");
      }
      if (amount <= 0) {
        throw new Error("지급 수량은 1 이상이어야 합니다.");
      }
      await grantSeeds({
        uid: target.uid,
        amount,
        type: "event",
        memo: memo.trim() || "운영 이벤트 보상",
      });
      setSuccess(`${target.name}(@${target.username}) 님에게 씨앗 ${amount}개를 지급했습니다.`);
      setUsername("");
      setMemo("");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <Field label="Username" required hint="@ 없이 입력해도 됩니다">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="username"
        />
      </Field>
      <Field label="지급 수량" required>
        <Input
          type="number"
          min={1}
          max={1000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
      </Field>
      <Field label="지급 사유">
        <Input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={100}
          placeholder="예: 2026 여름 기록 캠페인"
        />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-accent-strong">{success}</p>}
      <Button type="submit" loading={submitting}>
        씨앗 지급하기
      </Button>
    </form>
  );
}
