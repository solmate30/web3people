# Code Review Report
> Created: 2026-05-17 16:11
> Last Updated: 2026-05-17 16:53

## 1. Review Scope

현재 배포 중인 Web3People 코드베이스를 기준으로, 회원 로그인, 게시판, 댓글 고도화 전에 정리해야 할 코드 리스크를 점검했다.

검토 범위:

- Payload CMS 컬렉션과 access control
- Better Auth 설정
- Payload Local API 사용 방식
- 프론트엔드 데이터 조회와 캐싱
- 배포/운영 설정
- 테스트와 빌드 검증 상태

검증 명령:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test:int
pnpm build
```

## 2. Executive Summary

현재 코드는 기본 콘텐츠 서비스에는 동작 가능한 상태다. 다만 회원 기능과 자유 댓글, 게시판을 붙이기 전에는 권한 모델과 운영 설정을 먼저 정리해야 한다.

가장 중요한 선행 작업:

1. 댓글 컬렉션의 공개 생성 권한을 세션 기반 작성으로 바꾼다.
2. Payload admin 사용자와 Better Auth 독자 사용자의 역할 경계를 문서와 코드에 명확히 분리한다.
3. 운영 환경에서 빈 시크릿/DB URL/`push: true`가 허용되지 않도록 env 검증을 추가한다.
4. 목록 페이지와 관계 쿼리에 pagination, select, 인덱스 전략을 적용한다.
5. `00_DEVELOPMENT_PRINCIPLES.md`를 신설해 코드 작성 기준을 고정한다.

## 3. Findings

### F-001. Comments 컬렉션이 현재 공개 생성 가능하다

- Severity: High
- Area: Security / Community
- Evidence: `src/collections/Comments.ts:18-22`
- Status: Mitigated in `src/collections/Comments.ts` and `tests/int/api.int.spec.ts`

현재 `comments` 컬렉션은 `create: () => true`로 되어 있다. Payload REST API가 노출되어 있으므로, 별도 Route Handler를 만들지 않아도 외부에서 댓글 생성을 시도할 수 있다. 주석은 "API 경유"를 가정하지만 access rule 자체는 그 가정을 강제하지 않는다.

현재 사용자가 원하는 방향은 "회원이 승인 없이 자유롭게 작성"이다. 따라서 다음 구조가 필요하다.

- 생성은 Better Auth 세션이 있는 독자만 허용
- author 정보는 클라이언트 입력값이 아니라 서버 세션에서 주입
- 기본 상태는 `approved` 또는 상태 필드 제거
- 비회원 생성은 명시적으로 차단
- 스팸/남용 대응을 위해 rate limit 또는 soft delete 정책 추가

### F-002. 댓글 수정/삭제가 모든 Payload 사용자에게 열려 있다

- Severity: High
- Area: Security / Admin RBAC
- Evidence: `src/collections/Comments.ts:20-22`
- Status: Mitigated in `src/collections/Comments.ts`

현재 `update`와 `delete`는 `!!req.user`만 확인한다. Payload admin의 `editor`도 모든 댓글을 수정/삭제할 수 있다. 서비스가 커질 경우 댓글 운영 권한은 admin/moderator/editor를 분리해야 한다.

권장 방향:

- admin은 전체 수정/삭제 가능
- moderator 역할을 둘 경우 댓글 숨김/복구 가능
- 일반 독자는 본인 댓글만 수정/삭제 가능
- 삭제는 즉시 hard delete보다 `deletedAt`, `deletedBy`, `isHidden` 같은 감사 가능한 모델 우선

### F-003. Payload 운영 설정이 빈 값으로 폴백된다

- Severity: High
- Area: Deployment / Secrets
- Evidence: `src/payload.config.ts:28-37`
- Status: Mitigated in `src/lib/env.ts`, `src/payload.config.ts`, and `src/lib/auth.ts`

`PAYLOAD_SECRET`과 `DATABASE_URL`이 없을 때 빈 문자열로 폴백한다. 운영 배포에서 env 누락을 즉시 실패시키지 못하므로, 잘못된 배포가 뒤늦게 런타임 장애로 나타날 수 있다.

권장 방향:

- 서버 전용 env schema를 추가한다.
- 운영에서는 필수 env 누락 시 빌드 또는 서버 시작 단계에서 fail-fast한다.
- 로컬/테스트 env는 명시적으로 분리한다.

### F-004. Payload SQLite adapter의 `push: true`가 운영 안정성 기준으로 위험하다

- Severity: High
- Area: Database / Deployment
- Evidence: `src/payload.config.ts:32-38`
- Status: Mitigated in `src/lib/env.ts` and `src/payload.config.ts`

기존 DB adapter는 `push: true`로 설정되어 있었다. 초기 MVP에는 편하지만, 서비스 중인 DB에서는 의도치 않은 스키마 변경이 운영 데이터에 바로 반영될 수 있다. 2026-05-17 안정화 작업에서 기본값을 off로 바꾸고, 로컬에서 의도적으로 필요할 때만 `PAYLOAD_DB_PUSH=true`로 켜도록 변경했다.

권장 방향:

- 운영에서는 `push: false`
- 스키마 변경은 `generate:types`, 마이그레이션, 백업, 검증 순서로 진행
- 변경 전 Turso 백업/덤프 절차 문서화

### F-005. Better Auth 운영 정책이 아직 MVP 수준이다

- Severity: Medium
- Area: Auth / Reader Login
- Evidence: `src/lib/auth.ts:14-24`
- Status: Partially mitigated in `src/lib/auth.ts` and `src/lib/env.ts`

현재 이메일/비밀번호 로그인은 켜져 있지만 `requireEmailVerification: false`다. 또한 Google/GitHub/Wallet 로그인 정책은 아직 코드에 없다.

2026-05-17 안정화 작업에서 `secret`, `baseURL`, Drizzle adapter 기반 Turso 연결은 명시화했다. 소셜 로그인과 지갑 로그인 provider 정책은 다음 구현 단계에서 확정한다.

회원 기능을 붙이기 전 결정할 사항:

- 이메일 인증을 언제 켤지
- Google/GitHub provider 설정 방식
- 기존에 사용하던 소셜 로그인 코드와 통합 지점
- 지갑 로그인 provider/nonce/signature 검증 방식
- 독자 프로필과 Payload admin `users` 컬렉션을 분리 유지할지

### F-006. Payload admin 사용자 모델에 명시적 collection access가 부족하다

- Severity: Medium
- Area: Admin RBAC
- Evidence: `src/collections/Users.ts:17-29`
- Status: Partially mitigated in `src/access/admin.ts` and `src/collections/Users.ts`

현재 `role` 필드 update access만 존재하고, 컬렉션 단위의 read/create/update/delete 정책이 명시되어 있지 않다. 앞으로 독자/관리자 역할이 늘어나면 권한 의도가 코드에서 드러나지 않아 회귀 위험이 커진다.

권장 방향:

- `access/` 디렉터리에 `isAdmin`, `isEditor`, `adminOrSelf` 등을 정의
- Users 컬렉션에 collection-level access 명시
- role은 `saveToJWT` 적용 여부 검토
- 독자 계정은 Better Auth DB에 두고, Payload admin 계정과 섞지 않는 원칙 유지

### F-007. Local API가 access control 우회 기본값에 의존한다

- Severity: Medium
- Area: Payload Security
- Evidence: `src/app/(frontend)/interviews/page.tsx:18-24`, `src/app/(frontend)/people/page.tsx:18-24`, `src/app/(frontend)/interviews/[slug]/page.tsx:64-91`
- Status: Mitigated for public frontend reads in `src/lib/publicContent.ts`

프론트 서버 컴포넌트의 Payload Local API 조회는 `where: { status: published }`를 직접 넣어 공개 범위를 제한하고 있다. 현재는 안전하게 보이지만 Payload Local API는 기본적으로 access control을 우회하므로, 향후 쿼리가 추가될 때 초안 노출 회귀가 생기기 쉽다.

권장 방향:

- 공개 조회 helper를 만든다. 예: `findPublishedInterviews`, `findPublishedPeople`
- 공개 조회 helper 내부에서 status 조건, `depth`, `select`, `limit`, sort를 표준화
- 사용자 세션을 전달하는 Local API 호출은 반드시 `overrideAccess: false`를 적용

### F-008. 목록 페이지가 고정 limit 기반이라 성장 시 UX와 성능 한계가 있다

- Severity: Medium
- Area: Performance / UX
- Evidence: `src/app/(frontend)/interviews/page.tsx:18-24`, `src/app/(frontend)/people/page.tsx:18-24`

인터뷰 목록은 24개, 인물 목록은 48개로 고정 조회한다. 콘텐츠가 늘어나면 사용자는 오래된 콘텐츠에 접근하기 어렵고, 서버는 매번 깊은 관계 데이터를 가져오게 된다.

권장 방향:

- pagination/search/filter 추가
- 카드에 필요한 필드만 `select`
- 목록은 `depth: 1` 또는 필요한 최소 depth로 제한
- `publishedAt`, `status`, `slug`, relationship 필드 인덱스 검토

### F-009. 인물 상세의 관계 쿼리가 확장성 측면에서 불안정하다

- Severity: Medium
- Area: Data Query / Performance
- Evidence: `src/app/(frontend)/people/[slug]/page.tsx:73-84`
- Status: Mitigated in `src/lib/publicContent.ts` and `src/app/(frontend)/people/[slug]/page.tsx`

인물 상세에서 인터뷰를 찾을 때 `{ 'subject.slug': { equals: slug } }`로 관계 하위 필드를 조회한다. 데이터가 커질수록 관계 ID 기반 조회가 더 예측 가능하다.

권장 방향:

- 먼저 person을 찾은 뒤 `subject: { equals: person.id }`로 인터뷰 조회
- limit/pagination 지정
- 인물 상세의 related interviews 섹션도 select/depth 최소화

### F-010. 시드 스크립트에 운영 위험 기본 비밀번호가 있다

- Severity: Medium
- Area: Security / Operations
- Evidence: `src/scripts/seed.ts:27-54`

시드 스크립트가 env가 없으면 `1234` 비밀번호로 admin/editor 계정을 만든다. 주석으로 변경 안내는 있으나 운영 실수 가능성이 크다.

권장 방향:

- production 환경에서는 기본 비밀번호 사용 즉시 실패
- seed 실행 전에 `SEED_ADMIN_PASSWORD` 필수화
- 초기 admin 생성 절차를 운영 문서에 분리

### F-011. 예제 route가 배포 표면에 남아 있다

- Severity: Low
- Area: Surface Area
- Evidence: `src/app/my-route/route.ts:1-4`
- Status: Resolved

`/my-route` 예제 API가 남아 있다. 보안 취약점은 아니지만, 운영 서비스의 API 표면은 작을수록 좋다.

권장 방향:

- 필요 없으면 제거
- 샘플 route가 필요하면 테스트 전용 또는 문서 전용으로 이동

### F-012. 이미지 remotePatterns에 테스트 이미지 도메인이 남아 있다

- Severity: Low
- Area: Deployment Hygiene
- Evidence: `next.config.ts:17-21`

`picsum.photos`가 허용되어 있다. 실제 콘텐츠가 Cloudinary로 정리된 상태라면 제거하는 편이 이미지 출처 관리에 좋다.

권장 방향:

- 운영 허용 도메인은 Cloudinary와 필요한 내부 route로 제한
- mock/seed 전용 외부 도메인은 로컬 개발 설정으로 분리

### F-013. 테스트 커버리지가 현재 smoke 수준이다

- Severity: Medium
- Area: QA / Regression
- Evidence: `tests/int/api.int.spec.ts:14-19`
- Status: Partially mitigated in `tests/int/api.int.spec.ts`

통합 테스트는 users 조회 smoke test에 가깝다. 앞으로 로그인/댓글/게시판을 붙이면 권한 회귀를 막을 테스트가 부족하다.

우선 추가할 테스트:

- 비회원은 댓글 생성 실패
- 로그인 독자는 본인 댓글 생성 성공
- 댓글 작성자 이메일은 클라이언트 입력이 아닌 세션에서 저장
- public page는 draft interview/person을 조회하지 않음
- editor/admin 권한 차이 검증

### F-014. Users 컬렉션 create access가 명시되지 않았다

- Severity: High
- Area: Admin RBAC
- Evidence: `src/collections/Users.ts`
- Status: Resolved in `src/collections/Users.ts`

Payload admin 사용자 생성 권한이 명시되지 않으면 역할 확장 시 권한 의도가 불분명해진다. `create: isAdmin`을 추가해 admin만 Payload 사용자 계정을 만들 수 있도록 제한했다.

### F-015. 상세 페이지 metadata와 page가 동일 콘텐츠를 중복 조회한다

- Severity: Medium
- Area: Performance
- Evidence: `src/app/(frontend)/interviews/[slug]/page.tsx`, `src/app/(frontend)/people/[slug]/page.tsx`
- Status: Resolved with React `cache()`

`generateMetadata`와 페이지 컴포넌트가 같은 slug 문서를 각각 조회하던 구조를 module-level `cache()` helper로 정리했다.

### F-016. 정적 slug 수집에 고정 limit 상한이 있었다

- Severity: Medium
- Area: Build / Scale
- Evidence: `src/lib/publicContent.ts`
- Status: Resolved with pagination loop

`limit: 1000` 고정 상한을 제거하고, Payload pagination을 순회해 발행된 인터뷰/인물 slug를 모두 수집하도록 변경했다.

### F-017. 인터뷰 상세 읽기 시간이 하드코딩되어 있었다

- Severity: Medium
- Area: UX / Trust
- Evidence: `src/app/(frontend)/interviews/[slug]/page.tsx`
- Status: Resolved

`8 MIN READ` 고정 문구를 제거하고, 제목/요약/Q&A/text/image caption 텍스트를 기반으로 읽기 시간을 계산한다.

### F-018. 관련 인터뷰가 실제 연관성 없이 최신순이었다

- Severity: Medium
- Area: UX / Content Discovery
- Evidence: `src/lib/publicContent.ts`
- Status: Resolved

현재 인터뷰의 tag id를 기준으로 관련 인터뷰를 조회하도록 변경했다. 태그가 없으면 기존처럼 최신 다른 인터뷰 fallback으로 동작한다.

### F-019. Better Auth trusted origins가 단일 URL만 지원했다

- Severity: Low
- Area: Deployment
- Evidence: `src/lib/auth.ts`, `src/lib/env.ts`
- Status: Resolved

`BETTER_AUTH_TRUSTED_ORIGINS` 콤마 구분 env를 추가해 preview/staging origin을 함께 허용할 수 있도록 했다.

### F-020. 홈페이지 metadata가 없었다

- Severity: Medium
- Area: SEO
- Evidence: `src/app/(frontend)/page.tsx`
- Status: Resolved

홈페이지에 title, description, Open Graph 기본 metadata를 추가했다.

## 4. Verification Result

| Command | Result | Notes |
|---|---|---|
| `pnpm lint` | PASS | ESLint 통과 |
| `pnpm exec tsc --noEmit` | PASS | TypeScript 통과 |
| `pnpm test:int` | PASS | 비회원 댓글 생성 차단 테스트 포함. 샌드박스 네트워크에서는 Turso DNS 실패, 네트워크 권한 재실행으로 통과 |
| `pnpm build` | PASS | `.env` 기준 production build 통과. Better Auth base URL/secret 및 Drizzle adapter 설정 후 확인 |

## 5. Recommended Work Plan

### Phase 1. Safety Foundation

- `src/env.ts` 또는 `src/lib/env.ts` env schema 추가
- 운영에서 `PAYLOAD_SECRET`, `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `NEXT_PUBLIC_APP_URL` 필수화
- Payload `push`를 환경별로 분기하거나 운영에서 false 처리
- `src/access/` 디렉터리 생성 후 admin/editor access helper 정리
- `/my-route` 제거

