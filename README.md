# ARK

> **신앙의 기록을 보존하는 디지털 아카이브**
>
> 🌐 서비스: https://ark-ochre.vercel.app

이 문서는 ARK 프로젝트의 **Single Source of Truth**입니다.
기능이나 구조가 변경되면 이 문서를 함께 수정합니다. README와 실제 구현은 항상 일치해야 합니다.

---

## 1. 프로젝트 소개

ARK는 설교와 간증이라는 신앙의 기록을 다음 세대까지 보존하는 **디지털 아카이브**입니다.

첫 번째 고객은 성도가 아니라 **목회자**입니다. 수십 년 동안 작성한 설교는 Word 문서, USB,
외장하드, Google Drive 등에 흩어져 있습니다. ARK는 이 설교들을 가장 쉽고 안전하게
이전(Migration)하여 평생 보관하고, 누구나 다시 찾을 수 있도록 만듭니다.

## 2. 서비스 철학

- ARK는 크리스천 커뮤니티(SNS)가 아닙니다. 사람들이 오래 머무는 서비스가 아니라 **기록이 오래 남는 서비스**를 만듭니다.
- 모든 기능은 하나의 질문으로 판단합니다: **"이 기능이 설교와 간증을 더 쉽고 오래 보존하도록 만드는가?"**
- 속도보다 구조를 우선하고, 임시 해결책보다 유지보수 가능한 설계를 선택합니다.
- MVP에 명시되지 않은 기능은 구현하지 않습니다. 확장 가능한 구조만 설계합니다.

### AI 정책

AI는 설교·간증·기도문을 **작성하지 않으며**, 사용자의 원문을 임의로 수정하지 않습니다.
AI(자동화)는 문서 분석, 메타데이터 추출, 검색 품질 향상, 업로드 자동화 지원만 수행합니다.

### 신뢰 정책

- 설교는 **인증된 목회자만** 등록할 수 있습니다.
- 모든 콘텐츠에 신고 기능을 제공하고, 관리자가 검토하여 비공개/삭제합니다.
- 명백한 이단·사이비 단체는 인증 대상에서 제외합니다.
- ARK는 특정 교단의 플랫폼이 아니라 신뢰할 수 있는 신앙 아카이브를 지향합니다.

## 3. 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router) + React 19 |
| 언어 | TypeScript (strict, `any` 금지) |
| 스타일 | Tailwind CSS v4 (텍스트 중심 읽기 경험, Noto Sans/Serif KR) |
| 인증 | Firebase Authentication (이메일 기반, 소셜 로그인 확장 지점 설계) |
| 데이터 | Cloud Firestore (Repository 계층 경유) |
| 파일 | Firebase Storage (프로필/대표 이미지) |
| 문서 파싱 | mammoth(DOCX), JSZip(ZIP) — 전부 클라이언트에서 수행 |
| 본문 렌더링 | react-markdown + remark-gfm + remark-breaks (raw HTML 미허용) |
| 배포 | Vercel |

## 4. 프로젝트 구조 (Feature-based Architecture)

```
src/
├── app/                      # 라우팅 전용 (App Router)
│   ├── page.tsx              # 홈 (Hero + 검색 + 큐레이션 섹션)
│   ├── login/ signup/        # 인증
│   ├── sermons/              # 목록·상세·작성(new)·수정(edit)
│   ├── testimonies/          # 목록·상세·작성·수정
│   ├── migration/            # Migration Wizard
│   ├── search/               # 검색
│   ├── archive/              # 내 아카이브 (Draft 관리)
│   ├── bookmarks/ seeds/     # 북마크 목록 / 씨앗 내역
│   ├── pastor/apply/         # 목회자 인증 신청
│   ├── admin/                # 관리자 (승인/신고/콘텐츠/씨앗/큐레이션)
│   └── [username]/           # ark.kr/@username 목회자 페이지
├── features/                 # 기능 단위 모듈 (UI + 비즈니스 로직)
│   ├── auth/                 #   ├ components/  (화면 조각)
│   ├── pastors/              #   ├ hooks/       (상태)
│   ├── sermons/              #   ├ repositories/(Firestore 접근 — 유일한 통로)
│   ├── testimonies/          #   └ services/    (파서·검색 등 순수 로직)
│   ├── migration/
│   ├── comments/ bookmarks/
│   ├── seeds/ reports/
│   ├── search/ curation/
│   ├── archive/ home/ admin/
└── shared/                   # 공통 계층
    ├── components/ui/        # Button, Field, Modal, StateView, MarkdownView …
    ├── components/layout/    # Header, Footer
    ├── firebase/             # client(지연 초기화), collections, converters, pagination
    ├── constants/            # routes, seeds, bibleBooks, reservedUsernames
    ├── hooks/                # usePagedList (커서 페이지네이션)
    ├── types/                # 도메인 타입 (TypeScript 우선 설계)
    └── utils/                # date, text, youtube, errors, cn, array
```

