"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Textarea } from "@/shared/components/ui/Field";
import { ROUTES } from "@/shared/constants/routes";
import type { SignupRole } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { cn } from "@/shared/utils/cn";
import { useAuth } from "../hooks/AuthProvider";
import { signup, validateUsername } from "../services/authService";

const ROLE_OPTIONS: Array<{
  value: SignupRole;
  title: string;
  description: string;
}> = [
  {
    value: "member",
    title: "일반회원",
    description: "간증을 기록하고 설교를 읽습니다",
  },
  {
    value: "pastor",
    title: "목회자",
    description: "인증 후 설교를 보관합니다",
  },
];

export function SignupForm() {
  const router = useRouter();
  const { user: currentUser, initializing } = useAuth();
  const [role, setRole] = useState<SignupRole>("member");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [agreements, setAgreements] = useState({
    age14: false,
    terms: false,
    privacy: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAgreed = agreements.age14 && agreements.terms && agreements.privacy;

  // 이미 로그인된 상태면 홈으로
  useEffect(() => {
    if (!initializing && currentUser && !submitting) {
      router.replace(ROUTES.home);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializing, currentUser]);

  const toggleAll = (checked: boolean) => {
    setAgreements({ age14: checked, terms: checked, privacy: checked });
  };

  const handleUsernameChange = (value: string) => {
    const normalized = value.toLowerCase();
    setUsername(normalized);
    setUsernameError(normalized ? validateUsername(normalized) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name, username, email, password, role, photoFile, bio });
      router.push(role === "pastor" ? ROUTES.pastorApply : ROUTES.home);
    } catch (err) {
      setError(toUserMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              role === option.value
                ? "border-accent bg-accent-soft"
                : "border-line bg-white hover:border-ink-faint",
            )}
          >
            <span className="block font-semibold text-ink">{option.title}</span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
              {option.description}
            </span>
          </button>
        ))}
      </div>

      <Field label="이름" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={30}
          placeholder="홍길동"
        />
      </Field>

      <Field
        label="Username"
        required
        error={usernameError}
        hint="영문 소문자·숫자·밑줄 3~20자. ark.kr/@username 주소로 사용되며 변경이 어렵습니다."
      >
        <Input
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          required
          placeholder="username"
          autoComplete="off"
        />
      </Field>

      <Field label="이메일" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>

      <Field label="비밀번호" required hint="6자 이상">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>

      <Field label="프로필 사진 (선택)">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
      </Field>

      <Field label="한 줄 소개 (선택)">
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          maxLength={100}
          placeholder="자신을 한 줄로 소개해주세요"
        />
      </Field>

      <fieldset className="rounded-xl border border-line bg-white p-4">
        <label className="flex items-center gap-2.5 border-b border-line pb-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={(e) => toggleAll(e.target.checked)}
            className="size-4 accent-accent"
          />
          전체 동의
        </label>
        <div className="mt-3 space-y-2.5">
          <ConsentRow
            checked={agreements.age14}
            onChange={(v) => setAgreements((a) => ({ ...a, age14: v }))}
            label="만 14세 이상입니다"
          />
          <ConsentRow
            checked={agreements.terms}
            onChange={(v) => setAgreements((a) => ({ ...a, terms: v }))}
            label="이용약관 동의"
            href={ROUTES.terms}
          />
          <ConsentRow
            checked={agreements.privacy}
            onChange={(v) => setAgreements((a) => ({ ...a, privacy: v }))}
            label="개인정보 수집·이용 동의"
            href={ROUTES.privacy}
          />
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        disabled={Boolean(usernameError) || !allAgreed}
        className="w-full"
      >
        {role === "pastor" ? "가입하고 목회자 인증 신청하기" : "가입하기"}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        이미 계정이 있으신가요?{" "}
        <Link href={ROUTES.login} className="font-medium text-accent underline">
          로그인
        </Link>
      </p>
    </form>
  );
}

function ConsentRow({
  checked,
  onChange,
  label,
  href,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="flex items-center gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 accent-accent"
        />
        <span>
          <span className="mr-1 text-xs font-medium text-accent">[필수]</span>
          {label}
        </span>
      </label>
      {href && (
        <Link
          href={href}
          target="_blank"
          className="shrink-0 text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
        >
          보기
        </Link>
      )}
    </div>
  );
}
