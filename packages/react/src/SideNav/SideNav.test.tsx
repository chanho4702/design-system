import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SideNav } from "./SideNav";

const ITEMS = [
  { id: "dashboard", label: "대시보드" },
  { id: "issues", label: "이슈", badge: 12 },
  { id: "board", label: "보드" },
];

function noop() {}

describe("SideNav", () => {
  it("접근 가능 이름을 가진 nav와 항목들을 렌더링한다", () => {
    render(
      <SideNav
        items={ITEMS}
        activeId="issues"
        collapsed={false}
        onToggleCollapse={noop}
      />,
    );
    expect(screen.getByRole("navigation", { name: "주 내비게이션" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("활성 항목에 aria-current='page'가 설정된다", () => {
    render(
      <SideNav items={ITEMS} activeId="issues" collapsed={false} onToggleCollapse={noop} />,
    );
    expect(screen.getByRole("link", { name: /이슈/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "대시보드" })).not.toHaveAttribute("aria-current");
  });

  it("badge 값을 표시한다", () => {
    render(
      <SideNav items={ITEMS} activeId="issues" collapsed={false} onToggleCollapse={noop} />,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("항목 클릭 시 onSelect가 id로 호출되고 기본 이동이 막힌다", async () => {
    const onSelect = vi.fn();
    render(
      <SideNav
        items={ITEMS}
        activeId="issues"
        onSelect={onSelect}
        collapsed={false}
        onToggleCollapse={noop}
      />,
    );
    await userEvent.click(screen.getByRole("link", { name: "대시보드" }));
    expect(onSelect).toHaveBeenCalledWith("dashboard");
  });

  it("접기 버튼은 상태에 맞는 라벨과 aria-expanded를 노출하고 클릭 시 콜백을 호출한다", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <SideNav items={ITEMS} activeId="issues" collapsed={false} onToggleCollapse={onToggle} />,
    );
    const collapseBtn = screen.getByRole("button", { name: "사이드바 접기" });
    expect(collapseBtn).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(collapseBtn);
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(
      <SideNav items={ITEMS} activeId="issues" collapsed onToggleCollapse={onToggle} />,
    );
    const expandBtn = screen.getByRole("button", { name: "사이드바 펼치기" });
    expect(expandBtn).toHaveAttribute("aria-expanded", "false");
  });
});
