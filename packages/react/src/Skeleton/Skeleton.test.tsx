import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonAvatar, SkeletonListItem, SkeletonText } from "./Skeleton";

describe("Skeleton", () => {
  it("label이 없으면 장식으로 스크린리더에서 감춘다", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it('label을 주면 role="status"와 숨긴 문구로 로딩을 알린다', () => {
    render(<Skeleton label="문서를 불러오는 중" />);
    expect(screen.getByRole("status")).toHaveTextContent("문서를 불러오는 중");
  });

  it("숫자 크기는 px로, 문자열은 그대로 쓴다", () => {
    const { container } = render(<Skeleton width={120} height="2em" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("2em");
  });

  it("circle은 높이를 따로 주지 않으면 너비와 같다", () => {
    const { container } = render(<Skeleton variant="circle" width={40} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe("40px");
  });

  it("radius 토큰 이름은 반경 변수로 바뀐다", () => {
    const { container } = render(<Skeleton radius="full" />);
    expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe("var(--chanho-radius-full)");
  });
});

describe("SkeletonText", () => {
  it("lines만큼 줄을 그리고 마지막 줄은 짧다", () => {
    const { container } = render(<SkeletonText lines={4} lastLineWidth="30%" />);
    const bars = container.firstElementChild!.children;
    expect(bars).toHaveLength(4);
    expect((bars[3] as HTMLElement).style.width).toBe("30%");
    expect((bars[0] as HTMLElement).style.width).toBe("");
  });

  it("한 줄이면 lastLineWidth를 쓰지 않는다", () => {
    const { container } = render(<SkeletonText lines={1} />);
    expect((container.firstElementChild!.children[0] as HTMLElement).style.width).toBe("");
  });

  it("묶음에 label을 주면 status 하나만 생기고 줄은 장식이다", () => {
    render(<SkeletonText label="본문을 불러오는 중" />);
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });
});

describe("SkeletonAvatar / SkeletonListItem", () => {
  it("SkeletonAvatar는 Avatar 크기의 원이다", () => {
    const { container } = render(<SkeletonAvatar size="large" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("40px");
    expect(el.style.height).toBe("40px");
  });

  it("SkeletonListItem은 media에 맞는 앞머리를 그린다", () => {
    const { container } = render(<SkeletonListItem media="avatar" lines={2} label="목록을 불러오는 중" />);
    expect(screen.getByRole("status")).toHaveTextContent("목록을 불러오는 중");
    // 원(24px) + 글줄 2개
    expect(container.querySelectorAll("[aria-hidden=true]").length).toBeGreaterThanOrEqual(3);
  });
});
