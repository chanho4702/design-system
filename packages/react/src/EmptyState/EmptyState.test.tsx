import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("title과 description을 렌더링한다", () => {
    render(<EmptyState title="항목 없음" description="추가해 보세요" />);
    expect(screen.getByRole("heading", { name: "항목 없음" })).toBeInTheDocument();
    expect(screen.getByText("추가해 보세요")).toBeInTheDocument();
  });

  it("custom media를 렌더링한다", () => {
    render(<EmptyState title="항목 없음" media={<img alt="빈 상자" src="empty.png" />} />);
    expect(screen.getByAltText("빈 상자")).toBeInTheDocument();
  });

  it("primaryAction 버튼 클릭 시 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<EmptyState title="항목 없음" primaryAction={{ label: "추가", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("secondaryAction 버튼 클릭 시 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    render(<EmptyState title="항목 없음" secondaryAction={{ label: "가이드", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "가이드" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("액션이 없으면 버튼을 렌더링하지 않는다", () => {
    render(<EmptyState title="항목 없음" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
