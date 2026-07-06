// Select는 Radix 합성 컴포넌트를 감싼 복합 루트라 ref를 노출하지 않는다
// (공통 테스트 3종 중 ref 테스트 예외 — Global Constraints 참조).
import { render, screen } from "@testing-library/react";
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
});
