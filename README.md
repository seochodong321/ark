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

- ARK는 SNS가 아닙니다. 사람들이 오래 머무는 서비스가 아니라 **기록이 오래 남는 서비스**를 만듭니다.
- 다만 기록은 읽는 사람 속에서 다시 살아납니다. ARK는 목회자의 보관소인 동시에
  **성도가 와서 읽고, 나누는 공간**입니다 — 첫 화면은 독자를 먼저 환영합니다.
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
│   ├── bible/                #   성경 본문 인용 (참조 파서 + 개역한글 로더)
│   ├── jobs/                 #   채용 게시판 (목회자 작성 · 전체 공개)
│   ├── follows/              #   팔로우 (팔로워 수 · 홈 팔로잉 피드)
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
- **Hero 카피**: "믿음의 기록이 모이고, 다시 읽히는 곳" — 독자 우선 리포지셔닝.
  원 PRD 슬로건("다음 세대가 다시 찾을 기록")은 푸터와 서브 카피에 유지.
- **CTA**: 설교 읽기 / 간증 읽기 (주) + 목회자용 "설교 옮겨 보관하기" 링크 (부)
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
- **인증 유형(applicantType)**: 신청 단계에서 **개인 목회자 / 교회·단체** 중 선택.
  - 개인: 직분(전도사/목사/기타 직접 입력).
  - 단체: 단체 유형(교회/선교단체/신학교/매체·출판/기타). 게시물 작성자는 계정 이름(교회·매체명)으로 표시된다.
- 공통 항목: 이름, Username, 이메일(계정 정보 사용), 휴대전화, 교회·단체명, 소속 교단,
  공식 홈페이지(선택), 유튜브 채널(선택), 사역 분야(선택), 자기소개, 프로필 사진.
- **나무체크 배지**: 인증 주체 이름 옆에 배지를 표시한다.
  전도사 🌲(일반 나무) / 목사 🌳(열매 맺은 나무) / 교회·단체 ⛪. 이모지·라벨은
  `shared/types/pastor.ts`의 `AUTHOR_BADGE` 한 곳에서 관리한다(교체 용이).
  목회자·단체 페이지, 설교·간증 카드/상세에 노출되며, 설교·간증 문서에 작성자 배지를
  비정규화(`authorBadge`)해 목록에서 추가 Read 없이 표시한다. 배지 분류는
  `pastors` 프로필에서 `fetchAuthorBadge`로 산출한다(승인된 인증 주체만 배지 부여).
- 관리자 승인 시 `pastor` 권한 + 알림 생성. 반려 시 사유와 함께 재신청 가능.
- **설교 작성 권한은 pastor(및 admin)만** 보유.

### 설교 업로드 (sermons)
- 지원 파일: **DOCX, Markdown, TXT** (HWP 미지원 — 안내 문구 제공).
- **복사·붙여넣기 지원**: 파일이 없는 사용자(HWP·블로그·이메일)를 위해 텍스트 붙여넣기 입력을 제공.
  붙여넣은 텍스트도 파일과 동일한 자동 추출 파이프라인(`parseSermonText`)을 거친다.
- 파일 업로드 시 제목·설교 날짜·성경 본문·본문을 자동 추출해 Draft 생성 (`documentParser`).
  - 날짜: 본문 상단/파일명에서 `2023-01-01`, `2023년 1월 5일`, `20230101` 등 패턴 인식.
  - 성경 본문: 성경 66권 정식 명칭 + 축약 표기(창, 롬, 고전 …) 패턴 인식. 책 이름은 `scriptureBook` 필드로 분리 저장(탐색 필터용).
  - 본문 원문은 파서가 수정하지 않고 그대로 보존.
- 입력 항목: 제목, 설교 날짜, 성경 본문, 본문, 태그, 시리즈명(선택), 대표 이미지(선택), 유튜브 링크(선택).
- 유튜브 링크에서 영상 ID를 추출해 임베드 플레이어 제공, "유튜브에서 보기" 링크 상시 제공.
- **선택적 공개**: 모든 기록은 먼저 **비공개**(status: draft)로 보관된다. 작성자가 공개를
  선택한 글만 모두에게 보이며(published), 본인 아카이브에서는 전체 열람·공개↔비공개
  전환이 가능하다. 최초 공개 시 씨앗 +5 (재공개 중복 지급 방지).