**아키텍처 원칙**
- Firebase 접근은 반드시 `repositories/`를 통합니다. 컴포넌트에서 Firestore를 직접 호출하지 않습니다.
- Repository 경계 밖으로는 Firebase 타입 대신 도메인 타입(`shared/types`)만 노출합니다. (Timestamp → epoch millis)
- Server Component는 라우팅/정적 셸, Client Component는 데이터 로딩/상호작용을 담당합니다.
- 비즈니스 로직은 `services/`에, 화면은 `components/`에 둡니다.
- 목록 화면은 커서 기반 Pagination(`usePagedList` + `LoadMore`)이 기본이며, Loading / Empty / Error / Success 4가지 상태를 반드시 구현합니다.

## 5. PRD 요약

- **슬로건**: 신앙의 기록을 보존하는 디지털 아카이브
- **Hero 카피**: "당신의 설교는 이번 주만을 위한 말씀이 아닙니다. 다음 세대가 다시 찾을 기록입니다."
- **CTA**: 설교 보관하기(Migration) / 설교 읽기
- **MVP 범위**: 회원가입, 로그인, 목회자 인증, 설교 업로드, Migration Wizard, 개인 설교 아카이브, 간증 작성, 검색, 댓글, 북마크, 씨앗, 관리자 페이지
- **MVP 제외**: 결제, 후원, 환전, 광고, 팔로우, 추천 알고리즘, 실시간 채팅, 모바일 앱, HWP 지원

## 6. 기능 명세

### 회원 (auth)
- 이메일 기반 회원가입/로그인. 가입 시 **Member / Pastor** 중 선택.
- 입력: 이름, Username, 이메일, 비밀번호, 프로필 사진(선택), 한 줄 소개(선택).
- Username은 서비스 전체에서 유일하며 URL(`/@username`)로 사용. 영문 소문자·숫자·밑줄 3~20자, 예약어 금지(`shared/constants/reservedUsernames.ts`), 변경 불가로 설계.
- 유일성 보장: `usernames/{username}` 매핑 문서를 사용자 문서와 **동일 트랜잭션**으로 생성.
- 가입 보상 씨앗 +10 (동일 트랜잭션). 프로필 생성 실패 시 auth 계정 롤백(고아 계정 방지).
- 소셜 로그인(Google/Apple/Kakao)은 `authService`에 확장 지점만 설계.

### 목회자 인증 (pastors)
- Pastor로 가입하면 `pastorPending` 권한 → `/pastor/apply`에서 신청서 제출.
- 신청 항목: 이름, Username, 이메일(계정 정보 사용), 휴대전화, 교회명, 소속 교단, 직분, 공식 홈페이지(선택), 유튜브 채널(선택), 사역 분야(선택), 자기소개, 프로필 사진.
- 관리자 승인 시 `pastor` 권한 + 알림 생성. 반려 시 사유와 함께 재신청 가능.
- **설교 작성 권한은 pastor(및 admin)만** 보유.

### 설교 업로드 (sermons)
- 지원 파일: **DOCX, Markdown, TXT** (HWP 미지원 — 안내 문구 제공).
- 파일 업로드 시 제목·설교 날짜·성경 본문·본문을 자동 추출해 Draft 생성 (`documentParser`).
  - 날짜: 본문 상단/파일명에서 `2023-01-01`, `2023년 1월 5일`, `20230101` 등 패턴 인식.
  - 성경 본문: 성경 66권 정식 명칭 + 축약 표기(창, 롬, 고전 …) 패턴 인식. 책 이름은 `scriptureBook` 필드로 분리 저장(탐색 필터용).
  - 본문 원문은 파서가 수정하지 않고 그대로 보존.
- 입력 항목: 제목, 설교 날짜, 성경 본문, 본문, 태그, 시리즈명(선택), 대표 이미지(선택), 유튜브 링크(선택).
- 유튜브 링크에서 영상 ID를 추출해 임베드 플레이어 제공, "유튜브에서 보기" 링크 상시 제공.
- 모든 설교는 **Draft → 게시** 흐름. 최초 게시 시 씨앗 +5 (재게시 중복 지급 방지).

