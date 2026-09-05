import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { OrgAdminApp } from "./OrgAdminApp";
import { createFakeApi } from "./testing/fakeApi";
import type { FakeHandler } from "./testing/fakeApi";
import { ADMIN_USER, renderApp } from "./testing/renderScreen";

const ROUTES: Record<string, FakeHandler> = {
  "GET /api/org/members/page": () => ({
    items: [
      {
        id: 1,
        displayName: "김채호",
        email: "chanho@example.com",
        status: "ACTIVE",
        kind: "HUMAN",
        joinedVia: "BOOTSTRAP",
        createdAt: "2026-01-02T00:00:00Z",
      },
    ],
    page: 0,
    size: 20,
    total: 1,
  }),
  "GET /api/org/members/pending": () => [],
  "GET /api/org/teams": () => [{ id: 1, name: "전체 구성원", kind: "EVERYONE", memberCount: 1 }],
  "GET /api/org/teams/:id/members": () => [],
  "GET /api/org/grants": () => [],
  "GET /api/org/invitations": () => ({ items: [], page: 0, size: 20, total: 0 }),
};

function mount(route?: string, basePath = "/admin/org") {
  const { api, calls } = createFakeApi(ROUTES);
  const view = renderApp(<OrgAdminApp basePath={basePath} api={api} currentUser={ADMIN_USER} />, {
    api,
    route,
    basePath,
  });
  return { view, calls };
}

describe("OrgAdminApp", () => {
  it("basePath 아래 사용자 화면을 기본으로 그린다", async () => {
    mount();
    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "사용자·팀 관리" })).toBeInTheDocument();
  });

  it("basePath 자체로 들어오면 사용자 화면으로 넘긴다", async () => {
    mount("/admin/org");
    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
  });

  it("내비게이션 링크가 basePath를 앞에 붙인다", async () => {
    mount();
    await screen.findByRole("cell", { name: "김채호" });

    expect(screen.getByRole("link", { name: "초대" })).toHaveAttribute(
      "href",
      "/admin/org/invitations",
    );
    expect(screen.getByRole("link", { name: "승인 대기" })).toHaveAttribute(
      "href",
      "/admin/org/pending",
    );
  });

  it("탭을 옮기면 그 화면을 그린다", async () => {
    mount();
    await screen.findByRole("cell", { name: "김채호" });

    await userEvent.click(screen.getByRole("link", { name: "승인 대기" }));

    expect(await screen.findByText("승인 대기 중인 사용자가 없습니다")).toBeInTheDocument();
  });

  it("모르는 하위 경로는 사용자 화면으로 돌려보낸다", async () => {
    mount("/admin/org/없는화면");
    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
  });

  // ALM은 /settings/org 아래에 붙는다 — 패키지가 특정 경로를 가정하지 않는지 잠근다.
  it("다른 basePath에 마운트해도 링크·리다이렉트가 그 경로를 따른다", async () => {
    mount("/settings/org", "/settings/org");

    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "팀" })).toHaveAttribute("href", "/settings/org/teams");
  });

  it("다른 basePath에서도 모르는 하위 경로를 사용자 화면으로 돌려보낸다", async () => {
    mount("/settings/org/없는화면", "/settings/org");
    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
  });

  it("basePath에 뒤 슬래시가 붙어도 링크가 겹치지 않는다", async () => {
    mount("/settings/org/users", "/settings/org/");
    expect(await screen.findByRole("cell", { name: "김채호" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "초대" })).toHaveAttribute(
      "href",
      "/settings/org/invitations",
    );
  });
});
