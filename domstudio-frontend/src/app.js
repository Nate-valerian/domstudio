import "./styles.css";
import { gsap } from "gsap";
import { t, getLang, setLang } from "./i18n.js";
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
import examplePerfumeCatalogUrl from "./assets/examples/example-perfume-catalog.webp";
import examplePerfumeProductUrl from "./assets/examples/example-perfume-product.webp";
import examplePerfumeCreativeUrl from "./assets/examples/example-perfume-creative.webp";
import examplePerfumeLifestyleUrl from "./assets/examples/example-perfume-lifestyle.webp";
import examplePerfumeFittingUrl from "./assets/examples/example-perfume-fitting.webp";
import examplePerfumeMobileUrl from "./assets/examples/example-perfume-mobile.webp";
import exampleBottleCatalogUrl from "./assets/examples/example-bottle-catalog.webp";
import exampleBottleProductUrl from "./assets/examples/example-bottle-product.webp";
import exampleBottleCreativeUrl from "./assets/examples/example-bottle-creative.webp";
import exampleBottleLifestyleUrl from "./assets/examples/example-bottle-lifestyle.webp";
import exampleBottleFittingUrl from "./assets/examples/example-bottle-fitting.webp";
import exampleBottleMobileUrl from "./assets/examples/example-bottle-mobile.webp";
import perfumeProductVideoUrl from "./assets/examples/videos/perfume-product-5s.mp4";
import wineProductVideoUrl from "./assets/examples/videos/wine-product-5s.mp4";
import fashionFittingVideoUrl from "./assets/examples/videos/fashion-fitting-5s.mp4";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const MODES = [
  ["catalog", "Каталог", "Чистый фон и точная подача для маркетплейсов.", modeCatalogUrl, "Пример чистой карточки товара для маркетплейса", modeCatalogBeforeUrl, "Фон + тени"],
  ["product", "Предметная", "Премиальный свет, фактуры и рекламный кадр.", modeProductUrl, "Пример премиальной предметной съёмки", modeProductBeforeUrl, "Свет + сет"],
  ["creative", "Креатив", "Выразительный контент для соцсетей и кампаний.", modeCreativeUrl, "Пример креативного рекламного визуала", modeCreativeBeforeUrl, "Кампания"],
  ["image", "Lifestyle", "Товар в естественной сцене с AI-моделью.", modeLifestyleUrl, "Пример lifestyle-кадра с товаром", modeLifestyleBeforeUrl, "Сцена"],
  ["fitting", "Примерка", "Виртуальная примерка одежды и аксессуаров.", modeFittingUrl, "Пример виртуальной примерки", modeFittingBeforeUrl, "Примерка"],
  ["mobile", "Stories", "Вертикальный UGC-контент в формате 9:16.", modeStoriesUrl, "Пример вертикального story-контента", modeStoriesBeforeUrl, "9:16"],
];

const EXAMPLE_IMAGES = [
  { mode: "Catalog", product: "Perfume bottle", title: "Clean marketplace cutout", src: examplePerfumeCatalogUrl },
  { mode: "Product", product: "Perfume bottle", title: "Marble and candle studio scene", src: examplePerfumeProductUrl, videoSrc: perfumeProductVideoUrl },
  { mode: "Creative", product: "Perfume bottle", title: "Neon campaign visual", src: examplePerfumeCreativeUrl },
  { mode: "Lifestyle", product: "Perfume bottle", title: "Desk and warm window light", src: examplePerfumeLifestyleUrl },
  { mode: "Fitting", product: "Perfume bottle", title: "Scale-in-hand product shot", src: examplePerfumeFittingUrl },
  { mode: "Stories", product: "Perfume bottle", title: "Vertical mobile story crop", src: examplePerfumeMobileUrl, shape: "portrait" },
  { mode: "Catalog", product: "Pomegranate bottle", title: "White-background product card", src: exampleBottleCatalogUrl, shape: "portrait" },
  { mode: "Product", product: "Wine bottle", title: "Marble table studio setup", src: exampleBottleProductUrl, videoSrc: wineProductVideoUrl },
  { mode: "Creative", product: "Pomegranate bottle", title: "Warm premium campaign frame", src: exampleBottleCreativeUrl },
  { mode: "Lifestyle", product: "Pomegranate bottle", title: "Restaurant table scene", src: exampleBottleLifestyleUrl },
  { mode: "Fitting", product: "Pomegranate bottle", title: "Scale and serving context", src: exampleBottleFittingUrl },
  { mode: "Stories", product: "Pomegranate bottle", title: "Vertical social frame", src: exampleBottleMobileUrl, shape: "portrait" },
  { mode: "Fitting", product: "Beige suit outfit", title: "Virtual fitting motion preview", src: modeFittingUrl, videoSrc: fashionFittingVideoUrl, shape: "portrait" },
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
  original: { label: "Original size", width: null, height: null, layout: "original" },
  square: { label: "Square 1080", width: 1080, height: 1080, layout: "fit", fill: "#ffffff" },
  square2k: { label: "Square 2000", width: 2000, height: 2000, layout: "fit", fill: "#ffffff" },
  feed: { label: "Post 4:5", width: 1080, height: 1350, layout: "blur", fill: "rgba(255,255,255,.24)" },
  portrait: { label: "Portrait 3:4", width: 1200, height: 1600, layout: "blur", fill: "rgba(255,255,255,.24)" },
  story: { label: "Story 9:16 fit", width: 1080, height: 1920, layout: "blur", fill: "rgba(255,255,255,.20)" },
  storyCrop: { label: "Story 9:16 crop", width: 1080, height: 1920, layout: "cover" },
  widescreen: { label: "Banner 16:9 fit", width: 1920, height: 1080, layout: "blur", fill: "rgba(255,255,255,.24)" },
  bannerCrop: { label: "Banner 16:9 crop", width: 1920, height: 1080, layout: "cover" },
  landscape: { label: "Landscape 4:3", width: 1600, height: 1200, layout: "fit", fill: "#ffffff" },
};

const PACK_FORMATS = [
  { id: "wb", label: "Wildberries", size: "square", format: "jpeg" },
  { id: "ozon", label: "Ozon", size: "square2k", format: "jpeg" },
  { id: "yandex", label: "Yandex Market", size: "square", format: "jpeg" },
  { id: "avito", label: "Avito", size: "landscape", format: "jpeg" },
  { id: "vk", label: "VK post", size: "feed", format: "jpeg" },
  { id: "telegram", label: "Telegram post", size: "square", format: "jpeg" },
  { id: "story", label: "Story fit", size: "story", format: "jpeg" },
  { id: "story_crop", label: "Story crop", size: "storyCrop", format: "jpeg" },
  { id: "post", labelKey: "pack.post", size: "feed", format: "jpeg" },
  { id: "banner", labelKey: "pack.banner", size: "widescreen", format: "jpeg" },
  { id: "banner_crop", label: "Banner crop", size: "bannerCrop", format: "jpeg" },
  { id: "webp_square", label: "WebP square", size: "square", format: "webp" },
];

