# Roadmap — web3people
> Created: 2026-03-29 00:00
> Last Updated: 2026-03-29 19:00

## 런칭 타임라인

목표 런칭일: **2026-04-15**

---

## Now — Phase 1: 기반 세팅 (2026-03-29 ~ 2026-04-01)

**목표**: 개발 환경 구성 완료, 콘텐츠 스키마 확정

- [x] Next.js 16 + Payload CMS v3 프로젝트 초기화 (`@payloadcms/db-sqlite` 어댑터)
- [x] Turso (SQLite) 데이터베이스 생성 및 연결
- [x] Better-Auth 설치 및 Route Handler 구성
- [x] Tailwind CSS v4 + shadcn/ui + 디자인 토큰 적용
- [x] Payload Admin 패널 정상 기동 확인
- [ ] People, Interviews, Tags, Comments, Media, Users 컬렉션 스키마 정의
- [ ] 어드민 계정 생성 (admin 1 + editor 2)
- [ ] Vercel 프로젝트 연결 및 환경변수 설정
- [ ] 이미지 스토리지 설정 (Vercel Blob 또는 Cloudinary)

---

## Now — Phase 2: 프론트엔드 개발 (2026-04-01 ~ 2026-04-08)

**목표**: 독자용 페이지 완성

- [ ] 디자인 시스템 폰트 로드 (Outfit + JetBrains Mono, Google Fonts)
- [ ] 공통 컴포넌트 (Header, Footer, InterviewCard, PersonCard)
- [ ] 홈페이지 (히어로 + 인터뷰 그리드 + 인물 미리보기)
- [ ] 인터뷰 목록 페이지 (`/interviews`)
- [ ] 인터뷰 상세 페이지 (`/interviews/[slug]`)
- [ ] 인물 목록 페이지 (`/people`)
- [ ] 인물 프로필 페이지 (`/people/[slug]`)
- [ ] 반응형 모바일 레이아웃

---

## Now — Phase 3: SEO + 콘텐츠 입력 (2026-04-08 ~ 2026-04-13)

**목표**: 런칭 가능 상태

- [ ] OG 태그 / 메타데이터 설정
- [ ] JSON-LD 구조화 데이터 (Person, Article)
- [ ] 시딩: 인물 3~5명, 인터뷰 3~5개 초기 콘텐츠 입력
- [ ] 편집자 어드민 사용법 가이드 (간단 문서)
- [ ] 크로스브라우저 QA

---

## Launch — 2026-04-15

**체크리스트:**
- [ ] 도메인 연결
- [ ] 프로덕션 DB 최종 확인
- [ ] 이미지 최적화 최종 점검
- [ ] 소셜 미디어 계정 준비

---

## Next — Phase 4: 런칭 후 (2026-04-16 ~)

**우선순위 순:**
1. 검색 기능 (인물명, 인터뷰 제목)
2. 태그/카테고리 필터 (DeFi, NFT, L2, Gaming 등)
3. 뉴스레터 구독 (이메일 수집)
4. 소셜 공유 버튼 최적화
5. 영문 병행 (선택)

---

## Later — Phase 5: 성장 (3개월 이후)

- 뉴스레터 스폰서십 모델 구축
- 광고 인벤토리 정리
- 인터뷰 시리즈 기획 (테마별)
- 인물 추천/제보 기능
- 아카이브 / 연대기 뷰

---

## Related Documents
- **Concept_Design**: [Lean Canvas](./01_LEAN_CANVAS.md) - 비즈니스 목표 및 수익 모델
- **Concept_Design**: [Product Specs](./02_PRODUCT_SPECS.md) - MVP 기능 상세
- **UI_Screens**: [UI Design](../02_UI_Screens/01_UI_DESIGN.md) - 디자인 방향
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - 상세 개발 태스크
