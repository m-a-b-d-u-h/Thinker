"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface ReadingPrefs {
  fontSize: "sm" | "md" | "lg" | "xl";
  fontFamily: "inter" | "serif" | "mono" | "outfit";
  lineHeight: "tight" | "normal" | "relaxed";
  margin: "narrow" | "normal" | "wide";
}

export const fontSizeMap: Record<string, string> = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
};

export const lineHeightMap: Record<string, string> = {
  tight: "1.5",
  normal: "1.8",
  relaxed: "2.2",
};

export const fontFamilyMap: Record<string, string> = {
  inter: "'Inter', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
  outfit: "'Outfit', sans-serif",
};

export const marginMap: Record<string, string> = {
  narrow: "55ch",
  normal: "65ch",
  wide: "80ch",
};

export const fontSizes: { key: ReadingPrefs["fontSize"]; label: string }[] = [
  { key: "sm", label: "Small" },
  { key: "md", label: "Medium" },
  { key: "lg", label: "Large" },
  { key: "xl", label: "X-Large" },
];

export const fontFamilies: { key: ReadingPrefs["fontFamily"]; label: string }[] = [
  { key: "inter", label: "Inter" },
  { key: "serif", label: "Serif" },
  { key: "mono", label: "Mono" },
  { key: "outfit", label: "Outfit" },
];

export const lineHeights: { key: ReadingPrefs["lineHeight"]; label: string }[] = [
  { key: "tight", label: "Tight" },
  { key: "normal", label: "Normal" },
  { key: "relaxed", label: "Relaxed" },
];

export const margins: { key: ReadingPrefs["margin"]; label: string }[] = [
  { key: "narrow", label: "Narrow" },
  { key: "normal", label: "Normal" },
  { key: "wide", label: "Wide" },
];

interface ThemeContextValue {
  theme: "dark" | "light";
  toggleTheme: () => void;
  readingPrefs: ReadingPrefs;
  setReadingPrefs: (prefs: ReadingPrefs) => void;
  tocOpen: boolean;
  setTocOpen: (open: boolean) => void;
}

const defaultReadingPrefs: ReadingPrefs = {
  fontSize: "md",
  fontFamily: "inter",
  lineHeight: "normal",
  margin: "normal",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [readingPrefs, setReadingPrefs] = useState<ReadingPrefs>(defaultReadingPrefs);
  const [tocOpen, setTocOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    const saved = localStorage.getItem("readingPrefs");
    if (saved) {
      try { setReadingPrefs(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("readingPrefs", JSON.stringify(readingPrefs));
  }, [readingPrefs]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, readingPrefs, setReadingPrefs, tocOpen, setTocOpen }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
