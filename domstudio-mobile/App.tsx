import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  ImageSourcePropType,
  Linking,
  LogBox,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ViewStyle
} from "react-native";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { VideoSource, VideoView, useVideoPlayer } from "expo-video";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import {
  API_URL,
  GenerateResult,
  PaymentHistoryItem,
  SubscriptionPlan,
  Tokens,
  TokenPack,
  UserProfile,
  VideoJob,
  clearTokens,
  forgotPassword,
  generateImage,
  generateVideo,
  getVideoJob,
  initPlanPayment,
  initTopUpPayment,
  listPaymentHistory,
  listPlans,
  listTokenPacks,
  listVideoJobs,
  loadMe,
  loadTokens,
  loginEmail,
  loginPhone,
  logout,
  refreshTokens,
  registerEmail,
  resetPassword,
  saveTokens,
  verifyEmail,
  verifyPhone,
  ContentTool,
  ContentGenerateResult,
  MarketplaceAction,
  generateCopy,
  listContentTools,
  listMarketplaceActions,
} from "./src/api";
import { LocalHistoryItem, SavedCopyItem, clearLocalHistory, loadLanguage, loadLocalHistory, loadSavedCopy, saveCopyItems, saveLanguage, saveLocalHistory } from "./src/storage";
import { colors, radii } from "./src/theme";

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Studio: undefined;
  AdPilot: undefined;
  Examples: undefined;
  Pricing: undefined;
};

type AuthMode = "login" | "register" | "verifyEmail" | "phone" | "verifyPhone" | "forgot" | "reset";
type AppLanguage = "en" | "ru";

type PickedImage = {
  uri: string;
  base64: string;
  name?: string;
};

