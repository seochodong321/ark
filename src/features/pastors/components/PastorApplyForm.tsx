"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/shared/components/ui/Field";
import {
  EmptyState,
  LoadingState,
} from "@/shared/components/ui/StateView";
import { ROUTES } from "@/shared/constants/routes";
import { profilePhotoPath, uploadImage } from "@/shared/firebase/storage";
import {
  ORGANIZATION_TYPE_LABEL,
  PASTOR_STATUS_LABEL,
  type ApplicantType,
  type OrganizationType,
  type PastorProfile,
  type PositionCategory,
} from "@/shared/types";
import { cn } from "@/shared/utils/cn";
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
  const [applicantType, setApplicantType] =
    useState<ApplicantType>("individual");
  const [positionCategory, setPositionCategory] =
    useState<PositionCategory>("evangelist");
  const [positionOther, setPositionOther] = useState("");
  const [organizationType, setOrganizationType] =
    useState<OrganizationType>("church");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ministryFieldsRaw, setMinistryFieldsRaw] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
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
      const isOrg = applicantType === "organization";
      const position = isOrg
        ? ""
        : positionCategory === "other"
          ? positionOther.trim()
          : positionCategory === "pastor"
            ? "목사"
            : "전도사";
      await submitPastorApplication(user, {
        name: user.name,
        applicantType,
        phone,
        churchName,
        denomination,
        position,
        positionCategory: isOrg ? "other" : positionCategory,
        organizationType: isOrg ? organizationType : null,
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
          {applicantType === "organization"
            ? "게시물에는 위 계정 이름이 작성자(교회·단체명)로 표시됩니다."
            : "이름·Username·이메일은 계정 정보를 사용합니다."}
        </p>
      </div>

      <Field label="인증 유형" required>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "individual", title: "개인 목회자", desc: "전도사·목사 등" },
              { value: "organization", title: "교회·단체", desc: "교회·매체·선교단체" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setApplicantType(option.value)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                applicantType === option.value
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-white hover:border-ink-faint",
              )}
            >
              <span className="block font-semibold text-ink">
                {option.title}
              </span>
              <span className="mt-1 block text-xs text-ink-soft">
                {option.desc}
              </span>
            </button>
          ))}
        </div>
      </Field>

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
        <Field
          label={applicantType === "organization" ? "단체·교회명" : "교회명"}
          required
        >
          <Input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            required
            placeholder={
              applicantType === "organization" ? "예: OO교회 월간지" : "OO교회"
            }
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

      {applicantType === "organization" ? (
        <Field label="단체 유형" required>
          <Select
            value={organizationType}
            onChange={(e) =>
              setOrganizationType(e.target.value as OrganizationType)
            }
          >
            {Object.entries(ORGANIZATION_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <>
          <Field
            label="직분"
            required
            hint="겸직이거나 그 외 직분이면 '기타'를 선택해 직접 입력하세요"
          >
            <Select
              value={positionCategory}
              onChange={(e) =>
                setPositionCategory(e.target.value as PositionCategory)
              }
            >
              <option value="evangelist">전도사</option>
              <option value="pastor">목사</option>
              <option value="other">기타 (직접 입력)</option>
            </Select>
          </Field>

          {positionCategory === "other" && (
            <Field label="직분 직접 입력" required>
              <Input
                value={positionOther}
                onChange={(e) => setPositionOther(e.target.value)}
                required
                maxLength={40}
                placeholder="예: 담임목사 겸 선교사"
              />
            </Field>
          )}
        </>
      )}

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

      <label className="flex items-start gap-2.5 rounded-xl border border-line bg-white p-4 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={privacyConsent}
          onChange={(e) => setPrivacyConsent(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-accent"
        />
        <span>
          <span className="mr-1 text-xs font-medium text-accent">[필수]</span>
          인증 심사를 위한 개인정보(휴대전화·교회 정보 등) 수집·이용에
          동의합니다.{" "}
          <a
            href={ROUTES.privacy}
            target="_blank"
            className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
          >
            개인정보처리방침 보기
          </a>
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        disabled={!privacyConsent}
        className="w-full"
      >
        인증 신청하기
      </Button>
    </form>
  );
}
