"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { modules, sampleCards, activeMissions, reflections, highlights, savedItems } from "@/lib/dummy-data";
import {
  Flame,
  Zap,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Play,
  ArrowRight,
  Brain,
  TrendingUp,
  Calendar,
  Sparkles
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

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Flame size={20} className="text-[#f97316]" />
            <span className="text-[0.75rem] text-[#444] uppercase font-bold">Streak</span>
          </div>
          <div className="text-3xl font-bold">14</div>
          <div className="text-[0.75rem] text-[#666]">days</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={20} className="text-[#fbbf24]" />
            <span className="text-[0.75rem] text-[#444] uppercase font-bold">XP</span>
          </div>
          <div className="text-3xl font-bold">2,480</div>
          <div className="text-[0.75rem] text-[#666]">points</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={20} className="text-[#22c55e]" />
            <span className="text-[0.75rem] text-[#444] uppercase font-bold">Learned</span>
          </div>
          <div className="text-3xl font-bold">{modules.length}</div>
          <div className="text-[0.75rem] text-[#666]">models</div>
        </div>
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 size={20} className="text-[#3b82f6]" />
            <span className="text-[0.75rem] text-[#444] uppercase font-bold">Reflections</span>
          </div>
          <div className="text-3xl font-bold">{reflections.length}</div>
          <div className="text-[0.75rem] text-[#666]">total</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={20} className="text-[#f59e0b]" />
            <span className="text-[0.75rem] text-[#444] uppercase font-bold">Highlights</span>
          </div>
          <div className="text-3xl font-bold">{highlights.length}</div>
          <div className="text-[0.75rem] text-[#666]">total</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={20} className="text-[#ec4899]" />
            <span className="text-[0.75rem] text-[#444] uppercase font-bold">Saved</span>
          </div>
          <div className="text-3xl font-bold">{savedItems.length}</div>
          <div className="text-[0.75rem] text-[#666]">items</div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          {/* Rank */}
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
          {/* Category Distribution PieChart */}
          <div className="bg-[#0d0d0d] rounded-2xl p-6 border border-white/5">
            <h3 className="text-[0.875rem] font-semibold mb-6">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--c-${entry.name})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 text-[0.75rem] text-[#666]">
                  <div className="w-2 h-2 rounded-full" style={{ background: `var(--c-${cat.name})` }} />
                  <span className="capitalize">{cat.name} ({cat.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Focus */}
          <div className="bg-[#0d0d0d] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={18} />
              <span className="text-[0.875rem] font-semibold">Focus Today</span>
            </div>
            <div className="text-lg font-semibold mb-2">
              "{activeMissions[0]?.step || 'No active mission'}"
            </div>
            <p className="text-[0.875rem] text-[#666] mb-6 leading-relaxed">
              {activeMissions[0]?.title || 'Start a mission to see your focus here.'}
            </p>
            <Link href={`/models/${activeMissions[0]?.module || ''}`} className="block w-full py-3.5 bg-white text-black rounded-xl no-underline text-[0.875rem] font-semibold text-center hover:opacity-90 transition-opacity">
              Practice Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
