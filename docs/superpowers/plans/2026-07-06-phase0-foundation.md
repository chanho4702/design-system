# Chanho Design System — Phase 0 파운데이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pnpm 모노레포 + 토큰 패키지 + Storybook + Button 컴포넌트 1개로 디자인 시스템의 전체 파이프라인(토큰 → 컴포넌트 → 테스트 → 문서)을 끝까지 관통시킨다.

**Architecture:** `packages/tokens`(원시/시맨틱 2층 토큰 → CSS 변수 빌드), `packages/react`(토큰만 참조하는 컴포넌트), `apps/docs`(Storybook)로 구성된 pnpm workspace. 다크모드는 `[data-theme="dark"]`에서 CSS 변수 값만 교체한다. 컴포넌트의 하드코딩 색상은 Stylelint로 차단한다.

**Tech Stack:** pnpm workspace, TypeScript(strict), React 19, CSS Modules, Vitest 3 + Testing Library, Storybook 9(react-vite), Stylelint 16, tsx

**참고 스펙:** `design-system/docs/superpowers/specs/2026-07-05-design-system-design.md`
**후속 계획:** Plan B(Phase 1 나머지 컴포넌트 ~14개)는 이 계획 완료 후 별도 작성한다.

## Global Constraints

- 작업 루트: `C:\MSA_TEMPLATE\design-system\` (git 저장소 루트는 `C:\MSA_TEMPLATE`, 모든 git 명령은 거기서 실행)
- Node.js >= 20, pnpm >= 9 (`pnpm -v`로 확인, 없으면 `npm i -g pnpm`)
- CSS 변수 접두사는 `--chanho-` 고정
- `packages/react`의 CSS에서 색상 하드코딩 금지 — hex/색상명 대신 반드시 `var(--chanho-color-*)` 사용
- 시맨틱 컬러 토큰은 light/dark가 **동일한 키 세트**를 가져야 한다 (테스트로 강제)
- 모든 컴포넌트 props는 TypeScript로 완전 정의 + JSDoc 설명
- 커밋 메시지는 `feat:` / `test:` / `chore:` / `docs:` 컨벤션
- 브랜드: 이름 **chanho**, Primary 컬러 **블루 계열**(`#3B6EF5` 기준 스케일)

---

### Task 1: 모노레포 뼈대

**Files:**
- Create: `design-system/pnpm-workspace.yaml`
- Create: `design-system/package.json`
- Create: `design-system/tsconfig.base.json`
- Create: `design-system/.gitignore`

**Interfaces:**
- Consumes: 없음
- Produces: workspace 루트. 이후 모든 태스크가 `packages/*`, `apps/*` 하위에 패키지를 추가한다. 루트 스크립트 `pnpm build:tokens`, `pnpm test`, `pnpm lint:css`, `pnpm storybook`.

- [ ] **Step 1: pnpm 설치 확인**

Run: `pnpm -v`
Expected: `9.x` 이상 출력. 없으면 `npm i -g pnpm` 후 재확인.

- [ ] **Step 2: workspace 정의 파일 작성**

`design-system/pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 3: 루트 package.json 작성**

`design-system/package.json`:

```json
{
  "name": "chanho-design-system",
  "private": true,
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build:tokens": "pnpm --filter @chanho/tokens run build",
    "test": "pnpm -r run test",
    "lint:css": "stylelint \"packages/react/src/**/*.css\"",
    "storybook": "pnpm --filter docs run storybook"
  }
}
```

- [ ] **Step 4: 공통 tsconfig 작성**

`design-system/tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

- [ ] **Step 5: .gitignore 작성**

`design-system/.gitignore`:

```
node_modules/
dist/
storybook-static/
*.log
```

