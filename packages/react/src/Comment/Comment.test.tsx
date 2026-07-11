import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Comment } from "./Comment";

describe("Comment", () => {
  it("작성자, 시각, 본문, 아바타를 렌더링한다", () => {
    render(
      <Comment author="김찬호" avatar={<span>아바타</span>} time="3시간 전">
        검토 부탁드려요.
      </Comment>,
    );
    expect(screen.getByText("김찬호")).toBeInTheDocument();
    expect(screen.getByText("3시간 전")).toBeInTheDocument();
    expect(screen.getByText("검토 부탁드려요.")).toBeInTheDocument();
    expect(screen.getByText("아바타")).toBeInTheDocument();
  });

  it("액션 버튼을 렌더링하고 클릭 시 핸들러를 호출한다", async () => {
    const onReply = vi.fn();
    render(
      <Comment
        author="김찬호"
        avatar={<span>아바타</span>}
        time="3시간 전"
        actions={[{ label: "답글", onClick: onReply }]}
      >
        본문
      </Comment>,
    );
    await userEvent.click(screen.getByRole("button", { name: "답글" }));
    expect(onReply).toHaveBeenCalledOnce();
  });

  it("액션이 없으면 액션 버튼을 렌더링하지 않는다", () => {
    render(
      <Comment author="김찬호" avatar={<span>아바타</span>} time="3시간 전">
        본문
      </Comment>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("nested면 들여쓰기 클래스가 적용된다", () => {
    const { container } = render(
      <Comment author="김찬호" avatar={<span>아바타</span>} time="3시간 전" nested>
        본문
      </Comment>,
    );
    expect(container.firstElementChild?.className).toMatch(/nested/);
  });
});
