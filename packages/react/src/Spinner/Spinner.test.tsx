import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it('role="status"로 노출되어 스크린리더가 인지한다', () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('기본 접근성 라벨은 "로딩 중"이다', () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAccessibleName("로딩 중");
  });

  it("label로 접근성 라벨을 바꿀 수 있다", () => {
    render(<Spinner label="저장하는 중" />);
    expect(screen.getByRole("status")).toHaveAccessibleName("저장하는 중");
  });
});