- [ ] **Step 6: 설치 확인**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm install`
Expected: 에러 없이 완료 (아직 패키지가 없어 lockfile만 생성됨)

- [ ] **Step 7: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/pnpm-workspace.yaml design-system/package.json design-system/tsconfig.base.json design-system/.gitignore design-system/pnpm-lock.yaml
git commit -m "chore(design-system): pnpm 모노레포 뼈대 구성"
```

---

### Task 2: @chanho/tokens — 토큰 정의와 CSS 빌드

**Files:**
- Create: `design-system/packages/tokens/package.json`
- Create: `design-system/packages/tokens/tsconfig.json`
- Create: `design-system/packages/tokens/src/palette.ts`
- Create: `design-system/packages/tokens/src/static.ts`
- Create: `design-system/packages/tokens/src/semantic.ts`
- Create: `design-system/packages/tokens/src/buildCss.ts`
- Create: `design-system/packages/tokens/src/build.ts`
- Create: `design-system/packages/tokens/src/index.ts`
- Test: `design-system/packages/tokens/src/buildCss.test.ts`

**Interfaces:**
- Consumes: Task 1의 workspace 루트
- Produces:
  - npm 패키지 `@chanho/tokens` — exports: `palette`, `space`, `radius`, `font`, `themes: { light, dark }` (모두 `Record` 계열 객체), `flatten(obj, prefix?): Record<string, string>`, `buildCss(staticTokens, light, dark): string`
  - 서브패스 `@chanho/tokens/css` → 빌드 산출물 `dist/tokens.css` (모든 CSS 변수 정의)
  - CSS 변수 명명 규칙: 토큰 키 `color.background.brand` → `--chanho-color-background-brand`

- [ ] **Step 1: 패키지 매니페스트 작성**

`design-system/packages/tokens/package.json`:

```json
{
  "name": "@chanho/tokens",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./css": "./dist/tokens.css"
  },
  "scripts": {
    "build": "tsx src/build.ts",
    "test": "vitest run"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

`design-system/packages/tokens/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm install`
Expected: tokens 패키지 devDependencies 설치 완료

- [ ] **Step 2: 원시 토큰(palette) 작성**

`design-system/packages/tokens/src/palette.ts`:

```ts
/** 원시 컬러 토큰. 컴포넌트에서 직접 참조 금지 — 시맨틱 토큰(semantic.ts)을 통해서만 사용한다. */
export const palette = {
  blue: {
    50: "#EDF2FE",
    100: "#DCE6FD",
    200: "#B9CDFB",
    300: "#8FADF9",
    400: "#638BF7",
    500: "#3B6EF5",
    600: "#2B57D6",
    700: "#2044AD",
    800: "#183485",
    900: "#12265E",
  },
  gray: {
    0: "#FFFFFF",
    50: "#F7F8FA",
    100: "#EFF1F4",
    200: "#DFE2E8",
    300: "#C4C9D4",
    400: "#9AA1B0",
    500: "#6E7687",
    600: "#505869",
    700: "#3A4150",
    800: "#272D3A",
    900: "#161B26",
    1000: "#0B0E14",
  },
  red: {
    100: "#FDEBEC",
    400: "#EC6E72",
    500: "#E5484D",
    600: "#D93036",
    700: "#B22A2F",
  },
} as const;
```

- [ ] **Step 3: 정적 토큰(간격·모서리·타이포) 작성**

`design-system/packages/tokens/src/static.ts`:

```ts
/** 테마와 무관한 정적 토큰. 8px 기반 스케일. */
export const space = {
  0: "0",
  25: "2px",
  50: "4px",
  100: "8px",
  150: "12px",
  200: "16px",
  300: "24px",
  400: "32px",
  500: "40px",
  600: "48px",
} as const;

export const radius = {
  small: "3px",
  medium: "6px",
  large: "12px",
  full: "9999px",
} as const;

