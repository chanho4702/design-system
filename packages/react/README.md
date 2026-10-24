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

## 컴포넌트 (33)

Avatar · Badge · Banner · Button · Card · Checkbox · CommandPalette · Comment · ConfirmDialog · ContextMenu ·
Dropdown · EmptyState · InlineEdit · Lozenge · Modal · MultiSelect · PageHeader · Popover · ProgressBar · Radio/RadioGroup · Select ·
SideNav · Skeleton(SkeletonText·SkeletonAvatar·SkeletonListItem) · Spinner · Switch · Table · Tabs · Tag ·
TextArea · TextField · Toast(ToastProvider/useToast) · Tooltip · TopBar

로딩 표시: 페이지·목록·패널은 `Skeleton` 계열(또는 `Table`의 `loading`)을 쓰고, `Spinner`는 버튼 안처럼 작은 진행 표시에만 쓴다.

모션: 오버레이(메뉴·팝오버·툴팁·모달·명령 팔레트·토스트)와 탭 밑줄은 `@chanho/tokens`의 `--chanho-motion-*`로 짧게 움직이고,
OS의 "동작 줄이기"(`prefers-reduced-motion: reduce`)면 tokens.css가 지속시간을 1ms로 덮어 멈춘다 — 소비 앱이 따로 할 일은 없다.

밀도: 행이 많은 목록은 `Table`의 `density="compact"`(행 약 31px), 메뉴가 많은 사이드바는 `SideNav`의 `density="compact"`(항목 28px).

peerDependencies: react ^19, react-dom ^19
