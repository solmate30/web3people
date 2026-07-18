# Web3People (SOLMATE)

**Web3People**은 Web3 생태계의 주요 인물(Person)과 방대한 인터뷰(Interview)를 탐색할 수 있는 차세대 편집 플랫폼(Webzine) MVP입니다.

## 🚀 프로젝트 개요 (Overview)

- **출시 목표 (Launch Target):** 2026-04-15
- **핵심 기능:**
  - 에디터를 통한 관리자(어드민) 전용 콘텐츠 발행 기능
  - 인물 프로필 및 해당 인물의 연관 인터뷰 리스팅
  - 인터뷰(Q&A) 상세 페이지
  - 최신 인터뷰들을 한눈에 확인할 수 있는 매거진형 홈페이지 피드

## 🛠 기술 스택 (Tech Stack)

이 프로젝트는 안정성, 성능, SEO 최적화를 동시에 만족시키기 위해 다음의 스택들로 구성되었습니다.

- **Framework:** Next.js 16 (App Router)
- **CMS / Admin:** Payload CMS v3
- **Database:** Turso (SQLite, libsql) + Payload `db-sqlite` 어댑터
- **Auth:** Payload CMS 기본 Auth (어드민) / Better-Auth (일반 회원, 프론트엔드 유저 전용)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Deploy:** Vercel

## 📦 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하고 테스트하는 방법입니다.

### 1. 폴더 이동
```bash
cd web3people
```

### 2. 패키지 설치
이 프로젝트는 `pnpm`을 패키지 관리자로 사용하도록 설정되어 있습니다.
```bash
pnpm install
```

### 3. 환경 변수 설정
`.env.example`을 참고하여 로컬용 `.env`를 생성합니다.

독자 Google 로그인에 필요한 최소 키:
- `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` (로컬: `http://localhost:3000`)
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

프로덕션에서는 Google OAuth redirect URI가 다음이어야 합니다.
- `https://www.web3people.online/auth/callback/google`

앱은 요청 Host/`X-Forwarded-Host` 기준으로 callback URL을 맞추고, 알 수 없는 호스트는
`https://www.web3people.online`으로 fallback합니다. 가능하면 Vercel의
`BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL`도 같은 canonical 도메인으로 맞추세요.

> **보안 주의(Security)**: 시크릿과 인증 정보가 포함된 실제 배포용 `.env.production` 파일은 어떠한 경우에도 Git에 커밋하지 않습니다.

### 4. 개발 서버 실행
```bash
pnpm dev
```
환경 구성 완료 후 브라우저에서 `http://localhost:3000`에 접속하여 결과물을 확인할 수 있습니다. 데이터 입력 작업이 필요한 경우 `http://localhost:3000/admin` 경로를 통해 Payload CMS 관리자 페이지로 로그인합니다.

## 🧩 문서 구조 (Documentation)

본 프로젝트는 [365 Principle (3 Investor Lenses, 6 Rubrics, 5 Documentation Layers)] 원칙에 입각하여 체계적으로 관리됩니다. 
플랫폼 구조 확인 및 상세 기획 설계에 관한 사항은 `docs/` 최상위 디렉토리를 참조하시기 바랍니다.

1. **[01_Concept_Design](./docs/01_Concept_Design/)**: 비즈니스 모델(Lean Canvas), 로드맵, 제품 기능 명세 파트
2. **[02_UI_Screens](./docs/02_UI_Screens/)**: UI 시스템 스크린 및 플로우, 디자인 시스템 정의 
3. **[03_Technical_Specs](./docs/03_Technical_Specs/)**: DB 설계 테이블, 데이터 흐름, 핵심 기술 사양 명세
4. **[04_Logic_Progress](./docs/04_Logic_Progress/)**: 에픽/태스크를 관리하는 프로덕트 백로그(Backlog)
5. **[05_QA_Validation](./docs/05_QA_Validation/)**: 배포 전 QA 체크리스트, E2E 유저 여정 테스트 시나리오
