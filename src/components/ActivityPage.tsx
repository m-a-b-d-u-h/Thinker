"use client";

import React from "react";
import { Sparkles, Clock, TrendingUp, Library, CheckCircle, Bookmark, Highlighter, Gift, Map, Target } from "lucide-react";

const pageConfigs: Record<string, { title: string, icon: any, desc: string }> = {
  history: { title: "Learning History", icon: Clock, desc: "Continue where you left off in your knowledge journey." },
  trending: { title: "Trending Theories", icon: TrendingUp, desc: "Popular mental models being mastered by the community right now." },
  collection: { title: "Your Collection", icon: Library, desc: "Personal library of curated frameworks and deep-dive modules." },
  finished: { title: "Mastered Modules", icon: CheckCircle, desc: "Theories you have fully implemented and mastered." },
  saved: { title: "Saved Insights", icon: Bookmark, desc: "Bookmarked sections and key concepts for quick reference." },
  highlight: { title: "My Highlights", icon: Highlighter, desc: "Curated snippets and important quotes from your reading sessions." },
  free: { title: "Daily Free Theory", icon: Gift, desc: "Unlock a new professional framework every 24 hours for free." },
  plan: { title: "Learning Plan", icon: Map, desc: "Your strategic roadmap for mastering new mental models." },
  activities: { title: "Assigned Activities", icon: Target, desc: "Action items and commitments generated from your mastered theories." },
};

export default function GenericActivityPage({ type }: { type: string }) {
  const config = pageConfigs[type] || pageConfigs.history;
  const Icon = config.icon;

  return (
    <div className="container section">
      <header className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-white">
            <Icon size={20} />
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Sparkles size={14} />
            <span className="text-xs font-black uppercase tracking-wider">Member Section</span>
          </div>
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter">{config.title}</h1>
        <p className="text-muted text-lg max-w-xl">{config.desc}</p>
      </header>

      <div className="h-64 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-6 bg-white/1">
        <div className="text-gray-200">
          <Icon size={48} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No data yet</h3>
          <p className="text-gray-400">Start exploring theories to populate this section.</p>
        </div>
      </div>
    </div>
  );
}
