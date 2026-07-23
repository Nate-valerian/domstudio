import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";


const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");


test("keeps Studio controls and result compact on mobile", () => {
  assert.match(styles, /\.workspace\.studio-workspace \{ padding: 4px 10px 108px; \}/);
  assert.match(styles, /\.studio-workflow-panel \.upload \{ min-height: 64px;/);
  assert.match(styles, /\.studio-workbench \.result \{ min-height: 300px; \}/);
});


test("uses compact AdPilot cards, previews, generators, and chat on mobile", () => {
  assert.match(styles, /\.workspace\.adpilot-landing \{ padding: 10px 10px 24px; \}/);
  assert.match(styles, /\.adpilot-preview-output \{ min-height: 190px;/);
  assert.match(styles, /\.adpilot-workflow \{[\s\S]*?min-height: 84px;/);
  assert.match(styles, /\.adpilot-tool-output \.copy-output-empty, \.adpilot-tool-output \.copy-output-ghost \{ min-height: 220px; \}/);
  assert.match(styles, /\.adpilot-brief \.adpilot-quick-input \{ min-height: 56px;/);
  assert.match(styles, /\.adpilot-page ~ \.mobile-tabbar \{ display: none; \}/);
  assert.match(styles, /\.route-adpilot \.nav-inner \{ min-height: 54px;/);
  assert.match(styles, /\.adpilot-chat-form \.textarea \{ min-height: 68px;/);
});


test("uses a compact opened Tool workspace on mobile", () => {
  assert.match(styles, /\.tools-detail-inner \{ padding: 12px 10px 108px; \}/);
  assert.match(styles, /\.free-tool-stage \{ min-height: 300px; \}/);
  assert.match(styles, /\.free-tool-stage-preview \{ min-height: 140px;/);
  assert.match(styles, /\.free-tool-stage-steps \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
});


test("keeps result transfers to one swipe row and clears the workspace viewport", () => {
  assert.match(app, /class="tool-send-scroll"[\s\S]*?chip-studio[\s\S]*?chip-adpilot[\s\S]*?\$\{toolButtons\}/);
  assert.match(app, /class="page tools-page tools-detail-page"/);
  assert.match(styles, /\.free-tool-v2-shell \.tool-send-scroll \{[\s\S]*?flex-wrap: nowrap;[\s\S]*?overflow-x: auto;/);
  assert.match(styles, /\.tools-detail-page ~ \.mobile-tabbar \{ display: none; \}/);
});
