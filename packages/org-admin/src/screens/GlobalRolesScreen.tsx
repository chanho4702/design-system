import { useMemo, useState } from "react";
import { Banner, Button, Card, ConfirmDialog, Select, Table, useToast } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import { DataSection } from "../components/DataSection";
import { MemberPicker } from "../components/MemberPicker";
import { GRANT_ROLE_LABEL } from "../format";
import type { Grant, GrantRole, Member, SubjectType, Team } from "../api/types";
import styles from "./screen.module.css";

const ROLE_OPTIONS = (["VIEWER", "EDITOR", "ADMIN"] as const).map((role) => ({
  value: role,
  label: GRANT_ROLE_LABEL[role],
}));

const SUBJECT_OPTIONS = [
  { value: "USER", label: "사용자" },
  { value: "TEAM", label: "팀" },
];

/**
 * 전역 역할 — `scope=GLOBAL` grant의 목록·부여·역할 변경·회수.
 * 마지막 전역 관리자 보호는 서버가 409로 판정한다. 화면은 그 문구를 그대로 띄운다.
 */
export function GlobalRolesScreen() {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<Grant | null>(null);
  const [subjectType, setSubjectType] = useState<SubjectType>("USER");
  const [pickedMember, setPickedMember] = useState<Member | null>(null);
  const [teamId, setTeamId] = useState("");
  const [role, setRole] = useState<GrantRole>("ADMIN");
  const [granting, setGranting] = useState(false);

  const grants = useAsync(() => client.grants("GLOBAL"), [client]);
  const teams = useAsync(
    () => (isGlobalAdmin ? client.teams() : Promise.resolve<Team[]>([])),
    [client, isGlobalAdmin],
  );

  const fail = (cause: unknown, fallback: string) =>
    toast({ title: cause instanceof Error ? cause.message : fallback, appearance: "danger" });

  const changeRole = (grant: Grant, next: GrantRole) => {
    if (next === grant.role) return;
    setBusyId(grant.id);
    client.patchGrant(grant.id, next).then(
      () => {
        setBusyId(null);
        toast({ title: "역할을 바꿨습니다", appearance: "success" });
        grants.reload();
      },
      (cause: unknown) => {
        setBusyId(null);
        fail(cause, "역할을 바꾸지 못했습니다");
        grants.reload();
      },
    );
  };

  const revoke = () => {
    if (!revoking) return;
    const target = revoking;
    setBusyId(target.id);
    client.deleteGrant(target.id).then(
      () => {
        setBusyId(null);
        setRevoking(null);
        toast({ title: "권한을 회수했습니다", appearance: "success" });
        grants.reload();
      },
      (cause: unknown) => {
        setBusyId(null);
        setRevoking(null);
        fail(cause, "권한을 회수하지 못했습니다");
      },
    );
  };

  const grant = () => {
    const subjectId = subjectType === "USER" ? pickedMember?.id : teamId;
    if (!subjectId) return;
    setGranting(true);
    client.createGrant({ subjectType, subjectId, scope: "GLOBAL", resourceId: null, role }).then(
      () => {
        setGranting(false);
        setPickedMember(null);
        setTeamId("");
        toast({ title: "전역 역할을 부여했습니다", appearance: "success" });
        grants.reload();
      },
      (cause: unknown) => {
        setGranting(false);
        fail(cause, "전역 역할을 부여하지 못했습니다");
      },
    );
  };

  const nameOf = (row: Grant) => {
    if (row.subjectName) return row.subjectName;
    if (row.subjectType === "TEAM") {
      return teams.data?.find((t) => t.id === row.subjectId)?.name ?? row.subjectId;
    }
    return row.subjectId;
  };

  const columns = useMemo<TableColumn<Grant>[]>(
    () => [
      {
        key: "subjectType",
        header: "대상 종류",
        render: (row) => (row.subjectType === "TEAM" ? "팀" : "사용자"),
      },
      { key: "subjectId", header: "대상", render: (row) => nameOf(row) },
      {
        key: "role",
        header: "역할",
        render: (row) =>
          isGlobalAdmin ? (
            <Select
              label={`${nameOf(row)} 전역 역할`}
              options={ROLE_OPTIONS}
              value={row.role}
              disabled={busyId === row.id}
              onValueChange={(next) => changeRole(row, next as GrantRole)}
            />
          ) : (
            GRANT_ROLE_LABEL[row.role]
          ),
      },
      {
        key: "actions",
        header: "",
        adjustable: false,
        render: (row) =>
          isGlobalAdmin ? (
            <Button variant="danger" size="small" onClick={() => setRevoking(row)}>
              회수
            </Button>
          ) : null,
      },
    ],
    // 목록 데이터·권한·진행 중 표시만 실제 의존성이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGlobalAdmin, busyId, teams.data],
  );

  const rows = grants.data ?? [];

  return (
    <div className={styles.screen}>
      <Banner variant="info">
        전역 관리자는 최소 한 명 있어야 합니다. 마지막 관리자를 내리거나 회수하면 서버가 거부합니다.
      </Banner>

      <DataSection
        loading={grants.loading}
        error={grants.error}
        empty={rows.length === 0}
        emptyTitle="전역 역할이 부여된 대상이 없습니다"
        onRetry={grants.reload}
      >
        <Table aria-label="전역 역할 목록" columns={columns} rows={rows} />
      </DataSection>

      {isGlobalAdmin ? (
        <Card title="전역 역할 부여">
          <div className={styles.formGrid}>
            <Select
              label="대상 종류"
              options={SUBJECT_OPTIONS}
              value={subjectType}
              onValueChange={(next) => setSubjectType(next as SubjectType)}
            />
            {subjectType === "USER" ? (
              <MemberPicker
                label="사용자 검색"
                value={pickedMember?.id ?? null}
                onChange={setPickedMember}
              />
            ) : (
              <Select
                label="팀 선택"
                placeholder="팀"
                options={(teams.data ?? []).map((team) => ({ value: team.id, label: team.name }))}
                value={teamId}
                onValueChange={setTeamId}
              />
            )}
            <Select
              label="역할"
              options={ROLE_OPTIONS}
              value={role}
              onValueChange={(next) => setRole(next as GrantRole)}
            />
            <div className={styles.formActions}>
              <Button
                loading={granting}
                disabled={subjectType === "USER" ? pickedMember === null : teamId === ""}
                onClick={grant}
              >
                부여
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => (open ? undefined : setRevoking(null))}
        title="전역 역할을 회수합니다"
        description={revoking ? `${nameOf(revoking)}의 전역 역할이 사라집니다.` : undefined}
        confirmLabel="회수"
        danger
        loading={busyId !== null && busyId === revoking?.id}
        onConfirm={revoke}
      />
    </div>
  );
}