type ResultState = {
  uri: string;
  meta: GenerateResult;
  subject: string;
  modeLabel: string;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

type ModeOption = {
  id: string;
  label: string;
  hint: string;
  tag: string;
  ratio: string;
  preview: ImageSourcePropType;
  before: ImageSourcePropType;
};

const proofBefore = require("./assets/visual/wine-before-original.jpeg") as ImageSourcePropType;
const proofAfter = require("./assets/visual/wine-after-smoke.png") as ImageSourcePropType;
const proofVideo = require("./assets/visual/wine-after-smoke-5s.mp4") as number;
const perfumeProductVideo = require("./assets/visual/perfume-product-5s.mp4") as number;
const wineProductVideo = require("./assets/visual/wine-product-5s.mp4") as number;
const fashionFittingVideo = require("./assets/visual/fashion-fitting-5s.mp4") as number;

const modes = [
  {
    id: "catalog",
    label: "Catalog",
    hint: "Marketplace-safe hero image",
    tag: "WB / Ozon",
    ratio: "4:3",
    preview: require("./assets/visual/mode-catalog-real-v3.webp"),
    before: require("./assets/visual/mode-catalog-before.webp")
  },
  {
    id: "product",
    label: "Product",
    hint: "Clean product card",
    tag: "Studio",
    ratio: "1:1",
    preview: require("./assets/visual/mode-product-real-v3.webp"),
    before: require("./assets/visual/mode-product-before.webp")
  },
  {
    id: "creative",
    label: "Creative",
    hint: "Ad-style campaign image",
    tag: "Ads",
    ratio: "1:1",
    preview: require("./assets/visual/mode-creative-real-v3.webp"),
    before: require("./assets/visual/mode-creative-before.webp")
  },
  {
    id: "image",
    label: "Lifestyle",
    hint: "Scene with real context",
    tag: "Scene",
    ratio: "4:5",
    preview: require("./assets/visual/mode-lifestyle-real-v3.webp"),
    before: require("./assets/visual/mode-lifestyle-before.webp")
  },
  {
    id: "fitting",
    label: "Fitting",
    hint: "Fashion fit preview",
    tag: "Try-on",
    ratio: "3:4",
    preview: require("./assets/visual/mode-fitting-real-v2.webp"),
    before: require("./assets/visual/mode-fitting-before.webp")
  },
  {
    id: "mobile",
    label: "Stories",
    hint: "Vertical social result",
    tag: "9:16",
    ratio: "Story",
    preview: require("./assets/visual/mode-stories-real-v3.webp"),
    before: require("./assets/visual/mode-stories-before.webp")
  }
] satisfies ModeOption[];

const samplePrompts = [
  "Wine bottle on marble table",
  "Perfume in warm boutique light",
  "Marketplace card, clean shadow"
];

const pricingPlans = [
  { name: "Free", kicker: "First product tests", price: "0 RUB", photos: "5 photos", videos: "5 local videos", premium: "No premium video" },
  { name: "Basic", kicker: "Validate product cards", price: "270 RUB", photos: "30 photos", videos: "30 local videos", premium: "10 premium videos" },
  { name: "Pro", kicker: "Regular seller content", price: "790 RUB", photos: "100 photos", videos: "50 local videos", premium: "33 premium videos", featured: true },
  { name: "Business", kicker: "Store and marketplace growth", price: "1490 RUB", photos: "300 photos", videos: "100 local videos", premium: "99 premium videos" }
];

const planKickers: Record<string, string> = {
  free: "First product tests",
  basic: "Validate product cards",
  pro: "Regular seller content",
  business: "Store and marketplace growth"
};

const exampleImages = [
  { mode: "Catalog", product: "Perfume bottle", title: "Clean marketplace cutout", src: require("./assets/visual/example-perfume-catalog.webp") as ImageSourcePropType },
  { mode: "Product", product: "Perfume bottle", title: "Marble and candle studio scene", src: require("./assets/visual/example-perfume-product.webp") as ImageSourcePropType, video: perfumeProductVideo, wide: true },
  { mode: "Creative", product: "Perfume bottle", title: "Neon campaign visual", src: require("./assets/visual/example-perfume-creative.webp") as ImageSourcePropType },
  { mode: "Lifestyle", product: "Perfume bottle", title: "Desk and warm window light", src: require("./assets/visual/example-perfume-lifestyle.webp") as ImageSourcePropType },
  { mode: "Fitting", product: "Perfume bottle", title: "Scale-in-hand product shot", src: require("./assets/visual/example-perfume-fitting.webp") as ImageSourcePropType },
  { mode: "Stories", product: "Perfume bottle", title: "Vertical mobile story crop", src: require("./assets/visual/example-perfume-mobile.webp") as ImageSourcePropType, portrait: true },
  { mode: "Catalog", product: "Pomegranate bottle", title: "White-background product card", src: require("./assets/visual/example-bottle-catalog.webp") as ImageSourcePropType, portrait: true },
  { mode: "Product", product: "Wine bottle", title: "Marble table studio setup", src: require("./assets/visual/example-bottle-product.webp") as ImageSourcePropType, video: wineProductVideo, wide: true },
  { mode: "Creative", product: "Pomegranate bottle", title: "Warm premium campaign frame", src: require("./assets/visual/example-bottle-creative.webp") as ImageSourcePropType },
  { mode: "Lifestyle", product: "Pomegranate bottle", title: "Restaurant table scene", src: require("./assets/visual/example-bottle-lifestyle.webp") as ImageSourcePropType },
  { mode: "Fitting", product: "Pomegranate bottle", title: "Scale and serving context", src: require("./assets/visual/example-bottle-fitting.webp") as ImageSourcePropType },
  { mode: "Stories", product: "Pomegranate bottle", title: "Vertical social frame", src: require("./assets/visual/example-bottle-mobile.webp") as ImageSourcePropType, portrait: true }
];

const motionExamples = [
  { mode: "Product video", product: "Wine bottle", title: "Autoplay product motion", src: proofAfter, video: proofVideo },
  { mode: "Fitting video", product: "Beige suit outfit", title: "Virtual fitting motion preview", src: require("./assets/visual/mode-fitting-real-v2.webp") as ImageSourcePropType, video: fashionFittingVideo }
];

const workflowSteps = [
  { number: "01", title: "Upload product photo", text: "Start with an ordinary phone shot or a supplier image." },
  { number: "02", title: "Choose marketplace format", text: "Pick Catalog, Product, Creative, Lifestyle, Fitting, or Stories." },
  { number: "03", title: "Export content that sells", text: "Save or share a photo, queue video, and reuse the result in history." }
];

const mobileCopy = {
  en: {
    tabs: { home: "Home", studio: "Studio", adpilot: "AdPilot", examples: "Examples", pricing: "Pricing" },
    common: {
      offlineTitle: "Offline",
      permissionNeeded: "Permission needed",
      sharingUnavailable: "Sharing unavailable",
      shareFailed: "Share failed",
      saveFailed: "Save failed",
      saved: "Saved",
      resultPrepared: "Result prepared at",
      videoPrepared: "Video prepared at",
      resultSaved: "Result saved to your photo library.",
      videoSaved: "Video saved to your photo library.",
      photoPermissionCamera: "Allow camera access to capture product shots.",
      photoPermissionLibrary: "Allow photo access to upload product shots.",
      resultLibraryPermission: "Allow photo library access to save generated results.",
      videoLibraryPermission: "Allow photo library access to save generated videos."
    },
    auth: {
      title: "DomStudio",
      subtitle: "Product photos, marketplace cards, and short content from one phone workflow.",
      offline: "Offline. Auth and generation are paused until the network returns.",
      continueOnline: "Connect to the internet to continue.",
      signIn: "Sign in",
      createAccount: "Create account",
      enterCode: "Enter code",
      phoneLogin: "Phone login",
      resetPassword: "Reset password",
      newPassword: "New password",
      email: "Email",
      password: "Password",
      phone: "Phone",
      code: "Code",
      openStudio: "Open studio",
      sendEmailCode: "Send email code",
      verifyEmail: "Verify email",
      sendPhoneCode: "Send phone code",
      verifyPhone: "Verify phone",
      sendResetCode: "Send reset code",
      saveNewPassword: "Save new password",
      emailLogin: "Email login",
      phoneOtp: "Phone OTP",
      forgot: "Forgot",
      loginFailed: "Login failed",
      registrationFailed: "Registration failed",
      verificationFailed: "Verification failed",
      phoneLoginFailed: "Phone login failed",
      resetFailed: "Reset failed",
      passwordResetFailed: "Password reset failed",
      enterEmailPassword: "Enter your email and password.",
      emailPasswordRules: "Use an email and an 8+ character password.",
      enterEmailCode: "Enter the code from your email.",
      enterPhone: "Enter your phone number.",
      enterSmsCode: "Enter the SMS code.",
      enterEmail: "Enter your email.",
      enterResetFields: "Enter email, code, and an 8+ character password."
    },
    home: {
      eyebrow: "AI studio for marketplace sellers",
      titleA: "Content that",
      titleB: "sells",
      body: "Upload a plain product photo, choose your platform - Wildberries, Ozon, Yandex, Avito - and get a ready card, story or banner in minutes.",
      create: "Create first photo",
      pricing: "See pricing",
      offline: "Offline now. You can still browse the flow.",
      mini: "Mini studio",
      platforms: "WB / Ozon / Yandex / Avito",
      trust1: "Ready for marketplaces",
      trust2: "Photo and video flow",
      trust3: "Mobile-first export",
      before: "Before",
      after: "After",
      video: "Video",
      productPhoto: "Product photo",
      upload: "Upload",
      teaserTitle: "Wine bottle on marble table",
      teaserBody: "Try the Product mode first, then make a story or catalog card from the same photo.",
      tokensReady: "tokens ready",
      proofTitle: "Real product proof.",
      proofBody: "The same before, after, and video story from the web home screen is now part of the native first impression.",
      stat1: "photos in the starter seller plan.",
      entryPrice: "270 RUB",
      stat2: "entry price for a real content batch.",
      stat3: "story-ready vertical assets for social sales.",
      modesTitle: "Six web modes, native.",
      modesBody: "Catalog, Product, Creative, Lifestyle, Fitting, and Stories use the same proof cards as the web page.",
      workflowTitle: "How sellers move from photo to content.",
      workflowBody: "The native app should feel like the web product, then stay useful in the actual phone workflow.",
      menuSub: "Move through the seller workflow.",
      menuCreate: "Create photo",
      menuCreateMeta: "Open Studio",
      menuExamples: "Examples",
      menuExamplesMeta: "See formats",
      menuPricing: "Pricing",
      menuPricingMeta: "Plans and limits",
      close: "Close"
    },
    modes: {
      catalog: { label: "Catalog", hint: "Marketplace-safe hero image", tag: "WB / Ozon", ratio: "4:3" },
      product: { label: "Product", hint: "Clean product card", tag: "Studio", ratio: "1:1" },
      creative: { label: "Creative", hint: "Ad-style campaign image", tag: "Ads", ratio: "1:1" },
      image: { label: "Lifestyle", hint: "Scene with real context", tag: "Scene", ratio: "4:5" },
      fitting: { label: "Fitting", hint: "Fashion fit preview", tag: "Try-on", ratio: "3:4" },
      mobile: { label: "Stories", hint: "Vertical social result", tag: "9:16", ratio: "Story" }
    },
    workflow: [
      { number: "01", title: "Upload product photo", text: "Start with an ordinary phone shot or a supplier image." },
      { number: "02", title: "Choose marketplace format", text: "Pick Catalog, Product, Creative, Lifestyle, Fitting, or Stories." },
      { number: "03", title: "Export content that sells", text: "Save or share a photo, queue video, and reuse the result in history." }
    ],
    examplesData: {
      images: [
        { mode: "Catalog", product: "Perfume bottle", title: "Clean marketplace cutout" },
        { mode: "Product", product: "Perfume bottle", title: "Marble and candle studio scene" },
        { mode: "Creative", product: "Perfume bottle", title: "Neon campaign visual" },
        { mode: "Lifestyle", product: "Perfume bottle", title: "Desk and warm window light" },
        { mode: "Fitting", product: "Perfume bottle", title: "Scale-in-hand product shot" },
        { mode: "Stories", product: "Perfume bottle", title: "Vertical mobile story crop" },
        { mode: "Catalog", product: "Pomegranate bottle", title: "White-background product card" },
        { mode: "Product", product: "Wine bottle", title: "Marble table studio setup" },
        { mode: "Creative", product: "Pomegranate bottle", title: "Warm premium campaign frame" },
        { mode: "Lifestyle", product: "Pomegranate bottle", title: "Restaurant table scene" },
        { mode: "Fitting", product: "Pomegranate bottle", title: "Scale and serving context" },
        { mode: "Stories", product: "Pomegranate bottle", title: "Vertical social frame" }
      ],
      motion: [
        { mode: "Product video", product: "Wine bottle", title: "Autoplay product motion" },
        { mode: "Fitting video", product: "Beige suit outfit", title: "Virtual fitting motion preview" }
      ]
    },
    examples: {
      eyebrow: "Examples",
      title: "Product content examples.",
      body: "The same perfume, bottle, marketplace, product, creative, lifestyle, fitting, and story gallery from the web app.",
      badge1: "Marketplace cards",
      badge2: "Social crops",
      badge3: "Video-ready frames",
      cta: "Create from example",
      bottom: "Ready to make your product set?",
      openStudio: "Open Studio"
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Scale your content.",
      body: "Monthly plans for marketplace sellers who need product cards, social crops, and video-ready assets without rebuilding the workflow.",
      checkoutReturn: "Checkout opened. Return here after payment; this screen will refresh automatically.",
      offline: "Offline. Account numbers may be stale.",
      currentPlan: "Current plan",
      tokens: "Tokens",
      refresh: "Refresh account",
      refreshing: "Refreshing...",
      photos: "Photos",
      videos: "Videos",
      premium: "Premium",
      renewal: "Renewal",
      none: "None",
      currencyRub: "RUB",
      usageNoAllowance: "No allowance on this plan",
      usageUsedNoAllowance: "used with no allowance on this plan",
      usageOverPlanLimit: "over plan limit",
      usageRemaining: "remaining",
      signOut: "Sign out",
      publicNote: "Sign in to buy a plan, add token packs, or start generating.",
      publicCta: "Sign in to start",
      accountLabel: "Account balance",
      planLabel: "Plan",
      bestValue: "Best value",
      allModes: "All shooting modes",
      currentStarter: "Current starter",
      upgradePrefix: "Upgrade to",
      openingCheckout: "Opening checkout...",
      tokenTopups: "Token top-ups",
      tokenTopupsBody: "Add tokens without changing your current plan.",
      tokenPacksLoad: "Token packs load from the backend when online.",
      buy: "Buy",
      opening: "Opening...",
      paymentHistory: "Payment history",
      noPayments: "Completed and pending payments will appear here.",
      topup: "Token top-up",
      entryBatch: "entry batch",
      sellerAssets: "seller assets",
      plansLabel: "plans",
      offlineRefresh: "Reconnect to refresh plans and payments.",
      pricingFailed: "Pricing failed",
      offlineCheckout: "Reconnect to open checkout.",
      freePlanTitle: "Free plan",
      freePlanBody: "You are already able to use the free plan.",
      paymentFailed: "Payment failed",
      topupFailed: "Top-up failed",
      planKickers: {
        free: "First product tests",
        basic: "Validate product cards",
        pro: "Regular seller content",
        business: "Store and marketplace growth"
      },
      fallbackPlans: {
        free: { name: "Free", photos: "5 photos", videos: "5 local videos", premium: "No premium video" },
        basic: { name: "Basic", photos: "30 photos", videos: "30 local videos", premium: "10 premium videos" },
        pro: { name: "Pro", photos: "100 photos", videos: "50 local videos", premium: "33 premium videos" },
        business: { name: "Business", photos: "300 photos", videos: "100 local videos", premium: "99 premium videos" }
      }
    },
    studio: {
      title: "Studio",
      tokens: "tokens",
      offline: "Offline. You can edit the prompt and inspect history; generation waits for network.",
      heroKicker: "Mobile product studio",
      heroTitle: "Shoot, style, export.",
      heroBody: "Choose a proven format, add a product photo, then generate seller-ready content.",
      setup: "setup",
      prompt: "Product prompt",
      promptPlaceholder: "Wine bottle on marble table, premium product card",
      style: "Style",
      upscale: "Upscale 4K",
      upscaleBody: "Uses backend generation setting",
      uploadTitle: "Product photo",
      uploadBody: "Capture with camera or choose from gallery",
      camera: "Camera",
      gallery: "Gallery",
      generate: "Generate photo",
      queueVideo: "Queue 3s video",
      queueingVideo: "Queueing video...",
      resultEmptyTitle: "Result appears here",
      resultEmptyBody: "Generate from your product photo, then save or share it from the phone.",
      readyResult: "Ready result",
      share: "Share",
      save: "Save",
      ready: "Ready",
      queued: "queued",
      videoJob: "Video job",
      videoPending: "Queued videos render on the backend. Refresh this card to load the output.",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      promptSamples: ["Wine bottle on marble table", "Perfume in warm boutique light", "Marketplace card, clean shadow"],
      styleHints: ["clean marketplace card", "premium studio lighting", "social media creative", "warm lifestyle scene", "story-safe vertical composition"],
      offlineGenerate: "Connect to generate a new result.",
      offlineQueue: "Connect to queue a video job.",
      offlineRefreshVideo: "Reconnect to refresh the video job.",
      addPromptTitle: "Add a prompt",
      addPhotoTitle: "Photo required",
      describePhoto: "Describe the product and the result you want.",
      describeVideo: "Describe the product video you want.",
      choosePhotoFirst: "Choose or capture a product photo before queueing video.",
      noImageReturned: "No image returned",
      generationFailed: "Generation failed",
      videoQueued: "Video queued",
      videoQueuedBody: "The job is visible below. Refresh it to pick up the rendered video.",
      videoFailed: "Video failed",
      refreshFailed: "Refresh failed",
      shareResultTitle: "Share DomStudio result",
      shareVideoTitle: "Share DomStudio video"
    },
    history: {
      title: "History",
      saved: "saved",
      clearLocal: "Clear local",
      refreshJobs: "Refresh jobs",
      refreshing: "Refreshing...",
      offlineRefresh: "Reconnect to refresh video jobs.",
      jobsFailed: "Jobs failed",
      emptyTitle: "No saved results yet",
      emptyBody: "Generated photos are stored locally on this device for quick reuse.",
      videoJobs: "Video jobs",
      emptyJobs: "Queue a video from Studio, then refresh here. Output quality still depends on the backend worker."
    },
    account: {
      title: "Account",
      offline: "Offline. Account numbers may be stale.",
      fallbackName: "DomStudio account",
      verified: "Verified",
      yes: "Yes",
      no: "No",
      tokens: "Tokens",
      refresh: "Refresh account",
      photos: "Photos",
      videos: "Videos",
      premiumVideos: "Premium videos",
      plan: "Plan",
      planStatus: "Plan status",
      renewal: "Renewal",
      notScheduled: "Not scheduled",
      compliance: "Payments and subscriptions can be added here once native compliance decisions are final.",
      signOut: "Sign out"
    },
    settings: {
      title: "Settings",
      offline: "offline",
      online: "online",
      environment: "Environment",
      apiUrl: "API URL",
      lanHelp: "Use your computer LAN IP for Expo Go on a physical phone. Android emulator usually uses http://10.0.2.2:8000.",
      storage: "Device storage",
      storageBody: "Local generated-photo history is stored on this device and can be cleared any time.",
      clearHistory: "Clear local history",
      readiness: "Build readiness",
      readinessBody1: "Camera, gallery picker, media-library save, secure tokens, and native tabs are enabled.",
      readinessBody2: "Native icon, splash, Home, Studio, Examples, and Pricing surfaces now share the DomStudio brand system."
    },
    adpilot: {
      screenTitle: "AdPilot",
      tabConnection: "Connection",
      tabProducts: "Products",
      tabTools: "Tools",
      tabCreateDraft: "Create draft",
      tabDrafts: "Drafts",
      fillExample: "Fill with example",
      langAuto: "Auto",
      langEnglish: "English",
      langRussian: "Russian",
      lang: { auto: "Auto", english: "English", russian: "Russian" },
      generate: "Generate",
      generating: "Writing…",
      generated: "Ready",
      generateFailed: "Generation failed",
      variation: "Option",
      chars: "chars",
      saveDraft: "Save",
      copy: "Copy",
      adjust: "Adjust",
      adjustLabel: "Refine",
      adjustPlaceholder: "Make it shorter, more formal, add a CTA…",
      savedDraft: "Saved to drafts",
      savedDrafts: "Saved copies",
      noSavedDrafts: "No saved copies yet. Generate something and tap Save.",
      delete: "Delete",
      copied: "Copied",
      marketplaceWebOnly: "Marketplace connection, product import, and draft publishing are available on the web app at domstudio.site."
    }
  },
  ru: {
    tabs: { home: "Главная", studio: "Студия", adpilot: "AdPilot", examples: "Примеры", pricing: "Тарифы" },
    common: {
      offlineTitle: "Офлайн",
      permissionNeeded: "Нужно разрешение",
      sharingUnavailable: "Отправка недоступна",
      shareFailed: "Не удалось поделиться",
      saveFailed: "Не удалось сохранить",
      saved: "Сохранено",
      resultPrepared: "Результат подготовлен:",
      videoPrepared: "Видео подготовлено:",
      resultSaved: "Результат сохранен в фотогалерею.",
      videoSaved: "Видео сохранено в фотогалерею.",
      photoPermissionCamera: "Разрешите доступ к камере, чтобы снимать товары.",
      photoPermissionLibrary: "Разрешите доступ к фото, чтобы загружать товары.",
      resultLibraryPermission: "Разрешите доступ к фотогалерее, чтобы сохранять результаты.",
      videoLibraryPermission: "Разрешите доступ к фотогалерее, чтобы сохранять видео."
    },
    auth: {
      title: "DomStudio",
      subtitle: "Фото товаров, карточки маркетплейсов и короткий контент в одном мобильном процессе.",
      offline: "Офлайн. Вход и генерация продолжатся после подключения.",
      continueOnline: "Подключитесь к интернету, чтобы продолжить.",
      signIn: "Войти",
      createAccount: "Создать аккаунт",
      enterCode: "Введите код",
      phoneLogin: "Вход по телефону",
      resetPassword: "Сброс пароля",
      newPassword: "Новый пароль",
      email: "Email",
      password: "Пароль",
      phone: "Телефон",
      code: "Код",
      openStudio: "Открыть студию",
      sendEmailCode: "Отправить код на email",
      verifyEmail: "Подтвердить email",
      sendPhoneCode: "Отправить SMS-код",
      verifyPhone: "Подтвердить телефон",
      sendResetCode: "Отправить код сброса",
      saveNewPassword: "Сохранить новый пароль",
      emailLogin: "Вход по email",
      phoneOtp: "SMS-код",
      forgot: "Забыли пароль",
      loginFailed: "Ошибка входа",
      registrationFailed: "Ошибка регистрации",
      verificationFailed: "Ошибка подтверждения",
      phoneLoginFailed: "Ошибка входа по телефону",
      resetFailed: "Ошибка сброса",
      passwordResetFailed: "Пароль не обновлен",
      enterEmailPassword: "Введите email и пароль.",
      emailPasswordRules: "Укажите email и пароль от 8 символов.",
      enterEmailCode: "Введите код из письма.",
      enterPhone: "Введите номер телефона.",
      enterSmsCode: "Введите SMS-код.",
      enterEmail: "Введите email.",
      enterResetFields: "Введите email, код и пароль от 8 символов."
    },
    home: {
      eyebrow: "AI-студия для продавцов маркетплейсов",
      titleA: "Контент, который",
      titleB: "продает",
      body: "Загрузите обычное фото товара, выберите площадку - Wildberries, Ozon, Yandex, Avito - и получите готовую карточку, сторис или баннер за минуты.",
      create: "Создать первое фото",
      pricing: "Смотреть тарифы",
      offline: "Сейчас офлайн. Поток можно посмотреть, но генерация недоступна.",
      mini: "Мини-студия",
      platforms: "WB / Ozon / Yandex / Avito",
      trust1: "Готово для маркетплейсов",
      trust2: "Фото и видео в одном потоке",
      trust3: "Экспорт с телефона",
      before: "До",
      after: "После",
      video: "Видео",
      productPhoto: "Фото товара",
      upload: "Загрузить",
      teaserTitle: "Бутылка вина на мраморном столе",
      teaserBody: "Сначала попробуйте режим Product, затем сделайте сторис или карточку каталога из того же фото.",
      tokensReady: "токенов доступно",
      proofTitle: "Реальный пример.",
      proofBody: "Тот же сценарий до, после и видео с веб-экрана теперь виден в первом экране приложения.",
      stat1: "фото в стартовом плане продавца.",
      entryPrice: "270 ₽",
      stat2: "входная цена за реальный пакет контента.",
      stat3: "вертикальные 9:16 материалы для соцсетей.",
      modesTitle: "Шесть веб-режимов в приложении.",
      modesBody: "Catalog, Product, Creative, Lifestyle, Fitting и Stories используют те же proof-карточки, что и веб.",
      workflowTitle: "Как продавец идет от фото к контенту.",
      workflowBody: "Нативное приложение должно ощущаться как веб-продукт и оставаться удобным в телефонном сценарии.",
      menuSub: "Переходите по рабочему процессу продавца.",
      menuCreate: "Создать фото",
      menuCreateMeta: "Открыть студию",
      menuExamples: "Примеры",
      menuExamplesMeta: "Смотреть форматы",
      menuPricing: "Тарифы",
      menuPricingMeta: "Планы и лимиты",
      close: "Закрыть"
    },
    modes: {
      catalog: { label: "Каталог", hint: "Главное фото для маркетплейса", tag: "WB / Ozon", ratio: "4:3" },
      product: { label: "Товар", hint: "Чистая карточка товара", tag: "Студия", ratio: "1:1" },
      creative: { label: "Креатив", hint: "Кампейн-изображение для рекламы", tag: "Реклама", ratio: "1:1" },
      image: { label: "Лайфстайл", hint: "Сцена с реальным контекстом", tag: "Сцена", ratio: "4:5" },
      fitting: { label: "Примерка", hint: "Предпросмотр посадки одежды", tag: "Try-on", ratio: "3:4" },
      mobile: { label: "Сторис", hint: "Вертикальный результат для соцсетей", tag: "9:16", ratio: "Сторис" }
    },
    workflow: [
      { number: "01", title: "Загрузите фото товара", text: "Начните с обычного снимка телефона или изображения поставщика." },
      { number: "02", title: "Выберите формат маркетплейса", text: "Каталог, Товар, Креатив, Лайфстайл, Примерка или Сторис." },
      { number: "03", title: "Экспортируйте продающий контент", text: "Сохраните или отправьте фото, поставьте видео в очередь и используйте историю." }
    ],
    examplesData: {
      images: [
        { mode: "Каталог", product: "Флакон парфюма", title: "Чистый вырез для маркетплейса" },
        { mode: "Товар", product: "Флакон парфюма", title: "Мрамор и свеча в студийной сцене" },
        { mode: "Креатив", product: "Флакон парфюма", title: "Неоновый кампейн-визуал" },
        { mode: "Лайфстайл", product: "Флакон парфюма", title: "Стол и теплый свет окна" },
        { mode: "Примерка", product: "Флакон парфюма", title: "Масштаб товара в руке" },
        { mode: "Сторис", product: "Флакон парфюма", title: "Вертикальный кроп для мобайла" },
        { mode: "Каталог", product: "Бутылка граната", title: "Карточка товара на белом фоне" },
        { mode: "Товар", product: "Бутылка вина", title: "Студийная сцена на мраморном столе" },
        { mode: "Креатив", product: "Бутылка граната", title: "Теплый премиальный кадр" },
        { mode: "Лайфстайл", product: "Бутылка граната", title: "Сцена на ресторанном столе" },
        { mode: "Примерка", product: "Бутылка граната", title: "Масштаб и контекст сервировки" },
        { mode: "Сторис", product: "Бутылка граната", title: "Вертикальный кадр для соцсетей" }
      ],
      motion: [
        { mode: "Видео товара", product: "Бутылка вина", title: "Автовоспроизведение товарного движения" },
        { mode: "Видео примерки", product: "Бежевый костюм", title: "Превью виртуальной примерки в движении" }
      ]
    },
    examples: {
      eyebrow: "Примеры",
      title: "Примеры товарного контента.",
      body: "Та же галерея с парфюмом, бутылками, карточками, креативами, lifestyle, fitting и stories, что и в вебе.",
      badge1: "Карточки маркетплейсов",
      badge2: "Кропы для соцсетей",
      badge3: "Кадры для видео",
      cta: "Создать по примеру",
      bottom: "Готовы собрать набор для товара?",
      openStudio: "Открыть студию"
    },
    pricing: {
      eyebrow: "Тарифы",
      title: "Масштабируйте контент.",
      body: "Месячные тарифы для продавцов маркетплейсов: карточки товаров, кропы для соцсетей и материалы для видео в одном процессе.",
      checkoutReturn: "Оплата открыта. Вернитесь сюда после платежа, экран обновится автоматически.",
      offline: "Офлайн. Данные аккаунта могут быть устаревшими.",
      currentPlan: "Текущий план",
      tokens: "Токены",
      refresh: "Обновить аккаунт",
      refreshing: "Обновляем...",
      photos: "Фото",
      videos: "Видео",
      premium: "Премиум",
      renewal: "Продление",
      none: "Нет",
      currencyRub: "₽",
      usageNoAllowance: "Нет лимита в этом тарифе",
      usageUsedNoAllowance: "использовано без лимита в тарифе",
      usageOverPlanLimit: "сверх лимита тарифа",
      usageRemaining: "осталось",
      signOut: "Выйти",
      publicNote: "Войдите, чтобы купить тариф, добавить токены или начать генерацию.",
      publicCta: "Войти и начать",
      accountLabel: "Баланс аккаунта",
      planLabel: "Тариф",
      bestValue: "Лучший выбор",
      allModes: "Все режимы съемки",
      currentStarter: "Стартовый тариф",
      upgradePrefix: "Перейти на",
      openingCheckout: "Открываем оплату...",
      tokenTopups: "Пакеты токенов",
      tokenTopupsBody: "Добавьте токены без смены текущего тарифа.",
      tokenPacksLoad: "Пакеты токенов загрузятся с backend, когда есть сеть.",
      buy: "Купить",
      opening: "Открываем...",
      paymentHistory: "История платежей",
      noPayments: "Завершенные и ожидающие платежи появятся здесь.",
      topup: "Пакет токенов",
      entryBatch: "стартовый пакет",
      sellerAssets: "материалов",
      plansLabel: "тарифа",
      offlineRefresh: "Подключитесь, чтобы обновить тарифы и платежи.",
      pricingFailed: "Ошибка тарифов",
      offlineCheckout: "Подключитесь, чтобы открыть оплату.",
      freePlanTitle: "Бесплатный тариф",
      freePlanBody: "Бесплатный тариф уже доступен.",
      paymentFailed: "Ошибка оплаты",
      topupFailed: "Ошибка пополнения",
      planKickers: {
        free: "Первые тесты товара",
        basic: "Проверка карточек товара",
        pro: "Регулярный контент продавца",
        business: "Рост магазина и маркетплейса"
      },
      fallbackPlans: {
        free: { name: "Бесплатный", photos: "5 фото", videos: "5 локальных видео", premium: "Без премиум-видео" },
        basic: { name: "Базовый", photos: "30 фото", videos: "30 локальных видео", premium: "10 премиум-видео" },
        pro: { name: "Про", photos: "100 фото", videos: "50 локальных видео", premium: "33 премиум-видео" },
        business: { name: "Бизнес", photos: "300 фото", videos: "100 локальных видео", premium: "99 премиум-видео" }
      }
    },
    studio: {
      title: "Студия",
      tokens: "токенов",
      offline: "Офлайн. Можно редактировать промпт и смотреть историю, генерация дождется сети.",
      heroKicker: "Мобильная товарная студия",
      heroTitle: "Снимите, оформите, экспортируйте.",
      heroBody: "Выберите готовый формат, добавьте фото товара и создайте контент для продаж.",
      setup: "настройка",
      prompt: "Промпт товара",
      promptPlaceholder: "Бутылка вина на мраморном столе, премиальная карточка товара",
      style: "Стиль",
      upscale: "Апскейл 4K",
      upscaleBody: "Использует настройку генерации backend",
      uploadTitle: "Фото товара",
      uploadBody: "Снимите камерой или выберите из галереи",
      camera: "Камера",
      gallery: "Галерея",
      generate: "Создать фото",
      queueVideo: "Поставить видео 3с",
      queueingVideo: "Ставим видео...",
      resultEmptyTitle: "Результат появится здесь",
      resultEmptyBody: "Создайте результат из фото товара, затем сохраните или отправьте с телефона.",
      readyResult: "Готовый результат",
      share: "Поделиться",
      save: "Сохранить",
      ready: "Готово",
      queued: "в очереди",
      videoJob: "Видео-задача",
      videoPending: "Видео рендерится на backend. Обновите карточку, чтобы загрузить результат.",
      refresh: "Обновить",
      refreshing: "Обновляем...",
      promptSamples: ["Бутылка вина на мраморном столе", "Парфюм в теплом бутиковом свете", "Карточка маркетплейса, чистая тень"],
      styleHints: ["чистая карточка маркетплейса", "премиальный студийный свет", "креатив для соцсетей", "теплая лайфстайл-сцена", "вертикальная композиция для сторис"],
      offlineGenerate: "Подключитесь, чтобы создать новый результат.",
      offlineQueue: "Подключитесь, чтобы поставить видео в очередь.",
      offlineRefreshVideo: "Подключитесь, чтобы обновить видео-задачу.",
      addPromptTitle: "Добавьте промпт",
      addPhotoTitle: "Нужно фото",
      describePhoto: "Опишите товар и нужный результат.",
      describeVideo: "Опишите видео товара, которое хотите получить.",
      choosePhotoFirst: "Выберите или снимите фото товара перед постановкой видео.",
      noImageReturned: "Изображение не вернулось",
      generationFailed: "Ошибка генерации",
      videoQueued: "Видео в очереди",
      videoQueuedBody: "Задача видна ниже. Обновите ее, чтобы получить готовое видео.",
      videoFailed: "Ошибка видео",
      refreshFailed: "Ошибка обновления",
      shareResultTitle: "Поделиться результатом DomStudio",
      shareVideoTitle: "Поделиться видео DomStudio"
    },
    history: {
      title: "История",
      saved: "сохранено",
      clearLocal: "Очистить локально",
      refreshJobs: "Обновить задачи",
      refreshing: "Обновляем...",
      offlineRefresh: "Подключитесь, чтобы обновить видео-задачи.",
      jobsFailed: "Ошибка задач",
      emptyTitle: "Пока нет сохраненных результатов",
      emptyBody: "Созданные фото сохраняются локально на этом устройстве для быстрого повторного использования.",
      videoJobs: "Видео-задачи",
      emptyJobs: "Поставьте видео из Студии, затем обновите здесь. Качество результата зависит от backend worker."
    },
    account: {
      title: "Аккаунт",
      offline: "Офлайн. Данные аккаунта могут быть устаревшими.",
      fallbackName: "Аккаунт DomStudio",
      verified: "Подтвержден",
      yes: "Да",
      no: "Нет",
      tokens: "Токены",
      refresh: "Обновить аккаунт",
      photos: "Фото",
      videos: "Видео",
      premiumVideos: "Премиум-видео",
      plan: "Тариф",
      planStatus: "Статус тарифа",
      renewal: "Продление",
      notScheduled: "Не запланировано",
      compliance: "Платежи и подписки можно добавить здесь после финальных решений по native compliance.",
      signOut: "Выйти"
    },
    settings: {
      title: "Настройки",
      offline: "офлайн",
      online: "онлайн",
      environment: "Окружение",
      apiUrl: "API URL",
      lanHelp: "Для Expo Go на телефоне используйте LAN IP компьютера. Android emulator обычно использует http://10.0.2.2:8000.",
      storage: "Память устройства",
      storageBody: "Локальная история созданных фото хранится на этом устройстве и может быть очищена в любой момент.",
      clearHistory: "Очистить локальную историю",
      readiness: "Готовность сборки",
      readinessBody1: "Камера, выбор из галереи, сохранение в медиа, secure tokens и native tabs включены.",
      readinessBody2: "Иконка, splash, Главная, Студия, Примеры и Тарифы используют бренд-систему DomStudio."
    },
    adpilot: {
      screenTitle: "AdPilot",
      tabConnection: "Подключение",
      tabProducts: "Товары",
      tabTools: "Инструменты",
      tabCreateDraft: "Создать черновик",
      tabDrafts: "Черновики",
      fillExample: "Заполнить примером",
      langAuto: "Авто",
      langEnglish: "English",
      langRussian: "Русский",
      lang: { auto: "Авто", english: "English", russian: "Русский" },
      generate: "Создать текст",
      generating: "Пишем…",
      generated: "Готово",
      generateFailed: "Ошибка генерации",
      variation: "Вариант",
      chars: "симв.",
      saveDraft: "Сохранить",
      copy: "Скопировать",
      adjust: "Улучшить",
      adjustLabel: "Доработать",
      adjustPlaceholder: "Сделать короче, официальнее, добавить CTA…",
      savedDraft: "Сохранено в черновики",
      savedDrafts: "Сохранённые копии",
      noSavedDrafts: "Пока нет сохранённых копий. Создайте текст и нажмите «Сохранить».",
      delete: "Удалить",
      copied: "Скопировано",
      marketplaceWebOnly: "Подключение маркетплейса, импорт товаров и публикация черновиков доступны в веб-приложении на domstudio.site."
    }
  }
} as const;

type StudioCopy = (typeof mobileCopy)[AppLanguage]["studio"];
type PricingCopy = (typeof mobileCopy)[AppLanguage]["pricing"];
type CommonCopy = (typeof mobileCopy)[AppLanguage]["common"];
type PricingPlanCardModel = {
  name: string;
  rawName: string;
  kicker: string;
  price: string;
  photos: string;
  videos: string;
  premium: string;
  tokens?: string;
  featured?: boolean;
};

function modesForLanguage(language: AppLanguage) {
  const modeCopy = mobileCopy[language].modes;
  return modes.map((mode) => ({
    ...mode,
    ...modeCopy[mode.id as keyof typeof modeCopy]
  }));
}

function workflowForLanguage(language: AppLanguage) {
  return mobileCopy[language].workflow;
}

function examplesForLanguage(language: AppLanguage) {
  const copy = mobileCopy[language].examplesData;
  return exampleImages.map((item, index) => ({
    ...item,
    ...copy.images[index]
  }));
}

function motionExamplesForLanguage(language: AppLanguage) {
  const copy = mobileCopy[language].examplesData;
  return motionExamples.map((item, index) => ({
    ...item,
    ...copy.motion[index]
  }));
}

function fallbackPlansForLanguage(language: AppLanguage) {
  const copy = mobileCopy[language].pricing;
  return pricingPlans.map((plan) => {
    const rawName = plan.name.toLowerCase() as keyof typeof copy.fallbackPlans;
    const localized = copy.fallbackPlans[rawName];
    return {
      ...plan,
      ...localized,
      kicker: copy.planKickers[rawName],
      price: localizeRubPrice(plan.price, copy),
      rawName,
      tokens: ""
    };
  });
}

const stylesList = [
  "clean marketplace card",
  "premium studio lighting",
  "social media creative",
  "warm lifestyle scene",
  "story-safe vertical composition"
];

const defaultStyleHint = stylesList[0] || "";

LogBox.ignoreAllLogs(true);

function friendlyError(error: unknown, fallback = "Please try again.") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function isOfflineState(value: ReturnType<typeof useNetInfo>) {
  return value.isConnected === false || value.isInternetReachable === false;
}

function planText(value?: number, limit?: number) {
  if (typeof value !== "number" || typeof limit !== "number") return "0 / 0";
  return `${value} / ${limit}`;
}

function usageStatus(copy: PricingCopy, value?: number, limit?: number) {
  const display = planText(value, limit);
  if (typeof value !== "number" || typeof limit !== "number") {
    return { display, overLimit: false, helper: "" };
  }
  if (limit <= 0) {
    return value > 0
      ? { display, overLimit: true, helper: `${value} ${copy.usageUsedNoAllowance}` }
      : { display, overLimit: false, helper: copy.usageNoAllowance };
  }
  if (value > limit) {
    return { display, overLimit: true, helper: `${value - limit} ${copy.usageOverPlanLimit}` };
  }
  return { display, overLimit: false, helper: `${limit - value} ${copy.usageRemaining}` };
}

function formatRubPrice(amount: number, copy: PricingCopy) {
  return `${amount.toLocaleString("ru-RU")} ${copy.currencyRub}`;
}

function localizeRubPrice(price: string, copy: PricingCopy) {
  return price.replace("RUB", copy.currencyRub);
}

function localizedPlanName(planName: string | undefined, copy: PricingCopy) {
  const key = (planName || "free").toLowerCase() as keyof typeof copy.fallbackPlans;
  return copy.fallbackPlans[key]?.name || (planName ? planName.charAt(0).toUpperCase() + planName.slice(1) : copy.fallbackPlans.free.name);
}

function planCardFromApi(plan: SubscriptionPlan, copy: PricingCopy) {
  const name = localizedPlanName(plan.name, copy);
  return {
    name,
    rawName: plan.name,
    kicker: copy.planKickers[plan.name as keyof typeof copy.planKickers] || copy.allModes,
    price: formatRubPrice(plan.price_rub, copy),
    photos: `${plan.photos} ${copy.photos.toLowerCase()}`,
    videos: `${plan.videos} ${copy.videos.toLowerCase()}`,
    premium: plan.premium_videos ? `${plan.premium_videos} ${copy.premium.toLowerCase()}` : copy.none,
    tokens: `${plan.tokens.toLocaleString("ru-RU")} ${copy.tokens.toLowerCase()}`,
    featured: plan.name === "pro"
  };
}

async function openPaymentUrl(paymentUrl: string) {
  const supported = await Linking.canOpenURL(paymentUrl);
  if (!supported) throw new Error("Cannot open payment URL on this device.");
  await Linking.openURL(paymentUrl);
}

async function resultToFile(result: ResultState): Promise<{ path: string; mimeType: string }> {
  const base64 = result.uri.split(",")[1];
  if (!base64) throw new Error("Missing result data");
  const rawFormat = String(result.meta.format || "png").toLowerCase();
  const format = rawFormat === "jpg" ? "jpeg" : rawFormat;
  const extension = format === "jpeg" ? "jpg" : format;
  const path = `${FileSystem.cacheDirectory}domstudio-result-${Date.now()}.${extension}`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64
  });
  return { path, mimeType: `image/${format}` };
}

