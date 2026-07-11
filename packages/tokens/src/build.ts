import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCss, flatten } from "./buildCss";
import { themes } from "./semantic";
import { focus, font, radius, space, z } from "./static";

const staticTokens = flatten({ space, radius, font, z, focus });
const css = buildCss(staticTokens, themes.light, themes.dark);

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tokens.css"), css);
console.log(`dist/tokens.css written (${css.length} bytes)`);
