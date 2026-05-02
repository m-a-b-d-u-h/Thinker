"use client";

import React, { useState } from "react";
import { Highlighter, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function HighlightPage() {
  const [search, setSearch] = useState("");

  const highlights = [
    {
      id: 1,
      text: "The cycle is reversed: Action leads to Result, which then generates Motivation.",
      source: "Stop waiting to feel ready",
      date: "2 days ago"
    },
    {
      id: 2,
      text: "Indecision is actually a decision itself—you're choosing stagnation.",
      source: "The cost of not deciding",
      date: "1 day ago"
    },
    {
      id: 3,
      text: "To build a habit that lasts, you need a system, not reliance on willpower.",
      source: "Building habits that stick",
      date: "Just now"
    }
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <Highlighter size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Highlights</h1>
        <p className="text-muted text-lg max-w-[500px]">
          Key insights and quotes you've highlighted.
        </p>
      </header>

      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Search highlights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-[400px] py-3 pl-12 pr-4 bg-[#080808] border border-white/5 rounded-xl text-white text-[0.875rem] outline-none focus:border-white/15 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-[0.875rem] font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          <Plus size={16} />
          <span>New Highlight</span>
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {highlights.filter(h => 
          h.text.toLowerCase().includes(search.toLowerCase()) ||
          h.source.toLowerCase().includes(search.toLowerCase())
        ).map((highlight) => (
          <div key={highlight.id} className="bg-[#080808] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
            <p className="text-[0.9375rem] text-white/90 mb-4 leading-relaxed italic">
              "{highlight.text}"
            </p>
            <div className="flex items-center justify-between">
              <Link href={`/models/${highlight.source.toLowerCase().replace(/ /g, '-')}`} className="text-[0.8125rem] text-[#666] hover:text-white transition-colors no-underline">
                {highlight.source}
              </Link>
              <span className="text-[0.75rem] text-[#444]">{highlight.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
