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
