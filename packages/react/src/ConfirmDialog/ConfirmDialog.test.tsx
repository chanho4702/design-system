import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("open이면 제목·설명과 확인/취소 버튼을 보여준다", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="페이지 삭제"
        description="이 작업은 되돌릴 수 없습니다."
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("dialog", { name: "페이지 삭제" })).toBeInTheDocument();
    expect(screen.getByText("이 작업은 되돌릴 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("확인을 클릭하면 onConfirm이 호출된다", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onOpenChange={() => {}} title="삭제" onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("취소를 클릭하면 onOpenChange(false)가 호출된다", async () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDialog open onOpenChange={onOpenChange} title="삭제" onConfirm={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("confirmLabel/cancelLabel과 danger 확인 버튼을 커스터마이즈한다", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="페이지 삭제"
        confirmLabel="삭제"
        cancelLabel="그만두기"
        danger
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "그만두기" })).toBeInTheDocument();
  });

  it("loading이면 확인 버튼이 aria-busy이고 두 버튼이 잠긴다", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="삭제"
        confirmLabel="삭제"
        loading
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "삭제" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
  });
});
