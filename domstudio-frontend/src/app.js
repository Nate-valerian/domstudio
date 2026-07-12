import "./styles.css";
import { gsap } from "gsap";
import { t, getLang, setLang, isRussianMarket } from "./i18n.js";
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
import examplePerfumeLifestyleUrl from "./assets/examples/example-perfume-lifestyle.webp";
import examplePerfumeFittingUrl from "./assets/examples/example-perfume-fitting.webp";
import examplePerfumeMobileUrl from "./assets/examples/example-perfume-mobile.webp";
import exampleBottleCatalogUrl from "./assets/examples/example-bottle-catalog.webp";
import exampleBottleProductUrl from "./assets/examples/example-bottle-product.webp";
import exampleBottleLifestyleUrl from "./assets/examples/example-bottle-lifestyle.webp";
import pastryBeforeUrl from "./assets/examples/pastry-before.jpeg";
import pastryAfterUrl from "./assets/examples/pastry-after.jpeg";
import soupBeforeUrl from "./assets/examples/soup-before.jpg";
import soupLuxuryAfterUrl from "./assets/examples/soup-luxury-after.png";
import carBeforeUrl from "./assets/examples/car-before.jpeg";
import carShowroomAfterUrl from "./assets/examples/car-showroom-after.png";
import soupLuxuryVideoUrl from "./assets/examples/videos/soup-luxury-5s.mp4";
import carShowroomVideoUrl from "./assets/examples/videos/car-showroom-5s.mp4";
import pastryCreamVideoUrl from "./assets/examples/videos/pastry-cream-5s.mp4";
import wineProductVideoUrl from "./assets/examples/videos/wine-product-5s.mp4";
import fashionFittingVideoUrl from "./assets/examples/videos/fashion-fitting-5s.mp4";
import landingWineBeforeUrl from "./assets/landing/wine-before-original.jpeg";
import landingWineAfterUrl from "./assets/landing/wine-after-smoke.png";
import landingWineVideoUrl from "./assets/landing/wine-after-smoke-5s.mp4";
import lookWomenFlatlayUrl from "./assets/landing/look-women-flatlay.webp";
import lookFormalFlatlayUrl from "./assets/landing/look-formal-flatlay.webp";
import lookJewelryModelUrl from "./assets/landing/look-jewelry-model.webp";
import lookSmartFlatlayUrl from "./assets/landing/look-smart-flatlay.webp";
import lookElectronicsUrl from "./assets/landing/look-electronics.webp";
import lookFoodStorageUrl from "./assets/landing/look-food-storage.webp";
import lookStorageBoxesUrl from "./assets/landing/look-storage-boxes.webp";
import lookHomeVaseUrl from "./assets/landing/look-home-vase.webp";
import lookBackpackUrl from "./assets/landing/look-backpack.webp";
import mensAccessoriesBeforeUrl from "./assets/landing/user-sources/mens-accessories-before.jpg";
import formalOutfitBeforeUrl from "./assets/landing/user-sources/formal-outfit-before.jpg";
import jewelryCloseBeforeUrl from "./assets/landing/user-sources/jewelry-close-before.jpg";
import premiumFashionLoftAfterUrl from "./assets/landing/generated-premium/premium-fashion-loft-after.png";
import premiumFashionLoftVideoUrl from "./assets/landing/generated-premium/premium-fashion-loft-after-5s.mp4";
import premiumMensAccessoriesAfterUrl from "./assets/landing/generated-premium/premium-mens-accessories-after.png";
import premiumMensAccessoriesVideoUrl from "./assets/landing/generated-premium/premium-mens-accessories-after-5s.mp4";
import premiumFormalOutfitAfterUrl from "./assets/landing/generated-premium/premium-formal-outfit-after.png";
import premiumFormalOutfitVideoUrl from "./assets/landing/generated-premium/premium-formal-outfit-after-5s.mp4";
import premiumJewelryCloseAfterUrl from "./assets/landing/generated-premium/premium-jewelry-close-after.png";
import premiumJewelryCloseVideoUrl from "./assets/landing/generated-premium/premium-jewelry-close-after-5s.mp4";
import premiumElectronicsAfterUrl from "./assets/landing/generated-premium/premium-electronics-use-after.png";
import premiumElectronicsVideoUrl from "./assets/landing/generated-premium/premium-electronics-after-5s.mp4";
import premiumBagsAfterUrl from "./assets/landing/generated-premium/premium-bags-after.png";
import premiumBagsVideoUrl from "./assets/landing/generated-premium/premium-bags-after-5s.mp4";
import premiumHomeAfterUrl from "./assets/landing/generated-premium/premium-home-after.png";
import premiumHomeVideoUrl from "./assets/landing/generated-premium/premium-home-after-5s.mp4";
import premiumFoodAfterUrl from "./assets/landing/generated-premium/premium-food-after.png";
import premiumFoodVideoUrl from "./assets/landing/generated-premium/premium-food-after-5s.mp4";
import premiumJewelryAfterUrl from "./assets/landing/generated-premium/premium-jewelry-after.png";
import premiumJewelryVideoUrl from "./assets/landing/generated-premium/premium-jewelry-after-5s.mp4";
import categoryMarketplaceUrl from "./assets/category-proof/category-marketplace.webp";
import categoryJewelryUrl from "./assets/category-proof/category-jewelry.webp";
import categoryCafeUrl from "./assets/category-proof/category-cafe.webp";
import categoryFoodUrl from "./assets/category-proof/category-food.webp";
import techDolphinLogoUrl from "./assets/tech-dolphin-logo.png";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const IMGLY_DATA_CDN = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

function imglyPublicPath() {
  if (import.meta.env.VITE_IMGLY_PUBLIC_PATH === "cdn") return IMGLY_DATA_CDN;
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname.endsWith(".vercel.app")) {
    return IMGLY_DATA_CDN;
  }
  return `${location.origin}/imgly/`;
}

const MODES = [
  ["catalog", "Каталог", "Чистый фон и точная подача для маркетплейсов.", modeCatalogUrl, "Пример чистой карточки товара для маркетплейса", modeCatalogBeforeUrl, "Фон + тени"],
  ["product", "Предметная", "Премиальный свет, фактуры и рекламный кадр.", modeProductUrl, "Пример премиальной предметной съёмки", modeProductBeforeUrl, "Свет + сет"],
  ["creative", "Креатив", "Выразительный контент для соцсетей и кампаний.", modeCreativeUrl, "Пример креативного рекламного визуала", modeCreativeBeforeUrl, "Кампания"],
  ["image", "Lifestyle", "Товар в естественной сцене с AI-моделью.", modeLifestyleUrl, "Пример lifestyle-кадра с товаром", modeLifestyleBeforeUrl, "Сцена"],
  ["fitting", "Примерка", "Виртуальная примерка одежды и аксессуаров.", modeFittingUrl, "Пример виртуальной примерки", modeFittingBeforeUrl, "Примерка"],
  ["mobile", "Stories", "Вертикальный UGC-контент в формате 9:16.", modeStoriesUrl, "Пример вертикального story-контента", modeStoriesBeforeUrl, "9:16"],
];

const EXAMPLE_IMAGES = [
  { mode: "До · После · Видео", product: "Выпечка с голубикой", title: "Ресторанная подача со сливками", beforeSrc: pastryBeforeUrl, src: pastryAfterUrl, videoSrc: pastryCreamVideoUrl },
  { mode: "До · После · Видео", product: "Суп с креветками", title: "Премиальная подача со свечами", beforeSrc: soupBeforeUrl, src: soupLuxuryAfterUrl, videoSrc: soupLuxuryVideoUrl },
  { mode: "До · После · Видео", product: "Серебристый суперкар", title: "Автомобильный кадр в шоуруме", beforeSrc: carBeforeUrl, src: carShowroomAfterUrl, videoSrc: carShowroomVideoUrl },
  { mode: "Примерка", product: "Бежевый костюм", title: "Виртуальная примерка", src: modeFittingUrl, videoSrc: fashionFittingVideoUrl },
  { mode: "Каталог", product: "Фарфоровая ваза", title: "Чистая карточка для маркетплейса", src: examplePerfumeCatalogUrl },
  { mode: "Lifestyle", product: "Синий фарфор", title: "Тёплый интерьерный контекст", src: examplePerfumeLifestyleUrl },
  { mode: "Примерка", product: "Колье", title: "Украшение на модели", src: examplePerfumeFittingUrl },
  { mode: "Stories", product: "Авторский чай", title: "Вертикальный формат сторис", src: examplePerfumeMobileUrl },
  { mode: "Предметная", product: "Фарфоровая ваза", title: "AI-видео с мягким движением", src: exampleBottleProductUrl, videoSrc: wineProductVideoUrl },
];

const LOOK_SCENARIOS = [
  {
    id: "suit",
    titleKey: "home.look.suit.title",
    metaKey: "home.look.suit.meta",
    promptKey: "home.look.suit.prompt",
    result: premiumFashionLoftAfterUrl,
    video: premiumFashionLoftVideoUrl,
    sourceA: lookWomenFlatlayUrl,
    sourceB: lookWomenFlatlayUrl,
    ghostA: premiumFashionLoftAfterUrl,
    ghostB: modeFittingUrl,
  },
  {
    id: "jewelry",
    titleKey: "home.look.jewelry.title",
    metaKey: "home.look.jewelry.meta",
    promptKey: "home.look.jewelry.prompt",
    result: premiumJewelryAfterUrl,
    video: premiumJewelryVideoUrl,
    sourceA: categoryJewelryUrl,
    sourceB: lookJewelryModelUrl,
    ghostA: categoryJewelryUrl,
    ghostB: examplePerfumeFittingUrl,
  },
  {
    id: "jewelryClose",
    titleKey: "home.look.jewelryClose.title",
    metaKey: "home.look.jewelryClose.meta",
    promptKey: "home.look.jewelryClose.prompt",
    result: premiumJewelryCloseAfterUrl,
    video: premiumJewelryCloseVideoUrl,
    sourceA: jewelryCloseBeforeUrl,
    sourceB: categoryJewelryUrl,
    ghostA: premiumJewelryAfterUrl,
    ghostB: examplePerfumeFittingUrl,
  },
  {
    id: "formalOutfit",
    titleKey: "home.look.formalOutfit.title",
    metaKey: "home.look.formalOutfit.meta",
    promptKey: "home.look.formalOutfit.prompt",
    result: premiumFormalOutfitAfterUrl,
    video: premiumFormalOutfitVideoUrl,
    sourceA: formalOutfitBeforeUrl,
    sourceB: lookFormalFlatlayUrl,
    ghostA: premiumFashionLoftAfterUrl,
    ghostB: modeFittingUrl,
  },
  {
    id: "mensAccessories",
    titleKey: "home.look.mensAccessories.title",
    metaKey: "home.look.mensAccessories.meta",
    promptKey: "home.look.mensAccessories.prompt",
    result: premiumMensAccessoriesAfterUrl,
    video: premiumMensAccessoriesVideoUrl,
    sourceA: mensAccessoriesBeforeUrl,
    sourceB: lookSmartFlatlayUrl,
    ghostA: premiumFormalOutfitAfterUrl,
    ghostB: lookFormalFlatlayUrl,
  },
  {
    id: "electronics",
    titleKey: "home.look.electronics.title",
    metaKey: "home.look.electronics.meta",
    promptKey: "home.look.electronics.prompt",
    result: premiumElectronicsAfterUrl,
    video: premiumElectronicsVideoUrl,
    sourceA: lookElectronicsUrl,
    sourceB: categoryMarketplaceUrl,
    ghostA: productProofUrl,
    ghostB: lookSmartFlatlayUrl,
  },
  {
    id: "food",
    titleKey: "home.look.food.title",
    metaKey: "home.look.food.meta",
    promptKey: "home.look.food.prompt",
    result: premiumFoodAfterUrl,
    video: premiumFoodVideoUrl,
    sourceA: lookFoodStorageUrl,
    sourceB: categoryFoodUrl,
    ghostA: categoryCafeUrl,
    ghostB: exampleBottleLifestyleUrl,
  },
  {
    id: "pastry",
    titleKey: "home.look.pastry.title",
    metaKey: "home.look.pastry.meta",
    promptKey: "home.look.pastry.prompt",
    result: pastryAfterUrl,
    video: pastryCreamVideoUrl,
    sourceA: pastryBeforeUrl,
    sourceB: pastryBeforeUrl,
    ghostA: pastryAfterUrl,
    ghostB: premiumFoodAfterUrl,
  },
  {
    id: "drinks",
    titleKey: "home.look.drinks.title",
    metaKey: "home.look.drinks.meta",
    promptKey: "home.look.drinks.prompt",
    result: landingWineAfterUrl,
    video: landingWineVideoUrl,
    sourceA: landingWineBeforeUrl,
    sourceB: exampleBottleProductUrl,
    ghostA: landingWineAfterUrl,
    ghostB: exampleBottleLifestyleUrl,
  },
  {
    id: "bags",
    titleKey: "home.look.bags.title",
    metaKey: "home.look.bags.meta",
    promptKey: "home.look.bags.prompt",
    result: premiumBagsAfterUrl,
    video: premiumBagsVideoUrl,
    sourceA: lookBackpackUrl,
    sourceB: lookStorageBoxesUrl,
    ghostA: lookStorageBoxesUrl,
    ghostB: lookFormalFlatlayUrl,
  },
  {
    id: "home",
    titleKey: "home.look.home.title",
    metaKey: "home.look.home.meta",
    promptKey: "home.look.home.prompt",
    result: premiumHomeAfterUrl,
    video: premiumHomeVideoUrl,
    sourceA: lookHomeVaseUrl,
    sourceB: exampleBottleProductUrl,
    ghostA: exampleBottleCatalogUrl,
    ghostB: exampleBottleLifestyleUrl,
  },
];

const VIDEO_SHOWCASE_ITEMS = [
  {
    image: premiumFashionLoftAfterUrl,
    video: premiumFashionLoftVideoUrl,
    labelKey: "home.videoShow.item.fashion",
  },
  {
    image: premiumFormalOutfitAfterUrl,
    video: premiumFormalOutfitVideoUrl,
    labelKey: "home.videoShow.item.formalOutfit",
  },
  {
    image: premiumMensAccessoriesAfterUrl,
    video: premiumMensAccessoriesVideoUrl,
    labelKey: "home.videoShow.item.mensAccessories",
  },
  {
    image: premiumJewelryCloseAfterUrl,
    video: premiumJewelryCloseVideoUrl,
    labelKey: "home.videoShow.item.jewelryClose",
  },
  {
    image: premiumBagsAfterUrl,
    video: premiumBagsVideoUrl,
    labelKey: "home.videoShow.item.bags",
  },
  {
    image: premiumHomeAfterUrl,
    video: premiumHomeVideoUrl,
    labelKey: "home.videoShow.item.home",
  },
  {
    image: premiumFoodAfterUrl,
    video: premiumFoodVideoUrl,
    labelKey: "home.videoShow.item.food",
  },
  {
    image: premiumJewelryAfterUrl,
    video: premiumJewelryVideoUrl,
    labelKey: "home.videoShow.item.jewelry",
  },
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
    label: "Баннер для сайта",
    mode: "product",
    hint: "Website banner composition, product on one side, clean negative space for headline and call to action, premium campaign lighting.",
    subjectInstruction: "Make it work as a website banner visual.",
  },
];

const MARKETPLACE_ACTION_TYPES = [
  { id: "improve_card", labelKey: "market.actionType.improve_card" },
  { id: "seo_refresh", labelKey: "market.actionType.seo_refresh" },
  { id: "avito_listing", labelKey: "market.actionType.avito_listing" },
  { id: "buyer_reply", labelKey: "market.actionType.buyer_reply" },
  { id: "promo_plan", labelKey: "market.actionType.promo_plan" },
  { id: "image_brief", labelKey: "market.actionType.image_brief" },
];

const MARKETPLACE_SAMPLE_PRODUCT = {
  title: "Leather tote bag",
  sku: "BAG-001",
  category: "Bags",
  price: "4990 RUB",
  stock: 12,
  description: "Soft leather tote with zip pocket and long handles.",
  images: [],
};

const STYLE_TEMPLATES = [
  { id: "clean", label: "Чистый каталог", hint: "clean catalog style, accurate color, soft shadow, minimal background" },
  { id: "jewelry", label: "Ювелирный", hint: "premium jewelry macro, precise reflections, elegant highlights, luxury retail finish" },
  { id: "cosmetics", label: "Косметика", hint: "cosmetics macro photography, glossy surfaces, soft gradients, fresh beauty lighting" },
  { id: "fashion", label: "С моделью", hint: "fashion editorial look, model context when appropriate, refined styling, natural pose" },
  { id: "minimal", label: "Минимал бежевый", hint: "minimal warm neutral background, beige and ivory tones, calm premium composition" },
  { id: "luxury", label: "Тёмная роскошь", hint: "dark luxury studio setup, dramatic rim light, rich shadows, premium materials" },
  { id: "social", label: "Для соцсетей", hint: "bold social media creative, dynamic crop, bright engaging visual, modern campaign feel" },
];

const VARIATIONS = [
  { id: "cleaner", label: "Чище", hint: "make the result cleaner, simpler, with fewer props and a clearer product silhouette" },
  { id: "premium", label: "Премиальнее", hint: "make the result feel more premium with refined lighting, elegant materials, and luxury finish" },
  { id: "brighter", label: "Ярче", hint: "make the image brighter, fresh, optimistic, and more commercially inviting" },
  { id: "background", label: "Другой фон", hint: "change the background while keeping the product accurate and realistic" },
  { id: "closer", label: "Ближе к товару", hint: "use a closer crop with the product larger in frame and the key details more visible" },
  { id: "realistic", label: "Реалистичнее", hint: "make the output more photorealistic with natural materials, accurate scale, and believable light" },
];

const EXPORT_SIZES = {
  original: { label: "Оригинал", width: null, height: null, layout: "original" },
  square: { label: "Квадрат 1080", width: 1080, height: 1080, layout: "fit", fill: "#ffffff" },
  square2k: { label: "Квадрат 2000", width: 2000, height: 2000, layout: "fit", fill: "#ffffff" },
  feed: { label: "Пост 4:5", width: 1080, height: 1350, layout: "blur", fill: "rgba(255,255,255,.24)" },
  portrait: { label: "Портрет 3:4", width: 1200, height: 1600, layout: "blur", fill: "rgba(255,255,255,.24)" },
  story: { label: "Story 9:16", width: 1080, height: 1920, layout: "blur", fill: "rgba(255,255,255,.20)" },
  storyCrop: { label: "Story 9:16 кроп", width: 1080, height: 1920, layout: "cover" },
  widescreen: { label: "Баннер 16:9", width: 1920, height: 1080, layout: "blur", fill: "rgba(255,255,255,.24)" },
  bannerCrop: { label: "Баннер 16:9 кроп", width: 1920, height: 1080, layout: "cover" },
  landscape: { label: "Горизонталь 4:3", width: 1600, height: 1200, layout: "fit", fill: "#ffffff" },
};

const RESIZER_FORMATS = [
  { id: "wb",     label: "WB",          w: 1080, h: 1080 },
  { id: "ozon",   label: "Ozon",        w: 2000, h: 2000 },
  { id: "avito",  label: "Avito",       w: 1600, h: 1200 },
  { id: "yandex", label: "Yandex",      w: 1080, h: 1080 },
  { id: "vk",     label: "VK",          w: 1080, h: 1350 },
  { id: "story",  label: "Story",       w: 1080, h: 1920 },
];

const REMOVEBG_BG_PRESETS = [
  { id: "white",  color: "#FFFFFF", labelKey: "tools.bg.white" },
  { id: "beige",  color: "#F5ECD7", labelKey: "tools.bg.beige" },
  { id: "gray",   color: "#F2F2F2", labelKey: "tools.bg.gray" },
  { id: "sky",    color: "#DFF0FC", labelKey: "tools.bg.sky" },
  { id: "dark",   color: "#1A1A2E", labelKey: "tools.bg.dark" },
];

const PACK_FORMATS = [
  { id: "wb", label: "Wildberries", size: "square", format: "jpeg" },
  { id: "ozon", label: "Ozon", size: "square2k", format: "jpeg" },
  { id: "yandex", label: "Yandex Market", size: "square", format: "jpeg" },
  { id: "avito", label: "Avito", size: "landscape", format: "jpeg" },
  { id: "vk", label: "VK пост", size: "feed", format: "jpeg" },
  { id: "telegram", label: "Telegram пост", size: "square", format: "jpeg" },
  { id: "story", label: "Story", size: "story", format: "jpeg" },
  { id: "story_crop", label: "Story кроп", size: "storyCrop", format: "jpeg" },
  { id: "post", labelKey: "pack.post", size: "feed", format: "jpeg" },
  { id: "banner", labelKey: "pack.banner", size: "widescreen", format: "jpeg" },
  { id: "banner_crop", label: "Баннер кроп", size: "bannerCrop", format: "jpeg" },
  { id: "webp_square", label: "WebP квадрат", size: "square", format: "webp" },
];

const HISTORY_DB = "domstudio_history";
const HISTORY_STORE = "results";
const HISTORY_LIMIT = 20;
const BRAND_PREFS_KEY = "domstudio_brand_preferences";
const APP_MODE_KEY = "domstudio_app_mode";
const PWA_INSTALL_DISMISSED_KEY = "domstudio_pwa_install_dismissed";
const AUTH_STORAGE_VERSION_KEY = "domstudio_auth_storage_version";
const AUTH_STORAGE_VERSION = "2026-06-23-auth-v2";

const PAGE_TITLES = {
  home:    "DomStudio — AI-студия для продавцов маркетплейсов",
  examples: "Examples — DomStudio",
  studio:  "Студия — DomStudio",
  pricing: "Тарифы — DomStudio",
  account: "Аккаунт — DomStudio",
  history: "История генераций — DomStudio",
  adpilot: "AdPilot — DomStudio",
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
  { name: "free", price_rub: 0, photos: 5, videos: 5, premium_videos: 0, tokens: 500 },
  { name: "basic", price_rub: 270, photos: 30, videos: 30, premium_videos: 10, tokens: 3000 },
  { name: "pro", price_rub: 790, photos: 100, videos: 50, premium_videos: 33, tokens: 10000 },
  { name: "business", price_rub: 1490, photos: 300, videos: 100, premium_videos: 99, tokens: 30000 },
];

const TOKEN_PACKS = [
  { pack_id: "pack_500",  tokens: 500,  price_rub: 99,  label: "500 токенов" },
  { pack_id: "pack_1500", tokens: 1500, price_rub: 249, label: "1 500 токенов" },
  { pack_id: "pack_5000", tokens: 5000, price_rub: 699, label: "5 000 токенов" },
];

const CONTACT_REASONS = [
  { id: "help", labelKey: "footer.help", subKey: "footer.helpSub" },
  { id: "contact", labelKey: "footer.contact", subKey: "footer.contactSub" },
  { id: "careers", labelKey: "footer.careers", subKey: "footer.careersSub" },
  { id: "partners", labelKey: "footer.partners", subKey: "footer.partnersSub" },
];

const CONTENT_TOOLS_FALLBACK = [
  { slug: "beauty-service-ad", name: "Beauty Service Ad", category: "Beauty", cost_units: 1, fields: ["product", "price", "city", "duration", "advantages", "offer"] },
  { slug: "master-bio", name: "Master Bio", category: "Beauty", cost_units: 1, fields: ["masterName", "product", "city", "advantages", "offer"] },
  { slug: "beauty-promo-post", name: "Beauty Promo Post", category: "Beauty", cost_units: 1, fields: ["product", "offer", "city", "masterName", "advantages"] },
  { slug: "food-delivery-ad", name: "Food Delivery Ad", category: "Food", cost_units: 1, fields: ["product", "price", "city", "advantages", "offer"] },
  { slug: "yandex-maps-card", name: "Yandex Maps Card", category: "Food", cost_units: 1, fields: ["businessName", "product", "city", "advantages", "offer"] },
  { slug: "food-promo-post", name: "Food Promo Post", category: "Food", cost_units: 1, fields: ["product", "offer", "city", "businessName", "advantages"] },
  { slug: "auto-service-ad", name: "Auto Service Ad", category: "Auto", cost_units: 1, fields: ["product", "price", "city", "advantages", "offer"] },
  { slug: "auto-buyer-reply", name: "Auto Buyer Reply", category: "Auto", cost_units: 1, fields: ["customerQuestion", "product", "price", "city", "advantages"] },
  { slug: "auto-promo-post", name: "Auto Promo Post", category: "Auto", cost_units: 1, fields: ["product", "offer", "city", "advantages", "businessName"] },
  { slug: "avito-ad", name: "Avito Ad", category: "Avito", cost_units: 1, fields: ["product", "city", "price", "advantages", "targetCustomer", "tone"] },
  { slug: "avito-reply", name: "Avito Reply", category: "Avito", cost_units: 1, fields: ["customerQuestion", "product", "price", "city", "tone"] },
  { slug: "vk-post", name: "VK Post", category: "Social", cost_units: 1, fields: ["product", "offer", "targetCustomer", "tone", "city"] },
  { slug: "yandex-ads", name: "Yandex Ads", category: "Ads", cost_units: 2, fields: ["product", "city", "offer", "advantages", "targetCustomer"] },
  { slug: "review-reply", name: "Review Reply", category: "Retention", cost_units: 1, fields: ["reviewText", "tone", "businessName"] },
  { slug: "product-description", name: "Product Description", category: "Marketplace", cost_units: 1, fields: ["product", "advantages", "targetCustomer", "price", "tone"] },
  { slug: "ozon-wb-card", name: "Ozon/WB Card", category: "Marketplace", cost_units: 2, fields: ["product", "advantages", "targetCustomer", "price"] },
  { slug: "landing-page", name: "Landing Page", category: "Pages", cost_units: 3, fields: ["product", "city", "offer", "advantages", "targetCustomer", "tone"] },
  { slug: "sms-promo", name: "SMS Promo", category: "Retention", cost_units: 1, fields: ["product", "offer", "city", "tone"] },
  { slug: "price-objection", name: "Price Objection", category: "Retention", cost_units: 1, fields: ["customerQuestion", "product", "advantages", "price", "tone"] },
];

const CONTENT_FIELD_LABELS = {
  product: "Product or service",
  city: "City",
  price: "Price",
  advantages: "Advantages",
  targetCustomer: "Target customer",
  tone: "Tone",
  offer: "Offer",
  customerQuestion: "Customer question",
  reviewText: "Review text",
  businessName: "Business name",
  masterName: "Master / specialist name",
  duration: "Duration",
};

