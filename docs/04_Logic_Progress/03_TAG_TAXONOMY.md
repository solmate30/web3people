# Tag Taxonomy — web3people
> Created: 2026-05-17 18:53
> Last Updated: 2026-05-17 18:53

## 1. 목적

검색, 관련 인터뷰, 향후 태그 필터 페이지가 같은 기준으로 동작하도록 태그 분류와 입력 규칙을 정의한다. 태그는 콘텐츠를 꾸미는 키워드가 아니라 독자가 인물과 인터뷰를 탐색하는 색인으로 관리한다.

## 2. 기본 원칙

- `name`은 화면 표시명이다. 대문자, 공백, 브랜드 표기는 독자가 알아보기 쉬운 형태를 유지한다.
- `slug`는 URL과 필터에 쓰는 식별자다. 영문 소문자, 숫자, 하이픈만 사용한다.
- 같은 의미의 태그는 하나만 둔다. 예: `AI`, `ai`, `AI+Web3`를 섞지 않고 대표 표기를 정한다.
- 태그는 너무 넓거나 너무 좁지 않게 둔다. 2개 이상의 콘텐츠에 재사용될 가능성이 낮으면 태그 대신 본문/요약으로 표현한다.
- 인물 태그와 인터뷰 태그는 같은 `Tags` 컬렉션을 쓴다. 현재 배포 DB에는 별도 분류 컬럼을 추가하지 않고, 이 문서의 분류 기준으로 운영한다.
- 향후 태그 필터가 커지면 `category` 필드 도입을 검토하되, 운영 DB 마이그레이션 계획과 함께 진행한다.

## 3. 인물 태그 분류

| 분류 | 값 | 용도 | 예시 |
|:---|:---|:---|:---|
| 직군 | `role` | 인물의 주된 역할 | Founder, Investor, Developer, Artist, Researcher |
| 분야 | `domain` | 전문 분야 또는 활동 영역 | DeFi, NFT, AI, ZK, Infrastructure |
| 생태계 | `ecosystem` | 주로 활동하는 체인/프로토콜 생태계 | Ethereum, Solana, Base, Cosmos |
| 지역/언어 | `region` | 지역, 언어권, 커뮤니티 맥락 | Korea, Japan, Global, Korean |
| 관심사 | `interest` | 반복적으로 드러나는 관심 주제 | Public Goods, Creator Economy, Governance |

## 4. 인터뷰 태그 분류

| 분류 | 값 | 용도 | 예시 |
|:---|:---|:---|:---|
| 주제 | `topic` | 인터뷰의 핵심 논점 | Product Strategy, Community, Tokenomics |
| 산업 | `industry` | 독자가 비교할 수 있는 시장/산업 | Gaming, Finance, Social, Identity |
| 독자 대상 | `audience` | 추천 독자층 | Builders, Investors, Creators, Beginners |
| 시리즈/기획 | `series` | 편집 기획 또는 연재 묶음 | Web3 People, Founder Notes, Korea Builders |

## 5. 입력 규칙

1. 새 태그 생성 전 기존 태그를 검색한다.
2. `name`은 사람이 읽는 표시명으로 작성한다.
3. `slug`는 `name`의 의미를 보존하되 URL 친화적으로 작성한다.
4. 인물에는 `role`, `domain`, `ecosystem`, `region`, `interest` 태그를 우선 연결한다.
5. 인터뷰에는 `topic`, `industry`, `audience`, `series` 태그를 우선 연결한다.
6. 한 콘텐츠에 태그를 과도하게 붙이지 않는다. 초기 운영 기준은 인물 3~7개, 인터뷰 3~6개다.

## 6. 향후 필터 페이지 기준

V2-03에서 `/tags/[slug]` 페이지를 만들 경우, `slug`는 공개 URL의 고정 식별자가 된다. 이미 공개된 태그 slug를 바꿀 때는 리다이렉트 또는 검색 링크 영향도를 함께 확인한다.

## 7. Related Documents

- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - `Tags` 컬렉션 필드 기준
- **Technical_Specs**: [API Specs](../03_Technical_Specs/02_API_SPECS.md) - 검색과 공개 태그 조회 기준
- **Logic_Progress**: [Backlog](./00_BACKLOG.md) - V2-02와 V2-03 진행 상태
- **Concept_Design**: [Roadmap](../01_Concept_Design/03_ROADMAP.md) - Phase 4A 탐색 기능 순서
