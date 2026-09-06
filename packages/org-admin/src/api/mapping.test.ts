import { describe, expect, it } from "vitest";
import {
  toGrant,
  toInvitation,
  toMailLogEntry,
  toMailSetting,
  toMailTestResult,
  toMember,
  toPage,
  toTeam,
  toTeamMember,
} from "./mapping";

describe("toPage", () => {
  it("배열 응답을 한 페이지로 감싼다", () => {
    const page = toPage([{ id: 1 }, { id: 2 }], (raw) => toMember(raw), 20);
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(2);
    expect(page.page).toBe(0);
  });

  it("페이지 응답의 page·size·total을 그대로 쓴다", () => {
    const page = toPage({ items: [{ id: 7 }], page: 2, size: 10, total: 31 }, toMember, 20);
    expect(page.items[0].id).toBe("7");
    expect(page).toMatchObject({ page: 2, size: 10, total: 31 });
  });
});

describe("toMember", () => {
  it("숫자 id를 문자열로 바꾸고 없는 필드는 null로 둔다", () => {
    const member = toMember({ id: 12, displayName: "김채호", status: "ACTIVE" });
    expect(member.id).toBe("12");
    expect(member.email).toBeNull();
    expect(member.joinedVia).toBeNull();
    expect(member.createdAt).toBeNull();
  });

  it("모르는 status는 ACTIVE로 떨어뜨려 화면이 깨지지 않게 한다", () => {
    expect(toMember({ id: 1, status: "WAT" }).status).toBe("ACTIVE");
  });

  it("이름이 없으면 이메일을 이름 자리에 쓴다", () => {
    expect(toMember({ id: 1, email: "a@x.com" }).displayName).toBe("a@x.com");
  });
});

describe("toGrant", () => {
  it("스코프 키가 scope든 resourceType이든 받는다", () => {
    expect(toGrant({ id: 1, scope: "SPACE", resourceId: "DEV" }).scope).toBe("SPACE");
    expect(toGrant({ id: 1, resourceType: "PROJECT", resourceId: "9" }).scope).toBe("PROJECT");
  });
});

describe("toTeam", () => {
  it("kind가 없으면 STANDARD로 본다", () => {
    expect(toTeam({ id: 3, name: "플랫폼" }).kind).toBe("STANDARD");
    expect(toTeam({ id: 3, name: "전체", kind: "EVERYONE" }).kind).toBe("EVERYONE");
  });
});

describe("toTeamMember", () => {
  it("memberId를 id로 받아들인다", () => {
    expect(toTeamMember({ memberId: 5, displayName: "홍", role: "LEAD" })).toMatchObject({
      id: "5",
      role: "LEAD",
    });
  });
});

describe("toInvitation", () => {
  it("mailSent가 없으면 null이고 inviteUrl은 그대로 둔다", () => {
    const invitation = toInvitation({
      id: 1,
      email: "a@x.com",
      status: "PENDING",
      inviteUrl: "https://host/invite/abc",
    });
    expect(invitation.mailSent).toBeNull();
    expect(invitation.inviteUrl).toBe("https://host/invite/abc");
  });
});

describe("toMailSetting", () => {
  it("모르는 모드는 none으로 떨어뜨리지 않고 null로 둔다", () => {
    expect(toMailSetting({ mode: "카오스", enabled: true }).mode).toBeNull();
    expect(toMailSetting({ mode: "RELAY" }).mode).toBe("relay");
  });

  it("포트가 문자열로 와도 숫자로 읽고, 없으면 null이다", () => {
    expect(toMailSetting({ port: "587" }).port).toBe(587);
    expect(toMailSetting({}).port).toBeNull();
  });

  it("필드가 통째로 없어도 화면이 쓸 수 있는 기본값을 준다", () => {
    expect(toMailSetting({})).toMatchObject({
      enabled: false,
      passwordSet: false,
      tls: "NONE",
      host: "",
      fromAddress: "",
    });
  });
});

describe("toMailLogEntry", () => {
  it("받는 주소 키가 to든 toAddress든 받는다", () => {
    expect(toMailLogEntry({ id: 1, to: "a@x.com" }).to).toBe("a@x.com");
    expect(toMailLogEntry({ id: 1, toAddress: "b@x.com" }).to).toBe("b@x.com");
  });

  it("모르는 상태는 대기로 두고 시도 횟수는 0으로 채운다", () => {
    expect(toMailLogEntry({ id: 1, status: "WAT" })).toMatchObject({
      status: "PENDING",
      attempts: 0,
      lastError: null,
    });
  });
});

describe("toMailTestResult", () => {
  it("ok가 없으면 실패로 보고 오류 문구는 그대로 둔다", () => {
    expect(toMailTestResult({ error: "535 auth failed" })).toEqual({
      ok: false,
      error: "535 auth failed",
    });
  });
});