const WIZARD_QUESTIONS = {
  product:          { ru: "Что продаёте или предлагаете?",       en: "What are you selling or offering?" },
  advantages:       { ru: "Главные преимущества — что выделяет вас?", en: "Main advantages — what makes you stand out?" },
  city:             { ru: "В каком городе?",                     en: "What city?" },
  price:            { ru: "Цена или диапазон?",                  en: "Price or price range?" },
  offer:            { ru: "Ваше предложение прямо сейчас?",      en: "Your current offer?" },
  targetCustomer:   { ru: "Кто ваш покупатель?",                 en: "Who is your target customer?" },
  tone:             { ru: "Тон общения?",                        en: "Tone of voice?" },
  customerQuestion: { ru: "Что спросил покупатель?",             en: "What did the customer ask?" },
  reviewText:       { ru: "Вставьте текст отзыва:",              en: "Paste the customer review:" },
  businessName:     { ru: "Название вашего бизнеса?",            en: "Business name?" },
  masterName:       { ru: "Имя мастера?",                        en: "Master's name?" },
  duration:         { ru: "Сколько занимает услуга?",            en: "How long does the service take?" },
};
const WIZARD_PLACEHOLDERS = {
  product:          { ru: "Замена тормозных колодок, доставка цветов, вечерние платья...", en: "Brake pad replacement, flower delivery, evening dresses..." },
  advantages:       { ru: "Ремонт за 2 часа, гарантия, без скрытых доплат...",            en: "2-hour turnaround, warranty, no hidden fees..." },
  city:             { ru: "Москва",                              en: "Moscow" },
  price:            { ru: "От 4 500 ₽",                         en: "From 4,500 RUB" },
  offer:            { ru: "Бесплатная диагностика при записи сегодня", en: "Free diagnostics when booking today" },
  targetCustomer:   { ru: "Занятые автовладельцы",               en: "Busy car owners" },
  tone:             { ru: "Дружелюбно и по делу",                en: "Friendly and direct" },
  customerQuestion: { ru: "Есть запись на сегодня, можно дешевле?", en: "Is there a slot today, can you do cheaper?" },
  reviewText:       { ru: "Результат хороший, но ждать пришлось дольше...", en: "Good result, but waited longer than expected..." },
  businessName:     { ru: "Пилот Авто",                         en: "Pilot Auto" },
  masterName:       { ru: "Анна",                                en: "Anna" },
  duration:         { ru: "1,5 часа",                           en: "1.5 hours" },
};
const WIZARD_SINGLE_STEP = new Set(["reviewText", "customerQuestion"]);
function getWizardFields(tool) {
  if (WIZARD_SINGLE_STEP.has(tool.fields[0])) return [tool.fields[0]];
  const candidates = tool.fields.filter((f) => !["tone", "businessName", "targetCustomer"].includes(f));
  return candidates.slice(0, 2);
}

const CONTENT_DEFAULTS = {
  en: {
    draft: {
      product: "Brake pad replacement",
      city: "Moscow",
      price: "From 4,500 RUB",
      advantages: "Same-day service, warranty, clear quote before work",
      targetCustomer: "busy car owners",
      tone: "friendly and direct",
      offer: "Free diagnostics with booking today",
      customerQuestion: "Is it available today and can you do cheaper?",
      reviewText: "Good result, but I waited longer than expected.",
      businessName: "Pilot Auto",
      masterName: "Anna",
      duration: "1.5 hours",
    },
    profile: {
      businessName: "Pilot Auto",
      city: "Moscow",
      niche: "Auto service and marketplace sellers",
      targetCustomer: "Car owners who compare offers online",
      tone: "Confident, friendly, practical",
      offer: "Free mini-audit today",
      phone: "+7",
    },
    connection: {
      display_name: "Main store",
    },
    product: { ...MARKETPLACE_SAMPLE_PRODUCT },
  },
  ru: {
    draft: {
      product: "Замена тормозных колодок",
      city: "Москва",
      price: "От 4 500 ₽",
      advantages: "Ремонт в день обращения, гарантия, честная смета до работ",
      targetCustomer: "занятые автовладельцы",
      tone: "дружелюбно и по делу",
      offer: "Бесплатная диагностика при записи сегодня",
      customerQuestion: "Есть запись на сегодня и можно дешевле?",
      reviewText: "Результат хороший, но ждать пришлось дольше, чем ожидал.",
      businessName: "Пилот Авто",
      masterName: "Анна",
      duration: "1,5 часа",
    },
    profile: {
      businessName: "Пилот Авто",
      city: "Москва",
      niche: "Автосервис и продавцы на маркетплейсах",
      targetCustomer: "Автовладельцы, которые сравнивают предложения онлайн",
      tone: "Уверенно, дружелюбно, практично",
      offer: "Бесплатный мини-аудит сегодня",
      phone: "+7",
    },
    connection: {
      display_name: "Основной магазин",
    },
    product: {
      title: "Кожаная сумка-шоппер",
      sku: "BAG-001",
      category: "Сумки",
      price: "4 990 ₽",
      stock: 12,
      description: "Мягкая кожаная сумка с карманом на молнии и длинными ручками.",
      images: [],
    },
  },
};

function languageKey(lang) {
  return lang === "en" ? "en" : "ru";
}

function defaultsForLang(lang) {
  return CONTENT_DEFAULTS[languageKey(lang)];
}

function replaceKnownDefaults(current, previousDefaults, nextDefaults) {
  const keys = new Set([...Object.keys(current || {}), ...Object.keys(nextDefaults || {})]);
  return Object.fromEntries(
    [...keys].map((key) => {
      const value = current?.[key];
      return [key, value === previousDefaults?.[key] ? nextDefaults?.[key] : value ?? nextDefaults?.[key] ?? ""];
    })
  );
}

const VIDEO_DURATIONS = Array.from({ length: 10 }, (_, index) => index + 3);
const VIDEO_PROVIDERS = [
  { id: "local", labelKey: "video.providerLocal", metaKey: "video.providerLocalMeta", descKey: "video.providerLocalDesc" },
  { id: "premium", labelKey: "video.providerPremium", metaKey: "video.providerPremiumMeta", descKey: "video.providerPremiumDesc" },
];

const DEFAULT_BRAND_PREFS = {
  brand_colors: "",
  preferred_background: "",
  brand_mood: "",
  do_not_use: "",
  default_marketplace: "wildberries",
  default_style_template: "clean",
  brand_logo: "",
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

function clearStoredTokens() {
  localStorage.removeItem("domstudio_access");
  localStorage.removeItem("domstudio_refresh");
  localStorage.removeItem(AUTH_STORAGE_VERSION_KEY);
}

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function tokenExpiresSoon(token, leewaySeconds = 30) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() / 1000 >= payload.exp - leewaySeconds;
}

function readStoredTokens() {
  if (localStorage.getItem(AUTH_STORAGE_VERSION_KEY) !== AUTH_STORAGE_VERSION) {
    clearStoredTokens();
    return { accessToken: null, refreshToken: null };
  }
  const access = localStorage.getItem("domstudio_access");
  const refresh = localStorage.getItem("domstudio_refresh");
  if (refresh && tokenExpiresSoon(refresh, 0)) {
    clearStoredTokens();
    return { accessToken: null, refreshToken: null };
  }
  if (access && tokenExpiresSoon(access, 0) && !refresh) {
    localStorage.removeItem("domstudio_access");
    return { accessToken: null, refreshToken: null };
  }
  return { accessToken: access, refreshToken: refresh };
}

function loadAppMode() {
  return localStorage.getItem(APP_MODE_KEY) === "advanced" ? "advanced" : "fast";
}

const initialBrandPrefs = loadBrandPrefs();
const initialTokens = readStoredTokens();
const initialLang = getLang();
const initialContentDefaults = defaultsForLang(initialLang);
const initialRemoveBgResult = sessionStorage.getItem("domstudio_removebg_result") || null;
const initialAppMode = loadAppMode();

const state = {
  route: routeFromHash(),
  lang: initialLang,
  appMode: initialAppMode,
  accessToken: initialTokens.accessToken,
  refreshToken: initialTokens.refreshToken,
  authInitializing: Boolean(initialTokens.accessToken || initialTokens.refreshToken),
  user: null,
  plans: [...FALLBACK_PLANS],
  authMode: null,
  authChannel: "email",
  authLoading: false,
  passwordVisible: false,
  navMenuOpen: false,
  presetsOpen: false,
  selectedLookScenario: "suit",
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
  resizerFile: null,
  resizerPreview: null,
  resizerFormat: "wb",
  resizerResult: null,
  watermarkFile: null,
  watermarkPreview: null,
  watermarkText: "",
  watermarkPos: "bottom-right",
  watermarkOpacity: 0.55,
  watermarkDark: false,
  watermarkResult: null,
  checkerFile: null,
  checkerPreview: null,
  checkerResult: null,
  collageFiles: [],
  collagePreviews: [],
  collageLayout: "2x1",
  collageResult: null,
  promoFile: null,
  promoPreview: null,
  promoText: "-30%",
  promoColor: "#E63946",
  promoPos: "top-right",
  promoResult: null,
  compressorFile: null,
  compressorPreview: null,
  compressorQuality: 80,
  compressorOrigSize: 0,
  compressorResult: null,
  compressorResultSize: 0,
  compressorEditing: false,
  removeBgFile: null,
  removeBgPreview: null,
  removeBgResult: initialRemoveBgResult,
  removeBgBgColor: null,
  removeBgShadow: false,
  removeBgComposed: null,
  removeBgLoading: false,
  removeBgProgress: "",
  removeBgError: "",
  overlayMode: null,
  overlayInputValue: "",
  overlayBenefits: ["", "", ""],
  overlayImage: null,
  overlayApplying: false,
  history: [],
  contentTools: [...CONTENT_TOOLS_FALLBACK],
  contentFieldLabels: { ...CONTENT_FIELD_LABELS },
  contentTokenUnit: 10,
  contentToolSlug: null,
  adpilotView: "tools",
  adpilotContextImage: null,
  contentDraft: Object.fromEntries(Object.keys(initialContentDefaults.draft).map((k) => [k, ""])),
  contentProfile: { ...Object.fromEntries(Object.keys(initialContentDefaults.profile).map((k) => [k, ""])), phone: "+7" },
  contentOutputLanguage: "russian",
  contentOutputLanguageLocked: false,
  contentFormMode: "wizard",
  contentWizardStep: 0,
  contentOutput: "",
  contentVariations: [],
  contentMeta: null,
  contentGenerating: false,
  contentNotice: "",
  contentSavingDraft: false,
  contentAdjustInstruction: "",
  contentSavedOutputs: JSON.parse(localStorage.getItem("domstudio_saved_outputs") || "[]"),
  adChatProduct: "",
  adChatMessages: [],
  adChatDraft: "",
  adChatSending: false,
  adChatError: "",
  adChatRemaining: null,
  contactDraft: { email: "", reason: contactReasonFromHash() || "contact", message: "" },
  contactSending: false,
  contactSent: false,
  contactError: "",
  referral: null,
  pendingReferralCode: null,
  marketplaceProviders: [],
  marketplaceConnections: [],
  marketplaceProducts: [],
  marketplaceActions: [],
  marketplaceRules: [],
  marketplaceLoaded: false,
  marketplaceLoading: false,
  marketplaceSaving: false,
  marketplaceNotice: "",
  marketplaceTab: "drafts",
  marketplaceSelectedProvider: "wildberries",
  marketplaceSelectedConnectionId: "",
  marketplaceSelectedProductId: "",
  marketplaceActionType: "improve_card",
  marketplaceConnectDraft: {
    provider: "wildberries",
    display_name: initialContentDefaults.connection.display_name,
    mode: "draft",
    api_token: "",
    client_id: "",
    user_id: "",
  },
  marketplaceProductDraft: { ...initialContentDefaults.product },
  brandPrefs: initialBrandPrefs,
  generating: false,
  brandPrefsOpen: false,
  promptHelperOpen: false,
  historyFilter: "all",
  batchQueue: [],
  batchTotal: 0,
  batchIndex: 0,
  online: navigator.onLine,
  installPrompt: null,
  installAvailable: false,
  installDismissed: localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === "true",
  formDraft: {
    mode: "catalog",
    marketplace: initialBrandPrefs.default_marketplace,
    style_template: initialBrandPrefs.default_style_template,
    brand_colors: initialBrandPrefs.brand_colors,
    offer_text: "",
    video_provider: "local",
  },
};

const app = document.querySelector("#app");
let lastMotionKey = "";
let videoPollTimer = null;

function routeFromHash() {
  return (location.hash.slice(1).split("?")[0] || "home").trim() || "home";
}

function contactReasonFromHash() {
  const raw = location.hash.slice(1);
  const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : "";
  const reason = new URLSearchParams(query).get("reason");
  return CONTACT_REASONS.some((item) => item.id === reason) ? reason : null;
}

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
  if (!navigator.onLine) throw new Error(t("pwa.offlineAction"));
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (state.accessToken) headers.Authorization = `Bearer ${state.accessToken}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && state.refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed) return api(path, options, false);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(apiErrorMessage(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function apiErrorMessage(data) {
  const detail = data?.detail || data?.error;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.message || String(item)).join("; ");
  }
  if (detail && typeof detail === "object") return detail.msg || detail.message || JSON.stringify(detail);
  return detail || t("toast.requestFailed");
}

async function apiBinary(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.accessToken) headers.Authorization = `Bearer ${state.accessToken}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(apiErrorMessage(data));
  }
  return response.blob();
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
  localStorage.setItem(AUTH_STORAGE_VERSION_KEY, AUTH_STORAGE_VERSION);
}

function logout(showToast = true) {
  state.accessToken = null;
  state.refreshToken = null;
  state.user = null;
  clearStoredTokens();
  if (showToast) toast(t("toast.logout"));
  render();
}

