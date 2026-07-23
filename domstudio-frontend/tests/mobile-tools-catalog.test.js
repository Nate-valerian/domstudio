import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";


const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");


test("uses compact horizontal tool rows on mobile", () => {
  assert.match(
    styles,
    /\.free-tool-card \{\s*display: grid; grid-template-columns: 42px minmax\(0, 1fr\) auto;[\s\S]*?min-height: 86px;/,
  );
  assert.match(styles, /\.free-tool-card-top \{ display: contents; \}/);
  assert.match(styles, /\.free-tool-open \{ grid-area: tool-open;[\s\S]*?font-size: 0;/);
  assert.doesNotMatch(styles, /\.free-tool-card \{ min-height: 164px; \}/);
});


test("compresses mobile discovery and quick workflow before the catalog", () => {
  assert.match(styles, /\.free-tools-route \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(styles, /\.free-tools-search \{ min-height: 46px;/);
  assert.match(styles, /\.free-tools-stats div \{ padding: 10px 12px;/);
});
