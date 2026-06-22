import * as FileSystem from "expo-file-system/legacy";

export type LocalHistoryItem = {
  id: string;
  subject: string;
  mode: string;
  uri: string;
  createdAt: number;
  width?: number;
  height?: number;
  format?: string;
};

export type LocalAppLanguage = "en" | "ru";

const HISTORY_FILE = `${FileSystem.documentDirectory}domstudio-history.json`;
const SETTINGS_FILE = `${FileSystem.documentDirectory}domstudio-settings.json`;

export async function loadLocalHistory(): Promise<LocalHistoryItem[]> {
  try {
    const info = await FileSystem.getInfoAsync(HISTORY_FILE);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(HISTORY_FILE);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveLocalHistory(items: LocalHistoryItem[]): Promise<void> {
  await FileSystem.writeAsStringAsync(HISTORY_FILE, JSON.stringify(items.slice(0, 30)));
}

export async function clearLocalHistory(): Promise<void> {
  const info = await FileSystem.getInfoAsync(HISTORY_FILE);
  if (info.exists) {
    await FileSystem.deleteAsync(HISTORY_FILE, { idempotent: true });
  }
}

export async function loadLanguage(): Promise<LocalAppLanguage> {
  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_FILE);
    if (!info.exists) return "en";
    const raw = await FileSystem.readAsStringAsync(SETTINGS_FILE);
    const parsed = JSON.parse(raw);
    return parsed?.language === "ru" ? "ru" : "en";
  } catch {
    return "en";
  }
}

export async function saveLanguage(language: LocalAppLanguage): Promise<void> {
  await FileSystem.writeAsStringAsync(SETTINGS_FILE, JSON.stringify({ language }));
}