### Migration Wizard (migration) — 대표 기능
1. **파일 선택**: 여러 파일 또는 ZIP 드래그&드롭 (ZIP은 클라이언트에서 해제, `__MACOSX`/숨김 파일 제외).
2. **분석**: 전 파일 파싱 → 즉시 Draft로 저장 (검토 중 이탈해도 기록 보존).
3. **검토**: 제목/날짜/성경 본문 인라인 수정, 게시 제외 선택(제외분은 Draft로 유지).
4. **일괄 게시**: batch 커밋(400개 단위 청크) + 씨앗 일괄 보상.
5. **완료 화면**: 총 설교 수, 첫 설교 날짜, 최신 설교 날짜, 총 사역 기간.

### 목회자 페이지 (`/@username`)
- 이름, 프로필, 소개, 교회, 직분, 교단, 사역 분야, **설교 개수, 사역 기간**(집계 쿼리로 계산).
- 설교 탐색: 최신순 / 오래된순 / 연도별 / 성경본문별 / 태그별.
- 일반회원 페이지는 공개 간증 목록을 노출.

### 간증 (testimonies)
- 일반회원이 Markdown 에디터로 작성 (작성/미리보기 탭).
- **자동 저장(Draft)**: 입력 멈춤 2.5초 후 자동 저장, 상태 표시.
- 게시 시 씨앗 +3. 간증도 검색 대상.

### 검색 (search)
- 대상: 제목, 본문, 작성자, 성경 본문, 태그.
- 방식: 저장 시 `searchKeywords` 토큰 배열 색인(제목·작성자 등 가중 필드는 접두사까지, 본문은 토큰만)
  → `array-contains-any` 쿼리 → 클라이언트 관련성 점수 정렬(매칭 토큰 수 > 제목 포함 > 태그/작성자 일치 > 조회수).
- Full-text Search(Algolia 등) 교체 시 `searchService`/`tokenizer`만 수정하면 되는 구조.

### 댓글 (comments)
- 설교·간증에 CRUD. 작성/삭제 시 대상 문서의 `commentCount`를 batch로 증감.

### 북마크 (bookmarks)
- 문서 ID를 `{uid}_{targetType}_{targetId}`로 고정해 중복 방지.
- 목록 화면용으로 제목/작성자 비정규화 저장 (추가 Read 없음).

### 씨앗 (seeds) — 무료 활동 포인트
- 획득: 회원가입 +10, 설교 등록 +5, 간증 등록 +3, 운영 이벤트(관리자 지급).
- 사용: 설교/간증 응원 1개. 잔액 차감 + 콘텐츠 `seedCount` 증가 + 거래 기록을 **단일 트랜잭션**으로 처리.
- 환전 불가. 정책 수치는 `shared/constants/seeds.ts`에서만 관리.

### 신고 (reports)
- 사유: 이단·사이비, 허위 정보, 저작권, 비방, 스팸, 기타.
- 관리자 처리: 기각 / 콘텐츠 비공개 / 삭제 (신고 상태 변경과 원자적 처리).

### 홈 (home)
- 검색 중심 Hero + CTA 2개.
- 섹션: 운영자 큐레이션(추천 설교), 최신 설교, 최신 간증, 많이 읽힌 기록(조회수 기준).

### 관리자 (admin) — `/admin`
- 목회자 승인/반려, 신고 처리, 콘텐츠 관리(비공개/삭제), 씨앗 지급, 메인 큐레이션.
- admin 권한은 Firebase Console에서 `users/{uid}.role = "admin"`으로 수동 부여.

## 7. 데이터 구조 (Firestore)

| 컬렉션 | 문서 ID | 핵심 필드 |
| --- | --- | --- |
| `users` | uid | name, username, email, photoUrl, bio, **role**(member/pastorPending/pastor/admin), seedBalance, createdAt, updatedAt |
| `usernames` | username | uid — Username 유일성 보장용 매핑 |
| `pastors` | uid | 신청서+프로필: churchName, denomination, position, phone, websiteUrl, youtubeUrl, introduction, ministryFields[], **status**(pending/approved/rejected), appliedAt, reviewedAt |
| `sermons` | auto | authorId, authorName·authorUsername(비정규화), title, sermonDate(YYYY-MM-DD), scripture, scriptureBook, body, tags[], series, coverImageUrl, youtubeVideoId, **status**(draft/published/hidden), viewCount, seedCount, commentCount, searchKeywords[], publishedAt |
| `testimonies` | auto | sermons와 동일 구조에서 scripture/series 제외 |
| `comments` | auto | targetType, targetId, authorId, authorName, body, createdAt |
| `bookmarks` | `{uid}_{type}_{id}` | uid, targetType, targetId, targetTitle, targetAuthorName |
| `reports` | auto | targetType, targetId, targetTitle, reporterId, reason, detail, **status**(pending/resolved/dismissed), resolutionNote |
| `seedTransactions` | auto | uid, amount(±), type(signup/sermonPublish/testimonyPublish/event/cheer/adminGrant), targetType, targetId, memo |
| `notifications` | auto | uid, type, message, linkUrl, read |
| `settings` | curation | sermonIds[](노출 순서), headline |

