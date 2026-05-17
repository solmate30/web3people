# Identity & Auth Strategy — web3people
> Created: 2026-05-05 11:28
> Last Updated: 2026-05-17 15:40

## 1. 전략 요약

web3people의 인증은 단순한 회원가입이 아니라, 독자가 어떤 아이덴티티로 대화에 참여할지 선택하는 경험이어야 한다.

핵심 방향은 **Better-Auth 기반, Multi-Identity, Community-ready**이다.

- 매거진 읽기: 로그인 없이 공개
- 댓글/게시판 작성: 로그인 필요
- 대표 아이덴티티: 이메일 계정, 소셜 계정, 지갑 주소 중 사용자가 선택
- 기본 UX: 이메일/비밀번호, Google, GitHub, 지갑 로그인을 모두 제공해 진입 장벽과 web3 정체성을 함께 잡는다
- 장기 확장: ENS, Farcaster, X/Twitter, 온체인 배지, contributor badge로 확장

---

## 2. 왜 지갑 로그인을 기본 축으로 두는가

web3people은 web3 빌더와 독자의 인터뷰 매거진이다. 따라서 댓글과 커뮤니티 참여도 일반 계정이 아니라 **검증 가능한 web3 identity**에 연결되는 편이 브랜드와 제품 방향에 맞다.

지갑 로그인은 다음 가치를 만든다.

| 가치 | 설명 |
|:---|:---|
| 신뢰 | 댓글 작성자가 특정 주소의 소유자임을 증명할 수 있다 |
| 확장성 | 향후 NFT badge, contributor badge, token-gated feature로 확장 가능하다 |
| 차별성 | 일반 매거진 댓글보다 web3 커뮤니티형 참여 경험을 제공한다 |
| 소유권 감각 | 독자가 web3people 안에서 자신의 정체성을 소유한다는 느낌을 준다 |

단, 지갑 연결이 “돈을 쓰는 행동”처럼 보이면 안 된다. 로그인 화면에는 다음 메시지를 명확히 표시한다.

> No transaction. Signature only.
> 지갑 서명만 요청하며, 트랜잭션이나 수수료는 발생하지 않습니다.

---

## 3. 로그인 옵션 우선순위

### 3.1 MVP 로그인 옵션

| 우선순위 | 옵션 | 목적 |
|:---:|:---|:---|
| 1 | Continue with Email | 가장 예측 가능한 기본 회원가입/로그인 |
| 2 | Continue with Google | 일반 독자 진입 장벽 최소화 |
| 3 | Continue with GitHub | web3 빌더/개발자 독자층과의 친화성 |
| 4 | Continue with Wallet | web3people의 대표 아이덴티티 경험 |

MVP에서는 이메일/비밀번호, Google, GitHub, 지갑 로그인을 모두 허용한다. 소셜 로그인 구현 세부 방식은 기존에 사용해온 프로젝트 패턴이 있으므로 실제 작업 직전에 사용자에게 확인한다.

### 3.2 Next 단계

- X/Twitter 계정 연결
- Farcaster 계정 연결
- ENS / Basename 표시
- 지갑 연결 유저에게 `Verified Wallet` 배지 표시
- 댓글 옆에 `0x12ab...89ef`, ENS, Farcaster handle 중 사용자가 선택한 표시명 노출

---

## 4. 가입/로그인 UX 원칙

### 4.1 회원가입이 아니라 Identity 연결

화면 언어는 “회원가입”보다 “아이덴티티 선택/연결”에 가깝게 설계한다.

권장 카피:

```text
Choose how you show up
Connect a wallet or social account to join the conversation.
```

한국어:

```text
어떤 아이덴티티로 참여할까요?
지갑 또는 소셜 계정으로 로그인하고 대화에 참여하세요.
```

### 4.2 댓글 작성 플로우

비로그인 독자는 인터뷰와 댓글을 읽을 수 있다. 댓글 입력 영역에서는 로그인 CTA만 보여준다.

