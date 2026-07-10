import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
  it("라벨이 textarea와 연결된다", () => {
    render(<TextArea label="설명" />);
    expect(screen.getByLabelText("설명")).toBeInTheDocument();
  });

  it("타이핑한 값이 입력된다", async () => {
    const user = userEvent.setup();
    render(<TextArea label="설명" />);
    const textarea = screen.getByLabelText("설명");
    await user.type(textarea, "여러 줄\n입력");
    expect(textarea).toHaveValue("여러 줄\n입력");
  });

  it("description이 접근 가능한 설명으로 연결된다", () => {
    render(<TextArea label="설명" description="마크다운은 지원하지 않습니다" />);
    expect(screen.getByLabelText("설명")).toHaveAccessibleDescription(
      "마크다운은 지원하지 않습니다",
    );
  });

  it("error 지정 시 aria-invalid와 에러 메시지가 연결된다", () => {
    render(<TextArea label="설명" error="필수 항목입니다" />);
    const textarea = screen.getByLabelText("설명");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("필수 항목입니다");
  });

  it("className이 루트 래퍼에 병합된다", () => {
    const { container } = render(<TextArea label="설명" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("ref로 textarea 요소에 접근할 수 있다", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea label="설명" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
