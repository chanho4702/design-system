import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InlineEdit } from "./InlineEdit";

describe("InlineEdit", () => {
  it("보기 모드에서 값과 편집 라벨을 가진 버튼을 렌더링한다", () => {
    render(<InlineEdit label="제목" value="회의록" onSave={vi.fn()} />);
    expect(screen.getByRole("button", { name: "제목 편집" })).toHaveTextContent("회의록");
  });

  it("값이 비면 placeholder를 표시한다", () => {
    render(<InlineEdit label="제목" value="" placeholder="입력하세요" onSave={vi.fn()} />);
    expect(screen.getByText("입력하세요")).toBeInTheDocument();
  });

  it("클릭하면 편집 인풋으로 전환된다", async () => {
    render(<InlineEdit label="제목" value="회의록" onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "제목 편집" }));
    expect(screen.getByLabelText("제목")).toHaveValue("회의록");
  });

  it("값을 바꾸고 Enter로 저장하면 onSave가 트림된 값으로 호출된다", async () => {
    const onSave = vi.fn();
    render(<InlineEdit label="제목" value="회의록" onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "제목 편집" }));
    const input = screen.getByLabelText("제목");
    await userEvent.clear(input);
    await userEvent.type(input, "  새 제목  {Enter}");
    expect(onSave).toHaveBeenCalledWith("새 제목");
    expect(screen.getByRole("button", { name: "제목 편집" })).toBeInTheDocument();
  });

  it("저장 버튼으로도 저장된다", async () => {
    const onSave = vi.fn();
    render(<InlineEdit label="제목" value="회의록" onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "제목 편집" }));
    await userEvent.clear(screen.getByLabelText("제목"));
    await userEvent.type(screen.getByLabelText("제목"), "변경됨");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave).toHaveBeenCalledWith("변경됨");
  });

  it("Escape로 취소하면 onSave가 호출되지 않고 보기 모드로 돌아간다", async () => {
    const onSave = vi.fn();
    render(<InlineEdit label="제목" value="회의록" onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "제목 편집" }));
    await userEvent.type(screen.getByLabelText("제목"), "무시됨{Escape}");
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "제목 편집" })).toBeInTheDocument();
  });

  it("값이 그대로면 저장해도 onSave가 호출되지 않는다", async () => {
    const onSave = vi.fn();
    render(<InlineEdit label="제목" value="회의록" onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "제목 편집" }));
    await userEvent.keyboard("{Enter}");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("disabled면 클릭해도 편집 모드로 전환되지 않는다", async () => {
    render(<InlineEdit label="제목" value="회의록" disabled onSave={vi.fn()} />);
    const button = screen.getByRole("button", { name: "제목 편집" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(screen.queryByLabelText("제목")).not.toBeInTheDocument();
  });
});
