import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MailScreen } from "./MailScreen";
import { FakeError, createFakeApi } from "../testing/fakeApi";
import type { FakeHandler } from "../testing/fakeApi";
import { PLAIN_USER, renderScreen } from "../testing/renderScreen";

const SETTING = {
  enabled: true,
  mode: "relay",
  host: "mail-relay",
  port: 25,
  username: "",
  passwordSet: true,
  tls: "NONE",
  fromAddress: "no-reply@example.com",
  fromName: "플랫폼",
  updatedAt: "2026-09-07T09:30:00Z",
  updatedBy: "1",
};

const LOG = {
  items: [
    {
      id: 91,
      to: "yujin@example.com",
      subject: "초대합니다",
      source: "org",
      status: "FAILED",
      attempts: 3,
      lastError: "535 5.7.8 Authentication credentials invalid",
      createdAt: "2026-09-07T09:00:00Z",
      sentAt: null,
    },
    {
      id: 92,
      to: "chanho@example.com",
      subject: "문서가 바뀌었습니다",
      source: "wiki",
      status: "SENT",
      attempts: 1,
      lastError: null,
      createdAt: "2026-09-07T09:10:00Z",
      sentAt: "2026-09-07T09:11:00Z",
    },
  ],
  total: 2,
};

function mailRoutes(overrides: Record<string, FakeHandler> = {}): Record<string, FakeHandler> {
  return {
    "GET /api/org/settings/mail": () => SETTING,
    "PUT /api/org/settings/mail": () => undefined,
    "POST /api/org/settings/mail/test": () => ({ ok: true }),
    "GET /api/org/settings/mail/log": () => LOG,
    "POST /api/org/settings/mail/log/:id/retry": () => undefined,
    "GET /api/org/me": () => ({
      id: 1,
      displayName: "김채호",
      email: "chanho@example.com",
      status: "ACTIVE",
      kind: "HUMAN",
      globalRoles: ["ADMIN"],
    }),
    ...overrides,
  };
}

/** 설정 카드가 그려질 때까지 기다린다 — 폼은 GET 응답이 온 뒤에 채워진다. */
async function waitForForm() {
  expect(await screen.findByRole("textbox", { name: "호스트" })).toHaveValue("mail-relay");
}