async function loadUser() {
  if (state.refreshToken && (!state.accessToken || tokenExpiresSoon(state.accessToken))) {
    const refreshed = await refreshSession();
    if (!refreshed) return;
  }
  if (!state.accessToken) return;
  try {
    state.user = await api("/users/me/full");
  } catch {
    state.user = null;
    state.accessToken = null;
    localStorage.removeItem("domstudio_access");
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

async function loadReferral() {
  try {
    const data = await api("/users/referral");
    state.referral = data;
    render();
  } catch (_) {
    // non-fatal — referral widget stays hidden
  }
}

async function loadContentTools() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${API_URL}/content/tools`, { signal: controller.signal });
    if (!response.ok) throw new Error("Content tools unavailable");
    const data = await response.json();
    state.contentTools = Array.isArray(data.tools) && data.tools.length ? data.tools : [...CONTENT_TOOLS_FALLBACK];
    state.contentFieldLabels = data.field_labels || { ...CONTENT_FIELD_LABELS };
    state.contentTokenUnit = Number(data.token_unit || 10);
  } catch {
    state.contentTools = [...CONTENT_TOOLS_FALLBACK];
    state.contentFieldLabels = { ...CONTENT_FIELD_LABELS };
    state.contentTokenUnit = 10;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function loadMarketplaces(force = false) {
  if (!state.user || (!force && state.marketplaceLoaded)) return;
  state.marketplaceLoading = true;
  try {
    const [providersData, connectionsData, productsData, actionsData, rulesData] = await Promise.all([
      api("/marketplaces/providers"),
      api("/marketplaces/connections"),
      api("/marketplaces/products"),
      api("/marketplaces/actions"),
      api("/marketplaces/rules"),
    ]);
    state.marketplaceProviders = providersData.providers || [];
    state.marketplaceConnections = connectionsData.connections || [];
    state.marketplaceProducts = productsData.products || [];
    state.marketplaceActions = actionsData.actions || [];
    state.marketplaceRules = rulesData.rules || [];
    state.marketplaceLoaded = true;
    syncMarketplaceSelection();
  } catch (error) {
    state.marketplaceNotice = error.message;
  } finally {
    state.marketplaceLoading = false;
  }
}

function syncMarketplaceSelection() {
  const provider = state.marketplaceSelectedProvider || state.marketplaceConnectDraft.provider || "wildberries";
  const providerConnections = state.marketplaceConnections.filter((item) => item.provider === provider);
  const providerProducts = state.marketplaceProducts.filter((item) => item.provider === provider);
  if (!providerConnections.some((item) => item.id === state.marketplaceSelectedConnectionId)) {
    state.marketplaceSelectedConnectionId = providerConnections[0]?.id || "";
  }
  if (!providerProducts.some((item) => item.id === state.marketplaceSelectedProductId)) {
    state.marketplaceSelectedProductId = providerProducts[0]?.id || "";
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

function renderMarkdown(raw) {
  let s = escapeHtml(raw);
  s = s.replace(/^### (.+)$/gm, '<b class="md-h3">$1</b>');
  s = s.replace(/^## (.+)$/gm, '<b class="md-h2">$1</b>');
  s = s.replace(/^# (.+)$/gm, '<b class="md-h1">$1</b>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  s = s.replace(/^--+$/gm, '<hr class="md-hr">');
  s = s.replace(/\n/g, '<br>');
  return s;
}

function adPilotChatPage() {
  const product = state.adChatProduct || state.contentDraft.product || "";
  const suggestions = [
    t("adpilot.chat.suggestionImprove"),
    t("adpilot.chat.suggestionIdeas"),
    t("adpilot.chat.suggestionReply"),
  ];
  const messages = state.adChatMessages.length
    ? state.adChatMessages
    : [{ role: "assistant", content: t("adpilot.chat.empty") }];

  return `<main class="page adpilot-page">
    <section class="workspace copy-workspace adpilot-chat-page">
      <header class="workspace-head adpilot-chat-head">
        <div>
          <button class="copy-back-btn adpilot-chat-back" type="button" data-adpilot-home>${t("adpilot.backToHome")}</button>
          <div class="eyebrow">${t("copy.eyebrow")}</div>
          <h1>${t("adpilot.chat.h1")}</h1>
          <p>${t("adpilot.chat.p")}</p>
        </div>
      </header>
      <div class="adpilot-chat-shell">
        <aside class="panel adpilot-chat-side">
          <label class="adpilot-quick-label" for="ad-chat-product">${t("adpilot.chat.product")}</label>
          <input id="ad-chat-product" class="input" type="text" value="${escapeHtml(product)}" placeholder="${t("adpilot.quickProductPlaceholder")}" data-ad-chat-product />
          <div class="adpilot-chat-prompts">
            ${suggestions.map((item) => `<button class="chip" type="button" data-ad-chat-suggestion="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
          </div>
          ${state.adChatRemaining !== null ? `<p class="adpilot-chat-limit">${t("adpilot.chat.remaining", { n: state.adChatRemaining })}</p>` : ""}
        </aside>
        <section class="panel adpilot-chat-panel">
          <div class="adpilot-chat-log" aria-live="polite">
            ${messages.map((message) => `
              <article class="adpilot-chat-msg ${message.role === "user" ? "user" : "assistant"}">
                <span>${message.role === "user" ? t("adpilot.chat.you") : t("adpilot.chat.ai")}</span>
                <div>${renderMarkdown(message.content)}</div>
              </article>
            `).join("")}
            ${state.adChatSending ? `<article class="adpilot-chat-msg assistant pending"><span>${t("adpilot.chat.ai")}</span><div>${t("adpilot.chat.thinking")}</div></article>` : ""}
          </div>
          ${state.adChatError ? `<div class="notice error">${escapeHtml(state.adChatError)}</div>` : ""}
          <form class="adpilot-chat-form" id="ad-chat-form">
            <textarea class="textarea" id="ad-chat-input" rows="3" placeholder="${t("adpilot.chat.placeholder")}" ${state.adChatSending ? "disabled" : ""}>${escapeHtml(state.adChatDraft)}</textarea>
            <button class="button gold" type="submit" ${state.adChatSending ? "disabled" : ""}>${state.adChatSending ? t("adpilot.chat.sending") : t("adpilot.chat.send")}</button>
          </form>
        </section>
      </div>
    </section>
  </main>`;
}

function draftValue(name) {
  return escapeHtml(state.formDraft[name] || "");
}

function contentDraftValue(name) {
  return escapeHtml(state.contentDraft[name] || "");
}

function contentProfileValue(name) {
  return escapeHtml(state.contentProfile[name] || "");
}

function marketplaceConnectValue(name) {
  return escapeHtml(state.marketplaceConnectDraft[name] || "");
}

function marketplaceProductValue(name) {
  return escapeHtml(state.marketplaceProductDraft[name] || "");
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

function planVideos(plan) {
  return t("pricing.videoCount", { n: plan.videos ?? 0 });
}

function planPremiumVideos(plan) {
  const count = plan.premium_videos ?? 0;
  return count ? t("pricing.premiumVideoCount", { n: count }) : "";
}

function truncate(value, maxLength = 500) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function currentContentTool() {
  return state.contentTools.find((tool) => tool.slug === state.contentToolSlug) || state.contentTools[0] || CONTENT_TOOLS_FALLBACK[0];
}

function contentTokenCost(tool = currentContentTool()) {
  return Number(tool.cost_units || 1) * state.contentTokenUnit;
}

function contentFieldLabel(field) {
  const key = `copy.field.${field}`;
  const localized = t(key);
  if (localized !== key) return localized;
  return state.contentFieldLabels[field] || CONTENT_FIELD_LABELS[field] || field;
}

function contentToolName(tool) {
  const key = `copy.tool.${tool.slug}`;
  const localized = t(key);
  return localized === key ? tool.name : localized;
}

function contentToolCategory(category) {
  const key = `copy.category.${String(category || "").toLowerCase()}`;
  const localized = t(key);
  return localized === key ? category : localized;
}

function marketplaceActionTypeLabel(item) {
  return t(item.labelKey) || item.id;
}

function marketplaceActionTypeLabelById(id) {
  const item = MARKETPLACE_ACTION_TYPES.find((entry) => entry.id === id);
  return item ? marketplaceActionTypeLabel(item) : id;
}

function contentToolIntent(tool) {
  const key = `copy.intent.${tool.slug}`;
  const text = t(key);
  return text === key ? t("copy.intent.default") : text;
}

function contentOutputKind(tool) {
  if (tool.slug.includes("reply") || tool.slug === "price-objection") return "reply";
  if (tool.slug === "sms-promo") return "sms";
  if (tool.slug === "vk-post") return "post";
  if (tool.slug === "yandex-ads") return "ads";
  if (tool.slug === "landing-page") return "page";
  return "copy";
}

function contentOutputTitle(tool) {
  return t(`copy.outputTitle.${contentOutputKind(tool)}`);
}

function contentCopyLabel(tool) {
  return t(`copy.copy.${contentOutputKind(tool)}`);
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

function marketplaceHintForMode(marketplace, mode, hasImage, hasOfferText = false) {
  if (mode === "catalog") {
    return hasOfferText
      ? `${marketplace.label} marketplace image, centered product, crop-safe composition, use only the requested creative text if provided, do not invent extra text or logos`
      : marketplace.hint;
  }
  const preserve = hasImage
    ? "preserve the uploaded product label, packaging text, logo, shape, color, and cap exactly"
    : "do not add fake logos or unreadable packaging details";
  const textRule = hasOfferText
    ? "use only the requested creative text; do not invent extra text"
    : "do not add fake text, fake logos, or unreadable packaging details";
  return `${marketplace.label} seller-ready commercial image, crop-safe for marketplace listing, ${preserve}, ${textRule}`;
}

function composeGenerationPayload(values) {
  const marketplace = MARKETPLACE_PRESETS.find((preset) => preset.id === values.marketplace) || currentMarketplace();
  const styleTemplate = STYLE_TEMPLATES.find((template) => template.id === values.style_template) || currentStyleTemplate();
  const prefs = state.brandPrefs;
  const userStyle = values.style_hint || "";
  const brandColors = values.brand_colors || prefs.brand_colors;
  const mode = resolvedGenerationMode(values);
  const offerText = String(values.offer_text || "").trim();
  const marketplaceHint = marketplaceHintForMode(marketplace, mode, Boolean(state.selectedImage), Boolean(offerText));
  const styleParts = [
    userStyle,
    offerText ? `creative text/offer to place on the image: ${offerText}` : "",
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
  const provider = VIDEO_PROVIDERS.some((item) => item.id === values.video_provider) ? values.video_provider : "local";
  return {
    mode: payload.mode === "catalog" ? "product" : payload.mode,
    subject: payload.subject,
    style_hint: payload.style_hint,
    image: state.selectedImage,
    duration_s: Number.isFinite(duration) ? Math.min(Math.max(duration, 3), 12) : 3,
    video_provider: provider,
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

function quickEditsPanel() {
  if (!state.generatedImage || state.generatedVideo || state.generating) return "";
  const hasOverlay = Boolean(state.overlayImage);
  return `<div class="quick-edits">
    <div class="mini-head"><h3>${t("quickEdit.h3")}</h3><span>${t("quickEdit.sub")}</span></div>
    ${state.overlayMode ? `
      <div class="overlay-form">
        ${state.overlayMode === "benefits"
          ? state.overlayBenefits.map((v, i) => `<input class="input" style="margin-bottom:6px" type="text" data-benefit-index="${i}"
              placeholder="${t("quickEdit.benefitPlaceholder")} ${i + 1}"
              value="${escapeHtml(v)}" />`).join("")
          : state.overlayMode === "logo"
          ? `<p class="overlay-logo-hint">${t("quickEdit.logoHint")}</p>`
          : `<input class="input" id="overlay-input" type="text"
              placeholder="${state.overlayMode === "price" ? t("quickEdit.pricePlaceholder") : t("quickEdit.salePlaceholder")}"
              value="${escapeHtml(state.overlayInputValue)}" />`}
        <div class="overlay-form-row">
          <button class="button block" type="button" data-overlay-apply ${state.overlayApplying ? "disabled" : ""}>
            ${state.overlayApplying ? t("quickEdit.applying") : t("quickEdit.apply")}
          </button>
          <button class="button secondary" type="button" data-overlay-cancel style="width:auto;padding:0 18px">${t("quickEdit.cancel")}</button>
        </div>
      </div>
    ` : `
      <div class="chip-row">
        <button class="chip" type="button" data-overlay-mode="price">${t("quickEdit.addPrice")}</button>
        <button class="chip" type="button" data-overlay-mode="sale">${t("quickEdit.addSale")}</button>
        <button class="chip" type="button" data-overlay-mode="benefits">${t("quickEdit.addBenefits")}</button>
        ${state.brandPrefs.brand_logo ? `<button class="chip" type="button" data-overlay-mode="logo">${t("quickEdit.addLogo")}</button>` : ""}
        <button class="chip" type="button" data-quick-export="${state.brandPrefs.default_marketplace || "wb"}">${t("quickEdit.exportFor", { mp: (state.brandPrefs.default_marketplace || "wb").toUpperCase() })}</button>
        ${hasOverlay ? `<button class="chip chip-clear" type="button" data-overlay-clear>${t("quickEdit.clearOverlay")}</button>` : ""}
      </div>
    `}
  </div>`;
}

function adpilotLinkPanel() {
  if (!state.generatedImage || state.generatedVideo || state.generating) return "";
  const subject = state.lastGenerationPayload?.subject || state.formDraft.subject || "";
  if (!subject) return "";
  return `<div class="adpilot-link-panel">
    <div class="mini-head"><h3>${t("adpilotLink.h3")}</h3><span>${t("adpilotLink.sub")}</span></div>
    <p class="adpilot-link-product">${escapeHtml(truncate(subject, 80))}</p>
    <button class="button secondary block" type="button" data-goto-adpilot>${t("adpilotLink.cta")}</button>
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

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosSafari() {
  const ua = window.navigator.userAgent || "";
  const platform = window.navigator.platform || "";
  const isIos = /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return isIos && isSafari;
}

function pwaInstallBanner() {
  const iosManualInstall = isIosSafari();
  if (state.installDismissed || isStandaloneApp()) return "";
  if (!state.installAvailable && !iosManualInstall) return "";
  const title = iosManualInstall ? t("pwa.iosInstallTitle") : t("pwa.installTitle");
  const sub = iosManualInstall ? t("pwa.iosInstallSub") : t("pwa.installSub");
  const cta = iosManualInstall ? t("pwa.iosInstallCta") : t("pwa.installCta");
  return `<aside class="pwa-install" aria-label="${t("pwa.installTitle")}">
    <div><b>${title}</b><span>${sub}</span></div>
    <button class="button gold compact-button" type="button" data-install-pwa>${cta}</button>
    <button class="pwa-dismiss" type="button" data-dismiss-pwa aria-label="${t("pwa.dismiss")}">×</button>
  </aside>`;
}

function offlineBanner() {
  if (state.online) return "";
  return `<aside class="offline-banner" role="status"><b>${t("pwa.offlineTitle")}</b><span>${t("pwa.offlineSub")}</span></aside>`;
}

function appModeSwitch(className = "app-mode-switch", includeHint = false) {
  const isAdvanced = state.appMode === "advanced";
  return `<div class="${className}">
    <div class="app-mode-buttons" role="group" aria-label="${t("appMode.label")}">
      <button type="button" class="${state.appMode === "fast" ? "active" : ""}" data-app-mode="fast">${t("appMode.fast")}</button>
      <button type="button" class="${isAdvanced ? "active" : ""}" data-app-mode="advanced">${t("appMode.advanced")}</button>
    </div>
    ${includeHint ? `<p>${isAdvanced ? t("appMode.advancedHint") : t("appMode.fastHint")}</p>` : ""}
  </div>`;
}

function nav() {
  const logged = Boolean(state.user);
  const lang = state.lang;
  const showPrimaryLangToggle = isRussianMarket();
  const langToggle = `<button class="lang-toggle" type="button" data-toggle-lang aria-label="Switch language" title="Switch language">${lang === "ru" ? "EN" : "RU"}</button>`;
  const navItems = [
    ["home", t("nav.home")],
    ["studio", t("nav.studio")],
    ["adpilot", t("nav.copy")],
    ["tools", t("nav.tools")],
    ["examples", t("nav.examples")],
    ["pricing", t("nav.pricing")],
    ...(logged ? [["history", t("nav.history")]] : []),
  ];
  const initials = logged ? String(state.user.email || state.user.phone || "DS").slice(0, 2).toUpperCase() : "";
  return `
    <nav class="nav ${logged ? "logged-in" : "logged-out"} ${state.navCompact ? "compact" : ""} ${state.navMenuOpen ? "menu-open" : ""}">
      <div class="nav-inner">
      <button class="brand" data-route="home"><span class="brand-mark">DS</span><span class="brand-word">Dom<span>Studio</span></span></button>
      <div class="nav-links ${state.navMenuOpen ? "open" : ""}">
        ${navItems.map(([route, label]) => `<button class="nav-link ${state.route === route ? "active" : ""}" data-route="${route}">${label}</button>`).join("")}
        ${appModeSwitch("app-mode-switch mobile-menu-mode-switch")}
        ${showPrimaryLangToggle ? `<button class="nav-link nav-lang-link" type="button" data-toggle-lang>${lang === "ru" ? "English" : "Русский"}</button>` : ""}
        ${showPrimaryLangToggle ? "" : `<button class="nav-link nav-lang-link" type="button" data-toggle-lang>${lang === "ru" ? "English" : "Русский"}</button>`}
      </div>
      <div class="nav-actions">
        ${appModeSwitch("app-mode-switch nav-mode-switch")}
        ${logged
          ? `<button class="token-pill" data-route="account" title="${state.user.tokens} ${t("nav.tokens", { n: "" }).trim()}"><span>${state.user.tokens}</span></button>
             <button class="profile-pill" data-route="account" title="${t("account.eyebrow")}"><span>${escapeHtml(initials)}</span></button>
             <button class="button gold nav-cta" data-route="studio">${t("nav.create")}</button>`
          : `<button class="button secondary" data-auth="login">${t("nav.login")}</button>
             <button class="button secondary nav-register" data-auth="register">${t("nav.register")}</button>
             <button class="button gold nav-cta" data-route="studio">${t("nav.create")}</button>`}
        ${showPrimaryLangToggle ? langToggle : ""}
        <button class="nav-menu-button ${state.navMenuOpen ? "open" : ""}" type="button" data-toggle-menu aria-label="Menu"><span></span><span></span></button>
      </div>
      </div>
    </nav>`;
}

function mobileTabBar() {
  const logged = Boolean(state.user);
  const items = logged
    ? [
        ["home", t("nav.home"), "H"],
        ["studio", t("nav.studio"), "S"],
        ["adpilot", t("nav.copy"), "A"],
        ["tools", t("nav.tools"), "✂"],
        ["examples", t("nav.examples"), "E"],
      ]
    : [
        ["home", t("nav.home"), "H"],
        ["studio", t("nav.studio"), "S"],
        ["adpilot", t("nav.copy"), "A"],
        ["tools", t("nav.tools"), "✂"],
        ["examples", t("nav.examples"), "E"],
      ];
  return `<nav class="mobile-tabbar" aria-label="Mobile navigation">
    ${items.map(([route, label, icon]) => `
      <button class="${state.route === route ? "active" : ""}" type="button" data-route="${route}">
        <span>${icon}</span>
        <b>${label}</b>
      </button>`).join("")}
  </nav>`;
}

function footer() {
  return `<footer class="footer">
    <div class="footer-brand">
      <b>DomStudio</b>
      <span>${t("footer.tagline")}</span>
      <span class="footer-product-line">${t("footer.productPrefix")} <span class="footer-dolphin-mark"><img src="${techDolphinLogoUrl}" alt="" /></span> Tech Dolphin</span>
    </div>
    <div class="footer-links">
      ${CONTACT_REASONS.map((item) => `
        <button class="footer-link" type="button" data-contact-reason="${item.id}">
          <strong>${t(item.labelKey)}</strong>
          <span>${t(item.subKey)}</span>
        </button>
      `).join("")}
    </div>
  </footer>`;
}

function homePage() {
  const activeLookIndex = Math.max(0, LOOK_SCENARIOS.findIndex((item) => item.id === state.selectedLookScenario));
  const activeLook = LOOK_SCENARIOS[activeLookIndex] || LOOK_SCENARIOS[0];
  const heroProof = {
    before: carBeforeUrl,
    after: carShowroomAfterUrl,
    video: carShowroomVideoUrl,
    beforeAlt: "Original silver supercar photo",
    afterAlt: "Silver supercar in a premium showroom",
    videoAlt: "DomStudio silver supercar showroom video",
  };
  const categoryProofs = [
    ["fashion", premiumFashionLoftAfterUrl],
    ["formal", premiumFormalOutfitAfterUrl],
    ["mens", premiumMensAccessoriesAfterUrl],
    ["jewelry", premiumJewelryAfterUrl],
    ["jewelryClose", premiumJewelryCloseAfterUrl],
    ["electronics", premiumElectronicsAfterUrl],
    ["food", premiumFoodAfterUrl],
    ["bags", premiumBagsAfterUrl],
    ["home", premiumHomeAfterUrl],
    ["marketplace", landingWineAfterUrl],
  ];
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
            <div class="hero-proof-frame media-pair-card media-story-card">
              <figure class="landing-media before-media">
                <span class="media-tag dark">${t("home.before")}</span>
                <img src="${heroProof.before}" alt="${heroProof.beforeAlt}" />
              </figure>
              <figure class="landing-media after-media">
                <span class="media-tag">${t("home.after")}</span>
                <img src="${heroProof.after}" alt="${heroProof.afterAlt}" />
              </figure>
              <figure class="landing-media video-media">
                <span class="media-tag">${t("home.video")}</span>
                <video src="${heroProof.video}" poster="${heroProof.after}" aria-label="${heroProof.videoAlt}" autoplay muted loop playsinline controls preload="auto"></video>
              </figure>
            </div>
            <div class="mini-studio-controls">
              <label><span>${t("home.miniPhoto")}</span><button type="button" data-route="studio">${t("home.miniUpload")}</button></label>
              <label><span>${t("home.miniPromptLabel")}</span><input value="${t("home.miniPromptValue")}" readonly /></label>
              <div class="preset-pills"><span>Wildberries</span><span>Ozon</span><span>Avito</span><span>1080×1080</span></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section quick-workflow-section workflow-section">
        <div class="section-head"><h2>${t("home.workflowH2")}</h2><p>${t("home.workflowP")}</p></div>
        <div class="seller-workflow-visual">
          <article class="seller-step-card">
            <div class="seller-step-copy"><b>01</b><div><h3>${t("home.step1h")}</h3><p>${t("home.step1p")}</p></div></div>
            <div class="seller-step-media upload-stack">
              <figure class="upload-stack-main"><img src="${heroProof.before}" alt="${t("home.step1h")}" loading="lazy" /></figure>
            </div>
          </article>
          <span class="workflow-arrow" aria-hidden="true">→</span>
          <article class="seller-step-card">
            <div class="seller-step-copy"><b>02</b><div><h3>${t("home.step2h")}</h3><p>${t("home.step2p")}</p></div></div>
            <div class="seller-step-media preset-board">
              <div class="workflow-device-shell">
                <div class="workflow-device-top"><span></span><span></span><span></span></div>
                <div class="workflow-device-preview">
                  <img src="${heroProof.before}" alt="${t("home.workflowUploadTag")}" loading="lazy" />
                  <b>${t("home.workflowUploadTag")}</b>
                </div>
              </div>
              <div class="workflow-preset-grid">
                <span>WB</span><span>Ozon</span><span>Avito</span><span>Stories</span>
              </div>
              <div class="workflow-format-row">
                <span>1:1</span><span>4:5</span><span>3:4</span><span>16:9</span>
              </div>
            </div>
          </article>
          <span class="workflow-arrow" aria-hidden="true">→</span>
          <article class="seller-step-card">
            <div class="seller-step-copy"><b>03</b><div><h3>${t("home.step3h")}</h3><p>${t("home.step3p")}</p></div></div>
            <div class="seller-step-media result-stack">
              <figure class="result-card-main">
                <img src="${heroProof.after}" alt="${t("home.step3h")}" loading="lazy" />
                <span>${t("home.after")}</span>
              </figure>
              <figure class="result-video-card">
                <video src="${heroProof.video}" poster="${heroProof.after}" aria-label="${t("home.video")}" autoplay muted loop playsinline preload="metadata"></video>
                <span>${t("home.video")}</span>
              </figure>
            </div>
          </article>
        </div>
        <div class="workflow-bottom-line">
          <p>${t("home.workflowFoot")}</p>
          <button class="button gold" type="button" data-route="studio">${t("home.cta")}</button>
        </div>
      </section>

      <section class="section showcase-section">
        <div class="showcase-head">
          <span>${t("home.showcaseLabel")}</span>
          <h2>${t("home.showcaseH2")}</h2>
          <p>${t("home.showcaseP")}</p>
        </div>
        <article class="showcase-block look-showcase">
          <div class="look-triplet-stage" data-look-scenario-next role="button" tabindex="0" aria-live="polite" aria-label="${t("home.lookSelectorLabel")}">
            <figure class="triplet-card triplet-before">
              <span><b>01</b>${t("home.lookFlowBefore")}</span>
              <img src="${activeLook.sourceA}" alt="${t("home.lookFlowBeforeAlt")}" loading="lazy" />
            </figure>
            <div class="triplet-prompt">
              <span>${t("home.lookFlowPrompt")}</span>
              <b>${t(activeLook.promptKey)}</b>
            </div>
            <figure class="triplet-card triplet-video">
              <span><b>02</b>${t("home.lookFlowVideo")}</span>
              <video src="${activeLook.video}" poster="${activeLook.result}" aria-label="${t(activeLook.titleKey)} ${t("home.lookFlowVideo")}" autoplay muted loop playsinline preload="metadata"></video>
            </figure>
            <figure class="triplet-card triplet-after">
              <span><b>03</b>${t("home.lookFlowAfter")}</span>
              <img src="${activeLook.result}" alt="${t(activeLook.titleKey)}" loading="lazy" />
            </figure>
          </div>
          <div class="showcase-copy">
            <span>${t("home.lookH3")}</span>
            <h3>${t(activeLook.titleKey)}</h3>
            <div class="look-scenario-chips" aria-label="${t("home.lookSelectorLabel")}">
              ${LOOK_SCENARIOS.map((item) => `
                <button class="look-scenario-chip ${item.id === activeLook.id ? "active" : ""}" type="button" data-look-scenario="${item.id}" aria-pressed="${item.id === activeLook.id}">${t(item.metaKey)}</button>
              `).join("")}
            </div>
            <button class="button gold" type="button" data-route="studio">${t("home.lookCta")}</button>
            <p>${t("home.lookP")}</p>
            <ul>
              <li>${t("home.lookBullet1")}</li>
              <li>${t("home.lookBullet2")}</li>
              <li>${t("home.lookBullet3")}</li>
            </ul>
          </div>
        </article>
        <article class="showcase-block video-showcase">
          <div class="showcase-video-stack video-sequence-stack" aria-label="${t("home.videoShowSequenceLabel")}">
            ${VIDEO_SHOWCASE_ITEMS.map((item, index) => `
              <figure class="video-sequence-card video-still-card" style="--step: ${index * 2};">
                <img src="${item.image}" alt="${t(item.labelKey)}" loading="lazy" />
                <span>${t("home.videoShowStill")}</span>
              </figure>
              <figure class="video-sequence-card video-motion-card" style="--step: ${index * 2 + 1};">
                <video src="${item.video}" poster="${item.image}" aria-label="${t(item.labelKey)}" autoplay muted loop playsinline preload="metadata"></video>
                <span>${t("home.video")}</span>
              </figure>
            `).join("")}
          </div>
          <div class="showcase-copy">
            <span>${t("home.videoShowLabel")}</span>
            <h3>${t("home.videoShowH3")}</h3>
            <p>${t("home.videoShowP")}</p>
            <ul>
              <li>${t("home.videoShowBullet1")}</li>
              <li>${t("home.videoShowBullet2")}</li>
              <li>${t("home.videoShowBullet3")}</li>
            </ul>
            <button class="button gold" type="button" data-route="studio">${t("home.videoShowCta")}</button>
          </div>
        </article>
      </section>

      <section class="section category-proof-section">
        <div class="section-head">
          <h2>${t("home.categoryH2")}</h2>
          <p>${t("home.categoryP")}</p>
        </div>
        <div class="category-proof-window">
          <div class="category-proof-grid">
            ${[...categoryProofs, ...categoryProofs].map(([key, src], index) => `
              <article class="category-proof-card" aria-hidden="${index >= categoryProofs.length}">
                <figure>
                  <img src="${src}" alt="${t(`home.category.${key}.title`)}" loading="lazy" />
                </figure>
                <div>
                  <span>${t(`home.category.${key}.tag`)}</span>
                  <h3>${t(`home.category.${key}.title`)}</h3>
                  <p>${t(`home.category.${key}.desc`)}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section proof-section">
        <div class="section-head">
          <h2>${t("home.proofH2")}</h2>
          <p>${t("home.proofP")}</p>
        </div>
        <div class="proof-grid">
          <article class="proof-visual media-pair-card media-story-card">
            <figure class="landing-media before-media">
              <span class="media-tag dark">${t("home.before")}</span>
              <img src="${landingWineBeforeUrl}" alt="Original porcelain tea-house photo" />
            </figure>
            <figure class="landing-media after-media">
              <span class="media-tag">${t("home.after")}</span>
              <img src="${landingWineAfterUrl}" alt="Generated porcelain product image" />
            </figure>
            <figure class="landing-media video-media">
              <span class="media-tag">${t("home.video")}</span>
              <video src="${landingWineVideoUrl}" poster="${landingWineAfterUrl}" aria-label="DomStudio porcelain product video" autoplay muted loop playsinline controls preload="auto"></video>
            </figure>
          </article>
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

      <section class="section seller-comparison-section">
        <div class="section-head">
          <h2>${t("home.compareH2")}</h2>
          <p>${t("home.compareP")}</p>
        </div>
        <div class="seller-comparison-grid">
          <article class="seller-comparison-card muted-card">
            <span>${t("home.compare.photoLabel")}</span>
            <h3>${t("home.compare.photoTitle")}</h3>
            <ul>
              <li>${t("home.compare.photoTime")}</li>
              <li>${t("home.compare.photoCost")}</li>
              <li>${t("home.compare.photoFlow")}</li>
            </ul>
          </article>
          <div class="comparison-vs">VS</div>
          <article class="seller-comparison-card domstudio-card">
            <span>${t("home.compare.domLabel")}</span>
            <h3>${t("home.compare.domTitle")}</h3>
            <ul>
              <li>${t("home.compare.domTime")}</li>
              <li>${t("home.compare.domCost")}</li>
              <li>${t("home.compare.domFlow")}</li>
            </ul>
            <button class="button gold" type="button" data-route="studio">${t("home.cta")}</button>
          </article>
        </div>
      </section>

      <section class="section trust-support-section">
        <div class="video-honesty-card">
          <div>
            <span>${t("home.videoTrustLabel")}</span>
            <h2>${t("home.videoTrustH2")}</h2>
            <p>${t("home.videoTrustP")}</p>
          </div>
          <button class="button secondary" type="button" data-route="studio">${t("home.videoTrustCta")}</button>
        </div>
        <div class="faq-support-grid">
          <div class="faq-list">
            <h2>${t("home.faqH2")}</h2>
            ${["preserve", "marketplaces", "video", "price"].map((key) => `
              <details class="faq-item">
                <summary>${t(`home.faq.${key}.q`)}</summary>
                <p>${t(`home.faq.${key}.a`)}</p>
              </details>
            `).join("")}
          </div>
          <aside class="support-cta-card">
            <span>${t("home.supportLabel")}</span>
            <h3>${t("home.supportH3")}</h3>
            <p>${t("home.supportP")}</p>
            <button class="button gold" type="button" data-contact-reason="help">${t("home.supportCta")}</button>
          </aside>
        </div>
      </section>

      <section class="section free-tools-section">
        <div class="section-head">
          <h2>${t("home.toolsH2")}</h2>
          <p>${t("home.toolsP")}</p>
        </div>
        <div class="home-tools-grid">
          <article class="home-tool-card">
            <span class="home-tool-icon">✂</span>
            <div>
              <h3>${t("tools.removeBg.h2")}</h3>
              <p>${t("tools.removeBg.desc")}</p>
            </div>
          </article>
          <article class="home-tool-card">
            <span class="home-tool-icon">©</span>
            <div>
              <h3>${t("tools.watermark.h2")} &amp; ${t("tools.promo.h2")}</h3>
              <p>${t("home.toolsCard2")}</p>
            </div>
          </article>
          <article class="home-tool-card">
            <span class="home-tool-icon">▦</span>
            <div>
              <h3>${t("tools.collage.h2")} &amp; ${t("tools.resizer.h2")}</h3>
              <p>${t("home.toolsCard3")}</p>
            </div>
          </article>
          <article class="home-tool-card">
            <span class="home-tool-icon">✓</span>
            <div>
              <h3>${t("tools.checker.h2")} &amp; ${t("tools.compressor.h2")}</h3>
              <p>${t("home.toolsCard4")}</p>
            </div>
          </article>
        </div>
        <div class="section-cta">
          <button class="button gold" data-route="tools">${t("home.toolsCta")}</button>
          <span class="section-cta-note">${t("home.toolsCtaNote")}</span>
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
            <article class="example-card ${item.videoSrc || item.beforeSrc ? "has-video" : ""} ${item.beforeSrc ? "before-after" : ""} ${item.beforeSrc && item.videoSrc ? "proof-triplet" : ""} ${item.shape === "portrait" ? "portrait" : ""} ${item.shape === "wide" ? "wide" : ""}">
              ${item.beforeSrc && item.videoSrc ? `
                <div class="example-media-triplet">
                  <figure class="example-media">
                    <img src="${item.beforeSrc}" alt="${escapeHtml(`${item.title} ${t("home.before")}`)}" loading="lazy" />
                    <span class="example-pair-label">${t("home.before")}</span>
                  </figure>
                  <figure class="example-media">
                    <img src="${item.src}" alt="${escapeHtml(`${item.title} ${t("home.after")}`)}" loading="lazy" />
                    <span class="example-pair-label">${t("home.after")}</span>
                  </figure>
                  <figure class="example-media">
                    <video src="${item.videoSrc}" aria-label="${escapeHtml(`${item.title} video`)}" autoplay muted loop playsinline controls preload="metadata"></video>
                    <span class="example-pair-label">${t("studio.videoTab")}</span>
                  </figure>
                </div>
              ` : item.beforeSrc ? `
                <div class="example-media-pair">
                  <figure class="example-media">
                    <img src="${item.beforeSrc}" alt="${escapeHtml(`${item.title} ${t("home.before")}`)}" loading="lazy" />
                    <span class="example-pair-label">${t("home.before")}</span>
                  </figure>
                  <figure class="example-media">
                    <img src="${item.src}" alt="${escapeHtml(`${item.title} ${t("home.after")}`)}" loading="lazy" />
                    <span class="example-pair-label">${t("home.after")}</span>
                  </figure>
                </div>
              ` : item.videoSrc ? `
                <figure class="example-media">
                  <video src="${item.videoSrc}" aria-label="${escapeHtml(`${item.title} video`)}" autoplay muted loop playsinline controls preload="metadata" poster="${item.src}"></video>
                  <span class="example-pair-label">${t("studio.videoTab")}</span>
                </figure>
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

function marketplaceTabsMarkup(className = "marketplace-tabs") {
  const mTab = (id, label, sub) =>
    `<button class="${state.adpilotView === "marketplace" && state.marketplaceTab === id ? "active" : ""}" type="button" data-marketplace-tab="${id}">
      <strong>${label}</strong><span>${sub}</span>
    </button>`;
  return `<div class="${className}" aria-label="${t("market.tabs")}">
    ${mTab("connection", t("market.tab.connection"), t("market.tab.connectionSub"))}
    ${mTab("products", t("market.tab.products"), t("market.tab.productsSub"))}
    <button class="${state.adpilotView === "tools" ? "active" : ""}" type="button" data-adpilot-tools>
      <strong>${t("market.tab.tools")}</strong><span>${t("market.tab.toolsSub")}</span>
    </button>
    ${mTab("action", t("market.tab.action"), t("market.tab.actionSub"))}
    ${mTab("drafts", t("market.tab.drafts"), t("market.tab.draftsSub"))}
  </div>`;
}

function appSidebar(active) {
  return `<aside class="sidebar">
    <p class="side-caption">${t("sidebar.caption")}</p>
    <button class="side-link ${active === "studio" ? "active" : ""}" data-route="studio">${t("sidebar.new")}</button>
    <button class="side-link ${active === "adpilot" ? "active" : ""}" data-route="adpilot">${t("sidebar.copy")}</button>
    ${active === "adpilot" ? marketplaceTabsMarkup("side-subtabs") : ""}
    <button class="side-link ${active === "history" ? "active" : ""}" data-route="history">${t("sidebar.history")}</button>
    <button class="side-link ${active === "account" ? "active" : ""}" data-route="account">${t("sidebar.account")}</button>
    <button class="side-link ${active === "pricing" ? "active" : ""}" data-route="pricing">${t("sidebar.pricing")}</button>
    <button class="side-link" data-logout>${t("sidebar.logout")}</button>
  </aside>`;
}

function activeContentFormMode() {
  return state.appMode === "advanced" ? "full" : state.contentFormMode;
}

function generationCost() {
  return state.generationKind === "video" ? videoTokenCost() : 100;
}

function currentVideoProvider() {
  return VIDEO_PROVIDERS.find((provider) => provider.id === state.formDraft.video_provider) || VIDEO_PROVIDERS[0];
}

function videoTokenCost() {
  return currentVideoProvider().id === "premium" ? 300 : 0;
}

function videoSourceFromJob(job) {
  if (!job) return "";
  if (job.output_url) return job.output_url;
  if (!job.output_data) return "";
  const format = String(job.output_format || "mp4").toLowerCase();
  const mime = format.includes("webm") ? "video/webm" : format.includes("gif") ? "image/gif" : "video/mp4";
  return `data:${mime};base64,${job.output_data}`;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function revealResultOnMobile() {
  if (!isMobileViewport()) return;
  requestAnimationFrame(() => {
    const resultPanel = document.querySelector(".result-panel");
    if (!resultPanel) return;
    const navHeight = document.querySelector(".nav")?.getBoundingClientRect().height || 0;
    const top = Math.max(0, window.scrollY + resultPanel.getBoundingClientRect().top - navHeight - 12);
    window.scrollTo({
      behavior: "smooth",
      top,
    });
  });
}

function videoJobPanel() {
  if (!state.videoJob) return "";
  const status = state.videoJob.status || "queued";
  const label = t(`video.status.${status}`) || status;
  const error = state.videoJob.error ? `<p class="video-error">${escapeHtml(state.videoJob.error)}</p>` : "";
  const tokensUsed = state.videoJob.tokens_used ?? state.videoJob.tokens_charged ?? 300;
  const jobSub = tokensUsed === 0 ? t("video.jobSubFree") : t("video.jobSub", { n: tokensUsed });
  const download = state.generatedVideo
    ? `<div class="video-actions">
        <a class="button secondary" href="${state.generatedVideo}" download="domstudio-video.${String(state.videoJob.output_format || "mp4").toLowerCase()}">${t("video.download")}</a>
        <button class="button secondary" type="button" data-share>${t("export.share")}</button>
      </div>`
    : "";
  return `<div class="video-job-card ${status}">
    <div class="mini-head"><h3>${t("video.jobTitle")}</h3><span>${label}</span></div>
    <p>${jobSub}</p>
    ${error}
    ${download}
  </div>`;
}

function studioPage() {
  if (!state.user && state.authInitializing) return `<main class="page"></main>`;
  if (!state.user) return gatePage();
  const sceneModeNotice = state.formDraft.mode === "catalog" && hasSceneIntent(state.formDraft.subject);
  const cost = generationCost();
  const selectedVideoProvider = currentVideoProvider();
  const videoSubmitLabel = selectedVideoProvider.id === "premium" ? t("video.submitCta") : t("video.submitFreeCta");
  const isAdvancedStudio = state.appMode === "advanced";
  const submitLabel = state.generating
    ? (state.batchTotal > 1 ? t("studio.submitBatch", { n: state.batchIndex, total: state.batchTotal }) : state.generationKind === "video" ? t("video.submitGenerating") : t("studio.submitGenerating"))
    : (state.generationKind === "video" ? videoSubmitLabel : state.batchQueue.length > 1 ? t("studio.submitBatchCta", { n: state.batchQueue.length * 100 }) : t("studio.submitCta"));
  const tokenHint = !state.user ? "" : state.generationKind === "video" && cost === 0
    ? t("video.tokenFree")
    : state.generationKind === "video"
    ? t("video.tokenOk", { n: state.user.tokens, m: Math.floor(state.user.tokens / cost) })
    : t("studio.tokenOk", { n: state.user.tokens, m: Math.floor(state.user.tokens / 100) });
  return `<main class="${state.user ? "app-layout" : "page"}">
    ${state.user ? appSidebar("studio") : ""}
    <section class="${state.user ? "workspace" : "section pricing-public"}">
      <header class="workspace-head"><div><div class="eyebrow">${t("studio.eyebrow")}</div><h1>${t("studio.h1")}</h1></div>${state.user ? `<div class="balance"><span>${state.user.tokens}</span> ${t("studio.tokens", { n: "" }).trim()}</div>` : `<button class="button" type="button" data-auth-open>${t("nav.signup")}</button>`}</header>
      <div class="studio-grid">
        <form class="panel studio-form" id="generate-form">
          ${appModeSwitch("studio-mode-card", true)}
          <div class="media-toggle" role="group" aria-label="${t("studio.outputType")}">
            <button type="button" class="${state.generationKind === "photo" ? "active" : ""}" data-generation-kind="photo">${t("studio.photoTab")}</button>
            <button type="button" class="${state.generationKind === "video" ? "active" : ""}" data-generation-kind="video">${t("studio.videoTab")}</button>
          </div>
          <div class="mobile-flow-steps" aria-label="Mobile creation flow">
            <span class="active"><b>1</b>Upload</span>
            <span class="${state.selectedImage ? "active" : ""}"><b>2</b>Settings</span>
            <span class="${state.generatedImage || state.generatedVideo ? "active" : ""}"><b>3</b>Result</span>
          </div>
          <label class="upload" id="upload-label"><input type="file" id="image" accept="image/*" multiple /><span><strong>${state.batchQueue.length > 1 ? t("studio.uploadBatch", { n: state.batchQueue.length }) : state.selectedImageName ? escapeHtml(state.selectedImageName) : t("studio.uploadAdd")}</strong><br />${state.batchQueue.length > 1 ? t("studio.uploadTokens", { n: state.batchQueue.length * 100 }) : state.selectedImageName ? t("studio.uploadReady") : t("studio.uploadDesc")}</span></label>
          <div class="form-section">
            <div class="field marketplace-field"><label for="marketplace">${t("studio.marketplace")}</label><select class="select" id="marketplace" name="marketplace">${MARKETPLACE_PRESETS.map(preset => `<option value="${preset.id}" ${selectedAttr(state.formDraft.marketplace, preset.id)}>${preset.label}</option>`).join("")}</select><small>${t("studio.marketplaceHint")}</small></div>
            <div class="field"><label for="style_template">${t("studio.styleTemplate")}</label><select class="select" id="style_template" name="style_template">${STYLE_TEMPLATES.map(template => `<option value="${template.id}" ${selectedAttr(state.formDraft.style_template, template.id)}>${t(`studio.style.${template.id}`) || template.label}</option>`).join("")}</select></div>
            <div class="field"><label for="mode">${t("studio.mode")}</label><select class="select" id="mode" name="mode">${MODES.map(mode => `<option value="${mode[0]}" ${selectedAttr(state.formDraft.mode, mode[0])}>${t("mode." + mode[0] + ".name")}</option>`).join("")}</select><small class="mode-desc-hint">${t("mode." + (state.formDraft.mode || "catalog") + ".desc")}</small></div>
            ${state.generationKind === "video" ? `<div class="field"><label for="duration_s">${t("video.duration")}</label><select class="select" id="duration_s" name="duration_s">
              ${VIDEO_DURATIONS.map((seconds) => `<option value="${seconds}" ${selectedAttr(String(state.formDraft.duration_s || "3"), String(seconds))}>${seconds}s</option>`).join("")}
            </select></div>` : ""}
          </div>
          <div class="field offer-field"><label for="offer_text">${t("studio.offerTextLabel")}</label><input class="input" id="offer_text" name="offer_text" value="${draftValue("offer_text")}" placeholder="${t("studio.offerTextPlaceholder")}" /><small>${t("studio.offerTextHint")}</small></div>
          ${state.generationKind === "video" ? `
            <div class="video-provider-section">
              <div class="mini-head"><h3>${t("video.providerTitle")}</h3><span>${t("video.providerHint")}</span></div>
              <div class="video-provider-grid">
                ${VIDEO_PROVIDERS.map(provider => `
                  <label class="video-provider-option ${selectedVideoProvider.id === provider.id ? "active" : ""}">
                    <input type="radio" name="video_provider" value="${provider.id}" ${checkedAttr(selectedVideoProvider.id === provider.id)} />
                    <span><b>${t(provider.labelKey)}</b><small>${t(provider.metaKey)}</small></span>
                    <p>${t(provider.descKey)}</p>
                  </label>
                `).join("")}
              </div>
            </div>
          ` : ""}
          ${isAdvancedStudio ? `<div class="brand-preferences collapsible ${state.brandPrefsOpen ? "open" : ""}">
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
              <div class="field brand-logo-field">
                <label>${t("studio.brandLogo")}</label>
                <div class="brand-logo-row">
                  ${state.brandPrefs.brand_logo
                    ? `<img class="brand-logo-preview" src="${state.brandPrefs.brand_logo}" alt="logo" />`
                    : `<span class="brand-logo-empty">${t("studio.brandLogoNone")}</span>`}
                  <label class="button secondary" style="width:auto;padding:0 14px;cursor:pointer">
                    ${t("studio.brandLogoUpload")}
                    <input type="file" accept="image/*" style="display:none" data-brand-logo-input />
                  </label>
                  ${state.brandPrefs.brand_logo ? `<button class="button secondary" style="width:auto;padding:0 14px" type="button" data-brand-logo-clear>${t("studio.brandLogoClear")}</button>` : ""}
                </div>
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
          </div>` : ""}
          <div class="field"><label for="subject">${t("studio.subjectLabel")}</label><textarea class="textarea" id="subject" name="subject" required placeholder="${t("studio.subjectPlaceholder")}">${draftValue("subject")}</textarea></div>
          ${sceneModeNotice ? `<div class="mode-notice">${t("studio.sceneModeNotice")}</div>` : ""}
          <div class="field"><label for="style_hint">${t("studio.styleLabel")}</label><input class="input" id="style_hint" name="style_hint" value="${draftValue("style_hint")}" placeholder="${t("studio.stylePlaceholder")}" /></div>
          ${state.generationKind === "photo" ? `<label class="check"><input type="checkbox" name="upscale_4k" ${checkedAttr(state.formDraft.upscale_4k)} /> ${t("studio.upscale")}</label>` : `<p class="video-note">${t("video.note")}</p>`}
          <button class="button gold block desktop-submit" type="submit" ${state.generating || !state.online ? "disabled" : ""}>${submitLabel}</button>
          ${!state.user
            ? `<p class="token-hint"><a href="#" data-auth-open>${t("nav.signup")}</a> ${t("nav.or")} <a href="#" data-auth-open>${t("nav.login")}</a> ${t("studio.tokenOk", { n: "500", m: "5" })}</p>`
            : state.user.tokens < cost
            ? `<p class="token-hint warn">${t("studio.tokenLow")}</p>`
            : `<p class="token-hint">${tokenHint}</p>`}
        </form>
        <div class="panel result-panel">
          <div class="result ${state.generatedImage && !state.generatedVideo ? "has-image" : ""} ${state.generating && !state.generatedImage && !state.generatedVideo ? "loading" : ""} ${state.generationKind === "video" || state.generatedVideo ? "video-result" : ""}">
            ${state.generatedVideo
              ? `<video src="${state.generatedVideo}" controls playsinline loop></video>${state.generating ? `<div class="result-status">${escapeHtml(state.generationLabel || t("video.submitGenerating"))}</div>` : ""}`
              : state.generatedImage
              ? `<img src="${state.overlayImage || state.generatedImage}" alt="AI result" />${state.generating ? `<div class="result-status">${escapeHtml(state.generationLabel || t("studio.generatingNew"))}</div>` : ""}`
              : `<div class="result-empty"><b>${state.generating ? t("studio.resultSetting") : t("studio.resultEmptyB")}</b>${state.generating ? "" : t("studio.resultEmptyP")}</div>`}
          </div>
          ${state.generatedMeta && !state.generatedVideo ? `<p class="result-meta">${state.generatedMeta.variation_label ? `${escapeHtml(state.generatedMeta.variation_label)} · ` : ""}${state.generatedMeta.width || "?"}×${state.generatedMeta.height || "?"} · ${escapeHtml(state.generatedMeta.mode || "")}</p>` : ""}
          ${videoJobPanel()}
          ${isAdvancedStudio ? exportTools() : ""}
          ${contentPackTools()}
          ${quickEditsPanel()}
          ${adpilotLinkPanel()}
          ${isAdvancedStudio ? comparisonPanel() : ""}
          ${isAdvancedStudio ? variationTools() : ""}
          ${isAdvancedStudio ? historyPanel() : ""}
        </div>
      </div>
      <div class="mobile-sticky-generate">
        <div>
          <span>${state.generationKind === "video" ? t("studio.videoTab") : t("studio.photoTab")}</span>
          <b>${cost ? `${cost} ${t("studio.tokens", { n: "" }).trim()}` : "Free"}</b>
        </div>
        <button class="button gold" type="submit" form="generate-form" ${state.generating || !state.online ? "disabled" : ""}>${submitLabel}</button>
      </div>
    </section>
  </main>`;
}

function providerLabel(providerId) {
  const provider = state.marketplaceProviders.find((item) => item.provider === providerId);
  return provider?.label || MARKETPLACE_PRESETS.find((item) => item.id === providerId)?.label || providerId;
}

function selectedMarketplaceConnection() {
  return state.marketplaceConnections.find((item) => item.id === state.marketplaceSelectedConnectionId) || null;
}

function selectedMarketplaceProduct() {
  return state.marketplaceProducts.find((item) => item.id === state.marketplaceSelectedProductId) || null;
}

function marketplaceProviderIds() {
  const ids = state.marketplaceProviders.map((item) => item.provider);
  return ids.length ? ids : ["wildberries", "ozon", "avito"];
}

function marketplaceProviderPanel() {
  const provider = state.marketplaceProviders.find((item) => item.provider === state.marketplaceSelectedProvider);
  const caps = provider?.capabilities || {};
  const stats = [
    [t("market.stats.connections"), state.marketplaceConnections.filter((item) => item.provider === state.marketplaceSelectedProvider).length],
    [t("market.stats.products"), state.marketplaceProducts.filter((item) => item.provider === state.marketplaceSelectedProvider).length],
    [t("market.stats.actions"), state.marketplaceActions.filter((item) => item.provider === state.marketplaceSelectedProvider).length],
  ];
  return `<section class="panel marketplace-overview">
    <div class="mini-head">
      <div><h3>${t("market.h3")}</h3><span>${t("market.sub")}</span></div>
      <button class="button secondary" type="button" data-refresh-marketplaces ${state.marketplaceLoading ? "disabled" : ""}>${state.marketplaceLoading ? t("market.loading") : t("market.refresh")}</button>
    </div>
    <div class="market-provider-row">
      ${marketplaceProviderIds().map((id) => `
        <button class="market-provider ${state.marketplaceSelectedProvider === id ? "active" : ""}" type="button" data-marketplace-provider="${id}">
          <strong>${escapeHtml(providerLabel(id))}</strong>
          <span>${t(`market.provider.${id}`)}</span>
        </button>
      `).join("")}
    </div>
    <div class="market-stat-row">
      ${stats.map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join("")}
    </div>
    <p class="market-note">${escapeHtml(provider?.notes || t("market.safeNote"))}</p>
    <div class="market-cap-row">
      ${["product_import", "card_update", "messages", "price_stock", "live_publish"].map((key) => `
        <span class="${caps[key] ? "ok" : ""}">${t(`market.cap.${key}`)}</span>
      `).join("")}
    </div>
    ${state.marketplaceNotice ? `<p class="generation-notice">${escapeHtml(state.marketplaceNotice)}</p>` : ""}
  </section>`;
}

function marketplaceConnectionPanel() {
  const draft = state.marketplaceConnectDraft;
  return `<form class="panel marketplace-card" id="marketplace-connect-form">
    <div class="mini-head"><h3>${t("market.connectTitle")}</h3><span>${t("market.connectSub")}</span></div>
    <div class="market-form-grid">
      <div class="field">
        <label for="market_provider">${t("market.provider")}</label>
        <select class="select" id="market_provider" name="provider">
          ${marketplaceProviderIds().map((id) => `<option value="${id}" ${selectedAttr(draft.provider, id)}>${escapeHtml(providerLabel(id))}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label for="market_display_name">${t("market.displayName")}</label>
        <input class="input" id="market_display_name" name="display_name" value="${marketplaceConnectValue("display_name")}" />
      </div>
      <div class="field">
        <label for="market_mode">${t("market.mode")}</label>
        <select class="select" id="market_mode" name="mode">
          <option value="draft" ${selectedAttr(draft.mode, "draft")}>${t("market.modeDraft")}</option>
          <option value="live" ${selectedAttr(draft.mode, "live")}>${t("market.modeLive")}</option>
        </select>
      </div>
      <div class="field">
        <label for="market_client_id">${t("market.clientId")}</label>
        <input class="input" id="market_client_id" name="client_id" value="${marketplaceConnectValue("client_id")}" autocomplete="off" />
      </div>
      <div class="field wide">
        <label for="market_api_token">${t("market.apiToken")}</label>
        <input class="input" id="market_api_token" name="api_token" value="${marketplaceConnectValue("api_token")}" autocomplete="off" />
      </div>
      <div class="field">
        <label for="market_user_id">${t("market.avitoUserId")}</label>
        <input class="input" id="market_user_id" name="user_id" value="${marketplaceConnectValue("user_id")}" autocomplete="off" />
      </div>
    </div>
    <button class="button gold block" type="submit" ${state.marketplaceSaving ? "disabled" : ""}>${t("market.connectCta")}</button>
    <p class="token-hint">${t("market.connectHint")}</p>
  </form>`;
}

function marketplaceProductPanel() {
  const connections = state.marketplaceConnections.filter((item) => item.provider === state.marketplaceSelectedProvider);
  const selectedConnection = selectedMarketplaceConnection();
  return `<form class="panel marketplace-card" id="marketplace-product-form">
    <div class="mini-head"><h3>${t("market.productsTitle")}</h3><span>${state.marketplaceProducts.length}</span></div>
    <div class="field">
      <label for="market_connection">${t("market.connection")}</label>
      <select class="select" id="market_connection" name="connection_id" ${connections.length ? "" : "disabled"}>
        ${connections.map((item) => `<option value="${item.id}" ${selectedAttr(state.marketplaceSelectedConnectionId, item.id)}>${escapeHtml(item.display_name || providerLabel(item.provider))} · ${escapeHtml(item.mode || "draft")}</option>`).join("")}
      </select>
    </div>
    <label class="check"><input type="checkbox" name="live_fetch" /> ${t("market.liveFetch")}</label>
    <div class="market-form-grid">
      ${["title", "sku", "category", "price", "stock"].map((field) => `
        <div class="field">
          <label for="market_product_${field}">${t(`market.product.${field}`)}</label>
          <input class="input" id="market_product_${field}" name="${field}" value="${marketplaceProductValue(field)}" />
        </div>
      `).join("")}
      <div class="field wide">
        <label for="market_product_description">${t("market.product.description")}</label>
        <textarea class="textarea" id="market_product_description" name="description" rows="3">${marketplaceProductValue("description")}</textarea>
      </div>
    </div>
    <button class="button secondary block" type="submit" ${selectedConnection || connections.length ? "" : "disabled"}>${t("market.importCta")}</button>
    <div class="market-list compact">
      ${state.marketplaceProducts.filter((item) => item.provider === state.marketplaceSelectedProvider).slice(0, 5).map((item) => `
        <button class="market-list-item ${state.marketplaceSelectedProductId === item.id ? "active" : ""}" type="button" data-marketplace-product="${item.id}">
          <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml([item.sku, item.price, item.stock != null ? `${item.stock} ${t("market.product.stock").toLowerCase()}` : ""].filter(Boolean).join(" · "))}</small></span>
        </button>
      `).join("") || `<p class="market-empty">${t("market.noProducts")}</p>`}
    </div>
  </form>`;
}

function marketplaceActionPanel() {
  const product = selectedMarketplaceProduct();
  const providerProducts = state.marketplaceProducts.filter((item) => item.provider === state.marketplaceSelectedProvider);
  const actionType = state.marketplaceActionType;
  const contextPlaceholder = t(`market.actionContext.${actionType}`) || t("market.actionPlaceholder");
  const contextValue = actionType === "buyer_reply"
    ? (state.contentDraft.customerQuestion || "")
    : (product?.description || state.contentDraft.customerQuestion || "");
  return `<form class="panel marketplace-card" id="marketplace-action-form">
    <div class="mini-head"><h3>${t("market.actionTitle")}</h3><span>${t("market.actionSub")}</span></div>
    <div class="field">
      <label for="market_action_product">${t("market.product")}</label>
      <select class="select" id="market_action_product" name="product_id" ${providerProducts.length ? "" : "disabled"}>
        ${!providerProducts.length ? `<option value="" disabled selected>${escapeHtml(t("market.noProductsOption"))}</option>` : ""}
        ${providerProducts.map((item) => `<option value="${item.id}" ${selectedAttr(state.marketplaceSelectedProductId, item.id)}>${escapeHtml(item.title)}</option>`).join("")}
      </select>
      ${!providerProducts.length ? `<small><button class="text-button" type="button" data-marketplace-tab="products">${escapeHtml(t("market.addProductsHint"))}</button></small>` : ""}
    </div>
    <div class="field">
      <label for="market_action_type">${t("market.actionType")}</label>
      <select class="select" id="market_action_type" name="action_type">
        ${MARKETPLACE_ACTION_TYPES.map((item) => `<option value="${item.id}" ${selectedAttr(actionType, item.id)}>${escapeHtml(marketplaceActionTypeLabel(item))}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="market_action_input">${t("market.actionInput")}</label>
      <textarea class="textarea" id="market_action_input" name="input" rows="4" placeholder="${escapeHtml(contextPlaceholder)}">${escapeHtml(contextValue)}</textarea>
    </div>
    <button class="button gold block" type="submit" ${product && !state.marketplaceSaving ? "" : "disabled"}>${t("market.generateAction")}</button>
    <p class="token-hint">${t("market.actionHint")}</p>
  </form>`;
}

function marketplaceActionsPanel() {
  const actions = state.marketplaceActions.filter((item) => item.provider === state.marketplaceSelectedProvider).slice(0, 8);
  const saved = state.contentSavedOutputs;
  return `<section class="panel marketplace-actions">
    ${saved.length ? `
      <div class="mini-head"><h3>${t("copy.savedDrafts")}</h3><span>${saved.length}</span></div>
      <div class="market-list saved-outputs-list">
        ${saved.map((item) => `
          <article class="market-action saved-output">
            <div><b>${escapeHtml(item.tool)}</b><span>${escapeHtml(item.date)}</span></div>
            <pre>${escapeHtml(item.text)}</pre>
            <div class="market-action-buttons">
              <button class="button secondary" type="button" data-copy-saved="${item.id}">${t("copy.copyOutput")}</button>
              <button class="button secondary" type="button" data-delete-saved="${item.id}">${t("copy.deleteSaved")}</button>
            </div>
          </article>
        `).join("")}
      </div>
    ` : ""}
    <div class="mini-head"><h3>${t("market.actionsTitle")}</h3><span>${actions.length}</span></div>
    <div class="market-list">
      ${actions.map((action) => {
        const draft = action.draft || {};
        return `<article class="market-action">
          <div>
            <b>${escapeHtml(action.title)}</b>
            <span>${escapeHtml(marketplaceActionTypeLabelById(action.action_type))} · ${escapeHtml(action.status)} · ${escapeHtml(draft.ai_provider || "")}</span>
          </div>
          <pre>${escapeHtml(draft.copy || t("market.noDraft"))}</pre>
          ${action.result ? `<p>${escapeHtml(action.result.message || JSON.stringify(action.result))}</p>` : ""}
          <div class="market-action-buttons">
            <button class="button secondary" type="button" data-approve-action="${action.id}" ${action.status === "draft" ? "" : "disabled"}>${t("market.approve")}</button>
            <button class="button secondary" type="button" data-publish-action="${action.id}" ${["draft", "approved"].includes(action.status) ? "" : "disabled"}>${t("market.publish")}</button>
          </div>
        </article>`;
      }).join("") || `<div class="market-empty market-empty-guide">
        <b>${t("market.noActionsTitle")}</b>
        <p>${t("market.noActionsGuide")}</p>
        <div class="market-empty-actions">
          <button class="button gold" type="button" data-marketplace-tab="action">${t("market.emptyCreate")}</button>
          <button class="button secondary" type="button" data-marketplace-tab="products">${t("market.emptyProducts")}</button>
          <button class="button secondary" type="button" data-marketplace-tab="connection">${t("market.emptyConnect")}</button>
        </div>
      </div>`}
    </div>
  </section>`;
}

function marketplaceTabContent() {
  if (state.marketplaceTab === "connection") return marketplaceConnectionPanel();
  if (state.marketplaceTab === "products") return marketplaceProductPanel();
  if (state.marketplaceTab === "action") return marketplaceActionPanel();
  if (state.marketplaceTab === "drafts") return marketplaceActionsPanel();
  return marketplaceProviderPanel();
}

function marketplaceDashboard() {
  return `<div class="marketplace-dashboard">
    ${marketplaceTabsMarkup("marketplace-mobile-tabs")}
    <div class="marketplace-tab-content">
      ${marketplaceTabContent()}
    </div>
  </div>`;
}



const TOOL_EXAMPLE_OUTPUT = {
  Marketplace: `🛒 Название: Кроссовки беговые мужские ProRun X5\n\nОписание:\nЛёгкие беговые кроссовки с амортизирующей подошвой EVA и дышащим верхом из сетки. Подходят для ежедневных тренировок и прогулок.\n\n✅ Вес — 245 г\n✅ Подошва — EVA + резиновая накладка\n✅ Стелька — съёмная, ортопедическая\n✅ Уход — протирать влажной тканью\n\nКлючевые слова: беговые кроссовки, мужские кроссовки, кроссовки для бега, лёгкие кроссовки`,
  Avito:       `Продаю диван угловой в отличном состоянии — пользовались 1 год, без пятен и повреждений. Ткань — рогожка серая, раскладывается в спальное место 140×200 см.\n\nОтдам за 18 000 ₽, торг уместен. Самовывоз из Химок, возможна доставка за доп. плату. Звоните или пишите в WhatsApp.`,
  Ads:         `Заголовок 1: Замена масла за 30 минут\nЗаголовок 2: Сертифицированный автосервис\nЗаголовок 3: Запись онлайн — без очереди\n\nОписание: Полная диагностика в подарок при первом визите. Работаем без выходных. Гарантия на все виды работ.`,
  Social:      `🔥 Новинка уже в магазине!\n\nМы долго ждали — и вот оно. Встречайте новую коллекцию летних платьев 2025.\n\nЛёгкие, яркие, созданные для жарких дней ☀️\n\n📍 Приходите в наш шоурум или заказывайте доставку\n👇 Ссылка в профиле`,
  Retention:   `Здравствуйте! Спасибо за ваш отзыв — очень ценим, что нашли время написать.\n\nПриносим извинения за задержку. Мы разобрались в причине и уже приняли меры. В качестве компенсации хотим предложить вам скидку 15% на следующий заказ.\n\nБудем рады видеть вас снова!`,
  Beauty:      `💅 Маникюр + покрытие гель-лаком — 2 500 ₽\n\nМастер Анна, стаж 7 лет. Работаю в Москве, м. Таганская.\n\nВ стоимость входит:\n• Обрезной или аппаратный маникюр\n• Покрытие гель-лаком (более 200 оттенков)\n• Укрепление ногтей в подарок\n\nЗапись через WhatsApp или Директ 📲`,
  Food:        `🍕 Пицца "Четыре сыра" — 690 ₽\n\nДоставка за 45 минут или бесплатно!\n\nСостав: моцарелла, горгонзола, пармезан, чеддер, томатный соус, тесто на закваске.\n\n📦 Минимальный заказ — 800 ₽\n🎁 При заказе от 1500 ₽ — ролл в подарок`,
  Auto:        `Замена тормозных колодок — от 4 500 ₽\n\nАвтосервис "Пилот Авто" на Варшавском шоссе.\n\n✔ Оригинальные и аналоговые запчасти\n✔ Гарантия на работы — 6 месяцев\n✔ Ремонт в день обращения\n✔ Бесплатная диагностика при записи сегодня\n\nЗапишитесь сейчас: +7 (495) 000-00-00`,
  Pages:       `Заголовок: Создайте сайт за 3 дня — без программистов\n\nПодзаголовок: Готовый лендинг под ваш бизнес с конверсией от 8%\n\nБлок 1 — Проблема:\nВы теряете клиентов, потому что у вас нет нормального сайта. Люди ищут вас в интернете — и уходят к конкурентам.\n\nБлок 2 — Решение:\nМы создаём лендинги, которые продают. Не просто красивые страницы — а инструмент привлечения клиентов.`,
};

function copyStudioPage() {
  if (!state.user && state.authInitializing) return `<main class="page"></main>`;
  const tool = currentContentTool();
  const cost = contentTokenCost(tool);
  const canGenerate = state.online && !state.contentGenerating &&
    (state.user ? state.user.tokens >= cost : true);
  const outputTitle = contentOutputTitle(tool);
  const wizardFields = getWizardFields(tool);
  const wizardStep = Math.min(state.contentWizardStep, wizardFields.length - 1);
  const isLastWizardStep = wizardStep >= wizardFields.length - 1;
  const currentWizardField = wizardFields[wizardStep];
  const wLang = state.contentOutputLanguage === "english" ? "en" : "ru";
  const isAdvancedApp = state.appMode === "advanced";
  const contentFormMode = isAdvancedApp ? "full" : state.contentFormMode;
  const generateLabel = state.user ? t("copy.generate", { n: cost }) : t("copy.generateFree");
  const costBadge = state.user ? `${cost} ${t("studio.tokens", { n: "" }).trim()}` : t("copy.freeTry");

  if (state.adpilotView === "chat") {
    return adPilotChatPage();
  }

  if (state.adpilotView === "marketplace") {
    return `<main class="app-layout">
      ${appSidebar("adpilot")}
      <section class="workspace copy-workspace">
        <header class="workspace-head">
          <div><div class="eyebrow">${t("copy.eyebrow")}</div><h1>${t("copy.h1")}</h1></div>
        </header>
        ${marketplaceDashboard()}
      </section>
    </main>`;
  }

  const CATEGORY_META = {
    Marketplace: { icon: "🛒", desc: t("adpilot.cat.marketplace") },
    Avito:       { icon: "📋", desc: t("adpilot.cat.avito") },
    Ads:         { icon: "📣", desc: t("adpilot.cat.ads") },
    Social:      { icon: "📱", desc: t("adpilot.cat.social") },
    Retention:   { icon: "💬", desc: t("adpilot.cat.retention") },
    Beauty:      { icon: "💄", desc: t("adpilot.cat.beauty") },
    Food:        { icon: "🍽", desc: t("adpilot.cat.food") },
    Auto:        { icon: "🚗", desc: t("adpilot.cat.auto") },
    Pages:       { icon: "📄", desc: t("adpilot.cat.pages") },
  };

  if (!state.contentToolSlug) {
    return `<main class="page adpilot-page">
      <section class="workspace copy-workspace adpilot-landing">
        ${state.adpilotContextImage ? `<div class="copy-context-banner">
          <div class="copy-context-left">
            <img class="copy-context-thumb" src="${state.adpilotContextImage}" alt="${t("adpilotContext.label")}" />
            <div class="copy-context-info">
              <span class="eyebrow">${t("adpilotContext.label")}</span>
              ${state.contentDraft.product ? `<p>${escapeHtml(truncate(state.contentDraft.product, 48))}</p>` : ""}
            </div>
          </div>
          <button class="button secondary copy-context-back" type="button" data-route="tools">${t("nav.tools")}</button>
        </div>` : ""}
        <div class="adpilot-landing-head">
          <div class="eyebrow">${t("copy.eyebrow")}</div>
          <h1>${t("adpilot.landing.h1")}</h1>
          <p>${t("adpilot.landing.p")}</p>
          ${!state.user ? `<span class="adpilot-free-note">${t("adpilot.anonRemaining", { n: Math.max(0, ANON_ADPILOT_LIMIT - getAnonAdpilotCount()) })}</span>` : ""}
        </div>
        <div class="adpilot-quick-start">
          <label class="adpilot-quick-label" for="adpilot-quick-product">${t("adpilot.quickProduct")}</label>
          <input id="adpilot-quick-product" class="input adpilot-quick-input" type="text"
            placeholder="${t("adpilot.quickProductPlaceholder")}"
            value="${escapeHtml(state.contentDraft.product || "")}" />
          <div class="adpilot-quick-btns">
            <button class="button adpilot-quick-btn adpilot-quick-chat" type="button" data-adpilot-chat>${t("adpilot.quickChat")}</button>
            <button class="button adpilot-quick-btn" type="button" data-quick-adpilot="ozon-wb-card">${t("adpilot.quickCard")}</button>
            <button class="button adpilot-quick-btn" type="button" data-quick-adpilot="avito-ad">${t("adpilot.quickAvito")}</button>
            <button class="button adpilot-quick-btn" type="button" data-quick-adpilot="vk-post">${t("adpilot.quickSocial")}</button>
            <button class="button adpilot-quick-btn" type="button" data-quick-adpilot="avito-reply">${t("adpilot.quickReply")}</button>
            <button class="button adpilot-quick-btn" type="button" data-quick-adpilot="yandex-ads">${t("adpilot.quickYandex")}</button>
            <button class="button adpilot-quick-btn" type="button" data-quick-adpilot="product-description">${t("adpilot.quickDesc")}</button>
          </div>
        </div>
      </section>
    </main>`;
  }

  return `<main class="page adpilot-page">
    <section class="workspace copy-workspace">
      <header class="workspace-head">
        <div>
          <button class="copy-back-btn" type="button" data-adpilot-home>← AdPilot</button>
          <h1>${escapeHtml(contentToolName(tool))}</h1>
        </div>
      </header>
      <div class="copy-grid copy-grid-no-sidebar">
        <form class="panel copy-form-panel" id="copy-form">
          ${state.adpilotContextImage ? `<div class="copy-context-banner">
            <div class="copy-context-left">
              <img class="copy-context-thumb" src="${state.adpilotContextImage}" alt="${t("adpilotContext.label")}" />
              <div class="copy-context-info">
                <span class="eyebrow">${t("adpilotContext.label")}</span>
                ${state.contentDraft.product ? `<p>${escapeHtml(truncate(state.contentDraft.product, 48))}</p>` : ""}
              </div>
            </div>
            <button class="button secondary copy-context-back" type="button" data-route="studio">${t("adpilotContext.back")}</button>
          </div>` : ""}
          <div class="copy-form-head">
            <div class="copy-form-head-top">
              <span class="copy-form-cat-icon">${(CATEGORY_META[tool.category] || { icon: "✦" }).icon}</span>
              <div class="copy-form-head-titles">
                <h3>${escapeHtml(contentToolName(tool))}</h3>
                <span class="copy-form-cat-label">${escapeHtml(tool.category)}</span>
              </div>
              <span class="copy-form-cost-badge">${costBadge}</span>
            </div>
            <p class="copy-form-intent">${escapeHtml(contentToolIntent(tool))}</p>
            <div class="copy-form-head-row">
              <span class="copy-form-channel-tag">${t("copy.channelReady")}</span>
              <button class="link-btn" type="button" data-fill-example>${t("copy.fillExample")}</button>
            </div>
          </div>
          <div class="copy-language-row" role="group" aria-label="${t("copy.language")}">
            ${["russian", "english"].map((lang) => `
              <button class="segment ${state.contentOutputLanguage === lang ? "active" : ""}" type="button" data-content-language="${lang}">
                ${t(`copy.language.${lang}`)}
              </button>
            `).join("")}
          </div>
          ${contentFormMode === "wizard" ? `
            <div class="wizard-form">
              ${wizardFields.slice(0, wizardStep).map((field, i) => `
                <div class="wizard-done">
                  <div class="wizard-done-body">
                    <span class="wizard-done-q">${escapeHtml(WIZARD_QUESTIONS[field]?.[wLang] || field)}</span>
                    <span class="wizard-done-a">${contentDraftValue(field) || "—"}</span>
                  </div>
                  <button type="button" class="wizard-done-edit" data-wizard-edit="${i}">✎</button>
                </div>
              `).join("")}
              <div class="wizard-step">
                <label class="wizard-q">${escapeHtml(WIZARD_QUESTIONS[currentWizardField]?.[wLang] || currentWizardField)}</label>
                <textarea class="textarea wizard-ta" data-wizard-field="${currentWizardField}" rows="3"
                  placeholder="${escapeHtml(WIZARD_PLACEHOLDERS[currentWizardField]?.[wLang] || "")}">${contentDraftValue(currentWizardField)}</textarea>
                ${isLastWizardStep
                  ? `<button type="button" class="button gold block wizard-generate" data-wizard-generate ${canGenerate ? "" : "disabled"}>${state.contentGenerating ? t("copy.generating") : generateLabel}</button>`
                  : `<button type="button" class="button primary block" data-wizard-next>${t("copy.wizardNext")}</button>`}
              </div>
              <button type="button" class="link-btn wizard-mode-btn" data-app-mode="advanced">${t("copy.allFields")}</button>
            </div>
          ` : `
            <div class="copy-fields">
              <button type="button" class="link-btn wizard-mode-btn" data-app-mode="fast">${t("copy.quickMode")}</button>
              ${tool.fields.map((field) => `
                <div class="field">
                  <label for="copy_${field}">${escapeHtml(contentFieldLabel(field))}</label>
                  <textarea class="textarea" id="copy_${field}" name="${field}" rows="${field === "advantages" || field === "reviewText" ? 4 : 2}" placeholder="${t(`copy.placeholder.${field}`)}">${contentDraftValue(field)}</textarea>
                </div>
              `).join("")}
            </div>
          `}
          ${isAdvancedApp ? `<div class="copy-profile">
            <div class="mini-head"><h3>${t("copy.profileTitle")}</h3><span>${t("copy.profileSub")}</span></div>
            <div class="helper-grid">
              ${["businessName", "city", "niche", "targetCustomer", "tone", "offer", "phone"].map((field) => `
                <div class="field ${field === "targetCustomer" ? "wide" : ""}">
                  <label for="copy_profile_${field}">${escapeHtml(contentFieldLabel(field))}</label>
                  <input class="input" id="copy_profile_${field}" name="profile_${field}" value="${contentProfileValue(field)}" />
                </div>
              `).join("")}
            </div>
          </div>` : ""}
          ${contentFormMode !== "wizard" ? `<button class="button gold block" type="submit" ${canGenerate ? "" : "disabled"}>${state.contentGenerating ? t("copy.generating") : generateLabel}</button>` : ""}
          ${state.user
            ? (state.user.tokens < cost
              ? `<p class="token-hint warn">${t("studio.tokenLow")}</p>`
              : `<p class="token-hint">${t("copy.tokenOk", { n: state.user.tokens, m: Math.floor(state.user.tokens / Math.max(cost, 1)) })}</p>`)
            : ""}
        </form>
        <section class="panel copy-output-panel" aria-label="${outputTitle}">
          <div class="output-panel-head">
            <div class="output-panel-title">
              <span class="copy-form-cat-icon">${(CATEGORY_META[tool.category] || { icon: "✦" }).icon}</span>
              <div class="output-panel-title-text">
                <h3>${escapeHtml(contentToolName(tool))}</h3>
                <span>${t(`copy.outputUse.${contentOutputKind(tool)}`)}</span>
              </div>
              ${state.contentOutput ? `<span class="output-ready-badge">${t("copy.outputReady")}</span>` : ""}
            </div>
            <div class="output-actions">
              <button class="button secondary" type="button" data-save-draft-local ${state.contentOutput && !state.contentSavingDraft ? "" : "disabled"}>${t("copy.saveDraft")}</button>
              <button class="button secondary" type="button" data-copy-output ${state.contentOutput ? "" : "disabled"}>${contentCopyLabel(tool)}</button>
            </div>
          </div>
          ${state.contentVariations.length > 1 ? `
            <div class="variation-pills" role="group" aria-label="${t("copy.variations")}">
              ${state.contentVariations.map((v, i) => `
                <button class="pill ${state.contentOutput === v ? "active" : ""}" type="button" data-variation="${i}">${t("copy.variation")} ${i + 1}</button>
              `).join("")}
            </div>
          ` : ""}
          ${state.contentOutput
            ? `<div class="copy-output-rendered">${renderMarkdown(state.contentOutput)}</div>`
            : `<div class="copy-output-empty">
                <pre class="copy-output-ghost" aria-hidden="true">${escapeHtml(TOOL_EXAMPLE_OUTPUT[tool.category] || TOOL_EXAMPLE_OUTPUT.Avito)}</pre>
                <div class="copy-output-empty-overlay">
                  <span class="copy-output-empty-icon">✦</span>
                  <p>${t("copy.outputEmptyHint")}</p>
                </div>
              </div>`
          }
          ${state.contentOutput ? (() => {
            const len = state.contentOutput.length;
            const platforms = [["Avito", 3000], ["Ozon", 5000], ["WB", 5000]];
            return `<div class="char-limits">
              <span class="char-count">${len} ${t("copy.charCount")}</span>
              ${platforms.map(([name, limit]) => `<span class="platform-badge ${len <= limit ? "ok" : "over"}">${name}</span>`).join("")}
            </div>`;
          })() : ""}
          ${state.contentOutput ? `
            <div class="adjust-row">
              <input class="input" type="text" placeholder="${t("copy.adjustPlaceholder")}" value="${escapeHtml(state.contentAdjustInstruction)}" data-adjust-input />
              <button class="button secondary" type="button" data-adjust-submit ${canGenerate ? "" : "disabled"}>${t("copy.adjust")}</button>
            </div>
          ` : ""}
          ${state.contentNotice ? `<p class="generation-notice">${escapeHtml(state.contentNotice)}</p>` : ""}
          ${state.contentMeta ? `<p class="result-meta">${escapeHtml(contentToolName(state.contentMeta.tool || tool))} · ${escapeHtml(state.contentMeta.provider || "")} · ${state.contentMeta.tokens_charged || cost} ${t("studio.tokens", { n: "" }).trim()}</p>` : ""}
        </section>
      </div>
    </section>
  </main>`;
}

function accountPage() {
  if (!state.user && state.authInitializing) return `<main class="page"></main>`;
  if (!state.user) return gatePage();
  const isAdvancedAccount = state.appMode === "advanced";
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

      ${!isAdvancedAccount ? `<div class="account-mode-note">
        <div><b>${t("account.fastNoteTitle")}</b><span>${t("account.fastNoteSub")}</span></div>
        <button class="button secondary compact-button" type="button" data-app-mode="advanced">${t("account.showAdvanced")}</button>
      </div>` : ""}

      ${isFree || lowTokens ? `
      <div class="upgrade-cta">
        <div class="upgrade-cta-copy">
          <b>${isFree ? t("account.upgradeFreB") : t("account.upgradeLowB")}</b>
          <span>${isFree ? t("account.upgradeFreS") : t("account.upgradeLowS")}</span>
        </div>
        <button class="button gold" data-route="pricing">${t("account.upgradeCta")}</button>
      </div>` : ""}

      ${isAdvancedAccount && recentHistory.length ? `
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

      ${isAdvancedAccount && hasBrand ? `
      <div class="panel account-section">
        <div class="account-section-head"><h3>${t("account.brandH3")}</h3><button class="text-button" data-route="studio">${t("account.brandEdit")}</button></div>
        <dl class="brand-summary">
          ${bp.brand_colors ? `<div><dt>${t("account.brandColors")}</dt><dd>${escapeHtml(bp.brand_colors)}</dd></div>` : ""}
          ${bp.preferred_background ? `<div><dt>${t("account.brandBg")}</dt><dd>${escapeHtml(bp.preferred_background)}</dd></div>` : ""}
          ${bp.brand_mood ? `<div><dt>${t("account.brandMood")}</dt><dd>${escapeHtml(bp.brand_mood)}</dd></div>` : ""}
          ${bp.do_not_use ? `<div><dt>${t("account.brandAvoid")}</dt><dd>${escapeHtml(bp.do_not_use)}</dd></div>` : ""}
        </dl>
      </div>` : ""}

      ${state.referral ? `
      <div class="panel account-section">
        <div class="account-section-head"><h3>${t("account.referralH3")}</h3><span>${t("account.referralSub")}</span></div>
        <div class="referral-link-row">
          <input class="referral-link-input" type="text" readonly value="${escapeHtml(state.referral.link)}" id="referral-link-input" />
          <button class="button secondary" data-copy-referral>${t("account.referralCopy")}</button>
        </div>
        <div class="referral-stats">
          <span>${t("account.referralCount").replace("{n}", state.referral.referrals_count)}</span>
          <span>${t("account.referralEarned").replace("{n}", state.referral.tokens_earned.toLocaleString("ru-RU"))}</span>
          <span class="referral-reward">${t("account.referralReward").replace("{n}", state.referral.tokens_per_referral)}</span>
        </div>
      </div>` : ""}

      <div class="panel account-section">
        <div class="account-section-head"><h3>${t("account.dataH3")}</h3></div>
        <p class="account-contact">${escapeHtml(state.user.email || state.user.phone || "—")}</p>
        <p class="account-status ${state.user.is_verified ? "verified" : "pending"}">${state.user.is_verified ? t("account.verified") : t("account.pending")}</p>
        <div class="account-actions">
          <button class="button secondary account-logout" type="button" data-logout>${t("sidebar.logout")}</button>
        </div>
      </div>
    </section>
  </main>`;
}

function historyPage() {
  const locale = state.lang === "en" ? "en-GB" : "ru-RU";
  const isAdvancedHistory = state.appMode === "advanced";
  const modeFilters = [
    { id: "all", label: t("historyPage.filterAll") },
    ...MODES.map(([id]) => ({ id, label: t(`mode.${id}.name`) })),
  ];
  const filtered = state.history.filter(
    item => state.historyFilter === "all" || item.mode === state.historyFilter
  );
  const visibleHistory = isAdvancedHistory ? filtered : filtered.slice(0, 6);
  return `<main class="${state.user ? "app-layout" : "page"}">
    ${state.user ? appSidebar("history") : ""}
    <section class="${state.user ? "workspace" : "section"}">
      <header class="workspace-head">
        <div><div class="eyebrow">${t("historyPage.eyebrow")}</div><h1>${t("historyPage.h1")}</h1></div>
        ${state.history.length ? `<button class="button secondary" data-clear-history>${t("historyPage.clearAll")}</button>` : ""}
      </header>
      ${state.history.length ? `
        ${!isAdvancedHistory ? `<div class="history-mode-note">
          <div><b>${t("historyPage.fastNoteTitle")}</b><span>${t("historyPage.fastNoteSub")}</span></div>
          <button class="button secondary compact-button" type="button" data-app-mode="advanced">${t("historyPage.showAdvanced")}</button>
        </div>` : ""}
        ${isAdvancedHistory ? `<div class="chip-row" style="margin-bottom: 20px;">
          ${modeFilters.map(m => `<button class="chip ${state.historyFilter === m.id ? "chip-active" : ""}" type="button" data-history-filter="${m.id}">${m.label}</button>`).join("")}
        </div>` : ""}
        ${visibleHistory.length ? `
          <div class="history-full-grid">
            ${visibleHistory.map(item => {
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
  const isAdvancedPricing = state.appMode === "advanced";
  const cards = state.plans.filter(plan => ["free", "basic", "pro", "business"].includes(plan.name));
  return `<main class="${state.user ? "app-layout" : "page"}">
    ${state.user ? appSidebar("pricing") : ""}
    <section class="${state.user ? "workspace" : "section pricing-public"}">
      <header class="workspace-head"><div><div class="eyebrow">${t("pricing.eyebrow")}</div><h1>${t("pricing.h1")}</h1></div></header>
      <div class="price-grid">
        ${cards.map(plan => `
          <article class="price-card ${plan.name === "pro" ? "featured" : ""}">
            <div class="plan-kicker">${planDescription(plan.name)}</div>
            <h3>${planLabel(plan.name)}</h3>
            <div class="price">${plan.price_rub.toLocaleString("ru-RU")} ₽ <small>${t("pricing.perMonth")}</small></div>
            <ul class="price-list"><li>${planPhotos(plan)}</li><li>${planVideos(plan)}</li>${planPremiumVideos(plan) ? `<li>${planPremiumVideos(plan)}</li>` : ""}<li>${pricePerPhoto(plan)}</li><li>${plan.tokens.toLocaleString("ru-RU")} ${t("studio.tokens", { n: "" }).trim()}</li><li>${t("pricing.allModes")}</li></ul>
            <button class="button ${plan.name === "pro" ? "gold" : ""}" data-plan="${plan.name}">${plan.price_rub ? t("pricing.choose") : t("pricing.startFree")}</button>
          </article>`).join("")}
      </div>

      ${!isAdvancedPricing ? `<div class="pricing-mode-note">
        <div><b>${t("pricing.fastNoteTitle")}</b><span>${t("pricing.fastNoteSub")}</span></div>
        <button class="button secondary compact-button" type="button" data-app-mode="advanced">${t("pricing.showAdvanced")}</button>
      </div>` : ""}

      ${isAdvancedPricing ? `<div class="topup-section">
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
      </div>` : ""}
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

function toolsPage() {
  const hasResult = Boolean(state.removeBgResult);
  return `<div class="page tools-page">
    <div class="page-inner tools-inner">
      <div class="mini-head"><h1>${t("tools.h1")}</h1><span>${t("tools.sub")}</span></div>
      <div class="tools-grid">
      <div class="tool-card tool-card-wide">
        <div class="tool-card-head">
          <h2>${t("tools.removeBg.h2")}</h2>
          <span class="tool-card-badge">${t("tools.removeBg.free")}</span>
        </div>
        <p class="tool-card-desc">${t("tools.removeBg.desc")}</p>
        <p class="tool-card-studio-hint"><button class="tool-card-studio-link" data-route="studio">${t("tools.removeBg.studioHint")}</button></p>

        ${hasResult ? `
          <div class="removebg-result">
            <div class="removebg-canvas" ${state.removeBgBgColor ? `style="background:${state.removeBgBgColor}"` : ""}>
              <img src="${state.removeBgComposed || state.removeBgResult}" alt="${t("tools.removeBg.result")}" />
            </div>
            <div class="removebg-bg-row">
              <span class="removebg-bg-label">${t("tools.bg.label")}</span>
              <div class="removebg-bg-chips">
                <button class="bg-chip ${!state.removeBgBgColor ? "active" : ""}" type="button" data-bg-preset="none" title="${t("tools.bg.none")}">
                  <span class="bg-chip-swatch transparent-swatch"></span>
                </button>
                ${REMOVEBG_BG_PRESETS.map(p => `
                  <button class="bg-chip ${state.removeBgBgColor === p.color ? "active" : ""}" type="button" data-bg-preset="${p.color}" title="${t(p.labelKey)}" style="--chip-color:${p.color}">
                    <span class="bg-chip-swatch" style="background:${p.color};${p.id === "white" ? "border:1px solid #ddd;" : ""}"></span>
                  </button>
                `).join("")}
                <label class="bg-chip" title="${t("tools.bg.custom")}">
                  <span class="bg-chip-swatch custom-swatch">🎨</span>
                  <input type="color" style="display:none" data-bg-custom value="${state.removeBgBgColor || "#ffffff"}" />
                </label>
              </div>
            </div>
            <button class="shadow-toggle ${state.removeBgShadow ? "active" : ""}" type="button" data-toggle-shadow>
              <span class="shadow-toggle-icon">◉</span> ${t("tools.shadow.toggle")}
            </button>
            <div class="removebg-actions" style="margin-top:14px">
              <a class="button" href="${state.removeBgComposed || state.removeBgResult}" download="${state.removeBgBgColor ? "product.jpg" : "no-bg.png"}">${t(state.removeBgBgColor ? "tools.removeBg.downloadJpg" : "tools.removeBg.download")}</a>
              <button class="button secondary" type="button" data-removebg-reset>${t("tools.removeBg.again")}</button>
            </div>
            <div class="tool-send-row">
              <span class="tool-send-label">${t("tools.sendTo")}</span>
              <button class="chip" type="button" data-send-to="collage" data-send-from="removebg">${t("tools.collage.h2")}</button>
              <button class="chip" type="button" data-send-to="watermark" data-send-from="removebg">${t("tools.watermark.h2")}</button>
              <button class="chip" type="button" data-send-to="promo" data-send-from="removebg">${t("tools.promo.h2")}</button>
              <button class="chip" type="button" data-send-to="resizer" data-send-from="removebg">${t("tools.resizer.h2")}</button>
              <button class="chip" type="button" data-send-to="compressor" data-send-from="removebg">${t("tools.compressor.h2")}</button>
              <button class="chip" type="button" data-send-to="checker" data-send-from="removebg">${t("tools.checker.h2")}</button>
              <button class="chip chip-adpilot" type="button" data-send-to="adpilot" data-send-from="removebg">${t("tools.sendToAdpilot")}</button>
            </div>
            <button class="button gold block" type="button" data-use-in-studio style="margin-top:6px">
              ${t("tools.useInStudio")}
            </button>
          </div>
        ` : `
          <label class="removebg-upload ${state.removeBgLoading ? "loading" : ""}" for="removebg-file">
            ${state.removeBgPreview
              ? `<img class="removebg-preview" src="${state.removeBgPreview}" alt="" />`
              : `<span class="removebg-placeholder">
                  <span class="removebg-icon">✂</span>
                  <b>${t("tools.removeBg.upload")}</b>
                  <small>${t("tools.removeBg.uploadHint")}</small>
                </span>`
            }
          </label>
          <input id="removebg-file" type="file" accept="image/*" style="display:none" data-removebg-input />
          ${state.removeBgError ? `<p class="field-error">${escapeHtml(state.removeBgError)}</p>` : ""}
          ${state.removeBgLoading && state.removeBgProgress ? `<p class="removebg-progress">${escapeHtml(state.removeBgProgress)}</p>` : ""}
          <button class="button block" type="button" data-removebg-submit
            ${!state.removeBgFile || state.removeBgLoading ? "disabled" : ""}>
            ${state.removeBgLoading ? t("tools.removeBg.processing") : t("tools.removeBg.cta")}
          </button>
        `}
      </div>

      <div class="tool-card" id="tool-collage">
        <div class="tool-card-head">
          <h2>${t("tools.collage.h2")}</h2>
          <span class="eyebrow">${t("tools.collage.free")}</span>
        </div>
        <p class="tool-card-desc">${t("tools.collage.desc")}</p>
        <div class="collage-layouts">
          ${COLLAGE_LAYOUTS.map(l => `<button class="resizer-fmt-chip ${state.collageLayout === l.id ? "active" : ""}" type="button" data-collage-layout="${l.id}">${l.label}</button>`).join("")}
        </div>
        ${state.collageResult ? `
          <img class="tool-result-img" src="${state.collageResult}" alt="collage" />
          <div class="tool-actions">
            <a class="button" href="${state.collageResult}" download="collage.jpg">${t("tools.collage.download")}</a>
            <button class="button secondary" type="button" data-collage-reset>${t("tools.collage.again")}</button>
          </div>
          <div class="tool-send-row">
            <span class="tool-send-label">${t("tools.sendTo")}</span>
            <button class="chip" type="button" data-send-to="watermark" data-send-from="collage">${t("tools.watermark.h2")}</button>
            <button class="chip" type="button" data-send-to="promo" data-send-from="collage">${t("tools.promo.h2")}</button>
            <button class="chip" type="button" data-send-to="resizer" data-send-from="collage">${t("tools.resizer.h2")}</button>
            <button class="chip" type="button" data-send-to="compressor" data-send-from="collage">${t("tools.compressor.h2")}</button>
            <button class="chip" type="button" data-send-to="checker" data-send-from="collage">${t("tools.checker.h2")}</button>
            <button class="chip chip-adpilot" type="button" data-send-to="adpilot" data-send-from="collage">${t("tools.sendToAdpilot")}</button>
          </div>
        ` : `
          <div class="collage-upload-grid">
            ${[0,1,2,3].map(i => {
              const needed = state.collageLayout === "2x1" ? 2 : state.collageLayout === "1+2" ? 3 : 4;
              if (i >= needed) return "";
              return state.collagePreviews[i]
                ? `<div class="collage-slot filled" data-collage-slot="${i}"><img src="${state.collagePreviews[i]}" /><button type="button" data-collage-remove="${i}">✕</button></div>`
                : `<label class="collage-slot empty" for="collage-file-${i}"><span>+</span><input id="collage-file-${i}" type="file" accept="image/*" style="display:none" data-collage-input="${i}" /></label>`;
            }).join("")}
          </div>
          ${state.collagePreviews.length >= (state.collageLayout === "2x1" ? 2 : state.collageLayout === "1+2" ? 3 : 4)
            ? `<button class="button gold block" type="button" data-collage-build style="margin-top:12px">${t("tools.collage.build")}</button>`
            : `<p class="tool-hint">${t("tools.collage.hint")}</p>`}
        `}
      </div>

      <div class="tool-card" id="tool-watermark">
        <div class="tool-card-head">
          <h2>${t("tools.watermark.h2")}</h2>
          <span class="eyebrow">${t("tools.watermark.free")}</span>
        </div>
        <p class="tool-card-desc">${t("tools.watermark.desc")}</p>
        ${state.watermarkResult ? `
          <div class="removebg-canvas" style="margin-bottom:14px">
            <img src="${state.watermarkResult}" alt="watermark result" />
          </div>
          <div class="removebg-actions">
            <a class="button" href="${state.watermarkResult}" download="product-watermark.jpg">${t("tools.watermark.download")}</a>
            <button class="button secondary" type="button" data-wm-edit>${t("tools.watermark.edit")}</button>
          </div>
          <div class="tool-send-row">
            <span class="tool-send-label">${t("tools.sendTo")}</span>
            <button class="chip" type="button" data-send-to="collage" data-send-from="watermark">${t("tools.collage.h2")}</button>
            <button class="chip" type="button" data-send-to="promo" data-send-from="watermark">${t("tools.promo.h2")}</button>
            <button class="chip" type="button" data-send-to="resizer" data-send-from="watermark">${t("tools.resizer.h2")}</button>
            <button class="chip" type="button" data-send-to="compressor" data-send-from="watermark">${t("tools.compressor.h2")}</button>
            <button class="chip" type="button" data-send-to="checker" data-send-from="watermark">${t("tools.checker.h2")}</button>
            <button class="chip chip-adpilot" type="button" data-send-to="adpilot" data-send-from="watermark">${t("tools.sendToAdpilot")}</button>
          </div>
          <button class="button secondary block" type="button" data-wm-reset style="margin-top:8px">${t("tools.watermark.again")}</button>
        ` : state.watermarkPreview ? `
          <canvas id="wm-preview-canvas" style="width:100%;border-radius:12px;margin-bottom:14px;display:block"></canvas>
          <div class="wm-controls">
            <div class="field">
              <label>${t("tools.watermark.textLabel")}</label>
              <input class="input" type="text" data-wm-text value="${escapeHtml(state.watermarkText)}"
                placeholder="${t("tools.watermark.textPlaceholder")}" />
            </div>
            <div class="wm-row">
              <span class="wm-label">${t("tools.watermark.posLabel")}</span>
              <div class="wm-pos-grid">
                ${[["top-left","↖"],["top-right","↗"],["center","·"],["bottom-left","↙"],["bottom-right","↘"]].map(([pos, icon]) =>
                  `<button class="wm-pos-btn ${state.watermarkPos === pos ? "active" : ""}" type="button" data-wm-pos="${pos}">${icon}</button>`
                ).join("")}
              </div>
            </div>
            <div class="wm-row">
              <span class="wm-label">${t("tools.watermark.opacityLabel")}</span>
              <div class="wm-chips">
                ${[[0.3,"tools.watermark.light"],[0.55,"tools.watermark.medium"],[0.85,"tools.watermark.strong"]].map(([v,key]) =>
                  `<button class="chip ${state.watermarkOpacity === v ? "active" : ""}" type="button" data-wm-opacity="${v}">${t(key)}</button>`
                ).join("")}
              </div>
            </div>
            <div class="wm-row">
              <span class="wm-label">${t("tools.watermark.colorLabel")}</span>
              <div class="wm-chips">
                <button class="chip ${!state.watermarkDark ? "active" : ""}" type="button" data-wm-color="white">${t("tools.watermark.white")}</button>
                <button class="chip ${state.watermarkDark ? "active" : ""}" type="button" data-wm-color="dark">${t("tools.watermark.dark")}</button>
              </div>
            </div>
            <button class="button gold block" type="button" data-wm-apply style="margin-top:14px">${t("tools.watermark.apply")}</button>
          </div>
        ` : `
          <label class="removebg-upload" for="watermark-file">
            <span class="removebg-placeholder">
              <span class="removebg-icon">©</span>
              <b>${t("tools.watermark.upload")}</b>
              <small>${t("tools.watermark.uploadHint")}</small>
            </span>
          </label>
          <input id="watermark-file" type="file" accept="image/*" style="display:none" data-wm-input />
        `}
      </div>

      <div class="tool-card" id="tool-promo">
        <div class="tool-card-head">
          <h2>${t("tools.promo.h2")}</h2>
          <span class="eyebrow">${t("tools.promo.free")}</span>
        </div>
        <p class="tool-card-desc">${t("tools.promo.desc")}</p>
        ${state.promoPreview ? `
          <div class="removebg-canvas" style="margin-bottom:14px">
            <img src="${state.promoResult || state.promoPreview}" alt="promo preview" />
          </div>
          <div class="wm-controls">
            <div class="wm-row">
              <label class="wm-label">${t("tools.promo.text")}</label>
              <input class="wm-text-input" type="text" maxlength="8" value="${escapeHtml(state.promoText)}" data-promo-text />
            </div>
            <div class="wm-row">
              <label class="wm-label">${t("tools.promo.color")}</label>
              <div class="wm-chips">
                ${["#E63946","#FF9D2E","#22A06B","#1A1A2E","#4361EE"].map(c =>
                  `<button class="bg-chip ${state.promoColor === c ? "active" : ""}" type="button" data-promo-color="${c}" style="background:${c}; width:28px; height:28px; border-radius:50%; border: 2px solid ${state.promoColor === c ? "#333" : "transparent"}"></button>`
                ).join("")}
                <input type="color" value="${state.promoColor}" data-promo-color-pick style="width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;padding:0" />
              </div>
            </div>
            <div class="wm-row">
              <label class="wm-label">${t("tools.promo.position")}</label>
              <div class="wm-pos-grid">
                ${["top-left","top-right","bottom-left","bottom-right"].map(p =>
                  `<button class="wm-pos-btn ${state.promoPos === p ? "active" : ""}" type="button" data-promo-pos="${p}"></button>`
                ).join("")}
              </div>
            </div>
            <div class="removebg-actions" style="margin-top:14px">
              ${state.promoResult
                ? `<a class="button" href="${state.promoResult}" download="promo.jpg">${t("tools.promo.download")}</a>`
                : `<button class="button" disabled>${t("tools.promo.download")}</button>`}
              <button class="button secondary" type="button" data-promo-reset>${t("tools.promo.again")}</button>
            </div>
            ${state.promoResult ? `
            <div class="tool-send-row">
              <span class="tool-send-label">${t("tools.sendTo")}</span>
              <button class="chip" type="button" data-send-to="collage" data-send-from="promo">${t("tools.collage.h2")}</button>
              <button class="chip" type="button" data-send-to="watermark" data-send-from="promo">${t("tools.watermark.h2")}</button>
              <button class="chip" type="button" data-send-to="resizer" data-send-from="promo">${t("tools.resizer.h2")}</button>
              <button class="chip" type="button" data-send-to="compressor" data-send-from="promo">${t("tools.compressor.h2")}</button>
              <button class="chip" type="button" data-send-to="checker" data-send-from="promo">${t("tools.checker.h2")}</button>
              <button class="chip chip-adpilot" type="button" data-send-to="adpilot" data-send-from="promo">${t("tools.sendToAdpilot")}</button>
            </div>` : ""}
          </div>
        ` : `
          <label class="removebg-upload" for="promo-file">
            <span class="removebg-placeholder"><span class="removebg-icon">%</span><b>${t("tools.promo.upload")}</b><small>${t("tools.promo.uploadHint")}</small></span>
          </label>
          <input id="promo-file" type="file" accept="image/*" style="display:none" data-promo-input />
        `}
      </div>

      <div class="tool-card" id="tool-resizer">
        <div class="tool-card-head">
          <h2>${t("tools.resizer.h2")}</h2>
          <span class="eyebrow">${t("tools.resizer.free")}</span>
        </div>
        <p class="tool-card-desc">${t("tools.resizer.desc")}</p>
        <div class="resizer-formats">
          ${RESIZER_FORMATS.map(f => `
            <button class="resizer-fmt-chip ${state.resizerFormat === f.id ? "active" : ""}" type="button" data-resizer-fmt="${f.id}">
              <b>${f.label}</b><span>${f.w}×${f.h}</span>
            </button>`).join("")}
        </div>
        ${state.resizerResult ? `
          <div class="removebg-result">
            <div class="removebg-canvas" style="background:#f5f5f5">
              <img src="${state.resizerResult}" alt="resized" />
            </div>
            <div class="removebg-actions">
              <a class="button" href="${state.resizerResult}" download="product-${state.resizerFormat}.jpg">${t("tools.resizer.download")}</a>
              <button class="button secondary" type="button" data-resizer-reset>${t("tools.resizer.again")}</button>
            </div>
            <div class="tool-send-row">
              <span class="tool-send-label">${t("tools.sendTo")}</span>
              <button class="chip" type="button" data-send-to="collage" data-send-from="resizer">${t("tools.collage.h2")}</button>
              <button class="chip" type="button" data-send-to="watermark" data-send-from="resizer">${t("tools.watermark.h2")}</button>
              <button class="chip" type="button" data-send-to="promo" data-send-from="resizer">${t("tools.promo.h2")}</button>
              <button class="chip" type="button" data-send-to="compressor" data-send-from="resizer">${t("tools.compressor.h2")}</button>
              <button class="chip" type="button" data-send-to="checker" data-send-from="resizer">${t("tools.checker.h2")}</button>
              <button class="chip chip-adpilot" type="button" data-send-to="adpilot" data-send-from="resizer">${t("tools.sendToAdpilot")}</button>
            </div>
          </div>
        ` : `
          <label class="removebg-upload" for="resizer-file">
            ${state.resizerPreview
              ? `<img class="removebg-preview" src="${state.resizerPreview}" alt="" />`
              : `<span class="removebg-placeholder">
                  <span class="removebg-icon">⬛</span>
                  <b>${t("tools.resizer.upload")}</b>
                  <small>${t("tools.resizer.uploadHint")}</small>
                </span>`}
          </label>
          <input id="resizer-file" type="file" accept="image/*" style="display:none" data-resizer-input />
        `}
      </div>

      <div class="tool-card" id="tool-checker">
        <div class="tool-card-head">
          <h2>${t("tools.checker.h2")}</h2>
          <span class="eyebrow">${t("tools.checker.free")}</span>
        </div>
        <p class="tool-card-desc">${t("tools.checker.desc")}</p>
        ${state.checkerResult ? (() => {
          const r = state.checkerResult;
          const ok = (v) => `<span class="check-ok">✓</span> ${v}`;
          const fail = (v) => `<span class="check-fail">✗</span> ${v}`;
          const dim = `${r.width}×${r.height}px`;
          const sizeMb = (r.fileSize / 1024 / 1024).toFixed(1) + " MB";
          const markets = [
            {
              name: "Wildberries",
              rows: [
                [r.width >= 1080 && r.height >= 1080, t("tools.checker.minSize", { n: "1080×1080" }), dim],
                [r.isSquare, t("tools.checker.ratio"), r.ratio],
                [r.fileSize < 10 * 1024 * 1024, t("tools.checker.fileSize", { n: "10 MB" }), sizeMb],
                [r.bgLight, t("tools.checker.bgLight"), r.bgLight ? t("tools.checker.bgOk") : t("tools.checker.bgWarn")],
              ],
            },
            {
              name: "Ozon",
              rows: [
                [r.width >= 900 && r.height >= 900, t("tools.checker.minSize", { n: "900×900" }), dim],
                [r.isSquare, t("tools.checker.ratio"), r.ratio],
                [r.fileSize < 10 * 1024 * 1024, t("tools.checker.fileSize", { n: "10 MB" }), sizeMb],
              ],
            },
            {
              name: "Avito",
              rows: [
                [r.width >= 640, t("tools.checker.minWidth", { n: "640px" }), `${r.width}px`],
                [r.fileSize < 25 * 1024 * 1024, t("tools.checker.fileSize", { n: "25 MB" }), sizeMb],
              ],
            },
          ];
          return `
            <div class="checker-preview-row">
              <img class="checker-thumb" src="${state.checkerPreview}" alt="" />
              <div class="checker-meta">
                <b>${dim}</b>
                <span>${sizeMb} · ${r.format.replace("image/","").toUpperCase()}</span>
              </div>
            </div>
            <div class="checker-markets">
              ${markets.map(m => `
                <div class="checker-market">
                  <div class="checker-market-name">${m.name}</div>
                  ${m.rows.map(([pass, label, value]) => `
                    <div class="checker-row">
                      ${pass ? ok(label) : fail(label)}
                      <span class="checker-value">${value}</span>
                    </div>`).join("")}
                </div>`).join("")}
            </div>
            <button class="button secondary block" type="button" data-checker-reset style="margin-top:12px">${t("tools.checker.again")}</button>
          `;
        })() : `
          <label class="removebg-upload" for="checker-file">
            ${state.checkerPreview
              ? `<img class="removebg-preview" src="${state.checkerPreview}" alt="" />`
              : `<span class="removebg-placeholder">
                  <span class="removebg-icon">✓</span>
                  <b>${t("tools.checker.upload")}</b>
                  <small>${t("tools.checker.uploadHint")}</small>
                </span>`}
          </label>
          <input id="checker-file" type="file" accept="image/*" style="display:none" data-checker-input />
        `}
      </div>

      <div class="tool-card" id="tool-compressor">
        <div class="tool-card-head">
          <h2>${t("tools.compressor.h2")}</h2>
          <span class="eyebrow">${t("tools.compressor.free")}</span>
        </div>
        <p class="tool-card-desc">${t("tools.compressor.desc")}</p>
        ${state.compressorPreview ? `
          ${state.compressorResult && !state.compressorEditing ? `
            <div class="compressor-stats">
              <div class="compressor-stat">
                <span class="compressor-stat-label">${t("tools.compressor.before")}</span>
                <span class="compressor-stat-val">${(state.compressorOrigSize / 1024).toFixed(0)} KB</span>
              </div>
              <span class="compressor-arrow">→</span>
              <div class="compressor-stat">
                <span class="compressor-stat-label">${t("tools.compressor.after")}</span>
                <span class="compressor-stat-val compressor-green">${(state.compressorResultSize / 1024).toFixed(0)} KB</span>
              </div>
              <span class="compressor-saved">-${Math.round((1 - state.compressorResultSize / state.compressorOrigSize) * 100)}%</span>
            </div>
            <img class="tool-result-img" src="${state.compressorResult}" alt="compressed" />
            <div class="tool-actions">
              <a class="button" href="${state.compressorResult}" download="compressed.jpg">${t("tools.compressor.download")}</a>
              <button class="button secondary" type="button" data-compressor-edit>${t("tools.compressor.edit")}</button>
            </div>
            <button class="button secondary block" type="button" data-compressor-reset style="margin-top:8px">${t("tools.compressor.again")}</button>
          ` : `
            <img class="removebg-preview" src="${state.compressorPreview}" alt="" style="width:100%;border-radius:12px;margin-bottom:12px" />
            <div class="compressor-quality-row">
              <label class="wm-label">${t("tools.compressor.quality")} ${state.compressorQuality}%</label>
              <input class="compressor-slider" type="range" min="40" max="95" step="5" value="${state.compressorQuality}" data-compressor-quality />
            </div>
            <button class="button gold block" type="button" data-compressor-apply style="margin-top:12px">${t("tools.compressor.apply")}</button>
          `}
        ` : `
          <label class="removebg-upload" for="compressor-file">
            <span class="removebg-placeholder"><span class="removebg-icon">↓</span><b>${t("tools.compressor.upload")}</b><small>${t("tools.compressor.uploadHint")}</small></span>
          </label>
          <input id="compressor-file" type="file" accept="image/*" style="display:none" data-compressor-input />
        `}
      </div>

      </div>
    </div>
  </div>`;
}

function contactPage() {
  const emailValue = state.contactDraft.email || state.user?.email || "";
  const selected = CONTACT_REASONS.some((item) => item.id === state.contactDraft.reason) ? state.contactDraft.reason : "contact";
  const selectedReason = CONTACT_REASONS.find((item) => item.id === selected) || CONTACT_REASONS[1];

  return `
    <main class="page contact-page">
      <section class="contact-section">
        <div class="contact-copy">
          <div class="eyebrow">${t("contact.eyebrow")}</div>
          <h1>${t("contact.h1")}</h1>
          <p>${t("contact.p")}</p>
          <div class="contact-reason-preview">
            <strong>${t(selectedReason.labelKey)}</strong>
            <span>${t(selectedReason.subKey)}</span>
          </div>
        </div>
        <form class="panel contact-form" id="contact-form">
          ${state.contactSent ? `<div class="notice">${t("contact.success")}</div>` : ""}
          ${state.contactError ? `<div class="notice error">${escapeHtml(state.contactError)}</div>` : ""}
          <div class="field">
            <label for="contact-email">${t("contact.email")}</label>
            <input class="input" id="contact-email" name="email" type="email" autocomplete="email" required placeholder="you@brand.com" value="${escapeHtml(emailValue)}" />
          </div>
          <div class="field">
            <label for="contact-reason">${t("contact.reason")}</label>
            <select class="select" id="contact-reason" name="reason">
              ${CONTACT_REASONS.map((item) => `<option value="${item.id}" ${item.id === selected ? "selected" : ""}>${t(item.labelKey)}</option>`).join("")}
            </select>
            <small>${t(selectedReason.subKey)}</small>
          </div>
          <div class="field">
            <label for="contact-message">${t("contact.message")}</label>
            <textarea class="textarea contact-textarea" id="contact-message" name="message" required minlength="10" maxlength="4000" placeholder="${t("contact.placeholder")}">${escapeHtml(state.contactDraft.message)}</textarea>
          </div>
          <button class="button gold block" type="submit" ${state.contactSending ? "disabled" : ""}>${state.contactSending ? t("contact.sending") : t("contact.send")}</button>
        </form>
      </section>
    </main>`;
}

if (typeof window !== "undefined") { window.__state = state; window.__render = render; }
function render(options = {}) {
  const page = state.route === "studio" ? studioPage()
    : state.route === "adpilot" ? copyStudioPage()
    : state.route === "examples" ? examplesPage()
    : state.route === "pricing" ? pricingPage()
    : state.route === "account" ? accountPage()
    : state.route === "history" ? historyPage()
    : state.route === "tools" ? toolsPage()
    : state.route === "contact" ? contactPage()
    : homePage();
  document.title = t(`title.${state.route}`) || t("title.home");
  const motionKey = `${state.route}:${state.authMode || "none"}`;
  const shouldAnimateEntrance = options.motion ?? motionKey !== lastMotionKey;
  app.innerHTML = `<div class="shell">${nav()}${offlineBanner()}${pwaInstallBanner()}${page}${footer()}${mobileTabBar()}${authModal()}</div>`;
  bind();
  runMotion({ entrance: shouldAnimateEntrance });
  prepareDemoVideos();
  lastMotionKey = motionKey;
}

function prepareDemoVideos() {
  const videos = [...document.querySelectorAll(".landing-media video, .example-media video, .seller-step-media video, .showcase-video-card video, .video-sequence-card video, .triplet-card video")];
  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const play = () => {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    };

    if (video.readyState >= 2) {
      requestAnimationFrame(play);
    } else {
      video.addEventListener("loadeddata", play, { once: true });
      video.addEventListener("canplay", play, { once: true });
    }
    video.addEventListener("click", play, { passive: true });
  });
}

["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, prepareDemoVideos, { once: true, passive: true });
});

function bind() {
  document.querySelectorAll("[data-route]").forEach(el => el.addEventListener("click", () => {
    if (el.dataset.route === "adpilot") { state.adpilotView = "tools"; state.marketplaceTab = "drafts"; }
    navigate(el.dataset.route);
  }));
  document.querySelectorAll("[data-contact-reason]").forEach(el => el.addEventListener("click", () => openContact(el.dataset.contactReason)));
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
  document.querySelectorAll("[data-auth]").forEach(el => el.addEventListener("click", () => {
    state.authMode = el.dataset.auth;
    state.authLoading = false;
    state.navMenuOpen = false;
    state.presetsOpen = false;
    render();
  }));
  document.querySelectorAll("[data-auth-channel]").forEach(el => el.addEventListener("click", () => { state.authChannel = el.dataset.authChannel; render({ motion: false }); }));
  document.querySelectorAll("[data-toggle-password]").forEach(el => el.addEventListener("click", () => togglePasswordVisibility(el)));
  document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", () => { state.authMode = null; state.authLoading = false; render(); }));
  document.querySelectorAll("[data-logout]").forEach(el => el.addEventListener("click", () => logout()));
  document.querySelectorAll("[data-copy-referral]").forEach(el => el.addEventListener("click", () => {
    const inp = document.getElementById("referral-link-input");
    if (inp) { inp.select(); navigator.clipboard.writeText(inp.value).catch(() => {}); }
    el.textContent = t("account.referralCopied");
    setTimeout(() => { el.textContent = t("account.referralCopy"); }, 2000);
  }));
  document.querySelectorAll("[data-plan]").forEach(el => el.addEventListener("click", () => choosePlan(el.dataset.plan)));
  document.querySelectorAll("[data-pack-id]").forEach(el => el.addEventListener("click", () => choosePack(el.dataset.packId)));
  document.querySelector("#auth-form")?.addEventListener("submit", submitAuth);
  document.querySelector("#verify-form")?.addEventListener("submit", submitVerification);
  document.querySelector("#forgot-form")?.addEventListener("submit", submitForgotPassword);
  document.querySelector("#reset-form")?.addEventListener("submit", submitResetPassword);
  document.querySelector("#contact-form")?.addEventListener("submit", submitContact);
  document.querySelector("#contact-reason")?.addEventListener("change", (event) => {
    const form = event.target.closest("form");
    state.contactDraft.reason = event.target.value;
    state.contactDraft.email = form?.elements.email?.value || state.contactDraft.email;
    state.contactDraft.message = form?.elements.message?.value || state.contactDraft.message;
    state.contactSent = false;
    state.contactError = "";
    render({ motion: false });
  });
  document.querySelector("#generate-form")?.addEventListener("submit", submitGeneration);
  document.querySelector("#copy-form")?.addEventListener("submit", submitCopyGeneration);
  document.querySelector("#copy-form")?.addEventListener("input", event => {
    if (activeContentFormMode() !== "wizard") syncContentFromForm(event.currentTarget);
  });
  document.querySelectorAll("[data-content-tool]").forEach(el => el.addEventListener("click", () => selectContentTool(el.dataset.contentTool)));
  document.querySelector("[data-adpilot-home]")?.addEventListener("click", () => {
    state.adpilotView = "tools";
    state.contentToolSlug = null;
    state.contentWizardStep = 0;
    render({ motion: false });
  });

  // Wizard event handlers
  document.querySelector("[data-wizard-next]")?.addEventListener("click", () => {
    const ta = document.querySelector("[data-wizard-field]");
    if (!ta?.value?.trim()) { ta?.focus(); return; }
    state.contentDraft = { ...state.contentDraft, [ta.dataset.wizardField]: ta.value };
    state.contentWizardStep++;
    render({ motion: false });
    setTimeout(() => document.querySelector("[data-wizard-field]")?.focus(), 50);
  });
  document.querySelectorAll("[data-wizard-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.contentWizardStep = parseInt(btn.dataset.wizardEdit, 10);
      render({ motion: false });
      setTimeout(() => document.querySelector("[data-wizard-field]")?.focus(), 50);
    });
  });
  document.querySelector("[data-wizard-generate]")?.addEventListener("click", () => {
    const ta = document.querySelector("[data-wizard-field]");
    if (!ta?.value?.trim()) { ta?.focus(); return; }
    state.contentDraft = { ...state.contentDraft, [ta.dataset.wizardField]: ta.value };
    document.querySelector("#copy-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  });

  document.querySelectorAll("[data-content-language]").forEach(el => el.addEventListener("click", () => selectContentLanguage(el.dataset.contentLanguage)));
  document.querySelector("[data-copy-output]")?.addEventListener("click", copyContentOutput);
  document.querySelector("[data-fill-example]")?.addEventListener("click", fillExample);
  document.querySelector("[data-save-draft-local]")?.addEventListener("click", saveOutputAsDraft);
  document.querySelectorAll("[data-variation]").forEach(el => el.addEventListener("click", () => {
    const idx = Number(el.dataset.variation);
    state.contentOutput = state.contentVariations[idx] || "";
    render({ motion: false });
  }));
  document.querySelector("[data-adjust-input]")?.addEventListener("input", (e) => {
    state.contentAdjustInstruction = e.target.value;
  });
  document.querySelector("[data-adjust-submit]")?.addEventListener("click", () => {
    document.querySelector("#copy-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  });
  document.querySelectorAll("[data-copy-saved]").forEach(el => el.addEventListener("click", () => copySavedOutput(el.dataset.copySaved)));
  document.querySelectorAll("[data-delete-saved]").forEach(el => el.addEventListener("click", () => clearSavedOutput(el.dataset.deleteSaved)));
  document.querySelectorAll("[data-adpilot-tools]").forEach(el => el.addEventListener("click", () => {
    state.adpilotView = "tools";
    render({ motion: false });
  }));
  document.querySelectorAll("[data-marketplace-tab]").forEach(el => el.addEventListener("click", () => {
    state.marketplaceTab = el.dataset.marketplaceTab || "overview";
    state.adpilotView = "marketplace";
    render({ motion: false });
  }));
  document.querySelector("#marketplace-connect-form")?.addEventListener("submit", submitMarketplaceConnection);
  document.querySelector("#marketplace-product-form")?.addEventListener("submit", submitMarketplaceProducts);
  document.querySelector("#marketplace-action-form")?.addEventListener("submit", submitMarketplaceAction);
  document.querySelector("#marketplace-connect-form")?.addEventListener("change", event => {
    syncMarketplaceConnectFromForm(event.currentTarget);
    if (event.target.name === "provider") selectMarketplaceProvider(state.marketplaceConnectDraft.provider);
  });
  document.querySelector("#marketplace-product-form")?.addEventListener("change", event => {
    syncMarketplaceProductFromForm(event.currentTarget);
    render({ motion: false });
  });
  document.querySelector("#marketplace-action-form")?.addEventListener("change", event => {
    if (event.target.name === "product_id") state.marketplaceSelectedProductId = event.target.value;
    if (event.target.name === "action_type") state.marketplaceActionType = event.target.value;
    render({ motion: false });
  });
  document.querySelectorAll("[data-marketplace-provider]").forEach(el => el.addEventListener("click", () => selectMarketplaceProvider(el.dataset.marketplaceProvider)));
  document.querySelectorAll("[data-marketplace-product]").forEach(el => el.addEventListener("click", () => { state.marketplaceSelectedProductId = el.dataset.marketplaceProduct; render({ motion: false }); }));
  document.querySelector("[data-refresh-marketplaces]")?.addEventListener("click", async () => { await loadMarketplaces(true); render({ motion: false }); });
  document.querySelectorAll("[data-approve-action]").forEach(el => el.addEventListener("click", () => marketplaceActionCommand(el.dataset.approveAction, "approve")));
  document.querySelectorAll("[data-publish-action]").forEach(el => el.addEventListener("click", () => marketplaceActionCommand(el.dataset.publishAction, "publish")));
  document.querySelectorAll("[data-generation-kind]").forEach(el => el.addEventListener("click", () => setGenerationKind(el.dataset.generationKind)));
  document.querySelectorAll("[data-app-mode]").forEach(el => el.addEventListener("click", () => setAppMode(el.dataset.appMode)));
  document.querySelectorAll("[data-look-scenario]").forEach(el => el.addEventListener("click", () => selectLookScenario(el.dataset.lookScenario)));
  document.querySelector("[data-look-scenario-next]")?.addEventListener("click", () => advanceLookScenario());
  document.querySelector("[data-look-scenario-next]")?.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      advanceLookScenario();
    }
  });
  document.querySelector("#generate-form")?.addEventListener("input", event => {
    if (event.target.type !== "file") syncDraftFromForm(event.currentTarget);
  });
  document.querySelector("#generate-form")?.addEventListener("change", event => {
    if (event.target.type !== "file") {
      syncDraftFromForm(event.currentTarget);
      if (event.target.id === "mode") render({ motion: false });
    }
  });
  document.querySelector("#marketplace")?.addEventListener("change", selectMarketplacePreset);
  document.querySelector("[data-toggle-brand]")?.addEventListener("click", toggleBrandPrefs);
  document.querySelector("[data-toggle-prompt]")?.addEventListener("click", togglePromptHelper);
  document.querySelector("[data-save-brand]")?.addEventListener("click", saveBrandPreferences);
  document.querySelector("[data-build-prompt]")?.addEventListener("click", buildPromptFromHelper);
  document.querySelectorAll("[data-variation]").forEach(el => el.addEventListener("click", () => regenerateVariation(el.dataset.variation)));
  document.querySelector("[data-goto-adpilot]")?.addEventListener("click", goToAdPilotWithContext);
  document.querySelector("[data-export]")?.addEventListener("click", exportGeneratedImage);
  document.querySelectorAll("[data-pack]").forEach(el => el.addEventListener("click", () => exportForPack(el.dataset.pack)));
  document.querySelectorAll("[data-history-id]").forEach(el => el.addEventListener("click", () => restoreHistoryItem(el.dataset.historyId)));
  document.querySelectorAll("[data-delete-history]").forEach(el => el.addEventListener("click", () => removeHistoryItem(el.dataset.deleteHistory)));
  document.querySelectorAll("[data-history-filter]").forEach(el => el.addEventListener("click", () => { state.historyFilter = el.dataset.historyFilter; render({ motion: false }); }));
  document.querySelector("[data-clear-history]")?.addEventListener("click", clearAllHistory);
  document.querySelectorAll("[data-share]").forEach(el => el.addEventListener("click", shareResult));
  document.querySelector("[data-install-pwa]")?.addEventListener("click", installPwa);
  document.querySelector("[data-dismiss-pwa]")?.addEventListener("click", dismissPwaInstall);
  document.querySelector("#image")?.addEventListener("change", selectImage);
  document.querySelectorAll("[data-toggle-lang]").forEach(el => el.addEventListener("click", toggleLang));
  document.querySelector("[data-brand-logo-input]")?.addEventListener("change", onBrandLogoSelect);
  document.querySelector("[data-quick-export]")?.addEventListener("click", e => exportForPack(e.currentTarget.dataset.quickExport));
  document.querySelectorAll("[data-benefit-index]").forEach(el => el.addEventListener("input", e => {
    const i = parseInt(e.target.dataset.benefitIndex);
    state.overlayBenefits[i] = e.target.value;
  }));
  document.querySelector("[data-brand-logo-clear]")?.addEventListener("click", clearBrandLogo);
  document.querySelectorAll("[data-overlay-mode]").forEach(el => el.addEventListener("click", () => {
    state.overlayMode = el.dataset.overlayMode;
    state.overlayInputValue = "";
    render({ motion: false });
  }));
  document.querySelector("[data-overlay-apply]")?.addEventListener("click", applyOverlay);
  document.querySelector("[data-overlay-cancel]")?.addEventListener("click", () => { state.overlayMode = null; render({ motion: false }); });
  document.querySelector("[data-overlay-clear]")?.addEventListener("click", () => { state.overlayImage = null; state.overlayMode = null; render({ motion: false }); });
  document.querySelector("#overlay-input")?.addEventListener("input", (e) => { state.overlayInputValue = e.target.value; });
  document.querySelector("[data-removebg-input]")?.addEventListener("change", onRemoveBgFileSelect);
  document.querySelector("[data-removebg-submit]")?.addEventListener("click", submitRemoveBg);
  document.querySelectorAll("[data-send-to]").forEach(el => el.addEventListener("click", () => {
    const from = el.dataset.sendFrom;
    let src = null;
    if (from === "removebg") src = state.removeBgComposed || state.removeBgResult;
    else if (from === "resizer") src = state.resizerResult;
    else if (from === "collage") src = state.collageResult;
    else if (from === "watermark") src = state.watermarkResult;
    else if (from === "promo") src = state.promoResult;
    else if (from === "compressor") src = state.compressorResult;
    if (!src) return;
    if (el.dataset.sendTo === "adpilot") {
      state.adpilotContextImage = src;
      state.contentToolSlug = null;
      navigate("adpilot");
      toast(t("adpilotLink.toast"));
    } else {
      sendToTool(el.dataset.sendTo, src);
    }
  }));
  document.querySelectorAll("[data-quick-adpilot]").forEach(el => el.addEventListener("click", () => {
    const product = document.querySelector("#adpilot-quick-product")?.value || "";
    quickGenerateAdPilot(el.dataset.quickAdpilot, product);
  }));
  document.querySelector("[data-adpilot-chat]")?.addEventListener("click", () => {
    openAdPilotChat(document.querySelector("#adpilot-quick-product")?.value || "");
  });
  document.querySelector("#ad-chat-form")?.addEventListener("submit", submitAdPilotChat);
  document.querySelector("[data-ad-chat-product]")?.addEventListener("input", (event) => {
    state.adChatProduct = event.target.value;
  });
  document.querySelectorAll("[data-ad-chat-suggestion]").forEach(el => el.addEventListener("click", () => {
    state.adChatDraft = el.dataset.adChatSuggestion || "";
    render({ motion: false });
    setTimeout(() => document.querySelector("#ad-chat-input")?.focus(), 30);
  }));
  document.querySelector("#adpilot-quick-product")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const product = e.target.value;
      quickGenerateAdPilot("ozon-wb-card", product);
    }
  });
  document.querySelector("[data-checker-input]")?.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      state.checkerFile = file;
      state.checkerPreview = ev.target.result;
      state.checkerResult = null;
      analyzeChecker(file, ev.target.result);
    };
    reader.readAsDataURL(file);
  });
  document.querySelector("[data-checker-reset]")?.addEventListener("click", resetChecker);

  // Collage
  document.querySelectorAll("[data-collage-layout]").forEach(el => el.addEventListener("click", () => {
    state.collageLayout = el.dataset.collageLayout;
    state.collageResult = null;
    render({ motion: false });
  }));
  document.querySelectorAll("[data-collage-input]").forEach(el => el.addEventListener("change", e => {
    const idx = parseInt(el.dataset.collageInput);
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      state.collageFiles[idx] = file;
      state.collagePreviews[idx] = ev.target.result;
      render({ motion: false });
    };
    reader.readAsDataURL(file);
  }));
  document.querySelectorAll("[data-collage-remove]").forEach(el => el.addEventListener("click", () => {
    const idx = parseInt(el.dataset.collageRemove);
    state.collageFiles.splice(idx, 1); state.collagePreviews.splice(idx, 1);
    state.collageResult = null; render({ motion: false });
  }));
  document.querySelector("[data-collage-build]")?.addEventListener("click", buildCollage);
  document.querySelector("[data-collage-reset]")?.addEventListener("click", resetCollage);

  // Promo Badge
  document.querySelector("[data-promo-input]")?.addEventListener("change", e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { state.promoFile = file; state.promoPreview = ev.target.result; state.promoResult = null; render({ motion: false }); applyPromoBadge(); };
    reader.readAsDataURL(file);
  });
  document.querySelector("[data-promo-text]")?.addEventListener("input", e => { state.promoText = e.target.value; applyPromoBadge(); });
  document.querySelectorAll("[data-promo-color]").forEach(el => el.addEventListener("click", () => { state.promoColor = el.dataset.promoColor; applyPromoBadge(); }));
  document.querySelector("[data-promo-color-pick]")?.addEventListener("input", e => { state.promoColor = e.target.value; applyPromoBadge(); });
  document.querySelectorAll("[data-promo-pos]").forEach(el => el.addEventListener("click", () => { state.promoPos = el.dataset.promoPos; applyPromoBadge(); }));
  document.querySelector("[data-promo-reset]")?.addEventListener("click", resetPromo);

  // Compressor
  document.querySelector("[data-compressor-input]")?.addEventListener("change", e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { state.compressorFile = file; state.compressorPreview = ev.target.result; state.compressorOrigSize = file.size; state.compressorResult = null; state.compressorEditing = false; render({ motion: false }); };
    reader.readAsDataURL(file);
  });
  document.querySelector("[data-compressor-quality]")?.addEventListener("input", e => { state.compressorQuality = parseInt(e.target.value); render({ motion: false }); });
  document.querySelector("[data-compressor-apply]")?.addEventListener("click", () => { state.compressorEditing = false; applyCompressor(); });
  document.querySelector("[data-compressor-edit]")?.addEventListener("click", () => { state.compressorEditing = true; render({ motion: false }); });
  document.querySelector("[data-compressor-reset]")?.addEventListener("click", resetCompressor);
  document.querySelector("[data-wm-input]")?.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      state.watermarkFile = file;
      state.watermarkPreview = ev.target.result;
      state.watermarkResult = null;
      render({ motion: false });
      if (state.watermarkText.trim()) applyWatermark();
    };
    reader.readAsDataURL(file);
  });
  document.querySelector("[data-wm-text]")?.addEventListener("input", e => { state.watermarkText = e.target.value; drawWatermarkPreview(); });
  document.querySelectorAll("[data-wm-pos]").forEach(el => el.addEventListener("click", () => { state.watermarkPos = el.dataset.wmPos; render({ motion: false }); drawWatermarkPreview(); }));
  document.querySelectorAll("[data-wm-opacity]").forEach(el => el.addEventListener("click", () => { state.watermarkOpacity = parseFloat(el.dataset.wmOpacity); render({ motion: false }); drawWatermarkPreview(); }));
  document.querySelectorAll("[data-wm-color]").forEach(el => el.addEventListener("click", () => { state.watermarkDark = el.dataset.wmColor === "dark"; render({ motion: false }); drawWatermarkPreview(); }));
  document.querySelector("[data-wm-apply]")?.addEventListener("click", () => {
    state.watermarkText = document.querySelector("[data-wm-text]")?.value || state.watermarkText;
    const canvas = document.getElementById("wm-preview-canvas");
    if (canvas) { state.watermarkResult = canvas.toDataURL("image/jpeg", 0.92); render({ motion: false }); }
    else applyWatermark();
  });
  document.querySelector("[data-wm-edit]")?.addEventListener("click", () => { state.watermarkResult = null; render({ motion: false }); drawWatermarkPreview(); });
  document.querySelector("[data-wm-reset]")?.addEventListener("click", resetWatermark);
  drawWatermarkPreview();
  document.querySelector("[data-resizer-input]")?.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      state.resizerFile = file;
      state.resizerPreview = ev.target.result;
      state.resizerResult = null;
      applyResizer();
    };
    reader.readAsDataURL(file);
  });
  document.querySelectorAll("[data-resizer-fmt]").forEach(el => el.addEventListener("click", () => {
    state.resizerFormat = el.dataset.resizerFmt;
    state.resizerResult = null;
    render({ motion: false });
    if (state.resizerPreview) applyResizer();
  }));
  document.querySelector("[data-resizer-reset]")?.addEventListener("click", resetResizer);
  document.querySelector("[data-removebg-reset]")?.addEventListener("click", resetRemoveBg);
  document.querySelector("[data-toggle-shadow]")?.addEventListener("click", () => {
    state.removeBgShadow = !state.removeBgShadow;
    recomposeRemoveBg();
  });
  document.querySelector("[data-use-in-studio]")?.addEventListener("click", () => {
    const dataUrl = state.removeBgComposed || state.removeBgResult;
    if (!dataUrl) return;
    state.selectedImage = dataUrl.split(",")[1];
    state.selectedImageName = state.removeBgBgColor ? "product-bg.jpg" : "product-no-bg.png";
    state.batchQueue = [];
    navigate("studio");
    toast(t("tools.useInStudioToast"));
  });
  document.querySelectorAll("[data-bg-preset]").forEach(el => el.addEventListener("click", () => {
    const color = el.dataset.bgPreset === "none" ? null : el.dataset.bgPreset;
    applyRemoveBgBackground(color);
  }));
  document.querySelector("[data-bg-custom]")?.addEventListener("input", e => applyRemoveBgBackground(e.target.value));
}

function canvasRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawOverlayOnCanvas(type, value) {
  return new Promise((resolve, reject) => {
    const src = state.generatedImage;
    if (!src) return reject(new Error("No image"));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const s = img.naturalWidth / 1000;

      if (type === "price") {
        const text = value || "0 ₽";
        const fontSize = Math.round(52 * s);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        const tw = ctx.measureText(text).width;
        const pad = 24 * s;
        const bw = tw + pad * 2;
        const bh = fontSize * 1.55;
        const bx = 20 * s;
        const by = img.naturalHeight - bh - 20 * s;
        const r = 14 * s;
        ctx.shadowColor = "rgba(0,0,0,.30)";
        ctx.shadowBlur = 18 * s;
        ctx.shadowOffsetY = 4 * s;
        ctx.fillStyle = "white";
        canvasRoundRect(ctx, bx, by, bw, bh, r);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "#c7a460";
        ctx.lineWidth = 3 * s;
        canvasRoundRect(ctx, bx, by, bw, bh, r);
        ctx.stroke();
        ctx.fillStyle = "#1a1a1a";
        ctx.textBaseline = "middle";
        ctx.fillText(text, bx + pad, by + bh / 2);
      } else if (type === "sale") {
        const raw = value ? (value.includes("%") ? value : `−${value}%`) : "SALE";
        const r = Math.round(88 * s);
        const cx = img.naturalWidth - r - 20 * s;
        const cy = r + 20 * s;
        ctx.shadowColor = "rgba(0,0,0,.28)";
        ctx.shadowBlur = 18 * s;
        ctx.fillStyle = "#e63946";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${Math.round(40 * s)}px Arial, sans-serif`;
        ctx.fillText(raw, cx, cy);
        ctx.textAlign = "left";
      }
      if (type === "benefits" && Array.isArray(value)) {
        const lines = value.filter(v => v.trim());
        if (lines.length) {
          const fontSize = Math.round(34 * s);
          const iconR = Math.round(20 * s);
          const padX = 20 * s;
          const padY = 12 * s;
          const rowH = Math.max(fontSize * 1.5, iconR * 2 + padY * 2);
          const gap = 10 * s;
          const totalH = lines.length * rowH + (lines.length - 1) * gap;
          let startY = (img.naturalHeight - totalH) / 2;
          const startX = 20 * s;
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          for (const line of lines) {
            const textW = ctx.measureText(line).width;
            const bw = padX + iconR * 2 + 10 * s + textW + padX;
            const r = rowH / 2;
            ctx.shadowColor = "rgba(0,0,0,0.22)";
            ctx.shadowBlur = 14 * s;
            ctx.fillStyle = "white";
            canvasRoundRect(ctx, startX, startY, bw, rowH, r);
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            const iconX = startX + padX + iconR;
            const iconY = startY + rowH / 2;
            ctx.fillStyle = "#c7a460";
            ctx.beginPath();
            ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.round(iconR * 1.1)}px Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("✓", iconX, iconY);
            ctx.textAlign = "left";
            ctx.fillStyle = "#1a1a1a";
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            ctx.fillText(line, startX + padX + iconR * 2 + 10 * s, iconY);
            startY += rowH + gap;
          }
        }
      }
      if (type === "logo" && state.brandPrefs.brand_logo) {
        const logo = new Image();
        logo.onload = () => {
          const maxW = Math.round(img.naturalWidth * 0.22);
          const scale2 = Math.min(maxW / logo.naturalWidth, maxW / logo.naturalHeight);
          const lw = logo.naturalWidth * scale2;
          const lh = logo.naturalHeight * scale2;
          const lx = img.naturalWidth - lw - 20 * s;
          const ly = img.naturalHeight - lh - 20 * s;
          ctx.globalAlpha = 0.92;
          ctx.drawImage(logo, lx, ly, lw, lh);
          ctx.globalAlpha = 1;
          resolve(canvas.toDataURL("image/jpeg", 0.92));
        };
        logo.onerror = () => resolve(canvas.toDataURL("image/jpeg", 0.92));
        logo.src = state.brandPrefs.brand_logo;
        return;
      }
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

async function applyOverlay() {
  if (!state.overlayMode || !state.generatedImage || state.overlayApplying) return;
  state.overlayApplying = true;
  render({ motion: false });
  try {
    const value = state.overlayMode === "benefits" ? state.overlayBenefits : state.overlayInputValue.trim();
    state.overlayImage = await drawOverlayOnCanvas(state.overlayMode, value);
    state.overlayMode = null;
    toast(t("quickEdit.done"));
  } catch (err) {
    toast(err.message);
  } finally {
    state.overlayApplying = false;
    render({ motion: false });
  }
}

function onRemoveBgFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  state.removeBgFile = file;
  state.removeBgResult = null;
  state.removeBgError = "";
  const reader = new FileReader();
  reader.onload = (e) => { state.removeBgPreview = e.target.result; render({ motion: false }); };
  reader.readAsDataURL(file);
}


async function submitRemoveBg() {
  if (!state.removeBgFile || state.removeBgLoading) return;
  state.removeBgLoading = true;
  state.removeBgProgress = "";
  state.removeBgError = "";
  render({ motion: false });
  try {
    const { removeBackground } = await import("@imgly/background-removal");
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const blob = await removeBackground(state.removeBgFile, {
      model: isMobile ? "isnet_quint8" : "isnet",
      publicPath: imglyPublicPath(),
      progress: (key, current, total) => {
        if (total > 0 && current < total) {
          const pct = Math.round((current / total) * 100);
          const label = key.includes("fetch") ? t("tools.removeBg.progressDownload") : t("tools.removeBg.progressRun");
          state.removeBgProgress = `${label} ${pct}%`;
          render({ motion: false });
        }
      },
    });
    const dataUrl = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
    state.removeBgResult = dataUrl;
    sessionStorage.setItem("domstudio_removebg_result", dataUrl);
    state.removeBgPreview = null;
    state.removeBgFile = null;
    state.removeBgProgress = "";
    toast(t("tools.removeBg.done"));
  } catch (err) {
    const isOom = /out of memory/i.test(err.message);
    const msg = isOom ? t("tools.removeBg.errorOom") : err.message;
    state.removeBgError = msg;
    toast(msg);
  } finally {
    state.removeBgLoading = false;
    render({ motion: false });
  }
}

function onBrandLogoSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 300;
      const scale = Math.min(1, MAX / img.naturalWidth, MAX / img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/png");
      state.brandPrefs = { ...state.brandPrefs, brand_logo: compressed };
      saveBrandPrefs(state.brandPrefs);
      toast(t("studio.brandLogoSaved"));
      render({ motion: false });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearBrandLogo() {
  state.brandPrefs = { ...state.brandPrefs, brand_logo: "" };
  saveBrandPrefs(state.brandPrefs);
  render({ motion: false });
}

async function applyResizer() {
  if (!state.resizerPreview) return;
  const fmt = RESIZER_FORMATS.find(f => f.id === state.resizerFormat);
  if (!fmt) return;
  const img = new Image();
  img.src = state.resizerPreview;
  await new Promise(r => { img.onload = r; });
  const canvas = document.createElement("canvas");
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, fmt.w, fmt.h);
  const scale = Math.min(fmt.w / img.naturalWidth, fmt.h / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, (fmt.w - sw) / 2, (fmt.h - sh) / 2, sw, sh);
  state.resizerResult = canvas.toDataURL("image/jpeg", 0.92);
  render({ motion: false });
}

const COLLAGE_LAYOUTS = [
  { id: "2x1", label: "2 фото", cols: 2, rows: 1 },
  { id: "1+2", label: "1+2", cols: null, rows: null },
  { id: "2x2", label: "4 фото", cols: 2, rows: 2 },
];

function buildCollage() {
  const previews = state.collagePreviews;
  if (previews.length < 2) return;
  const layout = state.collageLayout;
  const SIZE = 1080;
  const GAP = 6;
  let cols, rows;
  if (layout === "2x1") { cols = 2; rows = 1; }
  else if (layout === "1+2") { cols = 3; rows = 2; }
  else { cols = 2; rows = 2; }
  const canvas = document.createElement("canvas");
  canvas.width = SIZE; canvas.height = layout === "2x1" ? SIZE / 2 + GAP : SIZE;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; });
  Promise.all(previews.slice(0, layout === "2x2" ? 4 : layout === "1+2" ? 3 : 2).map(loadImg)).then(imgs => {
    if (layout === "2x1") {
      const w = (SIZE - GAP) / 2; const h = SIZE / 2;
      imgs.forEach((img, i) => {
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const sw = img.naturalWidth * scale; const sh = img.naturalHeight * scale;
        const sx = (w - sw) / 2; const sy = (h - sh) / 2;
        ctx.drawImage(img, sx + i * (w + GAP), sy, sw, sh);
      });
    } else if (layout === "1+2") {
      const bigW = Math.round(SIZE * 0.6) - GAP / 2;
      const smW = SIZE - bigW - GAP;
      const smH = (SIZE - GAP) / 2;
      const draw = (img, x, y, w, h) => {
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const sw = img.naturalWidth * scale; const sh = img.naturalHeight * scale;
        ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
      };
      draw(imgs[0], 0, 0, bigW, SIZE);
      if (imgs[1]) draw(imgs[1], bigW + GAP, 0, smW, smH);
      if (imgs[2]) draw(imgs[2], bigW + GAP, smH + GAP, smW, smH);
    } else {
      const w = (SIZE - GAP) / 2; const h = (SIZE - GAP) / 2;
      imgs.forEach((img, i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const sw = img.naturalWidth * scale; const sh = img.naturalHeight * scale;
        ctx.drawImage(img, col * (w + GAP) + (w - sw) / 2, row * (h + GAP) + (h - sh) / 2, sw, sh);
      });
    }
    state.collageResult = canvas.toDataURL("image/jpeg", 0.93);
    render({ motion: false });
  });
}

function resetCollage() {
  state.collageFiles = []; state.collagePreviews = []; state.collageResult = null;
  render({ motion: false });
}

async function applyPromoBadge() {
  if (!state.promoPreview) return;
  const img = new Image();
  img.src = state.promoPreview;
  await new Promise(r => { img.onload = r; });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const r = Math.round(Math.min(canvas.width, canvas.height) * 0.14);
  const pad = Math.round(r * 0.55);
  const pos = state.promoPos;
  const cx = pos.includes("right") ? canvas.width - r - pad : r + pad;
  const cy = pos.includes("bottom") ? canvas.height - r - pad : r + pad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = state.promoColor;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  const fontSize = Math.round(r * (state.promoText.length > 4 ? 0.36 : 0.44));
  ctx.font = `800 ${fontSize}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(state.promoText, cx, cy);
  state.promoResult = canvas.toDataURL("image/jpeg", 0.93);
  render({ motion: false });
}

function resetPromo() {
  state.promoFile = null; state.promoPreview = null; state.promoResult = null;
  render({ motion: false });
}

async function applyCompressor() {
  if (!state.compressorPreview) return;
  const img = new Image();
  img.src = state.compressorPreview;
  await new Promise(r => { img.onload = r; });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  canvas.getContext("2d").drawImage(img, 0, 0);
  const dataUrl = canvas.toDataURL("image/jpeg", state.compressorQuality / 100);
  const byteStr = dataUrl.split(",")[1];
  state.compressorResult = dataUrl;
  state.compressorResultSize = Math.round(byteStr.length * 0.75);
  render({ motion: false });
}

function resetCompressor() {
  state.compressorFile = null; state.compressorPreview = null;
  state.compressorResult = null; state.compressorOrigSize = 0; state.compressorResultSize = 0;
  render({ motion: false });
}

async function sendToTool(toolId, dataUrl) {
  if (toolId === "resizer") {
    state.resizerPreview = dataUrl; state.resizerResult = null;
    render({ motion: false }); applyResizer();
  } else if (toolId === "watermark") {
    state.watermarkPreview = dataUrl; state.watermarkResult = null;
    render({ motion: false });
  } else if (toolId === "checker") {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const fakeFile = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
    state.checkerPreview = dataUrl; state.checkerResult = null;
    analyzeChecker(fakeFile, dataUrl);
  } else if (toolId === "collage") {
    const maxSlots = state.collageLayout === "2x1" ? 2 : state.collageLayout === "1+2" ? 3 : 4;
    if (state.collagePreviews.length < maxSlots) {
      state.collagePreviews.push(dataUrl);
      state.collageFiles.push(null);
    } else {
      state.collagePreviews = [dataUrl];
      state.collageFiles = [null];
    }
    state.collageResult = null;
    render({ motion: false });
  } else if (toolId === "promo") {
    state.promoPreview = dataUrl; state.promoResult = null;
    render({ motion: false });
  } else if (toolId === "compressor") {
    state.compressorPreview = dataUrl; state.compressorResult = null;
    const res = await fetch(dataUrl); const blob = await res.blob();
    state.compressorOrigSize = blob.size;
    render({ motion: false });
  }
  setTimeout(() => document.getElementById(`tool-${toolId}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
}

async function analyzeChecker(file, dataUrl) {
  const img = new Image();
  img.src = dataUrl;
  await new Promise(r => { img.onload = r; });
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const g = gcd(w, h);
  const ratio = `${w/g}:${h/g}`;
  const isSquare = w === h;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const sampleCorners = (px) => {
    const pts = [[px,px],[w-px,px],[px,h-px],[w-px,h-px]];
    let r=0,g2=0,b=0;
    for (const [x,y] of pts) {
      const d = ctx.getImageData(x-2,y-2,4,4).data;
      let cr=0,cg=0,cb=0;
      for (let i=0;i<d.length;i+=4){cr+=d[i];cg+=d[i+1];cb+=d[i+2];}
      const n=d.length/4; r+=cr/n; g2+=cg/n; b+=cb/n;
    }
    return { r:r/4, g:g2/4, b:b/4 };
  };
  const avg = sampleCorners(6);
  const bgLight = avg.r > 215 && avg.g > 215 && avg.b > 215;
  state.checkerResult = { width: w, height: h, fileSize: file.size, format: file.type || "image/jpeg", ratio, isSquare, bgLight };
  render({ motion: false });
}

function resetChecker() {
  state.checkerFile = null;
  state.checkerPreview = null;
  state.checkerResult = null;
  render({ motion: false });
}

function drawWatermarkPreview() {
  const canvas = document.getElementById("wm-preview-canvas");
  if (!canvas || !state.watermarkPreview) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const text = state.watermarkText.trim();
    if (text) {
      const s = img.naturalWidth / 1000;
      const fontSize = Math.round(38 * s);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      const tw = ctx.measureText(text).width;
      const pad = 30 * s;
      ctx.globalAlpha = state.watermarkOpacity;
      ctx.fillStyle = state.watermarkDark ? "#1a1a1a" : "#ffffff";
      ctx.shadowColor = state.watermarkDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 10 * s;
      ctx.textBaseline = "alphabetic";
      const positions = {
        "top-left":     [pad, pad + fontSize],
        "top-right":    [canvas.width - tw - pad, pad + fontSize],
        "center":       [(canvas.width - tw) / 2, (canvas.height + fontSize) / 2],
        "bottom-left":  [pad, canvas.height - pad],
        "bottom-right": [canvas.width - tw - pad, canvas.height - pad],
      };
      const [x, y] = positions[state.watermarkPos] || positions["bottom-right"];
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;
      ctx.shadowColor = "transparent";
    }
  };
  img.src = state.watermarkPreview;
}

async function applyWatermark() {
  if (!state.watermarkPreview || !state.watermarkText.trim()) return;
  const img = new Image();
  img.src = state.watermarkPreview;
  await new Promise(r => { img.onload = r; });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const s = img.naturalWidth / 1000;
  const fontSize = Math.round(38 * s);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  const text = state.watermarkText;
  const tw = ctx.measureText(text).width;
  const pad = 30 * s;
  ctx.globalAlpha = state.watermarkOpacity;
  ctx.fillStyle = state.watermarkDark ? "#1a1a1a" : "#ffffff";
  ctx.shadowColor = state.watermarkDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10 * s;
  ctx.textBaseline = "alphabetic";
  const positions = {
    "top-left":     [pad, pad + fontSize],
    "top-right":    [canvas.width - tw - pad, pad + fontSize],
    "center":       [(canvas.width - tw) / 2, (canvas.height + fontSize) / 2],
    "bottom-left":  [pad, canvas.height - pad],
    "bottom-right": [canvas.width - tw - pad, canvas.height - pad],
  };
  const [x, y] = positions[state.watermarkPos] || positions["bottom-right"];
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
  ctx.shadowColor = "transparent";
  state.watermarkResult = canvas.toDataURL("image/jpeg", 0.92);
  render({ motion: false });
}

function resetWatermark() {
  state.watermarkFile = null;
  state.watermarkPreview = null;
  state.watermarkText = "";
  state.watermarkResult = null;
  render({ motion: false });
}

function resetResizer() {
  state.resizerFile = null;
  state.resizerPreview = null;
  state.resizerResult = null;
  render({ motion: false });
}

function recomposeRemoveBg() {
  if (!state.removeBgResult) return;
  const hasBg = Boolean(state.removeBgBgColor);
  const hasShadow = state.removeBgShadow;
  if (!hasBg && !hasShadow) {
    state.removeBgComposed = null;
    render({ motion: false });
    return;
  }
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (hasBg) {
      ctx.fillStyle = state.removeBgBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (hasShadow) {
      const cx = canvas.width / 2;
      const sy = canvas.height * 0.89;
      const rx = canvas.width * 0.30;
      const ry = Math.round(canvas.width * 0.022);
      ctx.save();
      ctx.filter = `blur(${Math.round(canvas.width * 0.016)}px)`;
      ctx.fillStyle = "rgba(0,0,0,0.36)";
      ctx.beginPath();
      ctx.ellipse(cx, sy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.drawImage(img, 0, 0);
    state.removeBgComposed = canvas.toDataURL(hasBg ? "image/jpeg" : "image/png", 0.93);
    render({ motion: false });
  };
  img.src = state.removeBgResult;
}

function applyRemoveBgBackground(color) {
  state.removeBgBgColor = color || null;
  recomposeRemoveBg();
}

function resetRemoveBg() {
  state.removeBgFile = null;
  state.removeBgPreview = null;
  state.removeBgResult = null;
  state.removeBgBgColor = null;
  state.removeBgShadow = false;
  state.removeBgComposed = null;
  state.removeBgError = "";
  sessionStorage.removeItem("domstudio_removebg_result");
  render({ motion: false });
}

function toggleLang() {
  syncContentFromForm(document.querySelector("#copy-form"));
  syncMarketplaceConnectFromForm(document.querySelector("#marketplace-connect-form"));
  syncMarketplaceProductFromForm(document.querySelector("#marketplace-product-form"));
  const previous = state.lang;
  const next = state.lang === "ru" ? "en" : "ru";
  const previousDefaults = defaultsForLang(previous);
  const nextDefaults = defaultsForLang(next);
  state.contentDraft = replaceKnownDefaults(state.contentDraft, previousDefaults.draft, nextDefaults.draft);
  state.contentProfile = replaceKnownDefaults(state.contentProfile, previousDefaults.profile, nextDefaults.profile);
  state.marketplaceProductDraft = replaceKnownDefaults(state.marketplaceProductDraft, previousDefaults.product, nextDefaults.product);
  state.marketplaceConnectDraft = {
    ...state.marketplaceConnectDraft,
    display_name: state.marketplaceConnectDraft.display_name === previousDefaults.connection.display_name
      ? nextDefaults.connection.display_name
      : state.marketplaceConnectDraft.display_name,
  };
  state.lang = next;
  if (!state.contentOutputLanguageLocked) {
    state.contentOutputLanguage = next === "ru" ? "russian" : "english";
  }
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

function setAppMode(mode) {
  if (!["fast", "advanced"].includes(mode) || state.appMode === mode) return;
  syncDraftFromForm(document.querySelector("#generate-form"));
  syncWizardFieldFromDom();
  syncContentFromForm(document.querySelector("#copy-form"));
  state.appMode = mode;
  state.contentFormMode = mode === "advanced" ? "full" : "wizard";
  if (mode === "fast") state.contentWizardStep = 0;
  localStorage.setItem(APP_MODE_KEY, mode);
  render({ motion: false });
}

function selectLookScenario(id) {
  const currentIndex = Math.max(0, LOOK_SCENARIOS.findIndex((item) => item.id === state.selectedLookScenario));
  const selectedIndex = LOOK_SCENARIOS.findIndex((item) => item.id === id);
  if (selectedIndex === -1) return;
  state.selectedLookScenario = selectedIndex === currentIndex
    ? LOOK_SCENARIOS[(currentIndex + 1) % LOOK_SCENARIOS.length].id
    : id;
  render({ motion: false });
}

function advanceLookScenario() {
  const currentIndex = Math.max(0, LOOK_SCENARIOS.findIndex((item) => item.id === state.selectedLookScenario));
  state.selectedLookScenario = LOOK_SCENARIOS[(currentIndex + 1) % LOOK_SCENARIOS.length].id;
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
  document.querySelector(".nav")?.classList.toggle("menu-open", state.navMenuOpen);
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
    animateFrom(".proof-visual, .proof-stat, .mode-card, .step, .seller-step-card, .showcase-block", {
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
  const mode = resolvedGenerationMode(values);
  const marketplaceHint = marketplaceHintForMode(marketplace, mode, Boolean(state.selectedImage), Boolean(values.offer_text));
  const styleHint = truncate([
    styleTemplate.hint,
    marketplaceHint,
    values.offer_text ? `creative text/offer to place on the image: ${values.offer_text}` : "",
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
  state.formDraft.offer_text = values.offer_text || "";
  toast(t("toast.promptBuilt"));
}

const ANON_ADPILOT_KEY = "domstudio_adpilot_anon";
const ANON_ADPILOT_LIMIT = 5;

function getAnonAdpilotCount() {
  try { return parseInt(localStorage.getItem(ANON_ADPILOT_KEY) || "0", 10); } catch { return 0; }
}
function incAnonAdpilotCount() {
  try { localStorage.setItem(ANON_ADPILOT_KEY, String(getAnonAdpilotCount() + 1)); } catch {}
}

async function quickGenerateAdPilot(toolSlug, product) {
  if (!product.trim()) {
    document.querySelector("#adpilot-quick-product")?.focus();
    return;
  }
  const isAnon = !state.user;
  state.contentDraft = { ...state.contentDraft, product: product.trim() };
  state.contentToolSlug = toolSlug;
  state.contentOutput = "";
  state.contentNotice = "";
  state.contentGenerating = true;
  render({ motion: false });
  try {
    let result;
    if (isAnon) {
      result = await api("/content/generate/public", {
        method: "POST",
        body: JSON.stringify({
          tool_slug: toolSlug,
          input: { product: product.trim() },
          profile: {},
          output_language: state.contentOutputLanguage,
        }),
      });
    } else {
      const tool = currentContentTool();
      const cost = contentTokenCost(tool);
      if (state.user.tokens < cost) { toast(t("toast.requestFailed")); return; }
      result = await api("/content/generate", {
        method: "POST",
        body: JSON.stringify({
          tool_slug: toolSlug,
          input: { product: product.trim() },
          profile: state.contentProfile,
          output_language: state.contentOutputLanguage,
        }),
      });
      await loadUser();
    }
    state.contentOutput = result.output || "";
    state.contentVariations = [result.output, ...state.contentVariations].filter(Boolean).slice(0, 3);
    state.contentMeta = result;
    state.contentNotice = result.warning || t("copy.done");
    if (isAnon) incAnonAdpilotCount();
    toast(t("copy.done"));
  } catch (error) {
    toast(error.message);
  } finally {
    state.contentGenerating = false;
    render({ motion: false });
  }
}

function openAdPilotChat(product = "") {
  const cleanProduct = product.trim() || state.contentDraft.product || state.adChatProduct || "";
  state.adChatProduct = cleanProduct;
  state.contentDraft = { ...state.contentDraft, product: cleanProduct };
  state.adChatDraft = "";
  state.adChatError = "";
  state.adpilotView = "chat";
  state.contentToolSlug = null;
  render({ motion: false });
  setTimeout(() => document.querySelector("#ad-chat-input")?.focus(), 50);
}

async function submitAdPilotChat(event) {
  event.preventDefault();
  if (state.adChatSending) return;
  const form = event.currentTarget;
  const input = form.querySelector("#ad-chat-input");
  const message = (input?.value || "").trim();
  if (!message) {
    input?.focus();
    return;
  }

  const product = (document.querySelector("[data-ad-chat-product]")?.value || state.adChatProduct || "").trim();
  state.adChatProduct = product;
  state.contentDraft = { ...state.contentDraft, product };
  state.adChatDraft = "";
  state.adChatError = "";
  state.adChatSending = true;
  state.adChatMessages = [...state.adChatMessages, { role: "user", content: message }].slice(-10);
  render({ motion: false });

  try {
    const result = await api("/ad-chat", {
      method: "POST",
      body: JSON.stringify({
        product,
        language: state.lang === "en" ? "en" : "ru",
        messages: state.adChatMessages.slice(-10),
      }),
    });
    state.adChatMessages = [...state.adChatMessages, { role: "assistant", content: result.reply || "" }].filter((item) => item.content).slice(-10);
    state.adChatRemaining = Number.isFinite(result.remaining_free) ? result.remaining_free : state.adChatRemaining;
  } catch (error) {
    state.adChatError = error.message || t("toast.requestFailed");
  } finally {
    state.adChatSending = false;
    render({ motion: false });
  }
}

function goToAdPilotWithContext() {
  const subject = state.lastGenerationPayload?.subject || state.formDraft.subject || "";
  const marketplace = state.formDraft.marketplace || "wildberries";
  const toolMap = {
    wildberries: "ozon-wb-card",
    ozon: "ozon-wb-card",
    yandex: "product-description",
    avito: "avito-ad",
    instagram: "vk-post",
    story: "product-description",
    banner: "product-description",
  };
  state.contentDraft = { ...state.contentDraft, product: subject };
  state.contentToolSlug = toolMap[marketplace] || "ozon-wb-card";
  state.adpilotContextImage = state.generatedImage || null;
  state.adpilotView = "tools";
  state.route = "adpilot";
  toast(t("adpilotLink.toast"));
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
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
    toast(t("toast.downloaded", { name: EXPORT_SIZES[sizeId]?.label || sizeId }));
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

function openContact(reason = "contact") {
  const selected = CONTACT_REASONS.some((item) => item.id === reason) ? reason : "contact";
  state.contactDraft.reason = selected;
  state.contactSent = false;
  state.contactError = "";
  state.navMenuOpen = false;
  state.presetsOpen = false;
  location.hash = `contact?reason=${selected}`;
  if (state.route === "contact") render({ motion: false });
}

async function submitAuth(event) {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(event.currentTarget));
  const mode = state.authMode;
  const channel = state.authChannel;
  state.authLoading = true;
  render();
  try {
    if (channel === "phone") {
      const phoneBody = { phone: body.phone };
      if (state.pendingReferralCode) phoneBody.referral_code = state.pendingReferralCode;
      if (mode === "register") {
        await api("/auth/register/phone", { method: "POST", body: JSON.stringify(phoneBody) });
      } else {
        await api("/auth/login/phone", { method: "POST", body: JSON.stringify(phoneBody) });
      }
      state.verificationContact = body.phone;
      state.verificationKind = "phone";
      state.verificationReturnMode = mode;
      state.authMode = "verify";
      state.authLoading = false;
      toast(t("toast.codeSent"));
      render();
      return;
    }

    if (mode === "register") {
      if (state.pendingReferralCode) body.referral_code = state.pendingReferralCode;
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
    if (mode === "login" && channel === "email" && error.status === 403 && /not verified/i.test(error.message)) {
      try {
        await api("/auth/register/email", { method: "POST", body: JSON.stringify(body) });
        state.verificationContact = body.email;
        state.verificationKind = "email";
        state.verificationReturnMode = "login";
        state.authMode = "verify";
        state.authLoading = false;
        toast(t("toast.codeSent"));
        render();
        return;
      } catch (resendError) {
        toast(resendError.message);
      }
    } else {
      toast(error.message);
    }
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

async function submitContact(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = {
    email: String(form.get("email") || "").trim(),
    reason: String(form.get("reason") || "contact"),
    message: String(form.get("message") || "").trim(),
  };
  state.contactDraft = body;
  state.contactSending = true;
  state.contactSent = false;
  state.contactError = "";
  render({ motion: false });
  try {
    await api("/contact", { method: "POST", body: JSON.stringify(body) });
    state.contactSending = false;
    state.contactSent = true;
    state.contactDraft = { ...body, message: "" };
    toast(t("contact.success"));
  } catch (error) {
    state.contactSending = false;
    state.contactError = error.message;
    toast(error.message);
  } finally {
    render({ motion: false });
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

function syncContentFromForm(form) {
  if (!form) return;
  const data = new FormData(form);
  const nextDraft = { ...state.contentDraft };
  const nextProfile = { ...state.contentProfile };
  for (const [key, value] of data.entries()) {
    if (key.startsWith("profile_")) {
      nextProfile[key.replace("profile_", "")] = String(value || "");
    } else {
      nextDraft[key] = String(value || "");
    }
  }
  state.contentDraft = nextDraft;
  state.contentProfile = nextProfile;
}

function syncWizardFieldFromDom() {
  const ta = document.querySelector("[data-wizard-field]");
  if (!ta) return;
  state.contentDraft = { ...state.contentDraft, [ta.dataset.wizardField]: ta.value };
}

function fillExample() {
  const defaults = defaultsForLang(state.lang);
  state.contentDraft = { ...defaults.draft };
  state.contentProfile = { ...defaults.profile };
  render({ motion: false });
}

function saveOutputAsDraft() {
  if (!state.contentOutput) return;
  const tool = currentContentTool();
  const item = {
    id: Date.now(),
    text: state.contentOutput,
    tool: contentToolName(tool),
    date: new Date().toLocaleDateString(state.lang === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  };
  state.contentSavedOutputs = [item, ...state.contentSavedOutputs].slice(0, 20);
  localStorage.setItem("domstudio_saved_outputs", JSON.stringify(state.contentSavedOutputs));
  toast(t("copy.savedDraft"));
  render({ motion: false });
}

function clearSavedOutput(id) {
  state.contentSavedOutputs = state.contentSavedOutputs.filter((item) => item.id !== Number(id));
  localStorage.setItem("domstudio_saved_outputs", JSON.stringify(state.contentSavedOutputs));
  render({ motion: false });
}

function copySavedOutput(id) {
  const item = state.contentSavedOutputs.find((o) => o.id === Number(id));
  if (!item) return;
  navigator.clipboard.writeText(item.text).then(() => toast(t("copy.copied"))).catch(() => toast(t("toast.requestFailed")));
}

function selectContentTool(slug) {
  if (state.contentToolSlug === slug) return;
  if (activeContentFormMode() !== "wizard") syncContentFromForm(document.querySelector("#copy-form"));
  state.contentToolSlug = slug;
  state.contentNotice = "";
  state.contentWizardStep = 0;
  render({ motion: false });
}

function selectContentLanguage(language) {
  syncContentFromForm(document.querySelector("#copy-form"));
  state.contentOutputLanguage = language || (state.lang === "ru" ? "russian" : "english");
  state.contentOutputLanguageLocked = true;
  state.contentNotice = "";
  render({ motion: false });
}

function selectMarketplaceProvider(provider) {
  state.marketplaceSelectedProvider = provider || "wildberries";
  state.marketplaceConnectDraft.provider = state.marketplaceSelectedProvider;
  syncMarketplaceSelection();
  render({ motion: false });
}

function syncMarketplaceConnectFromForm(form) {
  if (!form) return;
  const data = new FormData(form);
  state.marketplaceConnectDraft = {
    provider: String(data.get("provider") || state.marketplaceSelectedProvider || "wildberries"),
    display_name: String(data.get("display_name") || ""),
    mode: String(data.get("mode") || "draft"),
    api_token: String(data.get("api_token") || ""),
    client_id: String(data.get("client_id") || ""),
    user_id: String(data.get("user_id") || ""),
  };
  state.marketplaceSelectedProvider = state.marketplaceConnectDraft.provider;
}

function syncMarketplaceProductFromForm(form) {
  if (!form) return;
  const data = new FormData(form);
  state.marketplaceSelectedConnectionId = String(data.get("connection_id") || state.marketplaceSelectedConnectionId || "");
  state.marketplaceProductDraft = {
    title: String(data.get("title") || ""),
    sku: String(data.get("sku") || ""),
    category: String(data.get("category") || ""),
    price: String(data.get("price") || ""),
    stock: String(data.get("stock") || ""),
    description: String(data.get("description") || ""),
  };
}

async function submitMarketplaceConnection(event) {
  event.preventDefault();
  syncMarketplaceConnectFromForm(event.currentTarget);
  state.marketplaceSaving = true;
  state.marketplaceNotice = "";
  render({ motion: false });
  try {
    const extra_config = {};
    if (state.marketplaceConnectDraft.user_id) extra_config.user_id = state.marketplaceConnectDraft.user_id;
    await api("/marketplaces/connections", {
      method: "POST",
      body: JSON.stringify({
        provider: state.marketplaceConnectDraft.provider,
        display_name: state.marketplaceConnectDraft.display_name,
        mode: state.marketplaceConnectDraft.mode,
        api_token: state.marketplaceConnectDraft.api_token,
        client_id: state.marketplaceConnectDraft.client_id,
        extra_config,
      }),
    });
    state.marketplaceConnectDraft.api_token = "";
    state.marketplaceConnectDraft.client_id = "";
    await loadMarketplaces(true);
    state.marketplaceNotice = t("market.connected");
    state.marketplaceTab = "products";
    toast(t("market.connected"));
  } catch (error) {
    state.marketplaceNotice = error.message;
    toast(error.message);
  } finally {
    state.marketplaceSaving = false;
    render({ motion: false });
  }
}

async function submitMarketplaceProducts(event) {
  event.preventDefault();
  syncMarketplaceProductFromForm(event.currentTarget);
  const data = new FormData(event.currentTarget);
  const liveFetch = data.get("live_fetch") === "on";
  const product = { ...state.marketplaceProductDraft };
  if (product.stock !== "") product.stock = Number(product.stock);
  state.marketplaceSaving = true;
  state.marketplaceNotice = "";
  render({ motion: false });
  try {
    const result = await api(`/marketplaces/connections/${state.marketplaceSelectedConnectionId}/sync-products`, {
      method: "POST",
      body: JSON.stringify({
        live_fetch: liveFetch,
        products: liveFetch ? [] : [product],
        limit: 50,
      }),
    });
    await loadMarketplaces(true);
    state.marketplaceNotice = t("market.imported", { n: result.imported || 0 });
    state.marketplaceTab = "action";
    toast(state.marketplaceNotice);
  } catch (error) {
    state.marketplaceNotice = error.message;
    toast(error.message);
  } finally {
    state.marketplaceSaving = false;
    render({ motion: false });
  }
}

async function submitMarketplaceAction(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.marketplaceSelectedProductId = String(form.get("product_id") || state.marketplaceSelectedProductId || "");
  state.marketplaceActionType = String(form.get("action_type") || "improve_card");
  const product = selectedMarketplaceProduct();
  state.marketplaceSaving = true;
  state.marketplaceNotice = "";
  render({ motion: false });
  try {
    await api("/marketplaces/actions/generate", {
      method: "POST",
      body: JSON.stringify({
        provider: state.marketplaceSelectedProvider,
        connection_id: state.marketplaceSelectedConnectionId || null,
        product_id: state.marketplaceSelectedProductId || null,
        action_type: state.marketplaceActionType,
        input: {
          message: String(form.get("input") || ""),
          product: product?.title || "",
          price: product?.price || "",
          advantages: product?.category || "",
        },
        profile: state.contentProfile,
        output_language: state.contentOutputLanguage,
        approval_required: true,
      }),
    });
    await loadMarketplaces(true);
    state.marketplaceNotice = t("market.actionCreated");
    state.marketplaceTab = "drafts";
    toast(t("market.actionCreated"));
  } catch (error) {
    state.marketplaceNotice = error.message;
    toast(error.message);
  } finally {
    state.marketplaceSaving = false;
    render({ motion: false });
  }
}

async function marketplaceActionCommand(actionId, command) {
  state.marketplaceSaving = true;
  state.marketplaceNotice = "";
  render({ motion: false });
  try {
    const result = await api(`/marketplaces/actions/${actionId}/${command}`, { method: "POST", body: JSON.stringify({}) });
    await loadMarketplaces(true);
    const message = result.action?.result?.message || (command === "approve" ? t("market.approved") : t("market.published"));
    state.marketplaceNotice = message;
    toast(message);
  } catch (error) {
    state.marketplaceNotice = error.message;
    toast(error.message);
  } finally {
    state.marketplaceSaving = false;
    render({ motion: false });
  }
}

async function submitCopyGeneration(event) {
  event.preventDefault();
  if (activeContentFormMode() !== "wizard") syncContentFromForm(event.currentTarget);
  const tool = currentContentTool();
  const cost = contentTokenCost(tool);

  // Anonymous path — public endpoint, no tokens needed
  if (!state.user) {
    if (getAnonAdpilotCount() >= ANON_ADPILOT_LIMIT) {
      state.authMode = "register";
      render();
      return;
    }
    state.contentGenerating = true;
    state.contentNotice = "";
    render({ motion: false });
    try {
      const result = await api("/content/generate/public", {
        method: "POST",
        body: JSON.stringify({
          tool_slug: tool.slug,
          input: { ...state.contentDraft },
          profile: {},
          output_language: state.contentOutputLanguage,
        }),
      });
      state.contentOutput = result.output || "";
      state.contentVariations = [result.output].filter(Boolean);
      state.contentMeta = result;
      state.contentNotice = t("copy.done");
      incAnonAdpilotCount();
      toast(t("copy.done"));
    } catch (error) {
      toast(error.message);
    } finally {
      state.contentGenerating = false;
      render({ motion: false });
    }
    return;
  }

  // Logged-in path
  if (state.user.tokens < cost) { toast(t("toast.requestFailed")); return; }
  state.contentGenerating = true;
  state.contentNotice = "";
  render({ motion: false });
  try {
    const inputWithAdjust = state.contentAdjustInstruction
      ? { ...state.contentDraft, adjust_instruction: state.contentAdjustInstruction, previous_output: state.contentOutput }
      : { ...state.contentDraft };
    const result = await api("/content/generate", {
      method: "POST",
      body: JSON.stringify({
        tool_slug: tool.slug,
        input: inputWithAdjust,
        profile: state.contentProfile,
        output_language: state.contentOutputLanguage,
      }),
    });
    state.contentOutput = result.output || "";
    state.contentVariations = [result.output, ...state.contentVariations].filter(Boolean).slice(0, 3);
    state.contentMeta = result;
    state.contentNotice = result.warning || t("copy.done");
    await loadUser();
    toast(t("copy.done"));
  } catch (error) {
    toast(error.message);
  } finally {
    state.contentGenerating = false;
    render({ motion: false });
  }
}

async function copyContentOutput() {
  if (!state.contentOutput) return;
  try {
    await navigator.clipboard.writeText(state.contentOutput);
    toast(t("copy.copied"));
  } catch {
    toast(t("toast.requestFailed"));
  }
}

async function submitGeneration(event) {
  event.preventDefault();
  if (!state.user) { state.authMode = "login"; render(); return; }
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
      if (source) revealResultOnMobile();
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
  let generated = false;
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
    state.overlayImage = null;
    state.overlayMode = null;
    state.overlayBenefits = ["", "", ""];
    state.generatedMeta = resultMeta;
    await rememberResult(resultMeta, dataUrl, payload);
    await loadUser();
    generated = true;
    toast(options.label ? t("toast.variationDone", { label: options.label }) : t("toast.photoDone"));
  } catch (error) {
    toast(error.message);
  } finally {
    state.generating = false;
    state.generationLabel = "";
    render();
    if (generated) revealResultOnMobile();
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

function checkReferralParam() {
  const params = new URLSearchParams(location.search);
  const ref = params.get("ref");
  if (ref) {
    state.pendingReferralCode = ref.trim().toUpperCase();
    history.replaceState(null, "", location.pathname + location.hash);
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
  const source = state.generatedVideo || state.generatedImage;
  if (!source) return;
  const subject = state.generatedMeta?.subject || "";
  try {
    const blob = await (await fetch(source)).blob();
    const isVideo = Boolean(state.generatedVideo);
    const extension = isVideo
      ? String(state.videoJob?.output_format || "mp4").toLowerCase()
      : blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    const fallbackType = isVideo ? "video/mp4" : "image/jpeg";
    const file = new File([blob], `domstudio-result.${extension}`, { type: blob.type || fallbackType });

    if (typeof navigator.canShare === "function") {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "DomStudio",
          text: subject || t("pwa.shareText"),
          files: [file],
        });
        return;
      }
    }

    if (!isVideo && navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/jpeg"]: blob })]);
      toast(t("toast.imageCopied"));
      return;
    }

    throw new Error("share-fallback");
  } catch (error) {
    if (error.name !== "AbortError") {
      const link = document.createElement("a");
      link.href = source;
      link.download = state.generatedVideo ? "domstudio-result.mp4" : "domstudio-result.jpg";
      link.click();
      toast(t("toast.shareFallback"));
    }
  }
}

async function installPwa() {
  const prompt = state.installPrompt;
  if (!prompt) {
    if (isIosSafari()) toast(t("pwa.iosInstallToast"));
    return;
  }
  prompt.prompt();
  const choice = await prompt.userChoice.catch(() => null);
  state.installPrompt = null;
  state.installAvailable = false;
  if (choice?.outcome === "accepted") toast(t("pwa.installed"));
  render({ motion: false });
}

function dismissPwaInstall() {
  state.installDismissed = true;
  localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "true");
  render({ motion: false });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {});
    if ("caches" in window) {
      caches.keys()
        .then((keys) => Promise.all(keys.filter((key) => key.startsWith("domstudio-")).map((key) => caches.delete(key))))
        .catch(() => {});
    }
    return;
  }
  window.addEventListener("load", () => {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {});
  });
}

window.addEventListener("hashchange", () => {
  state.route = routeFromHash();
  if (state.route === "contact") {
    state.contactDraft.reason = contactReasonFromHash() || state.contactDraft.reason || "contact";
    state.contactSent = false;
    state.contactError = "";
  }
  state.navMenuOpen = false;
  state.presetsOpen = false;
  if (state.route === "adpilot" && state.user && !state.marketplaceLoaded) {
    loadMarketplaces().finally(() => render({ motion: false }));
  }
  render();
});
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("online", () => {
  state.online = true;
  toast(t("pwa.online"));
  render({ motion: false });
});
window.addEventListener("offline", () => {
  state.online = false;
  toast(t("pwa.offlineTitle"));
  render({ motion: false });
});
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  state.installAvailable = true;
  state.installDismissed = localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === "true";
  render({ motion: false });
});
window.addEventListener("appinstalled", () => {
  state.installPrompt = null;
  state.installAvailable = false;
  state.installDismissed = true;
  localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "true");
  toast(t("pwa.installed"));
  render({ motion: false });
});

registerServiceWorker();
render();
loadUser()
  .then(() => {
    state.authInitializing = false;
    return Promise.all([
      loadPlans(),
      loadContentTools(),
      loadHistory(),
      state.user ? loadReferral() : Promise.resolve(),
      state.user ? loadMarketplaces() : Promise.resolve(),
    ]);
  })
  .then(() => { checkReferralParam(); checkPaymentReturn(); })
  .finally(render);
