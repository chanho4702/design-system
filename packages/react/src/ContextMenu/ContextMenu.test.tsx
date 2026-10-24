import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContextMenu } from "./ContextMenu";

function Subject(props: { onCopy?: () => void; onDelete?: () => void; onStatus?: (s: string) => void }) {
  return (
    <ContextMenu
      items={[
        { label: "링크 복사", shortcut: "⌘C", onSelect: props.onCopy },
        { label: "완료 항목 보기", checked: true },
        {
          label: "상태 변경",
          items: [
            { label: "할 일", onSelect: () => props.onStatus?.("todo") },
            { label: "완료", onSelect: () => props.onStatus?.("done") },
          ],
        },
        { separator: true },
        { label: "삭제", danger: true, shortcut: "Del", onSelect: props.onDelete },
      ]}
    >
      <div tabIndex={0}>이슈 행</div>
    </ContextMenu>
  );
}

describe("ContextMenu", () => {
  it("우클릭하면 메뉴가 열리고 항목·구분선이 보인다", () => {
    render(<Subject />);
    fireEvent.contextMenu(screen.getByText("이슈 행"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "링크 복사" })).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("단축키 힌트는 보이되 접근 이름에 섞이지 않고 aria-keyshortcuts로 알린다", () => {
    render(<Subject />);
    fireEvent.contextMenu(screen.getByText("이슈 행"));
    const copy = screen.getByRole("menuitem", { name: "링크 복사" });
    expect(copy).toHaveTextContent("⌘C");
    expect(copy).toHaveAttribute("aria-keyshortcuts", "⌘C");
  });

  it("항목을 고르면 onSelect가 불리고 메뉴가 닫힌다", async () => {
    const onDelete = vi.fn();
    render(<Subject onDelete={onDelete} />);
    fireEvent.contextMenu(screen.getByText("이슈 행"));
    await userEvent.click(screen.getByRole("menuitem", { name: "삭제" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("체크 항목은 menuitemcheckbox로 상태를 알린다", () => {
    render(<Subject />);
    fireEvent.contextMenu(screen.getByText("이슈 행"));
    expect(screen.getByRole("menuitemcheckbox", { name: "완료 항목 보기" })).toHaveAttribute("aria-checked", "true");
  });

  it("하위 메뉴는 →로 열고 그 안의 항목을 고를 수 있다", async () => {
    const onStatus = vi.fn();
    render(<Subject onStatus={onStatus} />);
    fireEvent.contextMenu(screen.getByText("이슈 행"));
    const sub = screen.getByRole("menuitem", { name: "상태 변경" });
    expect(sub).toHaveAttribute("aria-haspopup", "menu");
    sub.focus();
    await userEvent.keyboard("{ArrowRight}");
    const done = await screen.findByRole("menuitem", { name: "완료" });
    await userEvent.click(done);
    expect(onStatus).toHaveBeenCalledWith("done");
  });

  it("Escape로 닫힌다", async () => {
    render(<Subject />);
    fireEvent.contextMenu(screen.getByText("이슈 행"));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("disabled면 우클릭해도 열리지 않는다", () => {
    render(
      <ContextMenu disabled items={[{ label: "복사" }]}>
        <div>영역</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("영역"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
