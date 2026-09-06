# @chanho/org-admin

플랫폼 공통 **조직 관리 화면** 패키지. wiki-front·alm-front가 같은 화면을 각자 복제하지 않고 이
하나를 마운트해서 쓴다. 화면은 `@chanho/react` 디자인시스템으로만 그리고, 데이터는 호스트가
넘겨준 인증 fetch 하나로 `/api/org/*`(org-service)만 부른다.

설계 원본: `platform-backend/docs/superpowers/specs/2026-09-05-user-invite-team-permission-design.md`
(§3.3 API 계약, §5 공용 관리 화면), 메일 설정은
`platform-backend/docs/superpowers/specs/2026-09-07-platform-mail-design.md`(§3 API, §5 화면 구성).

---

## 화면

| 경로 | 화면 | 하는 일 |
|---|---|---|
| `users` | 사용자 | 목록·검색·상태/종류 필터·페이지네이션, 상세(상태 변경 · 팀 · 권한 · 이력). 표시명 편집은 없다 |
| `invitations` | 초대 | 새 초대(이메일 여러 개·팀·권한 프리셋·메시지 → 링크 복사·발송 여부), 상태 탭 목록·재발송·철회 |
| `teams` | 팀 | 목록·검색·생성·이름 변경·삭제, 팀원 추가/제거·리더 지정. `kind=EVERYONE` 팀은 읽기 전용 |
| `roles` | 전역 역할 | `GLOBAL` grant 목록·부여·역할 변경·회수 (마지막 관리자 보호는 서버 409 문구 그대로) |
| `pending` | 승인 대기 | 초대 없이 로그인해 PENDING으로 격리된 계정 승인·거절 |
| `mail` | 메일 설정 | 플랫폼 발송 설정(모드 배지·SMTP 폼·테스트 발송)과 발송 로그(상태 필터·다시 보내기). **전역 관리자에게만** 메뉴가 보이고, 서버도 같은 권한으로 막는다 |

별도 export로 **`PendingApprovalGate`** — 앱 셸보다 바깥에서 `/api/org/me`를 한 번 읽어,
`status === "PENDING"`이면 셸 대신 "승인 대기 중" 안내를 그린다.

---

## 설치

이 리포는 `@chanho/*`로 개발하고 GitHub Packages에는 `@chanho4702/*`로 발행한다. 소비 쪽은 pnpm
alias로 import 이름을 유지한다.

```jsonc
// 소비 프로젝트 package.json
{
  "dependencies": {
    "@chanho/tokens":    "npm:@chanho4702/tokens@0.4.0",
    "@chanho/react":     "npm:@chanho4702/react@0.8.1",
    "@chanho/org-admin": "npm:@chanho4702/org-admin@0.2.0",
    "react-router": "^7.0.0"
  }
}
```

`react`, `react-dom`, `react-router`, `@chanho/react`, `@chanho/tokens`는 **peer**다 — 호스트의
사본을 그대로 쓴다. 스타일은 앱 진입점에서 세 줄을 함께 가져온다.

```ts
import "@chanho/tokens/css";
import "@chanho/react/styles.css";
import "@chanho/org-admin/styles.css";
```

---

## 마운트

패키지는 라우터를 만들지 않는다. 호스트가 splat 라우트를 하나 내주고 `basePath`를 알려주면,
패키지가 그 아래 경로(`users`·`invitations`·…)만 정의한다.

### wiki-front

```tsx
import { OrgAdminApp, PendingApprovalGate } from "@chanho/org-admin";
import { Route, Routes } from "react-router";

const api = (path: string, init?: RequestInit) =>
  fetch(path, { ...init, credentials: "include" }); // 게이트웨이·쿠키·토큰은 호스트 책임

<PendingApprovalGate api={api} actions={<a href="/logout">로그아웃</a>}>
  <Routes>
    {/* … 앱의 나머지 라우트 … */}
    <Route
      path="/admin/org/*"
      element={
        <OrgAdminApp
          basePath="/admin/org"
          api={api}
          currentUser={{ id: me.id, globalRoles: me.globalRoles }}
          resolveResource={async (scope, id) =>
            scope === "SPACE"
              ? { name: (await loadSpace(id)).name, href: `/spaces/${id}` }
              : { name: id }
          }
          links={{ space: (id) => `/spaces/${id}` }}
        />
      }
    />
  </Routes>
</PendingApprovalGate>;
```

### alm-front

`basePath`는 임의 경로를 받는다 — ALM은 설정 아래에 붙이고 `links`만 프로젝트로 바꾼다.
호스트 라우트도 같은 앞머리(`<Route path="/settings/org/*" …>`)를 써야 한다.

```tsx
<OrgAdminApp
  basePath="/settings/org"
  api={api}
  currentUser={{ id: me.id, globalRoles: me.globalRoles }}
  resolveResource={(scope, id) =>
    scope === "PROJECT" ? loadProject(id) : Promise.resolve({ name: id })
  }
  links={{ project: (id) => `/projects/${id}` }}
/>
```

---

## `api` 어댑터 계약

