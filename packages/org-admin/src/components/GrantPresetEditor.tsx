import { useEffect, useState } from "react";
import { Button, Select, Tag, TextField } from "@chanho/react";
import { GRANT_ROLE_LABEL, GRANT_SCOPE_LABEL } from "../format";
import { useOrgAdmin } from "../context";
import type { GrantPreset, GrantRole, GrantScope } from "../api/types";
import styles from "./PresetEditor.module.css";

export interface GrantPresetEditorProps {
  value: GrantPreset[];
  onChange: (next: GrantPreset[]) => void;
  /** 전역 역할 프리셋 노출 여부. 전역 관리자만 줄 수 있다(설계 §3.2). */
  allowGlobal: boolean;
}

const ROLE_OPTIONS = (["VIEWER", "EDITOR", "ADMIN"] as const).map((role) => ({
  value: role,
  label: GRANT_ROLE_LABEL[role],
}));

function keyOf(preset: GrantPreset): string {
  return `${preset.scope}:${preset.resourceId ?? ""}:${preset.role}`;
}

/**
 * 리소스 권한 프리셋(스코프 + 리소스 id + 역할). 리소스 id는 호스트가 아는 값이라
 * 자유 입력으로 받고, 이름은 `resolveResource`로 확인해 칩에 함께 보여 준다.
 */
export function GrantPresetEditor({ value, onChange, allowGlobal }: GrantPresetEditorProps) {
  const { resolveResource } = useOrgAdmin();
  const [scope, setScope] = useState<GrantScope>("SPACE");
  const [resourceId, setResourceId] = useState("");
  const [role, setRole] = useState<GrantRole>("VIEWER");
  const [names, setNames] = useState<Record<string, string>>({});

  // 미리 채워진 프리셋(호스트 링크에서 온 것)은 add를 거치지 않으므로 이름을 여기서 채운다.
  useEffect(() => {
    if (!resolveResource) return;
    let alive = true;
    for (const preset of value) {
      if (!preset.resourceId) continue;
      const key = `${preset.scope}:${preset.resourceId}`;
      if (names[key]) continue;
      resolveResource(preset.scope, preset.resourceId).then(
        (result) => {
          if (alive) setNames((prev) => (prev[key] ? prev : { ...prev, [key]: result.name }));
        },
        () => undefined,
      );
    }
    return () => {
      alive = false;
    };
  }, [value, names, resolveResource]);

  const scopes: readonly GrantScope[] = allowGlobal
    ? ["GLOBAL", "SPACE", "PROJECT"]
    : ["SPACE", "PROJECT"];
  const scopeOptions = scopes.map((s) => ({ value: s, label: GRANT_SCOPE_LABEL[s] }));

  const add = () => {
    const next: GrantPreset = {
      scope,
      resourceId: scope === "GLOBAL" ? null : resourceId.trim(),
      role,
    };
    if (scope !== "GLOBAL" && !next.resourceId) return;
    if (value.some((v) => keyOf(v) === keyOf(next))) return;
    // 이름은 위 effect가 value를 보고 채운다 — 여기서 또 부르면 같은 요청이 두 번 나간다.
    onChange([...value, next]);
    setResourceId("");
  };

  const labelOf = (preset: GrantPreset) => {
    const scopeLabel = GRANT_SCOPE_LABEL[preset.scope];
    const roleLabel = GRANT_ROLE_LABEL[preset.role];
    if (preset.scope === "GLOBAL") return `${scopeLabel} · ${roleLabel}`;
    const name = names[`${preset.scope}:${preset.resourceId ?? ""}`] ?? preset.resourceId ?? "-";
    return `${scopeLabel} · ${name} · ${roleLabel}`;
  };

  return (
    <div className={styles.block}>
      <p className={styles.legend}>{allowGlobal ? "전역 역할·리소스 권한" : "리소스 권한"}</p>
      {value.length > 0 ? (
        <div className={styles.chips}>
          {value.map((preset) => (
            <Tag
              key={keyOf(preset)}
              label={labelOf(preset)}
              onRemove={() => onChange(value.filter((v) => keyOf(v) !== keyOf(preset)))}
            />
          ))}
        </div>
      ) : null}
      <div className={styles.row}>
        <Select
          label="범위"
          options={scopeOptions}
          value={scope}
          onValueChange={(next) => setScope(next as GrantScope)}
        />
        {scope === "GLOBAL" ? null : (
          <TextField
            className={styles.grow}
            label="리소스 ID"
            value={resourceId}
            placeholder="스페이스 키 또는 프로젝트 ID"
            onChange={(event) => setResourceId(event.target.value)}
          />
        )}
        <Select
          label="역할"
          options={ROLE_OPTIONS}
          value={role}
          onValueChange={(next) => setRole(next as GrantRole)}
        />
        <Button
          variant="secondary"
          onClick={add}
          disabled={scope !== "GLOBAL" && resourceId.trim() === ""}
        >
          권한 추가
        </Button>
      </div>
    </div>
  );
}
