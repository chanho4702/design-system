import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UsersScreen } from "./UsersScreen";
import { FakeError, createFakeApi } from "../testing/fakeApi";
import { ADMIN_USER, PLAIN_USER, renderScreen } from "../testing/renderScreen";

const MEMBERS = [
  {
    id: 1,
    displayName: "김채호",
    email: "chanho@example.com",
    status: "ACTIVE",
    kind: "HUMAN",
    joinedVia: "BOOTSTRAP",
    createdAt: "2026-01-02T00:00:00Z",
  },
  {
    id: 2,
    displayName: "이서준",
    email: "seojun@example.com",
    status: "SUSPENDED",
    kind: "HUMAN",
    joinedVia: "INVITE",
    createdAt: "2026-03-04T00:00:00Z",
  },
];

function fake(overrides: Record<string, () => unknown> = {}) {
  return createFakeApi({
    "GET /api/org/members/page": ({ params }) => {
      const q = params.get("q") ?? "";
      const items = MEMBERS.filter((m) => m.displayName.includes(q) || (m.email ?? "").includes(q));
      return { items, page: Number(params.get("page") ?? 0), size: 20, total: items.length };
    },
    "GET /api/org/members/:id": () => ({
      ...MEMBERS[0],
      teams: [{ id: 9, name: "플랫폼", role: "LEAD" }],
      grants: [{ id: 5, subjectType: "USER", subjectId: 1, resourceType: "GLOBAL", role: "ADMIN" }],
    }),
    "GET /api/org/members/:id/events": () => [
      { id: 1, type: "APPROVED", createdAt: "2026-01-03T05:06:00Z", detail: null },
    ],
    "PATCH /api/org/members/:id": () => undefined,
    ...overrides,
  });
}

