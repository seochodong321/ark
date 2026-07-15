import type { Metadata } from "next";
import {
  LegalDocument,
  type LegalSection,
} from "@/shared/components/legal/LegalDocument";
import { LEGAL_EFFECTIVE_DATE, SITE_NAME } from "@/shared/constants/site";

export const metadata: Metadata = {
  title: "개인정보처리방침 — ARK",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "1. 수집하는 개인정보의 항목과 방법",
    body: (
      <ul className="space-y-1">
        <li>
          <strong>회원가입(필수)</strong>: 이름, Username, 이메일, 비밀번호
        </li>
        <li>
          <strong>회원가입(선택)</strong>: 프로필 사진, 한 줄 소개
        </li>
        <li>
          <strong>목회자 인증 신청</strong>: 휴대전화 번호, 교회명, 소속 교단,
          직분, 자기소개, (선택) 공식 홈페이지·유튜브 채널 주소
        </li>
        <li>
          <strong>채용 공고 작성(선택)</strong>: 지원 연락처(이메일·전화)
        </li>
        <li>
          <strong>자동 수집</strong>: 서비스 이용 기록(콘텐츠 조회·활동 내역)
        </li>
      </ul>
    ),
  },
  {
    heading: "2. 개인정보의 수집·이용 목적",
    body: (
      <ul className="space-y-1">
        <li>회원 식별, 계정 관리, 서비스 제공</li>
        <li>목회자 인증 심사 (신뢰할 수 있는 아카이브 운영)</li>
        <li>문의·신고 대응, 공지 전달</li>
        <li>부정 이용 방지</li>
      </ul>
    ),
  },
  {
    heading: "3. 보유 및 이용 기간",
    body: (
      <p>
        회원 탈퇴 시 지체 없이 파기합니다. 다만 관계 법령에 따라 보존이 필요한
        경우 해당 기간 동안 보관합니다(예: 통신비밀보호법상 접속 기록 3개월).
        공개를 선택한 콘텐츠는 탈퇴 시 처리 방법을 별도로 확인합니다.
      </p>
    ),
  },
  {
    heading: "4. 개인정보 처리의 위탁 및 국외 이전",
    body: (
      <>
        <p>
          {SITE_NAME}는 서비스 제공을 위해 아래와 같이 개인정보 처리를
          위탁하며, 데이터가 국외 서버에 저장됩니다.
        </p>
        <ul className="mt-2 space-y-1">
          <li>
            <strong>Google LLC (Firebase)</strong> — 인증·데이터베이스·파일
            저장. 저장 위치: Google Cloud 리전(미국 등). 보유 기간: 회원 탈퇴
            또는 위탁 계약 종료 시까지
          </li>
          <li>
            <strong>Vercel Inc.</strong> — 웹 호스팅 및 콘텐츠 전송. 저장
            위치: 미국 등 Vercel 인프라
          </li>
        </ul>
        <p className="mt-2">
          이용자는 국외 이전을 거부할 수 있으나, 이 경우 서비스 이용이
          불가능합니다.
        </p>
      </>
    ),
  },
  {
    heading: "5. 제3자 제공",
    body: (
      <p>
        수집한 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거한
        수사기관의 적법한 요청이 있는 경우는 예외로 합니다. 회원이 직접 공개를
        선택한 정보(프로필, 공개 콘텐츠, 채용 공고의 연락처)는 서비스 이용자에게
        공개됩니다.
      </p>
    ),
  },
  {
    heading: "6. 이용자의 권리",
    body: (
      <p>
        이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를
        요구할 수 있습니다. 프로필 정보는 서비스 내에서 직접 수정할 수 있고,
        회원 탈퇴는 계정 설정에서 직접 진행할 수 있습니다. 만 14세 미만 아동의
        개인정보는 수집하지 않습니다.
      </p>
    ),
  },
  {
    heading: "7. 개인정보의 파기",
    body: (
      <p>
        보유 기간이 지나거나 처리 목적이 달성된 개인정보는 재생할 수 없는
        방법으로 지체 없이 파기합니다.
      </p>
    ),
  },
  {
    heading: "8. 안전성 확보 조치",
    body: (
      <ul className="space-y-1">
        <li>전송 구간 암호화(HTTPS) 및 비밀번호 단방향 암호화 저장</li>
        <li>
          Firebase 보안 규칙 기반 접근 통제 — 비공개 콘텐츠와 개인정보는
          본인·관리자만 접근 가능
        </li>
        <li>관리자 권한 최소화</li>
      </ul>
    ),
  },
  {
    heading: "9. 개인정보 보호책임자 및 문의처",
    body: (
      <p>
        개인정보 보호책임자: {SITE_NAME} 운영자 (문의 창구는 준비 중입니다.)
        <br />
        개인정보 침해 신고는 개인정보침해신고센터(privacy.kisa.or.kr,
        국번없이 118)에 문의할 수 있습니다.
      </p>
    ),
  },
  {
    heading: "10. 고지 의무",
    body: (
      <p>
        이 방침의 내용이 변경되는 경우 시행일 7일 전부터 서비스 내 공지를 통해
        알립니다.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="개인정보처리방침"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      intro={`${SITE_NAME}는 개인정보보호법 등 관계 법령을 준수하며, 이용자의 개인정보를 아래와 같이 처리합니다.`}
      sections={SECTIONS}
    />
  );
}
