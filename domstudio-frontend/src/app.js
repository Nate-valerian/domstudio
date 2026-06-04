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
  generatedImage: null,
  generating: false,
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
          <div class="field"><label for="mode">Режим съёмки</label><select class="select" id="mode" name="mode">${MODES.map(mode => `<option value="${mode[0]}">${mode[1]} — ${mode[2]}</option>`).join("")}</select></div>
          <div class="field"><label for="subject">Что снимаем</label><textarea class="textarea" id="subject" name="subject" required placeholder="Например: золотые серьги-кольца на светлом фоне"></textarea></div>
          <div class="field"><label for="style_hint">Пожелания к стилю</label><input class="input" id="style_hint" name="style_hint" placeholder="Тёплый свет, премиальный минимализм" /></div>
          <label class="upload" id="upload-label"><input type="file" id="image" accept="image/*" /><span><strong>Добавить фото товара</strong><br />PNG или JPEG, до 10 МБ</span></label>
          <label class="check"><input type="checkbox" name="upscale_4k" /> Сделать дополнительный 4K-апскейл</label>
          <button class="button gold block" type="submit" ${state.generating ? "disabled" : ""}>${state.generating ? "Создаём кадр…" : "Создать фото · 100 токенов"}</button>
        </form>
        <div class="panel">
          <div class="result ${state.generating ? "loading" : ""}">
            ${state.generatedImage
              ? `<img src="${state.generatedImage}" alt="Сгенерированный результат" />`
              : `<div class="result-empty"><b>${state.generating ? "Собираем студию…" : "Здесь появится результат"}</b>${state.generating ? "Генерация может занять несколько минут." : "Заполните описание, выберите режим и запустите генерацию."}</div>`}
          </div>
          ${state.generatedImage ? `<a class="button block" href="${state.generatedImage}" download="domstudio-result.png">Скачать PNG</a>` : ""}
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
  document.querySelector("#image")?.addEventListener("change", selectImage);
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
    document.querySelector("#upload-label span").innerHTML = `<strong>${file.name}</strong><br />Фото готово к генерации`;
  };
  reader.readAsDataURL(file);
}

async function submitGeneration(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  state.generating = true;
  state.generatedImage = null;
  render();
  try {
    const result = await api("/generation/generate", {
      method: "POST",
      body: JSON.stringify({
        mode: values.mode,
        subject: values.subject,
        style_hint: values.style_hint || "",
        image: state.selectedImage,
        upscale_4k: values.upscale_4k === "on",
      }),
    });
    state.generatedImage = `data:image/${String(result.format || "png").toLowerCase()};base64,${result.image}`;
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

await Promise.all([loadUser(), loadPlans()]);
render();
