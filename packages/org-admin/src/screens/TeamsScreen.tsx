import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Lozenge,
  Select,
  Table,
  TextField,
  useToast,
} from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import { DataSection } from "../components/DataSection";
import { MemberPicker } from "../components/MemberPicker";
import { TEAM_ROLE_LABEL } from "../format";
import type { Member, Team, TeamMember, TeamRole } from "../api/types";
import styles from "./screen.module.css";

const ROLE_OPTIONS = (["MEMBER", "LEAD"] as const).map((role) => ({
  value: role,
  label: TEAM_ROLE_LABEL[role],
}));

/**
 * 팀 관리 — 왼쪽 목록/생성, 오른쪽 선택한 팀의 이름·팀원.
 * `kind=EVERYONE`("전체 구성원") 팀은 자동 소속이라 읽기 전용으로 잠근다(§3.2).
 */
export function TeamsScreen() {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Member | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const teams = useAsync(() => client.teams(term), [client, term]);
  const list = teams.data ?? [];

  const selected: Team | null = useMemo(
    () => list.find((team) => team.id === selectedId) ?? null,
    [list, selectedId],
  );

  useEffect(() => {
    if (selectedId === null && list.length > 0) setSelectedId(list[0].id);
    if (selectedId !== null && list.length > 0 && !list.some((t) => t.id === selectedId)) {
      setSelectedId(list[0].id);
    }
  }, [list, selectedId]);

  useEffect(() => {
    setRenameValue(selected?.name ?? "");
    setPicked(null);
  }, [selected?.id, selected?.name]);

  const members = useAsync(
    () => (selectedId ? client.teamMembers(selectedId) : Promise.resolve<TeamMember[]>([])),
    [client, selectedId],
  );

  const readOnly = selected?.kind === "EVERYONE";
  const canManage = isGlobalAdmin || selected?.myRole === "LEAD";

  const fail = (cause: unknown, fallback: string) =>
    toast({ title: cause instanceof Error ? cause.message : fallback, appearance: "danger" });

  const run = (work: Promise<unknown>, success: string, fallback: string, after: () => void) => {
    setBusy(true);
    work.then(
      () => {
        setBusy(false);
        toast({ title: success, appearance: "success" });
        after();
      },
      (cause: unknown) => {
        setBusy(false);
        fail(cause, fallback);
      },
    );
  };

  const create = () => {
    if (newName.trim() === "") return;
    setCreating(true);
    client.createTeam({ name: newName.trim() }).then(
      (team) => {
        setCreating(false);
        setNewName("");
        setSelectedId(team.id);
        toast({ title: "팀을 만들었습니다", appearance: "success" });
        teams.reload();
      },
      (cause: unknown) => {
        setCreating(false);
        fail(cause, "팀을 만들지 못했습니다");
      },
    );
  };

  const memberColumns = useMemo<TableColumn<TeamMember>[]>(
    () => [
      { key: "displayName", header: "이름" },
      { key: "email", header: "이메일", render: (row) => row.email ?? "-" },
      {
        key: "role",
        header: "역할",
        render: (row) =>
          readOnly || !canManage ? (
            TEAM_ROLE_LABEL[row.role]
          ) : (
            <Select
              label={`${row.displayName} 역할`}
              options={ROLE_OPTIONS}
              value={row.role}
              onValueChange={(next) => {
                if (!selectedId || next === row.role) return;
                run(
                  client.setTeamMemberRole(selectedId, row.id, next as TeamRole),
                  "역할을 바꿨습니다",
                  "역할을 바꾸지 못했습니다",
                  members.reload,
                );
              }}
            />
          ),
      },
      {
        key: "actions",
        header: "",
        adjustable: false,
        render: (row) =>
          readOnly || !canManage ? null : (
            <Button
              variant="subtle"
              size="small"
              onClick={() => {
                if (!selectedId) return;
                run(
                  client.removeTeamMember(selectedId, row.id),
                  "팀원을 제거했습니다",
                  "팀원을 제거하지 못했습니다",
                  () => {
                    members.reload();
                    teams.reload();
                  },
                );
              }}
            >
              제거
            </Button>
          ),
      },
    ],
    // client·selectedId·권한 플래그만 실제 의존성이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, selectedId, readOnly, canManage],
  );

  return (
    <div className={styles.screen}>
      <div className={styles.split}>
        <div className={styles.stack}>
          <TextField
            label="팀 검색"
            placeholder="팀 이름"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          <DataSection
            loading={teams.loading}
            error={teams.error}
            empty={list.length === 0}
            emptyTitle="팀이 없습니다"
            onRetry={teams.reload}
          >
            <ul className={styles.eventList} aria-label="팀 목록">
              {list.map((team) => (
                <li key={team.id}>
                  <Button
                    variant={team.id === selectedId ? "secondary" : "ghost"}
                    fullWidth
                    onClick={() => setSelectedId(team.id)}
                  >
                    {team.name}
                    {team.memberCount !== null ? <Badge>{team.memberCount}</Badge> : null}
                  </Button>
                </li>
              ))}
            </ul>
          </DataSection>

          {isGlobalAdmin ? (
            <Card title="팀 만들기">
              <div className={styles.stack}>
                <TextField
                  label="팀 이름"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
                <Button onClick={create} loading={creating} disabled={newName.trim() === ""}>
                  만들기
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        <div className={styles.stack}>
          {selected === null ? (
            <p className={styles.subtle}>팀을 선택하세요.</p>
          ) : (
            <>
              <div className={styles.toolbar}>
                <h2 className={styles.sectionTitle}>{selected.name}</h2>
                {readOnly ? <Lozenge appearance="info">전체 구성원(자동)</Lozenge> : null}
              </div>

              {readOnly ? (
                <p className={styles.subtle}>
                  활성 사용자가 자동으로 소속되는 팀입니다. 이름 변경·삭제·팀원 편집을 할 수 없습니다.
                </p>
              ) : null}

              {!readOnly && isGlobalAdmin ? (
                <div className={styles.toolbar}>
                  <TextField
                    className={styles.toolbarGrow}
                    label="팀 이름"
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                  />
                  <Button
                    variant="secondary"
                    loading={busy}
                    disabled={renameValue.trim() === "" || renameValue === selected.name}
                    onClick={() =>
                      run(
                        client.renameTeam(selected.id, { name: renameValue.trim() }),
                        "팀 이름을 바꿨습니다",
                        "팀 이름을 바꾸지 못했습니다",
                        teams.reload,
                      )
                    }
                  >
                    이름 저장
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                    팀 삭제
                  </Button>
                </div>
              ) : null}

              <DataSection
                loading={members.loading}
                error={members.error}
                empty={(members.data?.length ?? 0) === 0}
                emptyTitle="팀원이 없습니다"
                onRetry={members.reload}
              >
                <Table
                  aria-label={`${selected.name} 팀원`}
                  columns={memberColumns}
                  rows={members.data ?? []}
                />
              </DataSection>

              {!readOnly && canManage ? (
                <Card title="팀원 추가">
                  <div className={styles.stack}>
                    <MemberPicker
                      label="사용자 검색"
                      value={picked?.id ?? null}
                      onChange={setPicked}
                      excludeIds={(members.data ?? []).map((m) => m.id)}
                    />
                    <Button
                      disabled={picked === null}
                      loading={busy}
                      onClick={() => {
                        if (!picked) return;
                        run(
                          client.addTeamMember(selected.id, picked.id, "MEMBER"),
                          "팀원을 추가했습니다",
                          "팀원을 추가하지 못했습니다",
                          () => {
                            setPicked(null);
                            members.reload();
                            teams.reload();
                          },
                        );
                      }}
                    >
                      팀원 추가
                    </Button>
                  </div>
                </Card>
              ) : null}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="팀을 삭제합니다"
        description={
          selected ? `${selected.name} 팀과 이 팀에 준 권한이 함께 사라집니다.` : undefined
        }
        confirmLabel="삭제"
        danger
        loading={busy}
        onConfirm={() => {
          if (!selected) return;
          run(client.deleteTeam(selected.id), "팀을 삭제했습니다", "팀을 삭제하지 못했습니다", () => {
            setConfirmDelete(false);
            setSelectedId(null);
            teams.reload();
          });
        }}
      />
    </div>
  );
}
