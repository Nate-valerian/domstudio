import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
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
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import {
  API_URL,
  GenerateResult,
  Tokens,
  UserProfile,
  VideoJob,
  clearTokens,
  forgotPassword,
  generateImage,
  generateVideo,
  getVideoJob,
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
  verifyPhone
} from "./src/api";
import { LocalHistoryItem, clearLocalHistory, loadLocalHistory, saveLocalHistory } from "./src/storage";
import { colors, radii } from "./src/theme";

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Studio: undefined;
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
    tabs: { home: "Home", studio: "Studio", examples: "Examples", pricing: "Pricing" },
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
      title: "Choose the amount of content you need.",
      body: "The native screen mirrors the web tariff structure while payment handoff remains a later compliance pass.",
      offline: "Offline. Account numbers may be stale.",
      currentPlan: "Current plan",
      tokens: "Tokens",
      refresh: "Refresh account",
      photos: "Photos",
      videos: "Videos",
      premium: "Premium",
      renewal: "Renewal",
      none: "None",
      signOut: "Sign out"
    }
  },
  ru: {
    tabs: { home: "Главная", studio: "Студия", examples: "Примеры", pricing: "Тарифы" },
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
      title: "Выберите нужный объем контента.",
      body: "Нативный экран повторяет структуру веб-тарифов; платежный переход будет отдельным compliance-этапом.",
      offline: "Офлайн. Данные аккаунта могут быть устаревшими.",
      currentPlan: "Текущий план",
      tokens: "Токены",
      refresh: "Обновить аккаунт",
      photos: "Фото",
      videos: "Видео",
      premium: "Премиум",
      renewal: "Продление",
      none: "Нет",
      signOut: "Выйти"
    }
  }
} as const;

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