```text
Connect your identity to join the conversation.
댓글을 작성하려면 지갑 또는 소셜 계정으로 로그인해 주세요.
```

로그인한 독자는 댓글 작성이 가능하며, 댓글은 별도 승인 없이 즉시 공개된다. 운영 리스크는 사전 승인보다 사후 관리, 신고, 삭제, rate limit, 계정 제재로 대응한다.

---

## 5. 지갑 주소 발급에 대한 결정

가입 시 서비스가 임의로 개인키를 생성하고 보관하는 방식은 사용하지 않는다.

이유:

- private key 보관 책임이 과도하게 커진다
- 유출/복구/분실 대응이 MVP 범위를 넘어선다
- 매거진 서비스가 지갑 커스터디 서비스처럼 오해될 수 있다
- 보안 감사와 운영 부담이 커진다

대신 사용자가 본인의 지갑으로 로그인하도록 한다. 사용자가 지갑이 없는 경우에는 Google 또는 Email로 시작할 수 있고, 나중에 지갑을 연결할 수 있다.

향후 embedded wallet이 필요해질 경우에도 직접 키를 저장하지 않고, 검증된 embedded wallet provider 또는 smart account provider를 검토한다.

---

## 6. 기술 방향

### 6.1 지갑 로그인

표준 패턴은 SIWE(Sign-In with Ethereum)이다.

흐름:

1. 클라이언트가 지갑 연결을 요청한다
2. 서버가 nonce를 발급한다
3. 사용자가 지갑으로 메시지에 서명한다
4. 서버가 서명과 nonce를 검증한다
5. 검증된 wallet address를 독자 프로필에 연결한다
6. 세션을 발급한다

중요 원칙:

- 트랜잭션 요청 없음
- 가스비 없음
- 서명 메시지는 명확하고 짧게
- nonce 재사용 방지
- 세션 만료와 로그아웃 정책 명확화

### 6.2 소셜 로그인

Better-Auth의 OAuth 계정 연결 구조를 사용한다.

MVP 후보:

- Google
- GitHub

Next 후보:

- X/Twitter
- Farcaster

소셜 계정은 독립 유저를 계속 늘리는 방식이 아니라, 하나의 독자 프로필에 여러 identity를 연결하는 방식이어야 한다.

### 6.3 이메일 로그인

이메일/비밀번호는 백업 옵션으로 둔다.

초기에는 이메일 인증을 강제하지 않을 수 있지만, 스팸이나 계정 남용이 발생하면 다음 순서로 강화한다.

1. 댓글 rate limit
2. 이메일 인증
3. 지갑 또는 소셜 연결 계정 우선 노출
4. 신규 계정 작성 제한 또는 임시 숨김 정책

---

## 7. 데이터 모델 방향

현재 문서 기준으로 Payload `users`는 어드민/편집자 전용이고, 일반 독자는 Better-Auth 테이블을 사용한다. 이 분리는 유지한다.

추가로 독자 프로필 개념을 명확히 하기 위해 다음 모델을 검토한다.

| 모델 | 설명 |
|:---|:---|
| reader profile | 댓글 표시명, bio, 대표 identity, 관심 태그 |
| connected identity | wallet, Google, X/Twitter, Farcaster 등 연결 계정 |
| wallet address | 검증된 지갑 주소, chain, ENS/Basename 표시명 |
| comment | author profile 또는 auth user와 연결, 즉시 공개 후 사후 관리 |

MVP에서도 Better-Auth를 독자 인증의 기준으로 사용한다. 댓글 작성자 표시, 지갑/소셜 연결, 게시판 작성자 프로필을 안정적으로 다루기 위해 Payload `users`와 분리된 `readerProfiles` 성격의 독자 프로필 모델을 검토한다.

---

## 8. 기능 단계

### 8.1 Phase 1 — 댓글 가능한 인증 MVP

