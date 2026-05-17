# Backlog — web3people
> Created: 2026-03-29 00:00
> Last Updated: 2026-05-17 22:25

## 칸반 보드

### In Progress (진행 중)

_없음_

---

### Todo — Phase 1: 기반 세팅 (목표: 2026-04-01)

- [x] **[P1-01]** Next.js 16 + Payload CMS v3 프로젝트 초기화
  - `create-payload-app` blank 템플릿, `@payloadcms/db-sqlite` 어댑터
  - App Router (`src/app/(frontend)`, `src/app/(payload)`) 구조 확인
- [x] **[P1-01a]** Turso (SQLite) 데이터베이스 생성 및 연결
  - `turso db create web3people` 실행 완료
  - `DATABASE_URL`, `DATABASE_AUTH_TOKEN` 환경변수 설정 완료
  - `payload.config.ts`에 `authToken` 추가로 Turso 원격 연결 확인
- [x] **[P1-01b]** Payload Admin 패널 정상 기동 확인 (`/admin/create-first-user` 접근 성공)
- [x] **[P1-01c]** Better-Auth 설치 및 초기화
  - `src/lib/auth.ts` (서버 인스턴스, Turso 연결)
  - `src/lib/auth-client.ts` (클라이언트 헬퍼, signIn/signOut/useSession)
  - `src/app/auth/[...all]/route.ts` (Route Handler, `basePath: "/auth"`)
  - OAuth 콘솔 redirect URI 기준: `/auth/callback/{provider}`
  - Google OAuth provider 연결 완료 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- [x] **[P1-01d]** Tailwind CSS v4 + shadcn/ui 셋업
  - `tailwindcss`, `@tailwindcss/postcss`, `postcss` 설치
  - `components.json` 수동 설정 (Tailwind v4 CSS 파일 경로 지정)
  - `clsx`, `tailwind-merge`, `lucide-react` 설치
  - `src/lib/utils.ts` — `cn()` 유틸리티 생성
- [x] **[P1-01e]** 디자인 토큰 적용 (`src/app/(frontend)/styles.css`)
  - Tailwind v4 `@theme` 블록으로 커스텀 색상/폰트/radius 정의
  - Void 다크 모드 (`#0A0A0A`), 네온 그린 (`#00FF9D`), 0px border-radius
  - shadcn/ui 호환 CSS 변수 매핑 완료
  - 네온 글로우, 마이크로 애니메이션 클래스 정의
- [x] **[P1-03]** Payload 컬렉션 정의
  - `People.ts`, `Interviews.ts`, `Tags.ts`, `Comments.ts`, `Users.ts`, `Media.ts` 작성 완료
  - Q&A 블록 구조 (qa / text / image), 발행 상태 access control, publishedAt 자동 설정 hook 포함
- [ ] **[P1-04]** 어드민/편집자 계정 생성
  - 시드 스크립트 준비 완료: `pnpm seed`
  - `/admin/create-first-user`에서 첫 admin 생성 후 `pnpm seed` 실행 또는 어드민 패널에서 직접 추가
- [x] **[P1-05]** Vercel 프로젝트 연결 설정
  - `vercel.json` 생성 완료 (pnpm build, outputDirectory .next)
  - Vercel 대시보드에서 환경변수 설정 필요 (DATABASE_URL, DATABASE_AUTH_TOKEN, PAYLOAD_SECRET, CLOUDINARY_*)
- [x] **[P1-06]** 이미지 스토리지 설정 (Cloudinary)
  - `cloudinary` SDK 설치, `src/plugins/cloudinaryStorage.ts` 커스텀 플러그인 작성
  - `beforeChange` 훅으로 업로드 → Cloudinary URL을 `media.url`에 저장
  - `afterDelete` 훅으로 Cloudinary 파일 자동 삭제
  - 환경변수 3개 미설정 시 로컬 스토리지 폴백 (개발 환경)
  - `.env`에 CLOUDINARY_* 키 등록 완료

---

### Todo — Phase 2: 프론트엔드 개발 (목표: 2026-04-08)

