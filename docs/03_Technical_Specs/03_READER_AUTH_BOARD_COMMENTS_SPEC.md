# Reader Auth, Board, Comments Spec — web3people
> Created: 2026-05-17 15:35
> Last Updated: 2026-05-17 22:25

## 1. 목적

web3people의 다음 고도화 단계는 읽기 전용 매거진을 독자 참여형 커뮤니티로 확장하는 것이다. 이 문서는 독자 로그인, 게시판, 댓글 구현 전에 흔들리면 안 되는 기술 결정을 정리한다.

핵심 원칙:

- 독자 인증은 Better Auth를 기본으로 한다.
- Payload `users`는 관리자/편집자 전용으로 유지한다.
- 일반 독자 계정과 관리자 계정은 섞지 않는다.
- 댓글은 회원이 자유롭게 작성하고 즉시 공개한다.
- 게시판은 독립 게시판, 인터뷰 연결 게시판, 인물 연결 게시판을 모두 지원할 수 있는 구조로 설계한다.

## 2. 인증 범위

### 2.1 로그인 방식

MVP 고도화 범위에는 다음 로그인 방식을 모두 포함한다.

| 방식 | 목적 | 비고 |
|:---|:---|:---|
| Email/password | 기본 회원가입/로그인 | Better Auth emailAndPassword 사용 |
| Google | 일반 독자 진입 장벽 완화 | `/auth/callback/google` 기준으로 연결 완료 |
| GitHub | 개발자/web3 빌더 독자 친화성 | env 준비 후 `/auth/callback/github` 기준으로 추가 |
| Blockchain wallet | web3 identity 경험 | SIWE 또는 기존 사용 패턴 확인 필요 |

소셜 로그인과 지갑 로그인은 사용자가 이미 사용해오던 방식이 있으므로, 실제 코드 작업 직전에 provider 설정, 콜백 URL, 계정 연결 방식, 환경변수 이름을 확인한다. Google은 기존 프로젝트의 `/auth/callback/google` 패턴을 유지하도록 적용했다.

### 2.2 계정 분리

| 계정 종류 | 저장/관리 | 용도 |
|:---|:---|:---|
| Admin/editor | Payload `users` | 콘텐츠 작성, 발행, 관리 |
| Reader | Better Auth user/account/session | 댓글, 게시글, 커뮤니티 참여 |
| Reader profile | Payload 컬렉션 검토 | 표시명, 대표 identity, 활동 정보 |

독자 API에서 Payload Local API를 사용할 때는 클라이언트가 전달한 author 정보를 신뢰하지 않는다. 세션에서 확인한 Better Auth user 정보를 기준으로 작성자를 결정한다.

## 3. 커뮤니티 모델

### 3.1 댓글

댓글은 다음 위치에 붙을 수 있다.

- 인터뷰 상세
- 인물 프로필
- 게시글 상세

초기 구현은 인터뷰 댓글부터 시작한다. 이후 인물 댓글과 게시글 댓글로 확장한다.

댓글 운영 정책:

- 로그인 독자만 작성 가능
- 승인 없이 즉시 공개
- 작성자 본인은 수정/삭제 가능
- 관리자/편집자는 숨김 또는 삭제 가능
- 스팸 대응은 rate limit, 신고, 계정 제한, 관리자 삭제로 처리

현재 `Comments` 컬렉션은 즉시 공개 정책에 맞춰 `status: visible | hidden | removed` 구조를 사용한다. 새 댓글은 Route Handler에서 세션 검증 후 `visible`로 생성되며, 공개 조회는 `visible`만 반환한다. 관리자는 Payload Admin에서 `hidden` 또는 `removed`로 운영 조치할 수 있다.

댓글 MVP는 운영 DB 컬럼 추가 없이 기존 `authorEmail`을 세션 기준으로 저장하고 본인 수정/삭제 판정에 사용한다. `readerProfiles` 또는 별도 author id 컬럼은 댓글 MVP 이후 표시명/활동 요구가 확정되면 도입한다.

### 3.2 게시판

게시판은 세 가지 맥락을 지원한다.

