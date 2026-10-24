# @chanho/react

## 0.12.0

### Minor Changes

- Atlassian 현행 컴포넌트 치수·상태색으로 정렬(근거: `@atlaskit/*` 현행 패키지의 컴파일 CSS, 실사이트 실측). API·CSS 클래스 이름은 그대로다.
  - Button: 기본 36 → 32px, small 28 → 24px(반경 4px), 반경 4 → 6px, 굵기 600 → 500, 글자 14px 통일, 아이콘 전용 32/24px.
    `secondary` = Atlassian default(투명 배경 + 알파 테두리 + text-subtle), `ghost` = subtle(text-subtle). default·subtle 모양은 비활성에서 채우지 않는다.
  - TextField·TextArea·Select: 반경 6px, 좌우 6px, hover `background.input-hovered`, placeholder `text.subtlest`, 오류 상태는 늘 안쪽 1px danger 테두리.
    라벨은 Atlassian 폼 라벨(12px · 653 · text-subtle), 설명은 `text.subtlest`.
  - Select·Dropdown 팝업: 테두리 없이 반경 8px + `shadow.overlay`. 항목 hover는 neutral 틴트(글자색 유지), Select 현재 값은 selected 배경.
    Dropdown 그룹 제목은 대문자 변환을 없애고 12px · 653.
  - Lozenge: 20px · 12px 보통 굵기 · 대문자 변환 없음, subtler 배경 + bolder 글자.
  - Badge: 반경 2px · 최소 폭 24px · 보통 굵기. neutral = 회색 틴트, brand = information subtler, danger = danger subtler(진한 빨강 채움 → 옅은 빨강).
  - Tag: 투명 배경 + 1px `border.accent-gray-subtle`, 12px. 링크 태그는 글자색 유지·hover 밑줄. 제거 버튼 16px, hover neutral 틴트.
  - Tabs: 패딩 6px 8px · 반경 6px · 간격 없음, 목록 아래 1px 알파 선, 선택 밑줄은 좌우 8px 들여 2px `border.selected`, hover 밑줄 2px.
  - Switch: Atlassian 토글 — 트랙 32×16 neutral-bold, **켜짐 초록(success)**, 썸 12px.
  - Radio: 선택 시 원 전체를 브랜드로 채우고 가운데 점은 반전색. Checkbox·Radio hover `background.input-hovered`.
  - Modal: 반경 12px(`radius.xlarge`), `shadow.overlay`, 제목 653, 닫기 32px · 반경 6px.
  - Tooltip: `background.neutral-bold`, 패딩 4px 6px, 12/16, 그림자 없음.
  - ProgressBar: 트랙 neutral, 기본 막대 neutral-bold(브랜드 → 짙은 회색).
  - Toast: 반경 8px, `shadow.overlay`, info 강조선 = info 색. InlineEdit: 반경 6px, 확인/취소 32px 오버레이 버튼.
  - SideNav 항목 36 → 32px · 반경 6px · 좌우 4px. Table 클릭 행 hover = neutral 틴트. TopBar 검색 placeholder·hover 정렬.
  - Avatar `teal`: info가 블루가 되어 `blue`와 겹치지 않도록 accent teal 토큰 사용. Card hover 테두리 `border.accent-gray-subtle`.

## 0.11.0

### Minor Changes

- Checkbox·Switch·Radio: `label`이 `ReactNode`를 받는다(문자열 하위 호환) — 아이콘+텍스트 라벨을 넣을 수 있다.
  세 컴포넌트 모두 Radix Root가 `button`이라 `label[for]`만으로는 이름이 붙지 않는 브라우저가 있어,
  라벨 요소에 id를 주고 `aria-labelledby`로 직접 가리킨다. 접근 이름은 라벨 안 텍스트로 잡히고,
  소비자가 `aria-label`이나 `aria-labelledby`를 직접 주면 그쪽이 이긴다.
  라벨은 `inline-flex`로 아이콘과 글자를 세로 가운데에 모은다(문자열 라벨은 보이는 결과가 같다).

  이 변경은 0.10.0에 함께 담으려던 것인데, 0.10.0이 이미 발행되어 되돌릴 수 없어 0.11.0으로 나간다.

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
