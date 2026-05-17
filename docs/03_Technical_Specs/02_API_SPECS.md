# API Specs — web3people
> Created: 2026-03-29 00:00
> Last Updated: 2026-05-17 17:16

## 1. 개요

- Payload CMS v3는 REST API를 자동 생성한다
- 프론트엔드(Next.js)는 Payload Local API 또는 REST API로 데이터를 조회한다
- **권장**: 서버 컴포넌트에서 Payload Local API 직접 호출 (네트워크 왕복 없음)

```typescript
// 서버 컴포넌트에서 Local API 사용 예시
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const interviews = await payload.find({ collection: 'interviews', ... })
```

---

## 2. 데이터 조회 패턴 (페이지별)

### 2.1 홈페이지 (`/`)

**필요 데이터:**
1. 최신 published 인터뷰 8개 (커버이미지, 제목, excerpt, 인물명, 발행일)
2. 최근 등록 인물 6개 (사진, 이름, 직함)

```typescript
// 인터뷰 목록
await payload.find({
  collection: 'interviews',
  where: { status: { equals: 'published' } },
  sort: '-publishedAt',
  limit: 9,
  depth: 2,  // subject(Person), coverImage(Media), tags 포함
})

// 인물 목록
await payload.find({
  collection: 'people',
  where: { status: { equals: 'published' } },
  sort: '-createdAt',
  limit: 6,
  depth: 1,
})
```

---

### 2.2 인터뷰 목록 (`/interviews`)

```typescript
await payload.find({
  collection: 'interviews',
  where: { status: { equals: 'published' } },
  sort: '-publishedAt',
  limit: 24,
  page: 1,  // 페이지네이션
  depth: 2,
})
```

---

### 2.3 인터뷰 상세 (`/interviews/[slug]`)

```typescript
await payload.find({
  collection: 'interviews',
  where: {
    and: [
      { slug: { equals: slug } },
      { status: { equals: 'published' } },
    ],
  },
  depth: 2,  // subject(Person) + subject.photo(Media) 포함
  limit: 1,
})
```

**추가**: 같은 인물의 다른 인터뷰 또는 최근 인터뷰 3개 (추천 카드)

---

### 2.4 인물 목록 (`/people`)

```typescript
await payload.find({
  collection: 'people',
  where: { status: { equals: 'published' } },
  sort: '-createdAt',
  limit: 48,
  depth: 1,
})
```

---

### 2.5 인물 프로필 (`/people/[slug]`)

```typescript
// 인물 정보
await payload.find({
  collection: 'people',
  where: {
    and: [
      { slug: { equals: slug } },
      { status: { equals: 'published' } },
    ],
  },
  depth: 1,
  limit: 1,
})

// 해당 인물의 인터뷰 목록
await payload.find({
  collection: 'interviews',
  where: {
    and: [
      { 'subject.slug': { equals: slug } },
      { status: { equals: 'published' } },
    ],
  },
  sort: '-publishedAt',
  depth: 2,
})
```

---

### 2.6 검색 (`/search`)

검색은 Next.js 서버 페이지에서 Payload Local API를 사용한다. 별도 공개 write API는 없다.

입력:

| Query | 값 | 설명 |
|:---|:---|:---|
| `q` | string | 검색어 |
| `type` | `all` / `interviews` / `people` | 결과 타입 필터 |
| `sort` | `relevance` / `latest` | 정렬 기준 |

검색 범위:

- 인터뷰: 제목, 요약, Q&A 질문/답변, text 블록, 이미지 캡션, 인물명, 인물 조직, 태그명
- 인물: 이름, 영문 이름, 직함, 조직, 국가, bio, 태그명

정렬 기준:

- `relevance`: 제목/요약/이름/태그 등 우선 필드와 본문 매칭 점수
- `latest`: 발행일 또는 생성일 최신순

결과 UI는 인터뷰와 인물을 구분해 렌더링한다. 검색어가 없거나 결과가 없을 때는 추천 태그를 노출한다.

---

## 3. Static Generation 전략

```typescript
// 인터뷰 상세 페이지 — 빌드 시 정적 생성
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const interviews = await payload.find({
    collection: 'interviews',
    where: { status: { equals: 'published' } },
    select: { slug: true },
    limit: 1000,
  })
  return interviews.docs.map((i) => ({ slug: i.slug }))
}
```

**재검증 전략:**
- 프론트 페이지는 `revalidate = 60`을 사용한다.
- `People`과 `Interviews` 컬렉션의 `afterChange` / `afterDelete` hook에서 관련 프론트 경로를 `revalidatePath()`로 재검증한다.
- Payload hook이 CLI 시드 등 Next cache context 밖에서 실행될 수 있으므로 재검증 실패는 안전하게 무시한다.

---

## 4. Payload REST API (외부 접근 시)

Payload CMS가 자동 생성하는 REST 엔드포인트:

| Method | 경로 | 설명 |
|:---|:---|:---|
| GET | `/api/interviews` | 인터뷰 목록 |
| GET | `/api/interviews/:id` | 인터뷰 단건 |
| GET | `/api/people` | 인물 목록 |
| GET | `/api/people/:id` | 인물 단건 |
| GET | `/api/tags` | 태그 목록 |
| POST | `/api/users/login` | 어드민 로그인 |

**인증:** Bearer 토큰 (어드민 전용 쓰기 작업)

공개 읽기 정책:

- `people`, `interviews`: 비로그인 사용자는 `status = published`만 조회한다.
- `tags`, `media`: 공개 읽기를 허용한다.
- `comments`: 현재 승인 상태 기준 공개이나, 고도화 시 즉시 공개 정책에 맞춰 상태 모델을 재정의한다.

---

## 5. 독자 참여 API (계획)

회원/댓글/게시판 쓰기 API는 Payload REST API를 직접 공개하지 않고 Next.js Route Handler에서 Better Auth 세션을 검증한 뒤 처리한다.

| Method | 경로 | 역할 | 상태 |
|:---|:---|:---|:---:|
| GET/POST | `/api/auth/[...all]` | Better Auth 핸들러 | 구현됨 |
| POST | `/api/comments` | 세션 확인 후 댓글 작성 | 계획 |
| PATCH | `/api/comments/[id]` | 작성자 본인 댓글 수정 | 계획 |
| DELETE | `/api/comments/[id]` | 작성자 본인 또는 관리자 삭제 | 계획 |
| POST | `/api/board/posts` | 세션 확인 후 게시글 작성 | 계획 |
| PATCH | `/api/board/posts/[id]` | 작성자 본인 게시글 수정 | 계획 |
| DELETE | `/api/board/posts/[id]` | 작성자 본인 또는 관리자 삭제 | 계획 |

---

## 6. 에러 처리

```typescript
// 존재하지 않는 slug → 404
if (!doc) notFound()

// 미발행 콘텐츠 → 404 (status !== published)
if (doc.status !== 'published') notFound()
```

---

## Related Documents
- **Technical_Specs**: [Development Principles](./00_DEVELOPMENT_PRINCIPLES.md) - API 구현과 검증 기준
- **Technical_Specs**: [DB Schema](./01_DB_SCHEMA.md) - 컬렉션 필드 및 관계 설계
- **Technical_Specs**: [Reader Auth, Board, Comments Spec](./03_READER_AUTH_BOARD_COMMENTS_SPEC.md) - 독자 참여 API 설계 기준
- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - 페이지별 기능 명세
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - API 구현 태스크