function videoMime(format?: string | null) {
  const cleanFormat = String(format || "mp4").toLowerCase();
  if (cleanFormat.includes("webm")) return "video/webm";
  if (cleanFormat.includes("gif")) return "image/gif";
  return "video/mp4";
}

function videoExtension(format?: string | null) {
  const mime = videoMime(format);
  if (mime === "video/webm") return "webm";
  if (mime === "image/gif") return "gif";
  return "mp4";
}

function videoSourceFromJob(job: VideoJob): VideoSource | null {
  if (job.output_url) return { uri: job.output_url };
  if (!job.output_data) return null;
  return { uri: `data:${videoMime(job.output_format)};base64,${job.output_data}` };
}

async function videoJobToFile(job: VideoJob): Promise<{ path: string; mimeType: string }> {
  const extension = videoExtension(job.output_format);
  const mimeType = videoMime(job.output_format);
  const path = `${FileSystem.cacheDirectory}domstudio-video-${job.job_id}.${extension}`;
  if (job.output_data) {
    await FileSystem.writeAsStringAsync(path, job.output_data, {
      encoding: FileSystem.EncodingType.Base64
    });
    return { path, mimeType };
  }
  if (job.output_url) {
    const downloaded = await FileSystem.downloadAsync(job.output_url, path);
    return { path: downloaded.uri, mimeType };
  }
  throw new Error("Video output is not ready yet.");
}

