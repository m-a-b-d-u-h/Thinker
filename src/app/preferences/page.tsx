"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";

const ALL_CATEGORIES = [
  "mindset", "clarity", "habit", "focus",
  "productivity", "strategy", "creativity", "learning",
  "wellbeing", "logic", "psychology", "success",
  "stoicism", "cognitive-bias", "decision-making",
  "business", "mental-model", "problem-solving",
  "game-theory", "resilience", "risk", "economics",
];

export default function PreferencesPage() {
  const router = useRouter();
  const { user, preferences, setPreferences } = useAuth();
  const [selected, setSelected] = useState<string[]>(preferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    setSelected(preferences);
  }, [preferences]);

  const toggleCategory = (cat: string) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await setPreferences(selected);
      router.push("/models");
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[600px]"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white mb-3">
              What interests you?
            </h1>
            <p className="text-[#666] text-sm">
              Pick the topics you want to explore. We&apos;ll personalize your feed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {ALL_CATEGORIES.map((cat, idx) => {
              const active = selected.includes(cat);
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-white text-black shadow-lg shadow-white/10"
                      : "bg-white/5 border border-white/5 text-[#555] hover:border-white/15 hover:text-white"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
                </motion.button>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={handleSave}
              disabled={saving || selected.length === 0}
              className="px-8 py-3.5 bg-white text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : `Save & Start (${selected.length})`}
            </button>
            <p className="mt-3 text-xs text-[#444]">
              Select at least one category to continue
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
