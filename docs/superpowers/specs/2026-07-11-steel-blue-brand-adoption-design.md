# 스틸 블루 브랜드 채택 + 컴포넌트 확장 설계

날짜: 2026-07-11
입력: `# 디자인 시스템 브랜드 탐색/` (브랜드 탐색 1a 스틸 블루 — tokens.css + 컴포넌트 27종 레퍼런스)

## 목표

1. `@chanho/tokens`를 스틸 블루 브랜드로 교체·확장한다. 기존 `--chanho-` 변수 이름은 유지하고 값만 바꾸며, 탐색안의 신규 시맨틱 토큰을 추가한다.
2. `@chanho/react`에 탐색안 컴포넌트 중 두 프론트(alm-front, wiki-front)가 실제로 필요로 하는 것을 이식한다.
3. 새 tarball을 릴리스하고 alm-front / wiki-front 페이지를 새 토큰·컴포넌트로 개선한다.

## 1. 토큰 (@chanho/tokens 0.2.0)

### 원시 팔레트 (palette.ts)
- blue: 스틸 블루 램프 50–900 (#1B66C9 앵커)
- gray: 쿨 그레이 0–1000 (탐색안 neutral)
- darkGray(신규): 다크 테마 전용 램프 0–1000 (단순 반전 아님, 명도 재조정)
- red / green / orange(기존 amber 대체) / teal(신규, 정보) 램프

### 정적 토큰 (static.ts)
- space: 75(6px), 250(20px), 800(64px), 1000(80px) 추가
- radius: small 3→4px, medium 6→8px, large 12px 유지, xlarge(16px) 추가
- font.family.mono 추가 (IBM Plex Mono 우선)
- font size/lineHeight 스케일 재편 (한글 행간 여유, 탐색안 채택):
  50=11/16, 75=12/18, 100=14/22, 200=16/24, 300=20/28, 400=24/32, 500=28/36, 600=32/40
  - 기존 사용처 마이그레이션 규칙: 100→75, 200→100, 300→200, 400→300, 500→400, 600→500 (size·lineHeight 동일 시프트)
- z 스케일 추가: navigation 200, dropdown 400, blanket 500, modal 510, toast 600, tooltip 700
- focus.ring 추가: 배경과 무관하게 보이는 2중 링 (`0 0 0 2px background-default, 0 0 0 4px border-focused`)

### 시맨틱 토큰 (semantic.ts)
기존 키는 전부 유지(값만 스틸 블루로), 아래 키 추가. light/dark 동일 키 세트 유지.
- background: selected, neutral-pressed, danger-pressed, input, disabled, surface-raised, surface-overlay, success, warning, info, info-subtle
- text: disabled, info, link, link-hovered, selected
- border: input, brand, disabled
- shadow: 100, 200, 300 (라이트=그림자 층위, 다크=표면 밝기+윤곽선)

다크 테마는 darkGray 램프 기반으로 전면 재작성 (배경 #14181F, 표면 밝기 차이로 층위 표현).

## 2. 컴포넌트 (@chanho/react 0.3.0)

### 신규 (탐색안 이식, CSS Modules + 기존 저장소 컨벤션)
Card, Table, EmptyState, PageHeader, Tag, Banner, InlineEdit, Comment, ProgressBar, SideNav, TopBar

### 기존 개선
- Button: variant `secondary`·`ghost` 추가(기존 primary/subtle/danger 유지, subtle=ghost 별칭), size `large` 추가, `loading`/`iconBefore`/`fullWidth` 추가
- 전 컴포넌트: focus ring 토큰 적용, 신규 폰트 스케일 매핑, 높이/패딩을 탐색안 기준으로 정렬 (sm 28 / md 36 / lg 44)

### 컨벤션
- 컴포넌트는 시맨틱 토큰만 참조 (Stylelint 강제 유지)
- 동작 계층은 기존과 동일하게 Radix 우선, 정적 컴포넌트는 plain markup
- 각 컴포넌트: `.tsx` + `.module.css` + `.stories.tsx` + `.test.tsx`

## 3. 릴리스·소비

- Changesets: tokens minor(0.2.0), react minor(0.3.0)
- `pnpm pack` → `artifacts/chanho-tokens-0.2.0.tgz`, `chanho-react-0.3.0.tgz`
- examples/consumer, alm-front, wiki-front의 file: 참조 갱신 + 검증(typecheck/test/build)

## 4. 프론트 개선

### alm-front
- 이슈 테이블 → DS Table (정렬 affordance, hover)
- 칸반: Card 기반 이슈 카드(hover elevation, 드롭 타깃 하이라이트), 컬럼 헤더 정리
- 레이아웃 크롬: SideNav/TopBar 스타일 정렬, PageHeader 도입, 다크 모드 토글
- 빈 상태 → EmptyState, 백로그 행/스프린트 패널 폴리시, 우선순위 Tag/Lozenge 정리

### wiki-front
- PageTree 글리프 → 정돈된 토글/hover-reveal 액션
- 페이지 뷰: PageHeader + 메타 행 정리, "편집" 링크를 Button 위계로 통일
- 댓글 → Comment 컴포넌트, 빈 상태 → EmptyState, 브레드크럼 대비 개선, 다크 모드 토글

## 검증

- design-system: `pnpm build:tokens && pnpm -r typecheck && pnpm test && pnpm lint:css`
- 각 프론트: `pnpm typecheck && pnpm test && pnpm build`
