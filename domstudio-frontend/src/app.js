import "./styles.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const MODES = [
  ["catalog", "Каталог", "Чистый фон и точная подача для маркетплейсов."],
  ["product", "Предметная", "Премиальный свет, фактуры и рекламный кадр."],
  ["creative", "Креатив", "Выразительный контент для соцсетей и кампаний."],
  ["image", "Lifestyle", "Товар в естественной сцене с AI-моделью."],
  ["fitting", "Примерка", "Виртуальная примерка одежды и аксессуаров."],
  ["mobile", "Stories", "Вертикальный UGC-контент в формате 9:16."],
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
    id: "instagram",
    label: "Instagram Post",
    mode: "creative",
    hint: "Instagram 4:5 feed creative, editorial composition, scroll-stopping but realistic, tasteful brand mood.",
    subjectInstruction: "Make it work as an Instagram feed post.",
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

const HISTORY_DB = "domstudio_history";
const HISTORY_STORE = "results";
const HISTORY_LIMIT = 5;
const BRAND_PREFS_KEY = "domstudio_brand_preferences";

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
  plans: [],
  authMode: null,
  verificationContact: null,
  verificationKind: "email",
  selectedImage: null,
  selectedImageName: null,
  generatedImage: null,
  generatedMeta: null,
  lastGenerationPayload: null,
  history: [],
  brandPrefs: initialBrandPrefs,
  generating: false,
  formDraft: {
    mode: "catalog",
    marketplace: initialBrandPrefs.default_marketplace,
    style_template: initialBrandPrefs.default_style_template,
    brand_colors: initialBrandPrefs.brand_colors,
  },
};

const app = document.querySelector("#app");

