import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GrantAuditScreen } from "./GrantAuditScreen";
import { FakeError, createFakeApi, lastSegment } from "../testing/fakeApi";
import type { FakeHandler } from "../testing/fakeApi";
import { PLAIN_USER, renderScreen } from "../testing/renderScreen";

const HOUR = 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

/** 서버 응답 모양 그대로(GrantAuditResponse) — 최신순. */
const AUDIT = [
  {
    id: "3",
    action: "GRANT_REVOKED",
    targetType: "USER",
    targetId: "7",
    targetLabel: "박지민",
    detail: "ADMIN",
    actorId: "1",
    createdAt: ago(2 * HOUR),
  },
  {
    id: "2",
    action: "GRANT_CHANGED",
    targetType: "TEAM",
    targetId: "9",
    targetLabel: "플랫폼팀",
    detail: "EDITOR",
    actorId: "5",
    createdAt: ago(3 * 24 * HOUR),
  },
  {
    id: "1",
    action: "GRANT_GRANTED",
    targetType: "USER",
    targetId: "7",
    targetLabel: "박지민",
    detail: "ADMIN",
    actorId: "1",
    createdAt: ago(45 * 24 * HOUR),
  },
];

const NAMES: Record<string, string> = { "1": "김채호", "5": "최유진" };

function auditRoutes(overrides: Record<string, FakeHandler> = {}): Record<string, FakeHandler> {
  return {
    "GET /api/org/grants/audit": () => AUDIT,
    "GET /api/org/members/:id": ({ path }) => {
      const id = lastSegment(path);
      return NAMES[id]
        ? { id, displayName: NAMES[id], status: "ACTIVE" }
        : new FakeError(404, "멤버 없음");
    },
    ...overrides,
  };
}

function bodyRows() {
  const table = screen.getByRole("table", { name: "권한 이력" });
  // 첫 행은 헤더다.
  return within(table).getAllByRole("row").slice(1);
}

async function choose(label: string, option: string) {
  await userEvent.click(screen.getByRole("combobox", { name: label }));
  await userEvent.click(await screen.findByRole("option", { name: option }));
}

