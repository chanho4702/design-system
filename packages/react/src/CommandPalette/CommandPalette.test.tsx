import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";
import type { CommandItem, CommandPaletteProps } from "./CommandPalette";

function Harness(props: Partial<CommandPaletteProps> & { items: CommandItem[]; onClose?: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <CommandPalette
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) props.onClose?.();
      }}
      {...props}
    />
  );
}

const ITEMS = (fns: { create?: () => void; status?: (s: string) => void } = {}): CommandItem[] => [
  { id: "create", label: "이슈 만들기", group: "이슈", shortcut: "C", onSelect: fns.create },
  {
    id: "status",
    label: "상태 변경",
    group: "이슈",
    items: [
      { id: "todo", label: "할 일", onSelect: () => fns.status?.("todo") },
      { id: "done", label: "완료", onSelect: () => fns.status?.("done") },
    ],
  },
  { id: "inbox", label: "받은 편지함으로 이동", group: "이동", shortcut: ["G", "I"], keywords: ["inbox"] },
  { id: "archived", label: "보관함", group: "이동", disabled: true },
];

describe("CommandPalette", () => {
  it("열리면 검색 입력에 포커스가 가고 그룹·항목이 보인다", () => {
    render(<Harness items={ITEMS()} />);
    expect(screen.getByRole("dialog", { name: "명령 팔레트" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "명령 팔레트" })).toHaveFocus();
    expect(screen.getByRole("group", { name: "이슈" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("첫 항목이 강조되고 ↓·Enter로 실행하면 닫힌다", async () => {
    const create = vi.fn();
    const onClose = vi.fn();
    render(<Harness items={ITEMS({ create })} onClose={onClose} />);
    const input = screen.getByRole("combobox", { name: "명령 팔레트" });
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "이슈 만들기" }).id);
    await userEvent.keyboard("{Enter}");
    expect(create).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("기본 필터는 라벨·keywords 부분일치이고 결과가 없으면 안내한다", async () => {
    render(<Harness items={ITEMS()} />);
    const input = screen.getByRole("combobox", { name: "명령 팔레트" });
    await userEvent.type(input, "inbox");
    expect(screen.getAllByRole("option").map((o) => o.getAttribute("id") && o.textContent)).toEqual([
      expect.stringContaining("받은 편지함으로 이동"),
    ]);
    await userEvent.clear(input);
    await userEvent.type(input, "없는명령");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent("결과가 없습니다");
  });

  it("filter가 숫자를 돌려주면 점수 순으로 정렬하고 0은 뺀다", async () => {
    const filter = (item: CommandItem) => (item.id === "inbox" ? 10 : item.id === "create" ? 5 : 0);
    render(<Harness items={ITEMS().map((i) => ({ ...i, group: undefined }))} filter={filter} />);
    await userEvent.type(screen.getByRole("combobox", { name: "명령 팔레트" }), "x");
    const names = screen.getAllByRole("option").map((o) => o.textContent ?? "");
    expect(names[0]).toContain("받은 편지함으로 이동");
    expect(names[1]).toContain("이슈 만들기");
    expect(names).toHaveLength(2);
  });

  it("비활성 항목은 건너뛰고 끝에서 처음으로 순환한다", async () => {
    render(<Harness items={ITEMS()} />);
    const input = screen.getByRole("combobox", { name: "명령 팔레트" });
    await userEvent.keyboard("{End}");
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: /받은 편지함/ }).id);
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: /이슈 만들기/ }).id);
  });

  it("하위 페이지: 들어가서 고르고, Esc는 닫지 않고 한 단계 뒤로 간다", async () => {
    const status = vi.fn();
    render(<Harness items={ITEMS({ status })} />);
    await userEvent.click(screen.getByRole("option", { name: /상태 변경/ }));
    expect(screen.getByRole("combobox", { name: "명령 팔레트 — 상태 변경" })).toHaveFocus();
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["할 일", "완료"]);
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /상태 변경/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: /상태 변경/ }));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(status).toHaveBeenCalledWith("done");
  });

  it("하위 페이지 빈 입력에서 Backspace는 뒤로 간다", async () => {
    render(<Harness items={ITEMS()} />);
    await userEvent.click(screen.getByRole("option", { name: /상태 변경/ }));
    await userEvent.keyboard("{Backspace}");
    expect(screen.getByRole("combobox", { name: "명령 팔레트" })).toBeInTheDocument();
  });

  it("최상위에서 Esc는 닫는다", async () => {
    const onClose = vi.fn();
    render(<Harness items={ITEMS()} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("단축키 힌트는 kbd로 보이고 aria-keyshortcuts로 알린다", () => {
    render(<Harness items={ITEMS()} />);
    const inbox = screen.getByRole("option", { name: /받은 편지함/ });
    expect(inbox).toHaveAttribute("aria-keyshortcuts", "G I");
    expect(inbox.querySelectorAll("kbd")).toHaveLength(2);
  });

  it("loading이면 목록 대신 스켈레톤과 로딩 문구를 낸다", () => {
    render(<Harness items={ITEMS()} loading />);
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
  });

  it("onQueryChange로 검색어를 알린다", async () => {
    const onQueryChange = vi.fn();
    render(<Harness items={ITEMS()} onQueryChange={onQueryChange} />);
    await userEvent.type(screen.getByRole("combobox", { name: "명령 팔레트" }), "상");
    expect(onQueryChange).toHaveBeenLastCalledWith("상");
  });
});
