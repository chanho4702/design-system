import { PageHeader, ToastProvider } from "@chanho/react";
import { ClipboardCheck, Mail, Send, ShieldCheck, Users, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router";
import { OrgAdminProvider, useOrgAdmin } from "./context";
import type { OrgAdminLinks, OrgAdminUser, ResolveResource } from "./context";
import type { OrgApiFetch } from "./api/client";
import { GlobalRolesScreen } from "./screens/GlobalRolesScreen";
import { InvitationsScreen } from "./screens/InvitationsScreen";
import { MailScreen } from "./screens/MailScreen";
import { PendingScreen } from "./screens/PendingScreen";
import { TeamsScreen } from "./screens/TeamsScreen";
import { UsersScreen } from "./screens/UsersScreen";
import styles from "./OrgAdminApp.module.css";

export interface OrgAdminAppProps {
  /**
   * 호스트가 이 앱을 마운트한 경로. 호스트마다 다르다 — wiki는 `/admin/org`, ALM은 `/settings/org`.
   * 내비게이션 링크와 리다이렉트의 앞머리로 쓰며, 이 패키지는 특정 경로를 가정하지 않는다.
   */
  basePath: string;
  /** 인증이 붙은 fetch. 패키지는 `/api/org/...` 상대 경로만 넘긴다. */
  api: OrgApiFetch;
  currentUser: OrgAdminUser;
  /** 리소스 권한에 사람이 읽는 이름을 붙인다. 없으면 id를 그대로 보여 준다. */
  resolveResource?: ResolveResource;
  links?: OrgAdminLinks;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** 전역 관리자에게만 보이는 메뉴. 서버도 같은 권한으로 막는다. */
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { to: "users", label: "사용자", icon: <Users size={16} aria-hidden="true" /> },
  { to: "invitations", label: "초대", icon: <Mail size={16} aria-hidden="true" /> },
  { to: "teams", label: "팀", icon: <UsersRound size={16} aria-hidden="true" /> },
  { to: "roles", label: "전역 역할", icon: <ShieldCheck size={16} aria-hidden="true" /> },
  { to: "pending", label: "승인 대기", icon: <ClipboardCheck size={16} aria-hidden="true" /> },
  {
    to: "mail",
    label: "메일 설정",
    icon: <Send size={16} aria-hidden="true" />,
    adminOnly: true,
  },
];

/**
 * 마운트 경로를 절대 경로 앞머리로 정규화한다. 호스트마다 다른 값이 온다
 * (wiki `/admin/org`, ALM `/settings/org`) — 앞 슬래시 누락·뒤 슬래시를 여기서 흡수한다.
 */
function normalizeBase(basePath: string): string {
  const trimmed = basePath.trim().replace(/\/+$/, "");
  if (trimmed === "") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function AdminNav({ basePath }: { basePath: string }) {
  const { isGlobalAdmin } = useOrgAdmin();
  const prefix = normalizeBase(basePath);
  const items = NAV.filter((item) => !item.adminOnly || isGlobalAdmin);
  return (
    <nav className={styles.nav} aria-label="조직 관리">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={`${prefix}/${item.to}`}
          className={({ isActive }) =>
            [styles.navLink, isActive ? styles.navLinkActive : null].filter(Boolean).join(" ")
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * 플랫폼 공통 조직 관리 화면. 호스트가 `<Route path={`${basePath}/*`} element={<OrgAdminApp … />} />`
 * 처럼 마운트하면 이 컴포넌트가 그 아래 경로만 정의한다. `basePath`는 임의 경로를 받는다.
 *
 * 토스트는 이 컴포넌트가 자체 `ToastProvider`로 감싼다 — 호스트에 프로바이더가 없어도 오류 문구가
 * 사라지지 않게 하기 위해서다(호스트에 이미 있으면 중첩되지만 각자 자기 토스트만 띄운다).
 */
export function OrgAdminApp({
  basePath,
  api,
  currentUser,
  resolveResource,
  links,
}: OrgAdminAppProps) {
  // 리다이렉트 대상은 절대 경로로 만든다 — 스플랫(`*`) 라우트 안에서 상대 경로를 쓰면
  // 현재 경로 뒤에 계속 덧붙어(`…/xxx/users/users/…`) 무한 리다이렉트가 된다.
  const usersPath = `${normalizeBase(basePath)}/users`;
  return (
    <OrgAdminProvider
      api={api}
      basePath={basePath}
      currentUser={currentUser}
      resolveResource={resolveResource}
      links={links}
    >
      <ToastProvider>
        <div className={styles.app}>
          <PageHeader title="사용자·팀 관리" bottom={<AdminNav basePath={basePath} />} />
          <div className={styles.body}>
            <Routes>
              <Route index element={<Navigate to={usersPath} replace />} />
              <Route path="users" element={<UsersScreen />} />
              <Route path="invitations" element={<InvitationsScreen />} />
              <Route path="teams" element={<TeamsScreen />} />
              <Route path="roles" element={<GlobalRolesScreen />} />
              <Route path="pending" element={<PendingScreen />} />
              <Route path="mail" element={<MailScreen />} />
              <Route path="*" element={<Navigate to={usersPath} replace />} />
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </OrgAdminProvider>
  );
}
