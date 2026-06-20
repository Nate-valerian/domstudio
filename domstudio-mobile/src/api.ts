import * as SecureStore from "expo-secure-store";

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type UserProfile = {
  id?: string;
  email?: string;
  phone?: string;
  tokens: number;
  subscription?: {
    plan?: string;
    photos_used?: number;
    photos_limit?: number;
    videos_used?: number;
    videos_limit?: number;
    premium_videos_used?: number;
    premium_videos_limit?: number;
  };
};

export type GeneratePayload = {
  mode: string;
  subject: string;
  style_hint: string;
  image?: string | null;
  upscale_4k?: boolean;
};

export type GenerateResult = {
  status?: string;
  image?: string;
  format?: string;
  width?: number;
  height?: number;
  mode?: string;
};

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const ACCESS_KEY = "domstudio_mobile_access";
const REFRESH_KEY = "domstudio_mobile_refresh";

export async function loadTokens(): Promise<Tokens | null> {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY)
  ]);
  if (!access || !refresh) return null;
  return { access_token: access, refresh_token: refresh };
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.access_token),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh_token)
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY)
  ]);
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.detail || data?.error || "Request failed";
    throw new Error(typeof message === "string" ? message : "Request failed");
  }
  return data as T;
}

export function loginEmail(email: string, password: string): Promise<Tokens> {
  return request<Tokens>("/auth/login/email", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function loadMe(accessToken: string): Promise<UserProfile> {
  return request<UserProfile>("/users/me/full", {}, accessToken);
}

export function generateImage(accessToken: string, payload: GeneratePayload): Promise<GenerateResult> {
  return request<GenerateResult>(
    "/generation/generate",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    accessToken
  );
}

