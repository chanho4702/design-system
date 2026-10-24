# Chanho Design System

[![CI](https://github.com/chanho4702/design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/chanho4702/design-system/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-5FA04E?logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11.10.0-F69220?logo=pnpm&logoColor=white)
![Components](https://img.shields.io/badge/Components-33-1868DB)

Jira/Confluence가 하나의 Atlassian Design System을 공유하듯, 여러 프론트엔드가 공유하도록 만든 **자체 디자인 시스템 모노레포**.
토큰·React 컴포넌트·공통 조직 관리 화면을 별도 npm 패키지로 분리해, 소비 앱은 필요한 패키지만 설치하면 동일한 룩앤필·다크모드·접근성 계약을 그대로 가져간다.

**색·치수는 Atlassian 현행 값(`@atlaskit/tokens` 20.7.0)에 맞춘다** — 브랜드 블루 `#1868DB`, 서체는 한글 때문에 Pretendard.

> 이 저장소는 [독립 git repo](https://github.com/chanho4702/design-system)이며, MSA 우산 repo에서는 별도로 관리한다. MSA 프론트 중 `wiki-front`·`alm-front`가 **GitHub Packages(`@chanho4702/*`) + pnpm alias**로 실제 소비 중이다 — 아래 [소비 프로젝트](#소비-프로젝트) 참고.

---

## 패키지

루트(`chanho-design-system`)는 배포하지 않는 pnpm 워크스페이스이고, 실제 산출물은 3개다.
버전 열은 이 리포 `main`의 `package.json` 기준이다(발행 여부는 태그로 확인 — `v*`·`org-admin-v*`).

| 패키지 | 버전 | 발행 이름(GitHub Packages) | 설명 |
|---|---|---|---|
| [`@chanho/tokens`](packages/tokens) | 0.6.1 | `@chanho4702/tokens` | 디자인 토큰 — 원시(palette) / 시맨틱 2층 구조, 라이트·다크 CSS 변수 + TypeScript 상수 |
| [`@chanho/react`](packages/react) | 0.14.0 | `@chanho4702/react` | React 19 컴포넌트 33종 — Radix UI 기반 동작 + 토큰 스타일링 |
| [`@chanho/org-admin`](packages/org-admin) | 0.3.2 | `@chanho4702/org-admin` | 플랫폼 공통 조직 관리 화면(사용자·초대·팀·전역 역할·권한 이력·승인 대기·메일 설정) — [README](packages/org-admin/README.md) |

세 패키지 모두 MIT, 리포지토리 `github.com/chanho4702/design-system`.

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
| 릴리스 | Changesets(baseBranch `main`)로 변경 기록·버전 반영, 발행은 태그 푸시 → GitHub Actions(`publish.yml`) |

---

## 토큰 (`@chanho/tokens`)

3층 소스로 구성되고, 빌드 시 CSS 변수(`--chanho-*`)와 TS 상수 양쪽으로 나온다.

- **`palette.ts`** — 원시 컬러 램프. 브랜드 `blue`(500 = `#1868DB`), 라이트용 `gray`, 다크 전용 `darkGray`(단순 반전이 아니라 명도 재조정), 상태색(red·green·orange·teal 등). 컴포넌트에서 직접 참조 금지.
- **`semantic.ts`** — 시맨틱 토큰(라이트·다크 동일 키 세트, 일부 알파 값). 그룹: `color.background.*` · `color.text.*` · `color.border.*` · `color.blanket` · `shadow.*`(elevation). 라이트/다크는 동일 키 세트를 가져야 하며 `buildCss.test.ts`가 이를 강제한다.
- **`static.ts`** — 테마 무관 정적 토큰: `space`(4px 그리드) · `radius` · `font`(family·size·weight·lineHeight, Pretendard Variable / IBM Plex Mono) · `z`(z-index 층위) · `focus`(2중 포커스 링).

`exports`: `.`(TS 상수) / `./css`(`dist/tokens.css`).

---

## 컴포넌트 (`@chanho/react`) — 33종

- **표시:** Avatar · Badge · Card · Comment · EmptyState · Lozenge · ProgressBar · Skeleton(`SkeletonText`·`SkeletonAvatar`·`SkeletonListItem`) · Spinner · Table · Tag
- **폼:** Button · Checkbox · InlineEdit · MultiSelect · Radio/RadioGroup · Select · Switch · TextArea · TextField
- **오버레이·내비게이션:** Banner · CommandPalette · ConfirmDialog · ContextMenu · Dropdown · Modal · PageHeader · Popover · SideNav · Tabs · Toast(`ToastProvider`/`useToast`) · Tooltip · TopBar

각 컴포넌트는 값 export와 함께 타입(`ButtonProps` 등)을 노출한다. `react`/`react-dom`은 peer(^19), `radix-ui`·`@chanho/tokens`는 런타임 의존이자 번들 external.

### 아키텍처 원칙

- **토큰 2층 강제**: 컴포넌트는 시맨틱 CSS 변수(`--chanho-color-background-brand`)만 참조하고 원시 팔레트는 쓰지 않는다. 색상 하드코딩은 Stylelint가 차단한다.
- **Headless 기반**: 포커스 트랩·키보드 내비게이션·스크린리더 시맨틱 같은 동작 계층은 Radix UI가 담당하고, 룩앤필은 100% 이 저장소가 소유한다.
- **접근성 계약을 테스트로 고정**: 라벨 없는 폼 컨트롤 금지, `role`·접근 가능 이름·키보드 조작을 행위 테스트로 검증한다.

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

### GitHub Packages (기본, 2026-08-30~)

태그를 푸시하면 `.github/workflows/publish.yml`이 세 패키지를 GitHub Packages에 올린다(이미 올라간 버전은 건너뛴다).
GitHub Packages npm은 스코프가 소유자와 같아야 해서 레지스트리 이름은 `@chanho4702/*`지만, 소비 프로젝트는
**pnpm alias**로 `@chanho/*` import를 그대로 쓴다. 이름은 발행 시점에만 바뀌고 이 리포 안에서는 `@chanho/*`다.

```jsonc
// package.json — 버전은 위 패키지 표(또는 태그)에서 고른다
"dependencies": {
  "@chanho/tokens":    "npm:@chanho4702/tokens@0.6.1",
  "@chanho/react":     "npm:@chanho4702/react@0.14.0",
  "@chanho/org-admin": "npm:@chanho4702/org-admin@0.3.2"   // 조직 관리 화면이 필요할 때만
}
```

```ini
# 프로젝트 .npmrc (리포에 커밋) — 스코프 → 레지스트리만. 토큰은 여기 두지 않는다:
# pnpm은 커밋되는 프로젝트 .npmrc의 인증(환경변수 참조 포함)을 무시한다.
@chanho4702:registry=https://npm.pkg.github.com
```

- 로컬(최초 1회): `~/.npmrc`에 `//npm.pkg.github.com/:_authToken=${GH_PACKAGES_TOKEN}` 한 줄. 이후 `GH_PACKAGES_TOKEN=$(gh auth token) pnpm install`
  (gh 토큰에 `read:packages` 스코프가 있다) 또는 PAT.
- CI: 패키지가 공개(public)라 `secrets.GITHUB_TOKEN`으로 읽힌다 — `actions/setup-node`에 `registry-url: https://npm.pkg.github.com`,
  `scope: '@chanho4702'`를 주고 install 스텝에 `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
- `@chanho/org-admin`은 `@chanho/react`·`@chanho/tokens`·`react-router`를 **peer**로 둔다 — 소비자가 위 alias 키를 갖고 있어야 한다.

### tarball 로컬 참조 (대안 — 레지스트리를 못 쓰는 환경)

폐쇄망처럼 GitHub Packages에 닿지 못할 때만 쓴다. `pnpm pack` 산출물(.tgz)을 `file:`로 참조한다.

```bash
pnpm install && pnpm -r build
cd packages/tokens && pnpm pack --pack-destination ../../artifacts
cd ../react && pnpm pack --pack-destination ../../artifacts
```

```jsonc
// 소비 프로젝트 package.json — <버전>은 pack 결과 파일명 그대로
"dependencies": {
  "@chanho/react":  "file:<경로>/design-system/artifacts/chanho-react-<버전>.tgz",
  "@chanho/tokens": "file:<경로>/design-system/artifacts/chanho-tokens-<버전>.tgz"
}
```

`@chanho/react`가 내부 의존하는 tokens도 tarball로 해석시키려면 소비 프로젝트 `pnpm-workspace.yaml`에
`overrides: { "@chanho/tokens": "file:<경로>/design-system/artifacts/chanho-tokens-<버전>.tgz" }`를 둔다.
설치 구조는 [`examples/consumer`](examples/consumer)에서 볼 수 있다(오래된 React 0.3.0 / tokens 0.2.0 tarball에 고정된 검증용 예제).

### 소비 프로젝트

| 소비처 | 방식 | 용도 |
|---|---|---|
| `apps/docs` | `workspace:*` | Storybook 문서·개발 환경 |
| `examples/consumer` | 배포 tarball(`file:`, React 0.3.0 / tokens 0.2.0) | tarball 설치·빌드 검증(대안 경로) |
| `wiki-front` (별도 repo) | GitHub Packages alias — tokens 0.4.0 / react 0.11.0 / org-admin 0.2.1 | 위키 프론트 — UI 100% 이 시스템, `/admin/org`에 조직 관리 화면 마운트 |
| `alm-front` (별도 repo) | GitHub Packages alias — tokens 0.4.0 / react 0.11.0 / org-admin 0.2.1 | ALM 프론트 — UI 100% 이 시스템, `/settings/org`에 조직 관리 화면 마운트 |

소비처 버전은 2026-10-18 각 리포 `main` 기준이다. 새 org-admin을 발행하면 두 프론트를 **같은 버전으로 함께** 올린다.

**myFront는 의도적으로 이 시스템을 쓰지 않는다** — 제품 소개 사이트라 MUI(v9) 기반이고, Vite도 ^6으로 다른 두 프론트(^7)와 다르다.

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

1. 변경 PR/커밋에 `pnpm changeset`으로 변경 기록(`.changeset/*.md`, 패키지·patch/minor/major)을 남긴다.
2. 발행할 때 `pnpm version-packages`로 버전·CHANGELOG를 반영해 `main`에 커밋한다(baseBranch `main`).
3. 태그를 푸시하면 `publish.yml`이 GitHub Packages에 올린다 — tokens·react는 `v<react 버전>`, org-admin은 `org-admin-v<버전>`.
   어느 태그든 세 패키지를 모두 검사하고 이미 있는 버전은 건너뛴다.

루트 `pnpm release` 스크립트(`pnpm -r publish`)는 npm 공개 레지스트리용 옛 경로라 쓰지 않는다.

---

## 디렉터리 구조

```
design-system/
├─ packages/
│  ├─ tokens/            @chanho/tokens — palette·semantic·static + CSS 빌드
│  │  └─ src/            index.ts · palette.ts · semantic.ts · static.ts
│  │                     buildCss.ts(+test) · build.ts
│  ├─ react/             @chanho/react — 컴포넌트 33종 (Vite lib mode)
│  │  └─ src/<Component>/ 각 컴포넌트 + *.test.tsx + CSS
│  └─ org-admin/         @chanho/org-admin — 공통 조직 관리 화면 (/api/org 소비)
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
