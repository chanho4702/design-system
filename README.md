# Chanho Design System

Jira/Confluence가 하나의 Atlassian Design System을 공유하듯, 여러 프론트엔드가 공유하도록 만든 **자체 디자인 시스템 모노레포**.
토큰과 React 컴포넌트를 별도 npm 패키지로 분리해, 소비 앱은 두 패키지만 설치하면 동일한 룩앤필·다크모드·접근성 계약을 그대로 가져간다.

**구조는 Atlassian을 참고하되 브랜드는 자체 정의** — 스틸 블루 `#1B66C9`(브랜드 탐색 1a), Pretendard 서체.

> 이 저장소는 **독립 git repo**(`chanho4702/design-system`)이며, MSA 우산 repo에서는 별도로 관리한다. MSA 프론트 중 `wiki-front`·`alm-front`가 tarball 방식으로 실제 소비 중이다 — 아래 [소비 프로젝트](#소비-프로젝트) 참고.

---

## 패키지

루트(`chanho-design-system`)는 배포하지 않는 pnpm 워크스페이스이고, 실제 산출물은 2개다.

| 패키지 | 버전 | 설명 |
|---|---|---|
| [`@chanho/tokens`](packages/tokens) | 0.2.0 | 디자인 토큰 — 원시(palette) / 시맨틱 2층 구조, 라이트·다크 CSS 변수 + TypeScript 상수 |
| [`@chanho/react`](packages/react) | 0.3.0 | React 19 컴포넌트 27종 — Radix UI 기반 동작 + 토큰 스타일링 |

두 패키지 모두 MIT, 리포지토리 `github.com/chanho4702/design-system`.

---

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 모노레포 | pnpm 11.10 워크스페이스 (`packages/*`, `apps/*`), Node ≥ 20 |
| 언어 | TypeScript 5.7 (ESM 전용) |
| 컴포넌트 동작 | [Radix UI](https://www.radix-ui.com/primitives) 1.4 — 포커스 트랩·키보드·스크린리더 |
| 토큰 빌드 | `tsup`(TS 상수 → ESM+d.ts) + 자체 `build.ts`(시맨틱 → `dist/tokens.css`) |
| 컴포넌트 빌드 | Vite 7 lib mode(ES), `vite-plugin-dts`(타입 롤업), CSS 단일 `styles.css` |
| 문서 | Storybook 9 (`apps/docs`, a11y·docs 애드온) |
| 테스트 | Vitest 3 + Testing Library + jsdom |
| 색상 가드 | Stylelint 16 — hex·색상명·`rgb()`/`hsl()` 등 하드코딩 차단 |
| 릴리스 | Changesets (baseBranch `master`) |

---

## 토큰 (`@chanho/tokens`)

3층 소스로 구성되고, 빌드 시 CSS 변수(`--chanho-*`)와 TS 상수 양쪽으로 나온다.

- **`palette.ts`** — 원시 컬러 램프. 브랜드 `blue`(500 = `#1B66C9`), 라이트용 `gray`, 다크 전용 `darkGray`(단순 반전이 아니라 명도 재조정), 상태색(red·green·orange·teal 등). 컴포넌트에서 직접 참조 금지.
- **`semantic.ts`** — 시맨틱 토큰(라이트·다크 각 100키). 그룹: `color.background.*` · `color.text.*` · `color.border.*` · `color.blanket` · `shadow.*`(elevation). 라이트/다크는 동일 키 세트를 가져야 하며 `buildCss.test.ts`가 이를 강제한다.
- **`static.ts`** — 테마 무관 정적 토큰: `space`(4px 그리드) · `radius` · `font`(family·size·weight·lineHeight, Pretendard Variable / IBM Plex Mono) · `z`(z-index 층위) · `focus`(2중 포커스 링).

`exports`: `.`(TS 상수) / `./css`(`dist/tokens.css`).

---

## 컴포넌트 (`@chanho/react`) — 27종

**표시** Avatar · Badge · Card · Comment · EmptyState · Lozenge · ProgressBar · Spinner · Table · Tag
**폼** Button · Checkbox · InlineEdit · Radio/RadioGroup · Select · Switch · TextArea · TextField
**오버레이·내비게이션** Banner · Dropdown · Modal · PageHeader · SideNav · Tabs · Toast(`ToastProvider`/`useToast`) · Tooltip · TopBar

각 컴포넌트는 값 export와 함께 타입(`ButtonProps` 등)을 노출한다. `react`/`react-dom`은 peer(^19), `radix-ui`·`@chanho/tokens`는 런타임 의존이자 번들 external.

### 아키텍처 원칙

- **토큰 2층 강제**: 컴포넌트는 시맨틱 CSS 변수(`--chanho-color-background-brand`)만 참조하고 원시 팔레트는 쓰지 않는다. 색상 하드코딩은 Stylelint가 차단한다.
- **Headless 기반**: 포커스 트랩·키보드 내비게이션·스크린리더 시맨틱 같은 동작 계층은 Radix UI가 담당하고, 룩앤필은 100% 이 저장소가 소유한다.
- **접근성 계약을 테스트로 고정**: 라벨 없는 폼 컨트롤 금지, `role`·접근 가능 이름·키보드 조작을 행위 테스트로 검증. React 테스트 151개 + 토큰 테스트 4개.

---

## 사용

```tsx
// 앱 진입점
import "@chanho/tokens/css";       // CSS 변수 (라이트/다크)
import "@chanho/react/styles.css"; // 컴포넌트 스타일

import { Button, TextField, Modal, ToastProvider, useToast } from "@chanho/react";
```

다크 모드는 변수 교체만으로 동작한다 — 컴포넌트는 테마를 모른다.

```ts
document.documentElement.dataset.theme = "dark"; // 또는 "light"
```

---

## 설치 (소비 프로젝트에서)

> 아직 npm 레지스트리에 배포 전이다. 현재는 **tarball(.tgz) 로컬 참조** 방식을 쓴다.

**① 이 저장소에서 패키지 파일 생성**

```bash
pnpm install && pnpm -r build
cd packages/tokens && pnpm pack --pack-destination ../../artifacts
cd ../react && pnpm pack --pack-destination ../../artifacts
```

→ `artifacts/`에 `chanho-tokens-0.2.0.tgz`, `chanho-react-0.3.0.tgz` 생성(npm에 올라갈 산출물과 동일).

**② 소비 프로젝트 `package.json`**

```jsonc
"dependencies": {
  "@chanho/react":  "file:<경로>/design-system/artifacts/chanho-react-0.3.0.tgz",
  "@chanho/tokens": "file:<경로>/design-system/artifacts/chanho-tokens-0.2.0.tgz"
}
```

**③ 소비 프로젝트 `pnpm-workspace.yaml`**(없으면 생성) — `@chanho/react`가 내부 의존하는 tokens를 tarball로 해석시키는 설정:

```yaml
overrides:
  "@chanho/tokens": "file:<경로>/design-system/artifacts/chanho-tokens-0.2.0.tgz"
```

동작하는 실제 예시는 [`examples/consumer`](examples/consumer)를 그대로 참고하면 된다.

npm 배포 후에는 한 줄로 줄어든다: `pnpm add @chanho/react @chanho/tokens`

### 소비 프로젝트

| 소비처 | 방식 | 용도 |
|---|---|---|
| `apps/docs` | `workspace:*` | Storybook 문서·개발 환경 |
| `examples/consumer` | 배포 tarball(`file:`) | 배포 산출물이 실제로 설치·동작하는지 검증 |
| `wiki-front` (별도 repo) | 배포 tarball(`file:../design-system/artifacts/*.tgz`) | 위키 프론트 — UI 100% 이 시스템으로 구성 |
| `alm-front` (별도 repo) | 배포 tarball(`file:../design-system/artifacts/*.tgz`) | ALM(지라 클론) 프론트 — UI 100% 이 시스템으로 구성 |

myFront는 MUI 기반이라 이 시스템을 소비하지 않는다.

---

## 개발

```bash
pnpm install
pnpm storybook        # 토큰 빌드 후 Storybook (localhost:6006, 다크모드 토글)
pnpm test             # 전체 테스트 (pnpm -r test)
pnpm typecheck        # 전체 tsc --noEmit
pnpm lint:css         # 색상 하드코딩 검사 (packages/react/src/**/*.css)
pnpm build:tokens     # 토큰만 빌드
pnpm build-storybook  # 정적 Storybook
```

빌드는 패키지별로: `pnpm --filter @chanho/tokens build`(tsup + `build.ts`), `pnpm --filter @chanho/react build`(Vite lib). React 빌드는 tokens 산출물에 의존하므로 tokens를 먼저 빌드한다.

### 릴리스

Changesets 워크플로:

```bash
pnpm changeset          # 변경 내용 기록
pnpm version-packages   # 버전·CHANGELOG 반영
pnpm release            # pnpm -r build && pnpm -r publish --access public
```

---

## 디렉터리 구조

```
design-system/
├─ packages/
│  ├─ tokens/            @chanho/tokens — palette·semantic·static + CSS 빌드
│  │  └─ src/            index.ts · palette.ts · semantic.ts · static.ts
│  │                     buildCss.ts(+test) · build.ts
│  └─ react/             @chanho/react — 컴포넌트 27종 (Vite lib mode)
│     └─ src/<Component>/ 각 컴포넌트 + *.test.tsx + CSS
├─ apps/
│  └─ docs/              Storybook 9 (workspace 참조)
├─ examples/
│  └─ consumer/          배포 tarball 검증용 독립 소비자 앱
├─ docs/superpowers/     설계 스펙·구현 계획 문서
├─ artifacts/            pnpm pack 산출물 (.tgz, gitignore)
├─ .changeset/           Changesets 설정
├─ pnpm-workspace.yaml
└─ package.json          루트 (chanho-design-system, private)
```

---

## 라이선스

[MIT](packages/tokens/LICENSE)