- [x] **[P2-01]** Google Fonts 로드 (Outfit / JetBrains Mono) — layout.tsx 완료
- [x] **[P2-02]** 공통 컴포넌트 작성
  - `Header` (sticky, backdrop-blur, 로고 + nav)
  - `Footer`
  - `InterviewCard` (3:4 이미지, 태그, 제목, 인물, 날짜)
  - `PersonCard` (프로필 사진, 이름, 직함)
  - `LexicalContent` (Lexical AST 렌더러)
- [x] **[P2-03]** 홈페이지 (`/`) 개발
  - 히어로 섹션 (최신 인터뷰, 풀스크린)
  - 인터뷰 그리드 (최근 8개)
  - 인물 미리보기 (최근 6개)
- [x] **[P2-04]** 인터뷰 목록 페이지 (`/interviews`)
- [x] **[P2-05]** 인터뷰 상세 페이지 (`/interviews/[slug]`)
  - Q&A 블록 렌더링 (질문 bold + 네온, 답변 회색)
  - 인물 블록 (사진, 이름, 직함, 링크)
  - 관련 인터뷰 카드
  - generateMetadata, generateStaticParams
- [x] **[P2-06]** 인물 목록 페이지 (`/people`)
- [x] **[P2-07]** 인물 프로필 페이지 (`/people/[slug]`)
  - 소셜 링크, 태그, bio, 인터뷰 목록
  - generateMetadata, generateStaticParams
- [ ] **[P2-08]** 로그인/회원가입 진입점 UI 검토
  - 상세 인증 구현은 **[V2-04] 독자 회원가입/로그인 기반 구축**에서 관리
- [ ] **[P2-09]** 인터뷰 상세 댓글 영역 자리 표시자 검토
  - 상세 댓글 구현은 **[V2-05] 댓글 기능**에서 관리
- [ ] **[P2-10]** 반응형 레이아웃 (모바일 QA)

---

### Todo — Phase 3: SEO + 콘텐츠 입력 (목표: 2026-04-13)

- [ ] **[P3-01]** OG 태그 + 메타데이터 설정 (페이지별 동적 생성)
- [ ] **[P3-02]** JSON-LD 구조화 데이터 (Person, Article 스키마)
- [ ] **[P3-03]** `generateStaticParams` — 정적 경로 생성
- [ ] **[P3-04]** 시딩: 인물 3~5명 어드민 입력
- [ ] **[P3-05]** 시딩: 인터뷰 3~5개 어드민 입력
- [ ] **[P3-06]** 편집자 어드민 사용 가이드 작성 (1페이지)
- [ ] **[P3-07]** 크로스브라우저/모바일 최종 QA

---

### Todo — Launch (2026-04-15)

- [x] **[L-01]** 도메인 연결 (Vercel custom domain)
  - `web3people.online` → `www.web3people.online` 리다이렉트 및 Vercel 응답 확인
- [x] **[L-02]** Turso Production DB 환경변수 Vercel 설정
  - Production API에서 Payload 데이터 조회 확인 (`/api/people`)
- [ ] **[L-03]** 소셜 계정 준비 (Twitter/X, Instagram)

---

### Todo — Phase 4A: 탐색 개선 (목표: 2026-05-07 ~ 2026-05-10)

- [x] **[V2-00]** 코드 리뷰 기반 안전장치 정리
  - 일정: Phase 4A/4B 공통 선행 작업
  - 의존성: [Code Review Report](./02_CODE_REVIEW.md)
  - 완료 기준: 운영 env 검증, Payload access helper, 댓글 access 재설계, 공개 조회 helper 기준 확정
  - [x] 1차 코드 리뷰 리포트 작성
  - [x] `00_DEVELOPMENT_PRINCIPLES.md` 신설
  - [x] 운영 필수 env fail-fast 검증 추가
  - [x] Payload DB push 명시적 opt-in 처리
  - [x] `src/access/` RBAC helper 정리
  - [x] 공개 콘텐츠 조회 helper 작성
  - [x] `/my-route` 예제 API 제거
  - [x] 비회원 댓글 생성 차단 통합 테스트 추가
  - [x] Payload `Users` create access를 admin 전용으로 제한
  - [x] 홈 metadata 추가
  - [x] 상세 페이지 중복 조회 cache 적용
  - [x] 정적 slug 수집 페이지네이션 적용
  - [x] 읽기 시간 자동 계산 적용
  - [x] 태그 기반 관련 인터뷰 조회 적용
  - [x] Better Auth trusted origins 확장 env 적용
  - [x] users access 통합 테스트 보강
