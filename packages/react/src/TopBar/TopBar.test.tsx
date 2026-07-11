import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("brand와 actions를 렌더링한다", () => {
    render(<TopBar brand="Chanho" actions={<button type="button">알림</button>} />);
    expect(screen.getByText("Chanho")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "알림" })).toBeInTheDocument();
  });

  it("onSearch가 없으면 검색 인풋을 렌더링하지 않는다", () => {
    render(<TopBar brand="Chanho" />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("onSearch가 있으면 라벨과 연결된 검색 인풋을 렌더링한다", () => {
    render(<TopBar brand="Chanho" onSearch={vi.fn()} />);
    expect(screen.getByRole("searchbox", { name: "전역 검색" })).toBeInTheDocument();
  });

  it("검색어 입력 시 onSearch가 현재 값으로 호출된다", async () => {
    const onSearch = vi.fn();
    render(<TopBar brand="Chanho" onSearch={onSearch} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "전역 검색" }), "버그");
    expect(onSearch).toHaveBeenLastCalledWith("버그");
  });

  it("searchPlaceholder를 인풋에 전달한다", () => {
    render(<TopBar brand="Chanho" onSearch={vi.fn()} searchPlaceholder="이슈 검색" />);
    expect(screen.getByPlaceholderText("이슈 검색")).toBeInTheDocument();
  });
});
