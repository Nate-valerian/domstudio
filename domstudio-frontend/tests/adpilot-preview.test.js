import test from "node:test";
import assert from "node:assert/strict";
import { buildAdPilotPreviewContext } from "../src/adpilot-preview.js";

const copy = {
  analyzingTitle: "Identifying the product",
  analyzingBody: "Extracting facts",
  analyzingStatus: "Analyzing photo",
  readyStatus: "Ready to create",
  needsDetailsStatus: "Details needed",
  photoPendingTitle: "Product photo attached",
  photoPendingBody: "Analyze the photo",
  photoFacts: "Photo facts applied",
  descriptionReady: "Product description applied",
  photoPending: "Photo not analyzed yet",
  analysisReadyBody: "Photo analysis is ready. Click Create to generate real content for the selected channel.",
  manualReadyBody: "Product details are ready. Click Create to generate real content for the selected channel.",
};

test("keeps the sample preview only when no user context exists", () => {
  assert.equal(buildAdPilotPreviewContext({ copy }), null);
});

test("replaces the sample as soon as a product photo is attached", () => {
  assert.deepEqual(buildAdPilotPreviewContext({ hasPhoto: true, copy }), {
    title: "Product photo attached",
    body: "Analyze the photo",
    status: "Details needed",
    footer: "Photo not analyzed yet",
  });
});

test("uses the recognized product without duplicating raw photo facts", () => {
  const preview = buildAdPilotPreviewContext({
    hasPhoto: true,
    analysis: [
      "Product type: Utility vehicle (UTV) / golf cart-style work vehicle",
      "Color: Gray body, black roof and wheels",
      "Shape: Open-top, 4-seater cabin with rear cargo bed",
      "Components: Steering wheel, dashboard, front bumper, side mirrors",
    ].join("\n"),
    copy,
  });

  assert.equal(preview.title, "Utility vehicle (UTV) / golf cart-style work vehicle");
  assert.equal(preview.body, copy.analysisReadyBody);
  assert.doesNotMatch(preview.body, /Gray body|rear cargo bed/);
  assert.doesNotMatch(`${preview.title} ${preview.body}`, /leather bag/i);
  assert.equal(preview.status, "Ready to create");
  assert.equal(preview.footer, "Photo facts applied");
});

test("lets the seller's description override the recognized title", () => {
  const preview = buildAdPilotPreviewContext({
    hasPhoto: true,
    manualContext: "Refurbished Carryall 1700 utility vehicle",
    analysis: "Product type: Golf cart\nColor: Gray",
    copy,
  });

  assert.equal(preview.title, "Refurbished Carryall 1700 utility vehicle");
  assert.equal(preview.body, copy.analysisReadyBody);
});

test("summarizes manual context as ready instead of pretending it is generated output", () => {
  const preview = buildAdPilotPreviewContext({
    manualContext: "Handmade oak dining table",
    copy,
  });

  assert.equal(preview.title, "Handmade oak dining table");
  assert.equal(preview.body, copy.manualReadyBody);
  assert.equal(preview.footer, "Product description applied");
});
