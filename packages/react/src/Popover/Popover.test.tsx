import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("트리거를 누르면 이름을 가진 dialog가 열리고 첫 포커스 요소로 포커스가 간다", async () => {
    render(
      <Popover trigger={<button type="button">필터</button>} label="필터 설정">
        <button type="button">적용</button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "필터" }));
    expect(screen.getByRole("dialog", { name: "필터 설정" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "적용" })).toHaveFocus();
  });

  it("Esc로 닫히고 트리거로 포커스가 돌아온다", async () => {
    render(
      <Popover trigger={<button type="button">필터</button>} label="필터 설정">
        <button type="button">적용</button>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "필터" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("initialFocusRef로 첫 포커스 대상을 정한다", async () => {
    function Demo() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <Popover trigger={<button type="button">검색</button>} label="검색 창" initialFocusRef={ref}>
          <button type="button">닫기</button>
          <input ref={ref} aria-label="검색어" />
        </Popover>
      );
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole("button", { name: "검색" }));
    expect(screen.getByRole("textbox", { name: "검색어" })).toHaveFocus();
  });

  it("className이 콘텐츠에 병합된다(제어형 open)", () => {
    render(
      <Popover open trigger={<button type="button">열기</button>} label="내용" className="custom">
        내용
      </Popover>,
    );
    expect(screen.getByRole("dialog", { name: "내용" })).toHaveClass("custom");
  });
});
