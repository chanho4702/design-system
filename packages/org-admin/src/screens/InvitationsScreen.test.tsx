import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocation } from "react-router";
import { InvitationsScreen } from "./InvitationsScreen";
import { FakeError, createFakeApi } from "../testing/fakeApi";
import type { FakeHandler } from "../testing/fakeApi";
import { renderScreen } from "../testing/renderScreen";

/** 프리셋 쿼리가 실제로 지워졌는지 보기 위한 현위치 표시기. */
function LocationProbe() {
  const location = useLocation();
  return <span data-testid="search">{location.search}</span>;
}

const PENDING = {
  id: 10,
  email: "new@example.com",
  status: "PENDING",
  invitedByName: "김채호",
  createdAt: "2026-09-01T00:00:00Z",
  expiresAt: "2026-09-08T00:00:00Z",
  inviteUrl: "https://wiki.example.com/invite/tok-10",
  mailSent: false,
  teams: [],
  grants: [],
};

function invitationRoutes(
  overrides: Record<string, FakeHandler> = {},
): Record<string, FakeHandler> {
  return {
    "GET /api/org/teams": () => [
      { id: 1, name: "전체 구성원", kind: "EVERYONE", memberCount: 12 },
      { id: 2, name: "플랫폼", kind: "STANDARD", memberCount: 4 },
    ],
    "GET /api/org/invitations": ({ params }) => {
      const items = params.get("status") === "PENDING" ? [PENDING] : [];
      return { items, page: 0, size: 20, total: items.length };
    },
    "POST /api/org/invitations": ({ body }) => {
      const emails = (body as { emails: string[] }).emails;
      return emails.map((email, index) => ({
        id: 100 + index,
        email,
        status: "PENDING",
        inviteUrl: `https://wiki.example.com/invite/tok-${index}`,
        mailSent: false,
        teams: [],
        grants: [],
      }));
    },
    "POST /api/org/invitations/:id/resend": () => ({
      ...PENDING,
      inviteUrl: "https://wiki.example.com/invite/tok-new",
    }),
    "DELETE /api/org/invitations/:id": () => undefined,
    ...overrides,
  };
}

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
});

