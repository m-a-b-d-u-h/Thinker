"use client";

import React, { useState, useEffect } from "react";
import { Highlighter, Plus, Search, StickyNote, Pencil, X, Check } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { highlightsApi } from "@/lib/api/highlights";
import { useAuth } from "@/lib/auth-context";
import type { Highlight } from "@/lib/types";

export default function HighlightPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteValue, setEditNoteValue] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    highlightsApi.list().then(setHighlights).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const updateNote = async (id: string, note: string) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, note } : h));
    try {
      await highlightsApi.update(id, { note });
    } catch {}
  };

  const handleStartEdit = (id: string, currentNote: string) => {
    setEditingNote(id);
    setEditNoteValue(currentNote);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditNoteValue("");
  };

  const handleSaveNote = async (id: string) => {
    setSavingNote(true);
    await updateNote(id, editNoteValue);
    setSavingNote(false);
    setEditingNote(null);
    setEditNoteValue("");
  };

  const filtered = highlights.filter(h =>
    h.text.toLowerCase().includes(search.toLowerCase()) ||
    (h as any).moduleSlug?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 text-center">
        <Highlighter size={32} className="mx-auto text-[#222] mb-4" />
        <h1 className="text-3xl font-black mb-4">Sign in to view your highlights</h1>
        <Link href="/login" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <Highlighter size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Highlights</h1>
        <p className="text-muted text-lg max-w-[500px]">Key insights and quotes you have highlighted.</p>
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
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#444] text-[0.875rem]">No highlights found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((highlight) => (
              <div key={highlight.id} className="bg-[#080808] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-5">
                {highlight.module ? (
                  <span className="font-semibold text-white/80 truncate min-w-0">
                    {highlight.module.title}
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[0.75rem] text-[#444] whitespace-nowrap">{formatDate(new Date(highlight.timestamp).getTime())}</span>
                  {highlight.module && (
                    <span className="text-[0.625rem] px-2 py-0.5 rounded-full text-[#555]" style={{ background: `var(--color-c-${highlight.module.category})15`, color: `var(--color-c-${highlight.module.category})` }}>{highlight.module.category}</span>
                  )}
                </div>
              </div>

              {highlight.module ? (
                <Link href={`/models/${highlight.module.slug}?highlight=${encodeURIComponent(highlight.text)}`} className="no-underline group/blockquote flex-1 [&:hover_.hl-link]:decoration-[#888]">
                  <blockquote className="text-[1.0625rem] text-white/90 leading-[1.8] italic mb-6 border-l-2 border-white/10 pl-6 group-hover/blockquote:border-white/30 transition-colors cursor-pointer">
                    &ldquo;{highlight.text}&rdquo;
                    <span className="hl-link block text-[0.75rem] text-[#444] group-hover/blockquote:text-[#888] mt-2 not-italic transition-all underline underline-offset-2 decoration-transparent">View in module →</span>
                  </blockquote>
                </Link>
              ) : (
                <blockquote className="text-[1.0625rem] text-white/90 leading-[1.8] italic mb-6 border-l-2 border-white/10 pl-6 flex-1">
                  &ldquo;{highlight.text}&rdquo;
                </blockquote>
              )}

              <div className="border-t border-white/5 pt-5">
                {editingNote === highlight.id ? (
                  <div>
                    <textarea
                      value={editNoteValue}
                      onChange={(e) => setEditNoteValue(e.target.value)}
                      placeholder="Write your note..."
                      className="w-full bg-[#050505] border border-[#222] rounded-lg p-4 text-[0.875rem] text-white/80 resize-none outline-none focus:border-white/15 transition-colors min-h-[100px] leading-relaxed mb-3"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={handleCancelEdit} className="px-4 py-2 bg-transparent border border-[#222] rounded-xl text-[0.75rem] text-[#555] cursor-pointer hover:text-white transition-colors flex items-center gap-1.5">
                        <X size={14} /> Cancel
                      </button>
                      <button onClick={() => handleSaveNote(highlight.id)} disabled={savingNote} className="px-4 py-2 bg-white text-black rounded-xl text-[0.75rem] font-bold cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5">
                        <Check size={14} /> {savingNote ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 group">
                    <StickyNote size={16} className="mt-0.5 shrink-0 text-[#555] group-hover:text-white/40 transition-colors" />
                    <div className="flex-1 min-w-0">
                      {highlight.note ? (
                        <span className="text-[0.875rem] text-[#555] leading-relaxed whitespace-pre-wrap">{highlight.note}</span>
                      ) : (
                        <span className="text-[0.875rem] text-[#444] italic">No note</span>
                      )}
                    </div>
                    <button onClick={() => handleStartEdit(highlight.id, highlight.note)} className="shrink-0 text-[#444] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1">
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