function navigate(route) {
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
    state.plans = [
      { name: "free", price_rub: 0, photos: 5, tokens: 500 },
      { name: "basic", price_rub: 1750, photos: 25, tokens: 2500 },
      { name: "pro", price_rub: 3750, photos: 60, tokens: 6000 },
    ];
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
            <span>${escapeHtml(item.mode)} ${item.width && item.height ? `· ${item.width}×${item.height}` : ""}</span>
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
    </div>
  </div>`;
}

function variationTools() {
  if (!state.generatedImage || !state.lastGenerationPayload) return "";
  return `<div class="variation-tools">
    <div class="mini-head"><h3>Вариации</h3><span>100 токенов при клике</span></div>
    <div class="chip-row">
      ${VARIATIONS.map((variation) => `<button class="chip" type="button" data-variation="${variation.id}" ${state.generating ? "disabled" : ""}>${variation.label}</button>`).join("")}
    </div>
  </div>`;
}

function nav() {
  const logged = Boolean(state.user);
  return `
    <nav class="nav">
      <button class="brand" data-route="home">Dom<span>Studio</span></button>
      <div class="nav-links">
        <button class="nav-link ${state.route === "home" ? "active" : ""}" data-route="home">Главная</button>
        <button class="nav-link ${state.route === "studio" ? "active" : ""}" data-route="studio">Студия</button>
        <button class="nav-link ${state.route === "pricing" ? "active" : ""}" data-route="pricing">Тарифы</button>
        ${logged ? `<button class="nav-link ${state.route === "account" ? "active" : ""}" data-route="account">Аккаунт</button>` : ""}
      </div>
      <div class="nav-actions">
        ${logged
          ? `<button class="button secondary" data-route="account">${state.user.email || state.user.phone || "Аккаунт"}</button>
             <button class="button" data-route="studio">Создать фото</button>`
          : `<button class="button secondary" data-auth="login">Войти</button>
             <button class="button" data-auth="register">Начать бесплатно</button>`}
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
          <div class="eyebrow">AI-фотостудия для товаров</div>
          <h1>Контент, который <em>продаёт</em></h1>
          <p>Загрузите обычное фото товара и получите готовую студийную съёмку для маркетплейсов, рекламы и социальных сетей.</p>
          <div class="hero-actions">
            <button class="button gold" data-route="studio">Создать первое фото</button>
            <button class="button secondary" data-route="pricing">Посмотреть тарифы</button>
          </div>
          <div class="trust-row"><span>5 фото бесплатно</span><span>6 режимов съёмки</span><span>Результат за минуты</span></div>
        </div>
        <div class="hero-visual">
          <div class="product-stage"></div>
          <div class="float-card"><b>4K</b><span>готово для карточки товара</span></div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Одна студия. Шесть способов показать товар.</h2>
          <p>Выберите задачу, добавьте описание и получите визуал в нужном формате.</p>
        </div>
        <div class="mode-grid">
          ${MODES.map((mode, index) => `
            <article class="mode-card">
              <span class="number">0${index + 1}</span>
              <h3>${mode[1]}</h3>
              <p>${mode[2]}</p>
            </article>`).join("")}
        </div>
      </section>

      <section class="section dark">
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
          <div class="brand-preferences">
            <div class="mini-head"><h3>Бренд</h3><span>сохранит текущую площадку и стиль</span></div>
            <div class="helper-grid">
              <div class="field"><label for="brand_pref_colors">Цвета</label><input class="input" id="brand_pref_colors" name="brand_pref_colors" value="${brandPrefValue("brand_colors")}" placeholder="ivory, gold, deep green" /></div>
              <div class="field"><label for="brand_pref_background">Фон</label><input class="input" id="brand_pref_background" name="brand_pref_background" value="${brandPrefValue("preferred_background")}" placeholder="тёплый светлый фон" /></div>
              <div class="field"><label for="brand_pref_mood">Настроение</label><input class="input" id="brand_pref_mood" name="brand_pref_mood" value="${brandPrefValue("brand_mood")}" placeholder="clean luxury, calm, premium" /></div>
              <div class="field"><label for="brand_pref_avoid">Не использовать</label><input class="input" id="brand_pref_avoid" name="brand_pref_avoid" value="${brandPrefValue("do_not_use")}" placeholder="неон, дешёвый пластик, текст" /></div>
            </div>
            <button class="button secondary block" type="button" data-save-brand>Сохранить бренд</button>
          </div>
          <div class="prompt-helper">
            <div class="mini-head"><h3>Помощник промпта</h3><span>соберёт основу сам</span></div>
            <div class="helper-grid">
              <div class="field"><label for="product_type">Тип товара</label><input class="input" id="product_type" name="product_type" value="${draftValue("product_type")}" placeholder="Золотые серьги-кольца" /></div>
              <div class="field"><label for="brand_colors">Цвета бренда</label><input class="input" id="brand_colors" name="brand_colors" value="${draftValue("brand_colors") || brandPrefValue("brand_colors")}" placeholder="ivory, gold, deep green" /></div>
              <div class="field wide"><label for="constraints">Ограничения</label><input class="input" id="constraints" name="constraints" value="${draftValue("constraints")}" placeholder="без текста, без рук, сохранить форму упаковки" /></div>
            </div>
            <button class="button secondary block" type="button" data-build-prompt>Собрать промпт из настроек</button>
          </div>
          <div class="field"><label for="subject">Что снимаем</label><textarea class="textarea" id="subject" name="subject" required placeholder="Например: золотые серьги-кольца на светлом фоне">${draftValue("subject")}</textarea></div>
          <div class="field"><label for="style_hint">Пожелания к стилю</label><input class="input" id="style_hint" name="style_hint" value="${draftValue("style_hint")}" placeholder="Тёплый свет, премиальный минимализм" /></div>
          <label class="upload" id="upload-label"><input type="file" id="image" accept="image/*" /><span><strong>${state.selectedImageName ? escapeHtml(state.selectedImageName) : "Добавить фото товара"}</strong><br />${state.selectedImageName ? "Фото готово к генерации" : "PNG или JPEG, до 10 МБ"}</span></label>
          <label class="check"><input type="checkbox" name="upscale_4k" ${checkedAttr(state.formDraft.upscale_4k)} /> Сделать дополнительный 4K-апскейл</label>
          <button class="button gold block" type="submit" ${state.generating ? "disabled" : ""}>${state.generating ? "Создаём кадр…" : "Создать фото · 100 токенов"}</button>
        </form>
        <div class="panel">
          <div class="result ${state.generating ? "loading" : ""}">
            ${state.generatedImage
              ? `<img src="${state.generatedImage}" alt="Сгенерированный результат" />`
              : `<div class="result-empty"><b>${state.generating ? "Собираем студию…" : "Здесь появится результат"}</b>${state.generating ? "Генерация может занять несколько минут." : "Заполните описание, выберите режим и запустите генерацию."}</div>`}
          </div>
          ${state.generatedMeta ? `<p class="result-meta">${state.generatedMeta.width || "?"}×${state.generatedMeta.height || "?"} · ${escapeHtml(state.generatedMeta.mode || "")}</p>` : ""}
          ${exportTools()}
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
  return `<main class="app-layout">
    ${appSidebar("account")}
    <section class="workspace">
      <header class="workspace-head"><div><div class="eyebrow">Аккаунт</div><h1>Обзор</h1></div><button class="button" data-route="studio">Создать фото</button></header>
      <div class="stats">
        <article class="stat"><span>Текущий тариф</span><b>${sub.plan || "free"}</b></article>
        <article class="stat"><span>Осталось токенов</span><b>${state.user.tokens}</b></article>
        <article class="stat"><span>Фото в этом периоде</span><b>${sub.photos_used || 0} / ${sub.photos_limit || 5}</b></article>
      </div>
      <div class="panel"><h3>Данные аккаунта</h3><p>${state.user.email || state.user.phone}</p><p>Статус: ${state.user.is_verified ? "подтверждён" : "ожидает подтверждения"}</p></div>
    </section>
  </main>`;
}

