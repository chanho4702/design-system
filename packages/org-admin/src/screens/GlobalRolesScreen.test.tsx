import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GlobalRolesScreen } from "./GlobalRolesScreen";
import { FakeError, createFakeApi } from "../testing/fakeApi";
import type { FakeHandler } from "../testing/fakeApi";
import { PLAIN_USER, renderScreen } from "../testing/renderScreen";

const GRANTS = [
  {
    id: 11,
    subjectType: "USER",
    subjectId: 1,
    subjectName: "김채호",
    resourceType: "GLOBAL",
    resourceId: null,
    role: "ADMIN",
  },
  {
    id: 12,
    subjectType: "TEAM",
    subjectId: 2,
    resourceType: "GLOBAL",
    resourceId: null,
    role: "VIEWER",
  },
];

function roleRoutes(overrides: Record<string, FakeHandler> = {}): Record<string, FakeHandler> {
  return {
    "GET /api/org/grants": () => GRANTS,
    "GET /api/org/teams": () => [{ id: 2, name: "플랫폼", kind: "STANDARD" }],
    // 선택기는 배열 응답(하위 호환) 경로를 쓴다.
    "GET /api/org/members": () => [
      { id: 7, displayName: "최유진", email: "yujin@example.com", status: "ACTIVE", kind: "HUMAN" },
    ],
    "PATCH /api/org/grants/:id": () => undefined,
    "DELETE /api/org/grants/:id": () => undefined,
    "POST /api/org/grants": () => ({ id: 13, subjectType: "USER", subjectId: 7, resourceType: "GLOBAL", role: "ADMIN" }),
    ...overrides,
  };
}

describe("GlobalRolesScreen", () => {
  it("전역 grant 목록을 사용자·팀 구분과 함께 보여 준다", async () => {
    const { api, calls } = createFakeApi(roleRoutes());
    renderScreen(<GlobalRolesScreen />, { api });

    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "팀" })).toBeInTheDocument();
    expect(calls[0].path).toContain("resourceType=GLOBAL");
  });

  it("팀 이름을 목록에서 찾아 id 대신 보여 준다", async () => {
    const { api } = createFakeApi(roleRoutes());
    renderScreen(<GlobalRolesScreen />, { api });

    expect(await screen.findByRole("cell", { name: "플랫폼" })).toBeInTheDocument();
  });

  it("마지막 관리자 강등이 409로 거부되면 서버 문구를 그대로 띄운다", async () => {
    const { api } = createFakeApi(
      roleRoutes({
        "PATCH /api/org/grants/:id": () =>
          new FakeError(409, "마지막 전역 관리자는 내릴 수 없습니다"),
      }),
    );
    renderScreen(<GlobalRolesScreen />, { api });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(screen.getByRole("combobox", { name: "김채호 전역 역할" }));
    await userEvent.click(screen.getByRole("option", { name: "읽기" }));

    expect(await screen.findByText("마지막 전역 관리자는 내릴 수 없습니다")).toBeInTheDocument();
  });

  it("회수는 확인을 거쳐 DELETE를 보낸다", async () => {
    const { api, calls } = createFakeApi(roleRoutes());
    renderScreen(<GlobalRolesScreen />, { api });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(screen.getAllByRole("button", { name: "회수" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "전역 역할을 회수합니다" });
    await userEvent.click(within(dialog).getByRole("button", { name: "회수" }));

    await waitFor(() => {
      expect(calls.some((c) => c.method === "DELETE" && c.path === "/api/org/grants/11")).toBe(true);
    });
  });

  it("사용자를 검색해 전역 역할을 부여한다", async () => {
    const { api, calls } = createFakeApi(roleRoutes());
    renderScreen(<GlobalRolesScreen />, { api });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(await screen.findByRole("button", { name: /최유진/ }));
    await userEvent.click(screen.getByRole("button", { name: "부여" }));

    await waitFor(() => {
      const post = calls.find((c) => c.method === "POST");
      expect(post?.body).toEqual({
        subjectType: "USER",
        subjectId: "7",
        resourceType: "GLOBAL",
        resourceId: null,
        role: "ADMIN",
      });
    });
  });

  it("전역 관리자가 아니면 역할 변경·회수·부여가 보이지 않는다", async () => {
    const { api } = createFakeApi(roleRoutes());
    renderScreen(<GlobalRolesScreen />, { api, currentUser: PLAIN_USER });
    await screen.findByRole("cell", { name: "김채호" });

    expect(screen.queryByRole("combobox", { name: "김채호 전역 역할" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "회수" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "부여" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "관리자" })).toBeInTheDocument();
  });
});
