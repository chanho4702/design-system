import { useEffect, useState } from "react";
import { useOrgAdmin } from "../context";
import { GRANT_SCOPE_LABEL } from "../format";
import type { GrantScope } from "../api/types";

export interface ResourceNameProps {
  scope: GrantScope;
  resourceId: string | null;
}

/**
 * 리소스 권한의 대상 표시. 호스트가 `resolveResource`를 주면 이름(있으면 링크)을,
 * 안 주거나 조회에 실패하면 id를 그대로 보여 준다 — 이름을 못 얻었다고 화면이 비지 않게 한다.
 */
export function ResourceName({ scope, resourceId }: ResourceNameProps) {
  const { resolveResource, links } = useOrgAdmin();
  const [resolved, setResolved] = useState<{ name: string; href?: string } | null>(null);

  useEffect(() => {
    if (scope === "GLOBAL" || !resourceId || !resolveResource) {
      setResolved(null);
      return;
    }
    let alive = true;
    resolveResource(scope, resourceId).then(
      (result) => {
        if (alive) setResolved(result);
      },
      () => {
        if (alive) setResolved(null);
      },
    );
    return () => {
      alive = false;
    };
  }, [scope, resourceId, resolveResource]);

  if (scope === "GLOBAL") return <>{GRANT_SCOPE_LABEL.GLOBAL}</>;

  const fallbackHref =
    scope === "SPACE" ? links?.space?.(resourceId ?? "") : links?.project?.(resourceId ?? "");
  const href = resolved?.href ?? fallbackHref;
  const label = `${GRANT_SCOPE_LABEL[scope]} · ${resolved?.name ?? resourceId ?? "-"}`;

  return href ? <a href={href}>{label}</a> : <>{label}</>;
}
