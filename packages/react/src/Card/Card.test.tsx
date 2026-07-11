import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("자식 내용을 렌더링한다", () => {
    render(<Card>본문</Card>);
    expect(screen.getByText("본문")).toBeInTheDocument();
  });

  it("title을 제목으로 렌더링한다", () => {
    render(<Card title="요약">본문</Card>);
    expect(screen.getByRole("heading", { name: "요약" })).toBeInTheDocument();
  });

  it("headerActions 슬롯을 렌더링한다", () => {
    render(
      <Card title="요약" headerActions={<button type="button">더보기</button>}>
        본문
      </Card>,
    );
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
  });

  it("interactive면 button으로 렌더되고 클릭 시 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(
      <Card interactive onClick={onClick}>
        본문
      </Card>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("기본은 button 역할이 아니다", () => {
    render(<Card>본문</Card>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("소비자 className이 루트에 병합된다", () => {
    const { container } = render(<Card className="custom">본문</Card>);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("ref로 루트 DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>본문</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