export const font = {
  family: {
    sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  },
  size: {
    100: "12px",
    200: "14px",
    300: "16px",
    400: "20px",
    500: "24px",
    600: "29px",
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    100: "16px",
    200: "20px",
    300: "24px",
    400: "28px",
    500: "32px",
    600: "36px",
  },
} as const;
```

- [ ] **Step 4: 시맨틱 토큰(light/dark) 작성**

`design-system/packages/tokens/src/semantic.ts`:

```ts
import { palette } from "./palette";

/**
 * 시맨틱 컬러 토큰. 컴포넌트는 이 키에서 생성된 CSS 변수만 사용한다.
 * light와 dark는 반드시 동일한 키 세트를 가진다 (buildCss.test.ts에서 강제).
 */
export const themes = {
  light: {
    "color.background.default": palette.gray[0],
    "color.background.surface": palette.gray[0],
    "color.background.subtle": palette.gray[50],
    "color.background.brand": palette.blue[500],
    "color.background.brand-hovered": palette.blue[600],
    "color.background.brand-pressed": palette.blue[700],
    "color.background.neutral": palette.gray[100],
    "color.background.neutral-hovered": palette.gray[200],
    "color.background.danger": palette.red[600],
    "color.background.danger-hovered": palette.red[700],
    "color.text.default": palette.gray[900],
    "color.text.subtle": palette.gray[600],
    "color.text.inverse": palette.gray[0],
    "color.text.brand": palette.blue[600],
    "color.border.default": palette.gray[200],
    "color.border.focused": palette.blue[500],
  },
  dark: {
    "color.background.default": palette.gray[1000],
    "color.background.surface": palette.gray[900],
    "color.background.subtle": palette.gray[800],
    "color.background.brand": palette.blue[400],
    "color.background.brand-hovered": palette.blue[300],
    "color.background.brand-pressed": palette.blue[200],
    "color.background.neutral": palette.gray[800],
    "color.background.neutral-hovered": palette.gray[700],
    "color.background.danger": palette.red[500],
    "color.background.danger-hovered": palette.red[400],
    "color.text.default": palette.gray[50],
    "color.text.subtle": palette.gray[400],
    "color.text.inverse": palette.gray[1000],
    "color.text.brand": palette.blue[300],
    "color.border.default": palette.gray[700],
    "color.border.focused": palette.blue[400],
  },
} as const;
```

- [ ] **Step 5: buildCss 실패 테스트 작성**

`design-system/packages/tokens/src/buildCss.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildCss, flatten } from "./buildCss";
import { themes } from "./semantic";

describe("flatten", () => {
  it("중첩 객체를 점 표기 키로 평탄화한다", () => {
    expect(flatten({ space: { 100: "8px" }, radius: { medium: "6px" } })).toEqual({
      "space.100": "8px",
      "radius.medium": "6px",
    });
  });
});

describe("buildCss", () => {
  it(":root에 정적 토큰과 라이트 토큰을 --chanho- 접두사 CSS 변수로 출력한다", () => {
    const css = buildCss({ "space.100": "8px" }, { "color.text.default": "#111111" }, {});
    expect(css).toContain(":root {");
    expect(css).toContain("--chanho-space-100: 8px;");
    expect(css).toContain("--chanho-color-text-default: #111111;");
  });

  it('다크 토큰은 [data-theme="dark"] 블록으로 출력한다', () => {
    const css = buildCss({}, {}, { "color.text.default": "#EEEEEE" });
    expect(css).toContain('[data-theme="dark"] {\n  --chanho-color-text-default: #EEEEEE;\n}');
  });
});

describe("semantic themes", () => {
  it("light와 dark는 동일한 토큰 키 세트를 가진다", () => {
    expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort());
  });
});
```

- [ ] **Step 6: 테스트 실패 확인**

Run: `pnpm --filter @chanho/tokens test`
Expected: FAIL — `./buildCss` 모듈 없음

- [ ] **Step 7: buildCss 구현**

`design-system/packages/tokens/src/buildCss.ts`:

```ts
const PREFIX = "--chanho-";

