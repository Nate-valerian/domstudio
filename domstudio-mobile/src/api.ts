import * as SecureStore from "expo-secure-store";

export type Tokens = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

export type UserProfile = {
  id?: string;
  email?: string;
  phone?: string;
  is_verified?: boolean;
  tokens: number;
  subscription?: {
    plan?: string;
    photos_used?: number;
    photos_limit?: number;
    videos_used?: number;
    videos_limit?: number;
    premium_videos_used?: number;
    premium_videos_limit?: number;
    renews_at?: string | null;
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
  tokens_charged?: number;
  token_balance?: number;
};

export type VideoJob = {
  job_id: string;
  status: string;
  mode?: string;
  subject?: string;
  output_url?: string | null;
  output_data?: string | null;
  output_format?: string | null;
  has_output?: boolean;
  error?: string | null;
  tokens_used?: number;
  created_at?: string;
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

export function registerEmail(email: string, password: string): Promise<{ message: string; user_id?: string }> {
  return request<{ message: string; user_id?: string }>("/auth/register/email", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function verifyEmail(contact: string, code: string): Promise<Tokens> {
  return request<Tokens>("/auth/verify/email", {
    method: "POST",
    body: JSON.stringify({ contact, code })
  });
}

export function loginPhone(phone: string): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/login/phone", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export function verifyPhone(contact: string, code: string): Promise<Tokens> {
  return request<Tokens>("/auth/verify/phone", {
    method: "POST",
    body: JSON.stringify({ contact, code })
  });
}

export function refreshTokens(refresh_token: string): Promise<Tokens> {
  return request<Tokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token })
  });
}

export function logout(refresh_token: string): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token })
  });
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function resetPassword(email: string, code: string, new_password: string): Promise<Tokens> {
  return request<Tokens>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, new_password })
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

export function generateVideo(
  accessToken: string,
  payload: GeneratePayload & { duration_s?: number; video_provider?: "local" | "premium" }
): Promise<VideoJob> {
  return request<VideoJob>(
    "/generation/video",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    accessToken
  );
}

export function listVideoJobs(accessToken: string): Promise<VideoJob[]> {
  return request<VideoJob[]>("/generation/jobs", {}, accessToken);
}

export function getVideoJob(accessToken: string, jobId: string): Promise<VideoJob> {
  return request<VideoJob>(`/generation/jobs/${jobId}`, {}, accessToken);
}
