"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Textarea } from "@/shared/components/ui/Field";
import {
  EmptyState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { profilePhotoPath, uploadImage } from "@/shared/firebase/storage";
import { PASTOR_STATUS_LABEL, type PastorProfile } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { parseTags } from "@/shared/utils/text";
import {
  fetchPastorProfile,
  submitPastorApplication,
} from "../repositories/pastorRepository";

export function PastorApplyForm() {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const [existing, setExisting] = useState<PastorProfile | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [phone, setPhone] = useState("");
  const [churchName, setChurchName] = useState("");
  const [denomination, setDenomination] = useState("");
  const [position, setPosition] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ministryFieldsRaw, setMinistryFieldsRaw] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      router.replace(ROUTES.login);
      return;
    }
    fetchPastorProfile(user.uid)
      .then(setExisting)
      .finally(() => setCheckingExisting(false));
  }, [user, initializing, router]);

  if (initializing || checkingExisting) return <LoadingState />;
  if (!user) return null;

  if (user.role === "pastor") {
    return (
      <EmptyState
        title="이미 인증된 목회자입니다"
        description="지금 바로 설교를 보관할 수 있습니다."
        action={
          <Button onClick={() => router.push(ROUTES.migration)}>
            설교 보관하기
          </Button>
        }
      />
    );
  }

  if ((existing && existing.status === "pending") || done) {
    return (
      <EmptyState
        title="인증 신청이 접수되었습니다"
        description="관리자 검토 후 승인 결과를 알려드립니다. 승인 전에도 설교와 간증을 읽을 수 있습니다."
      />
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const photoUrl = photoFile
        ? await uploadImage(profilePhotoPath(user.uid), photoFile)
        : user.photoUrl;
      await submitPastorApplication(user, {
        name: user.name,
        phone,
        churchName,
        denomination,
        position,
        websiteUrl: websiteUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
        introduction,
        photoUrl,
        ministryFields: parseTags(ministryFieldsRaw),
      });
      setDone(true);
    } catch (err) {
      setError(toUserMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {existing?.status === "rejected" && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <Badge tone="danger" className="mb-1">
            {PASTOR_STATUS_LABEL.rejected}
          </Badge>
          <p>이전 신청이 반려되었습니다. 내용을 보완하여 다시 신청할 수 있습니다.</p>
        </div>
      )}

      <div className="rounded-lg bg-paper-warm p-4 text-sm text-ink-soft">
        <p>
          <span className="font-medium text-ink">{user.name}</span> (@
          {user.username}) · {user.email}
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          이름·Username·이메일은 계정 정보를 사용합니다.
        </p>
      </div>

      <Field label="휴대전화" required>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="010-0000-0000"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="교회명" required>
          <Input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            required
            placeholder="OO교회"
          />
        </Field>
        <Field label="소속 교단" required>
          <Input
            value={denomination}
            onChange={(e) => setDenomination(e.target.value)}
            required
            placeholder="예: 대한예수교장로회(통합)"
          />
        </Field>
      </div>

      <Field label="직분" required>
        <Input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          placeholder="예: 담임목사"
        />
      </Field>

      <Field label="공식 홈페이지 (선택)">
        <Input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://"
        />
      </Field>

      <Field label="유튜브 채널 (선택)">
        <Input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/@channel"
        />
      </Field>

      <Field label="사역 분야 (선택)" hint="쉼표로 구분 (예: 설교, 청년사역, 제자훈련)">
        <Input
          value={ministryFieldsRaw}
          onChange={(e) => setMinistryFieldsRaw(e.target.value)}
          placeholder="설교, 청년사역"
        />
      </Field>

      <Field label="자기소개" required>
        <Textarea
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          required
          rows={5}
          maxLength={1000}
          placeholder="사역 이력과 소개를 작성해주세요. 관리자 승인 심사에 사용됩니다."
        />
      </Field>

      <Field label="프로필 사진">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        인증 신청하기
      </Button>
    </form>
  );
}
