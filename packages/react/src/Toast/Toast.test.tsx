// ToastProvider/useToast는 Context 기반 합성이라 ref를 노출하지 않는다 (공통 테스트 ref 예외).
// className은 개별 토스트가 아닌 Provider 관할이라 className 병합 테스트도 해당 없음 — 대신
// appearance가 data-appearance 속성으로 노출되는지를 계약으로 검증한다.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";

function Demo() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        toast({ title: "저장됨", description: "변경 사항이 저장되었습니다", appearance: "success" })
      }
    >
      알림 발생
    </button>
  );
}

function Broken() {
  useToast();
  return null;
}

describe("Toast", () => {
  it("ToastProvider 밖에서 useToast를 쓰면 명확한 에러를 던진다", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Broken />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });

  it("toast를 호출하면 제목·설명이 표시되고 appearance가 노출된다", async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "알림 발생" }));
    expect(screen.getByText("저장됨")).toBeInTheDocument();
    expect(screen.getByText("변경 사항이 저장되었습니다")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("data-appearance", "success");
  });

  it("닫기 버튼을 클릭하면 토스트가 사라진다", async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "알림 발생" }));
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    await waitFor(() => expect(screen.queryByText("저장됨")).not.toBeInTheDocument());
  });

  it("여러 번 호출하면 토스트가 쌓인다", async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "알림 발생" }));
    await userEvent.click(screen.getByRole("button", { name: "알림 발생" }));
    expect(screen.getAllByText("저장됨")).toHaveLength(2);
  });
});
