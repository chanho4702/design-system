import { describe, expect, it } from "vitest";
import { EMPTY_GRANT_AUDIT_FILTER, filterGrantAudit } from "./grantAuditFilter";
import type { GrantAuditEntry } from "../api/types";

const NOW = Date.parse("2026-10-18T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function entry(patch: Partial<GrantAuditEntry>): GrantAuditEntry {
  return {
    id: "1",
    action: "GRANT_GRANTED",
    targetType: "USER",
    targetId: "3",
    targetLabel: "박지민",
    role: "ADMIN",
    actorId: "1",
    createdAt: new Date(NOW - DAY / 2).toISOString(),
    ...patch,
  };
}

const ROWS = [
  entry({ id: "a" }),
  entry({ id: "b", targetType: "TEAM", targetId: "9", targetLabel: "플랫폼팀", actorId: "2", createdAt: new Date(NOW - 10 * DAY).toISOString() }),
  entry({ id: "c", targetLabel: "Kim Chanho", targetId: "4", createdAt: new Date(NOW - 40 * DAY).toISOString() }),
  entry({ id: "d", createdAt: null }),
];

const ids = (rows: GrantAuditEntry[]) => rows.map((r) => r.id);

describe("filterGrantAudit", () => {
  it("빈 필터는 아무것도 거르지 않는다(시각 없는 기록 포함)", () => {
    expect(ids(filterGrantAudit(ROWS, EMPTY_GRANT_AUDIT_FILTER, NOW))).toEqual(["a", "b", "c", "d"]);
  });

  it("기간은 최근 N일로 자르고, 시각 없는 기록은 뺀다", () => {
    expect(ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, period: "1" }, NOW))).toEqual(["a"]);
    expect(ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, period: "30" }, NOW))).toEqual(["a", "b"]);
    expect(ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, period: "90" }, NOW))).toEqual(["a", "b", "c"]);
  });

  it("대상 종류와 대상 이름·id(대소문자 무시)로 거른다", () => {
    expect(ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, targetType: "TEAM" }, NOW))).toEqual(["b"]);
    expect(ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, targetTerm: " kim " }, NOW))).toEqual(["c"]);
    expect(ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, targetTerm: "9" }, NOW))).toEqual(["b"]);
  });

  it("행위자 id로 거르고, 조건은 모두 AND다", () => {
    expect(ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, actorId: "2" }, NOW))).toEqual(["b"]);
    expect(
      ids(filterGrantAudit(ROWS, { ...EMPTY_GRANT_AUDIT_FILTER, actorId: "2", targetType: "USER" }, NOW)),
    ).toEqual([]);
  });
});
