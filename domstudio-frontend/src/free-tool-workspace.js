export const FREE_TOOL_WORKSPACE_IDS = [
  "removebg",
  "crop",
  "collage",
  "watermark",
  "promo",
  "resizer",
  "checker",
  "converter",
  "redact",
  "vision",
  "safe-zone",
  "before-after",
  "palette",
  "qr",
  "batch",
  "compressor",
];

function escapeMarkup(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function resolveFreeToolWorkspaceState(toolId, state) {
  const batchResult = state.batchResults?.[state.batchTransferIndex] || state.batchResults?.[0];
  const entries = {
    removebg: {
      source: state.removeBgPreview,
      result: state.removeBgComposed || state.removeBgResult,
      busy: state.removeBgLoading,
    },
    crop: { source: state.cropPreview, result: state.cropResult, busy: false },
    collage: { source: state.collagePreviews?.[0], result: state.collageResult, busy: false },
    watermark: { source: state.watermarkPreview, result: state.watermarkResult, busy: false },
    promo: { source: state.promoPreview, result: state.promoResult, busy: false },
    resizer: { source: state.resizerPreview, result: state.resizerResult, busy: false },
    checker: {
      source: state.checkerPreview,
      result: state.checkerResult ? state.checkerPreview : null,
      busy: false,
    },
    converter: { source: state.converterPreview, result: state.converterResult, busy: false },
    redact: { source: state.redactPreview, result: state.redactResult, busy: false },
    vision: {
      source: state.visionPreview,
      result: state.visionAnalysis ? state.visionPreview : null,
      busy: state.visionAnalyzing,
    },
    "safe-zone": {
      source: state.safeZonePreview,
      result: state.safeZoneGuideResult || state.safeZoneResult,
      busy: false,
    },
    "before-after": {
      source: state.beforeAfterPreviews?.find(Boolean),
      result: state.beforeAfterResult,
      busy: false,
    },
    palette: {
      source: state.palettePreview,
      result: state.paletteColors?.length ? (state.paletteResult || state.palettePreview) : null,
      busy: Boolean(state.palettePreview && !state.paletteColors?.length),
    },
    qr: { source: null, result: state.qrResult, busy: state.qrGenerating },
    batch: {
      source: state.batchPreviews?.[state.batchTransferIndex] || state.batchPreviews?.[0],
      result: batchResult?.dataUrl,
      busy: state.batchProcessing,
    },
    compressor: { source: state.compressorPreview, result: state.compressorResult, busy: false },
  };
  const entry = entries[toolId] || { source: null, result: null, busy: false };
  const preview = entry.result || entry.source || null;
  return {
    preview,
    busy: Boolean(entry.busy),
    ready: Boolean(entry.result),
    hasSource: Boolean(entry.source || entry.result),
  };
}

export function renderFreeToolWorkspaceStage({ tool, title, description, workspace, copy }) {
  const status = workspace.busy
    ? copy.processing
    : workspace.ready
      ? copy.ready
      : workspace.hasSource
        ? copy.editing
        : copy.start;
  const stateName = workspace.busy ? "busy" : workspace.ready ? "ready" : workspace.hasSource ? "editing" : "empty";

  return `<aside class="free-tool-stage" data-stage-state="${stateName}">
      <span class="free-tool-stage-mark" aria-hidden="true">${escapeMarkup(tool.icon)}</span>
      <header class="free-tool-stage-head">
        <span>${escapeMarkup(copy.eyebrow)}</span>
        <small>${escapeMarkup(status)}</small>
      </header>
      <div class="free-tool-stage-preview ${workspace.preview ? "has-preview" : "is-empty"}">
        ${workspace.preview
          ? `<img src="${escapeMarkup(workspace.preview)}" alt="${escapeMarkup(title)}" />`
          : `<span aria-hidden="true">${escapeMarkup(tool.icon)}</span>`}
      </div>
      <div class="free-tool-stage-copy">
        <span>${escapeMarkup(copy.selectedTool)}</span>
        <h2>${escapeMarkup(title)}</h2>
        <p>${escapeMarkup(description)}</p>
      </div>
      <ol class="free-tool-stage-steps">
        <li><b>01</b><span>${escapeMarkup(copy.stepInput)}</span></li>
        <li><b>02</b><span>${escapeMarkup(copy.stepAdjust)}</span></li>
        <li><b>03</b><span>${escapeMarkup(copy.stepExport)}</span></li>
      </ol>
    </aside>`;
}
