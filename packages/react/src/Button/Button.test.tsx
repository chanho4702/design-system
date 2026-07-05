import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("자식을 가진 접근 가능한 button으로 렌더링된다", () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>저장</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled면 클릭해도 onClick이 호출되지 않는다", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        저장
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('form 안에서 실수로 submit되지 않도록 type 기본값이 "button"이다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("ref로 실제 button DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>저장</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("소비자가 넘긴 className이 컴포넌트 클래스와 병합되어 유지된다", () => {
    render(<Button className="custom">저장</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom");
  });
});
