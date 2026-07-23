import test from "node:test";
import assert from "node:assert/strict";
import {
  FREE_TOOL_WORKSPACE_IDS,
  renderFreeToolWorkspaceStage,
  resolveFreeToolWorkspaceState,
} from "../src/free-tool-workspace.js";

test("covers every available Free Tools workspace", () => {
  assert.equal(FREE_TOOL_WORKSPACE_IDS.length, 16);
  assert.equal(new Set(FREE_TOOL_WORKSPACE_IDS).size, 16);
  for (const id of ["removebg", "vision", "safe-zone", "before-after", "batch", "compressor"]) {
    assert.ok(FREE_TOOL_WORKSPACE_IDS.includes(id));
  }
  for (const id of FREE_TOOL_WORKSPACE_IDS) {
    assert.deepEqual(resolveFreeToolWorkspaceState(id, {}), {
      preview: null,
      busy: false,
      ready: false,
      hasSource: false,
    });
  }
});

test("prefers a finished result in the dark preview stage", () => {
  const workspace = resolveFreeToolWorkspaceState("crop", {
    cropPreview: "data:image/jpeg;base64,source",
    cropResult: "data:image/jpeg;base64,result",
  });

  assert.equal(workspace.preview, "data:image/jpeg;base64,result");
  assert.equal(workspace.ready, true);
  assert.equal(workspace.hasSource, true);
});

test("renders the shared dark workspace panel with accessible state", () => {
  const html = renderFreeToolWorkspaceStage({
    tool: { icon: "⌗" },
    title: "Smart Crop & Rotate",
    description: "Crop a marketplace photo.",
    workspace: { preview: null, busy: false, ready: false, hasSource: false },
    copy: {
      eyebrow: "Live workspace",
      start: "Add a photo",
      editing: "Adjusting",
      processing: "Processing",
      ready: "Result ready",
      selectedTool: "Selected tool",
      stepInput: "Add input",
      stepAdjust: "Adjust",
      stepExport: "Export",
    },
  });

  assert.match(html, /^<aside class="free-tool-stage" data-stage-state="empty">/);
  assert.match(html, /Smart Crop &amp; Rotate/);
  assert.match(html, /<b>01<\/b><span>Add input<\/span>/);
});
