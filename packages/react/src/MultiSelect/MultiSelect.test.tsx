import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./MultiSelect";

const OPTIONS = [
  { value: "todo", label: "할 일" },
  { value: "doing", label: "진행 중" },
  { value: "review", label: "검토 중", disabled: true },
  { value: "done", label: "완료" },
];

describe("MultiSelect", () => {
  it("라벨을 이름으로 가진 combobox이고, 열면 여러 개 고르는 listbox가 뜬다", async () => {
    render(<MultiSelect label="상태" options={OPTIONS} placeholder="전체" />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    expect(trigger).toHaveTextContent("전체");
    await userEvent.click(trigger);
    const list = screen.getByRole("listbox", { name: "상태" });
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("combobox", { name: "상태 검색" })).toHaveFocus();
  });

  it("클릭으로 여러 개를 켜고 끄며, 고를 때 닫히지 않는다", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    await userEvent.click(screen.getByRole("option", { name: "완료" }));
    await userEvent.click(screen.getByRole("option", { name: "할 일" }));
    // 옵션 순서대로 정렬된다
    expect(onValueChange).toHaveBeenLastCalledWith(["todo", "done"]);
    expect(screen.getByRole("option", { name: "할 일" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "할 일" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["done"]);
  });

  it("키보드: 화살표·Enter로 켜고, 비활성 항목은 건너뛴다", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} onValueChange={onValueChange} />);
    screen.getByRole("combobox", { name: "상태" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    // 첫 항목(할 일)이 강조 → 진행 중 → (검토 중 건너뜀) 완료
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["done"]);
  });

  it("검색으로 거르고, 선택 수와 전체 해제를 제공한다", async () => {
    const onValueChange = vi.fn();
    render(
      <MultiSelect label="상태" options={OPTIONS} defaultValue={["todo", "doing"]} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    expect(screen.getByText("2개 선택")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("combobox", { name: "상태 검색" }), "완");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["완료"]);
    await userEvent.click(screen.getByRole("button", { name: "전체 해제" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("button", { name: "전체 해제" })).toBeDisabled();
  });

  it("트리거는 maxChips개까지 칩으로, 나머지는 +N, 전체 목록은 설명으로 알린다", () => {
    render(<MultiSelect label="상태" options={OPTIONS} defaultValue={["todo", "doing", "done"]} maxChips={2} />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    expect(trigger).toHaveTextContent("+1");
    expect(trigger).toHaveAccessibleDescription("3개 선택: 할 일, 진행 중, 완료");
  });

  it("searchable=false면 목록이 포커스를 받고 Space로 켠다", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} searchable={false} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    expect(screen.getByRole("listbox", { name: "상태" })).toHaveFocus();
    await userEvent.keyboard("[Space]");
    expect(onValueChange).toHaveBeenLastCalledWith(["todo"]);
  });

  it("Esc로 닫히고 포커스가 트리거로 돌아온다", async () => {
    render(<MultiSelect label="상태" options={OPTIONS} />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("disabled면 트리거가 비활성이다", () => {
    render(<MultiSelect label="상태" options={OPTIONS} disabled />);
    expect(screen.getByRole("combobox", { name: "상태" })).toBeDisabled();
  });
});
