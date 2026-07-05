import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("라벨을 접근 가능 이름으로 가진 switch로 렌더링된다", () => {
    render(<Switch label="알림 받기" />);
    expect(screen.getByRole("switch", { name: "알림 받기" })).toBeInTheDocument();
  });

  it("클릭하면 켜지고 onCheckedChange가 호출된다", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="알림 받기" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "알림 받기" });
    await userEvent.click(sw);
    expect(sw).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("disabled면 클릭해도 켜지지 않는다", async () => {
    render(<Switch label="알림 받기" disabled />);
    const sw = screen.getByRole("switch", { name: "알림 받기" });
    await userEvent.click(sw);
    expect(sw).not.toBeChecked();
  });

  it("소비자 className이 루트 래퍼에 병합된다", () => {
    const { container } = render(<Switch label="알림 받기" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("ref로 switch 버튼 DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch label="알림 받기" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
