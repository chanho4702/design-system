import { useMemo, useState } from "react";
import { Button, Checkbox, ConfirmDialog, Modal, Table, useToast } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import { DataSection } from "../components/DataSection";
import { GrantPresetEditor } from "../components/GrantPresetEditor";
import { formatDate } from "../format";
import type { GrantPreset, Member, Team } from "../api/types";
import styles from "./screen.module.css";

/**
 * 승인 대기 — 초대 없이 로그인해 PENDING으로 격리된 계정 목록.
 * 승인하면 활성 사용자가 되고(선택한 팀·권한 적용), 거절은 DEACTIVATED로 내린다(§3.2).
 */
export function PendingScreen() {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [approving, setApproving] = useState<Member | null>(null);
  const [rejecting, setRejecting] = useState<Member | null>(null);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [grants, setGrants] = useState<GrantPreset[]>([]);
  const [busy, setBusy] = useState(false);

  const pending = useAsync(() => client.pendingMembers(), [client]);
  const teams = useAsync(
    () => (isGlobalAdmin ? client.teams() : Promise.resolve<Team[]>([])),
    [client, isGlobalAdmin],
  );

  const fail = (cause: unknown, fallback: string) =>
    toast({ title: cause instanceof Error ? cause.message : fallback, appearance: "danger" });

  const openApprove = (member: Member) => {
    setTeamIds([]);
    setGrants([]);
    setApproving(member);
  };

  const approve = () => {
    if (!approving) return;
    setBusy(true);
    client.approveMember(approving.id, { teamIds, grants }).then(
      () => {
        setBusy(false);
        setApproving(null);
        toast({ title: "가입을 승인했습니다", appearance: "success" });
        pending.reload();
      },
      (cause: unknown) => {
        setBusy(false);
        fail(cause, "승인하지 못했습니다");
      },
    );
  };

  const reject = () => {
    if (!rejecting) return;
    setBusy(true);
    client.patchMember(rejecting.id, { status: "DEACTIVATED" }).then(
      () => {
        setBusy(false);
        setRejecting(null);
        toast({ title: "가입을 거절했습니다", appearance: "success" });
        pending.reload();
      },
      (cause: unknown) => {
        setBusy(false);
        setRejecting(null);
        fail(cause, "거절하지 못했습니다");
      },
    );
  };

  const columns = useMemo<TableColumn<Member>[]>(
    () => [
      { key: "displayName", header: "이름" },
      { key: "email", header: "이메일", render: (row) => row.email ?? "-" },
      { key: "createdAt", header: "로그인한 날", render: (row) => formatDate(row.createdAt) },
      {
        key: "actions",
        header: "",
        adjustable: false,
        render: (row) => (
          <span className={styles.rowActions}>
            <Button size="small" onClick={() => openApprove(row)}>
              승인
            </Button>
            <Button variant="danger" size="small" onClick={() => setRejecting(row)}>
              거절
            </Button>
          </span>
        ),
      },
    ],
    [],
  );

  const rows = pending.data ?? [];
  const selectableTeams = (teams.data ?? []).filter((team) => team.kind !== "EVERYONE");

  return (
    <div className={styles.screen}>
      <DataSection
        loading={pending.loading}
        error={pending.error}
        empty={rows.length === 0}
        emptyTitle="승인 대기 중인 사용자가 없습니다"
        emptyDescription="초대 없이 로그인한 계정이 여기에 모입니다."
        onRetry={pending.reload}
      >
        <Table aria-label="승인 대기 목록" columns={columns} rows={rows} />
      </DataSection>

      {approving ? (
        <Modal
          open
          onOpenChange={(open) => (open ? undefined : setApproving(null))}
          title="가입 승인"
          description={`${approving.displayName}(${approving.email ?? "이메일 없음"})을(를) 활성 사용자로 만듭니다.`}
        >
          <div className={styles.formGrid}>
            <fieldset className={styles.stack}>
              <legend className={styles.subtle}>팀 (선택)</legend>
              {selectableTeams.length === 0 ? (
                <p className={styles.subtle}>선택할 수 있는 팀이 없습니다.</p>
              ) : (
                selectableTeams.map((team) => (
                  <Checkbox
                    key={team.id}
                    label={team.name}
                    checked={teamIds.includes(team.id)}
                    onCheckedChange={(checked) =>
                      setTeamIds((prev) =>
                        checked === true ? [...prev, team.id] : prev.filter((id) => id !== team.id),
                      )
                    }
                  />
                ))
              )}
            </fieldset>

            <GrantPresetEditor value={grants} onChange={setGrants} allowGlobal={isGlobalAdmin} />

            <div className={styles.formActions}>
              <Button loading={busy} onClick={approve}>
                승인
              </Button>
              <Button variant="subtle" onClick={() => setApproving(null)}>
                취소
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(open) => (open ? undefined : setRejecting(null))}
        title="가입을 거절합니다"
        description={
          rejecting
            ? `${rejecting.displayName} 계정을 비활성 처리합니다. 되돌리려면 다시 초대해야 합니다.`
            : undefined
        }
        confirmLabel="거절"
        danger
        loading={busy}
        onConfirm={reject}
      />
    </div>
  );
}
