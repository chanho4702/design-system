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

  it("src가 없어도 스크린리더는 이니셜 대신 이름을 읽는다", () => {
    render(<Avatar name="chanho kim" />);
    expect(screen.getByRole("img", { name: "chanho kim" })).toBeInTheDocument();
  });

  it("공백뿐인 이름도 크래시 없이 빈 아바타를 렌더링한다", () => {
    const { container } = render(<Avatar name="   " />);
    expect(container.textContent).toBe("");
  });

  it("color를 지정해도 이니셜은 그대로 렌더링된다", () => {
    render(<Avatar name="김찬호" color="blue" />);
    expect(screen.getByText("김")).toBeInTheDocument();
  });

  it("color='auto'는 같은 이름에 대해 결정론적으로 같은 클래스를 만든다", () => {
    const a = render(<Avatar name="문서 공간" color="auto" />).container.firstChild as HTMLElement;
    const b = render(<Avatar name="문서 공간" color="auto" />).container.firstChild as HTMLElement;
    expect(a.className).toBe(b.className);
  });

  it("color='auto'는 neutral 기본과 다른 틴트 클래스를 추가한다", () => {
    const neutral = render(<Avatar name="문서 공간" />).container.firstChild as HTMLElement;
    const auto = render(<Avatar name="문서 공간" color="auto" />).container.firstChild as HTMLElement;
    expect(auto.className).not.toBe(neutral.className);
  });
});