- **성경 본문 자동 인용**: 설교 상세에서 성경 참조("요한복음 3:16-21", "시 23편" 등)를
  해석해 본문 말씀을 인용 블록으로 보여준다 (`features/bible`).
  - **저작권 검토 결과**: 개역개정판은 대한성서공회 저작권이 유효해 사용 불가.
    **개역한글판(1961)은 저작권 보호기간 만료(퍼블릭 도메인)**로 자유 사용 가능 — 채택.
  - 데이터: The Unbound Bible(Biola University) 공개 배포본을 책별 정적
    JSON(`public/bible/krv/1~66.json`, 총 30,625절)으로 변환해 내장.
    외부 API 의존이 없어 장기 보존에 안전하며, 책 단위 온디맨드 로드로 초기
    번들에 영향이 없다.

### Migration Wizard (migration) — 대표 기능
1. **파일 선택**: 여러 파일 또는 ZIP 드래그&드롭 (ZIP은 클라이언트에서 해제, `__MACOSX`/숨김 파일 제외).
   파일이 없으면 **텍스트 붙여넣기**로 한 편씩 반복 추가 가능 (내부적으로 `.txt` 항목으로 변환되어 동일 흐름 처리).
2. **분석**: 전 파일 파싱 → 즉시 **비공개로 저장** (검토 중 이탈해도 기록 보존).
3. **검토**: 제목/날짜/성경 본문 인라인 수정. **기본은 전체 비공개** — 공개할 설교만
   개별 선택한다. 선택하지 않은 설교는 나만 보는 기록으로 남는다.
4. **완료**: 선택분만 batch 공개(400개 단위 청크) + 씨앗 보상.
5. **완료 화면**: 총 보관 수, 공개/비공개 수, 첫·최신 설교 날짜, 총 사역 기간.

### 목회자 페이지 (`/@username`)
- 이름, 프로필, 소개, 교회, 직분, 교단, 사역 분야, **설교 개수, 사역 기간**(집계 쿼리로 계산).
- **팔로워 수 + 팔로우 버튼** (본인에게는 버튼 숨김, 목회자 페이지에만 노출).
- 설교 탐색: 최신순 / 오래된순 / 연도별 / 성경본문별 / 태그별.
- 일반회원 페이지는 공개 간증 목록을 노출. 카드·댓글의 작성자 이름은 모두 이 페이지로 연결.

### 팔로우 (follows)
- 성도가 목회자를 구독한다. `follows/{followerUid}_{pastorUid}` 결정적 ID로 중복 차단,
  자기 자신 팔로우는 규칙에서 금지.
- 팔로우/언팔로우 시 목회자의 `users.followerCount`를 같은 batch로 증감.
  **팔로잉 수는 저장·표시하지 않는다** — 팔로워 수만 공개.
- **홈 팔로잉 피드**: 로그인 + 팔로우가 있으면 홈 최상단에 "팔로우한 목회자의 새 설교"
  섹션 노출 (최근 팔로우 30명까지, `authorId in` 청크 조회 후 최신순 병합).
- 목회자 정보를 팔로우 문서에 비정규화 — 향후 "OO 목사님의 설교가 업로드되었어요"
  이메일 알림은 이 컬렉션 조회만으로 발송 대상을 얻는다 (Cloud Functions + 메일 서비스 필요).

### 간증 (testimonies)
- 일반회원이 Markdown 에디터로 작성 (작성/미리보기 탭).
- **자동 저장**: 입력 멈춤 2.5초 후 비공개로 자동 저장, 상태 표시.
- 설교와 동일한 선택적 공개 메커니즘 — 공개하기 전에는 나만 볼 수 있다.
- 최초 공개 시 씨앗 +3. 간증도 검색 대상.

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

### 응원 씨앗 (seeds) — 활동 포인트 원장(ledger)
- **원장 원칙**: 모든 증감은 `seedTransactions`에 기록을 남긴다 (잔액만 바꾸는 쓰기 금지).
  거래에는 `kind`(cheer/support) 필드가 있어 향후 후원 씨앗이 같은 원장에 합류한다.
