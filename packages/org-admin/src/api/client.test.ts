import { describe, expect, it } from "vitest";
import { createOrgClient, OrgApiError } from "./client";
import { FakeError, createFakeApi } from "../testing/fakeApi";

describe("createOrgClient", () => {
  it("서버가 준 {\"error\"} 문구를 그대로 실어 던진다", async () => {
    const { api } = createFakeApi({
      "PATCH /api/org/grants/:id": () => new FakeError(409, "마지막 전역 관리자는 내릴 수 없습니다"),
    });
    const client = createOrgClient(api);
    await expect(client.patchGrant("1", "VIEWER")).rejects.toThrow(
      "마지막 전역 관리자는 내릴 수 없습니다",
    );
    await expect(client.patchGrant("1", "VIEWER")).rejects.toBeInstanceOf(OrgApiError);
  });

  it("본문 없는 오류는 상태 코드를 담은 기본 문구를 쓴다", async () => {
    const api = () => Promise.resolve(new Response("", { status: 503 }));
    await expect(createOrgClient(api).teams()).rejects.toThrow("HTTP 503");
  });

  it("204 응답은 본문 없이 성공으로 본다", async () => {
    const { api, calls } = createFakeApi({
      "DELETE /api/org/invitations/:id": () => undefined,
    });
    await expect(createOrgClient(api).revokeInvitation("7")).resolves.toBeUndefined();
    expect(calls[0]).toMatchObject({ method: "DELETE", path: "/api/org/invitations/7" });
  });

  it("멤버 검색은 배열 경로를 쓰고 페이지 파라미터를 붙이지 않는다", async () => {
    const { api, calls } = createFakeApi({
      "GET /api/org/members": () => [{ id: 1, displayName: "김채호", status: "ACTIVE" }],
    });
    const found = await createOrgClient(api).members({ q: "김", status: "", kind: "HUMAN" });
    expect(calls[0].path).toBe("/api/org/members?kind=HUMAN&q=%EA%B9%80");
    expect(found).toHaveLength(1);
  });

  it("멤버 목록 페이지는 /members/page로 page·size와 함께 보낸다(빈 값은 뺀다)", async () => {
    const { api, calls } = createFakeApi({
      "GET /api/org/members/page": () => ({ items: [], page: 1, size: 20, total: 0 }),
    });
    await createOrgClient(api).memberPage({ q: "김", status: "", kind: "HUMAN", page: 1, size: 20 });
    expect(calls[0].path).toBe("/api/org/members/page?kind=HUMAN&q=%EA%B9%80&page=1&size=20");
  });

  it("grant 생성은 현행 org-service 계약대로 resourceType 키로 보낸다", async () => {
    const { api, calls } = createFakeApi({
      "POST /api/org/grants": () => ({ id: 1, subjectType: "USER", subjectId: 3, resourceType: "GLOBAL", role: "ADMIN" }),
    });
    await createOrgClient(api).createGrant({
      subjectType: "USER",
      subjectId: "3",
      scope: "GLOBAL",
      resourceId: null,
      role: "ADMIN",
    });
    expect(calls[0].body).toEqual({
      subjectType: "USER",
      subjectId: "3",
      resourceType: "GLOBAL",
      resourceId: null,
      role: "ADMIN",
    });
  });

  it("메일 설정 저장은 password를 넘기지 않으면 키 자체를 빼고 보낸다", async () => {
    const { api, calls } = createFakeApi({ "PUT /api/org/settings/mail": () => undefined });
    const base = {
      enabled: true,
      host: "mail-relay",
      port: 25,
      username: "",
      tls: "NONE",
      fromAddress: "no-reply@example.com",
      fromName: "플랫폼",
    } as const;

    await createOrgClient(api).saveMailSetting({ ...base });
    expect(calls[0].body).toEqual(base);

    await createOrgClient(api).saveMailSetting({ ...base, password: "" });
    expect(calls[1].body).toEqual({ ...base, password: "" });
  });

  it("테스트 발송은 받는 주소가 비면 본문을 비워 서버가 요청자에게 보내게 한다", async () => {
    const { api, calls } = createFakeApi({
      "POST /api/org/settings/mail/test": () => ({ ok: true }),
    });
    const client = createOrgClient(api);

    await client.testMail("  ");
    expect(calls[0].body).toEqual({});

    await client.testMail(" yujin@example.com ");
    expect(calls[1].body).toEqual({ to: "yujin@example.com" });
  });

  it("발송 로그는 빈 상태 필터를 빼고 page·size만 붙인다", async () => {
    const { api, calls } = createFakeApi({
      "GET /api/org/settings/mail/log": () => ({ items: [], total: 0 }),
    });
    const client = createOrgClient(api);

    await client.mailLog({ status: "", page: 0, size: 20 });
    expect(calls[0].path).toBe("/api/org/settings/mail/log?page=0&size=20");

    await client.mailLog({ status: "FAILED", page: 2, size: 20 });
    expect(calls[1].path).toBe("/api/org/settings/mail/log?status=FAILED&page=2&size=20");
  });

  it("다시 보내기는 로그 id 경로로 POST한다", async () => {
    const { api, calls } = createFakeApi({
      "POST /api/org/settings/mail/log/:id/retry": () => undefined,
    });
    await createOrgClient(api).retryMail("91");
    expect(calls[0]).toMatchObject({ method: "POST", path: "/api/org/settings/mail/log/91/retry" });
  });
});