- Email/password 로그인
- Google 로그인
- GitHub 로그인
- Wallet 로그인
- 인터뷰 상세 하단 댓글 UI
- 비로그인 댓글 CTA
- 로그인 후 댓글 작성
- 댓글 즉시 공개
- 작성자 본인 수정/삭제, 관리자 삭제

### 8.2 Phase 2 — Web3 Identity 강화

- ENS/Basename 표시
- 지갑 연결 배지
- X/Twitter, Farcaster 연결
- 독자 프로필 페이지 또는 미니 프로필
- 댓글 작성자 identity card

### 8.3 Phase 3 — 게시판 커뮤니티 확장

- 독립 게시판 (`/board`)
- 인터뷰 연결 게시판/토론
- 인물 연결 게시판/토론
- 게시글 댓글
- 신고/숨김/운영자 모더레이션

### 8.4 Phase 4 — 온체인/커뮤니티 확장

- contributor badge
- 인터뷰 참여/댓글 활동 기반 badge
- token-gated AMA 또는 멤버 전용 댓글
- 지갑 기반 reputation signal

---

## 9. 365 Rubric 검토

| Rubric | 적용 방향 |
|:---|:---|
| Functionality | 읽기는 공개, 댓글은 인증 필요로 단순하고 명확한 MVP를 만든다 |
| Impact | web3 독자와 빌더가 지갑/소셜 identity로 이어지는 커뮤니티 기반을 만든다 |
| Novelty | 일반 매거진 댓글이 아니라 wallet/social identity 기반 참여 경험을 제공한다 |
| UX | 지갑을 메인으로 두되 Google/Email로 진입 장벽을 낮춘다 |
| Open-source | SIWE, Better-Auth, OAuth 등 표준 패턴을 사용해 확장성을 유지한다 |
| Business Plan | 장기적으로 멤버십, badge, AMA, contributor network로 확장 가능한 인증 기반을 만든다 |

---

## 10. 결정 사항

- 매거진 콘텐츠 읽기는 로그인 없이 허용한다
- 댓글 작성은 로그인 필요로 한다
- 지갑 로그인을 핵심 옵션으로 둔다
- Google 소셜 로그인을 MVP에 포함한다
- 이메일 로그인은 백업 옵션으로 유지한다
- 서비스가 사용자의 private key를 직접 생성하거나 보관하지 않는다
- 일반 독자 계정은 Payload `users`와 분리한다
- 댓글은 승인 없이 회원이 자유롭게 작성하고 즉시 공개한다
- 독립 게시판, 인터뷰 연결 게시판, 인물 연결 게시판을 모두 장기 구조에 포함한다
- 소셜 로그인 구현 방식은 실제 작업 직전에 기존 사용 패턴을 사용자에게 확인한다

---

## 11. Related Documents

- **Concept_Design**: [Product Specs](./02_PRODUCT_SPECS.md) - 일반 유저 인증과 댓글 기능의 상위 제품 명세
- **Concept_Design**: [Roadmap](./03_ROADMAP.md) - 인증/댓글 기능의 단계별 구현 위치
- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - Payload users와 Better-Auth 테이블 분리 기준
- **Technical_Specs**: [API Specs](../03_Technical_Specs/02_API_SPECS.md) - 댓글 작성 API와 인증 검증 흐름 반영 대상
- **Technical_Specs**: [Reader Auth, Board, Comments Spec](../03_Technical_Specs/03_READER_AUTH_BOARD_COMMENTS_SPEC.md) - 독자 인증과 커뮤니티 기능 구현 명세
- **Logic_Progress**: [Backlog](../04_Logic_Progress/00_BACKLOG.md) - 인증/댓글 구현 태스크 관리
- **QA_Validation**: [QA Checklist](../05_QA_Validation/01_QA_CHECKLIST.md) - 로그인, 댓글 작성, 게시판 QA 기준 반영 대상