describe("MailScreen", () => {
  it("설치 모드 배지와 안내, 서버가 준 설정 값을 그린다", async () => {
    const { api } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    expect(screen.getByText("릴레이")).toBeInTheDocument();
    expect(
      screen.getByText("발송 전용 릴레이를 거쳐 보냅니다. 앱은 관문 하나만 봅니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "포트" })).toHaveValue("25");
    expect(screen.getByRole("textbox", { name: "보내는 주소" })).toHaveValue(
      "no-reply@example.com",
    );
    expect(screen.getByRole("switch", { name: "메일 발송 사용" })).toBeChecked();
  });

  it("모르는 모드는 none으로 읽지 않고 확인이 필요하다고 말한다", async () => {
    const { api } = createFakeApi(
      mailRoutes({ "GET /api/org/settings/mail": () => ({ ...SETTING, mode: "카오스" }) }),
    );
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    expect(screen.getByText("확인 필요")).toBeInTheDocument();
    expect(screen.queryByText("사용 안 함")).not.toBeInTheDocument();
  });

  it("발송이 꺼져 있으면 초대가 링크로만 전달된다고 알린다", async () => {
    const { api } = createFakeApi(
      mailRoutes({ "GET /api/org/settings/mail": () => ({ ...SETTING, enabled: false }) }),
    );
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    expect(screen.getByRole("status")).toHaveTextContent("메일 발송이 꺼져 있습니다");
  });

  it("비밀번호를 건드리지 않고 저장하면 password 키를 아예 보내지 않는다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    await userEvent.clear(screen.getByRole("textbox", { name: "호스트" }));
    await userEvent.type(screen.getByRole("textbox", { name: "호스트" }), "smtp.example.com");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      const put = calls.find((c) => c.method === "PUT");
      expect(put).toBeDefined();
      expect(put?.body).toEqual({
        enabled: true,
        host: "smtp.example.com",
        port: 25,
        username: "",
        tls: "NONE",
        fromAddress: "no-reply@example.com",
        fromName: "플랫폼",
      });
      expect(Object.keys(put?.body as object)).not.toContain("password");
    });
  });

  it("입력한 비밀번호는 그대로 실어 보낸다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    await userEvent.type(screen.getByLabelText("비밀번호"), "s3cret");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      const put = calls.find((c) => c.method === "PUT");
      expect((put?.body as { password?: string })?.password).toBe("s3cret");
    });
  });

  it("비밀번호 삭제는 확인을 거쳐 빈 문자열로 저장한다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    await userEvent.click(screen.getByRole("button", { name: "비밀번호 삭제" }));
    const dialog = await screen.findByRole("dialog", { name: "저장된 비밀번호를 삭제합니다" });
    await userEvent.click(within(dialog).getByRole("button", { name: "삭제하고 저장" }));

    await waitFor(() => {
      const put = calls.find((c) => c.method === "PUT");
      expect((put?.body as { password?: string })?.password).toBe("");
    });
  });

  it("사용 중인데 호스트가 비면 저장하지 않고 그 자리에 이유를 적는다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    await userEvent.clear(screen.getByRole("textbox", { name: "호스트" }));
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("호스트를 입력하세요")).toBeInTheDocument();
    expect(calls.some((c) => c.method === "PUT")).toBe(false);
  });

  it("서버가 저장을 거부하면 그 문구를 그대로 띄운다", async () => {
    const { api } = createFakeApi(
      mailRoutes({
        "PUT /api/org/settings/mail": () =>
          new FakeError(400, "비밀번호 암호화 키(ORG_SETTINGS_ENC_KEY)가 설정되지 않았습니다"),
      }),
    );
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("비밀번호 암호화 키(ORG_SETTINGS_ENC_KEY)가 설정되지 않았습니다"),
    ).toBeInTheDocument();
  });

  it("테스트 발송은 내 주소를 기본으로 채우고 그 주소로 보낸다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "받는 주소" })).toHaveValue("chanho@example.com");
    });
    await userEvent.click(screen.getByRole("button", { name: "테스트 발송" }));

    await waitFor(() => {
      const post = calls.find((c) => c.path === "/api/org/settings/mail/test");
      expect(post?.body).toEqual({ to: "chanho@example.com" });
    });
    expect(await screen.findByText("테스트 메일을 보냈습니다")).toBeInTheDocument();
  });

  it("테스트 발송이 실패하면 서버가 준 SMTP 오류 문구를 그대로 보여 준다", async () => {
    const { api } = createFakeApi(
      mailRoutes({
        "POST /api/org/settings/mail/test": () => ({
          ok: false,
          error: "Could not connect to SMTP host: mail-relay, port: 25",
        }),
      }),
    );
    renderScreen(<MailScreen />, { api });
    await waitForForm();

    await userEvent.click(screen.getByRole("button", { name: "테스트 발송" }));

    expect(
      await screen.findByText("Could not connect to SMTP host: mail-relay, port: 25"),
    ).toBeInTheDocument();
  });

  it("발송 로그를 받는 주소·출처·상태·오류와 함께 보여 준다", async () => {
    const { api } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });

    expect(await screen.findByRole("cell", { name: "yujin@example.com" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "조직" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "위키" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "535 5.7.8 Authentication credentials invalid" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "성공" })).toBeInTheDocument();
  });

  it("상태 필터를 고르면 그 상태로 로그를 다시 읽는다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await screen.findByRole("cell", { name: "yujin@example.com" });

    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    await userEvent.click(screen.getByRole("option", { name: "실패" }));

    await waitFor(() => {
      expect(
        calls.some((c) => c.path.startsWith("/api/org/settings/mail/log?status=FAILED")),
      ).toBe(true);
    });
  });

  it("전체 필터는 status 파라미터를 붙이지 않는다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await screen.findByRole("cell", { name: "yujin@example.com" });

    const first = calls.find((c) => c.path.startsWith("/api/org/settings/mail/log"));
    expect(first?.path).not.toContain("status=");
  });

  it("실패한 행만 다시 보내기를 내주고 retry를 호출한다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api });
    await screen.findByRole("cell", { name: "yujin@example.com" });

    const buttons = screen.getAllByRole("button", { name: "다시 보내기" });
    expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]);

    await waitFor(() => {
      expect(
        calls.some(
          (c) => c.method === "POST" && c.path === "/api/org/settings/mail/log/91/retry",
        ),
      ).toBe(true);
    });
  });

  // 로그 응답은 page를 되돌려주지 않는다 — 다음 쪽으로 넘어간 표시가 화면에 남아야 한다.
  it("다음 쪽으로 넘기면 page를 올려 다시 읽고 쪽 번호도 따라간다", async () => {
    const { api, calls } = createFakeApi(
      mailRoutes({ "GET /api/org/settings/mail/log": () => ({ ...LOG, total: 41 }) }),
    );
    renderScreen(<MailScreen />, { api });
    await screen.findByRole("cell", { name: "yujin@example.com" });

    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => {
      expect(calls.some((c) => c.path.includes("/mail/log?page=1&size=20"))).toBe(true);
    });
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("로그가 비면 빈 상태를 보여 준다", async () => {
    const { api } = createFakeApi(
      mailRoutes({ "GET /api/org/settings/mail/log": () => ({ items: [], total: 0 }) }),
    );
    renderScreen(<MailScreen />, { api });

    expect(await screen.findByText("발송 기록이 없습니다")).toBeInTheDocument();
  });

  it("설정을 못 읽으면 서버 문구와 다시 시도를 노출한다", async () => {
    const { api } = createFakeApi(
      mailRoutes({
        "GET /api/org/settings/mail": () => new FakeError(503, "메일 설정을 읽을 수 없습니다"),
      }),
    );
    renderScreen(<MailScreen />, { api });

    expect(await screen.findByText("메일 설정을 읽을 수 없습니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("전역 관리자가 아니면 설정을 읽지 않고 안내만 보여 준다", async () => {
    const { api, calls } = createFakeApi(mailRoutes());
    renderScreen(<MailScreen />, { api, currentUser: PLAIN_USER });

    expect(
      await screen.findByText("메일 설정은 전역 관리자만 볼 수 있습니다"),
    ).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });
});
