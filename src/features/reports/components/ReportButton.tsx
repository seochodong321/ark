"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { Button } from "@/shared/components/ui/Button";
import { Field, Select, Textarea } from "@/shared/components/ui/Field";
import { Modal } from "@/shared/components/ui/Modal";
import { ROUTES } from "@/shared/constants/routes";
import {
  REPORT_REASON_LABEL,
  type ContentType,
  type ReportReason,
} from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { submitReport } from "../repositories/reportRepository";

interface ReportButtonProps {
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
}

export function ReportButton({
  targetType,
  targetId,
  targetTitle,
}: ReportButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("heresy");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleOpen = () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport({
        targetType,
        targetId,
        targetTitle,
        reporterId: user.uid,
        reason,
        detail,
      });
      setDone(true);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs text-ink-faint underline underline-offset-2 hover:text-red-700"
      >
        신고
      </button>
      <Modal open={open} title="콘텐츠 신고" onClose={() => setOpen(false)}>
        {done ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-ink-soft">
              신고가 접수되었습니다. 관리자가 검토 후 조치합니다. 신뢰할 수 있는
              아카이브를 만드는 데 도움을 주셔서 감사합니다.
            </p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="신고 사유" required>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
              >
                {Object.entries(REPORT_REASON_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="상세 내용">
              <Textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="신고 사유를 구체적으로 적어주시면 검토에 도움이 됩니다."
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={submitting} className="w-full">
              신고하기
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
