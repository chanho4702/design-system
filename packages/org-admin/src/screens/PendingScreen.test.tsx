import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PendingScreen } from "./PendingScreen";
import { FakeError, createFakeApi } from "../testing/fakeApi";
import type { FakeHandler } from "../testing/fakeApi";
import { renderScreen } from "../testing/renderScreen";

const PENDING_MEMBERS = [
  {
    id: 21,
    displayName: "정하늘",
    email: "haneul@example.com",
    status: "PENDING",
    kind: "HUMAN",
    createdAt: "2026-09-04T00:00:00Z",
  },
];

function pendingRoutes(overrides: Record<string, FakeHandler> = {}): Record<string, FakeHandler> {
  return {
    "GET /api/org/members/pending": () => PENDING_MEMBERS,
    "GET /api/org/teams": () => [
      { id: 1, name: "전체 구성원", kind: "EVERYONE" },
      { id: 2, name: "플랫폼", kind: "STANDARD" },
    ],
    "POST /api/org/members/:id/approve": () => undefined,
    "PATCH /api/org/members/:id": () => undefined,
    ...overrides,
  };
}

describe("PendingScreen", () => {
  it("승인 대기 목록을 보여 준다", async () => {
    const { api } = createFakeApi(pendingRoutes());
    renderScreen(<PendingScreen />, { api });

    expect(await screen.findByRole("cell", { name: "정하늘" })).toBeInTheDocument();
  });

  it("대기자가 없으면 빈 상태를 보여 준다", async () => {
    const { api } = createFakeApi(pendingRoutes({ "GET /api/org/members/pending": () => [] }));
    renderScreen(<PendingScreen />, { api });

    expect(await screen.findByText("승인 대기 중인 사용자가 없습니다")).toBeInTheDocument();
  });

  it("팀을 골라 승인하면 teamIds와 함께 approve를 보낸다", async () => {
    const { api, calls } = createFakeApi(pendingRoutes());
    renderScreen(<PendingScreen />, { api });
    await screen.findByRole("cell", { name: "정하늘" });

    await userEvent.click(screen.getByRole("button", { name: "승인" }));
    const dialog = await screen.findByRole("dialog", { name: "가입 승인" });

    // 전체 구성원 팀은 자동 소속이라 선택지에 없다.
    expect(within(dialog).queryByRole("checkbox", { name: "전체 구성원" })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("checkbox", { name: "플랫폼" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "승인" }));

    await waitFor(() => {
      const post = calls.find((c) => c.method === "POST");
      expect(post?.path).toBe("/api/org/members/21/approve");
      expect(post?.body).toEqual({ teamIds: ["2"], grants: [] });
    });
  });

  it("거절은 확인을 거쳐 DEACTIVATED로 내린다", async () => {
    const { api, calls } = createFakeApi(pendingRoutes());
    renderScreen(<PendingScreen />, { api });
    await screen.findByRole("cell", { name: "정하늘" });

    await userEvent.click(screen.getByRole("button", { name: "거절" }));
    const dialog = await screen.findByRole("dialog", { name: "가입을 거절합니다" });
    await userEvent.click(within(dialog).getByRole("button", { name: "거절" }));

    await waitFor(() => {
      const patch = calls.find((c) => c.method === "PATCH");
      expect(patch?.path).toBe("/api/org/members/21");
      expect(patch?.body).toEqual({ status: "DEACTIVATED" });
    });
  });

  it("승인이 거부되면 서버 문구를 그대로 띄운다", async () => {
    const { api } = createFakeApi(
      pendingRoutes({
        "POST /api/org/members/:id/approve": () =>
          new FakeError(403, "승인 권한이 없습니다"),
      }),
    );
    renderScreen(<PendingScreen />, { api });
    await screen.findByRole("cell", { name: "정하늘" });

    await userEvent.click(screen.getByRole("button", { name: "승인" }));
    const dialog = await screen.findByRole("dialog", { name: "가입 승인" });
    await userEvent.click(within(dialog).getByRole("button", { name: "승인" }));

    expect(await screen.findByText("승인 권한이 없습니다")).toBeInTheDocument();
  });
});
