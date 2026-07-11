import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Banner } from "./Banner";

describe("Banner", () => {
  it("자식 내용을 렌더링한다", () => {
    render(<Banner>알림 내용</Banner>);
    expect(screen.getByText("알림 내용")).toBeInTheDocument();
  });

  it("기본 variant는 role='status'다", () => {
    render(<Banner>알림</Banner>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("danger variant는 role='alert'다", () => {
    render(<Banner variant="danger">오류</Banner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("action 버튼 클릭 시 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<Banner action={{ label: "새로고침", onClick }}>알림</Banner>);
    await userEvent.click(screen.getByRole("button", { name: "새로고침" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("onDismiss가 있으면 닫기 버튼이 표시되고 클릭 시 호출된다", async () => {
    const onDismiss = vi.fn();
    render(<Banner onDismiss={onDismiss}>알림</Banner>);
    await userEvent.click(screen.getByRole("button", { name: "배너 닫기" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("onDismiss가 없으면 닫기 버튼을 렌더링하지 않는다", () => {
    render(<Banner>알림</Banner>);
    expect(screen.queryByRole("button", { name: "배너 닫기" })).not.toBeInTheDocument();
  });

  it("소비자 className이 루트에 병합된다", () => {
    render(<Banner className="custom">알림</Banner>);
    expect(screen.getByRole("status")).toHaveClass("custom");
  });

  it("ref로 루트 DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Banner ref={ref}>알림</Banner>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
