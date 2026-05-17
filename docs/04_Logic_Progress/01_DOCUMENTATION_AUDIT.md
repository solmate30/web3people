# Documentation Audit — web3people
> Created: 2026-05-17 16:05
> Last Updated: 2026-05-17 16:05

## 1. 목적

이미 배포되어 서비스 중인 코드와 문서의 진행 상태가 어긋나지 않도록, 2026-05-17 기준으로 문서 체계를 점검하고 정리한 결과를 기록한다.

이번 감사의 기준:

- 실제 구현된 코드와 문서 체크박스가 일치해야 한다.
- Payload 컬렉션 필드명은 현재 TypeScript 코드 기준을 우선한다.
- MVP와 고도화 단계의 범위를 분리한다.
- 모든 문서는 Created, Last Updated, Related Documents를 가져야 한다.
- `.agent/skills/`는 로컬 워크플로우 설정이므로 Git 추적 대상에서 제외한다.

## 2. 확인한 주요 불일치

| 영역 | 발견 내용 | 조치 |
|:---|:---|:---|
| Roadmap | Phase 1/2가 실제로 구현되었지만 미완료로 남아 있었음 | 완료 항목으로 갱신 |
| Product Specs | 댓글/게시판은 제외 기능으로만 남아 있었음 | 고도화 준비 기능으로 별도 명시 |
| Product Specs | `cover_image`, `published_at`, `social_links` 등 예전 필드명 사용 | `coverImage`, `publishedAt`, `socials`로 갱신 |
| DB Schema | Comments 컬렉션과 커뮤니티 확장 모델 설명 부족 | 댓글 현재 상태와 변경 필요 정책 추가 |
| API Specs | 실제 코드와 다른 limit, depth, sort 필드 사용 | 현재 페이지 구현 기준으로 갱신 |
| QA 문서 | 인터뷰 질문 문서 3개에 메타데이터와 Related Documents 누락 | 메타데이터와 관련 문서 섹션 추가 |
| QA 문서 | 인터뷰 질문 문서 3개가 순번 없는 파일명이었음 | `02_`, `03_`, `04_` 접두사로 파일명 정리 |
| Tooling | `.agent/skills`가 Git 추적 대상에 포함되어 있었음 | `.gitignore` 추가 및 추적 제외 커밋 완료 |

## 3. 현재 문서 상태

| Layer | 파일 | 상태 | 비고 |
|:---|:---|:---:|:---|
| Concept_Design | `01_LEAN_CANVAS.md` | 유지 | 사업/포지셔닝 기준 |
| Concept_Design | `02_PRODUCT_SPECS.md` | 갱신 | MVP와 고도화 범위 분리 |
| Concept_Design | `03_ROADMAP.md` | 갱신 | 실제 코드 진행상황 반영 |
| Concept_Design | `04_IDENTITY_AUTH_STRATEGY.md` | 갱신 | Better Auth, Google/GitHub/Wallet, 즉시 공개 댓글 반영 |
| UI_Screens | `01_UI_DESIGN.md` | 유지 | 실제 화면 리뷰 문서는 아직 TODO |
| Technical_Specs | `01_DB_SCHEMA.md` | 갱신 | 현재 Payload 필드명과 댓글/게시판 계획 반영 |
| Technical_Specs | `02_API_SPECS.md` | 갱신 | 현재 Local API 조회 패턴 반영 |
| Technical_Specs | `03_READER_AUTH_BOARD_COMMENTS_SPEC.md` | 신규 | 독자 참여 기능 준비 명세 |
| Logic_Progress | `00_BACKLOG.md` | 갱신 | Phase 4B 작업 재정의 |
| QA_Validation | `01_QA_CHECKLIST.md` | 갱신 | 독자 인증/댓글/게시판 QA 추가 |

## 4. 남은 문서 정리 작업

| 우선순위 | 작업 | 이유 |
|:---:|:---|:---|
| High | `docs/02_UI_Screens/02_HOME_REVIEW.md` 작성 | UI Design Guide가 실제 구현 리뷰 문서를 참조하지만 파일이 없음 |
| High | 편집자 어드민 사용 가이드 작성 | 런칭 후 운영 안정성에 필요 |
| High | 댓글/게시판 구현 전 `Comments` 상태 모델 최종 확정 | 현재 컬렉션은 pending/approved/rejected 기준 |
| Medium | SEO 문서 또는 체크리스트 보강 | JSON-LD, sitemap, robots 미구현 상태 추적 |
| Medium | 태그 체계 운영 문서 작성 | 검색/필터 구현 전 선행 필요 |
| Low | 인터뷰 질문 문서의 이모지 헤더 정리 검토 | 기존 콘텐츠 문서에 남은 표현 스타일 정리 |

## 5. 검증 기준

문서 변경 후 다음 검증을 통과해야 한다.

```bash
find docs -name "*.md" | sort
find docs -name "*.md" | while read f; do grep -q "Created:" "$f" && grep -q "Last Updated:" "$f" && grep -q "Related Documents\\|Related Files" "$f" || echo "$f"; done
rg 'published_at|cover_image|social_links|BLOB_READ_WRITE_TOKEN|Vercel Blob|기본 pending|승인/거부' docs
pnpm lint
pnpm exec tsc --noEmit
```

## 6. Related Documents

- **Concept_Design**: [Product Specs](../01_Concept_Design/02_PRODUCT_SPECS.md) - MVP와 고도화 범위 기준
- **Concept_Design**: [Roadmap](../01_Concept_Design/03_ROADMAP.md) - 단계별 진행 상태
- **Technical_Specs**: [DB Schema](../03_Technical_Specs/01_DB_SCHEMA.md) - 데이터 모델 기준
- **Technical_Specs**: [API Specs](../03_Technical_Specs/02_API_SPECS.md) - API 구현 기준
- **Logic_Progress**: [Backlog](./00_BACKLOG.md) - 실행 태스크 관리
- **QA_Validation**: [QA Checklist](../05_QA_Validation/01_QA_CHECKLIST.md) - 검증 기준