describe("GrantAuditScreen", () => {
  it("전역 권한 이력을 최신순으로, 한 일·대상·역할·행위자 이름과 함께 그린다", async () => {
    const { api, calls } = createFakeApi(auditRoutes());
    renderScreen(<GrantAuditScreen />, { api });

    expect(await screen.findByRole("table", { name: "권한 이력" })).toBeInTheDocument();
    expect(calls[0].path).toBe("/api/org/grants/audit?resourceType=GLOBAL");

    const rows = bodyRows();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("회수");
    expect(rows[0]).toHaveTextContent("박지민");
    expect(rows[0]).toHaveTextContent("관리자");
    expect(await within(rows[0]).findByText("김채호")).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent("역할 변경");
    expect(rows[1]).toHaveTextContent("플랫폼팀");
    expect(rows[1]).toHaveTextContent("편집");
    expect(await within(rows[1]).findByText("최유진")).toBeInTheDocument();
    expect(rows[2]).toHaveTextContent("부여");
  });

  it("값은 아이콘과 텍스트를 함께 쓴다 — 대상 종류는 아이콘의 접근 이름으로도 읽힌다", async () => {
    const { api } = createFakeApi(auditRoutes());
    renderScreen(<GrantAuditScreen />, { api });
    await screen.findByRole("table", { name: "권한 이력" });

    const rows = bodyRows();
    expect(within(rows[1]).getByLabelText("팀")).toBeInTheDocument();
    expect(within(rows[0]).getByLabelText("사용자")).toBeInTheDocument();
    // 한 일·역할 칸에도 장식 아이콘(svg)이 붙는다.
    const actionCell = within(rows[0]).getByText("회수");
    expect(actionCell.querySelector("svg")).not.toBeNull();
  });

  it("행위자 이름을 못 얻으면 id로 대체한다", async () => {
    const { api } = createFakeApi(
      auditRoutes({ "GET /api/org/grants/audit": () => [{ ...AUDIT[0], actorId: "99" }] }),
    );
    renderScreen(<GrantAuditScreen />, { api });
    await screen.findByRole("table", { name: "권한 이력" });

    expect(await screen.findByText("구성원 #99")).toBeInTheDocument();
  });

  it("기간 필터로 최근 기록만 남긴다", async () => {
    const { api } = createFakeApi(auditRoutes());
    renderScreen(<GrantAuditScreen />, { api });
    await screen.findByRole("table", { name: "권한 이력" });

    await choose("기간", "최근 24시간");
    expect(bodyRows()).toHaveLength(1);

    await choose("기간", "최근 30일");
    expect(bodyRows()).toHaveLength(2);
  });

  it("대상 종류·대상 검색으로 거른다", async () => {
    const { api } = createFakeApi(auditRoutes());
    renderScreen(<GrantAuditScreen />, { api });
    await screen.findByRole("table", { name: "권한 이력" });

    await choose("대상 종류", "팀");
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent("플랫폼팀");

    await choose("대상 종류", "전체 대상");
    await userEvent.type(screen.getByRole("textbox", { name: "대상 검색" }), "박지");
    expect(bodyRows()).toHaveLength(2);
  });

  it("행위자 필터는 이름으로 고르고, 맞는 것이 없으면 빈 상태를 보인다", async () => {
    const { api } = createFakeApi(auditRoutes());
    renderScreen(<GrantAuditScreen />, { api });
    await screen.findByRole("table", { name: "권한 이력" });
    await screen.findAllByText("최유진");

    await choose("행위자", "최유진");
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent("플랫폼팀");

    await userEvent.type(screen.getByRole("textbox", { name: "대상 검색" }), "박지민");
    expect(await screen.findByText("조건에 맞는 기록이 없습니다")).toBeInTheDocument();
  });

  it("20건이 넘으면 페이지로 나누고, 필터를 바꾸면 첫 페이지로 돌아간다", async () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      ...AUDIT[0],
      id: String(100 + i),
      targetLabel: i < 5 ? `팀원${i}` : `사람${i}`,
      createdAt: ago((i + 1) * HOUR),
    }));
    const { api } = createFakeApi(auditRoutes({ "GET /api/org/grants/audit": () => many }));
    renderScreen(<GrantAuditScreen />, { api });
    await screen.findByRole("table", { name: "권한 이력" });

    expect(bodyRows()).toHaveLength(20);
    expect(screen.getByText("1–20 / 총 25")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByText("21–25 / 총 25")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("textbox", { name: "대상 검색" }), "사람");
    expect(screen.getByText("1–20 / 총 20")).toBeInTheDocument();
  });

  it("서버 상한(100건)에 닿으면 더 오래된 기록은 안 보인다고 알린다", async () => {
    const full = Array.from({ length: 100 }, (_, i) => ({ ...AUDIT[0], id: String(i) }));
    const { api } = createFakeApi(auditRoutes({ "GET /api/org/grants/audit": () => full }));
    renderScreen(<GrantAuditScreen />, { api });
    await screen.findByRole("table", { name: "권한 이력" });

    expect(screen.getByText(/최근 100건까지만 보입니다/)).toBeInTheDocument();
  });

  it("기록이 없으면 빈 상태를 보인다", async () => {
    const { api } = createFakeApi(auditRoutes({ "GET /api/org/grants/audit": () => [] }));
    renderScreen(<GrantAuditScreen />, { api });

    expect(await screen.findByText("권한 변경 기록이 없습니다")).toBeInTheDocument();
  });

  it("서버가 403이면 그 문구(권한이 없습니다)를 그대로 보이고 다시 시도할 수 있다", async () => {
    const { api } = createFakeApi(
      auditRoutes({ "GET /api/org/grants/audit": () => new FakeError(403, "권한이 없습니다") }),
    );
    renderScreen(<GrantAuditScreen />, { api });

    expect(await screen.findByRole("alert")).toHaveTextContent("권한이 없습니다");
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("전역 관리자가 아니면 이력을 읽지 않고 안내만 보여 준다", async () => {
    const { api, calls } = createFakeApi(auditRoutes());
    renderScreen(<GrantAuditScreen />, { api, currentUser: PLAIN_USER });

    expect(
      await screen.findByText("권한 이력은 전역 관리자만 볼 수 있습니다"),
    ).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });
});