const HISTORY_DB = "domstudio_history";
const HISTORY_STORE = "results";
const HISTORY_LIMIT = 20;
const BRAND_PREFS_KEY = "domstudio_brand_preferences";

const PAGE_TITLES = {
  home:    "DomStudio — AI-студия для продавцов маркетплейсов",
  examples: "Examples — DomStudio",
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

const VIDEO_DURATIONS = Array.from({ length: 10 }, (_, index) => index + 3);

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
  lang: getLang(),
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
  generationKind: "photo",
  generatedImage: null,
  generatedVideo: null,
  videoJob: null,
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
let videoPollTimer = null;

function navigate(route) {
  state.navMenuOpen = false;
  state.presetsOpen = false;
  document.title = t(`title.${route}`) || t("title.home");
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
  if (!response.ok) throw new Error(data.detail || data.error || t("toast.requestFailed"));
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
  if (showToast) toast(t("toast.logout"));
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
  return t(`plan.${planName}`) || planName;
}

function planDescription(planName) {
  return t(`planDesc.${planName}`) || t("planDesc.default");
}

function pricePerPhoto(plan) {
  if (!plan.price_rub) return t("pricing.freePerPhoto");
  return t("pricing.pricePerPhoto", { n: Math.round(plan.price_rub / plan.photos) });
}

function planPhotos(plan) {
  return plan.name === "business" ? t("pricing.photos300") : `${plan.photos} ${t("pricing.photos")}`;
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

const SCENE_INTENT_PATTERN = /\b(marble|marbel|mabel|mable|table|tabel|candle|candles|candel|candels|flower|flowers|fabric|wood|stone|kitchen|bathroom|room|desk|shelf|surface|background|boutique|restaurant|studio set|window light|warm light)\b/i;
const CATALOG_BACKGROUND_PATTERN = /\b(simple|plain|clean|white|transparent|remove|removed|cutout|cut-out)\b.{0,32}\bbackground\b|\bbackground\b.{0,32}\b(simple|plain|clean|white|transparent|remove|removed|cutout|cut-out)\b/i;

function hasSceneIntent(value) {
  const text = String(value || "");
  return !CATALOG_BACKGROUND_PATTERN.test(text) && SCENE_INTENT_PATTERN.test(text);
}

function resolvedGenerationMode(values) {
  const requestedMode = values.mode || currentMarketplace().mode;
  if (requestedMode === "catalog" && hasSceneIntent(values.subject)) return "product";
  return requestedMode;
}

function marketplaceHintForMode(marketplace, mode, hasImage) {
  if (mode === "catalog") return marketplace.hint;
  const preserve = hasImage
    ? "preserve the uploaded product label, packaging text, logo, shape, color, and cap exactly; do not add new text or new logos"
    : "do not add fake text, fake logos, or unreadable packaging details";
  return `${marketplace.label} seller-ready commercial image, crop-safe for marketplace listing, ${preserve}`;
}

function composeGenerationPayload(values) {
  const marketplace = MARKETPLACE_PRESETS.find((preset) => preset.id === values.marketplace) || currentMarketplace();
  const styleTemplate = STYLE_TEMPLATES.find((template) => template.id === values.style_template) || currentStyleTemplate();
  const prefs = state.brandPrefs;
  const userStyle = values.style_hint || "";
  const brandColors = values.brand_colors || prefs.brand_colors;
  const mode = resolvedGenerationMode(values);
  const marketplaceHint = marketplaceHintForMode(marketplace, mode, Boolean(state.selectedImage));
  const styleParts = [
    userStyle,
    mode !== values.mode ? "scene request detected: use product photography scene mode, not catalog cutout mode" : "",
    ...[
      marketplaceHint,
      styleTemplate.hint,
      brandColors ? `brand colors: ${brandColors}` : "",
      prefs.preferred_background ? `preferred background: ${prefs.preferred_background}` : "",
      prefs.brand_mood ? `brand mood: ${prefs.brand_mood}` : "",
      values.constraints ? `constraints: ${values.constraints}` : "",
      prefs.do_not_use ? `avoid: ${prefs.do_not_use}` : "",
    ].filter((part) => part && !userStyle.includes(part)),
  ].filter(Boolean);

  return {
    mode,
    subject: truncate(values.subject || values.product_type || "product"),
    style_hint: truncate(styleParts.join(", ")),
    image: state.selectedImage,
    upscale_4k: values.upscale_4k === "on" || values.upscale_4k === true,
  };
}

function composeVideoPayload(values) {
  const payload = composeGenerationPayload(values);
  const duration = Number.parseInt(values.duration_s || state.formDraft.duration_s || "3", 10);
  return {
    mode: payload.mode === "catalog" ? "product" : payload.mode,
    subject: payload.subject,
    style_hint: payload.style_hint,
    image: state.selectedImage,
    duration_s: Number.isFinite(duration) ? Math.min(Math.max(duration, 3), 12) : 3,
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
    toast(t("toast.historyCleared"));
    render();
  } catch {
    toast(t("toast.historyClearFailed"));
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
    toast(t("toast.historyFailed"));
  }
}

function historyPanel() {
  if (!state.history.length) return "";
  return `<div class="history-panel">
    <div class="mini-head"><h3>${t("history.h3")}</h3><span>${t("history.sub")}</span></div>
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
          <button class="history-delete" type="button" data-delete-history="${item.id}" aria-label="${t("history.delete")}">×</button>
        </article>`).join("")}
    </div>
  </div>`;
}

function exportTools() {
  if (!state.generatedImage) return "";
  return `<div class="export-tools">
    <div class="mini-head"><h3>${t("export.h3")}</h3><span>${t("export.sub")}</span></div>
    <div class="export-row">
      <select class="select compact" id="export-format">
        <option value="png">PNG</option>
        <option value="jpeg">JPG</option>
        <option value="webp">WebP</option>
      </select>
      <select class="select compact" id="export-size">
        ${Object.entries(EXPORT_SIZES).map(([id, size]) => `<option value="${id}">${size.label}</option>`).join("")}
      </select>
      <button class="button secondary" type="button" data-export>${t("export.download")}</button>
      <button class="button secondary" type="button" data-share>${t("export.share")}</button>
    </div>
  </div>`;
}

function variationTools() {
  if (!state.generatedImage || !state.lastGenerationPayload) return "";
  return `<div class="variation-tools">
    <div class="mini-head"><h3>${t("variation.h3")}</h3><span>${state.generating && state.generationLabel ? escapeHtml(state.generationLabel) : t("variation.sub")}</span></div>
    <div class="chip-row">
      ${VARIATIONS.map((variation) => `<button class="chip" type="button" data-variation="${variation.id}" ${state.generating ? "disabled" : ""}>${variation.label}</button>`).join("")}
    </div>
  </div>`;
}

function comparisonPanel() {
  if (!state.previousGeneratedImage || !state.generatedImage || state.generating) return "";
  return `<div class="compare-panel">
    <div class="mini-head"><h3>${t("compare.h3")}</h3><span>${t("compare.sub")}</span></div>
    <div class="compare-grid">
      <figure><img src="${state.previousGeneratedImage}" alt="${t("compare.sub")}" /><figcaption>Previous</figcaption></figure>
      <figure><img src="${state.generatedImage}" alt="Current" /><figcaption>Current${state.generatedMeta?.variation_label ? ` · ${escapeHtml(state.generatedMeta.variation_label)}` : ""}</figcaption></figure>
    </div>
  </div>`;
}

function contentPackTools() {
  if (!state.generatedImage || state.generating) return "";
  return `<div class="content-pack">
    <div class="mini-head"><h3>${t("pack.h3")}</h3><span>${t("pack.sub")}</span></div>
    <div class="pack-grid">
      ${PACK_FORMATS.map((fmt) => `<button class="pack-btn" type="button" data-pack="${fmt.id}">${fmt.labelKey ? t(fmt.labelKey) : fmt.label}<span>${EXPORT_SIZES[fmt.size].label}</span></button>`).join("")}
    </div>
  </div>`;
}

function nav() {
  const logged = Boolean(state.user);
  const lang = state.lang;
  const navItems = [
    ["home", t("nav.home")],
    ["studio", t("nav.studio")],
    ["examples", t("nav.examples")],
    ["pricing", t("nav.pricing")],
    ...(logged ? [["history", t("nav.history")]] : []),
  ];
  const initials = logged ? String(state.user.email || state.user.phone || "DS").slice(0, 2).toUpperCase() : "";
  return `
    <nav class="nav ${state.navCompact ? "compact" : ""}">
      <div class="nav-inner">
      <button class="brand" data-route="home"><span class="brand-mark">DS</span><span class="brand-word">Dom<span>Studio</span></span></button>
      <div class="nav-links ${state.navMenuOpen ? "open" : ""}">
        ${navItems.map(([route, label]) => `<button class="nav-link ${state.route === route ? "active" : ""}" data-route="${route}">${label}</button>`).join("")}
        <div class="nav-dropdown ${state.presetsOpen ? "open" : ""}">
          <button class="nav-link dropdown-trigger" type="button" data-toggle-presets>${t("nav.presets")} <span>⌄</span></button>
          <div class="preset-menu">
            ${MARKETPLACE_PRESETS.map((preset) => {
              const desc = t(`preset.${preset.mode}.desc`);
              return `<button type="button" data-preset-route="${preset.id}"><b>${preset.label}</b><span>${desc}</span></button>`;
            }).join("")}
          </div>
        </div>
      </div>
      <div class="nav-actions">
        ${logged
          ? `<button class="token-pill" data-route="account" title="${state.user.tokens} ${t("nav.tokens", { n: "" }).trim()}"><span>${state.user.tokens}</span></button>
             <button class="profile-pill" data-route="account" title="${t("account.eyebrow")}"><span>${escapeHtml(initials)}</span></button>
             <button class="button gold nav-cta" data-route="studio">${t("nav.create")}</button>`
          : `<button class="button secondary" data-auth="login">${t("nav.login")}</button>
             <button class="button gold nav-cta" data-auth="register">${t("nav.register")}</button>`}
        <button class="lang-toggle" type="button" data-toggle-lang>${lang === "ru" ? "EN" : "RU"}</button>
        <button class="nav-menu-button ${state.navMenuOpen ? "open" : ""}" type="button" data-toggle-menu aria-label="Menu"><span></span><span></span></button>
      </div>
      </div>
    </nav>`;
}

function footer() {
  return `<footer class="footer"><b>DomStudio</b><span>${t("footer.tagline")}</span></footer>`;
}

function homePage() {
  return `
    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">${t("home.eyebrow")}</div>
          <h1>${t("home.h1a")} <em>${t("home.h1b")}</em></h1>
          <p>${t("home.p")}</p>
          <div class="hero-actions">
            <button class="button gold" data-route="studio">${t("home.cta")}</button>
            <button class="button secondary" data-route="pricing">${t("home.pricing")}</button>
          </div>
          <div class="trust-row"><span>${t("home.trust1")}</span><span>${t("home.trust2")}</span><span>${t("home.trust3")}</span></div>
        </div>
        <div class="hero-visual">
          <div class="hero-studio-card">
            <div class="studio-card-top">
              <span>Mini studio</span>
              <b>WB · Ozon · Yandex · Avito</b>
            </div>
            <div class="hero-proof-frame"><img src="${productProofUrl}" alt="DomStudio AI" /></div>
            <div class="mini-studio-controls">
              <label><span>${t("home.miniPhoto")}</span><button type="button" data-route="studio">${t("home.miniUpload")}</button></label>
              <label><span>${t("home.miniPromptLabel")}</span><input value="${t("home.miniPromptValue")}" readonly /></label>
              <div class="preset-pills"><span>Wildberries</span><span>Ozon</span><span>Avito</span><span>1080×1080</span></div>
              <button class="button gold block" type="button" data-route="studio">${t("home.miniCta")}</button>
            </div>
          </div>
          <div class="float-card"><b>AI</b><span>${t("home.floatCard")}</span></div>
        </div>
      </section>

      <section class="section proof-section">
        <div class="section-head">
          <h2>${t("home.proofH2")}</h2>
          <p>${t("home.proofP")}</p>
        </div>
        <div class="proof-grid">
          <article class="proof-visual"><img src="${productProofUrl}" alt="DomStudio AI" /></article>
          <div class="proof-copy">
            <div class="proof-stat"><b>30</b><span>${t("home.stat1s")}</span></div>
            <div class="proof-stat"><b>270 ₽</b><span>${t("home.stat2s")}</span></div>
            <div class="proof-stat"><b>${t("home.stat3b")}</b><span>${t("home.stat3s")}</span></div>
          </div>
        </div>
      </section>

      <section class="section modes-section">
        <div class="section-head">
          <h2>${t("home.modesH2")}</h2>
          <p>${t("home.modesP")}</p>
        </div>
        <div class="mode-grid">
          ${MODES.map((mode, index) => `
            <article class="mode-card">
              <figure class="mode-visual proof-compare">
                <img class="proof-after" src="${mode[3]}" alt="${t("mode." + mode[0] + ".name")}" loading="lazy" />
                <div class="proof-before">
                  <img src="${mode[5]}" alt="${t("mode." + mode[0] + ".name")}" loading="lazy" />
                  <span>${t("home.before")}</span>
                </div>
                <span class="proof-after-label">${t("home.after")}</span>
              </figure>
              <div class="mode-card-topline"><span class="number">0${index + 1}</span><span>${t("mode." + mode[0] + ".tag")}</span></div>
              <h3>${t("mode." + mode[0] + ".name")}</h3>
              <p>${t("mode." + mode[0] + ".desc")}</p>
            </article>`).join("")}
        </div>
      </section>

      <section class="section dark workflow-section">
        <div class="section-head"><h2>${t("home.workflowH2")}</h2><p>${t("home.workflowP")}</p></div>
        <div class="steps">
          <article class="step"><b>01</b><h3>${t("home.step1h")}</h3><p>${t("home.step1p")}</p></article>
          <article class="step"><b>02</b><h3>${t("home.step2h")}</h3><p>${t("home.step2p")}</p></article>
          <article class="step"><b>03</b><h3>${t("home.step3h")}</h3><p>${t("home.step3p")}</p></article>
        </div>
      </section>
    </main>`;
}

function examplesPage() {
  return `
    <main class="page examples-page">
      <section class="section examples-hero">
        <div class="section-head">
          <h2>${t("examples.h1")}</h2>
          <p>${t("examples.p")}</p>
        </div>
        <div class="examples-strip">
          <span>${t("examples.badge1")}</span>
          <span>${t("examples.badge2")}</span>
          <span>${t("examples.badge3")}</span>
        </div>
      </section>
      <section class="section examples-section">
        <div class="examples-grid">
          ${EXAMPLE_IMAGES.map((item) => `
            <article class="example-card ${item.videoSrc ? "has-video" : ""} ${item.shape === "portrait" ? "portrait" : ""} ${item.shape === "wide" ? "wide" : ""}">
              ${item.videoSrc ? `
                <div class="example-media-pair">
                  <figure class="example-media">
                    <img src="${item.src}" alt="${escapeHtml(item.title)}" loading="lazy" />
                  </figure>
                  <figure class="example-media">
                    <video src="${item.videoSrc}" aria-label="${escapeHtml(`${item.title} video`)}" autoplay muted loop playsinline controls preload="metadata"></video>
                  </figure>
                </div>
              ` : `
                <figure class="example-media">
                  <img src="${item.src}" alt="${escapeHtml(item.title)}" loading="lazy" />
                </figure>
              `}
              <div class="example-card-copy">
                <span>${escapeHtml(item.mode)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.product)}</p>
              </div>
            </article>`).join("")}
        </div>
        <div class="examples-cta">
          <h2>${t("examples.ctaH")}</h2>
          <button class="button gold" data-route="studio">${t("examples.cta")}</button>
        </div>
      </section>
    </main>`;
}

function gatePage() {
  return `<main class="page"><section class="gate"><div class="eyebrow">${t("gate.eyebrow")}</div><h1>${t("gate.h1")}</h1><p>${t("gate.p")}</p><button class="button gold" data-auth="register">${t("gate.cta")}</button></section></main>`;
}

function appSidebar(active) {
  return `<aside class="sidebar">
    <p class="side-caption">${t("sidebar.caption")}</p>
    <button class="side-link ${active === "studio" ? "active" : ""}" data-route="studio">${t("sidebar.new")}</button>
    <button class="side-link ${active === "history" ? "active" : ""}" data-route="history">${t("sidebar.history")}</button>
    <button class="side-link ${active === "account" ? "active" : ""}" data-route="account">${t("sidebar.account")}</button>
    <button class="side-link ${active === "pricing" ? "active" : ""}" data-route="pricing">${t("sidebar.pricing")}</button>
    <button class="side-link" data-logout>${t("sidebar.logout")}</button>
  </aside>`;
}

function generationCost() {
  return state.generationKind === "video" ? 300 : 100;
}

function videoSourceFromJob(job) {
  if (!job) return "";
  if (job.output_url) return job.output_url;
  if (!job.output_data) return "";
  const format = String(job.output_format || "mp4").toLowerCase();
  const mime = format.includes("webm") ? "video/webm" : format.includes("gif") ? "image/gif" : "video/mp4";
  return `data:${mime};base64,${job.output_data}`;
}

function videoJobPanel() {
  if (!state.videoJob) return "";
  const status = state.videoJob.status || "queued";
  const label = t(`video.status.${status}`) || status;
  const error = state.videoJob.error ? `<p class="video-error">${escapeHtml(state.videoJob.error)}</p>` : "";
  const download = state.generatedVideo
    ? `<a class="button secondary" href="${state.generatedVideo}" download="domstudio-video.${String(state.videoJob.output_format || "mp4").toLowerCase()}">${t("video.download")}</a>`
    : "";
  return `<div class="video-job-card ${status}">
    <div class="mini-head"><h3>${t("video.jobTitle")}</h3><span>${label}</span></div>
    <p>${t("video.jobSub", { n: state.videoJob.tokens_used || 300 })}</p>
    ${error}
    ${download}
  </div>`;
}

function studioPage() {
  if (!state.user) return gatePage();
  const sceneModeNotice = state.formDraft.mode === "catalog" && hasSceneIntent(state.formDraft.subject);
  const cost = generationCost();
  return `<main class="app-layout">
    ${appSidebar("studio")}
    <section class="workspace">
      <header class="workspace-head"><div><div class="eyebrow">${t("studio.eyebrow")}</div><h1>${t("studio.h1")}</h1></div><div class="balance"><span>${state.user.tokens}</span> ${t("studio.tokens", { n: "" }).trim()}</div></header>
      <div class="studio-grid">
        <form class="panel" id="generate-form">
          <div class="media-toggle" role="group" aria-label="${t("studio.outputType")}">
            <button type="button" class="${state.generationKind === "photo" ? "active" : ""}" data-generation-kind="photo">${t("studio.photoTab")}</button>
            <button type="button" class="${state.generationKind === "video" ? "active" : ""}" data-generation-kind="video">${t("studio.videoTab")}</button>
          </div>
          <div class="form-section">
            <div class="field"><label for="marketplace">${t("studio.marketplace")}</label><select class="select" id="marketplace" name="marketplace">${MARKETPLACE_PRESETS.map(preset => `<option value="${preset.id}" ${selectedAttr(state.formDraft.marketplace, preset.id)}>${preset.label}</option>`).join("")}</select></div>
            <div class="field"><label for="style_template">${t("studio.styleTemplate")}</label><select class="select" id="style_template" name="style_template">${STYLE_TEMPLATES.map(template => `<option value="${template.id}" ${selectedAttr(state.formDraft.style_template, template.id)}>${template.label}</option>`).join("")}</select></div>
            <div class="field"><label for="mode">${t("studio.mode")}</label><select class="select" id="mode" name="mode">${MODES.map(mode => `<option value="${mode[0]}" ${selectedAttr(state.formDraft.mode, mode[0])}>${t("mode." + mode[0] + ".name")} — ${t("mode." + mode[0] + ".desc")}</option>`).join("")}</select></div>
            ${state.generationKind === "video" ? `<div class="field"><label for="duration_s">${t("video.duration")}</label><select class="select" id="duration_s" name="duration_s">
              ${VIDEO_DURATIONS.map((seconds) => `<option value="${seconds}" ${selectedAttr(String(state.formDraft.duration_s || "3"), String(seconds))}>${seconds}s</option>`).join("")}
            </select></div>` : ""}
          </div>
          <div class="brand-preferences collapsible ${state.brandPrefsOpen ? "open" : ""}">
            <button class="collapsible-head" type="button" data-toggle-brand>
              <span><h3>${t("studio.brandTitle")}</h3><small>${t("studio.brandSub")}</small></span>
              <span class="chevron">${state.brandPrefsOpen ? "−" : "+"}</span>
            </button>
            ${state.brandPrefsOpen ? `<div class="collapsible-body">
              <div class="helper-grid">
                <div class="field"><label for="brand_pref_colors">${t("studio.brandColors")}</label><input class="input" id="brand_pref_colors" name="brand_pref_colors" value="${brandPrefValue("brand_colors")}" placeholder="ivory, gold, deep green" /></div>
                <div class="field"><label for="brand_pref_background">${t("studio.brandBg")}</label><input class="input" id="brand_pref_background" name="brand_pref_background" value="${brandPrefValue("preferred_background")}" placeholder="warm light background" /></div>
                <div class="field"><label for="brand_pref_mood">${t("studio.brandMood")}</label><input class="input" id="brand_pref_mood" name="brand_pref_mood" value="${brandPrefValue("brand_mood")}" placeholder="clean luxury, calm, premium" /></div>
                <div class="field"><label for="brand_pref_avoid">${t("studio.brandAvoid")}</label><input class="input" id="brand_pref_avoid" name="brand_pref_avoid" value="${brandPrefValue("do_not_use")}" placeholder="neon, cheap plastic, text" /></div>
              </div>
              <button class="button secondary block" type="button" data-save-brand>${t("studio.brandSave")}</button>
            </div>` : ""}
          </div>
          <div class="prompt-helper collapsible ${state.promptHelperOpen ? "open" : ""}">
            <button class="collapsible-head" type="button" data-toggle-prompt>
              <span><h3>${t("studio.helperTitle")}</h3><small>${t("studio.helperSub")}</small></span>
              <span class="chevron">${state.promptHelperOpen ? "−" : "+"}</span>
            </button>
            ${state.promptHelperOpen ? `<div class="collapsible-body">
              <div class="helper-grid">
                <div class="field"><label for="product_type">${t("studio.helperType")}</label><input class="input" id="product_type" name="product_type" value="${draftValue("product_type")}" placeholder="Gold hoop earrings" /></div>
                <div class="field"><label for="brand_colors">${t("studio.helperColors")}</label><input class="input" id="brand_colors" name="brand_colors" value="${draftValue("brand_colors") || brandPrefValue("brand_colors")}" placeholder="ivory, gold, deep green" /></div>
                <div class="field wide"><label for="constraints">${t("studio.helperConstraints")}</label><input class="input" id="constraints" name="constraints" value="${draftValue("constraints")}" placeholder="no text, no hands, preserve packaging shape" /></div>
              </div>
              <button class="button secondary block" type="button" data-build-prompt>${t("studio.helperBuild")}</button>
            </div>` : ""}
          </div>
          <div class="field"><label for="subject">${t("studio.subjectLabel")}</label><textarea class="textarea" id="subject" name="subject" required placeholder="${t("studio.subjectPlaceholder")}">${draftValue("subject")}</textarea></div>
          ${sceneModeNotice ? `<div class="mode-notice">${t("studio.sceneModeNotice")}</div>` : ""}
          <div class="field"><label for="style_hint">${t("studio.styleLabel")}</label><input class="input" id="style_hint" name="style_hint" value="${draftValue("style_hint")}" placeholder="${t("studio.stylePlaceholder")}" /></div>
          <label class="upload" id="upload-label"><input type="file" id="image" accept="image/*" multiple /><span><strong>${state.batchQueue.length > 1 ? t("studio.uploadBatch", { n: state.batchQueue.length }) : state.selectedImageName ? escapeHtml(state.selectedImageName) : t("studio.uploadAdd")}</strong><br />${state.batchQueue.length > 1 ? t("studio.uploadTokens", { n: state.batchQueue.length * 100 }) : state.selectedImageName ? t("studio.uploadReady") : t("studio.uploadDesc")}</span></label>
          ${state.generationKind === "photo" ? `<label class="check"><input type="checkbox" name="upscale_4k" ${checkedAttr(state.formDraft.upscale_4k)} /> ${t("studio.upscale")}</label>` : `<p class="video-note">${t("video.note")}</p>`}
          <button class="button gold block" type="submit" ${state.generating ? "disabled" : ""}>${state.generating ? (state.batchTotal > 1 ? t("studio.submitBatch", { n: state.batchIndex, total: state.batchTotal }) : state.generationKind === "video" ? t("video.submitGenerating") : t("studio.submitGenerating")) : (state.generationKind === "video" ? t("video.submitCta") : state.batchQueue.length > 1 ? t("studio.submitBatchCta", { n: state.batchQueue.length * 100 }) : t("studio.submitCta"))}</button>
          ${state.user.tokens < cost
            ? `<p class="token-hint warn">${t("studio.tokenLow")}</p>`
            : `<p class="token-hint">${state.generationKind === "video" ? t("video.tokenOk", { n: state.user.tokens, m: Math.floor(state.user.tokens / 300) }) : t("studio.tokenOk", { n: state.user.tokens, m: Math.floor(state.user.tokens / 100) })}</p>`}
        </form>
        <div class="panel">
          <div class="result ${state.generating && !state.generatedImage && !state.generatedVideo ? "loading" : ""} ${state.generationKind === "video" || state.generatedVideo ? "video-result" : ""}">
            ${state.generatedVideo
              ? `<video src="${state.generatedVideo}" controls playsinline loop></video>${state.generating ? `<div class="result-status">${escapeHtml(state.generationLabel || t("video.submitGenerating"))}</div>` : ""}`
              : state.generatedImage
              ? `<img src="${state.generatedImage}" alt="AI result" />${state.generating ? `<div class="result-status">${escapeHtml(state.generationLabel || t("studio.generatingNew"))}</div>` : ""}`
              : `<div class="result-empty"><b>${state.generating ? t("studio.resultSetting") : t("studio.resultEmptyB")}</b>${state.generating ? "" : t("studio.resultEmptyP")}</div>`}
          </div>
          ${state.generatedMeta && !state.generatedVideo ? `<p class="result-meta">${state.generatedMeta.variation_label ? `${escapeHtml(state.generatedMeta.variation_label)} · ` : ""}${state.generatedMeta.width || "?"}×${state.generatedMeta.height || "?"} · ${escapeHtml(state.generatedMeta.mode || "")}</p>` : ""}
          ${videoJobPanel()}
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
      <header class="workspace-head"><div><div class="eyebrow">${t("account.eyebrow")}</div><h1>${t("account.h1")}</h1></div><button class="button gold" data-route="studio">${t("account.create")}</button></header>

      <div class="stats">
        <article class="stat"><span>${t("account.statPlan")}</span><b>${planLabel(planName)}</b></article>
        <article class="stat"><span>${t("account.statTokens")}</span><b>${state.user.tokens.toLocaleString("ru-RU")}</b></article>
        <article class="stat"><span>${t("account.statPhotos")}</span><b>${sub.photos_used || 0} / ${sub.photos_limit || 5}</b></article>
      </div>

      ${isFree || lowTokens ? `
      <div class="upgrade-cta">
        <div class="upgrade-cta-copy">
          <b>${isFree ? t("account.upgradeFreB") : t("account.upgradeLowB")}</b>
          <span>${isFree ? t("account.upgradeFreS") : t("account.upgradeLowS")}</span>
        </div>
        <button class="button gold" data-route="pricing">${t("account.upgradeCta")}</button>
      </div>` : ""}

      ${recentHistory.length ? `
      <div class="panel account-section">
        <div class="account-section-head"><h3>${t("account.recentH3")}</h3><span>${t("account.recentSub")}</span></div>
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
              <button class="history-delete" type="button" data-delete-history="${item.id}" aria-label="${t("history.delete")}">×</button>
            </article>`).join("")}
        </div>
        <button class="button secondary" style="margin-top:14px" data-route="studio">${t("account.openStudio")}</button>
      </div>` : ""}

      ${hasBrand ? `
      <div class="panel account-section">
        <div class="account-section-head"><h3>${t("account.brandH3")}</h3><button class="text-button" data-route="studio">${t("account.brandEdit")}</button></div>
        <dl class="brand-summary">
          ${bp.brand_colors ? `<div><dt>${t("account.brandColors")}</dt><dd>${escapeHtml(bp.brand_colors)}</dd></div>` : ""}
          ${bp.preferred_background ? `<div><dt>${t("account.brandBg")}</dt><dd>${escapeHtml(bp.preferred_background)}</dd></div>` : ""}
          ${bp.brand_mood ? `<div><dt>${t("account.brandMood")}</dt><dd>${escapeHtml(bp.brand_mood)}</dd></div>` : ""}
          ${bp.do_not_use ? `<div><dt>${t("account.brandAvoid")}</dt><dd>${escapeHtml(bp.do_not_use)}</dd></div>` : ""}
        </dl>
      </div>` : ""}

      <div class="panel account-section">
        <div class="account-section-head"><h3>${t("account.dataH3")}</h3></div>
        <p class="account-contact">${escapeHtml(state.user.email || state.user.phone || "—")}</p>
        <p class="account-status ${state.user.is_verified ? "verified" : "pending"}">${state.user.is_verified ? t("account.verified") : t("account.pending")}</p>
      </div>
    </section>
  </main>`;
}

