// Modal은 Radix Dialog 합성을 감싼 복합 루트라 ref를 노출하지 않는다 (공통 테스트 ref 예외).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Modal } from "./Modal";

function Subject(props: { className?: string; description?: string }) {
  return (
    <Modal
      trigger={<button type="button">열기</button>}
      title="이슈 삭제"
      description={props.description}
      className={props.className}
    >
      <p>본문 내용</p>
    </Modal>
  );
}

describe("Modal", () => {
  it("트리거를 클릭하면 제목을 접근 가능 이름으로 가진 dialog가 열린다", async () => {
    render(<Subject />);
    await userEvent.click(screen.getByRole("button", { name: "열기" }));
    expect(screen.getByRole("dialog", { name: "이슈 삭제" })).toBeInTheDocument();
    expect(screen.getByText("본문 내용")).toBeInTheDocument();
  });

  it("description이 dialog의 접근 가능 설명으로 연결된다", async () => {
    render(<Subject description="이 작업은 되돌릴 수 없습니다" />);
    await userEvent.click(screen.getByRole("button", { name: "열기" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "이 작업은 되돌릴 수 없습니다",
    );
  });

  it("닫기 버튼을 클릭하면 dialog가 닫힌다", async () => {
    render(<Subject />);
    await userEvent.click(screen.getByRole("button", { name: "열기" }));
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Escape를 누르면 dialog가 닫힌다", async () => {
    render(<Subject />);
    await userEvent.click(screen.getByRole("button", { name: "열기" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("소비자 className이 콘텐츠 패널에 병합된다", async () => {
    render(<Subject className="custom" />);
    await userEvent.click(screen.getByRole("button", { name: "열기" }));
    expect(screen.getByRole("dialog")).toHaveClass("custom");
  });

  it("열리면 포커스가 dialog 안에 갇히고, 닫으면 트리거로 돌아온다", async () => {
    render(
      <Modal trigger={<button type="button">열기</button>} title="이슈 삭제">
        <button type="button">확인</button>
      </Modal>,
    );
    const trigger = screen.getByRole("button", { name: "열기" });
    await userEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    // 포커스가 dialog 내부에 있다
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    // Tab을 여러 번 눌러도 포커스는 dialog 밖으로 나가지 않는다 (트랩)
    await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    // 닫으면 포커스가 트리거로 복귀한다
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
