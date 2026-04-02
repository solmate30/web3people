# API Specs — web3people
> Created: 2026-03-29 00:00
> Last Updated: 2026-03-29 00:00

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
  sort: '-published_at',
  limit: 8,
  depth: 1,  // subject(Person) 포함
})

// 인물 목록
await payload.find({
  collection: 'people',
  where: { status: { equals: 'published' } },
  sort: '-created_at',
  limit: 6,
})
```

---

### 2.2 인터뷰 목록 (`/interviews`)

```typescript
await payload.find({
  collection: 'interviews',
  where: { status: { equals: 'published' } },
  sort: '-published_at',
  limit: 12,
  page: 1,  // 페이지네이션
  depth: 1,
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
  sort: '-created_at',
  limit: 12,
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
  sort: '-published_at',
  depth: 1,
})
```

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
- `revalidate: 60` (60초 ISR) — 발행 후 빠른 반영
- 또는 Payload webhook → `revalidatePath()` (즉시 반영, v2에서 구현)

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

공개 읽기는 `access: () => true` 설정으로 인증 없이 허용.

---

## 5. 에러 처리

```typescript
// 존재하지 않는 slug → 404
if (!doc) notFound()

// 미발행 콘텐츠 → 404 (status !== published)
if (doc.status !== 'published') notFound()
```

---

## Related Documents
- **Technical_Specs**: [DB Schema](./01_DB_SCHEMA.md) - 컬렉션 필드 및 관계 설계
- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - 페이지별 기능 명세
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - API 구현 태스크
