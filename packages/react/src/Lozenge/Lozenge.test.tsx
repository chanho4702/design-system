import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Lozenge } from "./Lozenge";

describe("Lozenge", () => {
  it("자식 텍스트를 렌더링한다", () => {
    render(<Lozenge>진행 중</Lozenge>);
    expect(screen.getByText("진행 중")).toBeInTheDocument();
  });

  it("소비자 className이 병합된다", () => {
    render(<Lozenge className="custom">완료</Lozenge>);
    expect(screen.getByText("완료")).toHaveClass("custom");
  });

  it("ref로 span DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Lozenge ref={ref}>완료</Lozenge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
