import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

it("테스트 환경에서 React 컴포넌트가 렌더링된다", () => {
  render(<p>hello</p>);
  expect(screen.getByText("hello")).toBeInTheDocument();
});
