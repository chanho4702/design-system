// Tabs는 Radix 합성 컴포넌트를 감싼 복합 루트라 ref를 노출하지 않는다 (공통 테스트 ref 예외).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";

const ITEMS = [
  { value: "overview", label: "개요", content: <p>개요 내용</p> },
  { value: "settings", label: "설정", content: <p>설정 내용</p> },
  { value: "activity", label: "활동", content: <p>활동 내용</p> },
];

describe("Tabs", () => {
  it("접근 가능 이름을 가진 tablist와 탭들이 렌더링된다", () => {
    render(<Tabs label="이슈 상세" items={ITEMS} />);
    expect(screen.getByRole("tablist", { name: "이슈 상세" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("기본으로 첫 탭이 선택되고 해당 패널만 보인다", () => {
    render(<Tabs label="이슈 상세" items={ITEMS} />);
    expect(screen.getByRole("tab", { name: "개요" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("개요 내용")).toBeInTheDocument();
    expect(screen.queryByText("설정 내용")).not.toBeInTheDocument();
  });

  it("다른 탭을 클릭하면 패널이 전환된다", async () => {
    render(<Tabs label="이슈 상세" items={ITEMS} />);
    await userEvent.click(screen.getByRole("tab", { name: "설정" }));
    expect(screen.getByText("설정 내용")).toBeInTheDocument();
    expect(screen.queryByText("개요 내용")).not.toBeInTheDocument();
  });

  it("화살표 키로 탭을 이동할 수 있다", async () => {
    render(<Tabs label="이슈 상세" items={ITEMS} />);
    await userEvent.click(screen.getByRole("tab", { name: "개요" }));
    // Radix roving-focus는 포커스 이동을 setTimeout으로 미루므로 실사용자처럼
    // 키를 누른 채 한 틱 기다렸다 뗀다 (Radio.test.tsx의 동일 사건 참조).
    await userEvent.keyboard("{ArrowRight>}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await userEvent.keyboard("{/ArrowRight}");
    expect(screen.getByRole("tab", { name: "설정" })).toHaveAttribute("aria-selected", "true");
  });

  it("소비자 className이 루트에 병합된다", () => {
    const { container } = render(<Tabs label="이슈 상세" items={ITEMS} className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
