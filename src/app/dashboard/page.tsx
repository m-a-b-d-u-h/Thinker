"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { modules, sampleCards, activeMissions, reflections, highlights, savedItems } from "@/lib/dummy-data";
import {
  Flame,
  Play,
} from "lucide-react";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
      setTimeOfDay("morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
      setTimeOfDay("afternoon");
    } else {
      setGreeting("Good evening");
      setTimeOfDay("evening");
    }
  }, []);

  const todayQuote = "Action is the foundational key to all success.";

  const categoryCount = modules.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  const categoryColors: Record<string, string> = {
    mindset: '#a78bfa',
    clarity: '#fb923c',
    habit: '#fbbf24',
    action: '#2dd4bf',
    productivity: '#34d399',
    focus: '#60a5fa',
    learning: '#f472b6',
    creativity: '#fb7185',
    strategy: '#818cf8',
    wellbeing: '#4ade80',
    'mental-model': '#8b5cf6',
    logic: '#06b6d4',
    psychology: '#ec4899',
    success: '#10b981',
    stoicism: '#78716c',
    'cognitive-bias': '#f59e0b',
    'decision-making': '#6366f1',
    business: '#0ea5e9',
    'problem-solving': '#14b8a6',
    'game-theory': '#f43f5e',
    resilience: '#22c55e',
    risk: '#ef4444',
    economics: '#eab308',
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      {/* Header */}
      <header className="mb-12">
        <div className="mb-2">
          <span className="text-[0.875rem] text-[#444] uppercase tracking-[0.1em]">
            {greeting}
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-[-0.02em] mb-2">
          Ready to Think,
        </h1>
        <p className="text-lg text-[#666]">
          {todayQuote}
        </p>
      </header>

      {/* Streak Bar */}
      <div className="mb-6">
        <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden relative px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Flame size={14} className="text-[#f97316]" />
            <span className="text-[0.75rem] font-bold text-[#888]">14 day streak</span>
          </div>
          <div className="flex-1 mx-6 relative z-10">
            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#f97316] to-[#fb923c] rounded-full transition-all" style={{ width: `${(14 / 30) * 100}%` }} />
            </div>
          </div>
          <div className="relative z-10 shrink-0">
            <span className="text-[0.6875rem] text-[#444] font-bold">30 day goal</span>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#f97316]/5 to-transparent rounded-full translate-x-1/4 -translate-y-1/4" />
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-8">

          {/* Rank + Weekly Insights */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Rank */}
            <div className="bg-[#0d0d0d] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[0.875rem] text-[#444] uppercase font-bold tracking-[0.05em]">
                  Current Rank
                </h3>
                <span className="text-[0.75rem] text-[#666]">2,480 XP</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-lg font-bold">
                  S
                </div>
                <div>
                  <div className="font-semibold text-lg">Strategist</div>
                  <div className="text-[0.75rem] text-[#666]">Thinking Level 4</div>
                </div>
              </div>
              <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full" style={{ width: `${((2480 - 2000) / (3500 - 2000)) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[0.6875rem] text-[#666]">
                <span>2,000 XP</span>
                <span>Next: Master (3,500 XP)</span>
              </div>
            </div>

            {/* Weekly Insights */}
            <div className="bg-[#0d0d0d] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[0.875rem] text-[#444] uppercase font-bold tracking-[0.05em]">
                  Weekly Insights
                </h3>
                <Flame size={16} className="text-[#f97316]" />
              </div>
              <div className="flex items-center justify-between gap-1.5 mb-5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const now = new Date();
                  const dayOfWeek = (now.getDay() + 6) % 7;
                  const daysAgo = dayOfWeek - ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day);
                  const targetDate = new Date(now);
                  targetDate.setDate(now.getDate() - Math.abs(daysAgo));
                  const hasReflection = reflections.some(r => {
                    const rDate = new Date(r.timestamp);
                    return rDate.toDateString() === targetDate.toDateString();
                  });
                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${hasReflection ? 'bg-[#f97316] text-black' : 'bg-[#1a1a1a]'}`}>
                        <div className={`w-2 h-2 rounded-full ${hasReflection ? 'bg-black' : 'bg-[#333]'}`} />
                      </div>
                      <span className="text-[0.625rem] text-[#444] font-bold">{day.charAt(0)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[0.75rem] text-[#666]">
                <span className="text-xl font-bold text-white">
                  {reflections.filter(r => {
                    const now = new Date();
                    const rDate = new Date(r.timestamp);
                    const diffDays = Math.floor((now.getTime() - rDate.getTime()) / 86400000);
                    return diffDays < 7;
                  }).length}
                </span>
                {" "}reflections this week
              </div>
            </div>
          </div>

          {/* Continue Learning */}
          <div>
            <h3 className="text-[0.875rem] text-[#444] uppercase font-bold mb-4 tracking-[0.05em]">
              Continue Learning
            </h3>
            <div className="flex flex-col gap-3">
              {modules.slice(0, 3).map((m) => (
                <Link key={m.slug} href={`/models/${m.slug}`} className="group bg-[#0d0d0d] rounded-xl px-6 py-5 border border-white/5 no-underline flex items-center gap-4 hover:bg-[#111] hover:border-white/10 transition-all">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: `var(--c-${m.category})` }} />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{m.title}</div>
                    <div className="text-[0.8125rem] text-[#666]">{m.description}</div>
                  </div>
                  <Play size={16} className="text-[#333] group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Activity Charts */}
        <div className="flex flex-col gap-8">
          {/* Category Distribution */}
          <div className="bg-[#0d0d0d] rounded-2xl p-6 border border-white/5">
            <h3 className="text-[0.875rem] text-[#444] uppercase font-bold tracking-[0.05em] mb-6">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || '#555'} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl pointer-events-none">
                          <p className="text-[0.75rem] font-bold text-white capitalize">{data.name}</p>
                          <p className="text-[0.6875rem] text-[#888]">{data.value} models</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2.5 text-[0.6875rem] text-[#555]">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: categoryColors[cat.name] || '#555' }} />
                  <span className="capitalize truncate">{cat.name} ({cat.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
