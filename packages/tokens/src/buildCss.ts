const PREFIX = "--chanho-";

/** 중첩 토큰 객체를 { "a.b.c": value } 형태로 평탄화한다. */
export function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      Object.assign(out, flatten(value as Record<string, unknown>, path));
    } else {
      out[path] = String(value);
    }
  }
  return out;
}

function toVarName(key: string): string {
  return PREFIX + key.replaceAll(".", "-");
}

function block(selector: string, tokens: Record<string, string>, colorScheme: "light" | "dark"): string {
  const lines = Object.entries(tokens).map(([key, value]) => `  ${toVarName(key)}: ${value};`);
  // Atlassian 테마 CSS처럼 테마마다 color-scheme을 선언한다 — 체크박스·스크롤바·date 입력 같은
  // 브라우저 기본 컨트롤이 다크에서 흰색으로 남지 않게.
  return `${selector} {\n  color-scheme: ${colorScheme};\n${lines.join("\n")}\n}`;
}

/** 정적 토큰 + 라이트 테마는 :root에, 다크 테마는 [data-theme="dark"]에 출력한다. */
export function buildCss(
  staticTokens: Record<string, string>,
  light: Record<string, string>,
  dark: Record<string, string>,
): string {
  return [block(":root", { ...staticTokens, ...light }, "light"), block('[data-theme="dark"]', dark, "dark")].join("\n\n") + "\n";
}
