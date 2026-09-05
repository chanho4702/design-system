import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TeamsScreen } from "./TeamsScreen";
import { FakeError, createFakeApi, lastSegment } from "../testing/fakeApi";
import type { FakeHandler } from "../testing/fakeApi";
import { PLAIN_USER, renderScreen } from "../testing/renderScreen";

const TEAMS = [
  { id: 1, name: "전체 구성원", kind: "EVERYONE", memberCount: 12, myRole: null },
  { id: 2, name: "플랫폼", kind: "STANDARD", memberCount: 2, myRole: "LEAD" },
];

const TEAM_MEMBERS: Record<string, unknown[]> = {
  "1": [{ memberId: 1, displayName: "김채호", email: "chanho@example.com", role: "MEMBER" }],
  "2": [
    { memberId: 1, displayName: "김채호", email: "chanho@example.com", role: "LEAD" },
    { memberId: 3, displayName: "박지민", email: "jimin@example.com", role: "MEMBER" },
  ],
};

function teamRoutes(overrides: Record<string, FakeHandler> = {}): Record<string, FakeHandler> {
  return {
    "GET /api/org/teams": () => TEAMS,
    "GET /api/org/teams/:id/members": ({ path }) =>
      TEAM_MEMBERS[path.split("/")[4] ?? ""] ?? [],
    "POST /api/org/teams": ({ body }) => ({
      id: 5,
      name: (body as { name: string }).name,
      kind: "STANDARD",
    }),
    "PUT /api/org/teams/:id": ({ body }) => ({ id: 2, ...(body as object), kind: "STANDARD" }),
    "DELETE /api/org/teams/:id": () => undefined,
    "PUT /api/org/teams/:id/members/:memberId": () => undefined,
    "PATCH /api/org/teams/:id/members/:memberId": () => undefined,
    "DELETE /api/org/teams/:id/members/:memberId": () => undefined,
    // 선택기는 배열 응답(하위 호환) 경로를 쓴다.
    "GET /api/org/members": () => [
      { id: 7, displayName: "최유진", email: "yujin@example.com", status: "ACTIVE", kind: "HUMAN" },
    ],
    ...overrides,
  };
}

async function selectTeam(name: string) {
  const list = await screen.findByRole("list", { name: "팀 목록" });
  await userEvent.click(within(list).getByRole("button", { name: new RegExp(name) }));
}

describe("TeamsScreen", () => {
  it("전체 구성원 팀은 읽기 전용 배지를 달고 편집 버튼을 감춘다", async () => {
    const { api } = createFakeApi(teamRoutes());
    renderScreen(<TeamsScreen />, { api });

    await selectTeam("전체 구성원");

    expect(await screen.findByText("전체 구성원(자동)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "팀 삭제" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이름 저장" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "제거" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "팀원 추가" })).not.toBeInTheDocument();
  });

  it("일반 팀은 팀원 표와 역할·제거를 보여 준다", async () => {
    const { api } = createFakeApi(teamRoutes());
    renderScreen(<TeamsScreen />, { api });

    await selectTeam("플랫폼");

    expect(await screen.findByRole("cell", { name: "박지민" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "박지민 역할" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "제거" })).toHaveLength(2);
  });

  it("리더로 지정하면 PATCH로 역할을 보낸다", async () => {
    const { api, calls } = createFakeApi(teamRoutes());
    renderScreen(<TeamsScreen />, { api });
    await selectTeam("플랫폼");
    await screen.findByRole("cell", { name: "박지민" });

    await userEvent.click(screen.getByRole("combobox", { name: "박지민 역할" }));
    await userEvent.click(screen.getByRole("option", { name: "리더" }));

    await waitFor(() => {
      const patch = calls.find((c) => c.method === "PATCH");
      expect(patch?.path).toBe("/api/org/teams/2/members/3");
      expect(patch?.body).toEqual({ role: "LEAD" });
    });
  });

  it("팀원 추가는 검색해 고른 사람을 PUT으로 넣는다", async () => {
    const { api, calls } = createFakeApi(teamRoutes());
    renderScreen(<TeamsScreen />, { api });
    await selectTeam("플랫폼");
    await screen.findByRole("cell", { name: "박지민" });

    const option = await screen.findByRole("button", { name: /최유진/ });
    await userEvent.click(option);
    await userEvent.click(screen.getByRole("button", { name: "팀원 추가" }));

    await waitFor(() => {
      const put = calls.find((c) => c.method === "PUT" && c.path.includes("/members/"));
      expect(put?.path).toBe("/api/org/teams/2/members/7?role=MEMBER");
    });
  });

  it("팀 삭제가 거부되면 서버 문구를 그대로 띄운다", async () => {
    const { api } = createFakeApi(
      teamRoutes({
        "DELETE /api/org/teams/:id": () => new FakeError(409, "권한이 걸린 팀은 삭제할 수 없습니다"),
      }),
    );
    renderScreen(<TeamsScreen />, { api });
    await selectTeam("플랫폼");

    await userEvent.click(await screen.findByRole("button", { name: "팀 삭제" }));
    const dialog = await screen.findByRole("dialog", { name: "팀을 삭제합니다" });
    await userEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

    expect(await screen.findByText("권한이 걸린 팀은 삭제할 수 없습니다")).toBeInTheDocument();
  });

  it("전역 관리자가 아니면 팀 생성·이름 변경·삭제가 보이지 않는다", async () => {
    const { api } = createFakeApi(teamRoutes());
    renderScreen(<TeamsScreen />, { api, currentUser: PLAIN_USER });
    await selectTeam("플랫폼");
    await screen.findByRole("cell", { name: "박지민" });

    expect(screen.queryByRole("button", { name: "만들기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "팀 삭제" })).not.toBeInTheDocument();
    // LEAD라서 팀원 편집은 남는다.
    expect(screen.getByRole("button", { name: "팀원 추가" })).toBeInTheDocument();
  });

  it("팀 목록 조회가 실패하면 오류를 노출한다", async () => {
    const { api } = createFakeApi({
      "GET /api/org/teams": () => new FakeError(503, "org-service에 연결할 수 없습니다"),
    });
    renderScreen(<TeamsScreen />, { api });

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("org-service에 연결할 수 없습니다")).toBeInTheDocument();
  });
});

it("lastSegment는 경로의 마지막 조각을 준다", () => {
  expect(lastSegment("/api/org/teams/2/members")).toBe("members");
});
