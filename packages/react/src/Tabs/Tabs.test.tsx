// Tabs는 Radix 합성 컴포넌트를 감싼 복합 루트라 ref를 노출하지 않는다 (공통 테스트 ref 예외).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

  it("label에 노드를 넣으면 그대로 렌더링되고 ariaLabel이 접근 이름이 된다", () => {
    render(
      <Tabs
        label="필드 구성"
        items={[
          {
            value: "bug",
            label: (
              <>
                버그 <span aria-hidden="true">●</span>
              </>
            ),
            ariaLabel: "버그 (덮어씀)",
            content: <p>버그 필드</p>,
          },
          { value: "task", label: "작업", content: <p>작업 필드</p> },
        ]}
      />,
    );
    expect(screen.getByRole("tab", { name: "버그 (덮어씀)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "버그 (덮어씀)" })).toHaveTextContent("버그");
  });

  it("ariaLabel이 없으면 라벨 노드의 텍스트가 접근 이름이 된다", () => {
    render(
      <Tabs
        label="필드 구성"
        items={[{ value: "bug", label: <span>버그</span>, content: <p>버그 필드</p> }]}
      />,
    );
    expect(screen.getByRole("tab", { name: "버그" })).toBeInTheDocument();
  });

  describe("움직이는 선택 밑줄", () => {
    // jsdom은 레이아웃이 없어 offset*이 0이다 — 탭 폭·위치를 흉내 낸다(탭 순서대로 100px씩).
    function mockLayout() {
      const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
        return this.getAttribute("role") === "tab" ? 100 : 0;
      });
      const left = vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") !== "tab") return 0;
        return Array.from(this.parentElement?.querySelectorAll('[role="tab"]') ?? []).indexOf(this) * 100;
      });
      return () => {
        width.mockRestore();
        left.mockRestore();
      };
    }

    it("측정할 수 없으면(폭 0) 밑줄 요소 없이 선택 탭 자체 밑줄로 그린다", () => {
      render(<Tabs label="이슈 상세" items={ITEMS} />);
      expect(screen.getByRole("tablist")).not.toHaveAttribute("data-indicator");
    });

    it("선택 탭 위치에 밑줄을 그리고, 첫 배치는 애니메이션 없이 — 탭을 바꾸면 그 자리로 미끄러진다", async () => {
      const restore = mockLayout();
      try {
        const { container } = render(<Tabs label="이슈 상세" items={ITEMS} />);
        const list = screen.getByRole("tablist");
        expect(list).toHaveAttribute("data-indicator");
        const bar = container.querySelector<HTMLElement>('[class*="indicator"]');
        expect(bar).toHaveAttribute("aria-hidden", "true");
        expect(bar?.style.getPropertyValue("--_chanho-tabs-indicator-x")).toBe("0px");
        expect(bar?.style.getPropertyValue("--_chanho-tabs-indicator-w")).toBe("100px");
        expect(bar).not.toHaveAttribute("data-animate");

        await userEvent.click(screen.getByRole("tab", { name: "활동" }));
        expect(bar?.style.getPropertyValue("--_chanho-tabs-indicator-x")).toBe("200px");
        expect(bar).toHaveAttribute("data-animate");
        // 밑줄은 접근성 트리에 나오지 않는다 — 탭 목록의 탭 수 그대로
        expect(screen.getAllByRole("tab")).toHaveLength(3);
      } finally {
        restore();
      }
    });

    it("제어형 value가 바뀌어도 밑줄이 따라간다", () => {
      const restore = mockLayout();
      try {
        const { container, rerender } = render(<Tabs label="이슈 상세" items={ITEMS} value="overview" />);
        rerender(<Tabs label="이슈 상세" items={ITEMS} value="settings" />);
        const bar = container.querySelector<HTMLElement>('[class*="indicator"]');
        expect(bar?.style.getPropertyValue("--_chanho-tabs-indicator-x")).toBe("100px");
      } finally {
        restore();
      }
    });
  });
});