function historyPage() {
  const locale = state.lang === "en" ? "en-GB" : "ru-RU";
  const modeFilters = [
    { id: "all", label: t("historyPage.filterAll") },
    ...MODES.map(([id]) => ({ id, label: t(`mode.${id}.name`) })),
  ];
  const filtered = state.history.filter(
    item => state.historyFilter === "all" || item.mode === state.historyFilter
  );
  return `<main class="${state.user ? "app-layout" : "page"}">
    ${state.user ? appSidebar("history") : ""}
    <section class="${state.user ? "workspace" : "section"}">
      <header class="workspace-head">
        <div><div class="eyebrow">${t("historyPage.eyebrow")}</div><h1>${t("historyPage.h1")}</h1></div>
        ${state.history.length ? `<button class="button secondary" data-clear-history>${t("historyPage.clearAll")}</button>` : ""}
      </header>
      ${state.history.length ? `
        <div class="chip-row" style="margin-bottom: 20px;">
          ${modeFilters.map(m => `<button class="chip ${state.historyFilter === m.id ? "chip-active" : ""}" type="button" data-history-filter="${m.id}">${m.label}</button>`).join("")}
        </div>
        ${filtered.length ? `
          <div class="history-full-grid">
            ${filtered.map(item => {
              const d = new Date(item.createdAt);
              const dateStr = d.toLocaleDateString(locale, { day: "numeric", month: "short" });
              const timeStr = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
              return `<article class="history-card">
                <button class="history-card-thumb" type="button" data-history-id="${item.id}">
                  <img src="${item.dataUrl}" alt="${escapeHtml(item.subject)}" loading="lazy" />
                </button>
                <div class="history-card-info">
                  <b>${escapeHtml(item.subject)}</b>
                  <span>${escapeHtml(item.mode)}${item.variation_label ? ` · ${escapeHtml(item.variation_label)}` : ""}${item.width ? ` · ${item.width}×${item.height}` : ""}</span>
                  <time>${dateStr}, ${timeStr}</time>
                </div>
                <button class="history-delete" type="button" data-delete-history="${item.id}" aria-label="${t("history.delete")}">×</button>
              </article>`;
            }).join("")}
          </div>
        ` : `<p class="history-empty-filter">${t("historyPage.noFilter")}</p>`}
      ` : `
        <div class="history-empty">
          <b>${t("historyPage.emptyB")}</b>
          <p>${t("historyPage.emptyP")}</p>
          <button class="button gold" data-route="studio">${t("historyPage.emptyCta")}</button>
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
      <header class="workspace-head"><div><div class="eyebrow">${t("pricing.eyebrow")}</div><h1>${t("pricing.h1")}</h1></div></header>
      <div class="price-grid">
        ${cards.map(plan => `
          <article class="price-card ${plan.name === "pro" ? "featured" : ""}">
            <div class="plan-kicker">${planDescription(plan.name)}</div>
            <h3>${planLabel(plan.name)}</h3>
            <div class="price">${plan.price_rub.toLocaleString("ru-RU")} ₽ <small>${t("pricing.perMonth")}</small></div>
            <ul class="price-list"><li>${planPhotos(plan)}</li><li>${pricePerPhoto(plan)}</li><li>${plan.tokens.toLocaleString("ru-RU")} ${t("studio.tokens", { n: "" }).trim()}</li><li>${t("pricing.allModes")}</li></ul>
            <button class="button ${plan.name === "pro" ? "gold" : ""}" data-plan="${plan.name}">${plan.price_rub ? t("pricing.choose") : t("pricing.startFree")}</button>
          </article>`).join("")}
      </div>

      <div class="topup-section">
        <div class="mini-head"><h3>${t("pricing.topupH3")}</h3><span>${t("pricing.topupSub")}</span></div>
        <div class="topup-grid">
          ${TOKEN_PACKS.map(pack => `
            <article class="topup-card">
              <b>${pack.tokens.toLocaleString("ru-RU")} ${t("nav.tokens", { n: "" }).trim()}</b>
              <span>~${Math.floor(pack.tokens / 100)} ${t("pricing.photos")}</span>
              <div class="topup-price">${pack.price_rub} ₽</div>
              <button class="button secondary" data-pack-id="${pack.pack_id}">${t("pricing.topupBuy")}</button>
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
        <div class="modal-top"><div><div class="eyebrow">${t("auth.verifyEyebrow")}</div><h2>${state.verificationKind === "phone" ? t("auth.verifyH2Phone") : t("auth.verifyH2Email")}</h2></div><button class="close" type="button" data-close>×</button></div>
        <div class="notice">${t("auth.verifyNotice", { contact: `<b>${escapeHtml(state.verificationContact)}</b>` })}</div>
        <div class="code-field"><input class="input" name="code" inputmode="numeric" autocomplete="one-time-code" required maxlength="6" placeholder="000000" /></div>
        <button class="button gold block" type="submit" ${state.authLoading ? "disabled" : ""}>${state.authLoading ? t("auth.verifyLoading") : t("auth.verifySubmit")}</button>
        <button class="text-button auth-back" type="button" data-auth="${state.verificationReturnMode}">${t("auth.verifyBack")}</button>
      </form>
    </div>`;
  }
  if (state.authMode === "forgot") {
    return `<div class="modal-backdrop">
      <form class="modal auth-modal compact" id="forgot-form">
        <div class="modal-top"><div><div class="eyebrow">${t("auth.forgotEyebrow")}</div><h2>${t("auth.forgotH2")}</h2></div><button class="close" type="button" data-close>×</button></div>
        <div class="notice">${t("auth.forgotNotice")}</div>
        <div class="field"><label>${t("auth.emailLabel")}</label><input class="input" type="email" name="email" autocomplete="email" required placeholder="you@brand.com" /></div>
        <button class="button gold block" type="submit" ${state.authLoading ? "disabled" : ""}>${state.authLoading ? t("auth.forgotLoading") : t("auth.forgotSubmit")}</button>
        <button class="text-button auth-back" type="button" data-auth="login">${t("auth.forgotBack")}</button>
      </form>
    </div>`;
  }
  if (state.authMode === "reset") {
    return `<div class="modal-backdrop">
      <form class="modal auth-modal compact" id="reset-form">
        <div class="modal-top"><div><div class="eyebrow">${t("auth.resetEyebrow")}</div><h2>${t("auth.resetH2")}</h2></div><button class="close" type="button" data-close>×</button></div>
        <div class="notice">${t("auth.resetNotice", { contact: `<b>${escapeHtml(state.verificationContact)}</b>` })}</div>
        <div class="code-field"><input class="input" name="code" inputmode="numeric" autocomplete="one-time-code" required maxlength="6" placeholder="000000" /></div>
        <div class="field"><label>${t("auth.resetPasswordLabel")}</label><div class="password-wrap"><input class="input" type="${state.passwordVisible ? "text" : "password"}" name="new_password" autocomplete="new-password" minlength="8" required placeholder="${t("auth.passwordPlaceholder")}" /><button type="button" data-toggle-password>${state.passwordVisible ? t("auth.passwordHide") : t("auth.passwordShow")}</button></div></div>
        <button class="button gold block" type="submit" ${state.authLoading ? "disabled" : ""}>${state.authLoading ? t("auth.resetLoading") : t("auth.resetSubmit")}</button>
      </form>
    </div>`;
  }
  const register = state.authMode === "register";
  return `<div class="modal-backdrop">
    <form class="modal auth-modal" id="auth-form">
      <div class="auth-side">
        <div class="brand auth-brand">Dom<span>Studio</span></div>
        <h2>${register ? t("auth.sideRegisterH2") : t("auth.sideLoginH2")}</h2>
        <p>${register ? t("auth.sideRegisterP") : t("auth.sideLoginP")}</p>
        <ul class="auth-benefits">
          <li>${t("auth.benefit1")}</li>
          <li>${t("auth.benefit2")}</li>
          <li>${t("auth.benefit3")}</li>
        </ul>
      </div>
      <div class="auth-main">
        <div class="modal-top"><div><div class="eyebrow">${t("auth.eyebrow")}</div><h2>${register ? t("auth.registerH2") : t("auth.loginH2")}</h2></div><button class="close" type="button" data-close>×</button></div>
        <div class="auth-tabs">
          <button class="${state.authChannel === "email" ? "active" : ""}" type="button" data-auth-channel="email">Email</button>
          <button class="${state.authChannel === "phone" ? "active" : ""}" type="button" data-auth-channel="phone">${t("auth.tabPhone")}</button>
        </div>
        ${isPhone
          ? `<div class="field"><label>${t("auth.phoneLabel")}</label><input class="input" type="tel" name="phone" autocomplete="tel" required placeholder="+7 999 123-45-67" /></div>
             <div class="notice muted">${register ? t("auth.phoneNoticeRegister") : t("auth.phoneNoticeLogin")}</div>`
          : `<div class="field"><label>${t("auth.emailLabel")}</label><input class="input" type="email" name="email" autocomplete="email" required placeholder="you@brand.com" /></div>
             <div class="field"><label>${t("auth.passwordLabel")}</label><div class="password-wrap"><input class="input" type="${state.passwordVisible ? "text" : "password"}" name="password" autocomplete="${register ? "new-password" : "current-password"}" minlength="8" required placeholder="${t("auth.passwordPlaceholder")}" /><button type="button" data-toggle-password>${state.passwordVisible ? t("auth.passwordHide") : t("auth.passwordShow")}</button></div></div>`}
        ${register ? `<label class="check compact"><input type="checkbox" required /> ${t("auth.consent")}</label>` : ""}
        <button class="button gold block" type="submit" ${state.authLoading ? "disabled" : ""}>${state.authLoading ? t("auth.submitLoading") : register ? (isPhone ? t("auth.submitRegisterPhone") : t("auth.submitRegisterEmail")) : (isPhone ? t("auth.submitLoginPhone") : t("auth.submitLoginEmail"))}</button>
        ${!register && !isPhone ? `<p class="auth-switch"><button class="text-button" type="button" data-auth="forgot">${t("auth.forgotLink")}</button></p>` : ""}
        <p class="auth-switch">${register ? t("auth.haveAccount") : t("auth.noAccount")} <button class="text-button" type="button" data-auth="${register ? "login" : "register"}">${register ? t("auth.switchLogin") : t("auth.switchRegister")}</button></p>
      </div>
    </form>
  </div>`;
}

function render(options = {}) {
  const page = state.route === "studio" ? studioPage()
    : state.route === "examples" ? examplesPage()
    : state.route === "pricing" ? pricingPage()
    : state.route === "account" ? accountPage()
    : state.route === "history" ? historyPage()
    : homePage();
  document.title = t(`title.${state.route}`) || t("title.home");
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
  document.querySelector("#forgot-form")?.addEventListener("submit", submitForgotPassword);
  document.querySelector("#reset-form")?.addEventListener("submit", submitResetPassword);
  document.querySelector("#generate-form")?.addEventListener("submit", submitGeneration);
  document.querySelectorAll("[data-generation-kind]").forEach(el => el.addEventListener("click", () => setGenerationKind(el.dataset.generationKind)));
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
  document.querySelectorAll("[data-toggle-lang]").forEach(el => el.addEventListener("click", toggleLang));
}

function toggleLang() {
  const next = state.lang === "ru" ? "en" : "ru";
  state.lang = next;
  setLang(next);
  render();
}

function setGenerationKind(kind) {
  if (!["photo", "video"].includes(kind) || state.generationKind === kind) return;
  state.generationKind = kind;
  state.batchTotal = 0;
  state.batchIndex = 0;
  state.generatedImage = null;
  state.generatedVideo = null;
  state.generatedMeta = null;
  state.videoJob = null;
  render({ motion: false });
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
  button.textContent = state.passwordVisible ? t("auth.passwordHide") : t("auth.passwordShow");
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

  q(".button, .mode-card, .example-card, .price-card, .chip, .history-thumb, .nav-link, .token-pill, .profile-pill").forEach((el) => {
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
  toast(t("toast.promptBuilt"));
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
  toast(t("toast.brandSaved"));
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
    await generateWithPayload(payload, { label: t("studio.batchItemLabel", { n: i + 1, total: queue.length }) });
  }
  state.batchTotal = 0;
  state.batchIndex = 0;
  toast(t("toast.batchDone", { n: queue.length }));
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

function drawCover(ctx, image, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = Math.round(image.naturalWidth * scale);
  const drawHeight = Math.round(image.naturalHeight * scale);
  ctx.drawImage(image, Math.round((width - drawWidth) / 2), Math.round((height - drawHeight) / 2), drawWidth, drawHeight);
}

function drawFit(ctx, image, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = Math.round(image.naturalWidth * scale);
  const drawHeight = Math.round(image.naturalHeight * scale);
  ctx.drawImage(image, Math.round((width - drawWidth) / 2), Math.round((height - drawHeight) / 2), drawWidth, drawHeight);
}

async function renderToCanvas(image, sizeId, format) {
  const exportSize = EXPORT_SIZES[sizeId] || EXPORT_SIZES.original;
  const width = exportSize.width || image.naturalWidth;
  const height = exportSize.height || image.naturalHeight;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  const shouldFill = format === "jpeg" || exportSize.layout !== "original";
  if (shouldFill && exportSize.layout !== "blur") {
    ctx.fillStyle = exportSize.fill || "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  if (exportSize.layout === "cover") {
    drawCover(ctx, image, width, height);
  } else if (exportSize.layout === "blur") {
    ctx.save();
    ctx.filter = "blur(28px)";
    drawCover(ctx, image, width, height);
    ctx.restore();
    ctx.fillStyle = exportSize.fill || "rgba(255,255,255,.22)";
    ctx.fillRect(0, 0, width, height);
    drawFit(ctx, image, width, height);
  } else {
    drawFit(ctx, image, width, height);
  }

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
    toast(t("toast.exportFailed"));
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
    toast(t("toast.downloaded", { name: fmt.labelKey ? t(fmt.labelKey) : fmt.label }));
  } catch {
    toast(t("toast.exportFailed"));
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
    toast(t("toast.historyDeleteFailed"));
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
      toast(t("toast.codeSent"));
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

async function submitForgotPassword(event) {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get("email");
  state.authLoading = true;
  render();
  try {
    await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    state.verificationContact = email;
    state.authMode = "reset";
    state.authLoading = false;
    toast(t("toast.codeSent"));
    render();
  } catch (error) {
    toast(error.message);
    state.authLoading = false;
    render();
  }
}

async function submitResetPassword(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = { email: state.verificationContact, code: form.get("code"), new_password: form.get("new_password") };
  state.authLoading = true;
  render();
  try {
    saveTokens(await api("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }));
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
  if (oversized) return toast(t("toast.fileTooBig", { name: escapeHtml(oversized.name) }));

  if (files.length === 1) {
    const reader = new FileReader();
    reader.onload = () => {
      state.selectedImage = String(reader.result).split(",")[1];
      state.selectedImageName = files[0].name;
      state.batchQueue = [];
      const label = document.querySelector("#upload-label span");
      if (label) label.innerHTML = `<strong>${escapeHtml(files[0].name)}</strong><br />${t("studio.uploadReady")}`;
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
    state.selectedImageName = `${queue.length} ${t("pricing.photos")}`;
    render({ motion: false });
  });
}

async function submitGeneration(event) {
  event.preventDefault();
  syncDraftFromForm(event.currentTarget);
  const values = { ...state.formDraft };
  if (state.generationKind === "video") {
    if (state.batchQueue.length > 1) toast(t("video.batchNotice"));
    const payload = composeVideoPayload(values);
    state.formDraft.subject = payload.subject;
    await generateVideoWithPayload(payload);
    return;
  }
  if (state.batchQueue.length > 1) {
    await processBatch(values);
    return;
  }
  const payload = composeGenerationPayload(values);
  if ((values.mode || currentMarketplace().mode) === "catalog" && payload.mode === "product") {
    toast(t("toast.sceneModeSwitched"));
  }
  state.formDraft.subject = payload.subject;
  await generateWithPayload(payload);
}

async function generateVideoWithPayload(payload) {
  clearTimeout(videoPollTimer);
  state.generating = true;
  state.generationLabel = t("video.submitGenerating");
  state.generatedImage = null;
  state.generatedVideo = null;
  state.generatedMeta = null;
  state.videoJob = null;
  render();
  try {
    const job = await api("/generation/video", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.videoJob = job;
    await loadUser();
    toast(t("video.queued"));
    render({ motion: false });
    await pollVideoJob(job.job_id);
  } catch (error) {
    state.generating = false;
    state.generationLabel = "";
    toast(error.message);
    render({ motion: false });
  }
}

async function pollVideoJob(jobId, attempt = 0) {
  try {
    const job = await api(`/generation/jobs/${jobId}`);
    state.videoJob = job;
    const source = videoSourceFromJob(job);
    if (source) {
      state.generatedVideo = source;
      state.generatedMeta = { ...job, mode: job.mode };
    }
    if (job.status === "done") {
      state.generating = false;
      state.generationLabel = "";
      await loadUser();
      toast(source ? t("video.done") : t("video.doneNoOutput"));
      render({ motion: false });
      return;
    }
    if (job.status === "failed") {
      state.generating = false;
      state.generationLabel = "";
      await loadUser();
      toast(job.error || t("video.failed"));
      render({ motion: false });
      return;
    }
    if (attempt >= 120) {
      state.generating = false;
      state.generationLabel = "";
      toast(t("video.timeout"));
      render({ motion: false });
      return;
    }
    state.generationLabel = t(`video.status.${job.status}`) || t("video.submitGenerating");
    render({ motion: false });
    videoPollTimer = setTimeout(() => pollVideoJob(jobId, attempt + 1), 3000);
  } catch (error) {
    state.generating = false;
    state.generationLabel = "";
    toast(error.message);
    render({ motion: false });
  }
}

async function generateWithPayload(payload, options = {}) {
  const previousImage = options.keepCurrentImage ? state.generatedImage : null;
  const previousMeta = options.keepCurrentImage ? state.generatedMeta : null;
  state.generating = true;
  state.generationLabel = options.label ? `${t("studio.submitGenerating").replace("…", "")} ${options.label}…` : t("studio.submitGenerating");
  if (!options.keepCurrentImage) {
    state.generatedImage = null;
    state.generatedVideo = null;
    state.videoJob = null;
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
    toast(options.label ? t("toast.variationDone", { label: options.label }) : t("toast.photoDone"));
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
      toast(t("toast.paymentSuccess"));
      navigate("account");
      render();
    });
  } else if (payment === "failed") {
    toast(t("toast.paymentFailed"));
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
          title: "DomStudio",
          text: subject || "DomStudio AI",
          files: [file],
        });
        return;
      }
    }
    const blob = await (await fetch(state.generatedImage)).blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    toast(t("toast.imageCopied"));
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
