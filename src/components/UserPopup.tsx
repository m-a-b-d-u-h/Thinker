"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const ALL_CATEGORIES = [
  "mindset", "clarity", "habit", "focus",
  "productivity", "strategy", "creativity", "learning",
  "wellbeing", "logic", "psychology", "success",
  "stoicism", "cognitive-bias", "decision-making",
  "business", "mental-model", "problem-solving",
  "game-theory", "resilience", "risk", "economics",
];

export default function UserPopup() {
  const { user, logout, preferences, setPreferences } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(preferences);
  const [saving, setSaving] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(preferences);
  }, [preferences]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleCategory = (cat: string) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setPreferences(selected);
      setEditing(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => { setOpen(!open); setEditing(false); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/8 text-gray-400 text-sm font-medium transition-colors hover:text-white hover:border-white/15 hover:bg-white/3 cursor-pointer"
      >
        <span>{user.name || user.email}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#0c0c0c] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {user.name || "User"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {!editing ? (
              <div className="p-3">
                <button
                  onClick={() => { setEditing(true); setSelected(preferences); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Settings size={15} />
                  <span>Category Preferences</span>
                </button>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Choose your topics</h3>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4 max-h-48 overflow-y-auto">
                  {ALL_CATEGORIES.map((cat) => {
                    const active = selected.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? "bg-white text-black"
                            : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || selected.length === 0}
                  className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
