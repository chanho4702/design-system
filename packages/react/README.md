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
