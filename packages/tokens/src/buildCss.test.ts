import { describe, expect, it } from "vitest";
import { buildCss, flatten } from "./buildCss";
import { themes } from "./semantic";

describe("flatten", () => {
  it("중첩 객체를 점 표기 키로 평탄화한다", () => {
    expect(flatten({ space: { 100: "8px" }, radius: { medium: "6px" } })).toEqual({
      "space.100": "8px",
      "radius.medium": "6px",
    });
  });
});

describe("buildCss", () => {
  it(":root에 정적 토큰과 라이트 토큰을 --chanho- 접두사 CSS 변수로 출력한다", () => {
    const css = buildCss({ "space.100": "8px" }, { "color.text.default": "#111111" }, {});
    expect(css).toContain(":root {");
    expect(css).toContain("--chanho-space-100: 8px;");
    expect(css).toContain("--chanho-color-text-default: #111111;");
  });

  it('다크 토큰은 [data-theme="dark"] 블록으로 출력한다', () => {
    const css = buildCss({}, {}, { "color.text.default": "#EEEEEE" });
    expect(css).toContain('[data-theme="dark"] {\n  --chanho-color-text-default: #EEEEEE;\n}');
  });
});

describe("semantic themes", () => {
  it("light와 dark는 동일한 토큰 키 세트를 가진다", () => {
    expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort());
  });
});