| 게시판 종류 | 예시 경로 | 설명 |
|:---|:---|:---|
| 독립 게시판 | `/board` | 일반 토론, 공지, 자유 글 |
| 인터뷰 연결 토론 | `/interviews/[slug]` 하단 또는 `/board?interview=...` | 특정 인터뷰에 대한 독자 토론 |
| 인물 연결 토론 | `/people/[slug]` 하단 또는 `/board?person=...` | 특정 인물에 대한 질문/토론 |

권장 데이터 모델은 `boardPosts` 하나에 optional relationship을 두는 방식이다.

```typescript
{
  title: 'text',
  content: 'textarea',
  authorName: 'text',
  authorEmail: 'email', // Better Auth email, not exposed
  relatedInterview: 'relationship: interviews',
  relatedPerson: 'relationship: people',
  visibility: 'published | hidden | removed',
}
```

독립 게시글은 `relatedInterview`, `relatedPerson`이 비어 있다. 연결 게시글은 둘 중 하나를 가진다.

## 4. API 전략

### 4.1 금지할 패턴

- 클라이언트에서 Payload REST API로 댓글/게시글을 직접 생성
- 클라이언트가 보낸 `authorName`, `authorEmail`, `authorId`를 그대로 신뢰
- Payload `users`와 Better Auth 독자 계정을 같은 로그인으로 취급
- 댓글 자유 작성을 이유로 rate limit 없이 쓰기 API 공개
- 쓰기 API에서 `Origin` 검증 없이 쿠키 기반 세션 요청을 처리

### 4.2 권장 Route Handler

| Method | 경로 | 역할 |
|:---|:---|:---|
| GET | `/api/reader/comments?interviewId={id}` | 공개 댓글 조회. Payload REST `/api/comments` 충돌 방지를 위해 reader namespace 사용 |
| POST | `/api/reader/comments` | 세션 확인 후 댓글 생성 |
| PATCH | `/api/reader/comments/[id]` | 작성자 본인 댓글 수정 |
| DELETE | `/api/reader/comments/[id]` | 작성자 본인 삭제 |
| GET | `/api/reader/board/posts` | 독립/연결 게시글 목록 조회 |
| POST | `/api/reader/board/posts` | 세션 확인 후 게시글 생성 |
| GET | `/api/reader/board/posts/[id]` | 게시글 상세 조회 |
| PATCH | `/api/reader/board/posts/[id]` | 작성자 본인 게시글 수정 |
| DELETE | `/api/reader/board/posts/[id]` | 작성자 본인 삭제 |

Route Handler 내부에서 Better Auth 세션을 확인하고, 서버에서 확정한 작성자 정보만 Payload에 저장한다.

Payload Local API 사용 시 `req.user`가 Payload admin user가 아닌 Better Auth reader라는 점을 혼동하지 않는다. 독자 쓰기 API는 별도 서버 Route Handler에서 검증하고, 필요한 경우 의도적으로 admin-level Local API를 사용하되 입력값을 서버에서 제한한다.

`/api/comments`는 Payload 컬렉션 REST endpoint와 경로가 겹친다. Payload Admin의 댓글 운영 화면을 유지하기 위해 독자용 API는 `/api/reader/comments` namespace를 사용한다.

댓글 생성, 수정, 삭제 요청은 `Origin` 헤더가 `BETTER_AUTH_URL` 또는 `BETTER_AUTH_TRUSTED_ORIGINS` 기준의 `env.trustedOrigins`에 포함될 때만 처리한다. 공개 댓글 조회 `GET`은 읽기 API이므로 Origin 검증 대상에서 제외한다.

## 5. 구현 순서

1. 현재 코드/테스트 기반 정리
   - ESLint 실행 복구
   - 프론트 E2E 템플릿 기대값 제거
   - 문서와 실제 필드명 동기화

2. 독자 인증 기반
   - Better Auth email/password 확인
   - Google provider 설정 방식 사용자 확인 및 적용
   - GitHub provider 설정 방식 사용자 확인
   - 지갑 로그인 방식 사용자 확인
   - 로그인/로그아웃 UI와 세션 표시

3. 댓글 MVP
   - Comments 모델을 즉시 공개 정책에 맞게 정리
   - `/api/reader/comments` 작성 API
   - 인터뷰 상세 댓글 UI
   - 수정/삭제/신고 또는 숨김 정책