describe("InvitationsScreen", () => {
  it("대기 탭의 초대를 표로 보여 준다", async () => {
    const { api } = createFakeApi(invitationRoutes());
    renderScreen(<InvitationsScreen />, { api });

    expect(await screen.findByRole("cell", { name: "new@example.com" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "대기" })).toBeInTheDocument();
  });

  it("초대를 만들면 결과 표에 링크 복사 버튼과 미발송 배지가 나오고 복사가 동작한다", async () => {
    const { api, calls } = createFakeApi(invitationRoutes());
    renderScreen(<InvitationsScreen />, { api });
    await screen.findByRole("cell", { name: "new@example.com" });

    await userEvent.click(screen.getByRole("button", { name: "새 초대" }));

    // 실제 쓰임새가 "여러 주소를 한 번에 붙여넣기"라 붙여넣기 이벤트로 넣는다.
    await userEvent.click(screen.getByRole("textbox", { name: "이메일" }));
    await userEvent.paste("a@example.com, b@example.com");

    await userEvent.click(screen.getByRole("button", { name: "초대 보내기" }));

    const results = await screen.findByRole("table", { name: "초대 결과" });
    expect(within(results).getByRole("cell", { name: "a@example.com" })).toBeInTheDocument();
    expect(
      within(results).getAllByRole("cell", { name: "미발송 — 링크를 전달하세요" }),
    ).toHaveLength(2);

    const post = calls.find((c) => c.method === "POST");
    expect(post?.body).toMatchObject({ emails: ["a@example.com", "b@example.com"] });

    await userEvent.click(
      within(results).getByRole("button", { name: "a@example.com 초대 링크 복사" }),
    );
    expect(writeText).toHaveBeenCalledWith("https://wiki.example.com/invite/tok-0");
  });

  it("형식이 틀린 이메일은 인라인 오류로 짚고 전송을 막는다", async () => {
    const { api } = createFakeApi(invitationRoutes());
    renderScreen(<InvitationsScreen />, { api });
    await screen.findByRole("cell", { name: "new@example.com" });

    await userEvent.click(screen.getByRole("button", { name: "새 초대" }));
    await userEvent.click(screen.getByRole("textbox", { name: "이메일" }));
    await userEvent.paste("a@example.com, 망가진주소");

    expect(
      await screen.findByText("이메일 형식이 올바르지 않습니다: 망가진주소"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "초대 보내기" })).toBeDisabled();
  });

  it("대기 중인 초대는 목록에서 링크를 복사할 수 있다", async () => {
    const { api } = createFakeApi(invitationRoutes());
    renderScreen(<InvitationsScreen />, { api });
    await screen.findByRole("cell", { name: "new@example.com" });

    await userEvent.click(screen.getByRole("button", { name: "new@example.com 초대 링크 복사" }));
    expect(writeText).toHaveBeenCalledWith("https://wiki.example.com/invite/tok-10");
  });

  it("철회는 확인을 거쳐 DELETE를 보낸다", async () => {
    const { api, calls } = createFakeApi(invitationRoutes());
    renderScreen(<InvitationsScreen />, { api });
    await screen.findByRole("cell", { name: "new@example.com" });

    await userEvent.click(screen.getByRole("button", { name: "철회" }));
    const dialog = await screen.findByRole("dialog", { name: "초대를 철회합니다" });
    await userEvent.click(within(dialog).getByRole("button", { name: "철회" }));

    await waitFor(() => {
      expect(
        calls.some((c) => c.method === "DELETE" && c.path === "/api/org/invitations/10"),
      ).toBe(true);
    });
  });

  describe("리소스 권한 프리셋 쿼리", () => {
    it("scope·resourceId·role을 읽어 폼을 열고 권한 칩을 미리 채운 뒤 쿼리를 지운다", async () => {
      const { api } = createFakeApi(invitationRoutes());
      renderScreen(
        <>
          <InvitationsScreen />
          <LocationProbe />
        </>,
        { api, entry: "/admin/org/invitations?scope=SPACE&resourceId=DEV&role=EDITOR" },
      );

      expect(await screen.findByText("스페이스 · DEV · 편집")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "초대 보내기" })).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByTestId("search")).toHaveTextContent("");
      });
    });

    it("resolveResource가 있으면 칩에 리소스 이름을 보여 준다", async () => {
      const { api } = createFakeApi(invitationRoutes());
      renderScreen(<InvitationsScreen />, {
        api,
        entry: "/admin/org/invitations?scope=SPACE&resourceId=DEV&role=VIEWER",
        resolveResource: (_scope, id) => Promise.resolve({ name: `개발 스페이스(${id})` }),
      });

      expect(await screen.findByText("스페이스 · 개발 스페이스(DEV) · 읽기")).toBeInTheDocument();
    });

    it("모르는 role은 읽기로 떨어뜨린다", async () => {
      const { api } = createFakeApi(invitationRoutes());
      renderScreen(<InvitationsScreen />, {
        api,
        entry: "/admin/org/invitations?scope=PROJECT&resourceId=9&role=SUPERUSER",
      });

      expect(await screen.findByText("프로젝트 · 9 · 읽기")).toBeInTheDocument();
    });

    it("resourceId가 없으면 프리셋을 무시하고 폼을 열지 않는다", async () => {
      const { api } = createFakeApi(invitationRoutes());
      renderScreen(<InvitationsScreen />, {
        api,
        entry: "/admin/org/invitations?scope=SPACE",
      });
      await screen.findByRole("cell", { name: "new@example.com" });

      expect(screen.queryByRole("button", { name: "초대 보내기" })).not.toBeInTheDocument();
    });

    it("프리셋이 담긴 채로 초대를 만들면 grants에 실려 나간다", async () => {
      const { api, calls } = createFakeApi(invitationRoutes());
      renderScreen(<InvitationsScreen />, {
        api,
        entry: "/admin/org/invitations?scope=SPACE&resourceId=DEV&role=EDITOR",
      });
      await screen.findByText("스페이스 · DEV · 편집");

      await userEvent.click(screen.getByRole("textbox", { name: "이메일" }));
      await userEvent.paste("a@example.com");
      await userEvent.click(screen.getByRole("button", { name: "초대 보내기" }));

      await waitFor(() => {
        const post = calls.find((c) => c.method === "POST");
        expect(post?.body).toMatchObject({
          emails: ["a@example.com"],
          grants: [{ scope: "SPACE", resourceId: "DEV", role: "EDITOR" }],
        });
      });
    });
  });

  it("재발송이 거부되면 서버 문구를 토스트로 띄운다", async () => {
    const { api } = createFakeApi(
      invitationRoutes({
        "POST /api/org/invitations/:id/resend": () =>
          new FakeError(403, "이 초대를 다시 보낼 권한이 없습니다"),
      }),
    );
    renderScreen(<InvitationsScreen />, { api });
    await screen.findByRole("cell", { name: "new@example.com" });

    await userEvent.click(screen.getByRole("button", { name: "재발송" }));

    expect(await screen.findByText("이 초대를 다시 보낼 권한이 없습니다")).toBeInTheDocument();
  });
});
