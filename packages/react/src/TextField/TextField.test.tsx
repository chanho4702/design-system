import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("라벨이 input과 연결되어 라벨 텍스트로 찾을 수 있다", () => {
    render(<TextField label="이메일" />);
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
  });

  it("타이핑한 값이 입력된다", async () => {
    render(<TextField label="이메일" />);
    const input = screen.getByLabelText("이메일");
    await userEvent.type(input, "a@b.c");
    expect(input).toHaveValue("a@b.c");
  });

  it("description이 접근 가능 설명으로 연결된다", () => {
    render(<TextField label="이메일" description="회사 이메일을 입력하세요" />);
    expect(screen.getByLabelText("이메일")).toHaveAccessibleDescription(
      "회사 이메일을 입력하세요",
    );
  });

  it("error가 있으면 aria-invalid가 되고 에러 메시지가 설명으로 연결된다", () => {
    render(<TextField label="이메일" error="필수 항목입니다" />);
    const input = screen.getByLabelText("이메일");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("필수 항목입니다");
  });

  it("소비자 className이 루트 래퍼에 병합된다", () => {
    const { container } = render(<TextField label="이메일" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("ref로 input DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="이메일" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("size=compact면 compact 클래스가 붙고 네이티브 size 속성은 넘기지 않는다", () => {
    render(<TextField label="필터" size="compact" />);
    const input = screen.getByLabelText("필터");
    expect(input.className).toMatch(/compact/);
    expect(input).not.toHaveAttribute("size");
  });

  it("size에 숫자를 주면 예전처럼 네이티브 size 속성으로 넘어간다", () => {
    render(<TextField label="코드" size={6} />);
    expect(screen.getByLabelText("코드")).toHaveAttribute("size", "6");
  });
});
