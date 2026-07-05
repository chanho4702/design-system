# 자체 디자인 시스템 설계 문서

- 작성일: 2026-07-05
- 상태: 승인됨 (구현 계획 수립 전)
- 위치: `C:\MSA_TEMPLATE\design-system\`

## 1. 목적과 배경

Jira/Confluence가 Atlassian Design System 하나를 공유하듯, 아래 두 소비처에서 공통으로 사용할 **자체 보유 디자인 시스템**을 구축한다.

1. **MSA 플랫폼 템플릿** — `C:\MSA_TEMPLATE`의 React 프론트엔드(myFront 등)
2. **Jira/Confluence 클론** — 향후 제작할 협업 툴 클론 (인증 로드맵의 관통 프로젝트 PMS와 연결 가능)

### 목표 수준

- **최종 목표**: Atlassian급 풀세트 — 다크모드, 접근성, 모션, 50+ 컴포넌트 (단계적 도달)
- **비주얼 방향**: 토큰 구조·컴포넌트 구성은 Atlassian을 참고하되, 색상·서체 등 아이덴티티는 자체 브랜드로 정의

### 스코프 제외

- 지라 클론의 칸반 보드, 컨플 클론의 문서 에디터 등 **앱 기능 수준의 복합 UI**는 디자인 시스템에 포함하지 않는다. 디자인 시스템은 그 재료(토큰·기본 컴포넌트)만 제공한다.
- 시각적 회귀 테스트(Chromatic 등)는 Phase 4 이후 선택 사항.

## 2. 구현 접근: Headless 기반

**Radix UI** primitives 위에 자체 토큰·스타일을 입히는 방식을 채택한다.

- 접근성·키보드 내비게이션·포커스 관리 등 가장 어려운 동작 계층은 Radix가 제공
- 룩앤필은 100% 자체 정의 — shadcn/ui와 같은 계열의 업계 표준 패턴
- 검토했으나 채택하지 않은 대안:
  - **완전 스크래치**: 학습 깊이는 최고지만 WAI-ARIA 함정이 많고 소요 시간이 3~5배, 중도 포기 위험
  - **기존 라이브러리(MUI/Ant) 테마화**: 빠르지만 룩 제약이 크고 "보유 자산"이라는 목표와 불일치
- 학습 깊이가 아쉬운 컴포넌트(예: Modal 포커스 트랩)는 개별적으로 스크래치 구현을 병행해도 무방

## 3. 아키텍처

### 3.1 모노레포 구조 (pnpm workspace)

```
C:\MSA_TEMPLATE\design-system\
├── packages/
│   ├── tokens/        # 디자인 토큰 (색상·간격·타이포·그림자)
│   │   └─ TS로 정의 → 빌드 시 CSS 변수 + TS 상수로 출력
│   ├── react/         # React 컴포넌트 라이브러리 (Radix 기반)
│   │   └─ 토큰만 참조, 색상·간격 하드코딩 금지
│   └── icons/         # 아이콘 세트 (SVG → React 컴포넌트, Phase 4)
├── apps/
│   └── docs/          # Storybook 문서 사이트
└── (Changesets 버전 관리 → GitHub Packages 배포)
```

### 3.2 의존 방향 (단방향)

- `react` → `tokens` (참조)
- 소비자(MSA 템플릿 프론트, 클론 앱)는 `@<scope>/react`, `@<scope>/tokens`를 **npm 패키지로 설치**해서 사용
  - 패키지 스코프명(`<scope>`)은 Phase 0에서 브랜드명과 함께 확정한다
- 클론/템플릿 코드가 디자인 시스템 안으로 들어오는 일은 없다

### 3.3 토큰 2층 구조와 다크모드

- **원시 토큰(palette)**: `blue.500`, `gray.100` 같은 원본 값
- **시맨틱 토큰**: `color.background.brand`, `color.text.subtle` 등 용도 기반 이름 — 컴포넌트는 이것만 사용
- 다크모드는 토큰 층에서 해결: `<html data-theme="dark">` 전환 시 CSS 변수 값만 교체. 컴포넌트 코드는 테마를 모른다 (Atlassian 방식)

### 3.4 스타일링

- **CSS 변수 + CSS Modules** 채택
- 런타임 의존성 없음 → 배포 패키지 경량, 도구 마법이 없어 학습에 유리
- vanilla-extract·Tailwind는 검토했으나 첫 디자인 시스템에는 과한 도구로 판단해 제외

## 4. 단계별 로드맵

각 Phase 종료 시점마다 실제 사용 가능한 상태를 유지한다.

### Phase 0 — 파운데이션
- pnpm workspace 모노레포 셋업 + Storybook + 빌드 파이프라인(tsup 등)
- 브랜드 정의: 색상 팔레트, 서체, 간격 스케일
- `tokens` 패키지: 원시/시맨틱 2층 구조, 라이트·다크 값 동시 정의

### Phase 1 — 핵심 컴포넌트 (~15개)
- 폼: Button, TextField, Select, Checkbox, Radio, Switch
- 오버레이: Modal, Dropdown, Tooltip, Toast
- 표시: Badge, Avatar, Spinner, Tabs, Lozenge
- 컴포넌트마다 Storybook 스토리 필수
- **Phase 1 완료 = 클론 개발 착수 가능 시점**

### Phase 2 — "보유 자산"화
- GitHub Packages npm 배포 + Changesets 버전 관리
- 다크모드 토글 완성
- MSA 템플릿 프론트에서 실제 install하여 검증

### Phase 3 — 지라/컨플급 고급 컴포넌트
- Table(정렬·선택·고정 헤더), DatePicker, Sidebar/PageLayout, Breadcrumb, Banner, EmptyState, ProgressTracker, Comment 등
- 클론을 만들며 필요해진 컴포넌트를 역으로 시스템에 추가하는 상호 성장 구조

### Phase 4 — 마감 품질
- `icons` 패키지 (SVG → React 컴포넌트 자동 생성)
- 접근성 감사 (키보드·스크린리더 전수 점검)
- 모션 토큰 (전환 애니메이션 표준화)

## 5. 품질 기준 — 컴포넌트 완성의 정의 (DoD)

하나의 컴포넌트는 아래를 전부 만족해야 "완성"이다.

1. **토큰만 사용** — 색상·간격 하드코딩 금지, ESLint 규칙으로 자동 검출
2. **Storybook 스토리** — 모든 variant(크기·상태·다크모드)를 스토리로 노출
3. **접근성** — 키보드만으로 조작 가능, 스토리에서 axe 자동 검사 통과
4. **테스트** — Vitest + Testing Library 행위 테스트 ("클릭하면 onChange가 불린다" 수준)
5. **타입** — props의 TypeScript 완전 정의 + JSDoc 설명 (Storybook props 표 자동 생성)

### 테스트 전략

- 복잡한 동작(Modal 포커스 트랩, Select 키보드 내비 등)과 유틸: 테스트 필수
- 스타일 위주의 단순 표시 컴포넌트: Storybook 스토리로 갈음

## 6. 기술 스택 요약

| 영역 | 선택 |
|---|---|
| 패키지 관리 | pnpm workspace (모노레포) |
| 동작 계층 | Radix UI primitives |
| 스타일링 | CSS 변수 + CSS Modules |
| 문서 | Storybook |
| 테스트 | Vitest + Testing Library + axe |
| 빌드 | tsup (또는 동급 번들러, 구현 계획에서 확정) |
| 버전/배포 | Changesets + GitHub Packages |
