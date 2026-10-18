import type { GrantAuditEntry, SubjectType } from "../api/types";

/** 기간 필터. 숫자는 "최근 N일"이다. */
export type GrantAuditPeriod = "ALL" | "1" | "7" | "30" | "90";

export interface GrantAuditFilter {
  period: GrantAuditPeriod;
  targetType: SubjectType | "ALL";
  /** 대상 이름·id 부분 일치(대소문자 무시). 비우면 거르지 않는다. */
  targetTerm: string;
  /** 행위자 멤버 id. "ALL"이면 거르지 않는다. */
  actorId: string;
}

export const EMPTY_GRANT_AUDIT_FILTER: GrantAuditFilter = {
  period: "ALL",
  targetType: "ALL",
  targetTerm: "",
  actorId: "ALL",
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 받은 기록 안에서 거른다 — 서버(`/api/org/grants/audit`)가 필터를 받지 않기 때문이다.
 * 시각이 없거나 파싱이 안 되는 기록은 기간을 고르면 빠진다(언제인지 모르는 것을 "최근"이라 할 수 없다).
 */
export function filterGrantAudit(
  entries: GrantAuditEntry[],
  filter: GrantAuditFilter,
  now: number = Date.now(),
): GrantAuditEntry[] {
  const term = filter.targetTerm.trim().toLowerCase();
  const since = filter.period === "ALL" ? null : now - Number(filter.period) * DAY_MS;
  return entries.filter((entry) => {
    if (filter.targetType !== "ALL" && entry.targetType !== filter.targetType) return false;
    if (filter.actorId !== "ALL" && entry.actorId !== filter.actorId) return false;
    if (term !== "") {
      const haystack = `${entry.targetLabel ?? ""} ${entry.targetId ?? ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (since !== null) {
      const at = entry.createdAt ? new Date(entry.createdAt).getTime() : Number.NaN;
      if (Number.isNaN(at) || at < since) return false;
    }
    return true;
  });
}
