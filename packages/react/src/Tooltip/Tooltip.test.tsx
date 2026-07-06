// Tooltip은 Radix 합성 컴포넌트를 감싼 복합 루트라 ref를 노출하지 않는다 (공통 테스트 ref 예외).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

function Subject(props: { className?: string }) {
  return (
    <Tooltip content="보관된 항목은 삭제할 수 없습니다" delayDuration={0} className={props.className}>
      <button type="button">삭제</button>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("트리거에 호버하면 툴팁 내용이 표시된다", async () => {
    render(<Subject />);
    await userEvent.hover(screen.getByRole("button", { name: "삭제" }));
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("보관된 항목은 삭제할 수 없습니다");
  });

  it("Escape를 누르면 툴팁이 닫힌다", async () => {
    render(<Subject />);
    await userEvent.hover(screen.getByRole("button", { name: "삭제" }));
    await screen.findByRole("tooltip");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("툴팁이 열리면 트리거의 접근 가능 설명이 된다", async () => {
    render(<Subject />);
    const trigger = screen.getByRole("button", { name: "삭제" });
    await userEvent.hover(trigger);
    await screen.findByRole("tooltip");
    expect(trigger).toHaveAccessibleDescription("보관된 항목은 삭제할 수 없습니다");
  });

  it("소비자 className이 툴팁 콘텐츠에 병합된다", async () => {
    render(<Subject className="custom" />);
    await userEvent.hover(screen.getByRole("button", { name: "삭제" }));
    await screen.findByRole("tooltip");
    // Radix Tooltip은 role="tooltip"을 숨김 복제 노드에 붙이고 className은 가시
    // Popper 콘텐츠에 붙인다(이중 노드 구조) — 가시 노드를 직접 조회해 검증한다.
    const content = document.querySelector(".custom");
    expect(content).not.toBeNull();
    expect(content).toHaveTextContent("보관된 항목은 삭제할 수 없습니다");
  });
});
