import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/types";

export const authApi = {
  register: (body: { email: string; password: string; name?: string }) =>
    api.post<AuthResponse>("/auth/register", body),

  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", body),

  googleAuth: (body: { googleId: string; email: string; name?: string; avatar?: string }) =>
    api.post<AuthResponse>("/auth/google", body),

  getMe: () => api.get<User>("/auth/me"),

  updateProfile: (body: { name?: string; avatar?: string }) =>
    api.put<User>("/auth/profile", body),

  getPreferences: () =>
    api.get<{ preferredCategories: string[] }>("/auth/preferences"),

  updatePreferences: (body: { preferredCategories: string[] }) =>
    api.put<{ preferredCategories: string[] }>("/auth/preferences", body),
};
