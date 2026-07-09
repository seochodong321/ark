"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Textarea } from "@/shared/components/ui/Field";
import { ROUTES } from "@/shared/constants/routes";
import type { SignupRole } from "@/shared/types";
import { toUserMessage } from "@/shared/utils/errors";
import { cn } from "@/shared/utils/cn";
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
  const [role, setRole] = useState<SignupRole>("member");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        disabled={Boolean(usernameError)}
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