- **획득**: 회원가입 +10, **매일 출석 +1**(로그인 후 첫 방문 시 자동, 사용자 문서의
  `lastAttendanceDate`+결정적 거래 ID로 중복 차단), 설교 최초 공개 +5, 간증 최초 공개 +3,
  **공유하기 +1**(기록당 1회 — 결정적 거래 ID `share-{uid}-{type}-{id}`로 차단), 운영 이벤트.
- **사용(응원)**: 1씨앗으로 설교/간증 응원 → 콘텐츠 `seedCount` 증가. 잔액 차감 +
  카운트 증가 + 거래 기록을 **단일 트랜잭션**으로 처리. 응원받은 기록은 홈의
  "성도들이 응원한 기록" 섹션에 추천 노출된다.
- **회수**: 보상받은 기록(공개 이력 존재)을 삭제하면 보상만큼 차감 —
  본인 삭제·관리자 삭제·신고 처리 삭제 모두 동일. **음수 잔액을 허용**해
  "공개→사용→삭제" 반복 채굴을 차단한다 (잔액이 0 미만이면 응원 불가).
- 환전 불가. 정책 수치는 `shared/constants/seeds.ts`에서만 관리.

### 신고 (reports)
- 사유: 이단·사이비, 허위 정보, 저작권, 비방, 스팸, 기타.
- 관리자 처리: 기각 / 콘텐츠 비공개 / 삭제 (신고 상태 변경과 원자적 처리).

### 홈 (home)
- 검색 중심 Hero — 독자 우선 카피, 설교/간증 읽기 CTA + 목회자용 Migration 링크.
- **설교 피드 탭**: 팔로잉 / 최신순 / 씨앗추천 / 조회순. 기본 탭은 팔로우가 있으면
  팔로잉, 없으면 최신순. 팔로잉·최신순은 홈 로딩 시 프리로드, 나머지는 탭 클릭 시
  지연 로딩 후 캐시 (탭당 8편).
- 섹션: 이번 주의 추천(운영자 큐레이션), 새로 올라온 간증, 사이드바에 성도들이
  응원한 기록·많이 읽힌 기록.
