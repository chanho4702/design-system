import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("자식 텍스트를 렌더링한다", () => {
    render(<Badge>3</Badge>);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("소비자 className이 병합된다", () => {
    render(<Badge className="custom">3</Badge>);
    expect(screen.getByText("3")).toHaveClass("custom");
  });

  it("ref로 span DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>3</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
