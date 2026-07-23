function clip(value, maxLength) {
  const clean = String(value || "").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function buildAdPilotPreviewContext({
  manualContext = "",
  analysis = "",
  hasPhoto = false,
  analyzing = false,
  copy,
}) {
  const manual = String(manualContext).trim();
  const facts = String(analysis).trim();
  if (!hasPhoto && !manual && !facts) return null;

  if (analyzing) {
    return {
      title: copy.analyzingTitle,
      body: copy.analyzingBody,
      status: copy.analyzingStatus,
      footer: copy.photoPending,
    };
  }

  if (facts) {
    const lines = facts.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] || facts;
    const recognizedProduct = firstLine.replace(/^[^:\n]{1,48}:\s*/, "").trim() || firstLine;
    const detailLines = lines.slice(1, 6);
    return {
      title: clip(manual || recognizedProduct, 96),
      body: clip(detailLines.length ? detailLines.join("\n") : facts, 560),
      status: copy.readyStatus,
      footer: copy.photoFacts,
    };
  }

  if (manual) {
    return {
      title: clip(manual, 96),
      body: manual,
      status: copy.readyStatus,
      footer: copy.descriptionReady,
    };
  }

  return {
    title: copy.photoPendingTitle,
    body: copy.photoPendingBody,
    status: copy.needsDetailsStatus,
    footer: copy.photoPending,
  };
}
