# Chanho Design System — Phase 2 배포 체계 (Plan C) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** @chanho/tokens와 @chanho/react를 실제 설치 가능한 npm 패키지로 만든다 — 번들링(JS+d.ts+CSS), Changesets 버전 관리, tarball 소비자 검증, npmjs 공개 배포.

**Architecture:** 개발 워크플로(테스트·Storybook)는 지금처럼 src를 직접 소비하고, **배포 산출물만 dist**를 가리키도록 `publishConfig.exports`(pnpm이 pack 시점에 적용)로 이원화한다. tokens는 tsup(ESM+d.ts) + 기존 CSS 빌드, react는 Vite 라이브러리 모드(CSS Modules 컴파일→styles.css 추출) + vite-plugin-dts. 검증은 워크스페이스 밖 미니 소비자 앱이 tarball을 설치해 tsc+빌드로 확인한다.

**Tech Stack:** tsup, Vite lib mode + vite-plugin-dts, @changesets/cli, pnpm pack/publish

**스펙 편차(사용자 결정 2026-07-06):** 스펙 §4 Phase 2의 "GitHub Packages"를 **npmjs 공개 배포**로 변경 (GitHub Packages는 스코프=계정명 제약으로 @chanho 유지 불가). 라이선스는 MIT.

**참고:** 스펙 `2026-07-05-design-system-design.md`. Phase 1 완결 상태(15컴포넌트/79테스트, HEAD 922be8d)에서 시작.

## Global Constraints

- 작업 루트: `C:\MSA_TEMPLATE\design-system\` (git 루트 `C:\MSA_TEMPLATE`, master 직접 커밋)
- **개발 경로 불변**: 각 패키지의 top-level `exports`는 src를 유지 — 기존 테스트 79개·typecheck·Storybook이 계속 그린이어야 한다(각 태스크에서 검증). 배포 경로는 `publishConfig` 안에만 존재
- 패키지 버전은 Changesets로만 올린다 (수동 편집 금지). 목표 버전 0.1.0
- tarball 내용물은 dist + README + LICENSE + package.json만 — src·테스트·스토리 포함 금지 (`tar -tzf`로 검증)
- react 번들은 react/react-dom/radix-ui/@chanho/tokens를 **external**로 — 번들에 포함 금지
- Task 5(배포)만 사용자 개입 필요(npm 로그인·조직 생성). 그 전 태스크는 레지스트리 접근 없이 완결
- 커밋 컨벤션 `feat:` / `chore:` / `docs:`
- 검증 공통: `pnpm typecheck && pnpm test && pnpm lint:css` 그린 유지

---

### Task 1: @chanho/tokens 배포 빌드 파이프라인

**Files:**
- Modify: `design-system/packages/tokens/package.json`
- Create: `design-system/packages/tokens/README.md`
- Create: `design-system/packages/tokens/LICENSE`
- Modify: `design-system/.gitignore` (artifacts/ 추가)

**Interfaces:**
- Consumes: 기존 tokens 소스 (src/index.ts, src/build.ts)
- Produces: `pnpm --filter @chanho/tokens build` → `dist/index.js`(ESM) + `dist/index.d.ts` + `dist/tokens.css`. 배포 시 exports: `.` → dist JS/타입, `./css` → dist/tokens.css. Task 2·4가 의존.

- [ ] **Step 1: tsup 추가 및 package.json 개편**

`design-system/packages/tokens/package.json` 전체를 다음으로 교체:

```json
{
  "name": "@chanho/tokens",
  "version": "0.0.0",
  "description": "Chanho Design System — 디자인 토큰 (CSS 변수 + TypeScript 상수, 라이트/다크)",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./css": "./dist/tokens.css"
  },
  "files": [
    "dist"
  ],
  "sideEffects": false,
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js"
      },
      "./css": "./dist/tokens.css"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean && tsx src/build.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [
    "design-tokens",
    "design-system",
    "css-variables"
  ],
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsup": "^8.3.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

