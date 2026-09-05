import { render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "@chanho/react";
import type { ReactNode } from "react";
import { OrgAdminProvider } from "../context";
import type { OrgAdminUser, ResolveResource } from "../context";
import type { OrgApiFetch } from "../api/client";

export const ADMIN_USER: OrgAdminUser = { id: "1", globalRoles: ["ADMIN"] };
export const PLAIN_USER: OrgAdminUser = { id: "2", globalRoles: [] };

export interface RenderScreenOptions {
  api: OrgApiFetch;
  currentUser?: OrgAdminUser;
  resolveResource?: ResolveResource;
  basePath?: string;
}

/**
 * 화면 하나를 호스트 없이 그린다 — 라우터·토스트·컨텍스트만 씌운다.
 * 앱 전체(`OrgAdminApp`)를 그리는 테스트는 `renderApp`을 쓴다.
 */
export function renderScreen(ui: ReactNode, options: RenderScreenOptions): RenderResult {
  const { api, currentUser = ADMIN_USER, resolveResource, basePath = "/admin/org" } = options;
  return render(
    <MemoryRouter initialEntries={[basePath]}>
      <OrgAdminProvider
        api={api}
        basePath={basePath}
        currentUser={currentUser}
        resolveResource={resolveResource}
      >
        <ToastProvider>{ui}</ToastProvider>
      </OrgAdminProvider>
    </MemoryRouter>,
  );
}

export interface RenderAppOptions extends RenderScreenOptions {
  /** 마운트 직후 열릴 경로. 기본은 사용자 화면. */
  route?: string;
}

/** 호스트가 하듯 `basePath/*` 아래에 앱을 마운트한다. */
export function renderApp(app: ReactNode, options: RenderAppOptions): RenderResult {
  const { basePath = "/admin/org", route = `${basePath}/users` } = options;
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={`${basePath}/*`} element={app} />
      </Routes>
    </MemoryRouter>,
  );
}
