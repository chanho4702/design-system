import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { FakeError, createFakeApi } from "../testing/fakeApi";
import { PLAIN_USER, renderScreen } from "../testing/renderScreen";

const AGENT = {
  id: 7,
  displayName: "리뷰 봇",
  email: null,
  status: "ACTIVE",
  kind: "AGENT",
  joinedVia: "APPROVAL",
  createdAt: "2026-09-01T00:00:00Z",
  teams: [],
  grants: [],
};

function fake(overrides: Record<string, () => unknown> = {}) {
  return createFakeApi({
    "GET /api/org/members/:id": () => AGENT,
    "GET /api/org/members/:id/events": () => [
      { id: 1, type: "AVATAR_CHANGED", createdAt: "2026-09-23T05:06:00Z", detail: null },
      { id: 2, type: "INVITE_RESENT", createdAt: "2026-09-22T05:06:00Z", detail: null },
      { id: 3, type: "SOMETHING_NEW", createdAt: "2026-09-21T05:06:00Z", detail: null },
    ],
    "PUT /api/org/members/:id/avatar": () => ({
      memberId: 7,
      avatarUrl: "/api/org/members/7/avatar?v=1",
      updatedAt: "2026-09-26T00:00:00Z",
    }),
    "DELETE /api/org/members/:id/avatar": () => undefined,
    ...overrides,
  });
}

function png(bytes: number, name = "face.png"): File {
  return new File([new Uint8Array(bytes)], name, { type: "image/png" });
}

async function openDrawer(options: Parameters<typeof fake>[0] = {}, plain = false) {
  const api = fake(options);
  const onChanged = vi.fn();
  renderScreen(<UserDetailDrawer memberId="7" onClose={() => {}} onChanged={onChanged} />, {
    api: api.api,
    currentUser: plain ? PLAIN_USER : undefined,
  });
  const dialog = await screen.findByRole("dialog", { name: "사용자 상세" });
  await within(dialog).findByText("리뷰 봇");
  return { ...api, dialog, onChanged };
}

describe("UserDetailDrawer 이력 라벨", () => {
  it("아바타·초대 재발송 이력은 한국어로, 모르는 타입은 원문으로 보인다", async () => {
    const { dialog } = await openDrawer();
    expect(await within(dialog).findByText("아바타 변경(관리자)")).toBeInTheDocument();
    expect(within(dialog).getByText("초대 재발송")).toBeInTheDocument();
    expect(within(dialog).getByText("SOMETHING_NEW")).toBeInTheDocument();
  });
});

describe("UserDetailDrawer 아바타(관리자)", () => {
  it("전역 관리자가 아니면 아바타 컨트롤이 없다", async () => {
    const { dialog } = await openDrawer({}, true);
    expect(within(dialog).queryByRole("button", { name: "아바타 변경" })).not.toBeInTheDocument();
    expect(within(dialog).queryByLabelText("아바타 이미지 파일")).not.toBeInTheDocument();
  });

  it("파일을 고르면 multipart file로 PUT하고 토스트·목록 갱신을 한다", async () => {
    const { dialog, calls, onChanged } = await openDrawer();
    expect(within(dialog).getByRole("button", { name: "아바타 변경" })).toBeEnabled();

    const file = png(1024);
    await userEvent.upload(within(dialog).getByLabelText("아바타 이미지 파일"), file);

    expect(await screen.findByText("아바타를 변경했습니다")).toBeInTheDocument();
    const put = calls.find((c) => c.method === "PUT");
    expect(put?.path).toBe("/api/org/members/7/avatar");
    expect(put?.body).toBeInstanceOf(FormData);
    expect((put?.body as FormData).get("file")).toBeInstanceOf(File);
    expect(((put?.body as FormData).get("file") as File).name).toBe("face.png");
    expect(onChanged).toHaveBeenCalledTimes(1);
    // 이력을 다시 읽어 AVATAR_CHANGED가 보이게 한다
    expect(calls.filter((c) => c.path === "/api/org/members/7/events")).toHaveLength(2);
  });

  it("2MB를 넘는 파일은 보내지 않고 서버와 같은 문구로 알린다", async () => {
    const { dialog, calls } = await openDrawer();
    await userEvent.upload(
      within(dialog).getByLabelText("아바타 이미지 파일"),
      png(2 * 1024 * 1024 + 1, "big.png"),
    );
    expect(await screen.findByText("아바타는 2MB 이하 이미지여야 합니다")).toBeInTheDocument();
    expect(calls.some((c) => c.method === "PUT")).toBe(false);
  });

  it("서버가 거절하면 {error} 문구를 그대로 토스트한다", async () => {
    const { dialog, onChanged } = await openDrawer({
      "PUT /api/org/members/:id/avatar": () =>
        new FakeError(400, "아바타는 PNG·JPG·WebP 이미지만 올릴 수 있습니다"),
    });
    await userEvent.upload(within(dialog).getByLabelText("아바타 이미지 파일"), png(10));
    expect(
      await screen.findByText("아바타는 PNG·JPG·WebP 이미지만 올릴 수 있습니다"),
    ).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("삭제는 확인을 거쳐 DELETE하고 토스트한다", async () => {
    const { dialog, calls, onChanged } = await openDrawer();
    await userEvent.click(within(dialog).getByRole("button", { name: "아바타 삭제" }));

    const confirm = await screen.findByRole("dialog", { name: "아바타를 삭제합니다" });
    await userEvent.click(within(confirm).getByRole("button", { name: "삭제" }));

    expect(await screen.findByText("아바타를 삭제했습니다")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        calls.some((c) => c.method === "DELETE" && c.path === "/api/org/members/7/avatar"),
      ).toBe(true);
    });
    expect(onChanged).toHaveBeenCalledTimes(1);
  });
});
