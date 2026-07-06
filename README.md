# Chanho Design System

Jira/Confluence가 하나의 Atlassian Design System을 공유하듯, 여러 프로젝트(MSA 플랫폼 템플릿 프론트, 협업 툴 클론)가 공유하는 자체 디자인 시스템입니다.

**구조는 Atlassian을 참고하되, 브랜드는 자체 정의** — Primary 블루 `#3B6EF5`, Pretendard 서체.

## 패키지

| 패키지 | 설명 |
|---|---|
| [`@chanho/tokens`](packages/tokens) | 디자인 토큰 — 원시(palette)/시맨틱 2층 구조, 라이트·다크 CSS 변수 85개 |
| [`@chanho/react`](packages/react) | React 19 컴포넌트 15종 — Radix UI 기반 동작 + 토큰 스타일링 |

## 사용

```bash
pnpm add @chanho/react @chanho/tokens
```

```tsx
// 앱 진입점
import "@chanho/tokens/css";       // CSS 변수 (라이트/다크)
import "@chanho/react/styles.css"; // 컴포넌트 스타일

import { Button, TextField, Modal, ToastProvider, useToast } from "@chanho/react";
```

다크 모드는 변수 교체만으로 동작합니다 — 컴포넌트는 테마를 모릅니다:

```ts
document.documentElement.dataset.theme = "dark"; // 또 "light"
```

## 컴포넌트 (15)

**표시** Avatar · Badge · Lozenge · Spinner
**폼** Button · Checkbox · Radio/RadioGroup · Select · Switch · TextField
**오버레이·내비게이션** Dropdown · Modal · Tabs · Toast(`ToastProvider`/`useToast`) · Tooltip

## 아키텍처 원칙

- **토큰 2층 구조**: 컴포넌트는 시맨틱 토큰(`--chanho-color-background-brand`)만 참조하고 원시 팔레트는 직접 쓰지 않습니다. 색상 하드코딩은 Stylelint가 차단합니다(hex·색상명·rgb()/hsl() 전부).
- **Headless 기반**: 포커스 트랩, 키보드 내비게이션, 스크린리더 시맨틱 같은 동작 계층은 [Radix UI](https://www.radix-ui.com/primitives)가 담당하고, 룩앤필은 100% 이 저장소가 소유합니다.
- **접근성 계약을 테스트로 강제**: 라벨 없는 폼 컨트롤 금지, `role`/접근 가능 이름/키보드 조작을 행위 테스트로 고정 (테스트 79개).

## 개발

```bash
pnpm install
pnpm storybook      # 문서·개발 환경 (localhost:6006, 다크모드 토글 포함)
pnpm test           # 전체 테스트
pnpm typecheck      # 3패키지 tsc --noEmit
pnpm lint:css       # 색상 하드코딩 검사
pnpm build-storybook
```

### 저장소 구조

```
packages/tokens    # @chanho/tokens — 토큰 정의 + CSS 변수 빌드(tsup + 자체 스크립트)
packages/react     # @chanho/react — 컴포넌트 (Vite lib mode 빌드)
apps/docs          # Storybook 9
examples/consumer  # 배포 산출물 검증용 독립 소비자 앱
docs/superpowers   # 설계 스펙·구현 계획 문서
```

### 릴리스

[Changesets](https://github.com/changesets/changesets) 워크플로:

```bash
pnpm changeset          # 변경 내용 기록
pnpm version-packages   # 버전·CHANGELOG 반영
pnpm -r build && pnpm -r publish --access public --publish-branch main
```

## 라이선스

[MIT](packages/tokens/LICENSE)
