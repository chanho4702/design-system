import { useMemo, useState } from "react";
import { Banner, EmptyState, Lozenge, Select, Table, TextField } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import {
  Eye,
  Pencil,
  RefreshCw,
  ShieldCheck,
  ShieldMinus,
  ShieldPlus,
  User,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import { DataSection } from "../components/DataSection";
import { Pagination } from "../components/Pagination";
import { formatDateTime, grantAuditActionLabel, grantRoleLabel } from "../format";
import { EMPTY_GRANT_AUDIT_FILTER, filterGrantAudit } from "./grantAuditFilter";
import type { GrantAuditFilter, GrantAuditPeriod } from "./grantAuditFilter";
import type { GrantAuditEntry, SubjectType } from "../api/types";
import styles from "./screen.module.css";

const PAGE_SIZE = 20;
/** org-service `GrantService.AUDIT_PAGE_SIZE` — 서버가 한 번에 주는 최대 건수. */
export const GRANT_AUDIT_SERVER_LIMIT = 100;
const ALL = "ALL";

const ICON = 14;

const PERIOD_OPTIONS: { value: GrantAuditPeriod; label: string }[] = [
  { value: "ALL", label: "전체 기간" },
  { value: "1", label: "최근 24시간" },
  { value: "7", label: "최근 7일" },
  { value: "30", label: "최근 30일" },
  { value: "90", label: "최근 90일" },
];

const TARGET_TYPE_OPTIONS = [
  { value: ALL, label: "전체 대상" },
  { value: "USER", label: "사용자", icon: <User size={ICON} aria-hidden="true" /> },
  { value: "TEAM", label: "팀", icon: <UsersRound size={ICON} aria-hidden="true" /> },
];

type Appearance = "neutral" | "info" | "success" | "warning" | "danger";

const ACTION_STYLE: Record<string, { appearance: Appearance; icon: ReactNode }> = {
  GRANT_GRANTED: { appearance: "success", icon: <ShieldPlus size={ICON} aria-hidden="true" /> },
  GRANT_CHANGED: { appearance: "info", icon: <RefreshCw size={ICON} aria-hidden="true" /> },
  GRANT_REVOKED: { appearance: "danger", icon: <ShieldMinus size={ICON} aria-hidden="true" /> },
};

const ROLE_ICON: Record<string, ReactNode> = {
  VIEWER: <Eye size={ICON} aria-hidden="true" />,
  EDITOR: <Pencil size={ICON} aria-hidden="true" />,
  ADMIN: <ShieldCheck size={ICON} aria-hidden="true" />,
};

function ActionValue({ action }: { action: string }) {
  const known = ACTION_STYLE[action];
  return (
    <Lozenge appearance={known?.appearance ?? "neutral"} className={styles.lozengeWithIcon}>
      {known?.icon}
      {grantAuditActionLabel(action)}
    </Lozenge>
  );
}

function RoleValue({ role }: { role: string | null }) {
  return (
    <span className={styles.iconValue}>
      {role ? ROLE_ICON[role] : null}
      {grantRoleLabel(role)}
    </span>
  );
}

function TargetValue({ entry }: { entry: GrantAuditEntry }) {
  const isTeam = entry.targetType === "TEAM";
  return (
    <span className={styles.iconValue}>
      {isTeam ? (
        <UsersRound size={ICON} aria-label="팀" />
      ) : (
        <User size={ICON} aria-label="사용자" />
      )}
      {entry.targetLabel ?? entry.targetId ?? "-"}
    </span>
  );
}

/** 행위자 이름을 못 얻으면 id로 대체한다 — 퇴사·삭제된 관리자라도 칸이 비지 않게. */
function fallbackActorName(id: string | null): string {
  return id ? `구성원 #${id}` : "-";
}

/**
 * 권한 이력 — 전역 권한(`scope=GLOBAL`)의 부여·역할 변경·회수 기록.
 *
 * 서버는 최신순 최근 100건만 주고 필터·페이지를 받지 않는다. 그래서 기간·대상·행위자 필터와
 * 페이지 나눔은 받은 범위 안에서 화면이 한다. 상한에 닿으면 그 사실을 알린다(더 오래된 기록이
 * "없는" 것이 아니라 "안 보이는" 것이다).
 *
 * 전역 관리자 전용 — 메뉴도 관리자에게만 보이고, 서버도 그 리소스의 ADMIN이 아니면 403이다.
 */
export function GrantAuditScreen() {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const [filter, setFilter] = useState<GrantAuditFilter>(EMPTY_GRANT_AUDIT_FILTER);
  const [page, setPage] = useState(0);

  const audit = useAsync(
    () => (isGlobalAdmin ? client.grantAudit("GLOBAL") : Promise.resolve<GrantAuditEntry[]>([])),
    [client, isGlobalAdmin],
  );

  const entries = useMemo(() => audit.data ?? [], [audit.data]);
  const actorIds = useMemo(
    () =>
      Array.from(
        new Set(entries.map((e) => e.actorId).filter((id): id is string => id !== null)),
      ).sort(),
    [entries],
  );

  // 행위자는 대개 관리자 몇 명이라 한 사람씩 읽는다. 하나가 실패해도 나머지 이름은 살린다.
  const actors = useAsync(
    async () => {
      const pairs = await Promise.all(
        actorIds.map((id) =>
          client.member(id).then(
            (m) => [id, m.displayName] as const,
            () => [id, null] as const,
          ),
        ),
      );
      const names = new Map<string, string>();
      for (const [id, name] of pairs) if (name) names.set(id, name);
      return names;
    },
    [client, actorIds.join(",")],
  );

  const actorName = (id: string | null) =>
    (id ? actors.data?.get(id) : undefined) ?? fallbackActorName(id);

  const update = (patch: Partial<GrantAuditFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
    setPage(0);
  };

  const filtered = useMemo(() => filterGrantAudit(entries, filter), [entries, filter]);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const actorOptions = [
    { value: ALL, label: "모든 행위자" },
    ...actorIds.map((id) => ({ value: id, label: actorName(id) })),
  ];

  const columns: TableColumn<GrantAuditEntry>[] = [
    { key: "createdAt", header: "시각", render: (row) => formatDateTime(row.createdAt) },
    { key: "action", header: "한 일", render: (row) => <ActionValue action={row.action} /> },
    { key: "target", header: "대상", render: (row) => <TargetValue entry={row} /> },
    { key: "role", header: "역할", render: (row) => <RoleValue role={row.role} /> },
    { key: "actor", header: "행위자", render: (row) => actorName(row.actorId) },
  ];

  if (!isGlobalAdmin) {
    return (
      <div className={styles.screen}>
        <EmptyState
          title="권한 이력은 전역 관리자만 볼 수 있습니다"
          description="누가 누구에게 전역 역할을 주고 뺐는지 기록한 화면입니다."
        />
      </div>
    );
  }

  const filtering =
    filter.period !== "ALL" ||
    filter.targetType !== "ALL" ||
    filter.actorId !== "ALL" ||
    filter.targetTerm.trim() !== "";

  return (
    <div className={styles.screen}>
      {entries.length >= GRANT_AUDIT_SERVER_LIMIT ? (
        <Banner variant="info">
          최근 {GRANT_AUDIT_SERVER_LIMIT}건까지만 보입니다. 필터는 이 범위 안에서 적용됩니다.
        </Banner>
      ) : null}

      <div className={styles.toolbar}>
        <Select
          label="기간"
          options={PERIOD_OPTIONS}
          value={filter.period}
          onValueChange={(next) => update({ period: next as GrantAuditPeriod })}
        />
        <Select
          label="대상 종류"
          options={TARGET_TYPE_OPTIONS}
          value={filter.targetType}
          onValueChange={(next) => update({ targetType: next as SubjectType | typeof ALL })}
        />
        <TextField
          className={styles.toolbarGrow}
          label="대상 검색"
          placeholder="사용자·팀 이름"
          value={filter.targetTerm}
          onChange={(event) => update({ targetTerm: event.target.value })}
        />
        <Select
          label="행위자"
          options={actorOptions}
          value={filter.actorId}
          onValueChange={(next) => update({ actorId: next })}
        />
      </div>

      <DataSection
        loading={audit.loading}
        error={audit.error}
        empty={filtered.length === 0}
        emptyTitle={filtering ? "조건에 맞는 기록이 없습니다" : "권한 변경 기록이 없습니다"}
        emptyDescription={
          filtering ? undefined : "전역 역할을 부여·변경·회수하면 여기에 남습니다."
        }
        onRetry={audit.reload}
      >
        <Table aria-label="권한 이력" columns={columns} rows={visible} />
        <Pagination
          page={page}
          size={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </DataSection>
    </div>
  );
}