- 시간 필드는 Firestore `Timestamp`로 저장하고, Repository에서 epoch millis(number)로 변환해 노출합니다.
- 보안 규칙: [firestore.rules](firestore.rules) / 복합 인덱스: [firestore.indexes.json](firestore.indexes.json) / Storage 규칙: [storage.rules](storage.rules)

## 8. 개발 일정 (TODO)

### 완료 (MVP)
- [x] 프로젝트 스캐폴딩, 디자인 토큰, 공통 UI/상태 컴포넌트
- [x] 회원가입/로그인, Username 유일성, 가입 보상
- [x] 목회자 인증 신청 + 관리자 승인/반려
- [x] 설교 업로드(파일 자동 추출), 등록/수정/게시, 목록/상세
- [x] Migration Wizard (다중/ZIP → 분석 → Draft → 검토 → 일괄 게시 → 통계)
- [x] 목회자 페이지(@username) — 프로필, 통계, 설교 탐색 필터
- [x] 내 아카이브 (Draft 관리)
- [x] 간증 — 자동 저장 에디터, 목록/상세/수정
- [x] 검색 — 키워드 색인 + 관련성 정렬
- [x] 댓글, 북마크, 씨앗(응원/내역), 신고
- [x] 홈 — Hero, 큐레이션, 최신/인기 섹션
- [x] 관리자 — 승인/신고/콘텐츠/씨앗/큐레이션
- [x] Firestore 보안 규칙, 복합 인덱스, Storage 규칙

### 출시 체크리스트
- [x] Firebase 프로젝트 생성(`ark-69e99`) 및 `.env.local` 구성
- [x] `firebase deploy --only firestore:rules,firestore:indexes,storage` 로 규칙/인덱스 배포
- [x] 관리자 계정 role 수동 부여
- [x] Vercel 배포(https://ark-ochre.vercel.app) 및 환경 변수 설정
- [x] Firebase Authentication 승인된 도메인에 Vercel 도메인 추가

### 다음 단계
- [ ] 프로덕션 환경에서 로그인·업로드 전체 흐름 QA (목회자 가입 → 인증 → Migration → 게시 → 검색)
- [ ] 개인정보처리방침·이용약관 페이지 (목회자 인증에서 개인정보 수집)
- [ ] 첫 실사용 목회자 온보딩 및 큐레이션 구성

## 9. 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 — Firebase Console 웹 앱 값 입력
cp .env.local.example .env.local

# 3. Firebase 규칙·인덱스 배포 (Firebase CLI 필요)
firebase deploy --only firestore:rules,firestore:indexes,storage

# 4. 개발 서버
npm run dev        # http://localhost:3000

# 품질 검증
npx tsc --noEmit   # 타입 검사
npm run lint       # ESLint
npm run build      # 프로덕션 빌드
```

**Firebase 설정 요구 사항**
- Authentication → 이메일/비밀번호 로그인 활성화
- Firestore / Storage 활성화
- 관리자 지정: Firestore에서 해당 사용자의 `users/{uid}.role`을 `"admin"`으로 변경

## 10. 향후 확장 계획

구조만 설계되어 있고 MVP에서는 구현하지 않은 항목:

1. **소셜 로그인** — `authService`에 provider 확장 지점 설계됨. 최초 로그인 시 username 선택 화면 추가.
2. **Full-text Search** — `searchService`/`tokenizer` 구현만 교체 (Algolia, Meilisearch, Typesense).
3. **씨앗 무결성 강화** — 씨앗 지급/차감 로직을 Cloud Functions로 이전 (현재는 클라이언트 트랜잭션, `firestore.rules` 주석 참고).
4. **HWP 지원** — `documentParser`에 파서 추가만으로 확장 가능.
5. **알림 UI** — `notifications` 컬렉션과 타입은 준비됨 (승인/반려 알림 저장 중).
6. **RSC 데이터 페칭** — Firebase Admin SDK 도입 시 목록/상세를 Server Component로 이전해 SEO 강화.
7. **후원/결제, 팔로우, 추천 알고리즘, 모바일 앱** — PRD 명시 제외 항목. 별도 의사결정 후 진행.