핵심: top-level `exports.`는 여전히 src(개발용), `publishConfig.exports`가 배포용. `private` 필드 제거됨(배포 가능). tsup `--clean`이 dist를 비운 뒤 build.ts가 tokens.css를 다시 쓰는 순서.

- [ ] **Step 2: README와 LICENSE 작성**

`design-system/packages/tokens/README.md`:

```markdown
# @chanho/tokens

Chanho Design System의 디자인 토큰. 라이트/다크 테마 CSS 변수와 TypeScript 상수를 제공합니다.

## 설치

```bash
pnpm add @chanho/tokens
```

## 사용

앱 진입점에서 CSS 변수를 한 번 로드합니다:

```ts
import "@chanho/tokens/css";
```

다크 모드는 `<html data-theme="dark">`로 전환됩니다 — 컴포넌트 코드는 테마를 몰라도 됩니다.

TypeScript에서 토큰 값 접근:

```ts
import { palette, themes, space, radius, font } from "@chanho/tokens";
```

## 구조

- 원시 토큰(palette): `blue.500` 같은 원본 값 — 직접 사용 금지
- 시맨틱 토큰: `--chanho-color-background-brand` 같은 용도 기반 CSS 변수 — 이것만 사용
```

`design-system/packages/tokens/LICENSE`:

```
MIT License

Copyright (c) 2026 chanho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

`design-system/.gitignore`에 추가:

```
artifacts/
examples/consumer/pnpm-lock.yaml
```

- [ ] **Step 3: 빌드 및 검증**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm install && pnpm --filter @chanho/tokens build`
Expected: dist/index.js + dist/index.d.ts + dist/tokens.css 생성

Run: `ls C:/MSA_TEMPLATE/design-system/packages/tokens/dist && grep -c "chanho" C:/MSA_TEMPLATE/design-system/packages/tokens/dist/tokens.css`
Expected: 3파일(+소스맵 가능), grep 85

Run: `cd C:/MSA_TEMPLATE/design-system/packages/tokens && mkdir -p ../../artifacts && pnpm pack --pack-destination ../../artifacts && tar -tzf ../../artifacts/chanho-tokens-0.0.0.tgz`
Expected: package/dist/*, package/README.md, package/LICENSE, package/package.json만 — src·테스트 없음

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm typecheck && pnpm test && pnpm lint:css`
Expected: 전부 그린 (개발 경로 불변 확인)

- [ ] **Step 4: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/packages/tokens design-system/.gitignore design-system/pnpm-lock.yaml
git commit -m "feat(tokens): 배포 빌드 파이프라인 - tsup ESM+d.ts, publishConfig 이원화"
```

---

### Task 2: @chanho/react 배포 빌드 파이프라인

**Files:**
- Create: `design-system/packages/react/vite.config.ts`
- Create: `design-system/packages/react/tsconfig.build.json`
- Modify: `design-system/packages/react/package.json`
- Create: `design-system/packages/react/README.md`
- Create: `design-system/packages/react/LICENSE` (Task 1과 동일 내용)

**Interfaces:**
- Consumes: Task 1의 패턴 (publishConfig 이원화, artifacts/)
- Produces: `pnpm --filter @chanho/react build` → `dist/index.js`(ESM, CSS Modules 클래스명 해시 포함) + `dist/index.d.ts`(번들 타입) + `dist/styles.css`(전 컴포넌트 스타일). 배포 exports: `.` + `./styles.css`.

- [ ] **Step 1: 빌드 설정 작성**

`design-system/packages/react/vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ tsconfigPath: "./tsconfig.build.json", rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "radix-ui", "@chanho/tokens"],
    },
    sourcemap: true,
  },
});
```

`design-system/packages/react/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "include": ["src"],
  "exclude": ["src/**/*.test.tsx", "src/**/*.stories.tsx"]
}
```

- [ ] **Step 2: package.json 개편**

`design-system/packages/react/package.json`에서:
- `"private": true` 제거
- 다음 필드 추가/수정 (기존 dependencies/peerDependencies/devDependencies는 유지):

```json
  "description": "Chanho Design System — React 컴포넌트 라이브러리 (Radix 기반, 토큰 스타일링)",
  "license": "MIT",
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js"
      },
      "./styles.css": "./dist/styles.css"
    }
  },
  "keywords": ["react", "design-system", "components", "radix-ui"]
