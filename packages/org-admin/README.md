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
| `users` | 사용자 | 목록·검색·상태/종류 필터·페이지네이션, 상세(상태 변경 · 아바타 변경/삭제 · 팀 · 권한 · 이력). 아바타 컨트롤은 **전역 관리자에게만** 보인다(주로 브라우저로 로그인하지 않는 AGENT 멤버용). 표시명 편집은 없다 |
| `invitations` | 초대 | 새 초대(이메일 여러 개·팀·권한 프리셋·메시지 → 링크 복사·발송 대기열 여부), 상태 탭 목록·재발송·철회 |
| `teams` | 팀 | 목록·검색·생성·이름 변경·삭제, 팀원 추가/제거·리더 지정. `kind=EVERYONE` 팀은 읽기 전용 |
| `roles` | 전역 역할 | `GLOBAL` grant 목록·부여·역할 변경·회수 (마지막 관리자 보호는 서버 409 문구 그대로) |
| `pending` | 승인 대기 | 초대 없이 로그인해 PENDING으로 격리된 계정 승인·거절 |
| `mail` | 메일 설정 | 플랫폼 발송 설정(모드 배지·SMTP 폼·테스트 발송)과 발송 로그(상태 필터·다시 보내기). **전역 관리자에게만** 메뉴가 보이고, 서버도 같은 권한으로 막는다 |

별도 export로 **`PendingApprovalGate`** — 앱 셸보다 바깥에서 `/api/org/me`를 한 번 읽어,
`status === "PENDING"`이면 셸 대신 "승인 대기 중" 안내를 그린다.

---

## 관리자 사용 가이드 — 사용자 상세

### 아바타 대신 올리기 (전역 관리자)

사용자 상세의 **아바타** 절에서 남의 아바타를 올리거나 지운다. 브라우저로 로그인하지 않는 AGENT
멤버는 스스로 올릴 방법이 없으니 이 경로가 유일하다.

| 동작 | 서버에 가는 것 | 규칙 |
|---|---|---|
| 아바타 변경 | `PUT /api/org/members/{id}/avatar`, multipart `file` 한 칸 | PNG·JPG·WebP, **2MB 이하**. 형식은 확장자가 아니라 파일 내용(매직 바이트)으로 서버가 판정한다. 화면은 크기·명백한 형식만 먼저 거르고, 나머지는 서버 400 문구를 그대로 토스트한다 |
| 아바타 삭제 | `DELETE /api/org/members/{id}/avatar` | 확인 다이얼로그를 한 번 거친다. 아바타가 없어도 성공(멱등) |

성공하면 이력과 사용자 목록을 다시 읽는다. 본인이 아닌 멤버의 아바타를 바꾼 경우에만 서버가 이력을 남긴다.

### 이력 라벨

이력의 종류는 org-service `MemberEventType` 열거가 정본이다. 모르는 값이 오면 원문 그대로 보인다.

| 서버 값 | 화면 라벨 |
|---|---|
| `INVITED` | 초대됨 |
| `INVITE_RESENT` | 초대 재발송 |
| `INVITE_REVOKED` | 초대 철회 |
| `INVITE_EXPIRED` | 초대 만료 |
| `JOINED` | 가입 |
| `APPROVED` | 승인됨 |
| `SUSPENDED` | 일시 정지 |
| `REACTIVATED` | 재활성 |
| `DEACTIVATED` | 비활성 |
| `TEAM_ADDED` | 팀 추가 |
| `TEAM_REMOVED` | 팀 제거 |
| `AVATAR_CHANGED` | 아바타 변경(관리자) |
| `AVATAR_REMOVED` | 아바타 삭제(관리자) |
| `KEYCLOAK_DISABLED_FAILED` | Keycloak 비활성 실패 |

---

## 관리자 사용 가이드 — 메일 설정

