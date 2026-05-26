"use client";

import { useTheme, type ReadingPrefs, fontSizes, fontFamilies, lineHeights, margins, fontFamilyMap } from "@/contexts/ThemeContext";

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function ReadingSettingsPopup({ show, onClose }: Props) {
  const { readingPrefs, setReadingPrefs } = useTheme();

  const update = (partial: Partial<ReadingPrefs>) => {
    setReadingPrefs({ ...readingPrefs, ...partial });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-md rounded-t-2xl p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>Reading Settings</h3>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: "var(--muted)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Font Size */}
        <div className="mb-5">
          <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--muted)" }}>Font Size</label>
          <div className="grid grid-cols-4 gap-2">
            {fontSizes.map((f) => (
              <button
                key={f.key}
                onClick={() => update({ fontSize: f.key })}
                className="py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: readingPrefs.fontSize === f.key ? "var(--accent)" : "var(--bg-elevated)",
                  color: readingPrefs.fontSize === f.key ? "#fff" : "var(--text)",
                  border: readingPrefs.fontSize === f.key ? "none" : "1px solid var(--border)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="mb-5">
          <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--muted)" }}>Font Family</label>
          <select
            value={readingPrefs.fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value as ReadingPrefs["fontFamily"] })}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            {fontFamilies.map((f) => (
              <option key={f.key} value={f.key} style={{ fontFamily: fontFamilyMap[f.key] }}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line Height */}
        <div className="mb-5">
          <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--muted)" }}>Line Height</label>
          <div className="grid grid-cols-3 gap-2">
            {lineHeights.map((l) => (
              <button
                key={l.key}
                onClick={() => update({ lineHeight: l.key })}
                className="py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: readingPrefs.lineHeight === l.key ? "var(--accent)" : "var(--bg-elevated)",
                  color: readingPrefs.lineHeight === l.key ? "#fff" : "var(--text)",
                  border: readingPrefs.lineHeight === l.key ? "none" : "1px solid var(--border)",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--muted)" }}>Content Width</label>
          <div className="grid grid-cols-3 gap-2">
            {margins.map((m) => (
              <button
                key={m.key}
                onClick={() => update({ margin: m.key })}
                className="py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: readingPrefs.margin === m.key ? "var(--accent)" : "var(--bg-elevated)",
                  color: readingPrefs.margin === m.key ? "#fff" : "var(--text)",
                  border: readingPrefs.margin === m.key ? "none" : "1px solid var(--border)",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
