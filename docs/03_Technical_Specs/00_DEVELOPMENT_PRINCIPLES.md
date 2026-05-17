# Development Principles — web3people
> Created: 2026-05-17 16:58
> Last Updated: 2026-05-17 19:58

## 1. Purpose

이 문서는 web3people의 코드 작성, 리뷰, 검증, 배포 전 확인 기준을 고정한다. 현재 서비스 중인 콘텐츠 기능을 안정적으로 유지하면서, 이후 독자 로그인, 댓글, 게시판 기능을 추가할 때 같은 기준으로 판단하기 위한 개발 원칙이다.

적용 범위:

- Next.js App Router 프론트엔드
- Payload CMS 컬렉션, access control, hooks
- Better Auth 독자 인증
- Turso/libSQL DB와 Payload SQLite adapter
- Cloudinary 이미지 스토리지
- 테스트, 빌드, 문서, 커밋 규칙

## 2. Architecture

### 2.1 Runtime Structure

현재 앱은 단일 Next.js + Payload CMS 프로젝트로 운영한다.

```text
src/
  app/
    (frontend)/    # 공개 콘텐츠 서비스
    (payload)/     # Payload admin/API
    auth/          # Better Auth route handler (/auth/*)
  access/          # Payload admin RBAC helpers
  collections/     # Payload collection configs
  components/      # React UI components
  hooks/           # Payload hooks
  lib/             # env, Payload, auth, public data helpers
  plugins/         # Payload/Cloudinary plugins
```

### 2.2 Account Boundary

두 계정 영역은 절대 섞지 않는다.

| Account | System | Purpose |
|:---|:---|:---|
| Admin/editor | Payload `users` | 콘텐츠 작성, 발행, 관리 |
| Reader | Better Auth tables | 댓글, 게시판, 커뮤니티 참여 |

원칙:

- Payload `users`는 관리자/편집자 전용이다.
- 독자 로그인은 Better Auth를 기본으로 한다.
- 독자 API에서 작성자 정보는 클라이언트 입력이 아니라 Better Auth 세션에서 결정한다.
- Payload admin user와 Better Auth reader user를 같은 user 객체처럼 취급하지 않는다.

## 3. Payload Rules

### 3.1 Access Control

Payload 컬렉션은 가능한 한 collection-level access를 명시한다.

현재 기준:

- `src/access/admin.ts`의 helper를 우선 사용한다.
- `isAdmin`: admin 전용 작업
- `adminOrSelf`: admin 또는 본인 문서 접근
- `isAdminField`: role 같은 민감 필드 update 제한

금지:

- 공개 쓰기 컬렉션에 `create: () => true`를 두지 않는다.
- Local API에 user를 넘기면서 `overrideAccess: false`를 생략하지 않는다.
- field-level access에서 query constraint를 반환하지 않는다. field access는 boolean만 반환한다.

### 3.2 Public Content Reads

공개 프론트엔드에서 Payload Local API를 직접 호출할 때는 `src/lib/publicContent.ts` helper를 사용한다.

원칙:

- 공개 조회는 `status = published` 조건을 helper 안에 둔다.
- 공개 조회 helper는 `overrideAccess: false`를 명시한다.
- 상세 페이지 slug 조회, 목록 조회, 정적 slug 수집은 helper를 통해 중복을 줄인다.
- 정적 slug 수집은 고정 상한만 두지 않고 pagination loop를 사용한다.

### 3.3 Hooks and Transactions

Payload hook 안에서 nested operation을 실행할 때는 반드시 `req`를 전달한다.

```typescript
await req.payload.create({
  collection: 'audit-log',
  data,
  req,
})
```

반복 호출 위험이 있는 hook은 `context` flag로 루프를 막는다.

## 4. Auth Rules

### 4.1 Better Auth

현재 Better Auth는 다음 기준으로 구성한다.

- `src/lib/auth.ts`: server auth instance
- `src/lib/auth-client.ts`: client helper
- `src/app/auth/[...all]/route.ts`: route handler
- Better Auth `basePath`는 `/auth`로 고정한다.
- Google/Kakao 등 OAuth redirect URI는 `/auth/callback/{provider}` 형식을 사용한다.
- Turso 연결은 Drizzle adapter를 사용한다.

필수 운영 env:

