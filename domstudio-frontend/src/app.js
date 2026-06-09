import "./styles.css";
import { gsap } from "gsap";
import productProofUrl from "./assets/product-proof.webp";
import modeCatalogUrl from "./assets/mode-catalog-real-v3.webp";
import modeProductUrl from "./assets/mode-product-real-v3.webp";
import modeCreativeUrl from "./assets/mode-creative-real-v3.webp";
import modeLifestyleUrl from "./assets/mode-lifestyle-real-v3.webp";
import modeFittingUrl from "./assets/mode-fitting-real-v2.webp";
import modeStoriesUrl from "./assets/mode-stories-real-v3.webp";
import modeCatalogBeforeUrl from "./assets/mode-catalog-before.webp";
import modeProductBeforeUrl from "./assets/mode-product-before.webp";
import modeCreativeBeforeUrl from "./assets/mode-creative-before.webp";
import modeLifestyleBeforeUrl from "./assets/mode-lifestyle-before.webp";
import modeFittingBeforeUrl from "./assets/mode-fitting-before.webp";
import modeStoriesBeforeUrl from "./assets/mode-stories-before.webp";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const MODES = [
  ["catalog", "Каталог", "Чистый фон и точная подача для маркетплейсов.", modeCatalogUrl, "Пример чистой карточки товара для маркетплейса", modeCatalogBeforeUrl, "Фон + тени"],
  ["product", "Предметная", "Премиальный свет, фактуры и рекламный кадр.", modeProductUrl, "Пример премиальной предметной съёмки", modeProductBeforeUrl, "Свет + сет"],
  ["creative", "Креатив", "Выразительный контент для соцсетей и кампаний.", modeCreativeUrl, "Пример креативного рекламного визуала", modeCreativeBeforeUrl, "Кампания"],
  ["image", "Lifestyle", "Товар в естественной сцене с AI-моделью.", modeLifestyleUrl, "Пример lifestyle-кадра с товаром", modeLifestyleBeforeUrl, "Сцена"],
  ["fitting", "Примерка", "Виртуальная примерка одежды и аксессуаров.", modeFittingUrl, "Пример виртуальной примерки", modeFittingBeforeUrl, "Примерка"],
  ["mobile", "Stories", "Вертикальный UGC-контент в формате 9:16.", modeStoriesUrl, "Пример вертикального story-контента", modeStoriesBeforeUrl, "9:16"],
];

const MARKETPLACE_PRESETS = [
  {
    id: "wildberries",
    label: "Wildberries",
    mode: "catalog",
    hint: "Wildberries-ready catalog photo, centered product, clean light background, no text, no logos, enough margin for marketplace card.",
    subjectInstruction: "Prepare it as a marketplace hero image for Wildberries.",
  },
  {
    id: "ozon",
    label: "Ozon",
    mode: "catalog",
    hint: "Ozon product card style, white or very light background, natural shadow, clear shape, crop safe for a square listing.",
    subjectInstruction: "Prepare it for an Ozon product card.",
  },
  {
    id: "yandex",
    label: "Yandex Market",
    mode: "catalog",
    hint: "Yandex Market listing photo, clean commercial e-commerce lighting, centered composition, realistic color and material.",
    subjectInstruction: "Prepare it for Yandex Market.",
  },
  {
    id: "avito",
    label: "Avito",
    mode: "catalog",
    hint: "Avito listing photo, honest clear product photo, natural daylight-style lighting, light neutral background, accurate colors and proportions, no text overlays.",
    subjectInstruction: "Prepare it for an Avito product listing.",
  },
  {
    id: "instagram",
    label: "VK / Telegram",
    mode: "creative",
    hint: "VK and Telegram channel post creative, engaging product photo, scroll-stopping but realistic, brand-consistent composition, 4:5 or square-safe.",
    subjectInstruction: "Make it work as a VK or Telegram post.",
  },
  {
    id: "story",
    label: "Story 9:16",
    mode: "mobile",
    hint: "Vertical 9:16 story composition, product clearly visible in the safe center area, mobile-first social creative.",
    subjectInstruction: "Make it work as a vertical story creative.",
  },
  {
    id: "banner",
    label: "Website Banner",
    mode: "product",
    hint: "Website banner composition, product on one side, clean negative space for headline and call to action, premium campaign lighting.",
    subjectInstruction: "Make it work as a website banner visual.",
  },
];

const STYLE_TEMPLATES = [
  { id: "clean", label: "Clean catalog", hint: "clean catalog style, accurate color, soft shadow, minimal background" },
  { id: "jewelry", label: "Premium jewelry", hint: "premium jewelry macro, precise reflections, elegant highlights, luxury retail finish" },
  { id: "cosmetics", label: "Cosmetics macro", hint: "cosmetics macro photography, glossy surfaces, soft gradients, fresh beauty lighting" },
  { id: "fashion", label: "Fashion model", hint: "fashion editorial look, model context when appropriate, refined styling, natural pose" },
  { id: "minimal", label: "Minimal beige", hint: "minimal warm neutral background, beige and ivory tones, calm premium composition" },
  { id: "luxury", label: "Dark luxury", hint: "dark luxury studio setup, dramatic rim light, rich shadows, premium materials" },
  { id: "social", label: "Social media creative", hint: "bold social media creative, dynamic crop, bright engaging visual, modern campaign feel" },
];

const VARIATIONS = [
  { id: "cleaner", label: "Cleaner", hint: "make the result cleaner, simpler, with fewer props and a clearer product silhouette" },
  { id: "premium", label: "More premium", hint: "make the result feel more premium with refined lighting, elegant materials, and luxury finish" },
  { id: "brighter", label: "Brighter", hint: "make the image brighter, fresh, optimistic, and more commercially inviting" },
  { id: "background", label: "Different background", hint: "change the background while keeping the product accurate and realistic" },
  { id: "closer", label: "Closer crop", hint: "use a closer crop with the product larger in frame and the key details more visible" },
  { id: "realistic", label: "More realistic", hint: "make the output more photorealistic with natural materials, accurate scale, and believable light" },
];

const EXPORT_SIZES = {
  original: { label: "Original size", width: null, height: null },
  square: { label: "1080 x 1080", width: 1080, height: 1080 },
  feed: { label: "4:5 (1080 x 1350)", width: 1080, height: 1350 },
  story: { label: "9:16 (1080 x 1920)", width: 1080, height: 1920 },
  widescreen: { label: "16:9 (1920 x 1080)", width: 1920, height: 1080 },
};

const PACK_FORMATS = [
  { id: "wb", label: "Wildberries", size: "square", format: "jpeg" },
  { id: "ozon", label: "Ozon", size: "square", format: "jpeg" },
  { id: "yandex", label: "Yandex Market", size: "square", format: "jpeg" },
  { id: "avito", label: "Avito", size: "square", format: "jpeg" },
  { id: "story", label: "Story 9:16", size: "story", format: "png" },
  { id: "post", label: "Пост 4:5", size: "feed", format: "jpeg" },
  { id: "banner", label: "Баннер 16:9", size: "widescreen", format: "jpeg" },
];

const HISTORY_DB = "domstudio_history";
const HISTORY_STORE = "results";
const HISTORY_LIMIT = 20;
const BRAND_PREFS_KEY = "domstudio_brand_preferences";

const PAGE_TITLES = {
  home:    "DomStudio — AI-студия для продавцов маркетплейсов",
  studio:  "Студия — DomStudio",
  pricing: "Тарифы — DomStudio",
  account: "Аккаунт — DomStudio",
  history: "История генераций — DomStudio",
};

const PLAN_LABELS = {
  free: "Free",
  basic: "Старт",
  pro: "Селлер",
  business: "Рост",
};

const PLAN_DESCRIPTIONS = {
  free: "Первые 5 фото бесплатно",
  basic: "Проверить карточки товара",
  pro: "Регулярный контент для продаж",
  business: "Для магазина и маркетплейсов",
};

const FALLBACK_PLANS = [
  { name: "free", price_rub: 0, photos: 5, tokens: 500 },
  { name: "basic", price_rub: 270, photos: 30, tokens: 3000 },
  { name: "pro", price_rub: 790, photos: 100, tokens: 10000 },
  { name: "business", price_rub: 1490, photos: 300, tokens: 30000 },
];

const TOKEN_PACKS = [
  { pack_id: "pack_500",  tokens: 500,  price_rub: 99,  label: "500 токенов" },
  { pack_id: "pack_1500", tokens: 1500, price_rub: 249, label: "1 500 токенов" },
  { pack_id: "pack_5000", tokens: 5000, price_rub: 699, label: "5 000 токенов" },
];