- [x] **[V2-01]** 검색 기반 콘텐츠 탐색
  - 일정: Phase 4A 1순위
  - 의존성: `Interviews`, `People`, `Tags` 공개 데이터 조회 안정화
  - 완료 기준: 검색 페이지/진입점, 결과 타입 구분, 빈 결과 UI까지 확인
  - [x] 인터뷰 제목, 본문, 인물명 대상 full-text search 범위 확정
  - [x] 검색 결과 타입 구분: 인터뷰 / 인물
  - [x] 검색 결과 정렬 기준 정의: 관련도, 최신순
  - [x] 검색 빈 결과 UI와 추천 태그 노출
- [x] **[V2-02]** 인터뷰/인물 태그 체계 정리
  - 일정: Phase 4A 2순위, 검색 범위 확정 직후
  - [x] 인물 태그 분류 정의: 직군, 분야, 생태계, 지역/언어, 관심사
  - [x] 인터뷰 태그 분류 정의: 주제, 산업, 독자 대상, 시리즈/기획
  - [x] 태그 중복/표기 규칙 정의: 영문 소문자 slug, 화면 표시명 분리
  - [x] Payload `Tags` 컬렉션과 `People`, `Interviews` 관계 필드 점검
  - [x] 어드민 입력 가이드에 태그 운영 규칙 추가
- [x] **[V2-03]** 태그/카테고리 필터 페이지
  - 일정: Phase 4A 3순위, 태그 체계 정리 이후
  - [x] `/tags/[slug]` 또는 검색 페이지 내 태그 필터 방식 결정
  - [x] 인물 목록과 인터뷰 목록에서 공통 태그 필터 사용
  - [x] 태그별 콘텐츠 수 표시 여부 결정
  - [x] 태그 분류 필드가 필요하면 DB 마이그레이션 계획과 함께 도입

---

### Todo — Phase 4B: 독자 참여 기반 (목표: 2026-05-11 ~ 2026-05-17)

- [ ] **[V2-04]** 독자 회원가입/로그인 기반 구축
  - 일정: Phase 4B 1순위
  - 의존성: Better-Auth Route Handler, 일반 독자 계정과 Payload 어드민 계정 분리 기준
  - 완료 기준: 이메일/비밀번호, Google, GitHub, 지갑 로그인 진입점과 세션 확인, 비로그인 작성 CTA까지 확인
  - [x] 로그인 옵션 확정: Email/password, Google, GitHub, Wallet
  - [x] 기존 프로젝트에서 사용해온 Google 소셜 로그인 구현 방식 확인 및 `/auth/callback/google` 적용
  - [ ] 기존 프로젝트에서 사용해온 GitHub 소셜 로그인 구현 방식 확인
  - [ ] 기존 프로젝트에서 사용해온 지갑 로그인 구현 방식 확인
  - [x] 이메일/비밀번호 로그인·회원가입 진입점 추가
  - [x] Header 세션 상태 및 로그아웃 진입점 추가
  - [x] 댓글 작성 전 로그인 CTA 문구 적용
  - [x] 일반 독자 계정과 Payload 어드민/편집자 계정 분리 유지
  - [x] 독자 프로필 컬렉션 도입 시점 결정: 댓글 MVP 이후 검토
- [x] **[V2-05]** 댓글 기능
  - 일정: Phase 4B 2순위, 회원가입/로그인 기반 이후
  - 의존성: V2-04 세션 확인, `Comments` 컬렉션 운영 플로우
  - 완료 기준: 로그인 사용자 댓글 작성, 즉시 공개, 작성자 수정/삭제, 관리자 숨김/삭제 확인
  - [x] 인터뷰 상세 페이지 하단 댓글 영역 추가
  - [x] 로그인 사용자만 댓글 작성 가능
  - [x] 댓글 기본 상태를 즉시 공개 정책에 맞게 재정의
  - [x] 작성자 본인 수정/삭제 플로우 구현
  - [x] 관리자 숨김/삭제 운영 플로우 확인
  - [x] 스팸 대응 기준 정의: MVP는 2,000자 제한과 서버 검증을 적용, rate limit/신고/계정 제한은 운영 강화 단계에서 추가
  - [x] Payload REST `/api/comments` 충돌 방지를 위해 독자 API를 `/api/reader/comments`로 분리
  - [x] 댓글 작성/수정/삭제 API Origin 검증 추가

