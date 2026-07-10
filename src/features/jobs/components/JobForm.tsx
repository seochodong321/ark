"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchPastorProfile } from "@/features/pastors/repositories/pastorRepository";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Textarea } from "@/shared/components/ui/Field";
import type { JobInput, JobPost, User } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";

interface JobFormProps {
  author: User;
  initial?: JobPost;
  onSave: (input: JobInput) => Promise<void>;
}

export function JobForm({ author, initial, onSave }: JobFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [churchName, setChurchName] = useState(initial?.churchName ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [employmentType, setEmploymentType] = useState(
    initial?.employmentType ?? "",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 신규 작성 시 목회자 프로필의 교회명을 미리 채운다
  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    fetchPastorProfile(author.uid)
      .then((profile) => {
        if (!cancelled && profile?.churchName) {
          setChurchName((prev) => prev || profile.churchName);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [author.uid, initial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        churchName: churchName.trim(),
        position: position.trim(),
        region: region.trim(),
        employmentType: employmentType.trim() || null,
        description: description.trim(),
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        deadline: deadline || null,
      });
    } catch (err) {
      setError(toUserMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="공고 제목" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={80}
          placeholder="예: 청년부 담당 전도사를 모십니다"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="교회명" required>
          <Input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            required
            maxLength={50}
          />
        </Field>
        <Field label="모집 직분·분야" required>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
            maxLength={30}
            placeholder="예: 전도사, 찬양 사역자"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="사역 지역" required>
          <Input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
            maxLength={30}
            placeholder="예: 서울 강남구"
          />
        </Field>
        <Field label="고용 형태">
          <Input
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            maxLength={20}
            placeholder="예: 전임, 파트타임"
          />
        </Field>
        <Field label="마감일" hint="비워두면 충원 시까지">
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="상세 내용"
        required
        hint="사역 내용, 자격 요건, 처우, 지원 방법 등. Markdown 사용 가능"
      >
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={12}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="지원 이메일" hint="공고에 공개됩니다">
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="apply@church.kr"
          />
        </Field>
        <Field label="지원 전화" hint="공고에 공개됩니다">
          <Input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="02-000-0000"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end border-t border-line pt-5">
        <Button type="submit" size="lg" loading={submitting}>
          {initial ? "수정 내용 저장" : "공고 게시하기"}
        </Button>
      </div>
    </form>
  );
}