const DEFAULT_BRAND_PREFS = {
  brand_colors: "",
  preferred_background: "",
  brand_mood: "",
  do_not_use: "",
  default_marketplace: "wildberries",
  default_style_template: "clean",
};

function loadBrandPrefs() {
  try {
    return {
      ...DEFAULT_BRAND_PREFS,
      ...JSON.parse(localStorage.getItem(BRAND_PREFS_KEY) || "{}"),
    };
  } catch {
    return { ...DEFAULT_BRAND_PREFS };
  }
}

function saveBrandPrefs(prefs) {
  localStorage.setItem(BRAND_PREFS_KEY, JSON.stringify(prefs));
}

const initialBrandPrefs = loadBrandPrefs();

const state = {
  route: location.hash.slice(1) || "home",
  accessToken: localStorage.getItem("domstudio_access"),
  refreshToken: localStorage.getItem("domstudio_refresh"),
  user: null,
  plans: [...FALLBACK_PLANS],
  authMode: null,
  authChannel: "email",
  authLoading: false,
  passwordVisible: false,
  navMenuOpen: false,
  presetsOpen: false,
  navCompact: window.scrollY > 24,
  verificationContact: null,
  verificationKind: "email",
  verificationReturnMode: "register",
  selectedImage: null,
  selectedImageName: null,
  generatedImage: null,
  generatedMeta: null,
  previousGeneratedImage: null,
  previousGeneratedMeta: null,
  lastGenerationPayload: null,
  generationLabel: "",
  history: [],
  brandPrefs: initialBrandPrefs,
  generating: false,
  brandPrefsOpen: false,
  promptHelperOpen: false,
  historyFilter: "all",
  batchQueue: [],
  batchTotal: 0,
  batchIndex: 0,
  formDraft: {
    mode: "catalog",
    marketplace: initialBrandPrefs.default_marketplace,
    style_template: initialBrandPrefs.default_style_template,
    brand_colors: initialBrandPrefs.brand_colors,
  },
};

const app = document.querySelector("#app");
let lastMotionKey = "";

function navigate(route) {
  state.navMenuOpen = false;
  state.presetsOpen = false;
  document.title = PAGE_TITLES[route] || PAGE_TITLES.home;
  location.hash = route;
}

function toast(message) {
  const root = document.querySelector("#toast-root");
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  root.append(item);
  setTimeout(() => item.remove(), 3500);
}