function usageStatus(value?: number, limit?: number) {
  const display = planText(value, limit);
  if (typeof value !== "number" || typeof limit !== "number") {
    return { display, overLimit: false, helper: "" };
  }
  if (limit <= 0) {
    return value > 0
      ? { display, overLimit: true, helper: `${value} used with no allowance on this plan` }
      : { display, overLimit: false, helper: "No allowance on this plan" };
  }
  if (value > limit) {
    return { display, overLimit: true, helper: `${value - limit} over plan limit` };
  }
  return { display, overLimit: false, helper: `${limit - value} remaining` };
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
  const [language, setLanguage] = useState<AppLanguage>("en");

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
        const [savedTokens, savedHistory] = await Promise.all([loadTokens(), loadLocalHistory()]);
        if (!active) return;
        setHistory(savedHistory);
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
              {() => <AuthScreen completeAuth={completeAuth} offline={offline} />}
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
  offline
}: {
  completeAuth: (tokens: Tokens) => Promise<void>;
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

  async function runNetworkTask(task: () => Promise<void>, title: string) {
    if (offline) {
      Alert.alert("Offline", "Connect to the internet to continue.");
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
    if (mode === "register") return "Create account";
    if (mode === "verifyEmail" || mode === "verifyPhone") return "Enter code";
    if (mode === "phone") return "Phone login";
    if (mode === "forgot") return "Reset password";
    if (mode === "reset") return "New password";
    return "Sign in";
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.authPage} keyboardShouldPersistTaps="always">
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>DS</Text></View>
        <Text style={styles.title}>DomStudio</Text>
        <Text style={styles.subtitle}>Product photos, marketplace cards, and short content from one phone workflow.</Text>
        <ProofShowcase />
        {offline ? <Banner tone="warn" text="Offline. Auth and generation are paused until the network returns." /> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{authTitle()}</Text>

          {mode === "login" || mode === "register" || mode === "forgot" || mode === "reset" ? (
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          ) : null}

          {mode === "login" || mode === "register" ? (
            <TextInput
              placeholder="Password"
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
              placeholder="Phone"
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
              placeholder="Code"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={code}
              onChangeText={setCode}
            />
          ) : null}

          {mode === "reset" ? (
            <TextInput
              placeholder="New password"
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
              label="Open studio"
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim() || !password) throw new Error("Enter your email and password.");
                  await completeAuth(await loginEmail(email.trim(), password));
                }, "Login failed")
              }
            />
          ) : null}

          {mode === "register" ? (
            <PrimaryButton
              disabled={loading}
              label="Send email code"
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim() || password.length < 8) throw new Error("Use an email and an 8+ character password.");
                  await registerEmail(email.trim(), password);
                  setPendingContact(email.trim());
                  setCode("");
                  setMode("verifyEmail");
                }, "Registration failed")
              }
            />
          ) : null}

          {mode === "verifyEmail" ? (
            <PrimaryButton
              disabled={loading}
              label="Verify email"
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!pendingContact || !code.trim()) throw new Error("Enter the code from your email.");
                  await completeAuth(await verifyEmail(pendingContact, code.trim()));
                }, "Verification failed")
              }
            />
          ) : null}

          {mode === "phone" ? (
            <PrimaryButton
              disabled={loading}
              label="Send phone code"
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!phone.trim()) throw new Error("Enter your phone number.");
                  await loginPhone(phone.trim());
                  setPendingContact(phone.trim());
                  setCode("");
                  setMode("verifyPhone");
                }, "Phone login failed")
              }
            />
          ) : null}

          {mode === "verifyPhone" ? (
            <PrimaryButton
              disabled={loading}
              label="Verify phone"
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!pendingContact || !code.trim()) throw new Error("Enter the SMS code.");
                  await completeAuth(await verifyPhone(pendingContact, code.trim()));
                }, "Verification failed")
              }
            />
          ) : null}

          {mode === "forgot" ? (
            <PrimaryButton
              disabled={loading}
              label="Send reset code"
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim()) throw new Error("Enter your email.");
                  await forgotPassword(email.trim());
                  setCode("");
                  setMode("reset");
                }, "Reset failed")
              }
            />
          ) : null}

          {mode === "reset" ? (
            <PrimaryButton
              disabled={loading}
              label="Save new password"
              loading={loading}
              onPress={() =>
                runNetworkTask(async () => {
                  if (!email.trim() || !code.trim() || newPassword.length < 8) {
                    throw new Error("Enter email, code, and an 8+ character password.");
                  }
                  await completeAuth(await resetPassword(email.trim(), code.trim(), newPassword));
                }, "Password reset failed")
              }
            />
          ) : null}

          <View style={styles.linkRow}>
            <LinkButton label={mode === "login" ? "Create account" : "Email login"} onPress={() => setMode(mode === "login" ? "register" : "login")} />
            <LinkButton label="Phone OTP" onPress={() => setMode("phone")} />
            <LinkButton label="Forgot" onPress={() => setMode("forgot")} />
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
      <Tabs.Screen name="Examples" options={{ tabBarLabel: copy.tabs.examples, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="examples" /> }}>
        {({ navigation }) => <ExamplesScreen language={props.language} onCreate={() => navigation.navigate("Studio")} />}
      </Tabs.Screen>
      <Tabs.Screen name="Pricing" options={{ tabBarLabel: copy.tabs.pricing, tabBarIcon: ({ color, focused }) => <TabGlyph color={color} focused={focused} kind="pricing" /> }}>
        {() => <PricingScreen {...props} language={props.language} />}
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
            <Text style={styles.homeTrustText}>Ready for marketplaces</Text>
            <Text style={styles.homeTrustText}>Photo and video flow</Text>
            <Text style={styles.homeTrustText}>Mobile-first export</Text>
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
              <Text style={styles.homeProofStatValue}>270 RUB</Text>
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
            {modes.map((item, index) => (
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
          {workflowSteps.map((step) => (
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
          {exampleImages.map((item) => (
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
          {motionExamples.map((item) => (
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
  user
}: {
  language: AppLanguage;
  offline: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  user: UserProfile;
}) {
  const sub = user.subscription;
  const copy = mobileCopy[language].pricing;
  const photosUsage = usageStatus(sub?.photos_used, sub?.photos_limit);
  const videosUsage = usageStatus(sub?.videos_used, sub?.videos_limit);
  const premiumUsage = usageStatus(sub?.premium_videos_used, sub?.premium_videos_limit);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.pricingPage}>
        <View style={styles.pricingHero}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.pricingTitle}>{copy.title}</Text>
          <Text style={styles.muted}>{copy.body}</Text>
        </View>

        {offline ? <Banner tone="warn" text={copy.offline} /> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{user.email || user.phone || "DomStudio account"}</Text>
          <Text style={styles.muted}>{copy.currentPlan}: {sub?.plan || "free"}</Text>
          <Text style={styles.muted}>{copy.tokens}: {user.tokens ?? 0}</Text>
          <SecondaryButton disabled={offline} label={copy.refresh} onPress={refreshProfile} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard helper={photosUsage.helper} label={copy.photos} tone={photosUsage.overLimit ? "warn" : "default"} value={photosUsage.display} />
          <StatCard helper={videosUsage.helper} label={copy.videos} tone={videosUsage.overLimit ? "warn" : "default"} value={videosUsage.display} />
          <StatCard helper={premiumUsage.helper} label={copy.premium} tone={premiumUsage.overLimit ? "warn" : "default"} value={premiumUsage.display} />
          <StatCard label={copy.renewal} value={sub?.renews_at ? new Date(sub.renews_at).toLocaleDateString() : copy.none} />
        </View>

        <View style={styles.planList}>
          {pricingPlans.map((plan) => (
            <View key={plan.name} style={[styles.planCard, plan.featured && styles.planCardFeatured]}>
              <Text style={[styles.planKicker, plan.featured && styles.planKickerFeatured]}>{plan.kicker}</Text>
              <View style={styles.planTopRow}>
                <Text style={[styles.planName, plan.featured && styles.planFeaturedText]}>{plan.name}</Text>
                <Text style={[styles.planPrice, plan.featured && styles.planPriceFeatured]}>{plan.price}</Text>
              </View>
              <Text style={[styles.planLine, plan.featured && styles.planLineFeatured]}>{plan.photos}</Text>
              <Text style={[styles.planLine, plan.featured && styles.planLineFeatured]}>{plan.videos}</Text>
              <Text style={[styles.planLine, plan.featured && styles.planLineFeatured]}>{plan.premium}</Text>
            </View>
          ))}
        </View>

        <SecondaryButton label={copy.signOut} onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
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
  offline,
  refreshProfile,
  rememberResult,
  result,
  setResult,
  tokens,
  user
}: {
  offline: boolean;
  refreshProfile: () => Promise<void>;
  rememberResult: (result: ResultState) => void;
  result: ResultState | null;
  setResult: (result: ResultState | null) => void;
  tokens: Tokens;
  user: UserProfile;
}) {
  const [mode, setMode] = useState("catalog");
  const [subject, setSubject] = useState("");
  const [styleHint, setStyleHint] = useState(defaultStyleHint);
  const [upscale, setUpscale] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PickedImage | null>(null);
  const [generating, setGenerating] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoJob, setVideoJob] = useState<VideoJob | null>(null);

  const activeMode = useMemo(() => modes.find((item) => item.id === mode) || modes[0], [mode]);

  async function pickImage(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", source === "camera" ? "Allow camera access to capture product shots." : "Allow photo access to upload product shots.");
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
      Alert.alert("Offline", "Connect to generate a new result.");
      return;
    }
    if (!subject.trim()) {
      Alert.alert("Add a prompt", "Describe the product and the result you want.");
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
      if (!response.image) throw new Error("No image returned");
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
      Alert.alert("Generation failed", friendlyError(error));
    } finally {
      setGenerating(false);
    }
  }

  async function queueVideo() {
    if (offline) {
      Alert.alert("Offline", "Connect to queue a video job.");
      return;
    }
    if (!selectedImage?.base64) {
      Alert.alert("Photo required", "Choose or capture a product photo before queueing video.");
      return;
    }
    if (!subject.trim()) {
      Alert.alert("Add a prompt", "Describe the product video you want.");
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
      Alert.alert("Video queued", "The job is visible below. Refresh it to pick up the rendered video.");
      await refreshProfile();
    } catch (error) {
      Alert.alert("Video failed", friendlyError(error));
    } finally {
      setVideoLoading(false);
    }
  }

  async function refreshVideoJob() {
    if (!videoJob) return;
    if (offline) {
      Alert.alert("Offline", "Reconnect to refresh the video job.");
      return;
    }
    setVideoLoading(true);
    try {
      setVideoJob(await getVideoJob(tokens.access_token, videoJob.job_id));
      await refreshProfile();
    } catch (error) {
      Alert.alert("Refresh failed", friendlyError(error));
    } finally {
      setVideoLoading(false);
    }
  }

  return (
    <Screen title="Studio" kicker={`${user.tokens ?? 0} tokens`}>
      {offline ? <Banner tone="warn" text="Offline. You can edit the prompt and inspect history; generation waits for network." /> : null}
      <StudioHero tokens={user.tokens ?? 0} />

      <View style={styles.modeGrid}>
        {modes.map((item) => (
          <ModeTile key={item.id} active={mode === item.id} item={item} onPress={() => setMode(item.id)} />
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>{activeMode?.label || "Catalog"} setup</Text>
            <Text style={styles.muted}>{activeMode?.hint || "Marketplace-safe hero image"}</Text>
          </View>
          <View style={styles.modeRatioPill}><Text style={styles.modeRatioText}>{activeMode?.ratio || "4:3"}</Text></View>
        </View>
        <Text style={styles.label}>Product prompt</Text>
        <TextInput
          multiline
          placeholder="Wine bottle on marble table, premium product card"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textarea]}
          value={subject}
          onChangeText={setSubject}
        />
        <Text style={styles.label}>Style</Text>
        <View style={styles.chipWrap}>
          {samplePrompts.map((item) => (
            <Pressable key={item} style={styles.promptChip} onPress={() => setSubject(item)}>
              <Text style={styles.promptChipText}>{item}</Text>
            </Pressable>
          ))}
          {stylesList.map((item) => (
            <Pressable key={item} style={[styles.chip, styleHint === item && styles.chipActive]} onPress={() => setStyleHint(item)}>
              <Text style={[styles.chipText, styleHint === item && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Upscale 4K</Text>
            <Text style={styles.smallMuted}>Uses backend generation setting</Text>
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
            <Text style={styles.uploadTitle}>Product photo</Text>
            <Text style={styles.uploadText}>Capture with camera or choose from gallery</Text>
          </>
        )}
        <View style={styles.buttonRow}>
          <SecondaryButton label="Camera" onPress={() => pickImage("camera")} />
          <SecondaryButton label="Gallery" onPress={() => pickImage("library")} />
        </View>
      </View>

      <PrimaryButton disabled={generating || offline} label="Generate photo" loading={generating} onPress={createPhoto} />
      <SecondaryButton disabled={videoLoading || offline} label={videoLoading ? "Queueing video..." : "Queue 3s video"} onPress={queueVideo} />

      {videoJob ? (
        <VideoJobCard
          job={videoJob}
          loading={videoLoading}
          onRefresh={refreshVideoJob}
        />
      ) : null}

      <ResultPanel result={result} />
    </Screen>
  );
}

function ProofShowcase() {
  return (
    <View style={styles.proofCard}>
      <View style={styles.proofMediaRow}>
        <View style={styles.proofMedia}>
          <Image source={proofBefore} style={styles.proofImageContain} />
          <View style={styles.darkBadge}><Text style={styles.darkBadgeText}>Before</Text></View>
        </View>
        <View style={styles.proofMedia}>
          <Image source={proofAfter} style={styles.proofImageCover} />
          <View style={styles.goldBadge}><Text style={styles.goldBadgeText}>After</Text></View>
        </View>
      </View>
      <View style={styles.proofFooter}>
        <Text style={styles.proofTitle}>Ready-to-sell visuals</Text>
        <Text style={styles.proofSub}>Reuse the same modes and proof assets from the web product.</Text>
      </View>
    </View>
  );
}

function ResultPanel({ result }: { result: ResultState | null }) {
  if (!result) {
    return (
      <View style={styles.resultBox}>
        <View style={styles.emptyResult}>
          <Text style={styles.emptyTitle}>Result appears here</Text>
          <Text style={styles.muted}>Generate from your product photo, then save or share it from the phone.</Text>
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
          dialogTitle: "Share DomStudio result"
        });
      } else {
        Alert.alert("Sharing unavailable", `Result prepared at ${file.path}`);
      }
    } catch (error) {
      Alert.alert("Share failed", friendlyError(error));
    }
  }

  async function saveToGallery() {
    try {
      const MediaLibrary = await import("expo-media-library");
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow photo library access to save generated results.");
        return;
      }
      const file = await resultToFile(currentResult);
      await MediaLibrary.saveToLibraryAsync(file.path);
      Alert.alert("Saved", "Result saved to your photo library.");
    } catch (error) {
      Alert.alert("Save failed", friendlyError(error));
    }
  }

  return (
    <View style={styles.resultBox}>
      <View style={styles.resultTopRow}>
        <View>
          <Text style={styles.resultKicker}>Ready result</Text>
          <Text style={styles.emptyTitle}>{result.modeLabel}</Text>
        </View>
        <Text style={styles.resultFormat}>{String(result.meta.format || "PNG").toUpperCase()}</Text>
      </View>
      <Image source={{ uri: result.uri }} style={styles.resultImage} />
      <Text style={styles.resultMeta}>
        {result.meta.width || "?"} x {result.meta.height || "?"} - {result.modeLabel}
      </Text>
      <View style={styles.buttonRow}>
        <SecondaryButton label="Share" onPress={shareResult} />
        <SecondaryButton label="Save" onPress={saveToGallery} />
      </View>
    </View>
  );
}

function VideoJobCard({
  job,
  loading,
  onRefresh
}: {
  job: VideoJob;
  loading?: boolean;
  onRefresh?: () => void;
}) {
  const source = videoSourceFromJob(job);
  const isReady = Boolean(source);
  const status = isReady ? "Ready" : job.status || "queued";

  async function shareVideo() {
    try {
      const file = await videoJobToFile(job);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.path, {
          mimeType: file.mimeType,
          dialogTitle: "Share DomStudio video"
        });
      } else {
        Alert.alert("Sharing unavailable", `Video prepared at ${file.path}`);
      }
    } catch (error) {
      Alert.alert("Share failed", friendlyError(error));
    }
  }

  async function saveVideo() {
    try {
      const MediaLibrary = await import("expo-media-library");
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow photo library access to save generated videos.");
        return;
      }
      const file = await videoJobToFile(job);
      await MediaLibrary.saveToLibraryAsync(file.path);
      Alert.alert("Saved", "Video saved to your photo library.");
    } catch (error) {
      Alert.alert("Save failed", friendlyError(error));
    }
  }

  return (
    <View style={[styles.card, styles.videoJobCard, job.status === "failed" && styles.videoJobCardFailed]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{job.subject || "Video job"}</Text>
          <Text style={styles.muted}>{status} - {job.mode || "video"} - {job.tokens_used || 0} tokens</Text>
        </View>
        <Text style={[styles.jobStatus, job.status === "failed" && styles.jobStatusFailed]}>{status}</Text>
      </View>
      {job.error ? <Text style={styles.videoError}>{job.error}</Text> : null}
      {source ? (
        <PlaybackVideo source={source} style={styles.videoPlayback} />
      ) : (
        <View style={styles.videoPendingBox}>
          <ActivityIndicator color={colors.acid} />
          <Text style={styles.muted}>Queued videos render on the backend. Refresh this card to load the output.</Text>
        </View>
      )}
      <View style={styles.buttonRow}>
        {onRefresh ? <SecondaryButton disabled={loading} label={loading ? "Refreshing..." : "Refresh"} onPress={onRefresh} /> : null}
        <SecondaryButton disabled={!isReady} label="Share" onPress={shareVideo} />
        <SecondaryButton disabled={!isReady} label="Save" onPress={saveVideo} />
      </View>
    </View>
  );
}

function StudioHero({ tokens }: { tokens: number }) {
  return (
    <View style={styles.studioHero}>
      <View style={styles.studioHeroCopy}>
        <Text style={styles.heroKicker}>Mobile product studio</Text>
        <Text style={styles.heroTitle}>Shoot, style, export.</Text>
        <Text style={styles.heroSub}>Choose a proven format, add a product photo, then generate seller-ready content.</Text>
      </View>
      <View style={styles.heroTokenBadge}>
        <Text style={styles.heroTokenValue}>{tokens}</Text>
        <Text style={styles.heroTokenLabel}>tokens</Text>
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
  offline,
  setResult,
  tokens
}: {
  clearHistory: () => Promise<void>;
  history: LocalHistoryItem[];
  offline: boolean;
  setResult: (result: ResultState | null) => void;
  tokens: Tokens;
}) {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  async function refreshJobs() {
    if (offline) {
      Alert.alert("Offline", "Reconnect to refresh video jobs.");
      return;
    }
    setLoadingJobs(true);
    try {
      setJobs(await listVideoJobs(tokens.access_token));
    } catch (error) {
      Alert.alert("Jobs failed", friendlyError(error));
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
    <Screen title="History" kicker={`${history.length} saved`}>
      <View style={styles.buttonRow}>
        <SecondaryButton disabled={!history.length} label="Clear local" onPress={clearHistory} />
        <SecondaryButton disabled={loadingJobs || offline} label={loadingJobs ? "Refreshing..." : "Refresh jobs"} onPress={refreshJobs} />
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
          <Text style={styles.cardTitle}>No saved results yet</Text>
          <Text style={styles.muted}>Generated photos are stored locally on this device for quick reuse.</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Video jobs</Text>
        {jobs.length ? (
          jobs.map((job) => (
            <VideoJobCard key={job.job_id} job={job} />
          ))
        ) : (
          <Text style={styles.muted}>Queue a video from Studio, then refresh here. Output quality still depends on the backend worker.</Text>
        )}
      </View>
    </Screen>
  );
}

function AccountScreen({
  offline,
  refreshProfile,
  signOut,
  user
}: {
  offline: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  user: UserProfile;
}) {
  const sub = user.subscription;

  return (
    <Screen title="Account" kicker={user.subscription?.plan || "free"}>
      {offline ? <Banner tone="warn" text="Offline. Account numbers may be stale." /> : null}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{user.email || user.phone || "DomStudio account"}</Text>
        <Text style={styles.muted}>Verified: {user.is_verified === false ? "No" : "Yes"}</Text>
        <Text style={styles.muted}>Tokens: {user.tokens ?? 0}</Text>
        <SecondaryButton disabled={offline} label="Refresh account" onPress={refreshProfile} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Photos" value={planText(sub?.photos_used, sub?.photos_limit)} />
        <StatCard label="Videos" value={planText(sub?.videos_used, sub?.videos_limit)} />
        <StatCard label="Premium videos" value={planText(sub?.premium_videos_used, sub?.premium_videos_limit)} />
        <StatCard label="Plan" value={sub?.plan || "free"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Plan status</Text>
        <Text style={styles.muted}>Renewal: {sub?.renews_at ? new Date(sub.renews_at).toLocaleDateString() : "Not scheduled"}</Text>
        <Text style={styles.muted}>Payments and subscriptions can be added here once native compliance decisions are final.</Text>
      </View>

      <SecondaryButton label="Sign out" onPress={signOut} />
    </Screen>
  );
}

function SettingsScreen({
  clearHistory,
  offline
}: {
  clearHistory: () => Promise<void>;
  offline: boolean;
}) {
  return (
    <Screen title="Settings" kicker={offline ? "offline" : "online"}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Environment</Text>
        <Text style={styles.muted}>API URL</Text>
        <Text style={styles.mono}>{API_URL}</Text>
        <Text style={styles.smallMuted}>
          Use your computer LAN IP for Expo Go on a physical phone. Android emulator usually uses http://10.0.2.2:8000.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device storage</Text>
        <Text style={styles.muted}>Local generated-photo history is stored on this device and can be cleared any time.</Text>
        <SecondaryButton label="Clear local history" onPress={clearHistory} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Build readiness</Text>
        <Text style={styles.muted}>Camera, gallery picker, media-library save, secure tokens, and native tabs are enabled.</Text>
        <Text style={styles.muted}>Native icon, splash, Home, Studio, Examples, and Pricing surfaces now share the DomStudio brand system.</Text>
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

function TabGlyph({ color, focused, kind }: { color: string; focused: boolean; kind: "home" | "studio" | "examples" | "pricing" }) {
  const wrapStyle = [styles.tabGlyph, focused && styles.tabGlyphActive];
  if (kind === "home") {
    return (
      <View style={wrapStyle}>
        <View style={[styles.tabHomeRoof, { borderColor: color }]} />
        <View style={[styles.tabHomeBase, { borderColor: color }]} />
      </View>
    );
  }
  if (kind === "examples") {
    return (
      <View style={wrapStyle}>
        <View style={[styles.tabLine, { backgroundColor: color, width: 18 }]} />
        <View style={[styles.tabLine, { backgroundColor: color, width: 13 }]} />
        <View style={[styles.tabLine, { backgroundColor: color, width: 16 }]} />
      </View>
    );
  }
  if (kind === "pricing") {
    return (
      <View style={wrapStyle}>
        <View style={[styles.tabRing, { borderColor: color }]} />
        <View style={[styles.tabPriceLine, { backgroundColor: color }]} />
      </View>
    );
  }
  return (
    <View style={wrapStyle}>
      <View style={[styles.tabStudioFrame, { borderColor: color }]} />
      <View style={[styles.tabStudioSpark, { backgroundColor: color }]} />
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
    padding: 16,
    paddingBottom: 128,
    gap: 14
  },
  pricingHero: {
    padding: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    gap: 8
  },
  pricingTitle: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900"
  },
  planList: {
    gap: 10
  },
  planCard: {
    minHeight: 260,
    padding: 24,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    gap: 10
  },
  planCardFeatured: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  planKicker: {
    minHeight: 34,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  planKickerFeatured: {
    color: "#bbb7af"
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  planName: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  planFeaturedText: {
    color: "#ffffff"
  },
  planPrice: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900"
  },
  planPriceFeatured: {
    color: "#ffffff"
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
  heroTokenBadge: {
    position: "absolute",
    left: 18,
    bottom: 16,
    minWidth: 86,
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  heroTokenValue: {
    color: colors.acid,
    fontSize: 18,
    fontWeight: "900"
  },
  heroTokenLabel: {
    color: "rgba(246, 241, 232, 0.62)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
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
    left: 14,
    right: 14,
    bottom: 14,
    minHeight: 76,
    paddingTop: 9,
    paddingBottom: 9,
    paddingHorizontal: 8,
    borderRadius: 34,
    backgroundColor: colors.card,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.line
  },
  nativeTabItem: {
    marginHorizontal: 2,
    borderRadius: 28,
    backgroundColor: "transparent"
  },
  nativeTabText: {
    fontWeight: "900",
    fontSize: 11
  },
  tabGlyph: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  tabGlyphActive: {
    backgroundColor: "#fff4cf"
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
  }
});
