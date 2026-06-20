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

const HISTORY_FILE = `${FileSystem.documentDirectory}domstudio-history.json`;

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
