"use client";

import { useState } from "react";
import { Play, Square, Moon, Sun, Menu, Heart, Volume2, FastForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useReading } from "@/contexts/ReadingContext";
import ReadingSettingsPopup from "@/components/ReadingSettingsPopup";

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
  isFavorited,
  onToggleFavorite,
}: Props) {
  const { theme, setTheme } = useTheme();
  const { tocOpen, setTocOpen } = useReading();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const [readingOpen, setReadingOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[2000] flex justify-center pb-4 md:pb-6 px-4 pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto w-full max-w-xl rounded-2xl shadow-2xl border backdrop-blur-xl bg-bg-overlay border-border overflow-hidden"
        >
          {/* Progress bar & timer (ABOVE buttons) */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative h-1 bg-border rounded-full mx-4 mt-3 mb-1">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-fg"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between px-4 pb-1">
                  <span className="text-[0.65rem] tabular-nums text-muted-dark">
                    {durationInfo.currentFormatted(progress)}
                  </span>
                  <span className="text-[0.65rem] tabular-nums text-muted-dark">
                    {durationInfo.totalFormatted}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls row */}
          <div className="flex items-center justify-around px-3 py-3">
            <button onClick={onTogglePlay} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer text-muted bg-bg-elevated border border-border">
              {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer text-muted bg-bg-elevated border border-border hover:text-fg hover:border-border-light">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={theme} initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.5, opacity: 0 }} transition={{ duration: 0.3 }}>
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </motion.div>
              </AnimatePresence>
            </button>
            <button onClick={() => setReadingOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer text-muted bg-bg-elevated border border-border">
              <span className="text-xs font-bold">Aa</span>
            </button>
            <button onClick={() => setTocOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer text-muted bg-bg-elevated border border-border">
              <Menu size={16} />
            </button>
            <button onClick={onToggleFavorite} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer bg-bg-elevated border border-border ${isFavorited ? "text-red-500" : "text-muted"}`}>
              <Heart size={16} className={isFavorited ? "fill-red-500" : "fill-none"} />
            </button>
          </div>

          {/* Audio settings (below controls, visible only when playing) */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex items-center justify-around px-3 pb-3 pt-2 border-t border-border-subtle">
                  <div className="relative">
                    <button onClick={onToggleVoiceList} className="flex items-center gap-1 text-xs border-none cursor-pointer bg-transparent text-muted">
                      <Volume2 size={14} />
                      <span>{voices.find((v: any) => v.name === selectedVoice)?.displayName || "Voice"}</span>
                    </button>
                    <AnimatePresence>
                      {showVoiceList && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-[120%] left-0 w-[160px] max-h-[200px] overflow-y-auto rounded-xl p-2 shadow-2xl z-[2001] bg-bg-elevated border border-border">
                          {voices.map((voice: any) => (
                            <button key={voice.name} onClick={() => { onVoiceChange(voice.name); onToggleVoiceList(); }} className={`w-full px-3 py-2 text-left text-xs rounded-lg cursor-pointer hover:bg-bg-card ${selectedVoice === voice.name ? "text-fg bg-bg-card" : "text-muted"}`}>
                              {voice.displayName}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-1 text-muted-dark">
                    <FastForward size={14} />
                    <select value={rate} onChange={(e) => onRateChange(parseFloat(e.target.value))} className="text-xs border-none cursor-pointer outline-none bg-transparent text-muted">
                      <option value="0.8">0.8x</option>
                      <option value="1">1.0x</option>
                      <option value="1.2">1.2x</option>
                      <option value="1.5">1.5x</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 size={14} className="text-muted-dark" />
                    <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="w-[60px] h-0.5 cursor-pointer accent-fg" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <ReadingSettingsPopup show={readingOpen} onClose={() => setReadingOpen(false)} />
    </>
  );
}
