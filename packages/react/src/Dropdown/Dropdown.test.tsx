// Dropdown은 Radix 합성 컴포넌트를 감싼 복합 루트라 ref를 노출하지 않는다 (공통 테스트 ref 예외).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

function Subject(props: {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  className?: string;
}) {
  return (
    <Dropdown
      trigger={<button type="button">더보기</button>}
      className={props.className}
      items={[
        { label: "수정", onSelect: props.onEdit },
        { label: "삭제", onSelect: props.onDelete, danger: true, disabled: props.deleteDisabled },
      ]}
    />
  );
}

describe("Dropdown", () => {
  it("트리거를 클릭하면 메뉴와 항목들이 표시된다", async () => {
    render(<Subject />);
    await userEvent.click(screen.getByRole("button", { name: "더보기" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "수정" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "삭제" })).toBeInTheDocument();
  });

  it("항목을 클릭하면 onSelect가 호출되고 메뉴가 닫힌다", async () => {
    const onEdit = vi.fn();
    render(<Subject onEdit={onEdit} />);
    await userEvent.click(screen.getByRole("button", { name: "더보기" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "수정" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("disabled 항목은 클릭해도 onSelect가 호출되지 않는다", async () => {
    const onDelete = vi.fn();
    render(<Subject onDelete={onDelete} deleteDisabled />);
    await userEvent.click(screen.getByRole("button", { name: "더보기" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "삭제" }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("Escape를 누르면 메뉴가 닫힌다", async () => {
    render(<Subject />);
    await userEvent.click(screen.getByRole("button", { name: "더보기" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("소비자 className이 메뉴 콘텐츠에 병합된다", async () => {
    render(<Subject className="custom" />);
    await userEvent.click(screen.getByRole("button", { name: "더보기" }));
    expect(screen.getByRole("menu")).toHaveClass("custom");
  });

  it("항목 아이콘과 구분선을 렌더링한다", async () => {
    render(
      <Dropdown
        trigger={<button type="button">더보기</button>}
        items={[
          { label: "복제", icon: <span data-testid="copy-icon" /> },
          { separator: true },
          { label: "삭제", danger: true },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "더보기" }));
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "복제" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "삭제" })).toBeInTheDocument();
  });
});
