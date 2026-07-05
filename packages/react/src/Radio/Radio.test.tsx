import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Radio, RadioGroup } from "./Radio";

function Priorities(props: { defaultValue?: string }) {
  return (
    <RadioGroup aria-label="우선순위" defaultValue={props.defaultValue}>
      <Radio value="high" label="높음" />
      <Radio value="medium" label="보통" />
      <Radio value="low" label="낮음" />
    </RadioGroup>
  );
}

describe("Radio / RadioGroup", () => {
  it("radiogroup과 라벨 붙은 radio들로 렌더링된다", () => {
    render(<Priorities />);
    expect(screen.getByRole("radiogroup", { name: "우선순위" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "높음" })).toBeInTheDocument();
  });

  it("defaultValue에 해당하는 radio가 선택된 상태다", () => {
    render(<Priorities defaultValue="medium" />);
    expect(screen.getByRole("radio", { name: "보통" })).toBeChecked();
  });

  it("클릭하면 해당 radio가 선택된다", async () => {
    const user = userEvent.setup();
    render(<Priorities />);
    await user.click(screen.getByRole("radio", { name: "낮음" }));
    expect(screen.getByRole("radio", { name: "낮음" })).toBeChecked();
  });

  it("화살표 키로 선택을 이동할 수 있다", async () => {
    render(<Priorities defaultValue="high" />);
    await userEvent.click(screen.getByRole("radio", { name: "높음" }));
    // Radix RadioGroupItemTrigger는 document keydown에서 "화살표 눌림" 플래그를 true로
    // 세팅해두고, 실제 포커스 이동(roving-focus의 setTimeout(() => focusFirst(...)))이
    // 매크로태스크로 완료된 뒤 onFocus에서 그 플래그를 보고 click()을 호출해 선택을 확정한다.
    // ArrowDown을 누르자마자 떼면(userEvent.keyboard의 기본 press+release) keyup이 그
    // 플래그를 false로 되돌리는 시점이 setTimeout 콜백보다 먼저 와 버려 선택이 갱신되지
    // 않는다. 실제 사용자는 키를 누르고 있는 시간이 0ms보다 길기 때문에 이 경쟁이 발생하지
    // 않는다 — 그래서 press와 release 사이에 한 틱을 흘려보내 실제 키 홀드 타이밍을 재현한다.
    await userEvent.keyboard("{ArrowDown>}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await userEvent.keyboard("{/ArrowDown}");
    expect(screen.getByRole("radio", { name: "보통" })).toBeChecked();
  });

  it("소비자 className이 그룹 루트에 병합된다", () => {
    const { container } = render(
      <RadioGroup aria-label="우선순위" className="custom">
        <Radio value="high" label="높음" />
      </RadioGroup>,
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("ref로 radio 버튼 DOM 노드에 접근할 수 있다", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <RadioGroup aria-label="우선순위">
        <Radio value="high" label="높음" ref={ref} />
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
