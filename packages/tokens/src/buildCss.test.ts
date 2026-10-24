import { describe, expect, it } from "vitest";
import { buildCss, flatten } from "./buildCss";
import { themes } from "./semantic";
import { motion, reducedMotion } from "./static";

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
    expect(css).toContain('[data-theme="dark"] {\n  color-scheme: dark;\n  --chanho-color-text-default: #EEEEEE;\n}');
  });

  it("테마마다 color-scheme을 선언해 브라우저 기본 컨트롤도 테마를 따른다", () => {
    const css = buildCss({}, { "color.text.default": "#111111" }, {});
    expect(css).toContain(":root {\n  color-scheme: light;\n");
  });
});

describe("semantic themes", () => {
  it("light와 dark는 동일한 토큰 키 세트를 가진다", () => {
    expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort());
  });
});

describe("motion", () => {
  it("모션 토큰을 --chanho-motion-* 변수로 출력한다", () => {
    const css = buildCss(flatten({ motion }), {}, {});
    expect(css).toContain("--chanho-motion-duration-instant: 50ms;");
    expect(css).toContain("--chanho-motion-duration-fast: 100ms;");
    expect(css).toContain("--chanho-motion-duration-base: 150ms;");
    expect(css).toContain("--chanho-motion-duration-moderate: 200ms;");
    expect(css).toContain("--chanho-motion-duration-slow: 300ms;");
    expect(css).toContain("--chanho-motion-easing-enter: cubic-bezier(0.2, 0, 0, 1);");
    expect(css).toContain("--chanho-motion-easing-exit: cubic-bezier(0.8, 0, 0, 0.8);");
    expect(css).toContain("--chanho-motion-easing-standard: cubic-bezier(0.4, 0, 0, 1);");
  });

  it("움직임 줄이기 미디어 블록이 모든 지속시간을 1ms로 덮는다", () => {
    const css = buildCss(flatten({ motion }), {}, {}, flatten(reducedMotion));
    const media = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(media).toContain(":root {");
    for (const key of Object.keys(motion.duration)) {
      expect(media).toContain(`--chanho-motion-duration-${key}: 1ms;`);
    }
    // 이징은 덮지 않는다
    expect(media).not.toContain("easing");
  });

  it("reducedMotion이 없으면 미디어 블록을 내보내지 않는다", () => {
    expect(buildCss({}, {}, {})).not.toContain("@media");
  });
});