function pricingPage() {
  const cards = state.plans.filter(plan => ["free", "basic", "pro", "business", "agency"].includes(plan.name));
  return `<main class="${state.user ? "app-layout" : "page"}">
    ${state.user ? appSidebar("pricing") : ""}
    <section class="${state.user ? "workspace" : "section"}">
      <header class="workspace-head"><div><div class="eyebrow">Тарифы</div><h1>Масштабируйте контент</h1></div></header>
      <div class="price-grid">
        ${cards.map(plan => `
          <article class="price-card ${plan.name === "pro" ? "featured" : ""}">
            <h3>${plan.name}</h3>
            <div class="price">${plan.price_rub.toLocaleString("ru-RU")} ₽ <small>/ месяц</small></div>
            <ul class="price-list"><li>${plan.photos} фото</li><li>${plan.tokens.toLocaleString("ru-RU")} токенов</li><li>Все режимы съёмки</li></ul>
            <button class="button ${plan.name === "pro" ? "gold" : ""}" data-plan="${plan.name}">${plan.price_rub ? "Выбрать тариф" : "Начать бесплатно"}</button>
          </article>`).join("")}
      </div>
    </section>
  </main>`;
}

function authModal() {
  if (!state.authMode) return "";
  if (state.authMode === "verify") {
    return `<div class="modal-backdrop"><form class="modal" id="verify-form"><div class="modal-top"><div><div class="eyebrow">Подтверждение</div><h2>Введите код</h2></div><button class="close" type="button" data-close>×</button></div><div class="notice">Код отправлен на ${state.verificationContact}</div><div class="field"><label>Код из письма</label><input class="input" name="code" required maxlength="6" /></div><button class="button block" type="submit">Подтвердить</button></form></div>`;
  }
  const register = state.authMode === "register";
  return `<div class="modal-backdrop"><form class="modal" id="auth-form"><div class="modal-top"><div><div class="eyebrow">DomStudio</div><h2>${register ? "Создать аккаунт" : "Войти"}</h2></div><button class="close" type="button" data-close>×</button></div><div class="field"><label>Email</label><input class="input" type="email" name="email" required /></div><div class="field"><label>Пароль</label><input class="input" type="password" name="password" minlength="8" required /></div><button class="button gold block" type="submit">${register ? "Создать аккаунт" : "Войти"}</button><p class="auth-switch">${register ? "Уже есть аккаунт?" : "Ещё нет аккаунта?"} <button class="text-button" type="button" data-auth="${register ? "login" : "register"}">${register ? "Войти" : "Создать"}</button></p></form></div>`;
}

function render() {
  const page = state.route === "studio" ? studioPage()
    : state.route === "pricing" ? pricingPage()
    : state.route === "account" ? accountPage()
    : homePage();
  app.innerHTML = `<div class="shell">${nav()}${page}${footer()}${authModal()}</div>`;
  bind();
}

