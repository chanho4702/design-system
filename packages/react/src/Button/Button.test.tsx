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

  it("loading이면 클릭이 차단되고 aria-busy가 설정된다", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        저장
      </Button>,
    );
    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading이 아니면 aria-busy가 붙지 않는다", () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });

  it("secondary/ghost 등 새 variant를 렌더링할 수 있다", () => {
    render(
      <>
        <Button variant="secondary">보조</Button>
        <Button variant="ghost">고스트</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "보조" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "고스트" })).toBeInTheDocument();
  });

  it("large size와 fullWidth 프롭을 받는다", () => {
    render(
      <Button size="large" fullWidth>
        큰 버튼
      </Button>,
    );
    expect(screen.getByRole("button", { name: "큰 버튼" })).toBeInTheDocument();
  });

  it("iconBefore를 텍스트 앞에 렌더링한다", () => {
    render(<Button iconBefore={<span data-testid="icon" />}>저장</Button>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("iconOnly면 aria-label로 접근 가능한 이름을 갖고 아이콘을 렌더링한다", () => {
    render(
      <Button iconOnly aria-label="편집">
        <span data-testid="pencil" />
      </Button>,
    );
    expect(screen.getByRole("button", { name: "편집" })).toBeInTheDocument();
    expect(screen.getByTestId("pencil")).toBeInTheDocument();
  });

  it("iconOnly + loading이면 스피너로 대체되고 클릭이 차단된다", async () => {
    const onClick = vi.fn();
    render(
      <Button iconOnly aria-label="저장" loading onClick={onClick} iconBefore={<span data-testid="save" />} />,
    );
    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toBeDisabled();
    expect(screen.queryByTestId("save")).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
