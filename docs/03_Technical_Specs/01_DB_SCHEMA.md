# DB Schema — web3people
> Created: 2026-03-29 00:00
> Last Updated: 2026-03-29 18:55

## 1. 개요

- ORM/CMS: Payload CMS v3 (`@payloadcms/db-sqlite` + Drizzle ORM)
- DB: **Turso (SQLite, libsql)** — Edge 기반 원격 SQLite
- Payload 어댑터가 내부적으로 `@libsql/client`와 `drizzle-orm/libsql`을 사용
- 아래 스키마는 Payload 컬렉션 정의 기준으로 작성 (Payload가 자동으로 마이그레이션 관리)

---

## 2. 컬렉션 (Collections)

### 2.1 `people` — 인물 프로필

| 컬럼 | 타입 | 필수 | 설명 |
|:---|:---|:---:|:---|
| id | uuid | Y | PK (Payload 자동 생성) |
| name | text | Y | 이름 |
| name_en | text | N | 영문 이름 |
| slug | text | Y | URL 슬러그 (고유값) |
| photo | upload | Y | 프로필 사진 (Media 컬렉션 참조) |
| title | text | Y | 직함 (예: Co-founder & CEO) |
| organization | text | N | 소속 (회사/프로젝트명) |
| country | text | N | 국가 (ISO 코드, 예: KR, US) |
| bio | richText | Y | 소개 (롱폼, Lexical 에디터) |
| social_twitter | text | N | Twitter/X URL |
| social_linkedin | text | N | LinkedIn URL |
| social_website | text | N | 개인/프로젝트 웹사이트 |
| tags | relationship | N | Tag[] — 다대다 |
| status | select | Y | draft / published |
| created_at | timestamp | Y | Payload 자동 |
| updated_at | timestamp | Y | Payload 자동 |

**인덱스:** `slug` (unique), `status`

---

### 2.2 `interviews` — 인터뷰

| 컬럼 | 타입 | 필수 | 설명 |
|:---|:---|:---:|:---|
| id | uuid | Y | PK |
| title | text | Y | 인터뷰 제목 |
| slug | text | Y | URL 슬러그 (고유값) |
| subject | relationship | Y | People → 1개 인물 |
| cover_image | upload | Y | 대표 이미지 (Media 참조) |
| excerpt | textarea | Y | 요약 (140자 내외, 카드 표시용) |
| content | richText | Y | 본문 (Q&A 블록 포함) |
| published_at | timestamp | N | 발행일 (null이면 미발행) |
| status | select | Y | draft / published |
| tags | relationship | N | Tag[] — 다대다 |
| created_at | timestamp | Y | Payload 자동 |
| updated_at | timestamp | Y | Payload 자동 |

**인덱스:** `slug` (unique), `status`, `published_at DESC`

---

### 2.3 `tags` — 태그

| 컬럼 | 타입 | 필수 | 설명 |
|:---|:---|:---:|:---|
| id | uuid | Y | PK |
| name | text | Y | 태그명 (예: DeFi, NFT, Layer2) |
| slug | text | Y | URL 슬러그 (고유값) |
| created_at | timestamp | Y | Payload 자동 |

**샘플 태그:** DeFi, NFT, Layer2, GameFi, DAO, Infrastructure, AI+Web3, Founder, Investor, Developer, Artist

---

### 2.4 `media` — 미디어 파일

Payload CMS 기본 Media 컬렉션 사용.

| 컬럼 | 타입 | 설명 |
|:---|:---|:---|
| id | uuid | PK |
| filename | text | 저장 파일명 |
| alt | text | 이미지 alt 텍스트 (접근성) |
| url | text | 스토리지 URL |
| width | int | 원본 너비 |
| height | int | 원본 높이 |
| mime_type | text | image/jpeg 등 |
| file_size | int | bytes |

**스토리지:** Cloudinary (`cloudinaryStorage` 커스텀 플러그인)
- `url` 필드: Cloudinary CDN URL (자동 설정)
- `cloudinaryId` 필드: Cloudinary public_id (삭제 시 사용, 어드민에서 숨김)
- URL 변환: `w_800,f_webp` 등 파라미터로 온디맨드 리사이즈

---

### 2.5 `users` — 관리자 계정 (Payload Auth)

Payload CMS 기본 Users 컬렉션 사용. 어드민/편집자 전용.

| 컬럼 | 타입 | 설명 |
|:---|:---|:---|
| id | uuid | PK |
| email | text | 로그인 이메일 (unique) |
| password | text | 해시 (Payload 자동 처리) |
| role | select | admin / editor |

**초기 계정:** admin 1개 + editor 2개

---

### 2.6 Better-Auth 테이블 — 일반 독자 인증

Better-Auth가 Turso DB에 자동으로 생성하는 테이블. 댓글 작성 등 일반 유저 전용.

| 테이블 | 설명 |
|:---|:---|
| `user` | 일반 유저 계정 (email, name, emailVerified 등) |
| `session` | 세션 토큰 (expiresAt, 7일 유효) |
| `account` | OAuth 계정 연결 (향후 소셜 로그인 확장 시) |
| `verification` | 이메일 인증 토큰 |

**인증 방식:** 이메일 + 비밀번호 (현재), 소셜 로그인 (v2 예정)

---

## 3. 관계도

```
people 1──N interviews   (인물 1명이 여러 인터뷰를 가짐)
people N──M tags         (인물은 여러 태그를 가질 수 있음)
interviews N──M tags     (인터뷰도 여러 태그를 가질 수 있음)
interviews N──1 media    (커버 이미지)
people N──1 media        (프로필 사진)
```

---

## 4. Payload 컬렉션 파일 구조

```
src/
  collections/
    People.ts
    Interviews.ts
    Tags.ts
    Media.ts
    Users.ts
  payload.config.ts
```

---

## 5. 환경변수

```bash
# Turso (SQLite) — Payload CMS DB
DATABASE_URL=libsql://web3people-azerckid.aws-ap-northeast-1.turso.io
DATABASE_AUTH_TOKEN=...               # turso db tokens create web3people

# Payload CMS
PAYLOAD_SECRET=...                    # JWT 서명 키 (32자 이상 랜덤)

# Better-Auth (일반 유저 인증, 동일 Turso DB 사용)
BETTER_AUTH_SECRET=...                # 인증 서명 키
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 개발: localhost, 배포: 프로덕션 도메인

# 이미지 스토리지 (미정)
# BLOB_READ_WRITE_TOKEN=...           # Vercel Blob (선택)
```

---

## Related Documents
- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - 기능 명세 및 필드 요구사항
- **Technical_Specs**: [API Specs](./02_API_SPECS.md) - 데이터 조회 API 설계
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - 스키마 구현 태스크
