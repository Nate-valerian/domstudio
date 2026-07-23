import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";


const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");


test("keeps the AdPilot desk above the desktop fold", () => {
  assert.match(styles, /@media \(min-width: 861px\) \{[\s\S]*?\.workspace\.adpilot-landing \{ padding: 18px/);
  assert.match(styles, /\.adpilot-landing-head h1 \{ max-width: 760px;[\s\S]*?font-size: clamp\(36px, 3\.6vw, 48px\);/);
  assert.match(styles, /\.adpilot-preview-output \{ min-height: 260px; padding: 18px; \}/);
  assert.match(styles, /\.adpilot-section-head \{ margin: 28px 0 10px; \}/);
  assert.match(styles, /\.adpilot-workflow \{[\s\S]*?grid-template-areas: "icon title count" "icon desc count";[\s\S]*?min-height: 118px;/);
  assert.match(styles, /@media \(min-width: 1100px\) \{[\s\S]*?\.adpilot-landing-head \{[\s\S]*?grid-template-columns:/);
});


test("keeps Tools discovery and cards visible in the desktop viewport", () => {
  assert.match(styles, /@media \(min-width: 961px\) \{[\s\S]*?\.free-tools-catalog \{ padding: 18px/);
  assert.match(styles, /\.free-tools-hero h1 \{[\s\S]*?font-size: clamp\(36px, 3\.8vw, 48px\);/);
  assert.match(styles, /\.free-tool-card \{ min-height: 130px;/);
});


test("caps the desktop Example proof and localizes its captions", () => {
  assert.match(styles, /\.example-card\.proof-triplet \.example-media-triplet \.example-media \{ height: clamp\(190px, 16vw, 230px\); aspect-ratio: auto; \}/);
  assert.match(app, /modeEn: "Before · After · Video"/);
  assert.match(app, /function exampleCopy\(item, field\)/);
  assert.match(app, /escapeHtml\(exampleCopy\(item, "title"\)\)/);
});


test("uses compact route navigation on dense desktop pages", () => {
  assert.match(app, /class="shell route-\$\{state\.route\}"/);
  assert.match(styles, /\.route-adpilot \.nav-inner, \.route-tools \.nav-inner, \.route-examples \.nav-inner \{ padding-top: 8px; padding-bottom: 8px; \}/);
});
