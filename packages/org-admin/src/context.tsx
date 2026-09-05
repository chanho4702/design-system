import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { createOrgClient } from "./api/client";
import type { OrgApiFetch, OrgClient } from "./api/client";
import type { GrantScope } from "./api/types";

/** 호스트가 알려주는 현재 사용자. `globalRoles`는 `/api/org/me.globalRoles` 그대로. */
export interface OrgAdminUser {
  id: string;
  globalRoles: string[];
}

/** 리소스 권한 프리셋에 사람이 읽는 이름을 붙이기 위한 훅. 패키지는 위키·ALM을 모른다. */
export type ResolveResource = (
  scope: GrantScope,
  id: string,
) => Promise<{ name: string; href?: string }>;

/** 스페이스·프로젝트로 나가는 링크. 없으면 이름만 표시한다. */
export interface OrgAdminLinks {
  space?: (id: string) => string;
  project?: (id: string) => string;
}

export interface OrgAdminContextValue {
  client: OrgClient;
  basePath: string;
  currentUser: OrgAdminUser;
  isGlobalAdmin: boolean;
  resolveResource?: ResolveResource;
  links?: OrgAdminLinks;
}

const OrgAdminContext = createContext<OrgAdminContextValue | null>(null);

export function useOrgAdmin(): OrgAdminContextValue {
  const value = useContext(OrgAdminContext);
  if (!value) throw new Error("useOrgAdmin은 OrgAdminApp 안에서만 사용할 수 있다");
  return value;
}

export function useOrgClient(): OrgClient {
  return useOrgAdmin().client;
}

export interface OrgAdminProviderProps {
  api: OrgApiFetch;
  basePath: string;
  currentUser: OrgAdminUser;
  resolveResource?: ResolveResource;
  links?: OrgAdminLinks;
  children: ReactNode;
}

export function OrgAdminProvider({
  api,
  basePath,
  currentUser,
  resolveResource,
  links,
  children,
}: OrgAdminProviderProps) {
  const value = useMemo<OrgAdminContextValue>(
    () => ({
      client: createOrgClient(api),
      basePath,
      currentUser,
      isGlobalAdmin: currentUser.globalRoles.includes("ADMIN"),
      resolveResource,
      links,
    }),
    [api, basePath, currentUser, resolveResource, links],
  );
  return <OrgAdminContext.Provider value={value}>{children}</OrgAdminContext.Provider>;
}
