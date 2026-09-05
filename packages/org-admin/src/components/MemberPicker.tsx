import { useEffect, useState } from "react";
import { Avatar, Spinner, TextField } from "@chanho/react";
import { useOrgClient } from "../context";
import type { Member } from "../api/types";
import styles from "./MemberPicker.module.css";

export interface MemberPickerProps {
  label: string;
  /** 선택된 멤버 id. 선택 해제는 null. */
  value: string | null;
  onChange: (member: Member | null) => void;
  /** 결과에서 제외할 멤버 id(이미 팀원인 사람 등). */
  excludeIds?: string[];
  description?: string;
}

/**
 * 이름·이메일로 찾아 한 명 고르는 선택기. 목록 전체를 내려받지 않고 `/members?q=`로 검색한다.
 * 검색어가 비면 첫 페이지(활성 사람)를 그대로 보여 준다.
 */
export function MemberPicker({
  label,
  value,
  onChange,
  excludeIds = [],
  description,
}: MemberPickerProps) {
  const client = useOrgClient();
  const [term, setTerm] = useState("");
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      client.members({ q: term, status: "ACTIVE", kind: "HUMAN" }).then(
        (found) => {
          if (!alive) return;
          // 배열 경로는 전부 돌려주므로 목록이 길어지지 않게 화면에서 자른다.
          setItems(found.slice(0, 10));
          setLoading(false);
        },
        (cause: unknown) => {
          if (!alive) return;
          setError(cause instanceof Error ? cause.message : "검색하지 못했습니다");
          setLoading(false);
        },
      );
    }, 200);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [client, term]);

  const visible = items.filter((m) => !excludeIds.includes(m.id));

  return (
    <div className={styles.picker}>
      <TextField
        label={label}
        description={description}
        value={term}
        placeholder="이름 또는 이메일"
        onChange={(event) => setTerm(event.target.value)}
      />
      {error ? (
        <p className={styles.hint} role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <Spinner size="small" label="검색 중" /> : null}
      {!loading && !error && visible.length === 0 ? (
        <p className={styles.hint}>검색 결과가 없습니다.</p>
      ) : null}
      {visible.length > 0 ? (
        <div className={styles.results} role="group" aria-label={`${label} 검색 결과`}>
          {visible.map((member) => {
            const selected = member.id === value;
            return (
              <button
                key={member.id}
                type="button"
                className={styles.option}
                aria-pressed={selected}
                onClick={() => onChange(selected ? null : member)}
              >
                <Avatar name={member.displayName} size="small" color="auto" />
                <span className={styles.optionText}>
                  <span>{member.displayName}</span>
                  <span className={styles.optionEmail}>{member.email ?? "이메일 없음"}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