### Phase 2. Community Auth Boundary

- Better Auth 독자 세션 조회 helper 작성
- 댓글 create route를 별도 API로 만들고, 세션에서 author 주입
- Comments 컬렉션 access를 auth-only create, owner/admin update/delete로 변경
- 댓글 상태 모델을 자유 작성 기준으로 재설계

### Phase 3. Query and Performance Baseline

- 공개 콘텐츠 조회 helper 작성
- 목록 페이지 pagination/search/filter 도입
- Payload query `select`, `depth`, `limit` 표준화
- 관계 조회를 slug 기반에서 ID 기반으로 정리

### Phase 4. Regression Tests

- 댓글 권한 테스트
- 공개 콘텐츠 초안 노출 방지 테스트
- Better Auth 세션 기반 API 테스트
- 관리자/editor 권한 테스트

## 6. Decision Needed

다음 코드 수정 전에 확정해야 할 질문:

1. 댓글은 회원만 작성하고, 작성 즉시 공개하는 정책으로 확정할 것인가?
2. 독자 계정은 Better Auth DB에만 두고 Payload `users`는 admin/editor 전용으로 유지할 것인가?
3. 댓글 삭제는 hard delete가 아니라 soft delete로 갈 것인가?
4. 게시판은 `boardCategories` + `boardPosts` + `comments` 공통 모델로 갈 것인가, 아니면 게시판 댓글과 인터뷰 댓글을 분리할 것인가?

## 7. Related Documents

- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - MVP와 고도화 기능 범위
- **Concept_Design**: [Roadmap](../01_Concept_Design/03_ROADMAP.md) - 단계별 실행 계획
- **Concept_Design**: [Identity Auth Strategy](../01_Concept_Design/04_IDENTITY_AUTH_STRATEGY.md) - 독자 인증 전략
- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - 현재/계획 데이터 모델
- **Technical_Specs**: [API Specs](../03_Technical_Specs/02_API_SPECS.md) - 공개 API와 계획 API
- **Technical_Specs**: [Reader Auth Board Comments Spec](../03_Technical_Specs/03_READER_AUTH_BOARD_COMMENTS_SPEC.md) - 회원/댓글/게시판 기능 명세
- **Logic_Progress**: [Backlog](./00_BACKLOG.md) - 우선순위 작업 목록
- **Logic_Progress**: [Documentation Audit](./01_DOCUMENTATION_AUDIT.md) - 문서 체계 정리 결과
- **QA_Validation**: [QA Checklist](../05_QA_Validation/01_QA_CHECKLIST.md) - 검증 기준
