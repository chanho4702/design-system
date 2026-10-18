# @chanho/org-admin

## 0.3.0

### Minor Changes

- d7b3fb5: "권한 이력" 화면(`grant-audit`) 추가 — 전역 권한의 부여·역할 변경·회수 기록을 최신순으로 보여 준다.
  기간·대상 종류·대상 검색·행위자 필터와 20건 단위 페이지(서버 상한 100건 안에서 화면이 거른다),
  한 일·대상 종류·역할은 아이콘+텍스트 표기. 전역 관리자에게만 메뉴가 보인다.
  클라이언트에 `grantAudit(scope, resourceId?)`, 타입 `GrantAuditEntry`·`GrantAuditAction` export 추가.