- 하단 가치 밴드: 읽다 · 나누다 · 보존하다.
- 디자인: 에디토리얼 매거진 톤 — 세리프 디스플레이 타이포, 헤어라인 구분선,
  pill 버튼, 종이 질감 배경(#fcfbf8) + 상록수 액센트(#1e5a3d) + 금박 포인트(#a97e2f).

### 채용 게시판 (jobs) — `/jobs`
- **작성은 인증된 목회자만**, 열람은 누구나 (Firestore 규칙으로 강제).
- 공고는 게시 즉시 공개. 항목: 제목, 교회명(목회자 프로필에서 자동 채움), 모집 직분·분야,
  지역, 고용 형태, 상세 내용(Markdown), 지원 연락처(선택), 마감일(선택 — 없으면 충원 시까지).
- 작성자는 마감 처리/재모집/수정/삭제 가능. 목록은 "모집 중 / 전체" 탭.

### 회원·계정 기본기
- **약관 동의**: 가입 시 [필수] 만 14세 이상·이용약관·개인정보 수집 동의 (전체 동의 지원),
  동의 시각을 사용자 문서에 기록. 목회자 인증 신청에도 개인정보 수집 동의 필수.
- **법적 문서**: `/terms`(이용약관), `/privacy`(개인정보처리방침 — Firebase/Vercel 처리 위탁
  및 국외 이전 고지 포함). 시행일·문의처는 `shared/constants/site.ts`에서 관리.
- **로그인 편의**: 아이디 저장(localStorage), 자동 로그인(Firebase persistence —
  해제 시 세션 한정), 비밀번호 재설정 메일(계정 존재 여부 비노출).
- 로그인 상태에서 로그인/가입 페이지 접근 시 홈으로 리다이렉트.

### 사이트 기본기
- 커스텀 404·오류 페이지, 파비콘(`app/icon.svg`), OpenGraph 메타데이터(`metadataBase`),
  robots.txt(개인 영역 색인 제외)·sitemap.xml (`app/robots.ts`, `app/sitemap.ts`).

### 관리자 (admin) — `/admin`
- 목회자 승인/반려, 신고 처리, 콘텐츠 관리(비공개/삭제), 씨앗 지급, 메인 큐레이션.
- admin 권한은 Firebase Console에서 `users/{uid}.role = "admin"`으로 수동 부여.

## 7. 데이터 구조 (Firestore)

| 컬렉션 | 문서 ID | 핵심 필드 |
| --- | --- | --- |
| `users` | uid | name, username, photoUrl, bio, **role**(member/pastorPending/pastor/admin), seedBalance(응원 씨앗 — 음수 허용), lastAttendanceDate, followerCount, termsAgreedAt, privacyAgreedAt, createdAt, updatedAt — **email은 저장하지 않음**(Firebase Auth에만 보관, 공개 노출 방지) |
| `usernames` | username | uid — Username 유일성 보장용 매핑 |
| `pastors` | uid | **공개 프로필**: applicantType(individual/organization), churchName, denomination, position, positionCategory(evangelist/pastor/other), organizationType(church/mission/…), websiteUrl, youtubeUrl, introduction, ministryFields[], **status**(pending/approved/rejected), appliedAt, reviewedAt |
| `pastors/{uid}/private/contact` | 고정 | **비공개 연락처**: phone, email — 본인·관리자만 열람(보안 규칙) |
| `follows` | `{followerUid}_{pastorUid}` | followerId, pastorId, pastorName·pastorUsername(비정규화 — 이메일 알림용), createdAt |
| `sermons` | auto | authorId, authorName·authorUsername(비정규화), title, sermonDate(YYYY-MM-DD), scripture, scriptureBook, body, tags[], series, coverImageUrl, youtubeVideoId, **status**(draft=비공개·작성자 전용 / published=공개 / hidden=관리자 숨김), viewCount, seedCount, commentCount, searchKeywords[], publishedAt |
| `testimonies` | auto | sermons와 동일 구조에서 scripture/series 제외 |
| `comments` | auto | targetType, targetId, authorId, authorName, body, createdAt |
| `bookmarks` | `{uid}_{type}_{id}` | uid, targetType, targetId, targetTitle, targetAuthorName |
| `reports` | auto | targetType, targetId, targetTitle, reporterId, reason, detail, **status**(pending/resolved/dismissed), resolutionNote |
| `seedTransactions` | auto 또는 결정적 ID(`attendance-…`, `share-…`) | uid, amount(±), type(signup/attendance/sermonPublish/testimonyPublish/share/event/cheer/contentDeleted/adminGrant), **kind**(cheer/support), targetType, targetId, memo |
| `jobs` | auto | authorId, authorName·authorUsername, title, churchName, position, region, employmentType, description, contactEmail, contactPhone, deadline, **status**(open/closed), viewCount |
| `notifications` | auto | uid, type, message, linkUrl, read |
| `settings` | curation | sermonIds[](노출 순서), headline |

- 시간 필드는 Firestore `Timestamp`로 저장하고, Repository에서 epoch millis(number)로 변환해 노출합니다.
- 보안 규칙: [firestore.rules](firestore.rules) / 복합 인덱스: [firestore.indexes.json](firestore.indexes.json) / Storage 규칙: [storage.rules](storage.rules)

### 보안 모델

ARK는 Firebase 클라이언트 SDK로 직접 Firestore에 접근하므로, **모든 권한 검증은 Firestore 보안 규칙**이 담당합니다(클라이언트 TS의 권한 체크는 UX용일 뿐 신뢰 경계가 아님).

- **PII 최소 노출**: 공개 프로필 문서(`users`, `pastors`)에는 이름·소개 등 공개 정보만 둡니다.
  - 이메일은 Firestore에 저장하지 않고 **Firebase Auth에만** 보관 — 본인 세션은 Auth 토큰에서 채웁니다.
  - 목회자 전화·이메일은 `pastors/{uid}/private/contact` 하위 문서로 분리해 **본인·관리자만** 읽습니다.
  - 과거에 `users.email`이 저장된 계정은 소유자가 로그인할 때 자동 제거됩니다(자가 치유 마이그레이션, `subscribeUser`).
- **카운터 무결성**: `viewCount`는 누구나 +1, `seedCount`는 로그인 사용자만 +1, `commentCount`는 ±1,
  `followerCount`는 다른 로그인 사용자만 ±1 — **임의 값 설정 불가**(규칙에서 정확한 증감만 허용)로 랭킹 조작 차단.
- **비공개 콘텐츠**: draft/hidden 설교·간증은 작성자·관리자만 읽기 가능.

**남은 위험 — 응원 씨앗 자가 발행 (서버 도입 전까지 유효)**: 응원 씨앗 잔액이 클라이언트 트랜잭션으로
갱신되므로 본인이 자기 `seedBalance`를 임의로 늘릴 수 있습니다. 응원 씨앗은 금전 가치가 없어 현재는
허용합니다. 향후 **금전 가치가 있는 잔액을 도입한다면 반드시 서버 권위 방식으로 전환**해야 합니다:
- 잔액 변경은 서버(Next.js Route Handler + Firebase Admin SDK 또는 Cloud Functions)에서만 수행
- Firestore 규칙에서 클라이언트의 유료 잔액 직접 쓰기 금지
- 단가·정산 등 민감한 사업 로직은 클라이언트·저장소·문서에 노출하지 않음 (서버 비공개 설정으로 관리)

## 8. 개발 일정 (TODO)

### 완료 (MVP)
- [x] 프로젝트 스캐폴딩, 디자인 토큰, 공통 UI/상태 컴포넌트
- [x] 회원가입/로그인, Username 유일성, 가입 보상
- [x] 목회자 인증 신청 + 관리자 승인/반려
- [x] 설교 업로드(파일 자동 추출), 등록/수정/게시, 목록/상세
- [x] 복사·붙여넣기 입력 — 설교 등록·Migration Wizard에서 파일 없이 텍스트로 보관
- [x] 선택적 공개 메커니즘 — 기본 비공개, 개별 공개 선택, 아카이브에서 공개↔비공개 전환
- [x] 성경 본문 자동 인용 — 개역한글(퍼블릭 도메인) 내장, 참조 파싱 후 인용 블록 렌더링
- [x] 이용약관·개인정보처리방침 + 가입/목회자 인증 필수 동의
- [x] 로그인 편의 — 아이디 저장, 자동 로그인, 비밀번호 재설정
- [x] 사이트 기본기 — 404/오류 페이지, 파비콘, OG, robots/sitemap
- [x] 채용 게시판 — 목회자 작성, 전체 공개, 마감 관리
- [x] 응원 씨앗 원장 정교화 — 매일 출석·공유 보상, 삭제 시 보상 회수(음수 잔액 허용),
      kind 필드로 후원 씨앗 자리 예약, 응원받은 기록 홈 추천
- [x] 팔로우 — 목회자 페이지 팔로워 수·팔로우 버튼, 홈 팔로잉 피드
- [x] 홈 설교 피드 탭 — 팔로잉/최신순/씨앗추천/조회순, 지연 로딩·캐시
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
- [ ] 프로덕션 환경에서 로그인·업로드 전체 흐름 QA (목회자 가입 → 인증 → Migration → 공개 → 검색)
- [x] 개인정보처리방침·이용약관 페이지 (목회자 인증에서 개인정보 수집)
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
4. **후원 관련 유료 기능 (미구현)** — 금전이 오가는 기능은 결제 검증·잔액 변경·정산을
   전부 서버(Admin SDK 또는 Cloud Functions)에서 처리하고, Firestore 규칙에서 클라이언트의
   유료 잔액 직접 쓰기를 금지한다. 단가·정산 구조 등 민감한 사업 로직은 클라이언트·저장소·
   공개 문서에 두지 않고 서버 비공개 설정으로만 관리한다(세부 설계는 별도 비공개 문서).
5. **HWP 지원** — `documentParser`에 파서 추가만으로 확장 가능.
6. **알림 UI** — `notifications` 컬렉션과 타입은 준비됨 (승인/반려 알림 저장 중).
7. **RSC 데이터 페칭** — Firebase Admin SDK 도입 시 목록/상세를 Server Component로 이전해 SEO 강화.
8. **새 설교 이메일 알림** — Cloud Functions(설교 publish 트리거) + 메일 서비스(Resend 등)로
   `follows`에서 발송 대상 조회 → "OO 목사님의 설교가 업로드되었어요" 발송. 수신 동의 필드 추가 필요.
9. **추천 알고리즘, 모바일 앱** — PRD 명시 제외 항목. 별도 의사결정 후 진행.
