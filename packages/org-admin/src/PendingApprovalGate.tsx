import { useMemo } from "react";
import { Button, Spinner } from "@chanho/react";
import { Hourglass } from "lucide-react";
import type { ReactNode } from "react";
import { createOrgClient } from "./api/client";
import type { OrgApiFetch } from "./api/client";
import { useAsync } from "./useAsync";
import styles from "./PendingApprovalGate.module.css";

export interface PendingApprovalGateProps {
  /** 호스트가 주입하는 인증 fetch — `OrgAdminApp`과 같은 것. */
  api: OrgApiFetch;
  /** 승인 대기 화면 아래에 놓을 링크 슬롯(관리자에게 요청·로그아웃 등). */
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * `/api/org/me`의 status가 PENDING이면 앱 셸 대신 "승인 대기" 안내를 그린다.
 *
 * PENDING 계정은 `/api/org/me` 외의 호출이 전부 403이라(§3.2), 셸을 그대로 그리면 화면마다
 * 오류가 뜬다. 그래서 셸보다 바깥에서 한 번 막는다. 조회 자체가 실패하면 children을 그리지 않고
 * 오류를 노출한다 — 여기서 삼키면 뒤따르는 화면이 전부 빈 상태로 보인다.
 */
export function PendingApprovalGate({ api, actions, children }: PendingApprovalGateProps) {
  const client = useMemo(() => createOrgClient(api), [api]);
  const me = useAsync(() => client.me(), [client]);

  if (me.loading) {
    return (
      <div className={styles.gate}>
        <Spinner size="large" label="계정 상태 확인 중" />
      </div>
    );
  }

  if (me.error) {
    return (
      <div className={styles.gate} role="alert">
        <h1 className={styles.title}>계정 상태를 확인하지 못했습니다</h1>
        <p className={styles.body}>{me.error}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={me.reload}>
            다시 시도
          </Button>
          {actions}
        </div>
      </div>
    );
  }

  if (me.data?.status === "PENDING") {
    return (
      <div className={styles.gate}>
        <Hourglass size={40} aria-hidden="true" />
        <h1 className={styles.title}>승인 대기 중</h1>
        <p className={styles.body}>
          가입은 됐지만 아직 관리자의 승인을 받지 않았습니다. 승인되면 이 화면 없이 바로 들어올 수
          있습니다. 급하면 관리자에게 승인을 요청하세요.
        </p>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    );
  }

  return <>{children}</>;
}
