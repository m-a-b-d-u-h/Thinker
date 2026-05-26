"use client";

import { useState } from "react";
import { Play, Square, Moon, Sun, Menu, Heart, Volume2, FastForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import ReadingSettingsPopup from "@/components/ReadingSettingsPopup";
import TableOfContents from "@/components/TableOfContents";

interface Props {
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  durationInfo: any;
  voices: any[];
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  showVoiceList: boolean;
  onToggleVoiceList: () => void;
  rate: number;
  onRateChange: (rate: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export default function ModuleFloatingBar({
  isPlaying,
  onTogglePlay,
  progress,
  durationInfo,
  voices,
  selectedVoice,
  onVoiceChange,
  showVoiceList,
  onToggleVoiceList,
  rate,
  onRateChange,
  volume,
  onVolumeChange,
  showSettings,
  onToggleSettings,
  isFavorited,
  onToggleFavorite,
}: Props) {
  const { theme, toggleTheme, tocOpen, setTocOpen } = useTheme();
  const [readingOpen, setReadingOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[2000] flex justify-center pb-4 md:pb-6 px-4 pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto w-full max-w-xl rounded-2xl shadow-2xl border backdrop-blur-xl"
          style={{
            background: "var(--bg-overlay)",
            borderColor: "var(--border)",
          }}
        >
          {/* Progress bar */}
          <div className="relative h-1 bg-[var(--border)] rounded-full mx-4 mt-3">
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: "var(--text)", width: `${progress}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-around px-3 py-3">
            {/* Play/Pause */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all border-none cursor-pointer"
              style={{ background: "var(--text)", color: "var(--bg)" }}
            >
              {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer"
              style={{ color: "var(--muted)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Reading settings */}
            <button
              onClick={() => setReadingOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer"
              style={{ color: "var(--muted)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            >
              <span className="text-xs font-bold">Aa</span>
            </button>

            {/* TOC */}
            <button
              onClick={() => setTocOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer"
              style={{ color: "var(--muted)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            >
              <Menu size={16} />
            </button>

            {/* Favorite */}
            <button
              onClick={onToggleFavorite}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer"
              style={{
                color: isFavorited ? "#ef4444" : "var(--muted)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <Heart size={16} fill={isFavorited ? "#ef4444" : "none"} />
            </button>
          </div>

          {/* Audio settings row (collapsible) */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-around px-3 pb-3 pt-1 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  {/* Voice */}
                  <div className="relative">
                    <button
                      onClick={onToggleVoiceList}
                      className="flex items-center gap-1 text-xs border-none cursor-pointer bg-transparent"
                      style={{ color: "var(--muted)" }}
                    >
                      <Volume2 size={14} />
                      <span>{voices.find((v: any) => v.name === selectedVoice)?.displayName || "Voice"}</span>
                    </button>
                    <AnimatePresence>
                      {showVoiceList && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute bottom-[120%] left-0 w-[160px] max-h-[200px] overflow-y-auto rounded-xl p-2 shadow-2xl z-[2001]"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                        >
                          {voices.map((voice: any) => (
                            <button
                              key={voice.name}
                              onClick={() => { onVoiceChange(voice.name); onToggleVoiceList(); }}
                              className="w-full px-3 py-2 text-left text-xs rounded-lg cursor-pointer"
                              style={{
                                color: selectedVoice === voice.name ? "var(--text)" : "var(--muted)",
                                background: selectedVoice === voice.name ? "var(--bg-card)" : "transparent",
                              }}
                            >
                              {voice.displayName}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Speed */}
                  <div className="flex items-center gap-1" style={{ color: "var(--muted-dark)" }}>
                    <FastForward size={14} />
                    <select
                      value={rate}
                      onChange={(e) => onRateChange(parseFloat(e.target.value))}
                      className="text-xs border-none cursor-pointer outline-none bg-transparent"
                      style={{ color: "var(--muted)" }}
                    >
                      <option value="0.8">0.8x</option>
                      <option value="1">1.0x</option>
                      <option value="1.2">1.2x</option>
                      <option value="1.5">1.5x</option>
                    </select>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Volume2 size={14} style={{ color: "var(--muted-dark)" }} />
                    <input
                      type="range" min="0" max="1" step="0.1" value={volume}
                      onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                      className="w-[60px] h-0.5 cursor-pointer"
                      style={{ accentColor: "var(--text)" }}
                    />
                  </div>

                  {/* Collapse button */}
                  <button
                    onClick={onToggleSettings}
                    className="text-xs border-none cursor-pointer bg-transparent"
                    style={{ color: "var(--muted)" }}
                  >
                    Hide
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Time */}
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-[0.65rem] tabular-nums" style={{ color: "var(--muted-dark)" }}>
              {durationInfo.currentFormatted(progress)}
            </span>
            <span className="text-[0.65rem] tabular-nums" style={{ color: "var(--muted-dark)" }}>
              {durationInfo.totalFormatted}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Toggle settings when the settings icon in the old code is clicked - using the new floating bar's own toggle */}
      {!showSettings && (
        <button
          onClick={onToggleSettings}
          className="fixed bottom-0 right-0 z-[1999] mb-4 mr-4 pointer-events-auto px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer shadow-lg"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--muted)",
            borderColor: "var(--border)",
            transform: "translateY(-60px)",
          }}
        >
          Audio Settings
        </button>
      )}

      <ReadingSettingsPopup show={readingOpen} onClose={() => setReadingOpen(false)} />
      <TableOfContents
        show={tocOpen}
        onClose={() => setTocOpen(false)}
        onNavigate={(id) => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </>
  );
}
