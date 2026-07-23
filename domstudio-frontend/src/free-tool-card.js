function escapeMarkup(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderFreeToolCatalogCard({
  tool,
  title,
  description,
  status,
  openLabel,
  plannedLabel,
}) {
  const className = `free-tool-card ${tool.featured ? "featured" : ""} ${tool.available ? "available" : "coming"}`;
  const content = `
      <div class="free-tool-card-top">
        <span class="free-tool-icon" aria-hidden="true">${escapeMarkup(tool.icon)}</span>
        <span class="free-tool-status ${tool.available ? "" : "coming"}">${escapeMarkup(status)}</span>
      </div>
      <h3>${escapeMarkup(title)}</h3>
      <p>${escapeMarkup(description)}</p>
      ${tool.available
        ? `<span class="free-tool-open">${escapeMarkup(openLabel)} <span aria-hidden="true">→</span></span>`
        : `<span class="free-tool-open pending">${escapeMarkup(plannedLabel)}</span>`}`;

  if (tool.available) {
    return `<button class="${className}" type="button" data-free-tool-card data-free-tool="${escapeMarkup(tool.id)}" data-tool-category="${escapeMarkup(tool.category)}" aria-label="${escapeMarkup(`${title}: ${openLabel}`)}">${content}
    </button>`;
  }

  return `<article class="${className}" data-free-tool-card data-tool-category="${escapeMarkup(tool.category)}">${content}
    </article>`;
}
