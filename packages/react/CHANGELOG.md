# @chanho/react

## 0.8.1

### Patch Changes

- Switch: disabled가 배경색을 덮어 checked 상태가 보이지 않던 문제 — disabled는 opacity로만 표현해 "켜진 채 잠김"이 구분된다.

## 0.8.0

### Minor Changes

- Select·Dropdown·InlineEdit 팝업을 `--chanho-z-popover`(550)로 — 모달 안에서 열었을 때 블랭킷(500)이 포인터를 가로채
  옵션을 마우스로 고를 수 없던 버그 수정(ALM 이슈 상세 모달 우측 속성 패널에서 발견).

### Patch Changes

- Updated dependencies
  - @chanho/tokens@0.4.0

## 0.3.0

### Minor Changes

- 스틸 블루 브랜드 채택 (브랜드 탐색 1a)

  - tokens: 팔레트 전면 교체(스틸 블루 #1B66C9, 쿨 그레이, 다크 전용 램프, teal 정보색), 시맨틱 토큰 확장(selected/input/disabled/info/surface-raised/surface-overlay/link, shadow 100·200·300, focus-ring, z-index, mono 폰트), 폰트 스케일 재편(50~600, 한글 행간 여유), radius 4/8/12/16
  - react: 신규 컴포넌트 11종(Card, Table, EmptyState, PageHeader, Tag, Banner, InlineEdit, Comment, ProgressBar, SideNav, TopBar), Button 확장(secondary/ghost/large/loading/iconBefore/fullWidth), 기존 컴포넌트 포커스 링·입력·오버레이 토큰 정렬

### Patch Changes

- Updated dependencies
  - @chanho/tokens@0.2.0

## 0.2.0

### Minor Changes

- TextArea 컴포넌트 추가 — label/description/error 접근성 배선, TextField 패턴 미러 (ALM Front 선행 작업)

## 0.1.0

### Minor Changes

- Phase 1 완결: 디자인 토큰(라이트/다크 85 CSS 변수)과 컴포넌트 15종 첫 공개 릴리스

### Patch Changes

- Updated dependencies
  - @chanho/tokens@0.1.0
