# Member Management TODO — web3people
> Created: 2026-05-18 00:00
> Last Updated: 2026-05-18 00:00

## 1. 목적

배포된 독자 로그인, 댓글, 게시판 기능을 다음 단계에서 안정적으로 운영하기 위해 회원 관리 정책과 관리자 운영 흐름을 정리한다.

이 문서는 바로 구현 명세가 아니라, 다음 스프린트에서 검토할 TODO 목록이다. 핵심 목표는 Better Auth 기반 독자 계정과 Payload 관리자 계정을 섞지 않으면서, 회원 상태와 작성 이력을 관리할 수 있는 구조를 확정하는 것이다.

## 2. 회원 역할 정리

- [ ] 독자 기본 역할을 `reader`로 정의한다.
- [ ] 운영자 역할을 `editor`, `admin`으로 분리 유지한다.
- [ ] Payload `users`는 관리자/편집자 전용으로 유지할지 재확인한다.
- [ ] Better Auth user에 서비스 내부 role을 직접 둘지, 별도 reader profile에서 관리할지 결정한다.
- [ ] 관리자 권한 변경은 누가, 어디에서 할 수 있는지 운영 기준을 정한다.

## 3. Better Auth 사용자와 Payload 데이터 연결

- [ ] Better Auth user id, email, name을 현재 댓글/게시글 작성자 정보와 어떻게 연결할지 정리한다.
- [ ] `readerProfiles` 컬렉션 도입 여부를 결정한다.
- [ ] 댓글/게시글의 기존 `authorEmail` 기반 소유권 검증을 장기적으로 user id 기반으로 바꿀지 검토한다.
- [ ] 이메일 변경, 소셜 계정 연결 변경 시 기존 작성 이력이 끊기지 않도록 기준을 정한다.
- [ ] Payload Admin에서 독자 프로필을 읽기 전용으로 볼지, 일부 편집 가능하게 할지 결정한다.

## 4. 소셜 로그인 프로필 관리

- [ ] Google 로그인 사용자의 표시명, 이메일, 프로필 이미지 저장 기준을 정한다.
- [ ] GitHub provider 추가 전 callback URL, env 이름, profile mapping을 확인한다.
- [ ] 같은 이메일로 가입한 email/password 계정과 Google/GitHub 계정을 병합할지 결정한다.
- [ ] provider별 계정 연결 실패, 중복 계정 생성, 이메일 비공개 케이스 처리 기준을 정한다.
- [ ] 로그인 provider 목록을 사용자에게 어떻게 표시할지 정리한다.

## 5. 지갑 로그인과 계정 병합

- [ ] 지갑 로그인 구현 방식을 확정한다: SIWE 직접 구성, Better Auth plugin, 기존 프로젝트 패턴 중 선택.
- [ ] wallet address를 독립 계정으로 볼지, 기존 독자 계정에 연결하는 identity로 볼지 결정한다.
- [ ] 대표 identity 표시 기준을 정한다: email name, Google name, GitHub handle, wallet address, ENS/Basename.
- [ ] 지갑 주소 변경, 여러 지갑 연결, 지갑 연결 해제 정책을 정한다.
- [ ] 서명 메시지, nonce 만료, 재사용 방지 기준을 문서화한다.

## 6. 차단, 탈퇴, 삭제 정책

- [ ] 회원 상태를 정의한다: active, suspended, deleted 등.
- [ ] 차단된 사용자의 댓글/게시글 작성 차단 방식을 정한다.
- [ ] 차단된 사용자의 기존 댓글/게시글을 유지할지 숨길지 정책을 정한다.
- [ ] 탈퇴 시 개인정보는 삭제하되 작성 이력은 익명화해서 보존할지 결정한다.
- [ ] 운영자가 회원을 차단/해제하는 관리자 화면 요구사항을 정한다.

## 7. 댓글과 게시글 작성 이력 보존

- [ ] 댓글 작성자 표시명 변경 시 과거 댓글 표시가 함께 바뀌는지 결정한다.
- [ ] 게시글 작성자 표시명 변경 시 과거 게시글 표시가 함께 바뀌는지 결정한다.
- [ ] 삭제된 회원의 작성물을 `Deleted user`로 표시할지 결정한다.
- [ ] author email을 API 응답에서 계속 숨기는 정책을 유지한다.
- [ ] 활동 내역 페이지 또는 관리자 활동 로그가 필요한지 검토한다.

## 8. 관리자 화면 운영

- [ ] Payload Admin에서 독자 목록을 볼 수 있는 최소 컬럼을 정한다.
- [ ] 표시 컬럼 후보: email, name, provider, status, createdAt, lastLoginAt.
- [ ] 회원 상세에서 댓글/게시글 수를 보여줄지 검토한다.
- [ ] 회원 차단, 작성물 숨김, 작성물 삭제를 같은 화면에서 할지 분리할지 결정한다.
- [ ] 개인정보 노출을 줄이기 위해 관리자별 권한 차이를 둘지 결정한다.

## 9. 우선순위

| 우선순위 | 항목 | 이유 |
|:---:|:---|:---|
| 1 | `readerProfiles` 도입 여부 결정 | 댓글/게시판 작성자 모델의 장기 기준이 된다 |
| 2 | 회원 상태와 차단 정책 | 자유 댓글/게시판 운영에서 가장 먼저 필요하다 |
| 3 | 계정 병합 정책 | email, Google, GitHub, wallet을 모두 허용하기 때문이다 |
| 4 | 관리자 화면 요구사항 | 실제 운영자가 회원을 관리해야 한다 |
| 5 | 탈퇴/익명화 정책 | 개인정보와 작성 이력 보존 기준이 필요하다 |

## 10. Related Documents

- **Concept_Design**: [Identity & Auth Strategy](../01_Concept_Design/04_IDENTITY_AUTH_STRATEGY.md) - 독자 identity와 로그인 옵션의 상위 전략
- **Technical_Specs**: [Reader Auth, Board, Comments Spec](../03_Technical_Specs/03_READER_AUTH_BOARD_COMMENTS_SPEC.md) - 현재 구현된 독자 인증, 댓글, 게시판 기준
- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - Payload 컬렉션과 Better Auth 테이블 기준
- **Logic_Progress**: [Backlog](./00_BACKLOG.md) - 다음 작업 순서와 상태 관리
- **QA_Validation**: [QA Checklist](../05_QA_Validation/01_QA_CHECKLIST.md) - 회원 관리 도입 후 검증 항목 반영 대상
