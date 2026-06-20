import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import {
  API_URL,
  GenerateResult,
  UserProfile,
  clearTokens,
  generateImage,
  loadMe,
  loadTokens,
  loginEmail,
  saveTokens
} from "./src/api";
import { colors, radii } from "./src/theme";

type Route = "studio" | "history" | "account";

type HistoryItem = {
  id: string;
  subject: string;
  mode: string;
  uri: string;
  createdAt: number;
  width?: number;
  height?: number;
};

const modes = [
  { id: "catalog", label: "Catalog" },
  { id: "product", label: "Product" },
  { id: "creative", label: "Creative" },
  { id: "image", label: "Lifestyle" },
  { id: "fitting", label: "Fitting" },
  { id: "mobile", label: "Stories" }
];

const stylesList = [
  "clean marketplace card",
  "premium studio lighting",
  "social media creative",
  "warm lifestyle scene",
  "story-safe vertical composition"
];
const defaultStyleHint = stylesList[0] || "";

export default function App() {
  const [route, setRoute] = useState<Route>("studio");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("catalog");
  const [subject, setSubject] = useState("");
  const [styleHint, setStyleHint] = useState(defaultStyleHint);
  const [upscale, setUpscale] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string; name?: string } | null>(null);
  const [result, setResult] = useState<{ uri: string; meta: GenerateResult } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [generating, setGenerating] = useState(false);

  const activeMode = useMemo(() => modes.find((item) => item.id === mode) || modes[0] || null, [mode]);

  useEffect(() => {
    loadTokens()
      .then(async (tokens) => {
        if (!tokens) return;
        setAccessToken(tokens.access_token);
        const profile = await loadMe(tokens.access_token);
        setUser(profile);
      })
      .catch(() => clearTokens())
      .finally(() => setBooting(false));
  }, []);

  async function signIn() {
    if (!email.trim() || !password) {
      Alert.alert("Missing login", "Enter your email and password.");
      return;
    }
    setAuthLoading(true);
    try {
      const tokens = await loginEmail(email.trim(), password);
      await saveTokens(tokens);
      const profile = await loadMe(tokens.access_token);
      setAccessToken(tokens.access_token);
      setUser(profile);
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    await clearTokens();
    setAccessToken(null);
    setUser(null);
    setResult(null);
    setSelectedImage(null);
    setRoute("studio");
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo access to upload product shots.");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.88,
      base64: true
    });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    if (!asset?.uri || !asset.base64) return;
    setSelectedImage({
      uri: asset.uri,
      base64: asset.base64,
      name: asset.fileName || "product-photo"
    });
  }

  async function createPhoto() {
    if (!accessToken) return;
    if (!subject.trim()) {
      Alert.alert("Add a prompt", "Describe the product and the result you want.");
      return;
    }
    setGenerating(true);
    try {
      const response = await generateImage(accessToken, {
        mode,
        subject: subject.trim(),
        style_hint: styleHint.trim(),
        image: selectedImage?.base64 || null,
        upscale_4k: upscale
      });
      if (!response.image) throw new Error("No image returned");
      const format = String(response.format || "png").toLowerCase();
      const uri = `data:image/${format};base64,${response.image}`;
      setResult({ uri, meta: response });
      setHistory((items) => [
        {
          id: String(Date.now()),
          subject: subject.trim(),
          mode: activeMode?.label || mode,
          uri,
          createdAt: Date.now(),
          width: response.width,
          height: response.height
        },
        ...items
      ].slice(0, 20));
      const profile = await loadMe(accessToken);
      setUser(profile);
    } catch (error) {
      Alert.alert("Generation failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function shareResult() {
    if (!result) return;
    try {
      const base64 = result.uri.split(",")[1];
      if (!base64) throw new Error("Missing result data");
      const rawFormat = String(result.meta.format || "png").toLowerCase();
      const format = rawFormat === "jpg" ? "jpeg" : rawFormat;
      const extension = format === "jpeg" ? "jpg" : format;
      const path = `${FileSystem.cacheDirectory}domstudio-result.${extension}`;
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: `image/${format}`,
          dialogTitle: "Share DomStudio result"
        });
      } else {
        Alert.alert("Saved", `Result saved to ${path}`);
      }
    } catch (error) {
      Alert.alert("Share failed", error instanceof Error ? error.message : "Please try again.");
    }
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

  if (!user || !accessToken) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.authPage}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>DS</Text></View>
            <Text style={styles.title}>DomStudio</Text>
            <Text style={styles.subtitle}>Native mobile shell for marketplace photo generation.</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign in</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable style={styles.primaryButton} onPress={signIn} disabled={authLoading}>
                {authLoading ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryButtonText}>Open studio</Text>}
              </Pressable>
              <Text style={styles.smallMuted}>API: {API_URL}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>DomStudio mobile</Text>
          <Text style={styles.headerTitle}>{route === "studio" ? "Studio" : route === "history" ? "History" : "Account"}</Text>
        </View>
        <View style={styles.tokenPill}><Text style={styles.tokenText}>{user.tokens ?? 0}</Text></View>
      </View>

      {route === "studio" ? (
        <ScrollView contentContainerStyle={styles.page}>
          <View style={styles.segmentRow}>
            {modes.map((item) => (
              <Pressable key={item.id} style={[styles.segment, mode === item.id && styles.segmentActive]} onPress={() => setMode(item.id)}>
                <Text style={[styles.segmentText, mode === item.id && styles.segmentTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.card}>
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
              {stylesList.map((item) => (
                <Pressable key={item} style={[styles.chip, styleHint === item && styles.chipActive]} onPress={() => setStyleHint(item)}>
                  <Text style={[styles.chipText, styleHint === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Upscale 4K</Text>
              <Switch value={upscale} onValueChange={setUpscale} trackColor={{ true: colors.acid, false: colors.line }} />
            </View>
          </View>

          <Pressable style={styles.upload} onPress={pickImage}>
            {selectedImage ? (
              <>
                <Image source={{ uri: selectedImage.uri }} style={styles.uploadPreview} />
                <Text style={styles.uploadText}>{selectedImage.name}</Text>
              </>
            ) : (
              <>
                <Text style={styles.uploadTitle}>Upload product photo</Text>
                <Text style={styles.uploadText}>Choose from camera roll</Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={createPhoto} disabled={generating}>
            {generating ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryButtonText}>Generate photo</Text>}
          </Pressable>

          <View style={styles.resultBox}>
            {result ? (
              <>
                <Image source={{ uri: result.uri }} style={styles.resultImage} />
                <Text style={styles.resultMeta}>{result.meta.width || "?"} x {result.meta.height || "?"} · {activeMode?.label}</Text>
                <Pressable style={styles.secondaryButton} onPress={shareResult}>
                  <Text style={styles.secondaryButtonText}>Share result</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.emptyResult}>
                <Text style={styles.emptyTitle}>Result appears here</Text>
                <Text style={styles.muted}>Generate from your product photo, then share it from the phone.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : route === "history" ? (
        <ScrollView contentContainerStyle={styles.page}>
          {history.length ? history.map((item) => (
            <Pressable key={item.id} style={styles.historyItem} onPress={() => setResult({ uri: item.uri, meta: { width: item.width, height: item.height, mode: item.mode } })}>
              <Image source={{ uri: item.uri }} style={styles.historyThumb} />
              <View style={styles.historyCopy}>
                <Text style={styles.historyTitle} numberOfLines={1}>{item.subject}</Text>
                <Text style={styles.muted}>{item.mode} · {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </Pressable>
          )) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No mobile history yet</Text>
              <Text style={styles.muted}>Generated results from this native session will appear here.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.page}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{user.email || user.phone || "DomStudio account"}</Text>
            <Text style={styles.muted}>Plan: {user.subscription?.plan || "free"}</Text>
            <Text style={styles.muted}>Tokens: {user.tokens ?? 0}</Text>
            <Text style={styles.smallMuted}>API: {API_URL}</Text>
            <Pressable style={styles.secondaryButton} onPress={signOut}>
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        {(["studio", "history", "account"] as Route[]).map((item) => (
          <Pressable key={item} style={[styles.tab, route === item && styles.tabActive]} onPress={() => setRoute(item)}>
            <Text style={[styles.tabText, route === item && styles.tabTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12
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
    minWidth: 58,
    minHeight: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line
  },
  tokenText: {
    color: colors.acid,
    fontWeight: "900"
  },
  page: {
    padding: 16,
    paddingBottom: 104,
    gap: 14
  },
  card: {
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
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
    backgroundColor: colors.card
  },
  secondaryButtonText: {
    color: colors.ink,
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
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  segment: {
    paddingHorizontal: 12,
    minHeight: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line
  },
  segmentActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  segmentText: {
    color: colors.muted,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: "#ffffff"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
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
    justifyContent: "space-between"
  },
  upload: {
    minHeight: 168,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.muted,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    gap: 8
  },
  uploadPreview: {
    width: "100%",
    height: 220,
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
  tabBar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: "row",
    gap: 6,
    padding: 8,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,253,248,0.96)",
    borderWidth: 1,
    borderColor: colors.line
  },
  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  tabActive: {
    backgroundColor: "#fff3d8"
  },
  tabText: {
    color: colors.muted,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  tabTextActive: {
    color: colors.ink
  }
});
