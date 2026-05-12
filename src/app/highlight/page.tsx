"use client";

import React, { useState } from "react";
import { Highlighter, Plus, Search, StickyNote } from "lucide-react";
import Link from "next/link";
import { highlights as dummyHighlights } from "@/lib/dummy-data";

function formatDate(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function HighlightPage() {
  const [search, setSearch] = useState("");
  const [highlights, setHighlights] = useState(dummyHighlights);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const updateNote = (id: string, note: string) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, note } : h));
  };

  const filtered = highlights.filter(h =>
    h.text.toLowerCase().includes(search.toLowerCase()) ||
    h.moduleTitle.toLowerCase().includes(search.toLowerCase())
  );

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
          Key insights and quotes you have highlighted.
        </p>
      </header>

      <div className="flex items-center justify-between mb-8">
        <div className="relative flex-1 max-w-[400px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Search highlights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pl-12 pr-4 bg-[#080808] border border-white/5 rounded-xl text-white text-[0.875rem] outline-none focus:border-white/15 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-[0.875rem] font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          <Plus size={16} />
          <span>New Highlight</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#444] text-[0.875rem]">
          No highlights found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((highlight) => (
            <div key={highlight.id} className="bg-[#080808] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors flex flex-col">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <Link
                  href={`/models/${highlight.moduleSlug}`}
                  className="shrink-0 px-3 py-1 rounded-full text-[0.625rem] font-semibold bg-white/5 text-white/70 border border-white/10 hover:text-white hover:border-white/20 transition-colors no-underline"
                >
                  {highlight.moduleTitle}
                </Link>
                <span className="text-[0.75rem] text-[#444]">{formatDate(highlight.timestamp)}</span>
              </div>

              <blockquote className="text-[1.0625rem] text-white/90 leading-[1.8] italic mb-6 border-l-2 border-white/10 pl-6 flex-1">
                &ldquo;{highlight.text}&rdquo;
              </blockquote>

              <div className="border-t border-white/5 pt-5">
                {editingNote === highlight.id ? (
                  <textarea
                    value={highlight.note}
                    onChange={(e) => updateNote(highlight.id, e.target.value)}
                    onBlur={() => setEditingNote(null)}
                    placeholder="Write your note..."
                    className="w-full bg-[#050505] border border-[#222] rounded-lg p-4 text-[0.875rem] text-white/80 resize-none outline-none focus:border-white/15 transition-colors min-h-[100px] leading-relaxed"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setEditingNote(highlight.id)}
                    className="w-full text-left flex items-start gap-3 text-[0.875rem] text-[#555] hover:text-white/60 transition-colors group"
                  >
                    <StickyNote size={16} className="mt-0.5 shrink-0" />
                    {highlight.note ? (
                      <span className="leading-relaxed whitespace-pre-wrap">{highlight.note}</span>
                    ) : (
                      <span className="italic">Add a note...</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