`<basePath>/mail` 화면이다. 플랫폼 메일은 org-service 한 곳에서 나가므로 **이 화면 하나가 플랫폼
전체의 메일 스위치**다. 설치 시점의 모드 선택과 컨테이너 기동은
[`infra/README.md`의 설치 옵션 — 메일](https://github.com/chanho4702/infra-settings/blob/main/infra/README.md#설치-옵션--메일-2026-09-07),
처음 세우는 순서는 [`INSTALL.md` §7](https://github.com/chanho4702/infra-settings/blob/main/INSTALL.md#7-메일-설정-mail_mode를-none-외로-고른-경우)에 있다.

**전역 관리자 전용이다.** `currentUser.globalRoles`에 `ADMIN`이 없으면 메뉴가 보이지 않고, 직접
주소로 들어가도 "메일 설정은 전역 관리자만 볼 수 있습니다" 안내만 나온다. 서버도 같은 권한으로 막는다.

### 설치 모드 배지

화면 맨 위 배지는 서버가 준 `mode`(= 설치 시 고른 `MAIL_MODE`)다. **읽기 전용 안내값**이고 동작을
바꾸지 않는다 — 모드를 실제로 바꾸는 것은 `.env` + `scripts/mail-up.ps1` + org-service 재기동이다.

| 배지 | 화면 안내 문구 | 운영자가 알아야 할 것 |
|---|---|---|
| 사용 안 함(`none`) | 메일 없이 운영합니다. 초대는 링크를 복사해 전달합니다. | 아래 "메일 발송 사용"을 켜도 보낼 곳이 없다. 초대는 링크 복사가 유일한 경로 |
| 외부 SMTP(`external`) | 사내 SMTP·Gmail·SES 등 이미 있는 메일 서버를 씁니다. | 호스트·사용자·비밀번호를 이 화면에서 채운다. 인증이 있으면 `ORG_SETTINGS_ENC_KEY`가 필요하다 |
| 릴레이(`relay`) | 발송 전용 릴레이를 거쳐 보냅니다. 앱은 관문 하나만 봅니다. | 보통 호스트 `mail-relay`, 포트 `25`, TLS `없음`, 사용자·비밀번호 **비움**(인증 없는 내부 릴레이) |
| 자체 메일 서버(`full`) | 우리 서버가 메일 서버입니다. 완전 폐쇄망에서도 주고받습니다. | 계정·DKIM·DNS가 선행돼야 한다(`scripts/mail-setup.ps1`) |
| 개발(캡처)(`dev`) | 개발용 캡처 서버입니다. 실제로 발송되지 않습니다. | 로그의 `성공`은 **Mailpit이 받았다**는 뜻이다. 수신자에게 가지 않는다 — 내용은 `http://127.0.0.1:8025`에서 본다 |

배지 자리에 "확인 필요"가 뜨면 서버가 모드를 알려 주지 않은 것이고, 설정 값만 표시된다.

"메일 발송 사용"이 꺼져 있으면 화면 상단에 경고 배너가 뜬다 — 초대·알림 메일이 나가지 않고
초대는 링크 복사로만 전달된다.

### SMTP 설정 필드

| 필드 | 규칙 |
|---|---|
| **메일 발송 사용** | 끄면 큐에 넣지 않고 곧바로 "꺼짐"으로 답한다. 끄는 것은 값을 비우지 않고도 언제나 허용된다 |
| **호스트** | 사용 중이면 필수 |
| **포트** | 1~65535. 사용 중이면 필수 |
| **사용자** | 비우면 **인증 없이** 보낸다(사내 릴레이가 그렇다) |
| **비밀번호** | 아래 "비밀번호 3갈래" |
| **TLS** | 없음 · STARTTLS · SSL/TLS. 내부 릴레이는 보통 "없음", 제출 포트(587)는 STARTTLS, 465는 SSL |
| **보내는 주소** | 사용 중이면 필수, `@`가 있어야 한다. 수신 측 SPF 대조 대상이다 |
| **보내는 이름** | 선택 |

화면 검증은 서버 규칙(`enabled`면 호스트·포트·보내는 주소 필수)을 앞당겨 보여 주기만 한다 —
**최종 판정은 서버**이고, 서버가 거부하면 그 문구가 그대로 토스트에 뜬다. 폼 아래에 마지막 수정
시각과 수정자 멤버 id가 표시된다(최초 시드값이면 수정자가 비어 있다).

### 비밀번호 3갈래

비밀번호는 **어떤 응답에도 실리지 않는다.** 화면은 "저장돼 있는지"만 받아 입력란의 자리표시를
`저장됨`으로 바꾼다. 저장 동작은 셋이다.

| 하려는 것 | 화면에서 | 서버에 가는 것 |
|---|---|---|
| 지금 값 유지 | 비밀번호 칸을 **건드리지 않고** 저장 | `password` 키 자체를 뺀다 |
| 새 값으로 교체 | 새 값을 입력하고 저장 | `password: "<값>"` |
| 저장된 값 삭제 | 칸을 비운 채 저장하거나 [비밀번호 삭제] | `password: ""` — **확인 다이얼로그를 한 번 거친다** |

저장에는 `ORG_SETTINGS_ENC_KEY`(32바이트 hex)가 필요하다. 없으면 서버가
`메일 비밀번호를 저장하려면 ORG_SETTINGS_ENC_KEY가 필요합니다`로 거부하고(나머지 설정은 정상 저장된다),
**키를 바꾸면 이미 저장된 비밀번호는 복호화되지 않으므로** 이 화면에서 다시 입력해야 한다.

### 테스트 발송 해석

저장된 설정으로 **한 통을 즉시(동기)** 보낸다. 받는 주소를 비우면 요청한 관리자 본인의 계정
이메일로 간다. 결과 해석:

| 토스트 | 뜻 · 다음 할 일 |
|---|---|
| 테스트 메일을 보냈습니다 | SMTP가 받아들였다. `dev` 모드면 배달이 아니라 **캡처**다 |
| `Couldn't connect to host, port: …` 같은 SMTP 원문 | 호스트·포트·방화벽. 값은 서버가 SMTP에서 받은 문구 그대로이고 가공하지 않는다 |
| 인증 관련 SMTP 원문 | 사용자·비밀번호·TLS 조합. 인증 없는 릴레이라면 사용자를 **비워야** 한다 |
| 메일 발송이 꺼져 있거나 호스트·보내는 주소가 비어 있습니다 | SMTP까지 가지도 않았다. "메일 발송 사용"과 호스트·보내는 주소를 먼저 채운다 |

테스트도 발송 로그에 **출처 `테스트`**로 한 줄 남는다.

### 발송 로그 (큐이자 로그)

| 열 | 읽는 법 |
|---|---|
| 받는 주소 · 제목 | **본문은 담지 않는다** — 로그 화면이 사서함이 되지 않게 한 설계다 |
| 출처 | `위키` · `ALM` · `조직`(초대 등) · `테스트`. 장애 범위를 가르는 첫 단서 |
| 상태 | `대기`(아직·재시도 차례를 기다림) · `성공` · `실패`(자동 재시도를 다 씀) |
| 시도 | 최대 **5회**. 실패 간격은 30초 → 1분 → 2분 → 4분으로 늘어난다 |
| 오류 | 마지막 실패의 SMTP 원문(성공이면 `-`). 길면 잘리고 마우스를 올리면 전체가 보인다 |
| 시각 | 보낸 시각이 있으면 그것, 없으면 큐에 들어간 시각 |

- **[다시 보내기]는 `실패` 행에만 나온다.** 누르면 시도 횟수를 0으로 되돌려 대기로 바꾼다(성공한 메일을
  다시 보내면 같은 메일이 두 번 간다 — 서버도 `실패한 발송만 다시 보낼 수 있습니다`로 409를 낸다).
- 한 페이지 20줄이고, 종결분(`성공`·`실패`)은 **30일 뒤 자동 정리**된다.
- "메일이 안 갔다"는 신고는 이 순서로 본다: 상단 "사용 여부" → [테스트 발송] 문구 → 로그의 `실패`
  행 오류 → 컨테이너 로그. 위키·ALM 알림만 빠져 있으면 `ORG_INTERNAL_TOKEN` 불일치다
  (`/internal/org/mail`이 401이고 알림함 자체는 계속 동작한다).

초대 응답의 `mailSent`가 "보냈다"가 아니라 "대기열에 넣었다"인 이유는
[초대 메일은 "보냈다"가 아니라 "대기열에 넣었다"](#초대-메일은-보냈다가-아니라-대기열에-넣었다)에 있다.

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
    "@chanho/org-admin": "npm:@chanho4702/org-admin@0.2.2",
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

### 초대 메일은 "보냈다"가 아니라 "대기열에 넣었다"

플랫폼 메일은 org-service 허브(outbox)를 거친다 — 초대 생성·재발송 응답의 `mailSent=true`는
**발송 대기열에 넣었다**는 뜻이고, 수신자에게 도착했는지는 거기서 알 수 없다. 그래서 화면은

- 결과 표에 "발송 대기열에 넣음"이라고 적고(도착했다고 말하지 않는다),
- 그 옆에 **"발송 로그 보기"** 링크로 메일 설정 화면(`<basePath>/mail`)의 발송 로그를 가리킨다.
  발송 로그가 실제 결과(대기·성공·실패와 SMTP 오류 문구)의 단일 출처다.

메일 설정은 전역 관리자 전용이므로, `currentUser.globalRoles`에 `ADMIN`이 없으면 안내 문구만
남고 링크는 렌더되지 않는다(막힌 화면으로 보내지 않기 위해서다).

`mailSent=false`(허브가 꺼져 있거나 모드가 `none`)면 문구가 바뀐다 — "미발송 — 링크를 전달하세요"와
함께 **초대 링크 복사**가 유일한 전달 경로다. 이때는 발송 로그 링크도 띄우지 않는다.

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