describe("UsersScreen", () => {
  it("기본 필터(활성·사람)로 목록을 불러와 행을 보여 준다", async () => {
    const { api, calls } = fake();
    renderScreen(<UsersScreen />, { api });

    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
    expect(calls[0].path).toContain("/api/org/members/page?");
    expect(calls[0].path).toContain("status=ACTIVE");
    expect(calls[0].path).toContain("kind=HUMAN");
  });

  it("검색어를 입력하면 q로 다시 조회한다", async () => {
    const { api, calls } = fake();
    renderScreen(<UsersScreen />, { api });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.type(screen.getByRole("textbox", { name: "사용자 검색" }), "서준");

    await waitFor(() => {
      expect(calls[calls.length - 1].path).toContain("q=%EC%84%9C%EC%A4%80");
    });
    expect(await screen.findByRole("cell", { name: "이서준" })).toBeInTheDocument();
  });

  it("결과가 없으면 빈 상태를 보여 준다", async () => {
    const { api } = createFakeApi({
      "GET /api/org/members/page": () => ({ items: [], page: 0, size: 20, total: 0 }),
    });
    renderScreen(<UsersScreen />, { api });
    expect(await screen.findByText("조건에 맞는 사용자가 없습니다")).toBeInTheDocument();
  });

  it("목록 조회가 실패하면 서버 문구를 그대로 노출하고 다시 시도를 제공한다", async () => {
    const { api } = createFakeApi({
      "GET /api/org/members/page": () => {
        throw new Error("사용자 목록을 불러오지 못했습니다");
      },
    });
    renderScreen(<UsersScreen />, { api });

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("사용자 목록을 불러오지 못했습니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("상세를 열면 팀·권한·이력을 보여 준다", async () => {
    const { api } = fake();
    renderScreen(<UsersScreen />, { api });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(screen.getAllByRole("button", { name: "상세" })[0]);

    const dialog = await screen.findByRole("dialog", { name: "사용자 상세" });
    expect(within(dialog).getByText("플랫폼 · 리더")).toBeInTheDocument();
    expect(within(dialog).getByText("전역")).toBeInTheDocument();
    expect(await within(dialog).findByText("승인됨")).toBeInTheDocument();
  });

  it("본인 계정은 비활성화 버튼이 잠긴다", async () => {
    const { api } = fake();
    renderScreen(<UsersScreen />, { api, currentUser: { ...ADMIN_USER, id: "1" } });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(screen.getAllByRole("button", { name: "상세" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "사용자 상세" });

    expect(within(dialog).getByRole("button", { name: "비활성화" })).toBeDisabled();
    expect(within(dialog).getByText("본인 계정은 비활성화할 수 없습니다.")).toBeInTheDocument();
  });

  it("남의 계정은 확인을 거쳐 비활성화된다", async () => {
    const { api, calls } = fake();
    renderScreen(<UsersScreen />, { api, currentUser: { id: "99", globalRoles: ["ADMIN"] } });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(screen.getAllByRole("button", { name: "상세" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "사용자 상세" });
    await userEvent.click(within(dialog).getByRole("button", { name: "비활성화" }));

    const confirm = await screen.findByRole("dialog", { name: "사용자를 비활성화합니다" });
    await userEvent.click(within(confirm).getByRole("button", { name: "비활성화" }));

    await waitFor(() => {
      expect(
        calls.some((c) => c.method === "PATCH" && c.path === "/api/org/members/1"),
      ).toBe(true);
    });
    const patch = calls.find((c) => c.method === "PATCH");
    expect(patch?.body).toEqual({ status: "DEACTIVATED" });
  });

  describe("CSV 내보내기(F-25)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    /** 가짜 API는 등록 순서로 고르므로 `/members/:id`가 export를 먼저 삼킨다 — export만 따로 받는다. */
    function exportFake(handler: () => unknown) {
      const base = fake();
      const exportApi = createFakeApi({ "GET /api/org/members/export": handler });
      return {
        calls: exportApi.calls,
        api: (path: string, init?: RequestInit) =>
          path.startsWith("/api/org/members/export") ? exportApi.api(path, init) : base.api(path, init),
      };
    }

    it("현재 필터를 그대로 실어 내려받고, 전체는 ALL로 보낸다", async () => {
      const createObjectURL = vi.fn(() => "blob:members");
      const revokeObjectURL = vi.fn();
      Object.assign(URL, { createObjectURL, revokeObjectURL });
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      const { api, calls } = exportFake(() => "이름,이메일,상태,팀");
      renderScreen(<UsersScreen />, { api });
      await screen.findByRole("cell", { name: "김채호" });

      await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
      await userEvent.click(await screen.findByRole("option", { name: "전체 상태" }));
      await userEvent.click(screen.getByRole("button", { name: "CSV 내보내기" }));

      await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
      expect(calls[0].path).toContain("status=ALL");
      expect(calls[0].path).toContain("kind=HUMAN");
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const anchor = click.mock.contexts[0] as HTMLAnchorElement;
      expect(anchor.download).toMatch(/^members-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it("실패하면 서버 문구를 토스트로 보인다", async () => {
      const { api } = exportFake(() => new FakeError(403, "GLOBAL ADMIN 권한이 필요합니다"));
      renderScreen(<UsersScreen />, { api });
      await screen.findByRole("cell", { name: "김채호" });

      await userEvent.click(screen.getByRole("button", { name: "CSV 내보내기" }));

      expect((await screen.findAllByText("GLOBAL ADMIN 권한이 필요합니다")).length).toBeGreaterThan(0);
    });

    it("전역 관리자가 아니면 버튼이 없다", async () => {
      const { api } = fake();
      renderScreen(<UsersScreen />, { api, currentUser: PLAIN_USER });
      await screen.findByRole("cell", { name: "김채호" });
      expect(screen.queryByRole("button", { name: "CSV 내보내기" })).not.toBeInTheDocument();
    });
  });

  it("상태를 '전체'로 고르면 목록도 status=ALL로 조회한다(비우면 서버가 활성만 준다)", async () => {
    const { api, calls } = fake();
    renderScreen(<UsersScreen />, { api });
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    await userEvent.click(await screen.findByRole("option", { name: "전체 상태" }));

    await waitFor(() =>
      expect(calls.some((c) => c.path.includes("/members/page?") && c.path.includes("status=ALL"))).toBe(true),
    );
  });
});
