# @chanho/react

## 0.10.0

### Minor Changes

- Select: `SelectOption.icon` 추가 — 이슈 타입(에픽·스토리·작업)·상태·우선순위처럼 아이콘이 뜻을 나르는 목록을
  아이콘+텍스트로 보여준다. 이름·역할은 `Dropdown`의 `icon`과 같은 규칙이다.
  Radix의 `Value`는 선택 항목의 `ItemText`만 복제하므로, 트리거에는 현재 값의 아이콘을 직접 그린다
  (비제어일 때도 선택이 바뀌면 따라간다). 아이콘은 장식으로 감춰지고 접근 이름은 `label`로 남는다.
  아이콘 크기는 소비자가 정하고, 간격은 토큰(`--chanho-space-100`)이며 컨테이너는 줄어들지 않는다.
  기존 API와 CSS 클래스는 그대로다.

## 0.9.1

### Patch Changes

- Checkbox: `checked="indeterminate"`에서 인디케이터가 그려지지 않아 미선택과 똑같아 보이던 문제 —
  중간 상태는 빼기 글리프(lucide Minus 형태를 인라인 SVG로), 선택은 기존 체크 글리프로 나뉘고,
  박스 배경·테두리는 선택과 같은 브랜드 색이 된다. `aria-checked="mixed"`는 Radix가 주던 그대로다.
  아이콘은 `data-state`로 골라 보여, 비제어 체크박스가 중간→선택으로 바뀌어도 표시가 따라간다.

## 0.9.0

### Minor Changes

- Tabs: `items[].label`이 `ReactNode`를 받는다(문자열 하위 호환). 라벨에 아이콘·배지를 넣어도 스크린리더가 읽을
  이름은 `items[].ariaLabel`로 문자열로 고정한다 — ALM 필드 구성의 "버그 (덮어씀)" 탭처럼 라벨에 배지가 붙는 경우.
- Table: `TableColumn.header`가 `ReactNode`를 받는다(문자열 하위 호환). 헤더 셀에 "모두 선택" 체크박스 같은 노드를
  넣어도 정렬 버튼·너비 조절 핸들과 겹치지 않게 헤더 내용을 감싸고, 핸들을 노드 위로 올렸다.
  노드 헤더에서는 정렬 버튼·너비 조절 핸들의 접근 이름을 만들 수 없으므로 `TableColumn.ariaLabel`로 문자열을 준다
  (없으면 핸들 이름은 "열 너비 조절"로 남는다). 문자열 헤더의 기존 이름("이름 열 너비 조절")은 그대로다.
- Checkbox: `labelHidden` 추가 — 라벨을 시각적으로만 숨기고 접근 이름은 남긴다(TopBar 검색 라벨과 같은 관례).
  표 헤더의 "모두 선택"이나 행마다 붙는 선택 체크박스처럼 글자를 둘 자리가 없을 때 쓴다.

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
