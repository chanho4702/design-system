import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  grantAuditActionLabel,
  grantRoleLabel,
  isValidEmail,
  memberEventLabel,
  splitEmails,
} from "./format";

describe("splitEmails", () => {
  it("쉼표·줄바꿈·공백이 섞인 붙여넣기를 주소 목록으로 나눈다", () => {
    expect(splitEmails("a@x.com, b@x.com\nc@x.com  d@x.com;e@x.com")).toEqual([
      "a@x.com",
      "b@x.com",
      "c@x.com",
      "d@x.com",
      "e@x.com",
    ]);
  });

  it("빈 입력은 빈 배열이다", () => {
    expect(splitEmails("   \n ")).toEqual([]);
  });
});

describe("isValidEmail", () => {
  it("점 있는 도메인만 통과시킨다", () => {
    expect(isValidEmail("a@x.com")).toBe(true);
    expect(isValidEmail("a@localhost")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a b@x.com")).toBe(false);
  });
});

describe("formatDate", () => {
  it("값이 없거나 파싱할 수 없으면 Invalid Date 대신 -를 준다", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("")).toBe("-");
    expect(formatDate("망가진 값")).toBe("-");
    expect(formatDateTime("망가진 값")).toBe("-");
  });

  it("ISO 문자열을 YYYY-MM-DD로 준다", () => {
    expect(formatDate("2026-09-05T01:02:03Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatDateTime("2026-09-05T01:02:03Z")).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe("grantAuditActionLabel", () => {
  it("서버 action 세 가지에 한국어 라벨을 준다", () => {
    expect(grantAuditActionLabel("GRANT_GRANTED")).toBe("부여");
    expect(grantAuditActionLabel("GRANT_CHANGED")).toBe("역할 변경");
    expect(grantAuditActionLabel("GRANT_REVOKED")).toBe("회수");
  });

  it("모르는 action은 원문 그대로 보인다", () => {
    expect(grantAuditActionLabel("GRANT_EXPIRED")).toBe("GRANT_EXPIRED");
  });
});

describe("grantRoleLabel", () => {
  it("알려진 역할은 라벨로, 모르는 값은 원문, 빈 값은 -", () => {
    expect(grantRoleLabel("EDITOR")).toBe("편집");
    expect(grantRoleLabel("OWNER")).toBe("OWNER");
    expect(grantRoleLabel(null)).toBe("-");
  });
});

describe("memberEventLabel", () => {
  it("모르는 이벤트 종류는 원문을 그대로 보여 준다", () => {
    expect(memberEventLabel("APPROVED")).toBe("승인됨");
    expect(memberEventLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
  });
});

describe("memberEventLabel — 서버 열거 전체", () => {
  it("org-service MemberEventType 전부에 한국어 라벨이 있다", () => {
    const serverTypes = [
      "INVITED", "INVITE_RESENT", "INVITE_REVOKED", "INVITE_EXPIRED",
      "JOINED", "APPROVED", "SUSPENDED", "REACTIVATED", "DEACTIVATED",
      "TEAM_ADDED", "TEAM_REMOVED", "AVATAR_CHANGED", "AVATAR_REMOVED",
      "KEYCLOAK_DISABLED_FAILED",
    ];
    for (const type of serverTypes) expect(memberEventLabel(type)).not.toBe(type);
    expect(memberEventLabel("AVATAR_REMOVED")).toBe("아바타 삭제(관리자)");
  });

  it("모르는 타입은 원문 그대로 보인다", () => {
    expect(memberEventLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
  });
});