/** 중첩 토큰 객체를 { "a.b.c": value } 형태로 평탄화한다. */
export function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      Object.assign(out, flatten(value as Record<string, unknown>, path));
    } else {
      out[path] = String(value);
    }
  }
  return out;
}

function toVarName(key: string): string {
  return PREFIX + key.replaceAll(".", "-");
}

function block(selector: string, tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(([key, value]) => `  ${toVarName(key)}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** 정적 토큰 + 라이트 테마는 :root에, 다크 테마는 [data-theme="dark"]에 출력한다. */
export function buildCss(
  staticTokens: Record<string, string>,
  light: Record<string, string>,
  dark: Record<string, string>,
): string {
  return [block(":root", { ...staticTokens, ...light }), block('[data-theme="dark"]', dark)].join("\n\n") + "\n";
}
```

- [ ] **Step 8: 테스트 통과 확인**

Run: `pnpm --filter @chanho/tokens test`
Expected: PASS (4 tests)

- [ ] **Step 9: 빌드 스크립트와 index 작성**

`design-system/packages/tokens/src/build.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCss, flatten } from "./buildCss";
import { themes } from "./semantic";
import { font, radius, space } from "./static";

const staticTokens = flatten({ space, radius, font });
const css = buildCss(staticTokens, themes.light, themes.dark);

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tokens.css"), css);
console.log(`dist/tokens.css written (${css.length} bytes)`);
```

`design-system/packages/tokens/src/index.ts`:

```ts
export { palette } from "./palette";
export { font, radius, space } from "./static";
export { themes } from "./semantic";
export { buildCss, flatten } from "./buildCss";
```

- [ ] **Step 10: 빌드 실행 및 산출물 확인**

Run: `pnpm --filter @chanho/tokens build`
Expected: `dist/tokens.css written (...)` 출력

Run: `grep -c "chanho" C:/MSA_TEMPLATE/design-system/packages/tokens/dist/tokens.css`
Expected: 60 이상 (정적 토큰 약 30개 + 라이트 16개 + 다크 16개)

- [ ] **Step 11: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/packages/tokens design-system/pnpm-lock.yaml
git commit -m "feat(tokens): @chanho/tokens 토큰 2층 구조와 CSS 변수 빌드"
```

---

### Task 3: @chanho/react 패키지 + 테스트 환경

**Files:**
- Create: `design-system/packages/react/package.json`
- Create: `design-system/packages/react/tsconfig.json`
- Create: `design-system/packages/react/vitest.config.ts`
- Create: `design-system/packages/react/vitest.setup.ts`
- Create: `design-system/packages/react/src/css-modules.d.ts`
- Create: `design-system/packages/react/src/index.ts`
- Test: `design-system/packages/react/src/smoke.test.tsx`

**Interfaces:**
- Consumes: `@chanho/tokens` (workspace 의존성)
- Produces: npm 패키지 `@chanho/react` — 컴포넌트는 `src/<Name>/<Name>.tsx`에 두고 `src/index.ts`에서 re-export. Vitest(jsdom) + Testing Library 환경. Task 5가 이 구조 위에 Button을 추가한다.

- [ ] **Step 1: 패키지 매니페스트와 설정 작성**

`design-system/packages/react/package.json`:

```json
{
  "name": "@chanho/react",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "test": "vitest run"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@chanho/tokens": "workspace:*"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^26.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

`design-system/packages/react/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "vitest.setup.ts"]
}
```

`design-system/packages/react/vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    css: true,
  },
});
```

`design-system/packages/react/vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`design-system/packages/react/src/css-modules.d.ts`:

```ts
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
```

`design-system/packages/react/src/index.ts`:

```ts
export {};
```

- [ ] **Step 2: 의존성 설치**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm install`
Expected: 에러 없이 완료

- [ ] **Step 3: 스모크 테스트 작성**

`design-system/packages/react/src/smoke.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

it("테스트 환경에서 React 컴포넌트가 렌더링된다", () => {
  render(<p>hello</p>);
  expect(screen.getByText("hello")).toBeInTheDocument();
});
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter @chanho/react test`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/packages/react design-system/pnpm-lock.yaml
git commit -m "chore(react): @chanho/react 패키지와 Vitest+Testing Library 환경"
```

---

### Task 4: Storybook 문서 앱 + 다크모드 토글

**Files:**
- Create: `design-system/apps/docs/package.json`
- Create: `design-system/apps/docs/tsconfig.json`
- Create: `design-system/apps/docs/.storybook/main.ts`
- Create: `design-system/apps/docs/.storybook/preview.tsx`
- Create: `design-system/apps/docs/stories/Palette.stories.tsx`

**Interfaces:**
- Consumes: `@chanho/tokens`(palette 객체, `@chanho/tokens/css`), `@chanho/react`
- Produces: `pnpm storybook`(포트 6006). 스토리 수집 경로: `apps/docs/stories/**` + `packages/react/src/**/*.stories.tsx` — Task 5의 Button 스토리가 자동으로 잡힌다. 툴바의 Theme 토글이 `document.documentElement.dataset.theme`을 light/dark로 전환한다.

- [ ] **Step 1: 패키지 매니페스트 작성**

`design-system/apps/docs/package.json`:

```json
{
  "name": "docs",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@chanho/react": "workspace:*",
    "@chanho/tokens": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@storybook/addon-a11y": "^9.0.0",
    "@storybook/addon-docs": "^9.0.0",
    "@storybook/react-vite": "^9.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "storybook": "^9.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

`design-system/apps/docs/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["stories", ".storybook"]
}
```

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm install`
Expected: 에러 없이 완료

- [ ] **Step 2: Storybook 설정 작성**

`design-system/apps/docs/.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.@(ts|tsx)",
    "../../../packages/react/src/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
```

`design-system/apps/docs/.storybook/preview.tsx`:

```tsx
import type { Preview } from "@storybook/react-vite";
import "@chanho/tokens/css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "컬러 테마",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals.theme;
      return (
        <div
          style={{
            background: "var(--chanho-color-background-default)",
            color: "var(--chanho-color-text-default)",
            fontFamily: "var(--chanho-font-family-sans)",
            padding: 24,
            minHeight: "100vh",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
```

참고: docs 앱의 스토리/설정 코드는 인라인 스타일 허용(Stylelint 대상은 `packages/react`만).

- [ ] **Step 3: 팔레트 스토리 작성**

`design-system/apps/docs/stories/Palette.stories.tsx`:

```tsx
import { palette } from "@chanho/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";

function Palette() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {Object.entries(palette).map(([name, scale]) => (
        <div key={name}>
          <strong>{name}</strong>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {Object.entries(scale).map(([step, hex]) => (
              <div key={step} style={{ width: 64 }}>
                <div
                  style={{
                    height: 40,
                    borderRadius: 6,
                    background: hex,
                    border: "1px solid var(--chanho-color-border-default)",
                  }}
                />
                <small>
                  {step}
                  <br />
                  {hex}
                </small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Tokens/Palette",
  component: Palette,
} satisfies Meta<typeof Palette>;

export default meta;

export const All: StoryObj<typeof meta> = {};
```

- [ ] **Step 4: 토큰 빌드 후 Storybook 정적 빌드로 검증**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm build:tokens && pnpm --filter docs build-storybook`
Expected: `storybook-static` 생성, 빌드 성공. (수동 확인용: `pnpm storybook` → http://localhost:6006 에서 Tokens/Palette 스토리와 Theme 토글 확인)

- [ ] **Step 5: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/apps/docs design-system/pnpm-lock.yaml
git commit -m "docs(storybook): Storybook 9 문서 앱과 다크모드 토글, 팔레트 스토리"
```

---

### Task 5: Button 컴포넌트 (TDD)

**Files:**
- Create: `design-system/packages/react/src/Button/Button.tsx`
- Create: `design-system/packages/react/src/Button/Button.module.css`
- Create: `design-system/packages/react/src/Button/Button.stories.tsx`
- Modify: `design-system/packages/react/src/index.ts`
- Delete: `design-system/packages/react/src/smoke.test.tsx`
- Test: `design-system/packages/react/src/Button/Button.test.tsx`

**Interfaces:**
- Consumes: Task 2의 CSS 변수(`--chanho-color-*`, `--chanho-space-*`, `--chanho-radius-*`, `--chanho-font-*`), Task 3의 테스트 환경
- Produces: `Button` 컴포넌트와 `ButtonProps` 타입 — `variant?: 'primary' | 'subtle' | 'danger'`(기본 `primary`), `size?: 'medium' | 'small'`(기본 `medium`), 그 외 네이티브 `<button>` props 전부(ref 포함). `@chanho/react`에서 `import { Button } from '@chanho/react'`로 사용.

- [ ] **Step 1: 실패 테스트 작성**

`design-system/packages/react/src/Button/Button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("자식을 가진 접근 가능한 button으로 렌더링된다", () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>저장</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled면 클릭해도 onClick이 호출되지 않는다", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        저장
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('form 안에서 실수로 submit되지 않도록 type 기본값이 "button"이다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter @chanho/react test`
Expected: FAIL — `./Button` 모듈 없음

- [ ] **Step 3: 스타일 작성 (토큰만 사용)**

`design-system/packages/react/src/Button/Button.module.css`:

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--chanho-space-100);
  border: none;
  border-radius: var(--chanho-radius-medium);
  font-family: var(--chanho-font-family-sans);
  font-weight: var(--chanho-font-weight-medium);
  cursor: pointer;
  transition: background-color 120ms ease;
}

.button:focus-visible {
  outline: 2px solid var(--chanho-color-border-focused);
  outline-offset: 2px;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.medium {
  height: 32px;
  padding: 0 var(--chanho-space-150);
  font-size: var(--chanho-font-size-200);
}

.small {
  height: 24px;
  padding: 0 var(--chanho-space-100);
  font-size: var(--chanho-font-size-100);
}

.primary {
  background: var(--chanho-color-background-brand);
  color: var(--chanho-color-text-inverse);
}

.primary:hover:not(:disabled) {
  background: var(--chanho-color-background-brand-hovered);
}

.primary:active:not(:disabled) {
  background: var(--chanho-color-background-brand-pressed);
}

.subtle {
  background: var(--chanho-color-background-neutral);
  color: var(--chanho-color-text-default);
}

.subtle:hover:not(:disabled) {
  background: var(--chanho-color-background-neutral-hovered);
}

.danger {
  background: var(--chanho-color-background-danger);
  color: var(--chanho-color-text-inverse);
}

.danger:hover:not(:disabled) {
  background: var(--chanho-color-background-danger-hovered);
}
```

- [ ] **Step 4: 컴포넌트 구현**

`design-system/packages/react/src/Button/Button.tsx`:

```tsx
import type { ComponentPropsWithRef } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * 시각적 스타일. primary는 화면의 핵심 액션 하나에만 사용한다.
   * @default 'primary'
   */
  variant?: "primary" | "subtle" | "danger";
  /**
   * 크기. 밀도 높은 UI(테이블 행 등)에는 small을 사용한다.
   * @default 'medium'
   */
  size?: "medium" | "small";
}

export function Button({
  variant = "primary",
  size = "medium",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  const cls = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={cls} {...rest} />;
}
```

`design-system/packages/react/src/index.ts` 전체를 다음으로 교체:

```ts
export { Button } from "./Button/Button";
export type { ButtonProps } from "./Button/Button";
```

- [ ] **Step 5: 테스트 통과 확인 및 스모크 테스트 제거**

Run: `pnpm --filter @chanho/react test`
Expected: PASS (5 tests)

Run: `rm C:/MSA_TEMPLATE/design-system/packages/react/src/smoke.test.tsx`

Run: `pnpm --filter @chanho/react test`
Expected: PASS (4 tests)

- [ ] **Step 6: 스토리 작성**

`design-system/packages/react/src/Button/Button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "버튼" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Subtle: Story = { args: { variant: "subtle" } };

export const Danger: Story = { args: { variant: "danger" } };

export const Small: Story = { args: { size: "small" } };

export const Disabled: Story = { args: { disabled: true } };
```

참고: `@storybook/react-vite`는 docs 앱의 devDependency다. pnpm 기본 설정에서 react 패키지가 이를 import하면 에디터에서 타입 에러가 보일 수 있으나, 스토리는 Storybook(docs 앱) 빌드 컨텍스트에서만 로드되므로 동작한다. 문제가 되면 `@storybook/react-vite`를 react 패키지 devDependencies에도 추가한다.

- [ ] **Step 7: Storybook에서 확인**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm --filter docs build-storybook`
Expected: 빌드 성공, 출력에 Components/Button 스토리 포함. (수동 확인용: `pnpm storybook` → Button 5개 스토리, Theme 토글로 다크모드 확인)

- [ ] **Step 8: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/packages/react
git commit -m "feat(react): Button 컴포넌트 - variant/size, 토큰 기반 스타일, 스토리"
```

---

### Task 6: Stylelint — 색상 하드코딩 차단

**Files:**
- Create: `design-system/.stylelintrc.json`
- Modify: `design-system/package.json` (devDependencies에 stylelint 추가)

**Interfaces:**
- Consumes: Task 5의 `Button.module.css` (통과해야 할 실제 대상)
- Produces: `pnpm lint:css` — `packages/react/src/**/*.css`에서 hex 색상과 색상 키워드를 차단. 이후 모든 컴포넌트 CSS가 이 검사를 통과해야 한다.

- [ ] **Step 1: stylelint 설치와 설정 작성**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm add -w -D stylelint@^16.0.0`

`design-system/.stylelintrc.json`:

```json
{
  "rules": {
    "color-no-hex": true,
    "color-named": "never"
  }
}
```

- [ ] **Step 2: 실제 CSS가 통과하는지 확인**

Run: `cd C:/MSA_TEMPLATE/design-system && pnpm lint:css`
Expected: 에러 없이 종료 (Button.module.css는 CSS 변수만 사용)

- [ ] **Step 3: 위반을 실제로 잡는지 확인 (부정 테스트)**

Run: `cd C:/MSA_TEMPLATE/design-system && echo ".bad { color: #fff; }" | pnpm exec stylelint --stdin --stdin-filename=bad.css`
Expected: `color-no-hex` 에러 출력, 비정상 종료 코드 — 규칙이 살아있음을 확인

- [ ] **Step 4: Commit**

```bash
cd C:/MSA_TEMPLATE
git add design-system/.stylelintrc.json design-system/package.json design-system/pnpm-lock.yaml
git commit -m "chore(design-system): stylelint로 컴포넌트 CSS 색상 하드코딩 차단"
```

---

## 완료 기준 (Plan A 전체)

- `pnpm test` — tokens 4개 + react 4개 테스트 전부 통과
- `pnpm build:tokens` — `dist/tokens.css`에 라이트/다크 변수 생성
- `pnpm lint:css` — 통과
- `pnpm storybook` — Tokens/Palette + Components/Button(5 스토리) 렌더링, Theme 토글로 다크모드 전환, a11y 애드온 위반 0건
- 이후 **Plan B**(TextField, Select, Checkbox, Radio, Switch, Modal, Dropdown, Tooltip, Toast, Badge, Avatar, Spinner, Tabs, Lozenge — Radix 도입 포함)를 별도 작성