4. 게시판 MVP
   - `boardPosts` 모델
   - `/board` 목록/상세/작성 화면
   - 인터뷰/인물 연결 게시글 지원
   - 게시글 댓글은 댓글 모델 다형화 또는 별도 `boardComments` 모델을 게시판 안정화 후 확정

5. 운영 강화
   - rate limit
   - 신고/숨김
   - 관리자 운영 화면 정리
   - 계정 제한 정책

## 6. QA 기준

| 영역 | 기준 |
|:---|:---|
| Functionality | 이메일, Google, GitHub, 지갑 로그인 흐름이 각각 독자 세션을 만든다 |
| Security | 비로그인 사용자는 댓글/게시글 작성 API를 사용할 수 없다 |
| Security | 작성자 정보는 클라이언트 입력이 아니라 세션에서 결정된다 |
| UX | 비로그인 독자는 읽기 가능하며 작성 영역에서 로그인 CTA를 본다 |
| UX | 로그인 독자는 댓글을 작성하면 즉시 화면에서 확인한다 |
| Moderation | 관리자는 부적절한 댓글/게시글을 숨김 또는 삭제할 수 있다 |

## 7. Toast 피드백 기준

독자 액션은 성공/실패 여부가 즉시 체감되어야 한다. 댓글과 게시판처럼 화면 일부만 갱신되는 기능은 inline error만으로 부족하므로 `sonner` toast를 공통 피드백 레이어로 사용한다.

적용 기준:

- 입력 검증 오류: 필드 근처 inline error를 우선 사용한다.
- 저장/수정/삭제/로그인/로그아웃 결과: toast를 사용한다.
- 서버 오류: inline error와 toast를 함께 사용해 사용자가 놓치지 않게 한다.
- 라우트 이동이 있는 성공 액션: toast를 표시한 뒤 `router.push` 또는 `router.refresh`를 실행한다.

초기 메시지 범위:

| 액션 | 성공 메시지 | 실패 메시지 |
|:---|:---|:---|
| 로그인 | 로그인되었습니다. | 로그인에 실패했습니다. |
| 회원가입 | 계정이 생성되었습니다. | 회원가입 중 문제가 발생했습니다. |
| 로그아웃 | 로그아웃되었습니다. | 로그아웃 중 문제가 발생했습니다. |
| 댓글 작성 | 댓글이 등록되었습니다. | 댓글을 저장하지 못했습니다. |
| 댓글 수정 | 댓글이 수정되었습니다. | 댓글을 수정하지 못했습니다. |
| 댓글 삭제 | 댓글이 삭제되었습니다. | 댓글을 삭제하지 못했습니다. |
| 게시글 작성 | 게시글이 등록되었습니다. | 게시글을 저장하지 못했습니다. |
| 게시글 수정 | 게시글이 수정되었습니다. | 게시글을 수정하지 못했습니다. |
| 게시글 삭제 | 게시글이 삭제되었습니다. | 게시글을 삭제하지 못했습니다. |

## 8. 미해결 결정

- GitHub OAuth provider 설정 방식과 기존 사용 패턴
- 지갑 로그인 구현 방식: SIWE 직접 구성, Better Auth 플러그인, 기존 프로젝트 패턴 중 선택
- Reader profile 컬렉션은 댓글 MVP 이후 표시명/활동 정보 요구가 확정되면 분리한다
- 댓글/게시글 신고 기능을 MVP에 포함할지
- 게시판 카테고리 체계를 먼저 둘지, 태그 기반으로 시작할지

## 9. Related Documents

- **Concept_Design**: [Identity & Auth Strategy](../01_Concept_Design/04_IDENTITY_AUTH_STRATEGY.md) - 독자 identity와 로그인 옵션의 상위 전략
- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - MVP와 v2 기능 범위
- **Technical_Specs**: [DB Schema](./01_DB_SCHEMA.md) - Payload 컬렉션과 Better Auth 테이블 기준
- **Technical_Specs**: [API Specs](./02_API_SPECS.md) - 기존 공개 조회 API 전략
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - 구현 태스크와 단계 관리
- **QA_Validation**: [QA Checklist](../05_QA_Validation/01_QA_CHECKLIST.md) - 인증/댓글/게시판 QA 항목 반영 대상
