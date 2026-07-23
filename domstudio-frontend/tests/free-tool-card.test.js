import test from "node:test";
import assert from "node:assert/strict";
import { renderFreeToolCatalogCard } from "../src/free-tool-card.js";

const base = {
  tool: { id: "crop", category: "prep", icon: "⌗", available: true },
  title: "Smart Crop & Rotate",
  description: "Crop freely or use marketplace ratios.",
  status: "Free",
  openLabel: "Open",
  plannedLabel: "Planned",
};

test("makes the whole available tool card the navigation button", () => {
  const html = renderFreeToolCatalogCard(base);

  assert.match(html, /^<button class="free-tool-card/);
  assert.match(html, /data-free-tool="crop"/);
  assert.match(html, /aria-label="Smart Crop &amp; Rotate: Open"/);
  assert.equal((html.match(/<button\b/g) || []).length, 1);
  assert.match(html, /<span class="free-tool-open">Open/);
});

test("keeps unavailable cards non-interactive", () => {
  const html = renderFreeToolCatalogCard({
    ...base,
    tool: { ...base.tool, available: false },
    status: "Coming soon",
  });

  assert.match(html, /^<article class="free-tool-card/);
  assert.doesNotMatch(html, /data-free-tool=/);
  assert.doesNotMatch(html, /<button\b/);
});
