# @chanho/tokens

## 0.5.0

### Minor Changes

- Atlassian 현행 팔레트·테마로 값 정렬(근거: `@atlaskit/tokens` 20.7.0 `atlassian-light`/`atlassian-dark`·`palette-brand-refresh`,
  실사이트 Jira/Confluence `getComputedStyle` 실측과 일치). **CSS 변수 이름은 하나도 바꾸거나 지우지 않았다.**
  - 브랜드 #0C66E4 → #1868DB(hover #1558BC, pressed #144794), 다크 #579DFF → #669DF1.
  - 뉴트럴: 푸른 기를 뺀 그레이 — text #172B4D → #292A2E, subtle #626F86 → #505258, sunken #F7F8F9 → #F8F8F8,
    border-input #B3B9C4 → #8C8F97, focus #0C66E4 → #4688EC. 다크 배경 #1D2125 → #1F1F21(raised #242528·overlay #2B2C2F·sunken #18191A), text #DEE4EA → #CECFD2.
  - 알파 값 도입(Atlassian과 동일): `background.neutral*`·`background.disabled`·`border.default`·`border.disabled`·`text.disabled`·`blanket`.
    겹쳐 칠하면 한 단계 진해진다(테두리 두 개 겹침, neutral 위 neutral).
  - 상태색: success Lime(#5B7F24), warning bold #FBC828(위 글자는 새 `text.warning-inverse` — 흰 글자는 1.57:1로 대비 미달),
    danger #C9372C, **info는 청록(teal) → 블루(information, #1868DB)**. subtle 틴트는 Atlassian 기본 `background-*`(#EFFFD6·#FFF5DB·#FFECEB·#E9F2FE).
  - 그림자: Atlassian 2단(raised/overlay). `shadow.100` = raised, `200`·`300`·`overlay` = overlay.
  - 반경: Atlassian shape 스케일 — `large` 12px → 8px, `xlarge` 16px → 12px, `xsmall` 2px·`xxlarge` 16px 추가.
  - 굵기: `font.weight.bold` 700 → 653(Pretendard Variable 축 안의 값).
- 시맨틱 키 추가(라이트·다크 동시): `background.selected-hovered`, `background.neutral-bold`(+`-hovered`·`-pressed`),
  `background.success-hovered`, `background.{success,warning,danger,info}-subtler`, `background.input-hovered`,
  `background.accent-teal-subtlest`, `text.subtlest`, `text.warning-inverse`, `text.{success,warning,danger,info}-bolder`,
  `text.accent-teal`, `border.bold`, `border.accent-gray-subtle`, `border.selected`.
- 팔레트 키는 0.4.0 세트를 모두 유지하고 단계만 덧붙였다(blue 150·450, red 50·450·480·800, green 50·450·800, orange 50·450·480, darkGray 1100).

## 0.4.0

### Minor Changes

- z 토큰에 `popover`(550) 추가 — 모달(510) 위, 토스트(600) 아래. Select·Dropdown 메뉴·InlineEdit 액션처럼 모달 안에서 열리는 팝업이
  블랭킷(500)에 가려 클릭되지 않던 문제의 근거 층위. `dropdown`(400)은 호환을 위해 남긴다.

## 0.2.0

### Minor Changes

- 스틸 블루 브랜드 채택 (브랜드 탐색 1a)

  - tokens: 팔레트 전면 교체(스틸 블루 #1B66C9, 쿨 그레이, 다크 전용 램프, teal 정보색), 시맨틱 토큰 확장(selected/input/disabled/info/surface-raised/surface-overlay/link, shadow 100·200·300, focus-ring, z-index, mono 폰트), 폰트 스케일 재편(50~600, 한글 행간 여유), radius 4/8/12/16
  - react: 신규 컴포넌트 11종(Card, Table, EmptyState, PageHeader, Tag, Banner, InlineEdit, Comment, ProgressBar, SideNav, TopBar), Button 확장(secondary/ghost/large/loading/iconBefore/fullWidth), 기존 컴포넌트 포커스 링·입력·오버레이 토큰 정렬

## 0.1.0

### Minor Changes

- Phase 1 완결: 디자인 토큰(라이트/다크 85 CSS 변수)과 컴포넌트 15종 첫 공개 릴리스