export default function App() {
  const netInfo = useNetInfo();
  const offline = isOfflineState(netInfo);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [language, setLanguageState] = useState<AppLanguage>("en");

  async function completeAuth(nextTokens: Tokens) {
    await saveTokens(nextTokens);
    const profile = await loadMe(nextTokens.access_token);
    setTokens(nextTokens);
    setUser(profile);
  }

  async function refreshProfile(nextTokens = tokens) {
    if (!nextTokens) return;
    const profile = await loadMe(nextTokens.access_token);
    setUser(profile);
  }

  useEffect(() => {
    let active = true;
    async function boot() {
      try {
        const [savedTokens, savedHistory, savedLanguage] = await Promise.all([loadTokens(), loadLocalHistory(), loadLanguage()]);
        if (!active) return;
        setHistory(savedHistory);
        setLanguageState(savedLanguage);
        if (!savedTokens) return;
        try {
          const profile = await loadMe(savedTokens.access_token);
          if (!active) return;
          setTokens(savedTokens);
          setUser(profile);
        } catch {
          const rotated = await refreshTokens(savedTokens.refresh_token);
          await saveTokens(rotated);
          const profile = await loadMe(rotated.access_token);
          if (!active) return;
          setTokens(rotated);
          setUser(profile);
        }
      } catch {
        await clearTokens();
      } finally {
        if (active) setBooting(false);
      }
    }
    boot();
    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    const refresh = tokens?.refresh_token;
    await clearTokens();
    if (refresh) logout(refresh).catch(() => undefined);
    setTokens(null);
    setUser(null);
    setResult(null);
  }

  function rememberResult(nextResult: ResultState) {
    const item: LocalHistoryItem = {
      id: String(Date.now()),
      subject: nextResult.subject,
      mode: nextResult.modeLabel,
      uri: nextResult.uri,
      createdAt: Date.now(),
      width: nextResult.meta.width,
      height: nextResult.meta.height,
      format: nextResult.meta.format
    };
    setHistory((items) => {
      const next = [item, ...items].slice(0, 30);
      saveLocalHistory(next).catch(() => undefined);
      return next;
    });
  }

  async function clearHistory() {
    await clearLocalHistory();
    setHistory([]);
  }

  function setLanguage(language: AppLanguage) {
    setLanguageState(language);
    saveLanguage(language).catch(() => undefined);
  }

  if (booting) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.acid} />
          <Text style={styles.muted}>Opening DomStudio</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!user || !tokens ? (
            <RootStack.Screen name="Auth">
              {() => (
                <GuestTabs
                  completeAuth={completeAuth}
                  language={language}
                  offline={offline}
                  setLanguage={setLanguage}
                />
              )}
            </RootStack.Screen>
          ) : (
            <RootStack.Screen name="Main">
              {() => (
                <MainTabs
                  clearHistory={clearHistory}
                  history={history}
                  language={language}
                  offline={offline}
                  refreshProfile={refreshProfile}
                  rememberResult={rememberResult}
                  result={result}
                  setLanguage={setLanguage}
                  setResult={setResult}
                  signOut={signOut}
                  tokens={tokens}
                  user={user}
                />
              )}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function AuthScreen({
  completeAuth,
  language = "en",
  offline
}: {
  completeAuth: (tokens: Tokens) => Promise<void>;
  language?: AppLanguage;
  offline: boolean;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingContact, setPendingContact] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = mobileCopy[language].auth;
  const common = mobileCopy[language].common;

  async function runNetworkTask(task: () => Promise<void>, title: string) {
    if (offline) {
      Alert.alert(common.offlineTitle, copy.continueOnline);
      return;
    }
    setLoading(true);
    try {
      await task();
    } catch (error) {
      Alert.alert(title, friendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  function authTitle() {
    if (mode === "register") return copy.createAccount;
    if (mode === "verifyEmail" || mode === "verifyPhone") return copy.enterCode;
    if (mode === "phone") return copy.phoneLogin;
    if (mode === "forgot") return copy.resetPassword;
    if (mode === "reset") return copy.newPassword;
    return copy.signIn;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.authPage} keyboardShouldPersistTaps="always">
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>DS</Text></View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        <ProofShowcase language={language} />
        {offline ? <Banner tone="warn" text={copy.offline} /> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{authTitle()}</Text>

          {mode === "login" || mode === "register" || mode === "forgot" || mode === "reset" ? (
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={copy.email}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          ) : null}

          {mode === "login" || mode === "register" ? (
            <TextInput
              placeholder={copy.password}
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          ) : null}

          {mode === "phone" ? (
            <TextInput
              keyboardType="phone-pad"
              placeholder={copy.phone}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />
          ) : null}

          {mode === "verifyEmail" || mode === "verifyPhone" || mode === "reset" ? (
            <TextInput
              keyboardType="number-pad"
              maxLength={8}
              placeholder={copy.code}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={code}
              onChangeText={setCode}
            />
          ) : null}

          {mode === "reset" ? (
            <TextInput
              placeholder={copy.newPassword}
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
          ) : null}

          {mode === "login" ? (
            <PrimaryButton
              disabled={loading}
              label={copy.openStudio}
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim() || !password) throw new Error(copy.enterEmailPassword);
                  await completeAuth(await loginEmail(email.trim(), password));
                }, copy.loginFailed)
              }
            />
          ) : null}

          {mode === "register" ? (
            <PrimaryButton
              disabled={loading}
              label={copy.sendEmailCode}
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim() || password.length < 8) throw new Error(copy.emailPasswordRules);
                  await registerEmail(email.trim(), password);
                  setPendingContact(email.trim());
                  setCode("");
                  setMode("verifyEmail");
                }, copy.registrationFailed)
              }
            />
          ) : null}

          {mode === "verifyEmail" ? (
            <PrimaryButton
              disabled={loading}
              label={copy.verifyEmail}
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!pendingContact || !code.trim()) throw new Error(copy.enterEmailCode);
                  await completeAuth(await verifyEmail(pendingContact, code.trim()));
                }, copy.verificationFailed)
              }
            />
          ) : null}

          {mode === "phone" ? (
            <PrimaryButton
              disabled={loading}
              label={copy.sendPhoneCode}
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!phone.trim()) throw new Error(copy.enterPhone);
                  await loginPhone(phone.trim());
                  setPendingContact(phone.trim());
                  setCode("");
                  setMode("verifyPhone");
                }, copy.phoneLoginFailed)
              }
            />
          ) : null}

          {mode === "verifyPhone" ? (
            <PrimaryButton
              disabled={loading}
              label={copy.verifyPhone}
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!pendingContact || !code.trim()) throw new Error(copy.enterSmsCode);
                  await completeAuth(await verifyPhone(pendingContact, code.trim()));
                }, copy.verificationFailed)
              }
            />
          ) : null}

          {mode === "forgot" ? (
            <PrimaryButton
              disabled={loading}
              label={copy.sendResetCode}
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim()) throw new Error(copy.enterEmail);
                  await forgotPassword(email.trim());
                  setCode("");
                  setMode("reset");
                }, copy.resetFailed)
              }
            />
          ) : null}

          {mode === "reset" ? (
            <PrimaryButton
              disabled={loading}
              label={copy.saveNewPassword}
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim() || !code.trim() || newPassword.length < 8) {
                    throw new Error(copy.enterResetFields);
                  }
                  await completeAuth(await resetPassword(email.trim(), code.trim(), newPassword));
                }, copy.passwordResetFailed)
              }
            />
          ) : null}

          <View style={styles.linkRow}>
            <LinkButton label={mode === "login" ? copy.createAccount : copy.emailLogin} onPress={() => setMode(mode === "login" ? "register" : "login")} />
            <LinkButton label={copy.phoneOtp} onPress={() => setMode("phone")} />
            <LinkButton label={copy.forgot} onPress={() => setMode("forgot")} />
          </View>
          <Text style={styles.smallMuted}>API: {API_URL}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MainTabs(props: {
  clearHistory: () => Promise<void>;
  history: LocalHistoryItem[];
  language: AppLanguage;
  offline: boolean;
  refreshProfile: () => Promise<void>;
  rememberResult: (result: ResultState) => void;
  result: ResultState | null;
  setLanguage: (language: AppLanguage) => void;
  setResult: (result: ResultState | null) => void;
  signOut: () => Promise<void>;
  tokens: Tokens;
  user: UserProfile;
}) {
  const copy = mobileCopy[props.language];
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.nativeTabBar,
        tabBarItemStyle: styles.nativeTabItem,
        tabBarLabelStyle: styles.nativeTabText
      }}
    >
      <Tabs.Screen name="Home" options={{ tabBarLabel: copy.tabs.home, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="home" /> }}>
        {({ navigation }) => (
          <HomeScreen
            language={props.language}
            offline={props.offline}
            setLanguage={props.setLanguage}
            tokens={props.user.tokens ?? 0}
            onCreate={() => navigation.navigate("Studio")}
            onExamples={() => navigation.navigate("Examples")}
            onPricing={() => navigation.navigate("Pricing")}
          />
        )}
      </Tabs.Screen>
      <Tabs.Screen name="Studio" options={{ tabBarLabel: copy.tabs.studio, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="studio" /> }}>
        {() => <StudioScreen {...props} />}
      </Tabs.Screen>
      <Tabs.Screen name="AdPilot" options={{ tabBarLabel: copy.tabs.adpilot, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="adpilot" /> }}>
        {() => <AdPilotScreen language={props.language} offline={props.offline} tokens={props.tokens} user={props.user} />}
      </Tabs.Screen>
      <Tabs.Screen name="Examples" options={{ tabBarLabel: copy.tabs.examples, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="examples" /> }}>
        {({ navigation }) => <ExamplesScreen language={props.language} onCreate={() => navigation.navigate("Studio")} />}
      </Tabs.Screen>
      <Tabs.Screen name="Pricing" options={{ tabBarLabel: copy.tabs.pricing, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="pricing" /> }}>
        {() => <PricingScreen {...props} language={props.language} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

function GuestTabs({
  completeAuth,
  language,
  offline,
  setLanguage
}: {
  completeAuth: (tokens: Tokens) => Promise<void>;
  language: AppLanguage;
  offline: boolean;
  setLanguage: (language: AppLanguage) => void;
}) {
  const copy = mobileCopy[language];

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.nativeTabBar,
        tabBarItemStyle: styles.nativeTabItem,
        tabBarLabelStyle: styles.nativeTabText
      }}
    >
      <Tabs.Screen name="Home" options={{ tabBarLabel: copy.tabs.home, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="home" /> }}>
        {({ navigation }) => (
          <HomeScreen
            language={language}
            offline={offline}
            setLanguage={setLanguage}
            tokens={3000}
            onCreate={() => navigation.navigate("Studio")}
            onExamples={() => navigation.navigate("Examples")}
            onPricing={() => navigation.navigate("Pricing")}
          />
        )}
      </Tabs.Screen>
      <Tabs.Screen name="Studio" options={{ tabBarLabel: copy.tabs.studio, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="studio" /> }}>
        {() => <AuthScreen completeAuth={completeAuth} language={language} offline={offline} />}
      </Tabs.Screen>
      <Tabs.Screen name="Examples" options={{ tabBarLabel: copy.tabs.examples, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="examples" /> }}>
        {({ navigation }) => <ExamplesScreen language={language} onCreate={() => navigation.navigate("Studio")} />}
      </Tabs.Screen>
      <Tabs.Screen name="Pricing" options={{ tabBarLabel: copy.tabs.pricing, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="pricing" /> }}>
        {({ navigation }) => <PublicPricingScreen language={language} onSignIn={() => navigation.navigate("Studio")} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

function HomeScreen({
  language,
  offline,
  onCreate,
  onExamples,
  onPricing,
  setLanguage,
  tokens
}: {
  language: AppLanguage;
  offline: boolean;
  onCreate: () => void;
  onExamples: () => void;
  onPricing: () => void;
  setLanguage: (language: AppLanguage) => void;
  tokens: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = mobileCopy[language].home;
  const nextLanguage: AppLanguage = language === "en" ? "ru" : "en";
  const localizedModes = modesForLanguage(language);
  const workflow = workflowForLanguage(language);

  function runMenuAction(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <SafeAreaView style={styles.homeSafe}>
      <ScrollView contentContainerStyle={styles.homePage} keyboardShouldPersistTaps="handled">
        <View style={styles.homeTopBar}>
          <View style={styles.homeBrandWrap}>
            <View style={styles.homeBrandMark}><Text style={styles.homeBrandText}>DS</Text></View>
            <Text style={styles.homeBrandWord}>Dom<Text style={styles.homeBrandWordAccent}>Studio</Text></Text>
          </View>
          <View style={styles.homeTopActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle language"
              style={({ pressed }) => [styles.homeRoundButton, pressed && styles.homeRoundButtonPressed]}
              onPress={() => setLanguage(nextLanguage)}
            >
              <Text style={styles.homeRoundText}>{nextLanguage.toUpperCase()}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              style={({ pressed }) => [styles.homeRoundButton, pressed && styles.homeRoundButtonPressed]}
              onPress={() => setMenuOpen(true)}
            >
              <View style={styles.homeMenuLine} />
              <View style={styles.homeMenuLine} />
            </Pressable>
          </View>
        </View>

        <View style={styles.homeHero}>
          <GridBackdrop />
          <View style={styles.homeEyebrowRow}>
            <View style={styles.homeEyebrowLine} />
            <Text style={styles.homeEyebrow}>{copy.eyebrow}</Text>
          </View>
          <Text style={styles.homeTitle}>
            {copy.titleA} <Text style={styles.homeSellText}>{copy.titleB}</Text>
          </Text>
          <Text style={styles.homeCopy}>{copy.body}</Text>
          <Pressable style={styles.homeCta} onPress={onCreate}>
            <Text style={styles.homeCtaText}>{copy.create}</Text>
          </Pressable>
          <Pressable style={styles.homeSecondaryCta} onPress={onPricing}>
            <Text style={styles.homeSecondaryCtaText}>{copy.pricing}</Text>
          </Pressable>
          <View style={styles.homeTrustRow}>
            <Text style={styles.homeTrustText}>{copy.trust1}</Text>
            <Text style={styles.homeTrustText}>{copy.trust2}</Text>
            <Text style={styles.homeTrustText}>{copy.trust3}</Text>
          </View>
          {offline ? <Text style={styles.homeOffline}>{copy.offline}</Text> : null}
        </View>

        <View style={styles.homeMiniStudio}>
          <View style={styles.homeMiniHead}>
            <Text style={styles.homeMiniKicker}>{copy.mini}</Text>
            <Text style={styles.homeMiniMeta}>{copy.platforms}</Text>
          </View>
          <View style={styles.homeProofStrip}>
            <View style={styles.homeProofSlot}>
              <Image source={proofBefore} style={styles.homeProofContain} />
              <View style={styles.homeDarkBadge}><Text style={styles.homeDarkBadgeText}>{copy.before}</Text></View>
            </View>
            <View style={styles.homeProofSlot}>
              <Image source={proofAfter} style={styles.homeProofCover} />
              <View style={styles.homeGoldBadge}><Text style={styles.homeGoldBadgeText}>{copy.after}</Text></View>
            </View>
            <View style={styles.homeProofSlot}>
              <AutoplayVideo source={proofVideo} style={styles.homeProofVideo} />
              <View style={styles.homeGoldBadge}><Text style={styles.homeGoldBadgeText}>{copy.video}</Text></View>
            </View>
          </View>

          <View style={styles.homeUploadBox}>
            <Text style={styles.homeUploadLabel}>{copy.productPhoto}</Text>
            <Pressable style={styles.homeUploadButton} onPress={onCreate}>
              <Text style={styles.homeUploadText}>{copy.upload}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.homeModeTeaser}>
          <Text style={styles.homeModeTitle}>{copy.teaserTitle}</Text>
          <Text style={styles.homeModeSub}>{copy.teaserBody}</Text>
          <View style={styles.homeTokenInline}>
            <Text style={styles.homeTokenValue}>{tokens}</Text>
            <Text style={styles.homeTokenLabel}>{copy.tokensReady}</Text>
          </View>
        </View>

        <View style={styles.homeProofSection}>
          <View style={styles.webSectionHead}>
            <Text style={styles.webSectionTitleHighlight}>{copy.proofTitle}</Text>
            <Text style={styles.webSectionCopy}>{copy.proofBody}</Text>
          </View>
          <View style={styles.homeProofLarge}>
            <View style={styles.homeProofSlot}>
              <Image source={proofBefore} style={styles.homeProofContain} />
              <View style={styles.homeDarkBadge}><Text style={styles.homeDarkBadgeText}>{copy.before}</Text></View>
            </View>
            <View style={styles.homeProofSlot}>
              <Image source={proofAfter} style={styles.homeProofCover} />
              <View style={styles.homeGoldBadge}><Text style={styles.homeGoldBadgeText}>{copy.after}</Text></View>
            </View>
            <View style={styles.homeProofSlot}>
              <AutoplayVideo source={proofVideo} style={styles.homeProofVideo} />
              <View style={styles.homeGoldBadge}><Text style={styles.homeGoldBadgeText}>{copy.video}</Text></View>
            </View>
          </View>
          <View style={styles.homeProofStats}>
            <View style={styles.homeProofStat}>
              <Text style={styles.homeProofStatValue}>30</Text>
              <Text style={styles.homeProofStatText}>{copy.stat1}</Text>
            </View>
            <View style={styles.homeProofStat}>
              <Text style={styles.homeProofStatValue}>{copy.entryPrice}</Text>
              <Text style={styles.homeProofStatText}>{copy.stat2}</Text>
            </View>
            <View style={styles.homeProofStat}>
              <Text style={styles.homeProofStatValue}>9:16</Text>
              <Text style={styles.homeProofStatText}>{copy.stat3}</Text>
            </View>
          </View>
        </View>

        <View style={styles.homeModesSection}>
          <View style={styles.webSectionHead}>
            <Text style={styles.webSectionTitle}>{copy.modesTitle}</Text>
            <Text style={styles.webSectionCopy}>{copy.modesBody}</Text>
          </View>
          <View style={styles.homeModesList}>
            {localizedModes.map((item, index) => (
              <View key={item.id} style={styles.homeWebModeCard}>
                <View style={styles.homeWebModeVisual}>
                  <Image source={item.preview} style={styles.homeWebModeImage} />
                  <View style={styles.homeWebModeBefore}>
                    <Image source={item.before} style={styles.homeWebModeBeforeImage} />
                    <Text style={styles.homeWebModeBeforeLabel}>{copy.before}</Text>
                  </View>
                  <View style={styles.homeWebModeAfterLabel}><Text style={styles.homeGoldBadgeText}>{copy.after}</Text></View>
                </View>
                <View style={styles.homeWebModeBody}>
                  <View style={styles.homeWebModeTopline}>
                    <Text style={styles.homeWebModeNumber}>0{index + 1}</Text>
                    <Text style={styles.homeWebModeTag}>{item.tag}</Text>
                  </View>
                  <Text style={styles.homeWebModeTitle}>{item.label}</Text>
                  <Text style={styles.homeWebModeText}>{item.hint}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.homeWorkflowSection}>
          <View style={styles.webSectionHead}>
            <Text style={styles.homeWorkflowTitle}>{copy.workflowTitle}</Text>
            <Text style={styles.homeWorkflowCopy}>{copy.workflowBody}</Text>
          </View>
          {workflow.map((step) => (
            <View key={step.number} style={styles.homeWorkflowStep}>
              <Text style={styles.homeWorkflowNumber}>{step.number}</Text>
              <Text style={styles.homeWorkflowStepTitle}>{step.title}</Text>
              <Text style={styles.homeWorkflowStepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Modal animationType="fade" transparent visible={menuOpen} onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.homeMenuPanel} onPress={() => undefined}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuTitle}>DomStudio</Text>
            <Text style={styles.menuSub}>{copy.menuSub}</Text>
            <Pressable style={styles.menuItem} onPress={() => runMenuAction(onCreate)}>
              <Text style={styles.menuItemText}>{copy.menuCreate}</Text>
              <Text style={styles.menuItemMeta}>{copy.menuCreateMeta}</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => runMenuAction(onExamples)}>
              <Text style={styles.menuItemText}>{copy.menuExamples}</Text>
              <Text style={styles.menuItemMeta}>{copy.menuExamplesMeta}</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => runMenuAction(onPricing)}>
              <Text style={styles.menuItemText}>{copy.menuPricing}</Text>
              <Text style={styles.menuItemMeta}>{copy.menuPricingMeta}</Text>
            </Pressable>
            <Pressable style={styles.menuCloseButton} onPress={() => setMenuOpen(false)}>
              <Text style={styles.menuCloseText}>{copy.close}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ExamplesScreen({ language, onCreate }: { language: AppLanguage; onCreate: () => void }) {
  const copy = mobileCopy[language].examples;
  const localizedExamples = examplesForLanguage(language);
  const localizedMotionExamples = motionExamplesForLanguage(language);
  return (
    <SafeAreaView style={styles.homeSafe}>
      <ScrollView contentContainerStyle={styles.examplesPage}>
        <View style={styles.examplesHero}>
          <GridBackdrop />
          <View style={styles.homeEyebrowRow}>
            <View style={styles.homeEyebrowLine} />
            <Text style={styles.homeEyebrow}>{copy.eyebrow}</Text>
          </View>
          <Text style={styles.examplesTitle}>{copy.title}</Text>
          <Text style={styles.examplesSub}>{copy.body}</Text>
          <View style={styles.examplesStrip}>
            <Text style={styles.examplesBadge}>{copy.badge1}</Text>
            <Text style={styles.examplesBadge}>{copy.badge2}</Text>
            <Text style={styles.examplesBadge}>{copy.badge3}</Text>
          </View>
          <Pressable style={styles.examplesCta} onPress={onCreate}>
            <Text style={styles.examplesCtaText}>{copy.cta}</Text>
          </Pressable>
        </View>

        <View style={styles.exampleGalleryGrid}>
          {localizedExamples.map((item) => (
            <View key={`${item.product}-${item.title}`} style={[styles.exampleGalleryCard, item.wide && styles.exampleGalleryWide]}>
              {item.video ? (
                <View style={styles.exampleVideoPair}>
                  <View style={styles.exampleVideoHalf}>
                    <Image source={item.src} style={styles.exampleImage} />
                  </View>
                  <View style={styles.exampleVideoHalf}>
                    <AutoplayVideo source={item.video} style={styles.exampleVideo} />
                  </View>
                  <View style={styles.modeTag}><Text style={styles.modeTagText}>{item.mode}</Text></View>
                </View>
              ) : (
                <View style={styles.exampleImageWrap}>
                  <Image source={item.src} style={[styles.exampleImage, item.portrait && styles.exampleImagePortrait]} />
                  <View style={styles.modeTag}><Text style={styles.modeTagText}>{item.mode}</Text></View>
                </View>
              )}
              <Text style={styles.exampleTitle}>{item.title}</Text>
              <Text style={styles.exampleText}>{item.product}</Text>
            </View>
          ))}
          {localizedMotionExamples.map((item) => (
            <View key={`${item.product}-${item.title}`} style={[styles.exampleGalleryCard, styles.exampleGalleryWide]}>
              <View style={styles.exampleVideoPair}>
                <View style={styles.exampleVideoHalf}>
                  <Image source={item.src} style={styles.exampleImage} />
                </View>
                <View style={styles.exampleVideoHalf}>
                  <AutoplayVideo source={item.video} style={styles.exampleVideo} />
                </View>
                <View style={styles.modeTag}><Text style={styles.modeTagText}>{item.mode}</Text></View>
              </View>
              <Text style={styles.exampleTitle}>{item.title}</Text>
              <Text style={styles.exampleText}>{item.product}</Text>
            </View>
          ))}
        </View>
        <View style={styles.examplesBottomCta}>
          <Text style={styles.examplesBottomTitle}>{copy.bottom}</Text>
          <Pressable style={styles.examplesCta} onPress={onCreate}>
            <Text style={styles.examplesCtaText}>{copy.openStudio}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PricingScreen({
  language,
  offline,
  refreshProfile,
  signOut,
  tokens,
  user
}: {
  language: AppLanguage;
  offline: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  tokens: Tokens;
  user: UserProfile;
}) {
  const sub = user.subscription;
  const copy = mobileCopy[language].pricing;
  const photosUsage = usageStatus(copy, sub?.photos_used, sub?.photos_limit);
  const videosUsage = usageStatus(copy, sub?.videos_used, sub?.videos_limit);
  const premiumUsage = usageStatus(copy, sub?.premium_videos_used, sub?.premium_videos_limit);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [checkoutPendingRefresh, setCheckoutPendingRefresh] = useState(false);

  const planCards = plans.length ? plans.map((plan) => planCardFromApi(plan, copy)) : fallbackPlansForLanguage(language);

  async function refreshPricingData() {
    if (offline) {
      Alert.alert(mobileCopy[language].common.offlineTitle, copy.offlineRefresh);
      return;
    }
    setPricingLoading(true);
    try {
      const [nextPlans, nextPacks, nextPayments] = await Promise.all([
        listPlans(),
        listTokenPacks(),
        listPaymentHistory(tokens.access_token)
      ]);
      setPlans(nextPlans);
      setPacks(nextPacks);
      setPayments(nextPayments);
      await refreshProfile();
    } catch (error) {
      Alert.alert(copy.pricingFailed, friendlyError(error));
    } finally {
      setPricingLoading(false);
    }
  }

  useEffect(() => {
    if (!offline) refreshPricingData().catch(() => undefined);
  }, [offline, tokens.access_token]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && checkoutPendingRefresh && !offline) {
        setCheckoutPendingRefresh(false);
        refreshPricingData().catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, [checkoutPendingRefresh, offline, tokens.access_token]);

  async function buyPlan(plan: string) {
    if (offline) {
      Alert.alert(mobileCopy[language].common.offlineTitle, copy.offlineCheckout);
      return;
    }
    if (plan === "free") {
      Alert.alert(copy.freePlanTitle, copy.freePlanBody);
      return;
    }
    setPaymentLoading(`plan:${plan}`);
    try {
      const payment = await initPlanPayment(tokens.access_token, plan);
      setCheckoutPendingRefresh(true);
      await openPaymentUrl(payment.payment_url);
    } catch (error) {
      setCheckoutPendingRefresh(false);
      Alert.alert(copy.paymentFailed, friendlyError(error));
    } finally {
      setPaymentLoading(null);
    }
  }

  async function buyPack(packId: string) {
    if (offline) {
      Alert.alert(mobileCopy[language].common.offlineTitle, copy.offlineCheckout);
      return;
    }
    setPaymentLoading(`pack:${packId}`);
    try {
      const payment = await initTopUpPayment(tokens.access_token, packId);
      setCheckoutPendingRefresh(true);
      await openPaymentUrl(payment.payment_url);
    } catch (error) {
      setCheckoutPendingRefresh(false);
      Alert.alert(copy.topupFailed, friendlyError(error));
    } finally {
      setPaymentLoading(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.pricingPage}>
        <PricingHero copy={copy} />

        {offline ? <Banner tone="warn" text={copy.offline} /> : null}
        {checkoutPendingRefresh ? <Banner tone="ok" text={copy.checkoutReturn} /> : null}

        <View style={styles.pricingAccountPanel}>
          <View style={styles.pricingAccountTop}>
            <View style={styles.flex}>
              <Text style={styles.pricingPanelKicker}>{copy.accountLabel}</Text>
              <Text style={styles.pricingAccountName} numberOfLines={1}>{user.email || user.phone || "DomStudio account"}</Text>
            </View>
            <View style={styles.pricingTokenBadge}>
              <Text style={styles.pricingTokenValue}>{user.tokens ?? 0}</Text>
              <Text style={styles.pricingTokenLabel}>{copy.tokens}</Text>
            </View>
          </View>
          <View style={styles.pricingPlanLine}>
            <Text style={styles.pricingPlanLabel}>{copy.planLabel}</Text>
            <Text style={styles.pricingPlanValue}>{localizedPlanName(sub?.plan, copy)}</Text>
          </View>
          <SecondaryButton disabled={offline || pricingLoading} label={pricingLoading ? copy.refreshing : copy.refresh} onPress={refreshPricingData} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard helper={photosUsage.helper} label={copy.photos} tone={photosUsage.overLimit ? "warn" : "default"} value={photosUsage.display} />
          <StatCard helper={videosUsage.helper} label={copy.videos} tone={videosUsage.overLimit ? "warn" : "default"} value={videosUsage.display} />
          <StatCard helper={premiumUsage.helper} label={copy.premium} tone={premiumUsage.overLimit ? "warn" : "default"} value={premiumUsage.display} />
          <StatCard label={copy.renewal} value={sub?.renews_at ? new Date(sub.renews_at).toLocaleDateString() : copy.none} />
        </View>

        <View style={styles.planList}>
          {planCards.map((plan) => (
            <PricingPlanCard
              copy={copy}
              disabled={offline || plan.rawName === "free" || paymentLoading === `plan:${plan.rawName}`}
              key={plan.name}
              loading={paymentLoading === `plan:${plan.rawName}`}
              onPress={() => buyPlan(plan.rawName)}
              plan={plan}
            />
          ))}
        </View>

        <View style={styles.pricingPanel}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{copy.tokenTopups}</Text>
              <Text style={styles.muted}>{copy.tokenTopupsBody}</Text>
            </View>
          </View>
          {packs.length ? (
            packs.map((pack) => (
              <View key={pack.pack_id} style={styles.packRow}>
                <View style={styles.flex}>
                  <Text style={styles.historyTitle}>{pack.tokens.toLocaleString("ru-RU")} {copy.tokens.toLowerCase()}</Text>
                  <Text style={styles.muted}>~{Math.floor(pack.tokens / 100)} {copy.photos.toLowerCase()} - {formatRubPrice(pack.price_rub, copy)}</Text>
                </View>
                <SecondaryButton
                  disabled={offline || paymentLoading === `pack:${pack.pack_id}`}
                  label={paymentLoading === `pack:${pack.pack_id}` ? copy.opening : copy.buy}
                  onPress={() => buyPack(pack.pack_id)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.muted}>{copy.tokenPacksLoad}</Text>
          )}
        </View>

        <View style={styles.pricingPanel}>
          <Text style={styles.cardTitle}>{copy.paymentHistory}</Text>
          {payments.length ? (
            payments.slice(0, 5).map((payment) => (
              <View key={payment.id} style={styles.paymentRow}>
                <View style={styles.flex}>
                  <Text style={styles.historyTitle}>{payment.plan || copy.topup}</Text>
                  <Text style={styles.muted}>{payment.provider} - {payment.status}</Text>
                </View>
                <Text style={styles.paymentAmount}>{formatRubPrice(payment.amount_rub, copy)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>{copy.noPayments}</Text>
          )}
        </View>

        <SecondaryButton label={copy.signOut} onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PublicPricingScreen({ language, onSignIn }: { language: AppLanguage; onSignIn: () => void }) {
  const copy = mobileCopy[language].pricing;
  const planCards = fallbackPlansForLanguage(language);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.pricingPage}>
        <PricingHero copy={copy} />

        <Banner tone="ok" text={copy.publicNote} />

        <View style={styles.planList}>
          {planCards.map((plan) => (
            <PricingPlanCard copy={copy} key={plan.name} onPress={onSignIn} plan={plan} publicCta />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PricingHero({ copy }: { copy: PricingCopy }) {
  return (
    <View style={styles.pricingHero}>
      <GridBackdrop />
      <View style={styles.pricingHeroCopy}>
        <Text style={styles.pricingKicker}>{copy.eyebrow}</Text>
        <Text style={styles.pricingTitle}>{copy.title}</Text>
        <Text style={styles.pricingBody}>{copy.body}</Text>
      </View>
      <View style={styles.pricingHeroMetrics}>
        <View style={styles.pricingHeroMetric}>
          <Text style={styles.pricingHeroStatValue}>{formatRubPrice(270, copy)}</Text>
          <Text style={styles.pricingHeroStatLabel}>{copy.entryBatch}</Text>
        </View>
        <View style={styles.pricingHeroMetric}>
          <Text style={styles.pricingHeroStatValue}>100+</Text>
          <Text style={styles.pricingHeroStatLabel}>{copy.sellerAssets}</Text>
        </View>
        <View style={styles.pricingHeroMetric}>
          <Text style={styles.pricingHeroStatValue}>4</Text>
          <Text style={styles.pricingHeroStatLabel}>{copy.plansLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function PricingPlanCard({
  copy,
  disabled,
  loading,
  onPress,
  plan,
  publicCta
}: {
  copy: PricingCopy;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  plan: PricingPlanCardModel;
  publicCta?: boolean;
}) {
  const features = [plan.photos, plan.videos, plan.premium, plan.tokens, copy.allModes].filter(Boolean) as string[];
  const buttonLabel = publicCta
    ? copy.publicCta
    : loading
      ? copy.openingCheckout
      : plan.rawName === "free"
        ? copy.currentStarter
        : `${copy.upgradePrefix} ${plan.name}`;

  return (
    <View style={[styles.planCard, plan.featured && styles.planCardFeatured]}>
      <View style={styles.planTopRow}>
        <View style={styles.flex}>
          <Text style={[styles.planKicker, plan.featured && styles.planKickerFeatured]}>{plan.kicker}</Text>
          <Text style={[styles.planName, plan.featured && styles.planFeaturedText]}>{plan.name}</Text>
        </View>
        {plan.featured ? <Text style={styles.planBestBadge}>{copy.bestValue}</Text> : null}
      </View>
      <Text style={[styles.planPrice, plan.featured && styles.planPriceFeatured]}>{plan.price}</Text>
      <View style={styles.planFeatureList}>
        {features.map((feature) => (
          <View key={feature} style={styles.planFeatureRow}>
            <Text style={[styles.planCheck, plan.featured && styles.planCheckFeatured]}>+</Text>
            <Text style={[styles.planLine, plan.featured && styles.planLineFeatured]}>{feature}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton
        disabled={disabled}
        label={buttonLabel}
        loading={loading}
        onPress={onPress}
      />
    </View>
  );
}

function GridBackdrop() {
  return (
    <View pointerEvents="none" style={styles.gridBackdrop}>
      <View style={[styles.gridLineVertical, { left: "22%" }]} />
      <View style={[styles.gridLineVertical, { left: "48%" }]} />
      <View style={[styles.gridLineVertical, { left: "74%" }]} />
      <View style={[styles.gridLineHorizontal, { top: "28%" }]} />
      <View style={[styles.gridLineHorizontal, { top: "58%" }]} />
      <View style={[styles.gridGlow, { left: "18%", bottom: -60 }]} />
      <View style={[styles.gridGlow, { right: "12%", bottom: 30 }]} />
    </View>
  );
}

function AutoplayVideo({ source, style }: { source: VideoSource; style?: StyleProp<ViewStyle> }) {
  const player = useVideoPlayer(source, (nextPlayer) => {
    nextPlayer.loop = true;
    nextPlayer.muted = true;
    nextPlayer.play();
  });

  return (
    <VideoView
      allowsFullscreen={false}
      contentFit="cover"
      nativeControls={false}
      player={player}
      playsInline
      style={style}
    />
  );
}

function PlaybackVideo({ source, style }: { source: VideoSource; style?: StyleProp<ViewStyle> }) {
  const player = useVideoPlayer(source, (nextPlayer) => {
    nextPlayer.loop = true;
    nextPlayer.muted = false;
  });

  return (
    <VideoView
      allowsFullscreen
      contentFit="contain"
      nativeControls
      player={player}
      playsInline
      style={style}
    />
  );
}

function StudioScreen({
  language,
  offline,
  refreshProfile,
  rememberResult,
  result,
  setResult,
  tokens,
  user
}: {
  language: AppLanguage;
  offline: boolean;
  refreshProfile: () => Promise<void>;
  rememberResult: (result: ResultState) => void;
  result: ResultState | null;
  setResult: (result: ResultState | null) => void;
  tokens: Tokens;
  user: UserProfile;
}) {
  const copy = mobileCopy[language].studio;
  const common = mobileCopy[language].common;
  const localizedModes = useMemo(() => modesForLanguage(language), [language]);
  const [mode, setMode] = useState("catalog");
  const [subject, setSubject] = useState("");
  const [styleHint, setStyleHint] = useState<string>(copy.styleHints[0] || defaultStyleHint);
  const [upscale, setUpscale] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PickedImage | null>(null);
  const [generating, setGenerating] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoJob, setVideoJob] = useState<VideoJob | null>(null);

  const activeMode = useMemo(() => localizedModes.find((item) => item.id === mode) || localizedModes[0], [localizedModes, mode]);

  useEffect(() => {
    if (!(copy.styleHints as readonly string[]).includes(styleHint)) {
      setStyleHint(copy.styleHints[0] || defaultStyleHint);
    }
  }, [copy.styleHints, styleHint]);

  async function pickImage(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(common.permissionNeeded, source === "camera" ? common.photoPermissionCamera : common.photoPermissionLibrary);
      return;
    }
    const picked =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.88, base64: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.88, base64: true });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    if (!asset?.uri || !asset.base64) return;
    setSelectedImage({
      uri: asset.uri,
      base64: asset.base64,
      name: asset.fileName || (source === "camera" ? "camera-photo" : "product-photo")
    });
  }

  async function createPhoto() {
    if (offline) {
      Alert.alert(common.offlineTitle, copy.offlineGenerate);
      return;
    }
    if (!subject.trim()) {
      Alert.alert(copy.addPromptTitle, copy.describePhoto);
      return;
    }
    setGenerating(true);
    try {
      const response = await generateImage(tokens.access_token, {
        mode,
        subject: subject.trim(),
        style_hint: styleHint.trim(),
        image: selectedImage?.base64 || null,
        upscale_4k: upscale
      });
      if (!response.image) throw new Error(copy.noImageReturned);
      const format = String(response.format || "png").toLowerCase();
      const nextResult = {
        uri: `data:image/${format};base64,${response.image}`,
        meta: response,
        subject: subject.trim(),
        modeLabel: activeMode?.label || mode
      };
      setResult(nextResult);
      rememberResult(nextResult);
      await refreshProfile();
    } catch (error) {
      Alert.alert(copy.generationFailed, friendlyError(error));
    } finally {
      setGenerating(false);
    }
  }

  async function queueVideo() {
    if (offline) {
      Alert.alert(common.offlineTitle, copy.offlineQueue);
      return;
    }
    if (!selectedImage?.base64) {
      Alert.alert(copy.addPhotoTitle, copy.choosePhotoFirst);
      return;
    }
    if (!subject.trim()) {
      Alert.alert(copy.addPromptTitle, copy.describeVideo);
      return;
    }
    setVideoLoading(true);
    try {
      const job = await generateVideo(tokens.access_token, {
        mode,
        subject: subject.trim(),
        style_hint: styleHint.trim(),
        image: selectedImage.base64,
        duration_s: 3,
        video_provider: "local"
      });
      setVideoJob(job);
      Alert.alert(copy.videoQueued, copy.videoQueuedBody);
      await refreshProfile();
    } catch (error) {
      Alert.alert(copy.videoFailed, friendlyError(error));
    } finally {
      setVideoLoading(false);
    }
  }

  async function refreshVideoJob() {
    if (!videoJob) return;
    if (offline) {
      Alert.alert(common.offlineTitle, copy.offlineRefreshVideo);
      return;
    }
    setVideoLoading(true);
    try {
      setVideoJob(await getVideoJob(tokens.access_token, videoJob.job_id));
      await refreshProfile();
    } catch (error) {
      Alert.alert(copy.refreshFailed, friendlyError(error));
    } finally {
      setVideoLoading(false);
    }
  }

  return (
    <Screen title={copy.title} kicker={`${user.tokens ?? 0} ${copy.tokens}`}>
      {offline ? <Banner tone="warn" text={copy.offline} /> : null}
      <StudioHero copy={copy} />

      <View style={styles.modeGrid}>
        {localizedModes.map((item) => (
          <ModeTile key={item.id} active={mode === item.id} item={item} onPress={() => setMode(item.id)} />
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>{activeMode?.label || "Catalog"} {copy.setup}</Text>
            <Text style={styles.muted}>{activeMode?.hint || "Marketplace-safe hero image"}</Text>
          </View>
          <View style={styles.modeRatioPill}><Text style={styles.modeRatioText}>{activeMode?.ratio || "4:3"}</Text></View>
        </View>
        <Text style={styles.label}>{copy.prompt}</Text>
        <TextInput
          multiline
          placeholder={copy.promptPlaceholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textarea]}
          value={subject}
          onChangeText={setSubject}
        />
        <Text style={styles.label}>{copy.style}</Text>
        <View style={styles.chipWrap}>
          {copy.promptSamples.map((item) => (
            <Pressable key={item} style={styles.promptChip} onPress={() => setSubject(item)}>
              <Text style={styles.promptChipText}>{item}</Text>
            </Pressable>
          ))}
          {copy.styleHints.map((item) => (
            <Pressable key={item} style={[styles.chip, styleHint === item && styles.chipActive]} onPress={() => setStyleHint(item)}>
              <Text style={[styles.chipText, styleHint === item && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>{copy.upscale}</Text>
            <Text style={styles.smallMuted}>{copy.upscaleBody}</Text>
          </View>
          <Switch value={upscale} onValueChange={setUpscale} trackColor={{ true: colors.acid, false: colors.line }} />
        </View>
      </View>

      <View style={styles.upload}>
        {selectedImage ? (
          <>
            <Image source={{ uri: selectedImage.uri }} style={styles.uploadPreview} />
            <Text style={styles.uploadText} numberOfLines={1}>{selectedImage.name}</Text>
          </>
        ) : (
          <>
            <Text style={styles.uploadTitle}>{copy.uploadTitle}</Text>
            <Text style={styles.uploadText}>{copy.uploadBody}</Text>
          </>
        )}
        <View style={styles.buttonRow}>
          <SecondaryButton label={copy.camera} onPress={() => pickImage("camera")} />
          <SecondaryButton label={copy.gallery} onPress={() => pickImage("library")} />
        </View>
      </View>

      <PrimaryButton disabled={generating || offline} label={copy.generate} loading={generating} onPress={createPhoto} />
      <SecondaryButton disabled={videoLoading || offline} label={videoLoading ? copy.queueingVideo : copy.queueVideo} onPress={queueVideo} />

      {videoJob ? (
        <VideoJobCard
          common={common}
          copy={copy}
          job={videoJob}
          loading={videoLoading}
          onRefresh={refreshVideoJob}
        />
      ) : null}

      <ResultPanel common={common} copy={copy} result={result} />
    </Screen>
  );
}

function ProofShowcase({ language }: { language: AppLanguage }) {
  const copy = mobileCopy[language].home;
  return (
    <View style={styles.proofCard}>
      <View style={styles.proofMediaRow}>
        <View style={styles.proofMedia}>
          <Image source={proofBefore} style={styles.proofImageContain} />
          <View style={styles.darkBadge}><Text style={styles.darkBadgeText}>{copy.before}</Text></View>
        </View>
        <View style={styles.proofMedia}>
          <Image source={proofAfter} style={styles.proofImageCover} />
          <View style={styles.goldBadge}><Text style={styles.goldBadgeText}>{copy.after}</Text></View>
        </View>
      </View>
      <View style={styles.proofFooter}>
        <Text style={styles.proofTitle}>{copy.proofTitle}</Text>
        <Text style={styles.proofSub}>{copy.proofBody}</Text>
      </View>
    </View>
  );
}

function ResultPanel({ common, copy, result }: { common: CommonCopy; copy: StudioCopy; result: ResultState | null }) {
  if (!result) {
    return (
      <View style={styles.resultBox}>
        <View style={styles.emptyResult}>
          <Text style={styles.emptyTitle}>{copy.resultEmptyTitle}</Text>
          <Text style={styles.muted}>{copy.resultEmptyBody}</Text>
        </View>
      </View>
    );
  }
  const currentResult = result;

  async function shareResult() {
    try {
      const file = await resultToFile(currentResult);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.path, {
          mimeType: file.mimeType,
          dialogTitle: copy.shareResultTitle
        });
      } else {
        Alert.alert(common.sharingUnavailable, `${common.resultPrepared} ${file.path}`);
      }
    } catch (error) {
      Alert.alert(common.shareFailed, friendlyError(error));
    }
  }

  async function saveToGallery() {
    try {
      const MediaLibrary = await import("expo-media-library");
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(common.permissionNeeded, common.resultLibraryPermission);
        return;
      }
      const file = await resultToFile(currentResult);
      await MediaLibrary.saveToLibraryAsync(file.path);
      Alert.alert(common.saved, common.resultSaved);
    } catch (error) {
      Alert.alert(common.saveFailed, friendlyError(error));
    }
  }

  return (
    <View style={styles.resultBox}>
      <View style={styles.resultTopRow}>
        <View>
          <Text style={styles.resultKicker}>{copy.readyResult}</Text>
          <Text style={styles.emptyTitle}>{result.modeLabel}</Text>
        </View>
        <Text style={styles.resultFormat}>{String(result.meta.format || "PNG").toUpperCase()}</Text>
      </View>
      <Image source={{ uri: result.uri }} style={styles.resultImage} />
      <Text style={styles.resultMeta}>
        {result.meta.width || "?"} x {result.meta.height || "?"} - {result.modeLabel}
      </Text>
      <View style={styles.buttonRow}>
        <SecondaryButton label={copy.share} onPress={shareResult} />
        <SecondaryButton label={copy.save} onPress={saveToGallery} />
      </View>
    </View>
  );
}

function VideoJobCard({
  common = mobileCopy.en.common,
  copy = mobileCopy.en.studio,
  job,
  loading,
  onRefresh
}: {
  common?: CommonCopy;
  copy?: StudioCopy;
  job: VideoJob;
  loading?: boolean;
  onRefresh?: () => void;
}) {
  const source = videoSourceFromJob(job);
  const isReady = Boolean(source);
  const status = isReady ? copy.ready : job.status || copy.queued;

  async function shareVideo() {
    try {
      const file = await videoJobToFile(job);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.path, {
          mimeType: file.mimeType,
          dialogTitle: copy.shareVideoTitle
        });
      } else {
        Alert.alert(common.sharingUnavailable, `${common.videoPrepared} ${file.path}`);
      }
    } catch (error) {
      Alert.alert(common.shareFailed, friendlyError(error));
    }
  }

  async function saveVideo() {
    try {
      const MediaLibrary = await import("expo-media-library");
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(common.permissionNeeded, common.videoLibraryPermission);
        return;
      }
      const file = await videoJobToFile(job);
      await MediaLibrary.saveToLibraryAsync(file.path);
      Alert.alert(common.saved, common.videoSaved);
    } catch (error) {
      Alert.alert(common.saveFailed, friendlyError(error));
    }
  }

  return (
    <View style={[styles.card, styles.videoJobCard, job.status === "failed" && styles.videoJobCardFailed]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{job.subject || copy.videoJob}</Text>
          <Text style={styles.muted}>{status} - {job.mode || "video"} - {job.tokens_used || 0} {copy.tokens}</Text>
        </View>
        <Text style={[styles.jobStatus, job.status === "failed" && styles.jobStatusFailed]}>{status}</Text>
      </View>
      {job.error ? <Text style={styles.videoError}>{job.error}</Text> : null}
      {source ? (
        <PlaybackVideo source={source} style={styles.videoPlayback} />
      ) : (
        <View style={styles.videoPendingBox}>
          <ActivityIndicator color={colors.acid} />
          <Text style={styles.muted}>{copy.videoPending}</Text>
        </View>
      )}
      <View style={styles.buttonRow}>
        {onRefresh ? <SecondaryButton disabled={loading} label={loading ? copy.refreshing : copy.refresh} onPress={onRefresh} /> : null}
        <SecondaryButton disabled={!isReady} label={copy.share} onPress={shareVideo} />
        <SecondaryButton disabled={!isReady} label={copy.save} onPress={saveVideo} />
      </View>
    </View>
  );
}

function StudioHero({ copy }: { copy: StudioCopy }) {
  return (
    <View style={styles.studioHero}>
      <View style={styles.studioHeroCopy}>
        <Text style={styles.heroKicker}>{copy.heroKicker}</Text>
        <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
        <Text style={styles.heroSub}>{copy.heroBody}</Text>
      </View>
      <View style={styles.heroPreviewRail}>
        <Image source={modes[1]?.preview || proofAfter} style={[styles.heroPreviewImage, styles.heroPreviewTall]} />
        <Image source={modes[2]?.preview || proofAfter} style={styles.heroPreviewImage} />
      </View>
    </View>
  );
}

function ModeTile({ active, item, onPress }: { active: boolean; item: ModeOption; onPress: () => void }) {
  return (
    <Pressable style={[styles.modeTile, active && styles.modeTileActive]} onPress={onPress}>
      <View style={styles.modeVisual}>
        <Image source={item.preview} style={styles.modePreviewImage} />
        <View style={styles.modeBeforeWrap}>
          <Image source={item.before} style={styles.modeBeforeImage} />
        </View>
        <View style={styles.modeTag}><Text style={styles.modeTagText}>{item.tag}</Text></View>
      </View>
      <View style={styles.modeTileBody}>
        <View>
          <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>{item.label}</Text>
          <Text style={[styles.modeHint, active && styles.modeHintActive]}>{item.hint}</Text>
        </View>
        <Text style={[styles.modeRatio, active && styles.modeRatioActive]}>{item.ratio}</Text>
      </View>
    </Pressable>
  );
}

function HistoryScreen({
  clearHistory,
  history,
  language = "en",
  offline,
  setResult,
  tokens
}: {
  clearHistory: () => Promise<void>;
  history: LocalHistoryItem[];
  language?: AppLanguage;
  offline: boolean;
  setResult: (result: ResultState | null) => void;
  tokens: Tokens;
}) {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const copy = mobileCopy[language].history;
  const common = mobileCopy[language].common;
  const studioCopy = mobileCopy[language].studio;

  async function refreshJobs() {
    if (offline) {
      Alert.alert(common.offlineTitle, copy.offlineRefresh);
      return;
    }
    setLoadingJobs(true);
    try {
      setJobs(await listVideoJobs(tokens.access_token));
    } catch (error) {
      Alert.alert(copy.jobsFailed, friendlyError(error));
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        refreshJobs().catch(() => undefined);
      }
    });
    return () => sub();
  }, []);

  return (
    <Screen title={copy.title} kicker={`${history.length} ${copy.saved}`}>
      <View style={styles.buttonRow}>
        <SecondaryButton disabled={!history.length} label={copy.clearLocal} onPress={clearHistory} />
        <SecondaryButton disabled={loadingJobs || offline} label={loadingJobs ? copy.refreshing : copy.refreshJobs} onPress={refreshJobs} />
      </View>

      {history.length ? (
        history.map((item) => (
          <Pressable
            key={item.id}
            style={styles.historyItem}
            onPress={() =>
              setResult({
                uri: item.uri,
                meta: { width: item.width, height: item.height, format: item.format },
                subject: item.subject,
                modeLabel: item.mode
              })
            }
          >
            <Image source={{ uri: item.uri }} style={styles.historyThumb} />
            <View style={styles.historyCopy}>
              <Text style={styles.historyTitle} numberOfLines={1}>{item.subject}</Text>
              <Text style={styles.muted}>{item.mode} - {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </Pressable>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{copy.emptyTitle}</Text>
          <Text style={styles.muted}>{copy.emptyBody}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.videoJobs}</Text>
        {jobs.length ? (
          jobs.map((job) => (
            <VideoJobCard common={common} copy={studioCopy} key={job.job_id} job={job} />
          ))
        ) : (
          <Text style={styles.muted}>{copy.emptyJobs}</Text>
        )}
      </View>
    </Screen>
  );
}

function AccountScreen({
  language,
  offline,
  refreshProfile,
  signOut,
  user
}: {
  language: AppLanguage;
  offline: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  user: UserProfile;
}) {
  const sub = user.subscription;
  const copy = mobileCopy[language].account;

  return (
    <Screen title={copy.title} kicker={user.subscription?.plan || "free"}>
      {offline ? <Banner tone="warn" text={copy.offline} /> : null}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{user.email || user.phone || copy.fallbackName}</Text>
        <Text style={styles.muted}>{copy.verified}: {user.is_verified === false ? copy.no : copy.yes}</Text>
        <Text style={styles.muted}>{copy.tokens}: {user.tokens ?? 0}</Text>
        <SecondaryButton disabled={offline} label={copy.refresh} onPress={refreshProfile} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard label={copy.photos} value={planText(sub?.photos_used, sub?.photos_limit)} />
        <StatCard label={copy.videos} value={planText(sub?.videos_used, sub?.videos_limit)} />
        <StatCard label={copy.premiumVideos} value={planText(sub?.premium_videos_used, sub?.premium_videos_limit)} />
        <StatCard label={copy.plan} value={sub?.plan || "free"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.planStatus}</Text>
        <Text style={styles.muted}>{copy.renewal}: {sub?.renews_at ? new Date(sub.renews_at).toLocaleDateString() : copy.notScheduled}</Text>
        <Text style={styles.muted}>{copy.compliance}</Text>
      </View>

      <SecondaryButton label={copy.signOut} onPress={signOut} />
    </Screen>
  );
}

// ── AdPilot constants ─────────────────────────────────────────────────────────

const COPY_TOKEN_UNIT = 10;

const COPY_FIELD_LABELS: Record<AppLanguage, Record<string, string>> = {
  en: {
    product: "Product / service", city: "City", price: "Price",
    advantages: "Advantages", targetCustomer: "Target customer",
    tone: "Tone", offer: "Special offer", customerQuestion: "Customer question",
    reviewText: "Review text", businessName: "Business name",
    masterName: "Master / specialist", duration: "Duration",
  },
  ru: {
    product: "Товар / услуга", city: "Город", price: "Цена",
    advantages: "Преимущества", targetCustomer: "Целевой клиент",
    tone: "Тон", offer: "Спецпредложение", customerQuestion: "Вопрос клиента",
    reviewText: "Текст отзыва", businessName: "Название бизнеса",
    masterName: "Имя мастера", duration: "Длительность",
  },
};

const COPY_TOOLS_FALLBACK: ContentTool[] = [
  { slug: "beauty-service-ad", name: "Beauty Ad", category: "Beauty", cost_units: 1, fields: ["product", "price", "city", "duration", "advantages", "offer"] },
  { slug: "master-bio", name: "Master Bio", category: "Beauty", cost_units: 1, fields: ["masterName", "product", "city", "advantages", "offer"] },
  { slug: "beauty-promo-post", name: "Beauty Promo", category: "Beauty", cost_units: 1, fields: ["product", "offer", "city", "masterName", "advantages"] },
  { slug: "avito-ad", name: "Avito Ad", category: "Listings", cost_units: 1, fields: ["product", "city", "price", "advantages"] },
  { slug: "ozon-listing", name: "Ozon Listing", category: "Listings", cost_units: 1, fields: ["product", "price", "advantages", "targetCustomer"] },
  { slug: "wb-listing", name: "WB Listing", category: "Listings", cost_units: 1, fields: ["product", "price", "advantages"] },
  { slug: "buyer-reply", name: "Buyer Reply", category: "Communication", cost_units: 1, fields: ["product", "customerQuestion"] },
  { slug: "review-reply", name: "Review Reply", category: "Communication", cost_units: 1, fields: ["product", "reviewText"] },
];

const COPY_EXAMPLE: Record<AppLanguage, Record<string, string>> = {
  en: {
    product: "Gel manicure", city: "Moscow", price: "From 2,500 RUB",
    advantages: "Sterile tools, Japanese gels, lasts up to 3 weeks",
    targetCustomer: "busy women who want a lasting result", tone: "warm and professional",
    offer: "Free hand massage with booking today",
    customerQuestion: "Is there a slot today and can you do cheaper?",
    reviewText: "Great result, but the wait was longer than expected.",
    businessName: "Anna Beauty",
    masterName: "Anna", duration: "1.5 hours",
  },
  ru: {
    product: "Гель-лак маникюр", city: "Москва", price: "От 2 500 ₽",
    advantages: "Стерильные инструменты, японские гели, держится до 3 недель",
    targetCustomer: "занятые женщины, которые хотят стойкий результат", tone: "тепло и профессионально",
    offer: "Массаж рук в подарок при записи сегодня",
    customerQuestion: "Есть запись на сегодня и можно дешевле?",
    reviewText: "Результат отличный, но ждать пришлось дольше, чем ожидала.",
    businessName: "Анна Бьюти",
    masterName: "Анна", duration: "1,5 часа",
  },
};

function AdPilotScreen({
  language,
  offline,
  tokens,
  user,
}: {
  language: AppLanguage;
  offline: boolean;
  tokens: Tokens;
  user: UserProfile;
}) {
  const ap = mobileCopy[language].adpilot;
  const fieldLabels = COPY_FIELD_LABELS[language];

  const [tools, setTools] = useState<ContentTool[]>(COPY_TOOLS_FALLBACK);
  const [toolSlug, setToolSlug] = useState("avito-ad");
  const [fields, setFields] = useState<Record<string, string>>(COPY_EXAMPLE[language]);
  const [outputLang, setOutputLang] = useState<"auto" | "english" | "russian">("auto");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [variations, setVariations] = useState<string[]>([]);
  const [adjustText, setAdjustText] = useState("");
  const [notice, setNotice] = useState("");
  const [savedItems, setSavedItems] = useState<SavedCopyItem[]>([]);

  const currentTool = tools.find((t) => t.slug === toolSlug) ?? tools[0];
  const cost = (currentTool?.cost_units ?? 1) * COPY_TOKEN_UNIT;
  const canGenerate = !offline && !generating && user.tokens >= cost;

  useEffect(() => {
    (async () => {
      try {
        const res = await listContentTools(tokens.access_token);
        if (res.tools?.length) setTools(res.tools);
      } catch { /* keep fallback */ }
      setSavedItems(await loadSavedCopy());
    })();
  }, []);

  useEffect(() => {
    setFields(COPY_EXAMPLE[language]);
  }, [language]);

  async function handleGenerate() {
    if (!canGenerate || !currentTool) return;
    setGenerating(true);
    setNotice("");
    try {
      const input = adjustText
        ? { ...fields, adjust_instruction: adjustText, previous_output: output }
        : { ...fields };
      const res = await generateCopy(tokens.access_token, {
        tool_slug: currentTool.slug,
        input,
        profile: {},
        output_language: outputLang,
      });
      const text = res.output ?? "";
      setOutput(text);
      setVariations((prev) => [text, ...prev].filter(Boolean).slice(0, 3));
      setNotice(res.warning ?? ap.generated);
    } catch (e: any) {
      setNotice(e?.message ?? ap.generateFailed);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!output) return;
    const item: SavedCopyItem = {
      id: Date.now().toString(),
      text: output,
      tool: currentTool?.name ?? toolSlug,
      date: new Date().toLocaleString(language === "ru" ? "ru-RU" : "en-US", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      }),
      createdAt: Date.now(),
    };
    const updated = [item, ...savedItems].slice(0, 50);
    setSavedItems(updated);
    await saveCopyItems(updated);
    setNotice(ap.savedDraft);
  }

  async function handleCopy(text: string) {
    try {
      await Clipboard.setStringAsync(text);
      setNotice(ap.copied);
    } catch { /* ignore */ }
  }

  const charBadges = output
    ? [{ name: "Avito", ok: output.length <= 3000 }, { name: "Ozon", ok: output.length <= 5000 }, { name: "WB", ok: output.length <= 5000 }]
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {/* Tool chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.apToolRow}>
          {tools.map((t) => (
            <Pressable
              key={t.slug}
              style={[styles.apToolChip, t.slug === toolSlug && styles.apToolChipActive]}
              onPress={() => setToolSlug(t.slug)}
            >
              <Text style={[styles.apToolChipText, t.slug === toolSlug && styles.apToolChipTextActive]}>{t.name}</Text>
              <Text style={styles.apToolChipCost}>{t.cost_units * COPY_TOKEN_UNIT}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Fill example */}
        <Pressable onPress={() => { setFields(COPY_EXAMPLE[language]); setNotice(""); }} style={styles.apExampleBtn}>
          <Text style={styles.apExampleBtnText}>{ap.fillExample}</Text>
        </Pressable>

        {/* Dynamic fields */}
        {(currentTool?.fields ?? []).map((field) => {
          const isMulti = ["advantages", "reviewText", "customerQuestion"].includes(field);
          return (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.label}>{fieldLabels[field] ?? field}</Text>
              <TextInput
                style={isMulti ? [styles.input, styles.textarea] : styles.input}
                multiline={isMulti}
                numberOfLines={isMulti ? 3 : 1}
                value={fields[field] ?? ""}
                onChangeText={(v) => setFields((prev) => ({ ...prev, [field]: v }))}
                placeholder={fieldLabels[field] ?? field}
                placeholderTextColor={colors.muted}
              />
            </View>
          );
        })}

        {/* Output language */}
        <View style={styles.apSegmentRow}>
          {(["auto", "english", "russian"] as const).map((lang) => (
            <Pressable
              key={lang}
              style={[styles.apSegment, outputLang === lang && styles.apSegmentActive]}
              onPress={() => setOutputLang(lang)}
            >
              <Text style={[styles.apSegmentText, outputLang === lang && styles.apSegmentTextActive]}>
                {ap.lang[lang]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Generate */}
        <PrimaryButton
          label={generating ? ap.generating : `${ap.generate} · ${cost}`}
          disabled={!canGenerate}
          loading={generating}
          onPress={handleGenerate}
        />

        {/* Notice */}
        {notice ? <Text style={styles.apNotice}>{notice}</Text> : null}

        {/* Output panel */}
        {output ? (
          <View style={styles.apOutputPanel}>
            {/* Variation pills */}
            {variations.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={styles.apVariationRow}>
                  {variations.map((v, i) => (
                    <Pressable
                      key={i}
                      style={[styles.apVariationPill, output === v && styles.apVariationPillActive]}
                      onPress={() => setOutput(v)}
                    >
                      <Text style={[styles.apVariationText, output === v && styles.apVariationTextActive]}>
                        {ap.variation} {i + 1}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Text output */}
            <Text selectable style={styles.apOutputText}>{output}</Text>

            {/* Char limit badges */}
            <View style={styles.apCharRow}>
              <Text style={styles.apCharCount}>{output.length} {ap.chars}</Text>
              {charBadges.map((b) => (
                <View key={b.name} style={[styles.apCharBadge, b.ok ? styles.apCharBadgeOk : styles.apCharBadgeOver]}>
                  <Text style={[styles.apCharBadgeText, b.ok ? styles.apCharBadgeTextOk : styles.apCharBadgeTextOver]}>{b.name}</Text>
                </View>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.apActionRow}>
              <Pressable style={[styles.secondaryButton, { flex: 1 }]} onPress={handleSave}>
                <Text style={styles.secondaryButtonText}>{ap.saveDraft}</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, { flex: 1 }]} onPress={() => handleCopy(output)}>
                <Text style={styles.secondaryButtonText}>{ap.copy}</Text>
              </Pressable>
            </View>

            {/* Adjust */}
            <Text style={styles.label}>{ap.adjustLabel}</Text>
            <View style={styles.apAdjustRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={adjustText}
                onChangeText={setAdjustText}
                placeholder={ap.adjustPlaceholder}
                placeholderTextColor={colors.muted}
              />
              <Pressable
                style={[styles.secondaryButton, { flex: 0, marginLeft: 8 }]}
                onPress={handleGenerate}
                disabled={!canGenerate}
              >
                <Text style={styles.secondaryButtonText}>{ap.adjust}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsScreen({
  clearHistory,
  language = "en",
  offline
}: {
  clearHistory: () => Promise<void>;
  language?: AppLanguage;
  offline: boolean;
}) {
  const copy = mobileCopy[language].settings;
  return (
    <Screen title={copy.title} kicker={offline ? copy.offline : copy.online}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.environment}</Text>
        <Text style={styles.muted}>{copy.apiUrl}</Text>
        <Text style={styles.mono}>{API_URL}</Text>
        <Text style={styles.smallMuted}>
          {copy.lanHelp}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.storage}</Text>
        <Text style={styles.muted}>{copy.storageBody}</Text>
        <SecondaryButton label={copy.clearHistory} onPress={clearHistory} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.readiness}</Text>
        <Text style={styles.muted}>{copy.readinessBody1}</Text>
        <Text style={styles.muted}>{copy.readinessBody2}</Text>
      </View>
    </Screen>
  );
}

function Screen({ children, kicker, title }: { children: React.ReactNode; kicker?: string; title: string }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>DomStudio mobile</Text>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          {kicker ? <View style={styles.tokenPill}><Text style={styles.tokenText}>{kicker}</Text></View> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  disabled,
  label,
  loading,
  onPress
}: {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.primaryButton, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}

function SecondaryButton({ disabled, label, onPress }: { disabled?: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.secondaryButton, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.linkButton}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

function Banner({ text, tone }: { text: string; tone: "warn" | "ok" }) {
  return (
    <View style={[styles.banner, tone === "warn" && styles.bannerWarn]}>
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  );
}

function StatCard({
  helper,
  label,
  tone = "default",
  value
}: {
  helper?: string;
  label: string;
  tone?: "default" | "warn";
  value: string;
}) {
  return (
    <View style={[styles.statCard, tone === "warn" && styles.statCardWarn]}>
      <Text style={[styles.statLabel, tone === "warn" && styles.statLabelWarn]}>{label}</Text>
      <Text style={[styles.statValue, tone === "warn" && styles.statValueWarn]}>{value}</Text>
      {helper ? <Text style={[styles.statHelper, tone === "warn" && styles.statHelperWarn]}>{helper}</Text> : null}
    </View>
  );
}

function TabGlyph({ color, focused, kind }: { color: string; focused: boolean; kind: "home" | "studio" | "adpilot" | "examples" | "pricing" }) {
  const wrapStyle = [styles.tabGlyph, focused && styles.tabGlyphActive];
  const glyphColor = focused ? colors.paper : color;
  if (kind === "home") {
    return (
      <View style={wrapStyle}>
        <View style={[styles.tabHomeRoof, { borderColor: glyphColor }]} />
        <View style={[styles.tabHomeBase, { borderColor: glyphColor }]} />
      </View>
    );
  }
  if (kind === "adpilot") {
    return (
      <View style={wrapStyle}>
        <View style={[styles.tabLine, { backgroundColor: glyphColor, width: 18 }]} />
        <View style={[styles.tabLine, { backgroundColor: glyphColor, width: 14 }]} />
        <View style={{ flexDirection: "row", gap: 3 }}>
          <View style={[{ width: 7, height: 3, borderRadius: 2, backgroundColor: glyphColor }]} />
          <View style={[{ width: 7, height: 3, borderRadius: 2, backgroundColor: glyphColor }]} />
        </View>
      </View>
    );
  }
  if (kind === "examples") {
    return (
      <View style={wrapStyle}>
        <View style={[styles.tabLine, { backgroundColor: glyphColor, width: 18 }]} />
        <View style={[styles.tabLine, { backgroundColor: glyphColor, width: 13 }]} />
        <View style={[styles.tabLine, { backgroundColor: glyphColor, width: 16 }]} />
      </View>
    );
  }
  if (kind === "pricing") {
    return (
      <View style={wrapStyle}>
        <View style={[styles.tabRing, { borderColor: glyphColor }]} />
        <View style={[styles.tabPriceLine, { backgroundColor: glyphColor }]} />
      </View>
    );
  }
  return (
    <View style={wrapStyle}>
      <View style={[styles.tabStudioFrame, { borderColor: glyphColor }]} />
      <View style={[styles.tabStudioSpark, { backgroundColor: glyphColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper
  },
  homeSafe: {
    flex: 1,
    backgroundColor: colors.night
  },
  homePage: {
    flexGrow: 1,
    paddingBottom: 128,
    backgroundColor: colors.night
  },
  homeTopBar: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 4,
    minHeight: 64,
    borderRadius: 22,
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f6f4ee",
    borderWidth: 1,
    borderColor: "rgba(17, 17, 15, 0.08)"
  },
  homeBrandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0
  },
  homeBrandMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  homeBrandText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  homeBrandWord: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  homeBrandWordAccent: {
    color: colors.violet
  },
  homeTopActions: {
    flexDirection: "row",
    gap: 6
  },
  homeRoundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(17, 17, 15, 0.12)"
  },
  homeRoundButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }]
  },
  homeRoundText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900"
  },
  homeMenuLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.ink
  },
  homeHero: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 34,
    minHeight: 0,
    justifyContent: "flex-start",
    backgroundColor: colors.night
  },
  gridBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255, 157, 46, 0.12)"
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 253, 248, 0.05)"
  },
  gridGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 157, 46, 0.12)"
  },
  homeEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  homeEyebrowLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.acid
  },
  homeEyebrow: {
    flex: 1,
    color: colors.acid,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  homeTitle: {
    color: "#f6f1e8",
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "900"
  },
  homeSellText: {
    color: colors.ink,
    backgroundColor: colors.acid
  },
  homeCopy: {
    marginTop: 14,
    color: "rgba(246, 241, 232, 0.72)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  homeCta: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  homeCtaText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  homeSecondaryCta: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(246, 241, 232, 0.28)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  homeSecondaryCtaText: {
    color: "#f6f1e8",
    fontSize: 15,
    fontWeight: "900"
  },
  homeTrustRow: {
    display: "none"
  },
  homeTrustText: {
    color: "rgba(246, 241, 232, 0.68)",
    fontSize: 12,
    fontWeight: "800"
  },
  homeOffline: {
    marginTop: 12,
    color: colors.acid,
    fontSize: 12,
    fontWeight: "900"
  },
  homeMiniStudio: {
    marginHorizontal: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.34)",
    backgroundColor: colors.nightPanel,
    gap: 14
  },
  homeMiniHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  homeMiniKicker: {
    color: "rgba(246, 241, 232, 0.58)",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  homeMiniMeta: {
    color: "#f6f1e8",
    fontSize: 12,
    fontWeight: "900"
  },
  homeProofStrip: {
    overflow: "hidden",
    height: 168,
    borderRadius: 14,
    flexDirection: "row",
    backgroundColor: "#efe8de"
  },
  homeProofSlot: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 253, 248, 0.88)"
  },
  homeProofContain: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  homeProofCover: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  homeProofCoverZoom: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  homeProofVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#11110f"
  },
  homeDarkBadge: {
    position: "absolute",
    left: 7,
    top: 7,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 15, 0.72)"
  },
  homeDarkBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  homeGoldBadge: {
    position: "absolute",
    left: 7,
    top: 7,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  homeGoldBadgeText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  homeUploadBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 253, 248, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    gap: 12
  },
  homeUploadLabel: {
    color: "rgba(246, 241, 232, 0.68)",
    fontSize: 14,
    fontWeight: "900"
  },
  homeUploadButton: {
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  homeUploadText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  homeModeTeaser: {
    marginHorizontal: 22,
    marginTop: 18,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.24)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    gap: 8
  },
  homeModeTitle: {
    color: "#f6f1e8",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900"
  },
  homeModeSub: {
    color: "rgba(246, 241, 232, 0.66)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  homeTokenInline: {
    marginTop: 8,
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 157, 46, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.28)"
  },
  homeTokenValue: {
    color: colors.acid,
    fontSize: 15,
    fontWeight: "900"
  },
  homeTokenLabel: {
    color: "rgba(246, 241, 232, 0.72)",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  homeProofSection: {
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 46,
    backgroundColor: "#fffaf0",
    gap: 18
  },
  webSectionHead: {
    gap: 12
  },
  webSectionTitle: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900"
  },
  webSectionTitleHighlight: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingBottom: 3,
    color: colors.ink,
    backgroundColor: colors.acid,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  webSectionCopy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "700"
  },
  homeProofLarge: {
    overflow: "hidden",
    height: 210,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    backgroundColor: "#efe8de"
  },
  homeProofStats: {
    gap: 10
  },
  homeProofStat: {
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 18,
    justifyContent: "center"
  },
  homeProofStatValue: {
    color: colors.gold,
    fontSize: 30,
    fontWeight: "900"
  },
  homeProofStatText: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  homeModesSection: {
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 46,
    backgroundColor: "#f7f3ea",
    gap: 24
  },
  homeModesList: {
    gap: 12
  },
  homeWebModeCard: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  homeWebModeVisual: {
    position: "relative",
    height: 234,
    backgroundColor: colors.paper
  },
  homeWebModeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  homeWebModeBefore: {
    position: "absolute",
    left: 9,
    bottom: 9,
    width: "38%",
    overflow: "hidden",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 253, 248, 0.92)",
    backgroundColor: colors.paper
  },
  homeWebModeBeforeImage: {
    width: "100%",
    height: 82,
    resizeMode: "cover"
  },
  homeWebModeBeforeLabel: {
    position: "absolute",
    left: 7,
    top: 7,
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    color: "#ffffff",
    backgroundColor: "rgba(17, 17, 15, 0.72)",
    fontSize: 10,
    fontWeight: "900"
  },
  homeWebModeAfterLabel: {
    position: "absolute",
    right: 9,
    top: 9,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  homeWebModeBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 10
  },
  homeWebModeTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  homeWebModeNumber: {
    color: colors.violet,
    fontSize: 12,
    fontWeight: "900"
  },
  homeWebModeTag: {
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 9,
    paddingVertical: 6,
    color: colors.muted,
    backgroundColor: "#faf7f0",
    fontSize: 11,
    fontWeight: "900"
  },
  homeWebModeTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  homeWebModeText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700"
  },
  homeWorkflowSection: {
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 46,
    backgroundColor: colors.night,
    gap: 0
  },
  homeWorkflowTitle: {
    color: "#f6f1e8",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900"
  },
  homeWorkflowCopy: {
    color: "#aaa69f",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700"
  },
  homeWorkflowStep: {
    borderTopWidth: 1,
    borderTopColor: "rgba(246, 241, 232, 0.18)",
    paddingVertical: 28,
    gap: 12
  },
  homeWorkflowNumber: {
    color: colors.acid,
    fontSize: 38,
    fontWeight: "900"
  },
  homeWorkflowStepTitle: {
    color: "#f6f1e8",
    fontSize: 18,
    fontWeight: "900"
  },
  homeWorkflowStepText: {
    color: "#aaa69f",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700"
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    backgroundColor: "rgba(17, 17, 15, 0.52)"
  },
  homeMenuPanel: {
    borderRadius: 28,
    padding: 18,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.24)",
    backgroundColor: colors.card,
    gap: 12
  },
  menuHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
    marginBottom: 4
  },
  menuTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  menuSub: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  menuItem: {
    minHeight: 62,
    borderRadius: 18,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fffaf0"
  },
  menuItemText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  menuItemMeta: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  menuCloseButton: {
    minHeight: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink
  },
  menuCloseText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  examplesPage: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 128,
    gap: 14,
    backgroundColor: colors.night
  },
  examplesHero: {
    position: "relative",
    overflow: "hidden",
    minHeight: 238,
    borderRadius: radii.lg,
    padding: 20,
    justifyContent: "flex-end",
    backgroundColor: colors.nightPanel,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.24)"
  },
  examplesTitle: {
    color: "#f6f1e8",
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900"
  },
  examplesSub: {
    marginTop: 10,
    color: "rgba(246, 241, 232, 0.68)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  examplesStrip: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  examplesBadge: {
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.26)",
    paddingHorizontal: 11,
    paddingVertical: 8,
    color: "rgba(246, 241, 232, 0.72)",
    backgroundColor: "rgba(255, 157, 46, 0.12)",
    fontSize: 12,
    fontWeight: "900"
  },
  examplesCta: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  examplesCtaText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  exampleModeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  exampleGalleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  exampleModeCard: {
    width: "48.5%",
    overflow: "hidden",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.18)",
    backgroundColor: colors.card
  },
  exampleGalleryCard: {
    width: "48.5%",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  exampleGalleryWide: {
    width: "100%"
  },
  exampleImageWrap: {
    position: "relative",
    height: 142,
    backgroundColor: "#efe8de"
  },
  exampleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  exampleVideoPair: {
    position: "relative",
    flexDirection: "row",
    gap: 8,
    padding: 8,
    backgroundColor: "#efe8de"
  },
  exampleVideoHalf: {
    flex: 1,
    overflow: "hidden",
    height: 150,
    borderRadius: 6,
    backgroundColor: "#11110f"
  },
  exampleVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#11110f"
  },
  exampleImagePortrait: {
    resizeMode: "cover"
  },
  exampleTitle: {
    marginTop: 12,
    marginHorizontal: 12,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  exampleText: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 14,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  examplesBottomCta: {
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 157, 46, 0.24)",
    gap: 8
  },
  examplesBottomTitle: {
    color: "#f6f1e8",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900"
  },
  pricingPage: {
    flexGrow: 1,
    padding: 12,
    paddingBottom: 128,
    gap: 12,
    backgroundColor: colors.paper
  },
  pricingHero: {
    position: "relative",
    overflow: "hidden",
    minHeight: 228,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.28)",
    backgroundColor: colors.night,
    justifyContent: "space-between",
    gap: 14
  },
  pricingHeroCopy: {
    gap: 8
  },
  pricingKicker: {
    color: colors.acid,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pricingTitle: {
    color: "#fffdf8",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900"
  },
  pricingBody: {
    color: "rgba(246, 241, 232, 0.74)",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700"
  },
  pricingHeroMetrics: {
    flexDirection: "row",
    gap: 8
  },
  pricingHeroMetric: {
    flex: 1,
    minHeight: 62,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: "center",
    backgroundColor: "rgba(255, 253, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 253, 248, 0.1)"
  },
  pricingHeroStatValue: {
    color: colors.acid,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  pricingHeroStatLabel: {
    color: "rgba(246, 241, 232, 0.58)",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pricingAccountPanel: {
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(49, 95, 75, 0.22)",
    backgroundColor: "#eef7f1",
    gap: 12
  },
  pricingPanel: {
    padding: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    gap: 12
  },
  pricingAccountTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  pricingPanelKicker: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pricingAccountName: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "900"
  },
  pricingTokenBadge: {
    minWidth: 86,
    minHeight: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
    paddingHorizontal: 12
  },
  pricingTokenValue: {
    color: colors.acid,
    fontSize: 20,
    fontWeight: "900"
  },
  pricingTokenLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pricingPlanLine: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.62)"
  },
  pricingPlanLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pricingPlanValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  planList: {
    gap: 12
  },
  planCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    gap: 12
  },
  planCardFeatured: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.ink,
    borderColor: "rgba(255, 157, 46, 0.5)"
  },
  planKicker: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  planKickerFeatured: {
    color: "#bbb7af"
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  planName: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  planFeaturedText: {
    color: "#ffffff"
  },
  planPrice: {
    color: colors.ink,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900"
  },
  planPriceFeatured: {
    color: "#ffffff"
  },
  planBestBadge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.ink,
    backgroundColor: colors.acid,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  planFeatureList: {
    gap: 8,
    marginBottom: 4
  },
  planFeatureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  planCheck: {
    color: colors.acid,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  planCheckFeatured: {
    color: colors.acid
  },
  planLine: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  planLineFeatured: {
    color: "#bbb7af"
  },
  packRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  paymentAmount: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  flex: {
    flex: 1
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  authPage: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    gap: 18
  },
  brandMark: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  brandMarkText: {
    color: colors.ink,
    fontWeight: "900"
  },
  title: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22
  },
  proofCard: {
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.28)",
    backgroundColor: colors.nightPanel
  },
  proofMediaRow: {
    flexDirection: "row",
    minHeight: 150
  },
  proofMedia: {
    flex: 1,
    position: "relative",
    backgroundColor: "#efe8de"
  },
  proofImageContain: {
    width: "100%",
    height: 168,
    resizeMode: "contain"
  },
  proofImageCover: {
    width: "100%",
    height: 168,
    resizeMode: "cover"
  },
  proofFooter: {
    padding: 14,
    gap: 4
  },
  proofTitle: {
    color: "#f6f1e8",
    fontSize: 16,
    fontWeight: "900"
  },
  proofSub: {
    color: "rgba(246, 241, 232, 0.68)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  darkBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 15, 0.72)"
  },
  darkBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900"
  },
  goldBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  goldBadgeText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900"
  },
  page: {
    padding: 16,
    paddingBottom: 144,
    gap: 14
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  kicker: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900"
  },
  tokenPill: {
    maxWidth: 150,
    minHeight: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line
  },
  tokenText: {
    color: colors.acid,
    fontWeight: "900"
  },
  card: {
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 16
  },
  textarea: {
    minHeight: 112,
    paddingTop: 12,
    textAlignVertical: "top"
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  primaryButtonText: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    flex: 1
  },
  secondaryButtonText: {
    color: colors.ink,
    fontWeight: "900"
  },
  buttonDisabled: {
    opacity: 0.45
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  linkButton: {
    minHeight: 32,
    justifyContent: "center"
  },
  linkText: {
    color: colors.green,
    fontWeight: "900"
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  smallMuted: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  mono: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  banner: {
    padding: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: "#eef7f1"
  },
  bannerWarn: {
    borderColor: colors.acid,
    backgroundColor: "#fff6e4"
  },
  bannerText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  studioHero: {
    position: "relative",
    overflow: "hidden",
    minHeight: 222,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.26)",
    backgroundColor: colors.night
  },
  studioHeroCopy: {
    width: "62%",
    gap: 8
  },
  heroKicker: {
    color: colors.acid,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#f6f1e8",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900"
  },
  heroSub: {
    color: "rgba(246, 241, 232, 0.72)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  heroPreviewRail: {
    position: "absolute",
    right: -8,
    bottom: -18,
    width: "42%",
    height: 214,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    transform: [{ rotate: "-4deg" }]
  },
  heroPreviewImage: {
    flex: 1,
    height: 150,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255, 253, 248, 0.84)",
    resizeMode: "cover",
    backgroundColor: "#efe8de"
  },
  heroPreviewTall: {
    height: 196
  },
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  modeTile: {
    width: "48.5%",
    minHeight: 214,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    overflow: "hidden"
  },
  modeTileActive: {
    backgroundColor: colors.ink,
    borderColor: colors.acid
  },
  modeVisual: {
    position: "relative",
    height: 126,
    backgroundColor: "#efe8de"
  },
  modePreviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  modeBeforeWrap: {
    position: "absolute",
    left: 8,
    bottom: 8,
    width: 54,
    height: 42,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 253, 248, 0.92)",
    backgroundColor: colors.paper
  },
  modeBeforeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  modeTag: {
    position: "absolute",
    right: 8,
    top: 8,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: colors.acid
  },
  modeTagText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900"
  },
  modeTileBody: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
    gap: 8
  },
  modeTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  modeTitleActive: {
    color: "#ffffff"
  },
  modeHint: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15
  },
  modeHintActive: {
    color: "#f4f0e8"
  },
  modeRatio: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: colors.muted,
    backgroundColor: "#faf7f0",
    fontSize: 10,
    fontWeight: "900"
  },
  modeRatioActive: {
    color: colors.ink,
    backgroundColor: colors.acid
  },
  modeRatioPill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: colors.ink
  },
  modeRatioText: {
    color: colors.acid,
    fontSize: 11,
    fontWeight: "900"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  promptChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 46, 0.45)",
    backgroundColor: "#fff7df"
  },
  promptChipText: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 12
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#ffffff"
  },
  chipActive: {
    borderColor: colors.acid,
    backgroundColor: "#fff7df"
  },
  chipText: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12
  },
  chipTextActive: {
    color: colors.ink
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  upload: {
    minHeight: 178,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.muted,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    gap: 10,
    padding: 12
  },
  uploadPreview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    resizeMode: "cover"
  },
  uploadTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  uploadText: {
    color: colors.muted,
    fontWeight: "800"
  },
  resultBox: {
    minHeight: 240,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    gap: 12
  },
  resultTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  resultKicker: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  resultFormat: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.ink,
    backgroundColor: "#fff4cf",
    fontSize: 11,
    fontWeight: "900"
  },
  resultImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  resultMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  emptyResult: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 8
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%"
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card
  },
  historyThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#ffffff"
  },
  historyCopy: {
    flex: 1,
    gap: 4
  },
  historyTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  jobRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10
  },
  jobStatus: {
    color: colors.green,
    fontWeight: "900"
  },
  jobStatusFailed: {
    color: colors.danger
  },
  videoJobCard: {
    gap: 12
  },
  videoJobCardFailed: {
    borderColor: "rgba(164, 65, 55, 0.38)",
    backgroundColor: "#fff4f2"
  },
  videoPlayback: {
    width: "100%",
    height: 360,
    borderRadius: 12,
    backgroundColor: "#11110f",
    overflow: "hidden"
  },
  videoPendingBox: {
    minHeight: 148,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#faf7f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 10
  },
  videoError: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  statCard: {
    width: "48.5%",
    minHeight: 104,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    justifyContent: "space-between"
  },
  statCardWarn: {
    borderColor: "rgba(164, 65, 55, 0.38)",
    backgroundColor: "#fff4f2"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  statLabelWarn: {
    color: colors.danger
  },
  statValue: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  statValueWarn: {
    color: colors.danger
  },
  statHelper: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800"
  },
  statHelperWarn: {
    color: colors.danger
  },
  nativeTabBar: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 14,
    minHeight: 72,
    paddingTop: 10,
    paddingBottom: 9,
    paddingHorizontal: 10,
    borderRadius: 28,
    backgroundColor: colors.card,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.ink,
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12
  },
  nativeTabItem: {
    marginHorizontal: 2,
    borderRadius: 24,
    backgroundColor: "transparent"
  },
  nativeTabText: {
    fontWeight: "900",
    fontSize: 10,
    paddingTop: 1
  },
  tabGlyph: {
    width: 36,
    height: 32,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  tabGlyphActive: {
    backgroundColor: colors.night,
    transform: [{ translateY: -9 }],
    shadowColor: colors.night,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  tabHomeRoof: {
    width: 16,
    height: 12,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    transform: [{ rotate: "45deg" }],
    marginBottom: -5
  },
  tabHomeBase: {
    width: 16,
    height: 11,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  tabLine: {
    height: 3,
    borderRadius: 2
  },
  tabHead: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2
  },
  tabShoulders: {
    width: 18,
    height: 9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    borderBottomWidth: 0
  },
  tabRing: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2
  },
  tabDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3
  },
  tabPriceLine: {
    position: "absolute",
    width: 11,
    height: 3,
    borderRadius: 2
  },
  tabStudioFrame: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2
  },
  tabStudioSpark: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 7,
    height: 7,
    borderRadius: 4
  },
  // ── AdPilot ────────────────────────────────────────────────────────────────
  apToolRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  apToolChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  apToolChipActive: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  apToolChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  apToolChipTextActive: {
    color: colors.paper,
  },
  apToolChipCost: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.muted,
    backgroundColor: colors.paper,
    paddingHorizontal: 5,
    borderRadius: 6,
  },
  apExampleBtn: {
    alignSelf: "flex-start",
  },
  apExampleBtnText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  fieldRow: {
    gap: 6,
  },
  apSegmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  apSegment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  apSegmentActive: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  apSegmentText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.muted,
  },
  apSegmentTextActive: {
    color: colors.paper,
  },
  apNotice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    textAlign: "center",
  },
  apOutputPanel: {
    gap: 12,
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  apVariationRow: {
    flexDirection: "row",
    gap: 6,
  },
  apVariationPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  apVariationPillActive: {
    borderColor: colors.gold,
    backgroundColor: "#fff7e0",
  },
  apVariationText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.muted,
  },
  apVariationTextActive: {
    color: colors.gold,
  },
  apOutputText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 22,
  },
  apCharRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  apCharCount: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
  },
  apCharBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  apCharBadgeOk: {
    backgroundColor: "#e8f5e9",
  },
  apCharBadgeOver: {
    backgroundColor: "#fdecea",
  },
  apCharBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  apCharBadgeTextOk: {
    color: "#2e7d32",
  },
  apCharBadgeTextOver: {
    color: "#c62828",
  },
  apActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  apAdjustRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
