"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { modules, sampleCards } from "@/lib/dummy-data";
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

  const recentModules = modules.slice(0, 3);
  const activeMissions = [
    { id: 1, title: "Stop Waiting", step: "Do the 5-minute rule", module: "stop-waiting", progress: 75 },
    { id: 2, title: "Cost of Not Deciding", step: "Set a hard deadline", module: "cost-of-not-deciding", progress: 45 },
  ];

  const todayQuote = "Action is the foundational key to all success.";

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
      <div className="grid grid-cols-4 gap-4 mb-12">
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
          <div className="text-3xl font-bold">3</div>
          <div className="text-[0.75rem] text-[#666]">models</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Target size={20} className="text-[#8b5cf6]" />
            <span className="text-[0.75rem] text-[#444] uppercase font-bold">Actions</span>
          </div>
          <div className="text-3xl font-bold">2</div>
          <div className="text-[0.75rem] text-[#666]">in progress</div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          {/* Quick Actions */}
          <div>
            <h3 className="text-[0.875rem] text-[#444] uppercase font-bold mb-4 tracking-[0.05em]">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/models" className="group bg-[#0d0d0d] rounded-xl p-6 border border-white/5 no-underline flex items-center gap-4 hover:bg-[#111] hover:border-white/10 transition-all">
                <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center">
                  <Brain size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-1">Mental Models</div>
                  <div className="text-[0.8125rem] text-[#666]">Browse all theories</div>
                </div>
                <ChevronRight size={18} className="text-[#333] group-hover:text-white transition-colors" />
              </Link>

              <Link href="/models/stop-waiting/quiz" className="group bg-[#0d0d0d] rounded-xl p-6 border border-white/5 no-underline flex items-center gap-4 hover:bg-[#111] hover:border-white/10 transition-all">
                <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-1">Quiz</div>
                  <div className="text-[0.8125rem] text-[#666]">Test your knowledge</div>
                </div>
                <ChevronRight size={18} className="text-[#333] group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Active Missions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[0.875rem] text-[#444] uppercase font-bold tracking-[0.05em]">
                Active Missions
              </h3>
              <Link href="/models" className="text-[0.75rem] text-[#444] no-underline hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {activeMissions.map((mission) => (
                <div key={mission.id} className="bg-[#0d0d0d] rounded-xl px-6 py-5 border border-white/5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <Target size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[0.8125rem] text-[#888] mb-1">{mission.title}</div>
                    <div className="font-medium">{mission.step}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-15 h-1 bg-[#1a1a1a] rounded-sm overflow-hidden">
                      <div className="h-full bg-white rounded-sm" style={{ width: `${mission.progress}%` }} />
                    </div>
                    <span className="text-[0.75rem] text-[#666] min-w-[36px]">{mission.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Models */}
          <div>
            <h3 className="text-[0.875rem] text-[#444] uppercase font-bold mb-4 tracking-[0.05em]">
              Recent Models
            </h3>
            <div className="flex flex-col gap-3">
              {recentModules.map((m) => (
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

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Daily Focus */}
          <div className="bg-[#0d0d0d] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={18} />
              <span className="text-[0.875rem] font-semibold">Focus Today</span>
            </div>
            <div className="text-lg font-semibold mb-2">
              "The 5-Minute Rule"
            </div>
            <p className="text-[0.875rem] text-[#666] mb-6 leading-relaxed">
              Commit to just 5 minutes. After that, you can stop. Usually the momentum keeps you going.
            </p>
            <Link href="/models/stop-waiting" className="block w-full py-3.5 bg-white text-black rounded-xl no-underline text-[0.875rem] font-semibold text-center hover:opacity-90 transition-opacity">
              Practice Now
            </Link>
          </div>

          {/* Upcoming */}
          <div className="bg-[#0d0d0d] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={18} />
              <span className="text-[0.875rem] font-semibold">Coming Up</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl">
                <Clock size={14} className="text-[#444]" />
                <div className="flex-1 text-[0.875rem] text-[#888]">Tomorrow</div>
                <div className="text-[0.8125rem] font-medium">Habit Building</div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl">
                <Clock size={14} className="text-[#444]" />
                <div className="flex-1 text-[0.875rem] text-[#888]">This Week</div>
                <div className="text-[0.8125rem] font-medium">First Principles</div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="p-6">
            <p className="text-base text-[#888] italic leading-relaxed mb-4">
              "The greatest danger for most of us is not that our aim is too high and we miss it, but that it is too low and we hit it."
            </p>
            <p className="text-[0.8125rem] text-[#444]">— Michelangelo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
