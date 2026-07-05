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

function block(selector: string, tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(([key, value]) => `  ${toVarName(key)}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** 정적 토큰 + 라이트 테마는 :root에, 다크 테마는 [data-theme="dark"]에 출력한다. */
export function buildCss(
  staticTokens: Record<string, string>,
  light: Record<string, string>,
  dark: Record<string, string>,
): string {
  return [block(":root", { ...staticTokens, ...light }), block('[data-theme="dark"]', dark)].join("\n\n") + "\n";
}
