# QA Checklist — web3people MVP
> Created: 2026-03-29 00:00
> Last Updated: 2026-03-29 00:00

## 1. Global Rubric Scorecard

| 기준 | 목표 상태 | 비고 |
|:---|:---:|:---|
| **Functionality** | 런칭 시 Pass | 인물+인터뷰 CRUD, 어드민 발행 정상 작동 |
| **Potential Impact** | 중기 목표 | 인물 중심 web3 미디어 선점, 커뮤니티 확산 |
| **Novelty** | Pass | 인물 중심 포지셔닝은 기존 web3 미디어에 없음 |
| **UX** | 런칭 시 Pass | LCP 2.5초 이내, 모바일 반응형, 한국어 타이포 |
| **Open-source** | N/A (v1) | 추후 컴포넌트 라이브러리화 검토 |
| **Business Plan** | 미정 | 광고 수익 모델 v2에서 구체화 |

---

## 2. 기능 테스트 시나리오

### 2.1 어드민 — 인물 등록

| # | 시나리오 | 기대 결과 | 상태 |
|:---|:---|:---|:---:|
| A-01 | editor 계정으로 `/admin` 접속 | 어드민 대시보드 표시 | - |
| A-02 | 새 인물 생성 (모든 필수 필드 입력) | 저장 성공, slug 자동 생성 | - |
| A-03 | 인물 status를 published로 변경 | 프론트에서 인물 카드 표시됨 | - |
| A-04 | 프로필 사진 업로드 (JPEG 2MB) | 이미지 최적화 후 표시 | - |
| A-05 | admin이 아닌 editor는 Users 컬렉션 접근 불가 | 접근 차단 | - |

### 2.2 어드민 — 인터뷰 작성/발행

| # | 시나리오 | 기대 결과 | 상태 |
|:---|:---|:---|:---:|
| B-01 | 새 인터뷰 생성 + 인물 연결 | 저장 성공 | - |
| B-02 | Q&A 블록 작성 (3개 이상) | richtext 저장 정상 | - |
| B-03 | draft → published 변경 | 홈/목록 페이지에 즉시 반영 (60초 ISR 이내) | - |
| B-04 | 커버 이미지 없이 발행 시도 | 유효성 오류 표시 | - |

### 2.3 프론트엔드 — 독자 경험

| # | 시나리오 | 기대 결과 | 상태 |
|:---|:---|:---|:---:|
| C-01 | 홈페이지 접속 | 히어로 + 인터뷰 그리드 + 인물 카드 표시 | - |
| C-02 | 인터뷰 카드 클릭 | `/interviews/[slug]` 이동, Q&A 본문 정상 표시 | - |
| C-03 | 인물 카드 클릭 | `/people/[slug]` 이동, 프로필 + 인터뷰 목록 표시 | - |
| C-04 | 존재하지 않는 slug 접근 | 404 페이지 표시 | - |
| C-05 | draft 상태 인터뷰 URL 직접 접근 | 404 페이지 표시 | - |

---

## 3. 성능 체크리스트

- [ ] Lighthouse LCP 2.5초 이내 (모바일)
- [ ] Lighthouse Performance 점수 80 이상
- [ ] 이미지: Next.js Image 컴포넌트 사용, webp 변환 확인
- [ ] 폰트: `display: swap` 설정

---

## 4. SEO 체크리스트

- [ ] 홈 OG 태그 (title, description, image)
- [ ] 인터뷰 상세 OG 태그 (동적 생성)
- [ ] 인물 프로필 OG 태그 (동적 생성)
- [ ] JSON-LD: Article 스키마 (인터뷰)
- [ ] JSON-LD: Person 스키마 (인물 프로필)
- [ ] `robots.txt` 설정
- [ ] `sitemap.xml` 자동 생성

---

## 5. 반응형/크로스브라우저 체크리스트

- [ ] iPhone 14 (375px) — 카드 1컬럼, 헤더 햄버거
- [ ] iPad (768px) — 카드 2컬럼
- [ ] 데스크탑 (1440px) — 카드 3컬럼, 히어로 풀폭
- [ ] Chrome, Safari, Firefox 기본 확인

---

## Related Documents
- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - 기능 명세 기준
- **UI_Screens**: [UI Design](../02_UI_Screens/01_UI_DESIGN.md) - 디자인 기준
- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - 데이터 모델 검증 기준
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - QA 전 완료 필요 태스크
