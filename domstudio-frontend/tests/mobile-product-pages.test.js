import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";


const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");


test("keeps Studio controls and result compact on mobile", () => {
  assert.match(styles, /\.workspace\.studio-workspace \{ padding: 4px 10px 108px; \}/);
  assert.match(styles, /\.studio-workflow-panel \.upload \{ min-height: 64px;/);
  assert.match(styles, /\.studio-workbench \.result \{ min-height: 300px; \}/);
});


test("uses compact AdPilot cards, previews, generators, and chat on mobile", () => {
  assert.match(styles, /\.workspace\.adpilot-landing \{ padding: 16px 12px 108px; \}/);
  assert.match(styles, /\.adpilot-preview-output \{ min-height: 245px;/);
  assert.match(styles, /\.adpilot-workflow \{[\s\S]*?min-height: 84px;/);
  assert.match(styles, /\.adpilot-tool-output \.copy-output-empty, \.adpilot-tool-output \.copy-output-ghost \{ min-height: 220px; \}/);
  assert.match(styles, /\.adpilot-brief \.adpilot-quick-input \{ min-height: 66px;/);
  assert.match(styles, /\.adpilot-chat-form \.textarea \{ min-height: 68px;/);
});


test("uses a compact opened Tool workspace on mobile", () => {
  assert.match(styles, /\.tools-detail-inner \{ padding: 12px 10px 108px; \}/);
  assert.match(styles, /\.free-tool-stage \{ min-height: 300px; \}/);
  assert.match(styles, /\.free-tool-stage-preview \{ min-height: 140px;/);
  assert.match(styles, /\.free-tool-stage-steps \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
});