- [x] **[V2-06]** 게시판 기능
  - 일정: Phase 4B 3순위, 댓글 MVP 이후
  - 의존성: V2-04 세션 확인, 독자 작성자 모델
  - 완료 기준: 독립 게시판, 인터뷰 연결 게시글, 인물 연결 게시글 작성/조회 확인
  - [x] `boardPosts` 컬렉션 설계
  - [x] `/board` 목록/상세/작성 화면
  - [x] 인터뷰 연결 게시글 지원
  - [x] 인물 연결 게시글 지원
  - [x] 게시글 댓글 연결 방식 확정: V2-06에서는 게시글 본문 토론까지만 구현, 게시글 댓글은 댓글 모델 다형화 또는 별도 `boardComments` 모델을 게시판 안정화 후 결정
- [x] **[V2-06a]** 독자 액션 toast 피드백
  - 일정: Phase 4B UX 보강
  - 의존성: V2-04 독자 인증, V2-05 댓글, V2-06 게시판
  - 완료 기준: 로그인/로그아웃/회원가입/댓글/게시판 작성·수정·삭제에 성공/실패 toast 표시
  - [x] `sonner` 설치 및 전역 Toaster 연결
  - [x] 로그인/회원가입/로그아웃 toast 적용
  - [x] 댓글 작성/수정/삭제 toast 적용
  - [x] 게시판 작성/수정/삭제 toast 적용
  - [x] lint/type/e2e 검증

---

### Todo — Phase 4C: 성장/운영 보강 (목표: 2026-05-18 ~)

- [ ] **[V2-07]** 뉴스레터 구독 (이메일 수집 + 발송)
- [ ] **[V2-08]** Payload webhook → revalidatePath (즉시 캐시 갱신)
- [ ] **[V2-09]** 소셜 공유 버튼 최적화

---

### Completed (완료)
- [x] **[D-01]** 레퍼런스 사이트 디자인 분석 (the-edit, eyesmag, design.co.kr)
- [x] **[D-02]** 기술 스택 확정 (Next.js 16 + Payload CMS v3 + Turso + Better-Auth + shadcn/ui)
- [x] **[D-03]** 문서 세트 초안 작성 (Lean Canvas, Product Specs, Roadmap, UI Design, DB Schema)
- [x] **[P1-01]** 프로젝트 스캐폴딩 및 기반 세팅 완료 (2026-03-29)
  - Next.js 16 + Payload CMS v3 초기화
  - Turso 데이터베이스 생성 및 연결
  - Better-Auth 설치 및 Route Handler 구성
  - Tailwind v4 + shadcn/ui + 디자인 토큰 적용
  - Payload Admin 패널 정상 기동 확인

---

## Related Documents
- **Concept_Design**: [Roadmap](../01_Concept_Design/03_ROADMAP.md) - 페이즈별 목표 일정
- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - MVP 기능 정의
- **Concept_Design**: [Identity & Auth Strategy](../01_Concept_Design/04_IDENTITY_AUTH_STRATEGY.md) - 댓글/회원가입/아이덴티티 전략
- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - 스키마 구현 참조
- **Technical_Specs**: [Development Principles](../03_Technical_Specs/00_DEVELOPMENT_PRINCIPLES.md) - 개발/검증/운영 안전 기준
- **Technical_Specs**: [API Specs](../03_Technical_Specs/02_API_SPECS.md) - API 구현 참조
- **Technical_Specs**: [Reader Auth, Board, Comments Spec](../03_Technical_Specs/03_READER_AUTH_BOARD_COMMENTS_SPEC.md) - 독자 인증/게시판/댓글 구현 기준
- **Logic_Progress**: [Code Review Report](./02_CODE_REVIEW.md) - 기능 고도화 전 코드 리스크와 선행 정리 항목
