import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("라벨을 접근 가능 이름으로 가진 체크박스로 렌더링된다", () => {
    render(<Checkbox label="동의합니다" />);
    expect(screen.getByRole("checkbox", { name: "동의합니다" })).toBeInTheDocument();
  });

  it("클릭하면 체크 상태가 토글되고 onCheckedChange가 호출된다", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="동의합니다" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "동의합니다" });
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("라벨을 클릭해도 토글된다", async () => {
    render(<Checkbox label="동의합니다" />);
    await userEvent.click(screen.getByText("동의합니다"));
    expect(screen.getByRole("checkbox", { name: "동의합니다" })).toBeChecked();
  });

  it("disabled면 클릭해도 토글되지 않는다", async () => {
    render(<Checkbox label="동의합니다" disabled />);
    const box = screen.getByRole("checkbox", { name: "동의합니다" });
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });

  it("소비자 className이 루트 래퍼에 병합된다", () => {
    const { container } = render(<Checkbox label="동의합니다" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("ref로 체크박스 버튼 DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox label="동의합니다" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
