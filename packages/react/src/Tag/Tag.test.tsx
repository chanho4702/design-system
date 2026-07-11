import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("label 텍스트를 렌더링한다", () => {
    render(<Tag label="디자인" />);
    expect(screen.getByText("디자인")).toBeInTheDocument();
  });

  it("href가 있으면 링크로 렌더링된다", () => {
    render(<Tag label="디자인" href="/tags/design" />);
    const link = screen.getByRole("link", { name: "디자인" });
    expect(link).toHaveAttribute("href", "/tags/design");
  });

  it("onRemove가 없으면 제거 버튼이 없다", () => {
    render(<Tag label="디자인" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("onRemove가 있으면 제거 버튼 클릭 시 호출된다", async () => {
    const onRemove = vi.fn();
    render(<Tag label="디자인" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "디자인 태그 제거" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("소비자 className이 루트에 병합된다", () => {
    const { container } = render(<Tag label="디자인" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
