# @chanho/react

## 0.13.1

### Patch Changes

- 입력류 높이를 외곽 40px 하나로 — `TextField`(content-box 36 + 테두리 = 38px)와 `Select` 트리거(36px)가 어긋났다.
  근거: `@atlaskit/textfield` 10.2.6(테두리 1 + 안쪽 1 + 패딩 8 + 행간 20 + 8 + 1 + 1 = 40px), react-select control 최소 40px.
  `TextField` 입력은 `box-sizing: border-box`.
- `Table` 셀 줄바꿈: `word-break: keep-all` + `overflow-wrap: break-word`. 0.13.0의 `anywhere`가 열 많은 좁은 화면에서 모든 열을
  한 글자 폭까지 짓눌러 이름·"사람"·날짜가 글자마다 끊겼다. 이제 열은 단어보다 좁아지지 않고 표가 래퍼 안에서 가로로 스크롤된다.
  이메일·URL처럼 아무 데서나 끊어도 되는 값은 셀 안에서 `overflow-wrap: anywhere`를 준다(org-admin 0.3.2가 그렇게 한다).
- `Avatar` small(24px)에서 한글·한자·가나 이니셜은 첫 글자 하나만("개발 위키" → "개") — 두 글자가 원 밖으로 넘쳤다. medium 이상은 그대로.
- `Comment` 액션(답글·편집·삭제) 최소 24×24px(WCAG 2.5.8).
- 선택 글자색은 tokens 0.6.1(`text.selected` 한 단계 진하게)을 따른다 — Select 현재 값·SideNav·Tabs 선택 대비 AA.

## 0.13.0

### Minor Changes

공개 API는 **추가만** 했다(기존 프롭 이름·타입 그대로). 화면 겹침·잘림 점검(갤러리 라이트/다크 × 1440/390, 자동 겹침 검사) 결과를 고쳤다.

- 새 컴포넌트
  - `Skeleton`·`SkeletonText`·`SkeletonAvatar`·`SkeletonListItem` — Atlassian `@atlaskit/skeleton`과 같은 색(`--chanho-color-skeleton`)·쉬머
    (skeleton ↔ skeleton-subtle 배경색 1.5s 왕복, 움직임 줄이기면 정지). 블록은 장식(`aria-hidden`)이고, 로딩 영역 하나에 `label`을 주면
    `role="status"` + 숨김 문구로 알린다. 페이지·목록 로딩은 스피너 대신 이것을 쓴다.
  - `CommandPalette` — 리니어식 ⌘K 팔레트(모달). 그룹·아이콘·단축키 힌트(kbd)·하위 페이지("상태 변경 →")·`filter`(점수 정렬 가능)·
    `onQueryChange`(서버 검색)·`loading`(스켈레톤)·빈 결과. ↑↓/Home/End/Enter, Esc는 하위 페이지면 뒤로·아니면 닫기, 빈 입력 Backspace는 뒤로.
    열기 단축키는 소비 앱이 바인딩하고 컴포넌트는 `open`/`onOpenChange`로 제어한다.
  - `ContextMenu` — 우클릭(포커스 후 Shift+F10·메뉴 키) 메뉴. Radix ContextMenu 기반, 하위 메뉴·체크 항목·단축키 힌트(`aria-keyshortcuts`)·위험 항목.
    시각은 Dropdown과 같다.
- `Table`: `loading`·`loadingRows`·`loadingLabel` — 헤더는 두고 행 자리에 스켈레톤, 표는 `aria-busy`. 셀은 `overflow-wrap: anywhere`라
  끊을 곳 없는 이메일·URL이 옆 열을 한 글자 폭으로 짓누르지 않는다.
- `Select`
  - 목록 최대 높이 300px(Atlassian select 기본)과 뷰포트 남은 높이 중 작은 값 + 스크롤, 폭은 트리거 이상·최대 440px, `collisionPadding` 8px로
    가장자리에서 뒤집기·좌우 이동. 이전에는 옵션이 많으면 목록이 화면 위아래로 넘쳐 잘렸다.
  - 새 프롭 `searchable`(+`searchPlaceholder`·`noOptionsMessage`) — 목록 위 검색 입력(Atlassian PopupSelect 방식, WAI-ARIA combobox).
  - `SelectOption.group` — 연달아 같은 group인 옵션을 제목 아래 묶는다.
  - 선택 표시를 아래 화살표에서 체크 아이콘으로, 긴 옵션·선택값은 한 줄 말줄임 + `title`. 좁은 부모에서는 180px보다 줄어든다.
- `Dropdown`: 최대 높이 = 뷰포트 남은 높이(넘치면 메뉴 안 스크롤), 최대 폭 800px·뷰포트, 최소 폭 = max(160px, 트리거 폭), `collisionPadding` 8px.
  긴 라벨 말줄임 + `title`. 새 항목 필드 `checked`(`menuitemcheckbox` + 체크 표시).
- `InlineEdit`: 확인/취소 버튼을 포털 팝오버로 — 스크롤 컨테이너·모달 본문에 잘리지 않고 아래 공간이 없으면 위로 뒤집힌다. 모달 안에서 Esc가
  편집 취소와 함께 **모달까지 닫던 문제**를 고쳤다. Tab 순서 인풋 → 저장 → 취소, 끝나면 포커스를 보기 버튼으로 돌린다.
- `Tooltip`: `collisionPadding` 8px, 긴 단어 줄바꿈.
- `Modal`: `box-sizing: border-box` — 폰 폭에서 패딩(48px)만큼 화면 밖으로 밀려나던 문제. `100dvh` 높이, 480px 이하에서 여백 축소, 긴 제목 줄바꿈.
- `Card`: `box-sizing: border-box` — `width: 100%`에 패딩이 더해져 부모 밖으로 50px 넘치던 문제(org-admin 전역 역할·메일 설정·팀 만들기 카드).
- `Tabs`: 탭이 폭을 넘으면 줄바꿈 대신 가로 스크롤(스크롤바 숨김), 포커스 링은 안쪽 2px.
- `TopBar`: 720px 이하에서 3열 대칭을 풀어 검색이 남는 폭을 쓰고, 브랜드는 말줄임, 우측 액션은 줄지 않는다(검색 18px로 짓눌리던 문제).
- `Button`: 문자열 라벨은 좁은 부모에서 말줄임(`max-width: 100%`). `Lozenge` 최대 200px·`Tag` 글자 최대 180px 말줄임(Atlassian 기본값).
- `Checkbox`·`Radio`·`Switch`: 긴 라벨 옆에서 컨트롤이 7px로 찌그러지던 문제(`flex: none`).
- `PageHeader`: 좁으면 액션이 제목 아래로 줄바꿈, 브레드크럼 말줄임, 구분자 색 `text.subtlest`(Atlassian). `EmptyState`·`Comment` 액션 줄바꿈·긴 단어 줄바꿈.
- `Banner`·`Toast` 닫기 버튼 22·20px → 24px(WCAG 2.5.8 타깃 크기).

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