```ts
type OrgApiFetch = (path: string, init?: RequestInit) => Promise<Response>;
```

- **경로**: 패키지는 언제나 `/api/org/...`로 시작하는 **상대 경로**만 넘긴다. 게이트웨이 prefix·
  절대 URL·포트는 호스트가 붙인다. 멤버 조회는 두 갈래다 — 선택기(팀원 추가·권한 대상)는
  배열을 주는 `GET /members?status=&kind=&q=`, 사용자 목록 화면은 페이지를 주는
  `GET /members/page?status=&kind=&q=&page=&size=`를 쓴다. 메일 설정은
  `/api/org/settings/mail`(GET·PUT), `…/mail/test`, `…/mail/log`, `…/mail/log/{id}/retry`를 부른다.
- **인증**: 토큰 헤더든 쿠키든 호스트가 붙인다. 패키지는 자격증명을 만들지도, 보지도 않는다.
- **응답**: `Response`를 그대로 돌려준다. 실패는 던지지 말고 `res.ok === false`로 돌려주면 된다 —
  패키지가 본문의 `{"error": "..."}`를 꺼내 그 문구 그대로 토스트에 띄운다. 401·403에서 로그인으로
  보내는 정책이 있으면 어댑터 안에서 처리한다.
- **재시도·캐시 없음**: 패키지는 화면 단위로만 다시 읽는다.

### 그 밖의 props

| prop | 뜻 |
|---|---|
| `basePath` | 이 앱이 마운트된 경로. 임의 경로를 받는다(wiki `/admin/org`, ALM `/settings/org`). 내비게이션 링크와 리다이렉트의 앞머리. |
| `currentUser` | `{ id, globalRoles }` — `/api/org/me` 값 그대로. `globalRoles`에 `"ADMIN"`이 있으면 관리자 UI가 열린다. |
| `resolveResource?` | `(scope, id) => Promise<{name, href?}>`. 리소스 권한에 사람이 읽는 이름을 붙인다. 없거나 실패하면 id를 그대로 보여 준다. |
| `links?` | `{ space?(id), project?(id) }` — 리소스로 나가는 링크. |

토큰·시크릿은 화면에 절대 표시하지 않는다. 초대는 서버가 준 `inviteUrl`만 복사 버튼으로 노출한다.
SMTP 비밀번호도 서버가 내려주지 않는다 — 화면은 `passwordSet`만 받아 "저장됨"으로 표시하고, PUT에서
`password` 키를 **뺀 채로** 보내면 유지, 빈 문자열로 보내면 삭제다(삭제는 확인을 한 번 거친다).

---

## 호스트 주의사항

### 초대 화면 프리셋 링크

호스트의 스페이스·프로젝트 권한 화면에서 "초대하기"를 걸 때 쿼리로 프리셋을 넘길 수 있다.

```
/admin/org/invitations?scope=SPACE&resourceId=DEV&role=EDITOR
```

`scope`는 `SPACE` 또는 `PROJECT`, `role`은 `VIEWER|EDITOR|ADMIN`(모르는 값이면 `VIEWER`).
초대 폼이 열린 채로 그 권한이 미리 담기고, 화면이 **쿼리를 즉시 지운다**(`replace`) — 새로고침이나
뒤로가기에서 프리셋이 되살아나지 않게 하기 위해서다. 호스트는 `resolveResource`만 주면 칩에
리소스 id 대신 이름이 표시된다.

### vitest에서 `useLocation()` 오류가 날 때

호스트 테스트가 이 패키지를 **외부화**하면 `react-router`가 두 벌 로드되어 컨텍스트가 갈라지고,
`useLocation() may be used only in the context of a <Router> component` 같은 오류가 난다.
호스트의 `vitest.config.ts`에서 두 가지를 함께 걸어야 한다.

```ts
export default defineConfig({
  resolve: {
    // 라우터 인스턴스를 하나로 묶는다.
    dedupe: ["react", "react-dom", "react-router"],
  },
  test: {
    server: {
      deps: {
        // ⚠️ 발행 스코프로 적어야 한다. pnpm alias의 `@chanho/*`가 아니라
        //    실제 설치된 패키지 이름(`@chanho4702/*`)으로 해석되기 때문이다.
        inline: ["@chanho4702/org-admin"],
      },
    },
  },
});
```

`@chanho/org-admin`으로 적으면 매칭되지 않아 증상이 그대로 남는다.

---

## 개발

```bash
pnpm --filter @chanho/org-admin typecheck
pnpm --filter @chanho/org-admin test
pnpm --filter @chanho/org-admin lint:css
pnpm --filter @chanho/org-admin build
```

- 색·간격은 시맨틱 토큰(`--chanho-*`)만 쓴다. 하드코딩 색은 Stylelint가 막는다.
- 테스트는 `src/testing/fakeApi.ts`로 `api`를 갈아끼워 화면째 검증한다(`getByRole` 우선).
  이 디렉터리는 빌드·타입 산출물에서 제외된다.
- 백엔드 응답 → 화면 타입 변환은 `src/api/mapping.ts` 한 곳에 있다. 계약이 바뀌면 여기만 고친다.
