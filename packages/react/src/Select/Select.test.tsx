// Select는 Radix 합성 컴포넌트를 감싼 복합 루트라 ref를 노출하지 않는다
// (공통 테스트 3종 중 ref 테스트 예외 — Global Constraints 참조).
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const OPTIONS = [
  { value: "high", label: "높음" },
  { value: "medium", label: "보통" },
  { value: "low", label: "낮음" },
];

describe("Select", () => {
  it("라벨을 접근 가능 이름으로 가진 combobox로 렌더링된다", () => {
    render(<Select label="우선순위" options={OPTIONS} placeholder="선택" />);
    expect(screen.getByRole("combobox", { name: "우선순위" })).toBeInTheDocument();
  });

  it("트리거를 클릭하면 옵션 목록이 열린다", async () => {
    render(<Select label="우선순위" options={OPTIONS} placeholder="선택" />);
    await userEvent.click(screen.getByRole("combobox", { name: "우선순위" }));
    expect(screen.getByRole("option", { name: "높음" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("옵션을 선택하면 onValueChange가 호출되고 트리거에 라벨이 표시된다", async () => {
    const onValueChange = vi.fn();
    render(
      <Select label="우선순위" options={OPTIONS} placeholder="선택" onValueChange={onValueChange} />,
    );
    const trigger = screen.getByRole("combobox", { name: "우선순위" });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "보통" }));
    expect(onValueChange).toHaveBeenCalledWith("medium");
    expect(trigger).toHaveTextContent("보통");
  });

  it("defaultValue가 트리거에 표시된다", () => {
    render(<Select label="우선순위" options={OPTIONS} defaultValue="low" />);
    expect(screen.getByRole("combobox", { name: "우선순위" })).toHaveTextContent("낮음");
  });

  it("disabled면 트리거가 비활성화된다", () => {
    render(<Select label="우선순위" options={OPTIONS} disabled />);
    expect(screen.getByRole("combobox", { name: "우선순위" })).toBeDisabled();
  });

  it("소비자 className이 루트 래퍼에 병합된다", () => {
    const { container } = render(
      <Select label="우선순위" options={OPTIONS} className="custom" />,
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("disabled 옵션은 클릭해도 선택되지 않는다", async () => {
    const onValueChange = vi.fn();
    render(
      <Select
        label="우선순위"
        options={[
          { value: "high", label: "높음" },
          { value: "low", label: "낮음", disabled: true },
        ]}
        placeholder="선택"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "우선순위" }));
    await userEvent.click(screen.getByRole("option", { name: "낮음" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("옵션 icon이 목록과 트리거의 선택값 양쪽에 렌더된다", async () => {
    const ICON_OPTIONS = [
      { value: "epic", label: "에픽", icon: <span data-icon="epic" /> },
      { value: "story", label: "스토리", icon: <span data-icon="story" /> },
    ];
    render(<Select label="이슈 타입" options={ICON_OPTIONS} placeholder="선택" />);
    const trigger = screen.getByRole("combobox", { name: "이슈 타입" });
    await userEvent.click(trigger);
    const epic = screen.getByRole("option", { name: "에픽" });
    expect(epic.querySelector('[data-icon="epic"]')).toBeInTheDocument();

    await userEvent.click(screen.getByRole("option", { name: "스토리" }));
    expect(trigger).toHaveTextContent("스토리");
    expect(trigger.querySelector('[data-icon="story"]')).toBeInTheDocument();
    expect(trigger.querySelector('[data-icon="epic"]')).not.toBeInTheDocument();
  });

  it("icon이 없는 옵션은 트리거에 아이콘 없이 라벨만 남는다", () => {
    const { container } = render(
      <Select label="우선순위" options={OPTIONS} defaultValue="low" />,
    );
    const trigger = screen.getByRole("combobox", { name: "우선순위" });
    expect(trigger).toHaveTextContent("낮음");
    expect(container.querySelectorAll("[data-icon]")).toHaveLength(0);
  });

  it("group이 있는 옵션은 그룹 제목 아래 묶이고 제목은 선택지가 아니다", async () => {
    render(
      <Select
        label="담당자"
        placeholder="선택"
        options={[
          { value: "me", label: "나", group: "추천" },
          { value: "a", label: "김철수", group: "전체" },
          { value: "b", label: "이영희", group: "전체" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "담당자" }));
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByText("추천")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "전체" })).toBeInTheDocument();
  });

  it("긴 옵션 라벨은 title로 전체 문구를 노출한다", async () => {
    const long = "아주 긴 한글 옵션 라벨이 들어가서 말줄임되는 경우";
    render(<Select label="상태" options={[{ value: "x", label: long }]} placeholder="선택" />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    expect(screen.getByRole("option", { name: long })).toHaveAttribute("title", long);
  });
});

describe("Select searchable", () => {
  const MANY = [
    { value: "todo", label: "할 일" },
    { value: "doing", label: "진행 중" },
    { value: "review", label: "검토 중", disabled: true },
    { value: "done", label: "완료" },
  ];

  it("열면 검색 입력에 포커스가 가고, 입력한 글자로 옵션이 걸러진다", async () => {
    render(<Select label="상태" options={MANY} placeholder="선택" searchable />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    const search = screen.getByRole("combobox", { name: "상태 검색" });
    expect(search).toHaveFocus();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    await userEvent.type(search, "중");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["진행 중", "검토 중"]);
  });

  it("↓·Enter로 고르면 onValueChange가 불리고 트리거에 값이 남으며 포커스가 트리거로 돌아온다", async () => {
    const onValueChange = vi.fn();
    render(<Select label="상태" options={MANY} placeholder="선택" searchable onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("doing");
    expect(trigger).toHaveTextContent("진행 중");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("한글 조합을 끝내는 Enter(isComposing)로는 옵션을 고르지 않는다", async () => {
    const onValueChange = vi.fn();
    render(<Select label="상태" options={MANY} searchable onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    const search = screen.getByRole("combobox", { name: "상태 검색" });
    fireEvent.keyDown(search, { key: "Enter", isComposing: true });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("비활성 옵션은 키보드 이동에서 건너뛰고 End는 마지막 활성 옵션으로 간다", async () => {
    const onValueChange = vi.fn();
    render(<Select label="상태" options={MANY} searchable onValueChange={onValueChange} defaultValue="doing" />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    const search = screen.getByRole("combobox", { name: "상태 검색" });
    // 현재 값(진행 중)에서 시작 → ↓는 비활성 '검토 중'을 건너뛰고 '완료'
    await userEvent.keyboard("{ArrowDown}");
    expect(search).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "완료" }).id);
    await userEvent.keyboard("{Home}");
    expect(search).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "할 일" }).id);
    await userEvent.keyboard("{End}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("done");
  });

  it("현재 값 옵션은 aria-selected이고, 결과가 없으면 안내 문구를 보인다", async () => {
    render(<Select label="상태" options={MANY} searchable defaultValue="done" />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    expect(screen.getByRole("option", { name: "완료" })).toHaveAttribute("aria-selected", "true");
    await userEvent.type(screen.getByRole("combobox", { name: "상태 검색" }), "없는값");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("일치하는 항목이 없습니다")).toBeInTheDocument();
  });

  it("Esc로 닫으면 선택 없이 트리거로 포커스가 돌아온다", async () => {
    const onValueChange = vi.fn();
    render(<Select label="상태" options={MANY} searchable onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("트리거에서 ↓를 누르면 목록이 열린다", async () => {
    render(<Select label="상태" options={MANY} searchable />);
    screen.getByRole("combobox", { name: "상태" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox", { name: "상태" })).toBeInTheDocument();
  });

  it("disabled 옵션은 클릭해도 선택되지 않는다", async () => {
    const onValueChange = vi.fn();
    render(<Select label="상태" options={MANY} searchable onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    await userEvent.click(screen.getByRole("option", { name: "검토 중" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("size=compact면 트리거에 compact 클래스가 붙는다(검색형도 같다)", () => {
    const { rerender } = render(<Select label="상태" options={MANY} size="compact" />);
    expect(screen.getByRole("combobox", { name: "상태" }).className).toMatch(/compact/);
    rerender(<Select label="상태" options={MANY} size="compact" searchable />);
    expect(screen.getByRole("combobox", { name: "상태" }).className).toMatch(/compact/);
  });
});
