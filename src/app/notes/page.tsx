"use client";

import React, { useState } from "react";
import { Highlighter, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function NotesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <Highlighter size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Notes</h1>
        <p className="text-muted text-lg max-w-[500px]">
          Your personal notes and annotations on theories.
        </p>
      </header>

      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[400px] py-3 pl-12 pr-4 bg-[#080808] border border-white/5 rounded-xl text-white text-[0.875rem] outline-none focus:border-white/15 transition-colors"
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        <div className="bg-[#080808] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">First Principles</h3>
          <p className="text-[0.875rem] text-[#666] mb-4 leading-relaxed">
            The key is to break down complex problems into their most fundamental truths...
          </p>
          <span className="text-[0.75rem] text-[#444]">Updated 2 days ago</span>
        </div>
      </div>
    </div>
  );
}
