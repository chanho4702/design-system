// 등장·퇴장 모션 배선 — 오버레이가 공유 모션 클래스를 달고, 닫힐 때 퇴장 애니메이션 때문에
// 테스트(jsdom)에서 늦게 사라지거나 포커스 복귀 순서가 바뀌지 않는지 고정한다.
//
// jsdom 관계: 모션은 `animation` 단축형으로만 선언한다. jsdom은 단축형을 animation-name으로 펼치지 않아
// Radix Presence가 animationName을 "none"으로 읽고 즉시 언마운트한다(실제 브라우저에서는 animationend까지 기다린다).
// 그래서 테스트 환경에서 지속시간을 따로 0으로 만들 필요가 없다 — 이 파일이 그 전제를 지킨다.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../Button/Button";
import { CommandPalette } from "../CommandPalette/CommandPalette";
import { Dropdown } from "../Dropdown/Dropdown";
import { Modal } from "../Modal/Modal";
import { Popover } from "../Popover/Popover";
import { Tooltip } from "../Tooltip/Tooltip";

describe("오버레이 모션", () => {
  it("Dropdown 메뉴는 팝오버 모션을 달고 data-side로 방향을 받는다, 닫으면 바로 사라지고 트리거로 포커스가 온다", async () => {
    render(<Dropdown trigger={<button type="button">더보기</button>} items={[{ label: "수정" }]} />);
    const trigger = screen.getByRole("button", { name: "더보기" });
    await userEvent.click(trigger);
    const menu = screen.getByRole("menu");
    expect(menu.className).toMatch(/popover/);
    expect(menu).toHaveAttribute("data-state", "open");
    expect(menu).toHaveAttribute("data-side");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("Popover는 팝오버 모션을 단다", async () => {
    render(
      <Popover trigger={<button type="button">필터</button>} label="필터 설정">
        <button type="button">적용</button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "필터" }));
    expect(screen.getByRole("dialog", { name: "필터 설정" }).className).toMatch(/popover/);
  });

  it("Tooltip은 툴팁 모션을 단다", async () => {
    render(
      <Tooltip content="설명" delayDuration={0}>
        <button type="button">도움말</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole("button", { name: "도움말" }));
    const tooltip = await screen.findByRole("tooltip");
    // role=tooltip은 Radix의 숨김 복제본이고, 보이는 표면은 data-state를 가진 Content다
    const surface = document.querySelector('[data-side][data-state$="open"]');
    expect(tooltip).toBeInTheDocument();
    expect(surface?.className).toMatch(/tooltip/);
  });

  it("Modal은 블랭킷·대화상자 모션을 달고, Esc로 닫으면 바로 사라지며 트리거로 포커스가 돌아온다", async () => {
    render(<Modal title="설정" trigger={<Button>열기</Button>}>본문</Modal>);
    const trigger = screen.getByRole("button", { name: "열기" });
    await userEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "설정" });
    expect(dialog.className).toMatch(/dialog/);
    expect(document.querySelector('[data-state="open"][class*="blanket"]')).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector('[class*="blanket"]')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("CommandPalette도 대화상자 모션을 단다", () => {
    render(<CommandPalette open onOpenChange={() => {}} items={[{ id: "a", label: "이슈 만들기" }]} />);
    expect(screen.getByRole("dialog").className).toMatch(/dialog/);
  });
});