```bash
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://www.web3people.online
NEXT_PUBLIC_APP_URL=https://www.web3people.online
BETTER_AUTH_TRUSTED_ORIGINS=https://preview.example.com,https://staging.example.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

OAuth 콘솔 등록 기준:

```text
https://www.web3people.online/auth/callback/google
http://localhost:3000/auth/callback/google
```

소셜 로그인은 Google을 먼저 연결하고, GitHub는 별도 client id/secret 준비 후 같은 `/auth/callback/github` 기준으로 추가한다.

소셜 로그인과 지갑 로그인 구현 전에는 기존 프로젝트에서 사용해온 provider 설정, callback URL, env 이름, 계정 연결 방식을 사용자에게 확인한다.

### 4.2 Reader Write APIs

댓글/게시판 같은 독자 쓰기 기능은 Payload REST API를 직접 공개하지 않는다.

권장 패턴:

1. Next.js Route Handler에서 Better Auth 세션을 확인한다.
2. 서버에서 author id/name/email을 확정한다.
3. 입력값은 Zod 등으로 검증한다.
4. Payload Local API로 저장한다.
5. 클라이언트가 보낸 author 정보는 신뢰하지 않는다.

## 5. Env and Database Rules

### 5.1 Env Validation

서버 env는 `src/lib/env.ts`를 통해 읽는다.

원칙:

- production에서 필수 env가 없으면 fail-fast한다.
- 클라이언트 파일에서는 서버 env helper를 import하지 않는다.
- 브라우저에 노출 가능한 값은 `NEXT_PUBLIC_*`만 사용한다.

### 5.2 DB Push and Schema Changes

Payload DB push는 기본 off다.

```bash
PAYLOAD_DB_PUSH=true
```

이 값은 로컬에서 의도적으로 스키마 push가 필요할 때만 사용한다.

운영 DB 변경 순서:

1. 변경 계획 문서화
2. Turso 백업/덤프 확인
3. 컬렉션 스키마 수정
4. `pnpm generate:types`
5. `pnpm exec tsc --noEmit`
6. `pnpm lint`
7. `pnpm test:int`
8. `pnpm build`
9. 배포

## 6. Frontend Rules

### 6.1 Rendering and Data

- App Router Server Component를 기본으로 사용한다.
- 브라우저 상태, event handler, client hook이 필요할 때만 `'use client'`를 사용한다.
- 공개 콘텐츠 데이터는 서버에서 조회한다.
- `generateMetadata`와 page가 같은 데이터를 조회할 때는 `cache()` 또는 필요한 필드만 조회하는 helper를 사용한다.

### 6.2 SEO

- 주요 공개 페이지는 `metadata` 또는 `generateMetadata`를 가진다.
- 홈, 목록, 상세 페이지의 title/description은 기본값으로 방치하지 않는다.
- 상세 페이지의 Open Graph image는 Cloudinary URL 변환 helper를 사용한다.

### 6.3 Content UX

- 인터뷰 읽기 시간은 하드코딩하지 않는다.
- 관련 콘텐츠는 가능한 경우 tag/person/context 기반으로 연결한다.
- fallback이 최신순일 경우 화면 문구가 실제 의미와 어긋나지 않게 한다.

## 7. Testing and Verification

코드 변경 후 기본 검증:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
pnpm build
```

Payload schema 변경 후 추가 검증:

```bash
pnpm generate:types
pnpm exec tsc --noEmit
```

테스트 원칙:

- access control은 성공 케이스보다 차단 케이스를 먼저 검증한다.
- 의미 없는 smoke test를 지양한다.
- 비회원 댓글 생성, anonymous users access, published-only 조회 등 회귀 위험이 큰 부분은 통합 테스트로 고정한다.

## 8. Documentation Rules

문서는 5-layer 구조를 유지한다.

```text
docs/
  01_Concept_Design/
  02_UI_Screens/
  03_Technical_Specs/
  04_Logic_Progress/
  05_QA_Validation/
```

모든 문서는 다음을 포함한다.

- `Created`
- `Last Updated`
- `Related Documents`

코드 변경이 기능/보안/운영 정책에 영향을 주면 관련 문서를 같은 커밋 또는 가까운 후속 커밋에서 갱신한다.

## 9. Git and Branch Rules

현재 운영 main은 직접 건드리지 않는다.

원칙:

- 기능/리뷰/문서 작업은 별도 브랜치에서 진행한다.
- 현재 커뮤니티 기반 작업 브랜치: `community-foundation`
- 커밋 메시지는 `type(scope): subject` 형식을 사용한다.

예시:

```text
fix(security): 댓글 공개 생성 차단
docs(review): 코드 리뷰 결과 정리
feat(auth): 독자 로그인 진입점 추가
```

커밋 전 확인:

- 의도하지 않은 파일 변경이 없는지 `git status --short` 확인
- `.env*`, `.agent/skills/`, `.codex/` 등 로컬 파일이 포함되지 않았는지 확인
- 관련 문서 업데이트 여부 확인

## 10. Open Decisions

다음 항목은 구현 전에 사용자 확인이 필요하다.

- Google/GitHub 소셜 로그인의 기존 프로젝트 구현 방식
- 지갑 로그인 방식: SIWE, Better Auth plugin, 기존 자체 구현 중 선택
- Reader profile 컬렉션을 즉시 만들지 여부
- 댓글 삭제를 hard delete로 할지 soft delete로 할지
- 게시판 댓글과 인터뷰 댓글을 같은 Comments 모델로 통합할지 여부
- 운영 DB 스키마 변경 시 백업/복구 절차의 실제 명령

## 11. Related Documents

- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - 제품 기능 범위
- **Concept_Design**: [Roadmap](../01_Concept_Design/03_ROADMAP.md) - 단계별 실행 계획
- **Concept_Design**: [Identity & Auth Strategy](../01_Concept_Design/04_IDENTITY_AUTH_STRATEGY.md) - 독자 identity 전략
- **Technical_Specs**: [DB Schema](./01_DB_SCHEMA.md) - 데이터 모델과 환경변수 기준
- **Technical_Specs**: [API Specs](./02_API_SPECS.md) - 공개 조회와 독자 참여 API 기준
- **Technical_Specs**: [Reader Auth, Board, Comments Spec](./03_READER_AUTH_BOARD_COMMENTS_SPEC.md) - 고도화 기능 설계
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - 구현 태스크 상태
- **Logic_Progress**: [Code Review Report](../04_Logic_Progress/02_CODE_REVIEW.md) - 코드 리뷰 결과
- **QA_Validation**: [QA Checklist](../05_QA_Validation/01_QA_CHECKLIST.md) - QA와 검증 기준
