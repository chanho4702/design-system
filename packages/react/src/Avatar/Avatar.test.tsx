import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("src가 있으면 name을 alt로 가진 이미지를 렌더링한다", () => {
    render(<Avatar name="김찬호" src="https://example.com/me.png" />);
    expect(screen.getByRole("img", { name: "김찬호" })).toHaveAttribute(
      "src",
      "https://example.com/me.png",
    );
  });

  it("src가 없으면 한 단어 이름의 첫 글자를 이니셜로 보여준다", () => {
    render(<Avatar name="김찬호" />);
    expect(screen.getByText("김")).toBeInTheDocument();
  });

  it("src가 없으면 여러 단어 이름의 첫·마지막 단어 첫 글자를 대문자 이니셜로 보여준다", () => {
    render(<Avatar name="chanho kim" />);
    expect(screen.getByText("CK")).toBeInTheDocument();
  });

  it("소비자 className이 병합된다", () => {
    const { container } = render(<Avatar name="김찬호" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
