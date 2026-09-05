import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvitationsScreen } from "./InvitationsScreen";
import { FakeError, createFakeApi } from "../testing/fakeApi";
import type { FakeHandler } from "../testing/fakeApi";
import { renderScreen } from "../testing/renderScreen";

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
