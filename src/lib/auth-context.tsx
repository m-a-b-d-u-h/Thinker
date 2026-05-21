"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi } from "@/lib/api/auth";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  preferences: string[];
  setPreferences: (categories: string[]) => Promise<void>;
  loadPreferences: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferencesState] = useState<string[]>([]);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  useEffect(() => {
    if (user?.preferredCategories) {
      setPreferencesState(user.preferredCategories);
    }
  }, [user]);

  const loadPreferences = useCallback(async () => {
    try {
      const res = await authApi.getPreferences();
      setPreferencesState(res.preferredCategories);
    } catch {
      // ignore
    }
  }, []);

  const setPreferences = useCallback(async (categories: string[]) => {
    const res = await authApi.updatePreferences({ preferredCategories: categories });
    setPreferencesState(res.preferredCategories);
    setUser((prev) => prev ? { ...prev, preferredCategories: res.preferredCategories } : null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("token", res.token);
    setUser(res.user);
    if (res.user.preferredCategories) {
      setPreferencesState(res.user.preferredCategories);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await authApi.register({ email, password, name });
    localStorage.setItem("token", res.token);
    setUser(res.user);
  }, []);

  const loginWithGoogle = useCallback(async (profileJson: string) => {
    const profile = JSON.parse(profileJson);
    const res = await authApi.googleAuth({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });
    localStorage.setItem("token", res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setPreferencesState([]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, setUser, preferences, setPreferences, loadPreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
