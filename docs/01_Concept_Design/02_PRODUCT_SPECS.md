# Product Specs — web3people MVP
> Created: 2026-03-29 00:00
> Last Updated: 2026-05-17 16:05

## 1. MVP 정의

런칭 목표: **2026-04-15**
핵심 원칙: 편집자가 어드민에서 콘텐츠를 발행하고, 독자가 인물과 인터뷰를 탐색할 수 있는 상태.

MVP에 포함:
- 인물(Person) 프로필 페이지
- 인터뷰(Interview) 상세 페이지
- 홈페이지 (최신 인터뷰 목록)
- 어드민 패널 (편집자 2명 사용)

MVP에서 제외되었고 고도화 단계에서 다룰 기능:
- 검색 기능
- 뉴스레터 구독
- 카테고리 필터
- 다국어(영어) 지원
- 독자 회원가입/로그인
- 댓글/게시판/반응

---

## 2. 사이트맵

```
/                       홈 — 최신 인터뷰 카드 피드
/interviews             인터뷰 목록
/interviews/[slug]      인터뷰 상세 (Q&A 본문)
/people                 인물 목록
/people/[slug]          인물 프로필 (소개 + 해당 인물 인터뷰 목록)
/admin                  어드민 패널 (Payload CMS)
```

---

## 3. 핵심 기능 명세

### 3.1 인물(Person) 프로필

| 필드 | 타입 | 필수 | 설명 |
|:---|:---|:---:|:---|
| name | text | Y | 이름 (한국어/영문) |
| slug | text | Y | URL용 고유 식별자 |
| photo | image | Y | 프로필 사진 |
| title | text | Y | 현재 직함/역할 |
| organization | text | N | 소속 회사/프로젝트 |
| bio | richtext | Y | 소개 (롱폼) |
| country | text | N | 국가 |
| tags | relation | N | 키워드 태그 (DeFi, NFT, L2 등) |
| socials | group | N | Twitter, LinkedIn, Website |
| interviews | relation | - | 해당 인물의 인터뷰 목록 (자동 연결) |

**페이지 구성:**
- 상단: 프로필 사진 + 이름 + 직함 + 소속
- 중단: 소개 텍스트
- 하단: 이 인물의 인터뷰 카드 목록

### 3.2 인터뷰(Interview)

| 필드 | 타입 | 필수 | 설명 |
|:---|:---|:---:|:---|
| title | text | Y | 인터뷰 제목 |
| slug | text | Y | URL용 고유 식별자 |
| subject | relation | Y | 인터뷰 대상 인물 (Person) |
| coverImage | image | Y | 대표 이미지 |
| excerpt | text | Y | 요약 (카드에 표시, 140자 내외) |
| content | blocks | Y | 본문 (qa / text / image 블록) |
| publishedAt | datetime | N | 발행일 (발행 시 자동 설정) |
| status | select | Y | draft / published |
| tags | relation | N | 키워드 태그 |

**페이지 구성:**
- 상단: 대표 이미지 풀블리드 + 제목 오버레이
- 인물 소개 블록 (사진, 이름, 직함 — Person 연결)
- 본문: Q&A 포맷 (질문 bold, 답변 일반)
- 하단: 다른 인터뷰 추천 카드

### 3.3 홈페이지

- 히어로 섹션: 최신/featured 인터뷰 1개 (풀폭 이미지)
- 최신 인터뷰 그리드: 최근 6~8개
- 인물 리스트 미리보기: 최근 등록 인물 4~6개

### 3.4 어드민 패널

- 경로: `/admin`
- Payload CMS v3 내장 어드민
- 권한: Editor 계정 2개 (콘텐츠 CRUD, 미디어 업로드)
- 기능: 인터뷰 작성/수정/발행, 인물 등록/수정, 이미지 업로드

### 3.5 독자 참여 기능 (고도화 준비)

MVP 런칭 이후 독자 참여 기반을 추가한다.

- 독자 로그인: Better Auth 기반 Email/password, Google, GitHub, Wallet
- 댓글: 로그인 독자만 작성, 승인 없이 즉시 공개
- 게시판: 독립 게시판, 인터뷰 연결 게시판, 인물 연결 게시판
- 운영: rate limit, 신고/숨김, 관리자 삭제 또는 숨김

---

## 4. 비기능 요구사항

| 항목 | 목표 |
|:---|:---|
| 페이지 로드 (LCP) | 2.5초 이내 |
| 모바일 반응형 | 필수 |
| SEO | OG 태그, 구조화 데이터(Person, Article) |
| 이미지 최적화 | Next.js Image 컴포넌트 사용 |
| 한국어 타이포그래피 | word-break: keep-all |

---

## 5. 기술 스택

| 역할 | 선택 | 이유 |
|:---|:---|:---|
| 프레임워크 | Next.js 16 (App Router) | SSG/ISR으로 SEO + 성능 최적화 |
| CMS / 어드민 | Payload CMS v3 | Next.js 내장, 별도 서버 불필요 |
| 데이터베이스 | **Turso (SQLite, libsql)** | Edge 기반 고속 SQLite, Payload `db-sqlite` 어댑터 사용 |
| 인증 (어드민) | Payload CMS 기본 Auth | 어드민/편집자 전용 |
| 인증 (일반 유저) | **Better Auth** | 독자 로그인, 댓글/게시판 작성 등 프론트엔드 유저 전용 |
| 스타일링 | Tailwind CSS v4 + **shadcn/ui** | 빠른 전역 스타일링과 접근성이 완벽한 기본 컴포넌트 뼈대 복사/커스텀 사용 |
| 배포 | Vercel | Next.js 최적화, 간편 CI/CD |
| 이미지 스토리지 | Cloudinary | Payload Media 업로드와 CDN 변환 |

---

## 6. 현재 구현 상태 (2026-05-17 기준)

| 영역 | 상태 | 비고 |
|:---|:---:|:---|
| 인물/인터뷰/태그/미디어/유저/댓글 컬렉션 | 구현됨 | 댓글 정책은 즉시 공개 방향으로 재정의 필요 |
| 공개 프론트 페이지 | 구현됨 | 홈, 인터뷰 목록/상세, 인물 목록/상세 |
| Payload Admin | 구현됨 | 운영 계정 생성/권한 검증은 별도 확인 필요 |
| Cloudinary 업로드 | 구현됨 | 환경변수 없으면 로컬 스토리지 폴백 |
| Better Auth 기본 라우트 | 구현됨 | Email/password 기반 존재, 소셜/지갑은 구현 전 확인 필요 |
| 검색/태그 필터 | 미구현 | Phase 4A |
| 댓글/게시판 | 미구현 | Phase 4B |
| JSON-LD/사이트맵/robots | 미구현 | SEO 보강 필요 |

---

## Related Documents
- **Concept_Design**: [Lean Canvas](./01_LEAN_CANVAS.md) - 비즈니스 모델 및 포지셔닝
- **Concept_Design**: [Roadmap](./03_ROADMAP.md) - 단계별 실행 계획
- **UI_Screens**: [UI Design](../02_UI_Screens/01_UI_DESIGN.md) - 디자인 시스템
- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - 데이터 모델 상세
- **Technical_Specs**: [Reader Auth, Board, Comments Spec](../03_Technical_Specs/03_READER_AUTH_BOARD_COMMENTS_SPEC.md) - 독자 참여 기능 준비 명세
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - 개발 태스크 목록