```

- scripts에 추가: `"build": "vite build"`
- devDependencies에 추가: `"vite": "^7.0.0"`, `"vite-plugin-dts": "^4.3.0"`

- [ ] **Step 3: README 작성**

`design-system/packages/react/README.md`:

```markdown
# @chanho/react

Chanho Design System의 React 컴포넌트 라이브러리. Radix UI 기반 동작에 토큰 기반 스타일을 입혔습니다.

## 설치

```bash
pnpm add @chanho/react @chanho/tokens
```

## 사용

앱 진입점에서 스타일을 로드합니다:

```tsx
import "@chanho/tokens/css";      // 디자인 토큰 (CSS 변수)
import "@chanho/react/styles.css"; // 컴포넌트 스타일

import { Button, TextField, ToastProvider } from "@chanho/react";
```

다크 모드: `document.documentElement.dataset.theme = "dark"`.

## 컴포넌트 (15)

Avatar · Badge · Button · Checkbox · Dropdown · Lozenge · Modal · Radio/RadioGroup ·
Select · Spinner · Switch · Tabs · TextField · Toast(ToastProvider/useToast) · Tooltip

peerDependencies: react ^19, react-dom ^19
```

`design-system/packages/react/LICENSE`: Task 1의 LICENSE와 동일 내용으로 생성.

- [ ] **Step 4: 빌드 및 검증**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm install && pnpm --filter @chanho/react build`
Expected: dist/index.js + dist/index.d.ts + dist/styles.css 생성

Run: `grep -c "chanho" C:/MSA_TEMPLATE/design-system/packages/react/dist/styles.css && grep -o "from\"react\"\|from \"react\"" C:/MSA_TEMPLATE/design-system/packages/react/dist/index.js | head -1`
Expected: styles.css에 var(--chanho-*) 다수(1 이상), index.js가 react를 import(external 확인 — 번들 미포함)

