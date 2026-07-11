import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("progressbar role과 aria-label을 가진다", () => {
    render(<ProgressBar label="업로드" value={40} />);
    expect(screen.getByRole("progressbar", { name: "업로드" })).toBeInTheDocument();
  });

  it("value가 aria-valuenow에 반영된다", () => {
    render(<ProgressBar label="업로드" value={40} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("value를 0~100 범위로 제한한다", () => {
    const { rerender } = render(<ProgressBar label="업로드" value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<ProgressBar label="업로드" value={-20} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("indeterminate면 aria-valuenow가 없다", () => {
    render(<ProgressBar label="로딩" indeterminate />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });

  it("소비자 className이 루트에 병합된다", () => {
    const { container } = render(<ProgressBar label="업로드" value={40} className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
