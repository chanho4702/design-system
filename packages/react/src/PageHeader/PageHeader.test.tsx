import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("title을 h1으로 렌더링한다", () => {
    render(<PageHeader title="대시보드" />);
    expect(screen.getByRole("heading", { level: 1, name: "대시보드" })).toBeInTheDocument();
  });

  it("브레드크럼을 접근 가능한 nav로 렌더링한다", () => {
    render(
      <PageHeader
        title="대시보드"
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "대시보드" }]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "현재 위치" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈" })).toHaveAttribute("href", "/");
  });

  it("href가 없는 마지막 항목은 현재 위치로 표시된다", () => {
    render(<PageHeader title="대시보드" breadcrumbs={[{ label: "대시보드" }]} />);
    const current = screen.getByText("대시보드", { selector: "span" });
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("actions 슬롯을 렌더링한다", () => {
    render(<PageHeader title="대시보드" actions={<button type="button">추가</button>} />);
    expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
  });

  it("bottom 슬롯을 렌더링한다", () => {
    render(<PageHeader title="대시보드" bottom={<div>탭 영역</div>} />);
    expect(screen.getByText("탭 영역")).toBeInTheDocument();
  });

  it("브레드크럼이 없으면 nav를 렌더링하지 않는다", () => {
    render(<PageHeader title="대시보드" />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