Run: `cd C:/MSA_TEMPLATE/design-system/packages/react && pnpm pack --pack-destination ../../artifacts && tar -tzf ../../artifacts/chanho-react-0.0.0.tgz`
Expected: package/dist/* + README + LICENSE + package.json만

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm typecheck && pnpm test && pnpm lint:css && pnpm build-storybook`
Expected: 전부 그린 (개발 경로 불변 — 79테스트, 15스토리)

- [ ] **Step 5: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/packages/react design-system/pnpm-lock.yaml
git commit -m "feat(react): 배포 빌드 파이프라인 - Vite lib mode, CSS 추출, 번들 타입"
```

---

### Task 3: Changesets 버전 관리 도입 + 0.1.0

**Files:**
- Modify: `design-system/package.json` (devDep @changesets/cli + 스크립트)
- Create: `design-system/.changeset/config.json`
- Create: `design-system/.changeset/*.md` (첫 changeset)
- Modify: (changeset version 실행 결과) 두 패키지 package.json 버전 + CHANGELOG.md 생성

**Interfaces:**
- Consumes: Task 1·2의 배포 가능 패키지
- Produces: 버전 0.1.0 + CHANGELOG. `pnpm changeset` 워크플로 확립. Task 4의 tarball 파일명이 0.1.0 기준이 된다.

- [ ] **Step 1: 설치 및 초기화**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm add -w -D @changesets/cli && pnpm changeset init`
Expected: .changeset/config.json + README 생성

`design-system/.changeset/config.json` 전체를 다음으로 교체:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "master",
  "updateInternalDependencies": "patch",
  "ignore": ["docs"]
}
```

루트 `design-system/package.json` scripts에 추가:

```json
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm -r build && pnpm -r publish --access public"
```

- [ ] **Step 2: 첫 changeset 작성**

`design-system/.changeset/first-minor-release.md`:

```markdown
---
"@chanho/tokens": minor
"@chanho/react": minor
---

Phase 1 완결: 디자인 토큰(라이트/다크 85 CSS 변수)과 컴포넌트 15종 첫 공개 릴리스
```

- [ ] **Step 3: 버전 반영**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm version-packages`
Expected: 두 패키지 version 0.1.0, CHANGELOG.md 생성, changeset 파일 소비됨

Run: `grep '"version"' C:/MSA_TEMPLATE/design-system/packages/tokens/package.json C:/MSA_TEMPLATE/design-system/packages/react/package.json`
Expected: 둘 다 "0.1.0"

Run: `pnpm typecheck && pnpm test`
Expected: 그린

- [ ] **Step 4: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/package.json design-system/pnpm-lock.yaml design-system/.changeset design-system/packages/tokens/package.json design-system/packages/tokens/CHANGELOG.md design-system/packages/react/package.json design-system/packages/react/CHANGELOG.md
git commit -m "chore(design-system): Changesets 도입, 첫 릴리스 0.1.0 버전 반영"
```

---

### Task 4: 소비자 검증 앱 — tarball 설치·타입·빌드 게이트

**Files:**
- Create: `design-system/examples/consumer/package.json`
- Create: `design-system/examples/consumer/tsconfig.json`
- Create: `design-system/examples/consumer/index.html`
- Create: `design-system/examples/consumer/src/main.tsx`
- Create: `design-system/examples/consumer/src/App.tsx`

**Interfaces:**
- Consumes: Task 1·2 빌드 + Task 3 버전(0.1.0 tarball)
- Produces: 워크스페이스 **밖** 독립 앱(examples/는 pnpm-workspace 글롭에 없음)이 배포 산출물만으로 설치→타입체크→빌드 성공. 이것이 Phase 2의 핵심 검증 게이트.

- [ ] **Step 1: 0.1.0 tarball 생성**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm -r build && cd packages/tokens && pnpm pack --pack-destination ../../artifacts && cd ../react && pnpm pack --pack-destination ../../artifacts && ls ../../artifacts`
Expected: chanho-tokens-0.1.0.tgz, chanho-react-0.1.0.tgz (0.0.0 구버전도 있을 수 있음 — 무시)

- [ ] **Step 2: 소비자 앱 작성**

`design-system/examples/consumer/package.json`:

```json
{
  "name": "consumer-check",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  },
  "dependencies": {
    "@chanho/react": "file:../../artifacts/chanho-react-0.1.0.tgz",
    "@chanho/tokens": "file:../../artifacts/chanho-tokens-0.1.0.tgz",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "vite": "^7.0.0"
  },
  "pnpm": {
    "overrides": {
      "@chanho/tokens": "file:../../artifacts/chanho-tokens-0.1.0.tgz"
    }
  }
}
```

주의: overrides는 @chanho/react의 의존성 @chanho/tokens@0.1.0이 (아직 없는) 레지스트리 대신 tarball로 해석되게 한다.

`design-system/examples/consumer/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

`design-system/examples/consumer/index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>chanho design system — consumer check</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`design-system/examples/consumer/src/main.tsx`:

```tsx
import "@chanho/tokens/css";
import "@chanho/react/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`design-system/examples/consumer/src/App.tsx`:

```tsx
import { useState } from "react";
import {
  Badge,
  Button,
  Lozenge,
  TextField,
  ToastProvider,
  useToast,
} from "@chanho/react";
import { palette } from "@chanho/tokens";

function Demo() {
  const toast = useToast();
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", display: "grid", gap: 16 }}>
      <h1 style={{ fontFamily: "var(--chanho-font-family-sans)" }}>
        consumer check <Badge appearance="brand">0.1.0</Badge>
      </h1>
      <p>
        브랜드 컬러 <code>{palette.blue[500]}</code> <Lozenge appearance="success">설치 성공</Lozenge>
      </p>
      <TextField label="이메일" description="배포 산출물로 렌더링됨" />
      <Button onClick={() => toast({ title: "동작 확인", appearance: "success" })}>
        토스트 발생
      </Button>
    </main>
  );
}

export function App() {
  const [dark, setDark] = useState(false);
  return (
    <ToastProvider>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--chanho-color-background-default)",
          color: "var(--chanho-color-text-default)",
        }}
      >
        <Button
          variant="subtle"
          onClick={() => {
            const next = !dark;
            setDark(next);
            document.documentElement.dataset.theme = next ? "dark" : "light";
          }}
        >
          {dark ? "라이트로" : "다크로"}
        </Button>
        <Demo />
      </div>
    </ToastProvider>
  );
}
```

- [ ] **Step 3: 설치·타입·빌드 게이트**

Run: `cd C:/MSA_TEMPLATE/design-system/examples/consumer && pnpm install && pnpm typecheck && pnpm build`
Expected: 설치 성공(두 tarball + radix-ui 전이 설치), tsc 에러 0(**번들 타입 d.ts 검증**), vite build 성공(**exports 맵·CSS 파일 검증**)

- [ ] **Step 4: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/examples/consumer
git commit -m "feat(design-system): 소비자 검증 앱 - tarball 설치·타입·빌드 게이트"
```

---

### Task 5: npmjs 공개 배포 (⚠️ 사용자 개입 필요)

**Files:**
- Modify: (배포 후) `design-system/examples/consumer/package.json` (tarball → 레지스트리 버전 전환)

**Interfaces:**
- Consumes: Task 1~4 전부
- Produces: npmjs에 @chanho/tokens@0.1.0, @chanho/react@0.1.0 공개. 소비자 앱이 레지스트리 설치로 재검증됨.

- [ ] **Step 1: 사용자 로그인 (수동)**

사용자가 직접 수행: `npm login` (npm 계정 필요; 세션에서는 `! npm login`으로 실행 가능). 완료 후 `npm whoami`로 확인.

- [ ] **Step 2: @chanho 스코프 확보 확인 (수동+자동)**

`npm whoami` 결과가 "chanho"가 아니면, npmjs.com에서 **chanho라는 이름의 Organization 생성** 시도 (Add Organization → free/public). 이름이 선점돼 있으면 **여기서 중단**하고 대체 스코프를 결정한다(예: @chanho-ds, @{npm계정명}) — 대체 시 패키지명 변경은 별도 태스크로 승격(전 파일 리네임 + 소비자 수정).

- [ ] **Step 3: 배포**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm release`
Expected: 두 패키지 빌드 후 publish 성공 (pnpm이 workspace:*를 0.1.0으로 치환). 403이면 Step 2로 회귀.

Run: `npm view @chanho/tokens version && npm view @chanho/react version`
Expected: 0.1.0 / 0.1.0

- [ ] **Step 4: 소비자 앱을 레지스트리 설치로 전환**

`design-system/examples/consumer/package.json`의 dependencies를:

```json
    "@chanho/react": "^0.1.0",
    "@chanho/tokens": "^0.1.0",
```

로 바꾸고 `pnpm.overrides` 블록 삭제.

Run: `cd C:/MSA_TEMPLATE/design-system/examples/consumer && rm -rf node_modules && pnpm install && pnpm typecheck && pnpm build`
Expected: 레지스트리에서 설치되어 전부 그린

- [ ] **Step 5: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/examples/consumer/package.json
git commit -m "chore(design-system): 소비자 앱을 npmjs 레지스트리 설치로 전환 - 0.1.0 배포 완료"
```

---

## 완료 기준 (Plan C 전체)

- `pnpm -r build` — tokens(ESM+d.ts+CSS), react(ESM+번들d.ts+styles.css) 산출
- tarball 내용물 검증 — dist+README+LICENSE만
- Changesets 워크플로 동작, 버전 0.1.0 + CHANGELOG
- 소비자 앱: 설치 → `tsc --noEmit` → `vite build` 전부 그린 (tarball과 레지스트리 각 1회)
- npmjs에 두 패키지 공개, `npm view` 확인
- 기존 개발 게이트 불변: 테스트 79 + typecheck + lint + Storybook
- 이후: myFront 실통합·클론 앱 착수는 별도 결정. 릴리스 워크플로 = changeset 작성 → `pnpm version-packages` → `pnpm release`
