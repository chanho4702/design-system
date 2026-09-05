import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PendingApprovalGate } from "./PendingApprovalGate";
import { FakeError, createFakeApi } from "./testing/fakeApi";

function gate(me: unknown) {
  return createFakeApi({ "GET /api/org/me": () => me });
}

describe("PendingApprovalGate", () => {
  it("status가 PENDING이면 안내 화면을 그리고 children을 감춘다", async () => {
    const { api } = gate({ id: 3, displayName: "정하늘", status: "PENDING", globalRoles: [] });
    render(
      <PendingApprovalGate api={api} actions={<a href="/logout">로그아웃</a>}>
        <div>앱 셸</div>
      </PendingApprovalGate>,
    );

    expect(await screen.findByRole("heading", { name: "승인 대기 중" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그아웃" })).toBeInTheDocument();
    expect(screen.queryByText("앱 셸")).not.toBeInTheDocument();
  });

  it("ACTIVE면 children을 그대로 그린다", async () => {
    const { api } = gate({ id: 3, displayName: "정하늘", status: "ACTIVE", globalRoles: ["ADMIN"] });
    render(
      <PendingApprovalGate api={api}>
        <div>앱 셸</div>
      </PendingApprovalGate>,
    );

    expect(await screen.findByText("앱 셸")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "승인 대기 중" })).not.toBeInTheDocument();
  });

  it("조회에 실패하면 오류를 노출하고 children을 그리지 않는다", async () => {
    const { api } = createFakeApi({
      "GET /api/org/me": () => new FakeError(503, "org-service에 연결할 수 없습니다"),
    });
    render(
      <PendingApprovalGate api={api}>
        <div>앱 셸</div>
      </PendingApprovalGate>,
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("org-service에 연결할 수 없습니다");
    expect(screen.queryByText("앱 셸")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("다시 시도를 누르면 /api/org/me를 한 번 더 부른다", async () => {
    const { api, calls } = createFakeApi({
      "GET /api/org/me": () => new FakeError(503, "연결 실패"),
    });
    render(
      <PendingApprovalGate api={api}>
        <div>앱 셸</div>
      </PendingApprovalGate>,
    );
    await screen.findByRole("button", { name: "다시 시도" });

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(calls.filter((c) => c.path === "/api/org/me").length).toBeGreaterThanOrEqual(2);
  });
});
