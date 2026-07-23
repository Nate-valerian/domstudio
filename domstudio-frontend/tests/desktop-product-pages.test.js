import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";


const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");


test("keeps the AdPilot desk above the desktop fold", () => {
  assert.match(styles, /@media \(min-width: 861px\) \{[\s\S]*?\.workspace\.adpilot-landing \{ padding: 28px/);
  assert.match(styles, /\.adpilot-landing-head h1 \{ max-width: 820px;[\s\S]*?font-size: clamp\(40px, 4\.2vw, 56px\);/);
  assert.match(styles, /@media \(min-width: 1100px\) \{[\s\S]*?\.adpilot-landing-head \{[\s\S]*?grid-template-columns:/);
});


test("keeps Tools discovery and cards visible in the desktop viewport", () => {
  assert.match(styles, /@media \(min-width: 961px\) \{[\s\S]*?\.free-tools-catalog \{ padding: 28px/);
  assert.match(styles, /\.free-tools-hero h1 \{[\s\S]*?font-size: clamp\(40px, 4\.4vw, 56px\);/);
  assert.match(styles, /\.free-tool-card \{ min-height: 154px;/);
});


test("caps the desktop Example proof and localizes its captions", () => {
  assert.match(styles, /\.example-card\.proof-triplet \.example-media-triplet \.example-media \{ height: clamp\(270px, 24vw, 350px\); aspect-ratio: auto; \}/);
  assert.match(app, /modeEn: "Before · After · Video"/);
  assert.match(app, /function exampleCopy\(item, field\)/);
  assert.match(app, /escapeHtml\(exampleCopy\(item, "title"\)\)/);
});
