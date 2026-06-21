import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  LogBox,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  Studio: undefined;
  History: undefined;
  Account: undefined;
  Settings: undefined;
};

type AuthMode = "login" | "register" | "verifyEmail" | "phone" | "verifyPhone" | "forgot" | "reset";

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

export default function App() {
  const netInfo = useNetInfo();
  const offline = isOfflineState(netInfo);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);

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
                  offline={offline}
                  refreshProfile={refreshProfile}
                  rememberResult={rememberResult}
                  result={result}
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
  offline: boolean;
  refreshProfile: () => Promise<void>;
  rememberResult: (result: ResultState) => void;
  result: ResultState | null;
  setResult: (result: ResultState | null) => void;
  signOut: () => Promise<void>;
  tokens: Tokens;
  user: UserProfile;
}) {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.nativeTabBar,
        tabBarLabelStyle: styles.nativeTabText
      }}
    >
      <Tabs.Screen name="Studio" options={{ tabBarIcon: ({ color }) => <TabGlyph color={color} kind="studio" /> }}>
        {() => <StudioScreen {...props} />}
      </Tabs.Screen>
      <Tabs.Screen name="History" options={{ tabBarIcon: ({ color }) => <TabGlyph color={color} kind="history" /> }}>
        {() => <HistoryScreen {...props} />}
      </Tabs.Screen>
      <Tabs.Screen name="Account" options={{ tabBarIcon: ({ color }) => <TabGlyph color={color} kind="account" /> }}>
        {() => <AccountScreen {...props} />}
      </Tabs.Screen>
      <Tabs.Screen name="Settings" options={{ tabBarIcon: ({ color }) => <TabGlyph color={color} kind="settings" /> }}>
        {() => <SettingsScreen {...props} />}
      </Tabs.Screen>
    </Tabs.Navigator>
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
      Alert.alert("Video queued", `Job ${job.job_id} is ${job.status}. Check History to refresh jobs.`);
      await refreshProfile();
    } catch (error) {
      Alert.alert("Video failed", friendlyError(error));
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
            <View key={job.job_id} style={styles.jobRow}>
              <View style={styles.historyCopy}>
                <Text style={styles.historyTitle} numberOfLines={1}>{job.subject || "Video job"}</Text>
                <Text style={styles.muted}>{job.status} - {job.mode || "video"} - {job.tokens_used || 0} tokens</Text>
              </View>
              <Text style={styles.jobStatus}>{job.has_output ? "Ready" : job.status}</Text>
            </View>
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
        <Text style={styles.muted}>Icons and splash are placeholders until final brand assets are supplied.</Text>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TabGlyph({ color, kind }: { color: string; kind: "studio" | "history" | "account" | "settings" }) {
  if (kind === "history") {
    return (
      <View style={styles.tabGlyph}>
        <View style={[styles.tabLine, { backgroundColor: color, width: 18 }]} />
        <View style={[styles.tabLine, { backgroundColor: color, width: 13 }]} />
        <View style={[styles.tabLine, { backgroundColor: color, width: 16 }]} />
      </View>
    );
  }
  if (kind === "account") {
    return (
      <View style={styles.tabGlyph}>
        <View style={[styles.tabHead, { borderColor: color }]} />
        <View style={[styles.tabShoulders, { borderColor: color }]} />
      </View>
    );
  }
  if (kind === "settings") {
    return (
      <View style={styles.tabGlyph}>
        <View style={[styles.tabRing, { borderColor: color }]} />
        <View style={[styles.tabDot, { backgroundColor: color }]} />
      </View>
    );
  }
  return (
    <View style={styles.tabGlyph}>
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
    paddingBottom: 108,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  statCard: {
    width: "48.5%",
    minHeight: 82,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    justifyContent: "space-between"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  statValue: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  nativeTabBar: {
    minHeight: 70,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.card,
    borderTopColor: colors.line
  },
  nativeTabText: {
    fontWeight: "900",
    fontSize: 11
  },
  tabGlyph: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
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
