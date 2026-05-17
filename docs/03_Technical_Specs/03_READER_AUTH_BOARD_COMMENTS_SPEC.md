# Reader Auth, Board, Comments Spec — web3people
> Created: 2026-05-17 15:35
> Last Updated: 2026-05-17 15:35

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
| Google | 일반 독자 진입 장벽 완화 | 실제 구현 전 기존 프로젝트 패턴 확인 필요 |
| GitHub | 개발자/web3 빌더 독자 친화성 | 실제 구현 전 기존 프로젝트 패턴 확인 필요 |
| Blockchain wallet | web3 identity 경험 | SIWE 또는 기존 사용 패턴 확인 필요 |

소셜 로그인과 지갑 로그인은 사용자가 이미 사용해오던 방식이 있으므로, 실제 코드 작업 직전에 provider 설정, 콜백 URL, 계정 연결 방식, 환경변수 이름을 확인한다.

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

현재 `Comments` 컬렉션은 `status: pending | approved | rejected` 구조를 갖고 있다. 즉시 공개 정책에 맞추려면 기본 상태를 `visible` 또는 `published` 성격으로 재정의하거나, `status`를 `visible | hidden | removed` 같은 운영 상태로 바꾸는 편이 명확하다.

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
  content: 'richText',
  authorId: 'text', // Better Auth user id
  authorName: 'text',
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

### 4.2 권장 Route Handler

| Method | 경로 | 역할 |
|:---|:---|:---|
| POST | `/api/comments` | 세션 확인 후 댓글 생성 |
| PATCH | `/api/comments/[id]` | 작성자 본인 댓글 수정 |
| DELETE | `/api/comments/[id]` | 작성자 본인 삭제 또는 관리자 삭제 |
| POST | `/api/board/posts` | 세션 확인 후 게시글 생성 |
| PATCH | `/api/board/posts/[id]` | 작성자 본인 게시글 수정 |
| DELETE | `/api/board/posts/[id]` | 작성자 본인 삭제 또는 관리자 삭제 |

Route Handler 내부에서 Better Auth 세션을 확인하고, 서버에서 확정한 작성자 정보만 Payload에 저장한다.

Payload Local API 사용 시 `req.user`가 Payload admin user가 아닌 Better Auth reader라는 점을 혼동하지 않는다. 독자 쓰기 API는 별도 서버 Route Handler에서 검증하고, 필요한 경우 의도적으로 admin-level Local API를 사용하되 입력값을 서버에서 제한한다.

## 5. 구현 순서

1. 현재 코드/테스트 기반 정리
   - ESLint 실행 복구
   - 프론트 E2E 템플릿 기대값 제거
   - 문서와 실제 필드명 동기화

2. 독자 인증 기반
   - Better Auth email/password 확인
   - Google/GitHub provider 설정 방식 사용자 확인
   - 지갑 로그인 방식 사용자 확인
   - 로그인/로그아웃 UI와 세션 표시

3. 댓글 MVP
   - Comments 모델을 즉시 공개 정책에 맞게 정리
   - `/api/comments` 작성 API
   - 인터뷰 상세 댓글 UI
   - 수정/삭제/신고 또는 숨김 정책

4. 게시판 MVP
   - `boardPosts` 모델
   - `/board` 목록/상세/작성 화면
   - 인터뷰/인물 연결 게시글 지원

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

## 7. 미해결 결정

- Google/GitHub OAuth provider 설정 방식과 기존 사용 패턴
- 지갑 로그인 구현 방식: SIWE 직접 구성, Better Auth 플러그인, 기존 프로젝트 패턴 중 선택
- Reader profile 컬렉션을 즉시 만들지, 댓글/게시판 구현 이후 분리할지
- 댓글/게시글 신고 기능을 MVP에 포함할지
- 게시판 카테고리 체계를 먼저 둘지, 태그 기반으로 시작할지

## 8. Related Documents

- **Concept_Design**: [Identity & Auth Strategy](../01_Concept_Design/04_IDENTITY_AUTH_STRATEGY.md) - 독자 identity와 로그인 옵션의 상위 전략
- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - MVP와 v2 기능 범위
- **Technical_Specs**: [DB Schema](./01_DB_SCHEMA.md) - Payload 컬렉션과 Better Auth 테이블 기준
- **Technical_Specs**: [API Specs](./02_API_SPECS.md) - 기존 공개 조회 API 전략
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - 구현 태스크와 단계 관리
- **QA_Validation**: [QA Checklist](../05_QA_Validation/01_QA_CHECKLIST.md) - 인증/댓글/게시판 QA 항목 반영 대상
