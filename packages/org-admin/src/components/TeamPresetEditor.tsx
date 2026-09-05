import { useState } from "react";
import { Button, Select, Tag } from "@chanho/react";
import { TEAM_ROLE_LABEL } from "../format";
import type { Team, TeamPreset, TeamRole } from "../api/types";
import styles from "./PresetEditor.module.css";

export interface TeamPresetEditorProps {
  teams: Team[];
  value: TeamPreset[];
  onChange: (next: TeamPreset[]) => void;
}

const ROLE_OPTIONS = (["MEMBER", "LEAD"] as const).map((role) => ({
  value: role,
  label: TEAM_ROLE_LABEL[role],
}));

/** 초대·승인에서 "어느 팀에 어떤 역할로" 넣을지 고르는 편집기. */
export function TeamPresetEditor({ teams, value, onChange }: TeamPresetEditorProps) {
  const [teamId, setTeamId] = useState("");
  const [role, setRole] = useState<TeamRole>("MEMBER");

  // 전체 구성원 팀은 자동 소속이라 수동으로 넣을 수 없다(서버가 400으로 막는다).
  const selectable = teams.filter(
    (team) => team.kind !== "EVERYONE" && !value.some((v) => v.teamId === team.id),
  );

  const add = () => {
    if (!teamId) return;
    onChange([...value, { teamId, role }]);
    setTeamId("");
    setRole("MEMBER");
  };

  const nameOf = (id: string) => teams.find((t) => t.id === id)?.name ?? id;

  return (
    <div className={styles.block}>
      <p className={styles.legend}>팀</p>
      {value.length > 0 ? (
        <div className={styles.chips}>
          {value.map((preset) => (
            <Tag
              key={preset.teamId}
              label={`${nameOf(preset.teamId)} · ${TEAM_ROLE_LABEL[preset.role]}`}
              onRemove={() => onChange(value.filter((v) => v.teamId !== preset.teamId))}
            />
          ))}
        </div>
      ) : null}
      {selectable.length === 0 ? (
        <p className={styles.hint}>선택할 수 있는 팀이 없습니다.</p>
      ) : (
        <div className={styles.row}>
          <Select
            className={styles.grow}
            label="팀 선택"
            placeholder="팀"
            options={selectable.map((team) => ({ value: team.id, label: team.name }))}
            value={teamId}
            onValueChange={setTeamId}
          />
          <Select
            label="팀 역할"
            options={ROLE_OPTIONS}
            value={role}
            onValueChange={(next) => setRole(next as TeamRole)}
          />
          <Button variant="secondary" onClick={add} disabled={!teamId}>
            팀 추가
          </Button>
        </div>
      )}
    </div>
  );
}