async function api(path, options = {}, retry = true) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (state.accessToken) headers.Authorization = `Bearer ${state.accessToken}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && state.refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed) return api(path, options, false);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.error || "Не удалось выполнить запрос");
  return data;
}

async function refreshSession() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: state.refreshToken }),
    });
    if (!response.ok) throw new Error();
    saveTokens(await response.json());
    return true;
  } catch {
    logout(false);
    return false;
  }
}

function saveTokens(tokens) {
  state.accessToken = tokens.access_token;
  state.refreshToken = tokens.refresh_token;
  localStorage.setItem("domstudio_access", state.accessToken);
  localStorage.setItem("domstudio_refresh", state.refreshToken);
}

function logout(showToast = true) {
  state.accessToken = null;
  state.refreshToken = null;
  state.user = null;
  localStorage.removeItem("domstudio_access");
  localStorage.removeItem("domstudio_refresh");
  if (showToast) toast("Вы вышли из аккаунта");
  render();
}

async function loadUser() {
  if (!state.accessToken) return;
  try {
    state.user = await api("/users/me/full");
  } catch {
    state.user = null;
  }
}

async function loadPlans() {
  if (state.plans.length) return;
  try {
    state.plans = await api("/subscriptions/plans");
  } catch {
    state.plans = [...FALLBACK_PLANS];
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char]);
}

function draftValue(name) {
  return escapeHtml(state.formDraft[name] || "");
}

function brandPrefValue(name) {
  return escapeHtml(state.brandPrefs[name] || "");
}

function selectedAttr(value, expected) {
  return value === expected ? "selected" : "";
}

function checkedAttr(value) {
  return value ? "checked" : "";
}

function planLabel(planName) {
  return PLAN_LABELS[planName] || planName;
}

function planDescription(planName) {
  return PLAN_DESCRIPTIONS[planName] || "Готовый контент для продаж";
}

function pricePerPhoto(plan) {
  if (!plan.price_rub) return "0 ₽ / фото";
  return `${Math.round(plan.price_rub / plan.photos)} ₽ / фото`;
}

function planPhotos(plan) {
  return plan.name === "business" ? "300+ фото" : `${plan.photos} фото`;
}

function truncate(value, maxLength = 500) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function currentMarketplace() {
  return MARKETPLACE_PRESETS.find((preset) => preset.id === state.formDraft.marketplace) || MARKETPLACE_PRESETS[0];
}

function currentStyleTemplate() {
  return STYLE_TEMPLATES.find((template) => template.id === state.formDraft.style_template) || STYLE_TEMPLATES[0];
}

function composeGenerationPayload(values) {
  const marketplace = MARKETPLACE_PRESETS.find((preset) => preset.id === values.marketplace) || currentMarketplace();
  const styleTemplate = STYLE_TEMPLATES.find((template) => template.id === values.style_template) || currentStyleTemplate();
  const prefs = state.brandPrefs;
  const userStyle = values.style_hint || "";
  const brandColors = values.brand_colors || prefs.brand_colors;
  const styleParts = [
    userStyle,
    ...[
      marketplace.hint,
      styleTemplate.hint,
      brandColors ? `brand colors: ${brandColors}` : "",
      prefs.preferred_background ? `preferred background: ${prefs.preferred_background}` : "",
      prefs.brand_mood ? `brand mood: ${prefs.brand_mood}` : "",
      values.constraints ? `constraints: ${values.constraints}` : "",
      prefs.do_not_use ? `avoid: ${prefs.do_not_use}` : "",
    ].filter((part) => part && !userStyle.includes(part)),
  ].filter(Boolean);

  return {
    mode: values.mode || marketplace.mode,
    subject: truncate(values.subject || values.product_type || "product"),
    style_hint: truncate(styleParts.join(", ")),
    image: state.selectedImage,
    upscale_4k: values.upscale_4k === "on" || values.upscale_4k === true,
  };
}

function syncDraftFromForm(form) {
  if (!form) return;
  const values = Object.fromEntries(new FormData(form));
  state.formDraft = {
    ...state.formDraft,
    ...values,
    upscale_4k: values.upscale_4k === "on",
  };
}

function openHistoryDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = indexedDB.open(HISTORY_DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(HISTORY_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readHistoryItems() {
  const db = await openHistoryDb();
  try {
    const tx = db.transaction(HISTORY_STORE, "readonly");
    const items = await idbRequest(tx.objectStore(HISTORY_STORE).getAll());
    return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, HISTORY_LIMIT);
  } finally {
    db.close();
  }
}

async function putHistoryItem(item) {
  const db = await openHistoryDb();
  try {
    const tx = db.transaction(HISTORY_STORE, "readwrite");
    const store = tx.objectStore(HISTORY_STORE);
    await idbRequest(store.put(item));
    const items = await idbRequest(store.getAll());
    const stale = items
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(HISTORY_LIMIT);
    await Promise.all(stale.map((oldItem) => idbRequest(store.delete(oldItem.id))));
  } finally {
    db.close();
  }
}

async function deleteHistoryItem(id) {
  const db = await openHistoryDb();
  try {
    const tx = db.transaction(HISTORY_STORE, "readwrite");
    await idbRequest(tx.objectStore(HISTORY_STORE).delete(id));
  } finally {
    db.close();
  }
}

async function purgeHistory() {
  const db = await openHistoryDb();
  try {
    const tx = db.transaction(HISTORY_STORE, "readwrite");
    await idbRequest(tx.objectStore(HISTORY_STORE).clear());
  } finally {
    db.close();
  }
}

async function clearAllHistory() {
  try {
    await purgeHistory();
    state.history = [];
    toast("История очищена");
    render();
  } catch {
    toast("Не удалось очистить историю");
  }
}

async function loadHistory() {
  try {
    state.history = await readHistoryItems();
  } catch {
    state.history = [];
  }
}

async function rememberResult(result, dataUrl, payload) {
  try {
    await putHistoryItem({
      id: String(Date.now()),
      createdAt: Date.now(),
      dataUrl,
      mode: payload.mode,
      subject: payload.subject,
      style_hint: payload.style_hint,
      variation_label: result.variation_label || "",
      width: result.width,
      height: result.height,
      format: result.format || "PNG",
    });
    state.history = await readHistoryItems();
  } catch {
    toast("Не удалось сохранить историю в браузере");
  }
}

function historyPanel() {
  if (!state.history.length) return "";
  return `<div class="history-panel">
    <div class="mini-head"><h3>Недавние результаты</h3><span>только в этом браузере</span></div>
    <div class="history-grid">
      ${state.history.map((item) => `
        <article class="history-item">
          <button class="history-thumb" type="button" data-history-id="${item.id}">
            <img src="${item.dataUrl}" alt="${escapeHtml(item.subject)}" />
          </button>
          <div>
            <b>${escapeHtml(item.subject)}</b>
            <span>${item.variation_label ? `${escapeHtml(item.variation_label)} · ` : ""}${escapeHtml(item.mode)} ${item.width && item.height ? `· ${item.width}×${item.height}` : ""}</span>
          </div>
          <button class="history-delete" type="button" data-delete-history="${item.id}" aria-label="Удалить">×</button>
        </article>`).join("")}
    </div>
  </div>`;
}

function exportTools() {
  if (!state.generatedImage) return "";
  return `<div class="export-tools">
    <div class="mini-head"><h3>Экспорт</h3><span>обработка в браузере</span></div>
    <div class="export-row">
      <select class="select compact" id="export-format">
        <option value="png">PNG</option>
        <option value="jpeg">JPG</option>
        <option value="webp">WebP</option>
      </select>
      <select class="select compact" id="export-size">
        ${Object.entries(EXPORT_SIZES).map(([id, size]) => `<option value="${id}">${size.label}</option>`).join("")}
      </select>
      <button class="button secondary" type="button" data-export>Скачать</button>
      <button class="button secondary" type="button" data-share>Поделиться</button>
    </div>
  </div>`;
}

function variationTools() {
  if (!state.generatedImage || !state.lastGenerationPayload) return "";
  return `<div class="variation-tools">
    <div class="mini-head"><h3>Вариации</h3><span>${state.generating && state.generationLabel ? escapeHtml(state.generationLabel) : "100 токенов при клике"}</span></div>
    <div class="chip-row">
      ${VARIATIONS.map((variation) => `<button class="chip" type="button" data-variation="${variation.id}" ${state.generating ? "disabled" : ""}>${variation.label}</button>`).join("")}
    </div>
  </div>`;
}

function comparisonPanel() {
  if (!state.previousGeneratedImage || !state.generatedImage || state.generating) return "";
  return `<div class="compare-panel">
    <div class="mini-head"><h3>Сравнение</h3><span>предыдущий и текущий кадр</span></div>
    <div class="compare-grid">
      <figure><img src="${state.previousGeneratedImage}" alt="Предыдущий результат" /><figcaption>Previous</figcaption></figure>
      <figure><img src="${state.generatedImage}" alt="Текущий результат" /><figcaption>Current${state.generatedMeta?.variation_label ? ` · ${escapeHtml(state.generatedMeta.variation_label)}` : ""}</figcaption></figure>
    </div>
  </div>`;
}

function contentPackTools() {
  if (!state.generatedImage || state.generating) return "";
  return `<div class="content-pack">
    <div class="mini-head"><h3>Пакет для площадок</h3><span>скачать одним кликом</span></div>
    <div class="pack-grid">
      ${PACK_FORMATS.map((fmt) => `<button class="pack-btn" type="button" data-pack="${fmt.id}">${fmt.label}<span>${EXPORT_SIZES[fmt.size].label}</span></button>`).join("")}
    </div>
  </div>`;
}

function nav() {
  const logged = Boolean(state.user);
  const navItems = [
    ["home", "Главная"],
    ["studio", "Студия"],
    ["pricing", "Тарифы"],
    ...(logged ? [["history", "История"], ["account", "Аккаунт"]] : []),
  ];
  const initials = logged ? String(state.user.email || state.user.phone || "DS").slice(0, 2).toUpperCase() : "";
  return `
    <nav class="nav ${state.navCompact ? "compact" : ""}">
      <div class="nav-inner">
      <button class="brand" data-route="home"><span class="brand-mark">DS</span><span class="brand-word">Dom<span>Studio</span></span></button>
      <div class="nav-links ${state.navMenuOpen ? "open" : ""}">
        ${navItems.map(([route, label]) => `<button class="nav-link ${state.route === route ? "active" : ""}" data-route="${route}">${label}</button>`).join("")}
        <div class="nav-dropdown ${state.presetsOpen ? "open" : ""}">
          <button class="nav-link dropdown-trigger" type="button" data-toggle-presets>Пресеты <span>⌄</span></button>
          <div class="preset-menu">
            ${MARKETPLACE_PRESETS.map((preset) => {
              const desc = preset.mode === "mobile" ? "9:16 · сторис" : preset.mode === "creative" ? "4:5 · VK / Telegram" : preset.mode === "product" ? "баннер · премиум" : "карточка маркетплейса";
              return `<button type="button" data-preset-route="${preset.id}"><b>${preset.label}</b><span>${desc}</span></button>`;
            }).join("")}
          </div>
        </div>
      </div>
      <div class="nav-actions">
        ${logged
          ? `<button class="token-pill" data-route="account"><span>${state.user.tokens}</span> токенов</button>
             <button class="profile-pill" data-route="account"><span>${escapeHtml(initials)}</span></button>
             <button class="button gold nav-cta" data-route="studio">Создать фото</button>`
          : `<button class="button secondary" data-auth="login">Войти</button>
             <button class="button gold nav-cta" data-auth="register">Создать бесплатно</button>`}
        <button class="nav-menu-button ${state.navMenuOpen ? "open" : ""}" type="button" data-toggle-menu aria-label="Открыть меню"><span></span><span></span></button>
      </div>
      </div>
    </nav>`;
}

function footer() {
  return `<footer class="footer"><b>DomStudio</b><span>AI-фотостудия для бизнеса · 2026</span></footer>`;
}

function homePage() {
  return `
    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">AI-студия для продавцов маркетплейсов</div>
          <h1>Контент, который <em>продаёт</em></h1>
          <p>Загрузите обычное фото товара, выберите площадку — Wildberries, Ozon, Yandex, Avito — и получите готовую карточку, сторис или баннер за минуты.</p>
          <div class="hero-actions">
            <button class="button gold" data-route="studio">Создать первое фото</button>
            <button class="button secondary" data-route="pricing">Посмотреть тарифы</button>
          </div>
          <div class="trust-row"><span>5 фото бесплатно</span><span>30 фото за 270 ₽</span><span>WB · Ozon · Yandex · Avito</span></div>
        </div>
        <div class="hero-visual">
          <div class="hero-studio-card">
            <div class="studio-card-top">
              <span>Mini studio</span>
              <b>WB · Ozon · Yandex · Avito</b>
            </div>
            <div class="hero-proof-frame"><img src="${productProofUrl}" alt="Пример улучшения товарного фото в DomStudio" /></div>
            <div class="mini-studio-controls">
              <label><span>Фото товара</span><button type="button" data-route="studio">Загрузить</button></label>
              <label><span>Промпт</span><input value="сыворотка на светлом фоне" readonly /></label>
              <div class="preset-pills"><span>Wildberries</span><span>Ozon</span><span>Avito</span><span>1080×1080</span></div>
              <button class="button gold block" type="button" data-route="studio">Создать бесплатно</button>
            </div>
          </div>
          <div class="float-card"><b>AI</b><span>обычный снимок → готовый кадр</span></div>
        </div>
      </section>

      <section class="section proof-section">
        <div class="section-head">
          <h2>Сначала покажите результат. Потом объясняйте.</h2>
          <p>DomStudio должен сразу доказывать ценность: обычный снимок превращается в карточку товара, баннер или social creative без тяжёлого хранения на сервере.</p>
        </div>
        <div class="proof-grid">
          <article class="proof-visual"><img src="${productProofUrl}" alt="До и после AI-обработки товарного фото" /></article>
          <div class="proof-copy">
            <div class="proof-stat"><b>30</b><span>фото в первом платном пакете</span></div>
            <div class="proof-stat"><b>270 ₽</b><span>низкий вход после бесплатных 5</span></div>
            <div class="proof-stat"><b>3 формата</b><span>карточка, пост, сторис и widescreen export</span></div>
          </div>
        </div>
      </section>

      <section class="section modes-section">
        <div class="section-head">
          <h2>Одна студия. Шесть способов показать товар.</h2>
          <p>Выберите задачу, добавьте описание и получите визуал в нужном формате.</p>
        </div>
        <div class="mode-grid">
          ${MODES.map((mode, index) => `
            <article class="mode-card">
              <figure class="mode-visual proof-compare">
                <img class="proof-after" src="${mode[3]}" alt="${mode[4]}" loading="lazy" />
                <div class="proof-before">
                  <img src="${mode[5]}" alt="Обычный исходный кадр для режима ${mode[1]}" loading="lazy" />
                  <span>До</span>
                </div>
                <span class="proof-after-label">После</span>
              </figure>
              <div class="mode-card-topline"><span class="number">0${index + 1}</span><span>${mode[6]}</span></div>
              <h3>${mode[1]}</h3>
              <p>${mode[2]}</p>
            </article>`).join("")}
        </div>
      </section>

      <section class="section dark workflow-section">
        <div class="section-head"><h2>От снимка до готового контента</h2><p>Без аренды, команды и недель ожидания.</p></div>
        <div class="steps">
          <article class="step"><b>01</b><h3>Загрузите</h3><p>Сфотографируйте товар на телефон или начните с текстового описания.</p></article>
          <article class="step"><b>02</b><h3>Настройте</h3><p>Выберите формат съёмки, стиль и нужное разрешение.</p></article>
          <article class="step"><b>03</b><h3>Скачайте</h3><p>Получите готовый кадр и используйте его в продажах.</p></article>
        </div>
      </section>
    </main>`;
}

function gatePage() {
  return `<main class="page"><section class="gate"><div class="eyebrow">Личный кабинет</div><h1>Сначала создадим аккаунт</h1><p>В аккаунте хранятся токены, тариф и результаты генерации.</p><button class="button gold" data-auth="register">Начать бесплатно</button></section></main>`;
}

function appSidebar(active) {
  return `<aside class="sidebar">
    <p class="side-caption">Рабочее пространство</p>
    <button class="side-link ${active === "studio" ? "active" : ""}" data-route="studio">✦ Новая генерация</button>
    <button class="side-link ${active === "history" ? "active" : ""}" data-route="history">◑ История</button>
    <button class="side-link ${active === "account" ? "active" : ""}" data-route="account">◫ Обзор аккаунта</button>
    <button class="side-link ${active === "pricing" ? "active" : ""}" data-route="pricing">◇ Тарифы и токены</button>
    <button class="side-link" data-logout>Выйти</button>
  </aside>`;
}

function studioPage() {
  if (!state.user) return gatePage();
  return `<main class="app-layout">
    ${appSidebar("studio")}
    <section class="workspace">
      <header class="workspace-head"><div><div class="eyebrow">Новая генерация</div><h1>AI-студия</h1></div><div class="balance"><span>${state.user.tokens}</span> токенов</div></header>
      <div class="studio-grid">
        <form class="panel" id="generate-form">
          <div class="form-section">
            <div class="field"><label for="marketplace">Площадка</label><select class="select" id="marketplace" name="marketplace">${MARKETPLACE_PRESETS.map(preset => `<option value="${preset.id}" ${selectedAttr(state.formDraft.marketplace, preset.id)}>${preset.label}</option>`).join("")}</select></div>
            <div class="field"><label for="style_template">Шаблон стиля</label><select class="select" id="style_template" name="style_template">${STYLE_TEMPLATES.map(template => `<option value="${template.id}" ${selectedAttr(state.formDraft.style_template, template.id)}>${template.label}</option>`).join("")}</select></div>
            <div class="field"><label for="mode">Режим съёмки</label><select class="select" id="mode" name="mode">${MODES.map(mode => `<option value="${mode[0]}" ${selectedAttr(state.formDraft.mode, mode[0])}>${mode[1]} — ${mode[2]}</option>`).join("")}</select></div>
          </div>
          <div class="brand-preferences collapsible ${state.brandPrefsOpen ? "open" : ""}">
            <button class="collapsible-head" type="button" data-toggle-brand>
              <span><h3>Бренд</h3><small>площадка, стиль, цвета по умолчанию</small></span>
              <span class="chevron">${state.brandPrefsOpen ? "−" : "+"}</span>
            </button>
            ${state.brandPrefsOpen ? `<div class="collapsible-body">
              <div class="helper-grid">
                <div class="field"><label for="brand_pref_colors">Цвета</label><input class="input" id="brand_pref_colors" name="brand_pref_colors" value="${brandPrefValue("brand_colors")}" placeholder="ivory, gold, deep green" /></div>
                <div class="field"><label for="brand_pref_background">Фон</label><input class="input" id="brand_pref_background" name="brand_pref_background" value="${brandPrefValue("preferred_background")}" placeholder="тёплый светлый фон" /></div>
                <div class="field"><label for="brand_pref_mood">Настроение</label><input class="input" id="brand_pref_mood" name="brand_pref_mood" value="${brandPrefValue("brand_mood")}" placeholder="clean luxury, calm, premium" /></div>
                <div class="field"><label for="brand_pref_avoid">Не использовать</label><input class="input" id="brand_pref_avoid" name="brand_pref_avoid" value="${brandPrefValue("do_not_use")}" placeholder="неон, дешёвый пластик, текст" /></div>
              </div>
              <button class="button secondary block" type="button" data-save-brand>Сохранить бренд</button>
            </div>` : ""}
          </div>
          <div class="prompt-helper collapsible ${state.promptHelperOpen ? "open" : ""}">
            <button class="collapsible-head" type="button" data-toggle-prompt>
              <span><h3>Помощник промпта</h3><small>соберёт описание и стиль автоматически</small></span>
              <span class="chevron">${state.promptHelperOpen ? "−" : "+"}</span>
            </button>
            ${state.promptHelperOpen ? `<div class="collapsible-body">
              <div class="helper-grid">
                <div class="field"><label for="product_type">Тип товара</label><input class="input" id="product_type" name="product_type" value="${draftValue("product_type")}" placeholder="Золотые серьги-кольца" /></div>
                <div class="field"><label for="brand_colors">Цвета бренда</label><input class="input" id="brand_colors" name="brand_colors" value="${draftValue("brand_colors") || brandPrefValue("brand_colors")}" placeholder="ivory, gold, deep green" /></div>
                <div class="field wide"><label for="constraints">Ограничения</label><input class="input" id="constraints" name="constraints" value="${draftValue("constraints")}" placeholder="без текста, без рук, сохранить форму упаковки" /></div>
              </div>
              <button class="button secondary block" type="button" data-build-prompt>Собрать промпт из настроек</button>
            </div>` : ""}
          </div>
          <div class="field"><label for="subject">Что снимаем</label><textarea class="textarea" id="subject" name="subject" required placeholder="Например: золотые серьги-кольца на светлом фоне">${draftValue("subject")}</textarea></div>
          <div class="field"><label for="style_hint">Пожелания к стилю</label><input class="input" id="style_hint" name="style_hint" value="${draftValue("style_hint")}" placeholder="Тёплый свет, премиальный минимализм" /></div>
          <label class="upload" id="upload-label"><input type="file" id="image" accept="image/*" multiple /><span><strong>${state.batchQueue.length > 1 ? `${state.batchQueue.length} фото в очереди` : state.selectedImageName ? escapeHtml(state.selectedImageName) : "Добавить фото товара"}</strong><br />${state.batchQueue.length > 1 ? `${state.batchQueue.length * 100} токенов на пакет` : state.selectedImageName ? "Фото готово к генерации" : "PNG или JPEG · несколько файлов"}</span></label>
          <label class="check"><input type="checkbox" name="upscale_4k" ${checkedAttr(state.formDraft.upscale_4k)} /> Сделать дополнительный 4K-апскейл</label>
          <button class="button gold block" type="submit" ${state.generating ? "disabled" : ""}>${state.generating ? (state.batchTotal > 1 ? `Пакет ${state.batchIndex}/${state.batchTotal}…` : "Создаём кадр…") : (state.batchQueue.length > 1 ? `Создать пакет · ${state.batchQueue.length * 100} токенов` : "Создать фото · 100 токенов")}</button>
          ${state.user.tokens < 100
            ? `<p class="token-hint warn">Токенов недостаточно — <button class="text-button" type="button" data-route="pricing">пополнить тариф</button></p>`
            : `<p class="token-hint">У вас ${state.user.tokens} токенов · хватит на ~${Math.floor(state.user.tokens / 100)} фото</p>`}
        </form>
        <div class="panel">
          <div class="result ${state.generating && !state.generatedImage ? "loading" : ""}">
            ${state.generatedImage
              ? `<img src="${state.generatedImage}" alt="Сгенерированный результат" />${state.generating ? `<div class="result-status">${escapeHtml(state.generationLabel || "Создаём новый кадр…")}</div>` : ""}`
              : `<div class="result-empty"><b>${state.generating ? "Собираем студию…" : "Здесь появится результат"}</b>${state.generating ? "Генерация может занять несколько минут." : "Заполните описание, выберите режим и запустите генерацию."}</div>`}
          </div>
          ${state.generatedMeta ? `<p class="result-meta">${state.generatedMeta.variation_label ? `${escapeHtml(state.generatedMeta.variation_label)} · ` : ""}${state.generatedMeta.width || "?"}×${state.generatedMeta.height || "?"} · ${escapeHtml(state.generatedMeta.mode || "")}</p>` : ""}
          ${exportTools()}
          ${contentPackTools()}
          ${comparisonPanel()}
          ${variationTools()}
          ${historyPanel()}
        </div>
      </div>
    </section>
  </main>`;
}

function accountPage() {
  if (!state.user) return gatePage();
  const sub = state.user.subscription || {};
  const planName = sub.plan || "free";
  const isFree = planName === "free";
  const lowTokens = state.user.tokens < 300;
  const recentHistory = state.history.slice(0, 3);
  const bp = state.brandPrefs;
  const hasBrand = bp.brand_colors || bp.preferred_background || bp.brand_mood || bp.do_not_use;

  return `<main class="app-layout">
    ${appSidebar("account")}
    <section class="workspace">
      <header class="workspace-head"><div><div class="eyebrow">Аккаунт</div><h1>Обзор</h1></div><button class="button gold" data-route="studio">Создать фото</button></header>

      <div class="stats">
        <article class="stat"><span>Тариф</span><b>${planLabel(planName)}</b></article>
        <article class="stat"><span>Токенов осталось</span><b>${state.user.tokens.toLocaleString("ru-RU")}</b></article>
        <article class="stat"><span>Фото в периоде</span><b>${sub.photos_used || 0} / ${sub.photos_limit || 5}</b></article>
      </div>

      ${isFree || lowTokens ? `
      <div class="upgrade-cta">
        <div class="upgrade-cta-copy">
          <b>${isFree ? "Попробуйте Старт — 270 ₽/мес" : "Токены заканчиваются"}</b>
          <span>${isFree ? "30 фото, 3 000 токенов, все режимы съёмки" : "Пополните тариф, чтобы не прерываться"}</span>
        </div>
        <button class="button gold" data-route="pricing">Выбрать тариф</button>
      </div>` : ""}

      ${recentHistory.length ? `
      <div class="panel account-section">
        <div class="account-section-head"><h3>Недавние результаты</h3><span>из браузера</span></div>
        <div class="history-grid">
          ${recentHistory.map((item) => `
            <article class="history-item">
              <button class="history-thumb" type="button" data-history-id="${item.id}">
                <img src="${item.dataUrl}" alt="${escapeHtml(item.subject)}" />
              </button>
              <div>
                <b>${escapeHtml(item.subject)}</b>
                <span>${escapeHtml(item.mode)}${item.width ? ` · ${item.width}×${item.height}` : ""}</span>
              </div>
              <button class="history-delete" type="button" data-delete-history="${item.id}" aria-label="Удалить">×</button>
            </article>`).join("")}
        </div>
        <button class="button secondary" style="margin-top:14px" data-route="studio">Открыть студию</button>
      </div>` : ""}

      ${hasBrand ? `
      <div class="panel account-section">
        <div class="account-section-head"><h3>Бренд</h3><button class="text-button" data-route="studio">Изменить</button></div>
        <dl class="brand-summary">
          ${bp.brand_colors ? `<div><dt>Цвета</dt><dd>${escapeHtml(bp.brand_colors)}</dd></div>` : ""}
          ${bp.preferred_background ? `<div><dt>Фон</dt><dd>${escapeHtml(bp.preferred_background)}</dd></div>` : ""}
          ${bp.brand_mood ? `<div><dt>Настроение</dt><dd>${escapeHtml(bp.brand_mood)}</dd></div>` : ""}
          ${bp.do_not_use ? `<div><dt>Избегать</dt><dd>${escapeHtml(bp.do_not_use)}</dd></div>` : ""}
        </dl>
      </div>` : ""}

      <div class="panel account-section">
        <div class="account-section-head"><h3>Данные аккаунта</h3></div>
        <p class="account-contact">${escapeHtml(state.user.email || state.user.phone || "—")}</p>
        <p class="account-status ${state.user.is_verified ? "verified" : "pending"}">${state.user.is_verified ? "✓ Подтверждён" : "⏳ Ожидает подтверждения"}</p>
      </div>
    </section>
  </main>`;
}

function historyPage() {
  const modeFilters = [
    { id: "all", label: "Все" },
    ...MODES.map(([id, label]) => ({ id, label })),
  ];
  const filtered = state.history.filter(
    item => state.historyFilter === "all" || item.mode === state.historyFilter
  );
  return `<main class="${state.user ? "app-layout" : "page"}">
    ${state.user ? appSidebar("history") : ""}
    <section class="${state.user ? "workspace" : "section"}">
      <header class="workspace-head">
        <div><div class="eyebrow">Браузер</div><h1>История</h1></div>
        ${state.history.length ? `<button class="button secondary" data-clear-history>Очистить всё</button>` : ""}
      </header>
      ${state.history.length ? `
        <div class="chip-row" style="margin-bottom: 20px;">
          ${modeFilters.map(m => `<button class="chip ${state.historyFilter === m.id ? "chip-active" : ""}" type="button" data-history-filter="${m.id}">${m.label}</button>`).join("")}
        </div>
        ${filtered.length ? `
          <div class="history-full-grid">
            ${filtered.map(item => {
              const d = new Date(item.createdAt);
              const dateStr = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
              const timeStr = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
              return `<article class="history-card">
                <button class="history-card-thumb" type="button" data-history-id="${item.id}">
                  <img src="${item.dataUrl}" alt="${escapeHtml(item.subject)}" loading="lazy" />
                </button>
                <div class="history-card-info">
                  <b>${escapeHtml(item.subject)}</b>
                  <span>${escapeHtml(item.mode)}${item.variation_label ? ` · ${escapeHtml(item.variation_label)}` : ""}${item.width ? ` · ${item.width}×${item.height}` : ""}</span>
                  <time>${dateStr}, ${timeStr}</time>
                </div>
                <button class="history-delete" type="button" data-delete-history="${item.id}" aria-label="Удалить">×</button>
              </article>`;
            }).join("")}
          </div>
        ` : `<p class="history-empty-filter">Нет результатов для этого режима.</p>`}
      ` : `
        <div class="history-empty">
          <b>История пуста</b>
          <p>Результаты сохраняются только в этом браузере — появятся здесь после первой генерации.</p>
          <button class="button gold" data-route="studio">Создать первое фото</button>
        </div>
      `}
    </section>
  </main>`;
}

function pricingPage() {
  const cards = state.plans.filter(plan => ["free", "basic", "pro", "business"].includes(plan.name));
  return `<main class="${state.user ? "app-layout" : "page"}">
    ${state.user ? appSidebar("pricing") : ""}
    <section class="${state.user ? "workspace" : "section"}">
      <header class="workspace-head"><div><div class="eyebrow">Тарифы</div><h1>Масштабируйте контент</h1></div></header>
      <div class="price-grid">
        ${cards.map(plan => `
          <article class="price-card ${plan.name === "pro" ? "featured" : ""}">
            <div class="plan-kicker">${planDescription(plan.name)}</div>
            <h3>${planLabel(plan.name)}</h3>
            <div class="price">${plan.price_rub.toLocaleString("ru-RU")} ₽ <small>/ месяц</small></div>
            <ul class="price-list"><li>${planPhotos(plan)}</li><li>${pricePerPhoto(plan)}</li><li>${plan.tokens.toLocaleString("ru-RU")} токенов</li><li>Все режимы съёмки</li></ul>
            <button class="button ${plan.name === "pro" ? "gold" : ""}" data-plan="${plan.name}">${plan.price_rub ? "Выбрать тариф" : "Начать бесплатно"}</button>
          </article>`).join("")}
      </div>

      <div class="topup-section">
        <div class="mini-head"><h3>Докупить токены</h3><span>без смены тарифа · сгорают при следующем пополнении</span></div>
        <div class="topup-grid">
          ${TOKEN_PACKS.map(pack => `
            <article class="topup-card">
              <b>${pack.label}</b>
              <span>~${Math.floor(pack.tokens / 100)} фото</span>
              <div class="topup-price">${pack.price_rub} ₽</div>
              <button class="button secondary" data-pack-id="${pack.pack_id}">Купить</button>
            </article>`).join("")}
        </div>
      </div>
    </section>
  </main>`;
}

function authModal() {
  if (!state.authMode) return "";
  const isPhone = state.authChannel === "phone";
  if (state.authMode === "verify") {
    return `<div class="modal-backdrop">
      <form class="modal auth-modal compact" id="verify-form">
        <div class="modal-top"><div><div class="eyebrow">Подтверждение</div><h2>Проверьте ${state.verificationKind === "phone" ? "телефон" : "почту"}</h2></div><button class="close" type="button" data-close>×</button></div>
        <div class="notice">Код отправлен на <b>${escapeHtml(state.verificationContact)}</b>. Введите 6 цифр, чтобы открыть студию.</div>
        <div class="code-field"><input class="input" name="code" inputmode="numeric" autocomplete="one-time-code" required maxlength="6" placeholder="000000" /></div>
        <button class="button gold block" type="submit" ${state.authLoading ? "disabled" : ""}>${state.authLoading ? "Проверяем…" : "Подтвердить и войти"}</button>
        <button class="text-button auth-back" type="button" data-auth="${state.verificationReturnMode}">Изменить контакт</button>
      </form>
    </div>`;
  }
  const register = state.authMode === "register";
  return `<div class="modal-backdrop">
    <form class="modal auth-modal" id="auth-form">
      <div class="auth-side">
        <div class="brand auth-brand">Dom<span>Studio</span></div>
        <h2>${register ? "Создайте студию за минуту" : "Добро пожаловать обратно"}</h2>
        <p>${register ? "Бесплатный старт включает токены, пресеты маркетплейсов и браузерную историю без облачного хранения изображений." : "Продолжите работу с токенами, брендом, историей и готовыми экспортами."}</p>
        <ul class="auth-benefits">
          <li>5 фото на бесплатном старте</li>
          <li>История хранится только в браузере</li>
          <li>Пресеты WB, Ozon, Yandex и соцсетей</li>
        </ul>
      </div>
      <div class="auth-main">
        <div class="modal-top"><div><div class="eyebrow">Аккаунт</div><h2>${register ? "Регистрация" : "Вход"}</h2></div><button class="close" type="button" data-close>×</button></div>
        <div class="auth-tabs">
          <button class="${state.authChannel === "email" ? "active" : ""}" type="button" data-auth-channel="email">Email</button>
          <button class="${state.authChannel === "phone" ? "active" : ""}" type="button" data-auth-channel="phone">Телефон</button>
        </div>
        ${isPhone
          ? `<div class="field"><label>Телефон</label><input class="input" type="tel" name="phone" autocomplete="tel" required placeholder="+7 999 123-45-67" /></div>
             <div class="notice muted">${register ? "Мы отправим код подтверждения по SMS." : "Для входа отправим одноразовый SMS-код."}</div>`
          : `<div class="field"><label>Email</label><input class="input" type="email" name="email" autocomplete="email" required placeholder="you@brand.com" /></div>
             <div class="field"><label>Пароль</label><div class="password-wrap"><input class="input" type="${state.passwordVisible ? "text" : "password"}" name="password" autocomplete="${register ? "new-password" : "current-password"}" minlength="8" required placeholder="Минимум 8 символов" /><button type="button" data-toggle-password>${state.passwordVisible ? "Скрыть" : "Показать"}</button></div></div>`}
        ${register ? `<label class="check compact"><input type="checkbox" required /> Я понимаю, что первые результаты сохраняются только в этом браузере</label>` : ""}
        <button class="button gold block" type="submit" ${state.authLoading ? "disabled" : ""}>${state.authLoading ? "Подождите…" : register ? (isPhone ? "Получить код" : "Создать аккаунт") : (isPhone ? "Войти по SMS" : "Войти")}</button>
        <p class="auth-switch">${register ? "Уже есть аккаунт?" : "Ещё нет аккаунта?"} <button class="text-button" type="button" data-auth="${register ? "login" : "register"}">${register ? "Войти" : "Создать аккаунт"}</button></p>
      </div>
    </form>
  </div>`;
}

function render(options = {}) {
  const page = state.route === "studio" ? studioPage()
    : state.route === "pricing" ? pricingPage()
    : state.route === "account" ? accountPage()
    : state.route === "history" ? historyPage()
    : homePage();
  document.title = PAGE_TITLES[state.route] || PAGE_TITLES.home;
  const motionKey = `${state.route}:${state.authMode || "none"}`;
  const shouldAnimateEntrance = options.motion ?? motionKey !== lastMotionKey;
  app.innerHTML = `<div class="shell">${nav()}${page}${footer()}${authModal()}</div>`;
  bind();
  runMotion({ entrance: shouldAnimateEntrance });
  lastMotionKey = motionKey;
}

function bind() {
  document.querySelectorAll("[data-route]").forEach(el => el.addEventListener("click", () => navigate(el.dataset.route)));
  document.querySelectorAll("[data-toggle-presets]").forEach(el => el.addEventListener("click", togglePresetsMenu));
  document.querySelectorAll("[data-toggle-menu]").forEach(el => el.addEventListener("click", toggleNavMenu));
  document.querySelectorAll("[data-preset-route]").forEach(el => el.addEventListener("click", () => {
    const preset = MARKETPLACE_PRESETS.find((item) => item.id === el.dataset.presetRoute);
    if (preset) {
      state.formDraft.marketplace = preset.id;
      state.formDraft.mode = preset.mode;
    }
    navigate("studio");
  }));
  document.querySelectorAll("[data-auth]").forEach(el => el.addEventListener("click", () => { state.authMode = el.dataset.auth; state.authLoading = false; render(); }));
  document.querySelectorAll("[data-auth-channel]").forEach(el => el.addEventListener("click", () => { state.authChannel = el.dataset.authChannel; render({ motion: false }); }));
  document.querySelectorAll("[data-toggle-password]").forEach(el => el.addEventListener("click", () => togglePasswordVisibility(el)));
  document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", () => { state.authMode = null; state.authLoading = false; render(); }));
  document.querySelectorAll("[data-logout]").forEach(el => el.addEventListener("click", () => logout()));
  document.querySelectorAll("[data-plan]").forEach(el => el.addEventListener("click", () => choosePlan(el.dataset.plan)));
  document.querySelectorAll("[data-pack-id]").forEach(el => el.addEventListener("click", () => choosePack(el.dataset.packId)));
  document.querySelector("#auth-form")?.addEventListener("submit", submitAuth);
  document.querySelector("#verify-form")?.addEventListener("submit", submitVerification);
  document.querySelector("#generate-form")?.addEventListener("submit", submitGeneration);
  document.querySelector("#generate-form")?.addEventListener("input", event => {
    if (event.target.type !== "file") syncDraftFromForm(event.currentTarget);
  });
  document.querySelector("#generate-form")?.addEventListener("change", event => {
    if (event.target.type !== "file") syncDraftFromForm(event.currentTarget);
  });
  document.querySelector("#marketplace")?.addEventListener("change", selectMarketplacePreset);
  document.querySelector("[data-toggle-brand]")?.addEventListener("click", toggleBrandPrefs);
  document.querySelector("[data-toggle-prompt]")?.addEventListener("click", togglePromptHelper);
  document.querySelector("[data-save-brand]")?.addEventListener("click", saveBrandPreferences);
  document.querySelector("[data-build-prompt]")?.addEventListener("click", buildPromptFromHelper);
  document.querySelectorAll("[data-variation]").forEach(el => el.addEventListener("click", () => regenerateVariation(el.dataset.variation)));
  document.querySelector("[data-export]")?.addEventListener("click", exportGeneratedImage);
  document.querySelectorAll("[data-pack]").forEach(el => el.addEventListener("click", () => exportForPack(el.dataset.pack)));
  document.querySelectorAll("[data-history-id]").forEach(el => el.addEventListener("click", () => restoreHistoryItem(el.dataset.historyId)));
  document.querySelectorAll("[data-delete-history]").forEach(el => el.addEventListener("click", () => removeHistoryItem(el.dataset.deleteHistory)));
  document.querySelectorAll("[data-history-filter]").forEach(el => el.addEventListener("click", () => { state.historyFilter = el.dataset.historyFilter; render({ motion: false }); }));
  document.querySelector("[data-clear-history]")?.addEventListener("click", clearAllHistory);
  document.querySelector("[data-share]")?.addEventListener("click", shareResult);
  document.querySelector("#image")?.addEventListener("change", selectImage);
}

function togglePresetsMenu() {
  state.presetsOpen = !state.presetsOpen;
  const dropdown = document.querySelector(".nav-dropdown");
  dropdown?.classList.toggle("open", state.presetsOpen);
  if (state.presetsOpen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const menu = gsap.utils.toArray(".nav-dropdown.open .preset-menu");
    if (menu.length) gsap.from(menu, { y: 8, opacity: 0, scale: 0.98, duration: 0.2, ease: "power2.out" });
  }
}

function toggleNavMenu() {
  state.navMenuOpen = !state.navMenuOpen;
  if (!state.navMenuOpen) state.presetsOpen = false;
  document.querySelector(".nav-links")?.classList.toggle("open", state.navMenuOpen);
  document.querySelector(".nav-menu-button")?.classList.toggle("open", state.navMenuOpen);
  document.querySelector(".nav-dropdown")?.classList.toggle("open", state.presetsOpen);
}

function togglePasswordVisibility(button) {
  state.passwordVisible = !state.passwordVisible;
  const input = button.closest(".password-wrap")?.querySelector("input");
  if (!input) return;
  input.type = state.passwordVisible ? "text" : "password";
  button.textContent = state.passwordVisible ? "Скрыть" : "Показать";
  input.focus({ preventScroll: true });
}

function handleScroll() {
  const compact = window.scrollY > 24;
  if (compact === state.navCompact) return;
  state.navCompact = compact;
  document.querySelector(".nav")?.classList.toggle("compact", compact);
}

function runMotion({ entrance = true } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const q = (selector) => gsap.utils.toArray(selector);
  const animateFrom = (selector, vars) => {
    const targets = q(selector);
    if (targets.length) gsap.from(targets, vars);
  };
  const animateTo = (selector, vars) => {
    const targets = q(selector);
    if (targets.length) gsap.to(targets, vars);
  };
  const animateFromTo = (selector, fromVars, toVars) => {
    const targets = q(selector);
    if (targets.length) gsap.fromTo(targets, fromVars, toVars);
  };
  const motionTargets = [
    ".nav",
    ".hero-copy > *",
    ".hero-visual",
    ".hero-studio-card",
    ".float-card",
    ".proof-visual",
    ".proof-stat",
    ".mode-card",
    ".step",
    ".workspace-head",
    ".panel",
    ".stat",
    ".price-card",
    ".modal-backdrop",
    ".modal",
    ".preset-menu",
    ".motion-shimmer",
  ].flatMap(q);
  if (motionTargets.length) gsap.killTweensOf(motionTargets);

  if (entrance) {
    animateFrom(".nav-inner", { y: -18, opacity: 0, scale: 0.98, duration: 0.45, ease: "power2.out" });
  }

  if (entrance && state.route === "home") {
    animateFrom(".hero-copy > *", {
      y: 24,
      opacity: 0,
      duration: 0.7,
      stagger: 0.07,
      ease: "power3.out",
    });
    animateFrom(".hero-visual", { y: 28, opacity: 0, scale: 0.97, duration: 0.85, ease: "power3.out", delay: 0.08 });
    animateTo(".hero-studio-card", { y: -10, rotation: 0.4, duration: 4.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    animateTo(".float-card", { y: 12, duration: 3.7, repeat: -1, yoyo: true, ease: "sine.inOut" });
    animateFrom(".proof-visual, .proof-stat, .mode-card, .step", {
      y: 26,
      opacity: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: "power2.out",
      delay: 0.16,
    });
  } else if (entrance) {
    animateFrom(".workspace-head, .panel, .stat, .price-card", {
      y: 18,
      opacity: 0,
      duration: 0.45,
      stagger: 0.045,
      ease: "power2.out",
    });
  }

  if (entrance && document.querySelector(".modal-backdrop")) {
    animateFrom(".modal-backdrop", { opacity: 0, duration: 0.22, ease: "power2.out" });
    animateFrom(".modal", { y: 24, opacity: 0, scale: 0.97, duration: 0.34, ease: "back.out(1.4)" });
  }
  if (document.querySelector(".nav-dropdown.open .preset-menu")) {
    animateFrom(".nav-dropdown.open .preset-menu", { y: 10, opacity: 0, scale: 0.98, duration: 0.24, ease: "power2.out" });
  }

  q(".button, .mode-card, .price-card, .chip, .history-thumb, .nav-link, .token-pill, .profile-pill").forEach((el) => {
    el.addEventListener("mouseenter", () => gsap.to(el, { y: -1, duration: 0.16, ease: "power2.out" }));
    el.addEventListener("mouseleave", () => gsap.to(el, { y: 0, duration: 0.18, ease: "power2.out" }));
  });

  q(".button.gold, .balance, .featured, .token-pill, .brand-mark").forEach((el) => {
    if (!el.querySelector(".motion-shimmer")) {
      const shimmer = document.createElement("span");
      shimmer.className = "motion-shimmer";
      el.append(shimmer);
    }
  });
  animateFromTo(".motion-shimmer", { xPercent: -160 }, {
    xPercent: 160,
    duration: 1.35,
    repeat: -1,
    repeatDelay: 3.2,
    ease: "power2.inOut",
  });
}

function selectMarketplacePreset(event) {
  const preset = MARKETPLACE_PRESETS.find((item) => item.id === event.currentTarget.value);
  if (!preset) return;
  state.formDraft.marketplace = preset.id;
  state.formDraft.mode = preset.mode;
  const modeSelect = document.querySelector("#mode");
  if (modeSelect) modeSelect.value = preset.mode;
  syncDraftFromForm(document.querySelector("#generate-form"));
}

function toggleBrandPrefs() {
  state.brandPrefsOpen = !state.brandPrefsOpen;
  render({ motion: false });
}

function togglePromptHelper() {
  state.promptHelperOpen = !state.promptHelperOpen;
  render({ motion: false });
}

function buildPromptFromHelper() {
  const form = document.querySelector("#generate-form");
  if (!form) return;
  syncDraftFromForm(form);

  const values = { ...state.formDraft };
  const marketplace = currentMarketplace();
  const styleTemplate = currentStyleTemplate();
  const prefs = state.brandPrefs;
  const brandColors = values.brand_colors || prefs.brand_colors;
  const productType = values.product_type || values.subject || "";
  const subject = truncate([productType, marketplace.subjectInstruction].filter(Boolean).join(". "));
  const styleHint = truncate([
    styleTemplate.hint,
    marketplace.hint,
    brandColors ? `brand colors: ${brandColors}` : "",
    prefs.preferred_background ? `preferred background: ${prefs.preferred_background}` : "",
    prefs.brand_mood ? `brand mood: ${prefs.brand_mood}` : "",
    values.constraints ? `constraints: ${values.constraints}` : "",
    prefs.do_not_use ? `avoid: ${prefs.do_not_use}` : "",
  ].filter(Boolean).join(", "));

  form.elements.subject.value = subject;
  form.elements.style_hint.value = styleHint;
  state.formDraft.subject = subject;
  state.formDraft.style_hint = styleHint;
  toast("Промпт собран");
}

function saveBrandPreferences() {
  const form = document.querySelector("#generate-form");
  if (!form) return;
  syncDraftFromForm(form);

  state.brandPrefs = {
    brand_colors: form.elements.brand_pref_colors.value.trim(),
    preferred_background: form.elements.brand_pref_background.value.trim(),
    brand_mood: form.elements.brand_pref_mood.value.trim(),
    do_not_use: form.elements.brand_pref_avoid.value.trim(),
    default_marketplace: form.elements.marketplace.value,
    default_style_template: form.elements.style_template.value,
  };
  state.formDraft = {
    ...state.formDraft,
    marketplace: state.brandPrefs.default_marketplace,
    style_template: state.brandPrefs.default_style_template,
    brand_colors: state.formDraft.brand_colors || state.brandPrefs.brand_colors,
  };
  saveBrandPrefs(state.brandPrefs);
  toast("Бренд сохранён в браузере");
  render();
}

async function regenerateVariation(variationId) {
  const variation = VARIATIONS.find((item) => item.id === variationId);
  if (!variation || !state.lastGenerationPayload) return;
  await generateWithPayload({
    ...state.lastGenerationPayload,
    style_hint: truncate(`${state.lastGenerationPayload.style_hint}, ${variation.hint}`),
    seed: -1,
  }, {
    keepCurrentImage: true,
    label: variation.label,
  });
}

async function processBatch(values) {
  const queue = [...state.batchQueue];
  state.batchQueue = [];
  state.batchTotal = queue.length;
  state.batchIndex = 0;
  for (let i = 0; i < queue.length; i++) {
    state.batchIndex = i + 1;
    state.selectedImage = queue[i].base64;
    state.selectedImageName = queue[i].name;
    const payload = composeGenerationPayload(values);
    await generateWithPayload(payload, { label: `Фото ${i + 1} из ${queue.length}` });
  }
  state.batchTotal = 0;
  state.batchIndex = 0;
  toast(`Пакет готов — ${queue.length} фото`);
  render();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderToCanvas(image, sizeId, format) {
  const exportSize = EXPORT_SIZES[sizeId] || EXPORT_SIZES.original;
  const width = exportSize.width || image.naturalWidth;
  const height = exportSize.height || image.naturalHeight;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = Math.round(image.naturalWidth * scale);
  const drawHeight = Math.round(image.naturalHeight * scale);
  ctx.drawImage(image, Math.round((width - drawWidth) / 2), Math.round((height - drawHeight) / 2), drawWidth, drawHeight);
  const mime = format === "jpeg" ? "image/jpeg" : `image/${format}`;
  return canvas.toDataURL(mime, 0.94);
}

async function exportGeneratedImage() {
  if (!state.generatedImage) return;
  try {
    const format = document.querySelector("#export-format")?.value || "png";
    const sizeId = document.querySelector("#export-size")?.value || "original";
    const image = await loadImage(state.generatedImage);
    const dataUrl = await renderToCanvas(image, sizeId, format);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `domstudio-${sizeId}.${format === "jpeg" ? "jpg" : format}`;
    link.click();
  } catch {
    toast("Не удалось экспортировать изображение");
  }
}

async function exportForPack(packId) {
  const fmt = PACK_FORMATS.find((f) => f.id === packId);
  if (!fmt || !state.generatedImage) return;
  try {
    const image = await loadImage(state.generatedImage);
    const dataUrl = await renderToCanvas(image, fmt.size, fmt.format);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `domstudio-${fmt.id}.${fmt.format === "jpeg" ? "jpg" : fmt.format}`;
    link.click();
    toast(`Скачан: ${fmt.label}`);
  } catch {
    toast("Не удалось экспортировать");
  }
}

function restoreHistoryItem(id) {
  const item = state.history.find((historyItem) => historyItem.id === id);
  if (!item) return;
  state.generatedImage = item.dataUrl;
  state.generatedMeta = item;
  state.previousGeneratedImage = null;
  state.previousGeneratedMeta = null;
  state.lastGenerationPayload = {
    mode: item.mode || "catalog",
    subject: item.subject || "product",
    style_hint: item.style_hint || "",
    image: state.selectedImage,
    upscale_4k: false,
  };
  render();
}

async function removeHistoryItem(id) {
  try {
    await deleteHistoryItem(id);
    state.history = await readHistoryItems();
    render();
  } catch {
    toast("Не удалось удалить из истории");
  }
}

async function submitAuth(event) {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(event.currentTarget));
  state.authLoading = true;
  render();
  try {
    if (state.authChannel === "phone") {
      const phoneBody = { phone: body.phone };
      if (state.authMode === "register") {
        await api("/auth/register/phone", { method: "POST", body: JSON.stringify(phoneBody) });
      } else {
        await api("/auth/login/phone", { method: "POST", body: JSON.stringify(phoneBody) });
      }
      state.verificationContact = body.phone;
      state.verificationKind = "phone";
      state.verificationReturnMode = state.authMode;
      state.authMode = "verify";
      state.authLoading = false;
      toast("Код отправлен");
      render();
      return;
    }

    if (state.authMode === "register") {
      await api("/auth/register/email", { method: "POST", body: JSON.stringify(body) });
      state.verificationContact = body.email;
      state.verificationKind = "email";
      state.verificationReturnMode = "register";
      state.authMode = "verify";
      state.authLoading = false;
      render();
    } else {
      saveTokens(await api("/auth/login/email", { method: "POST", body: JSON.stringify(body) }));
      state.authMode = null;
      await loadUser();
      navigate("studio");
      render();
    }
  } catch (error) {
    toast(error.message);
    state.authLoading = false;
    render();
  }
}

async function submitVerification(event) {
  event.preventDefault();
  const body = { contact: state.verificationContact, code: new FormData(event.currentTarget).get("code") };
  state.authLoading = true;
  render();
  try {
    saveTokens(await api(`/auth/verify/${state.verificationKind}`, { method: "POST", body: JSON.stringify(body) }));
    state.authMode = null;
    state.authLoading = false;
    await loadUser();
    navigate("studio");
    render();
  } catch (error) {
    toast(error.message);
    state.authLoading = false;
    render();
  }
}

function selectImage(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  const oversized = files.find(f => f.size > 10 * 1024 * 1024);
  if (oversized) return toast(`Файл ${escapeHtml(oversized.name)} больше 10 МБ`);

  if (files.length === 1) {
    const reader = new FileReader();
    reader.onload = () => {
      state.selectedImage = String(reader.result).split(",")[1];
      state.selectedImageName = files[0].name;
      state.batchQueue = [];
      const label = document.querySelector("#upload-label span");
      if (label) label.innerHTML = `<strong>${escapeHtml(files[0].name)}</strong><br />Фото готово к генерации`;
    };
    reader.readAsDataURL(files[0]);
    return;
  }

  Promise.all(
    files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, base64: String(reader.result).split(",")[1] });
      reader.readAsDataURL(file);
    }))
  ).then(queue => {
    state.batchQueue = queue;
    state.selectedImage = queue[0].base64;
    state.selectedImageName = `${queue.length} фото`;
    render({ motion: false });
  });
}

async function submitGeneration(event) {
  event.preventDefault();
  syncDraftFromForm(event.currentTarget);
  const values = { ...state.formDraft };
  if (state.batchQueue.length > 1) {
    await processBatch(values);
    return;
  }
  const payload = composeGenerationPayload(values);
  state.formDraft.subject = payload.subject;
  await generateWithPayload(payload);
}

async function generateWithPayload(payload, options = {}) {
  const previousImage = options.keepCurrentImage ? state.generatedImage : null;
  const previousMeta = options.keepCurrentImage ? state.generatedMeta : null;
  state.generating = true;
  state.generationLabel = options.label ? `Создаём вариацию: ${options.label}…` : "Создаём кадр…";
  if (!options.keepCurrentImage) {
    state.generatedImage = null;
    state.generatedMeta = null;
    state.previousGeneratedImage = null;
    state.previousGeneratedMeta = null;
  }
  state.lastGenerationPayload = payload;
  render();
  try {
    const result = await api("/generation/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const dataUrl = `data:image/${String(result.format || "png").toLowerCase()};base64,${result.image}`;
    const resultMeta = { ...result, variation_label: options.label || "" };
    if (options.keepCurrentImage) {
      state.previousGeneratedImage = previousImage;
      state.previousGeneratedMeta = previousMeta;
    }
    state.generatedImage = dataUrl;
    state.generatedMeta = resultMeta;
    await rememberResult(resultMeta, dataUrl, payload);
    await loadUser();
    toast(options.label ? `Вариация готова: ${options.label}` : "Фото готово");
  } catch (error) {
    toast(error.message);
  } finally {
    state.generating = false;
    state.generationLabel = "";
    render();
  }
}

async function choosePlan(plan) {
  if (plan === "free") return state.user ? navigate("studio") : (state.authMode = "register", render());
  if (!state.user) {
    state.authMode = "register";
    return render();
  }
  try {
    const payment = await api("/payments/tinkoff/init", { method: "POST", body: JSON.stringify({ plan }) });
    location.href = payment.payment_url;
  } catch (error) {
    toast(error.message);
  }
}

async function choosePack(packId) {
  if (!state.user) {
    state.authMode = "register";
    return render();
  }
  try {
    const payment = await api("/payments/tinkoff/topup", { method: "POST", body: JSON.stringify({ pack_id: packId }) });
    location.href = payment.payment_url;
  } catch (error) {
    toast(error.message);
  }
}

function checkPaymentReturn() {
  const params = new URLSearchParams(location.search);
  const payment = params.get("payment");
  if (!payment) return;
  history.replaceState(null, "", location.pathname + location.hash);
  if (payment === "success") {
    loadUser().then(() => {
      toast("Оплата прошла — тариф активирован");
      navigate("account");
      render();
    });
  } else if (payment === "failed") {
    toast("Не удалось провести оплату — попробуйте снова");
    navigate("pricing");
  }
}

async function shareResult() {
  if (!state.generatedImage) return;
  const subject = state.generatedMeta?.subject || "";
  try {
    if (typeof navigator.canShare === "function") {
      const blob = await (await fetch(state.generatedImage)).blob();
      const file = new File([blob], "domstudio-result.jpg", { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "DomStudio — AI-фотостудия",
          text: subject ? `Товарный кадр: ${subject}` : "AI-кадр из DomStudio",
          files: [file],
        });
        return;
      }
    }
    const blob = await (await fetch(state.generatedImage)).blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    toast("Изображение скопировано в буфер обмена");
  } catch (error) {
    if (error.name !== "AbortError") {
      const link = document.createElement("a");
      link.href = state.generatedImage;
      link.download = "domstudio-result.jpg";
      link.click();
    }
  }
}

window.addEventListener("hashchange", () => {
  state.route = location.hash.slice(1) || "home";
  state.navMenuOpen = false;
  state.presetsOpen = false;
  render();
});
window.addEventListener("scroll", handleScroll, { passive: true });

await Promise.all([loadUser(), loadPlans(), loadHistory()]);
checkPaymentReturn();
render();