function bind() {
  document.querySelectorAll("[data-route]").forEach(el => el.addEventListener("click", () => navigate(el.dataset.route)));
  document.querySelectorAll("[data-auth]").forEach(el => el.addEventListener("click", () => { state.authMode = el.dataset.auth; render(); }));
  document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", () => { state.authMode = null; render(); }));
  document.querySelectorAll("[data-logout]").forEach(el => el.addEventListener("click", () => logout()));
  document.querySelectorAll("[data-plan]").forEach(el => el.addEventListener("click", () => choosePlan(el.dataset.plan)));
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
  document.querySelector("[data-save-brand]")?.addEventListener("click", saveBrandPreferences);
  document.querySelector("[data-build-prompt]")?.addEventListener("click", buildPromptFromHelper);
  document.querySelectorAll("[data-variation]").forEach(el => el.addEventListener("click", () => regenerateVariation(el.dataset.variation)));
  document.querySelector("[data-export]")?.addEventListener("click", exportGeneratedImage);
  document.querySelectorAll("[data-history-id]").forEach(el => el.addEventListener("click", () => restoreHistoryItem(el.dataset.historyId)));
  document.querySelectorAll("[data-delete-history]").forEach(el => el.addEventListener("click", () => removeHistoryItem(el.dataset.deleteHistory)));
  document.querySelector("#image")?.addEventListener("change", selectImage);
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
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function exportGeneratedImage() {
  if (!state.generatedImage) return;
  try {
    const format = document.querySelector("#export-format")?.value || "png";
    const sizeId = document.querySelector("#export-size")?.value || "original";
    const exportSize = EXPORT_SIZES[sizeId] || EXPORT_SIZES.original;
    const image = await loadImage(state.generatedImage);
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
    const x = Math.round((width - drawWidth) / 2);
    const y = Math.round((height - drawHeight) / 2);
    ctx.drawImage(image, x, y, drawWidth, drawHeight);

    const mime = format === "jpeg" ? "image/jpeg" : `image/${format}`;
    const link = document.createElement("a");
    link.href = canvas.toDataURL(mime, 0.94);
    link.download = `domstudio-${sizeId}.${format === "jpeg" ? "jpg" : format}`;
    link.click();
  } catch {
    toast("Не удалось экспортировать изображение");
  }
}

function restoreHistoryItem(id) {
  const item = state.history.find((historyItem) => historyItem.id === id);
  if (!item) return;
  state.generatedImage = item.dataUrl;
  state.generatedMeta = item;
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
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  const body = Object.fromEntries(new FormData(event.currentTarget));
  try {
    if (state.authMode === "register") {
      await api("/auth/register/email", { method: "POST", body: JSON.stringify(body) });
      state.verificationContact = body.email;
      state.verificationKind = "email";
      state.authMode = "verify";
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
    button.disabled = false;
  }
}

async function submitVerification(event) {
  event.preventDefault();
  const body = { contact: state.verificationContact, code: new FormData(event.currentTarget).get("code") };
  try {
    saveTokens(await api(`/auth/verify/${state.verificationKind}`, { method: "POST", body: JSON.stringify(body) }));
    state.authMode = null;
    await loadUser();
    navigate("studio");
    render();
  } catch (error) {
    toast(error.message);
  }
}

function selectImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) return toast("Файл должен быть меньше 10 МБ");
  const reader = new FileReader();
  reader.onload = () => {
    state.selectedImage = String(reader.result).split(",")[1];
    state.selectedImageName = file.name;
    document.querySelector("#upload-label span").innerHTML = `<strong>${escapeHtml(file.name)}</strong><br />Фото готово к генерации`;
  };
  reader.readAsDataURL(file);
}

async function submitGeneration(event) {
  event.preventDefault();
  syncDraftFromForm(event.currentTarget);
  const values = { ...state.formDraft };
  const payload = composeGenerationPayload(values);
  state.formDraft.subject = payload.subject;
  await generateWithPayload(payload);
}

async function generateWithPayload(payload) {
  state.generating = true;
  state.generatedImage = null;
  state.generatedMeta = null;
  state.lastGenerationPayload = payload;
  render();
  try {
    const result = await api("/generation/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const dataUrl = `data:image/${String(result.format || "png").toLowerCase()};base64,${result.image}`;
    state.generatedImage = dataUrl;
    state.generatedMeta = result;
    await rememberResult(result, dataUrl, payload);
    await loadUser();
    toast("Фото готово");
  } catch (error) {
    toast(error.message);
  } finally {
    state.generating = false;
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

window.addEventListener("hashchange", () => {
  state.route = location.hash.slice(1) || "home";
  render();
});

await Promise.all([loadUser(), loadPlans(), loadHistory()]);
render();
