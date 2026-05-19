"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Plus, Trash2, Type, CheckSquare, Sliders, List } from "lucide-react";
import Link from "next/link";
import React from "react";
import { modulesApi } from "@/lib/api/modules";
import { actionsApi } from "@/lib/api/actions";
import type { Module, MatrixRow } from "@/lib/types";

type InputType = 'text' | 'checkbox' | 'slider' | 'radio';

const defaultMatrix: MatrixRow[] = [
  { id: 1, type: 'text', label: "Strategic Stance", value: "Calculated Action" },
  { id: 2, type: 'slider', label: "Intensity Level", value: 75 },
  { id: 3, type: 'checkbox', label: "Prioritize Speed?", value: true },
  { id: 4, type: 'radio', label: "Risk Profile", value: "Low", options: ["Low", "Med", "High"] },
];

export default function ActionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [matrix, setMatrix] = useState<MatrixRow[]>(defaultMatrix);

  useEffect(() => {
    let cancelled = false;

    modulesApi.getBySlug(slug)
      .then((m) => {
        if (cancelled) return;
        setModule(m);
        setTitle(`${m.title} Protocol`);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });

    actionsApi.getByModule(slug)
      .then((existing) => {
        if (cancelled || !existing) return;
        setTitle(existing.title);
        setMatrix(existing.content);
        setIsApplied(true);
        setPlanId(existing.id);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [slug]);

  const handleMarkApplied = async () => {
    if (!module) return;
    setSaving(true);
    try {
      if (planId) {
        const updated = await actionsApi.update(planId, { title, content: matrix, completed: !isApplied });
        setIsApplied(updated.completed);
      } else {
        const created = await actionsApi.create({ moduleSlug: slug, title, content: matrix });
        setPlanId(created.id);
        setIsApplied(true);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16 flex justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  if (!module) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16 text-center">
        <p className="text-[0.875rem] text-[#555]">Module not found or failed to load.</p>
        <Link href="/models" className="inline-flex items-center gap-1.5 mt-4 text-[0.8125rem] text-[#888] hover:text-white transition-colors">
          Back to library
        </Link>
      </div>
    );
  }

  const nextId = Math.max(...matrix.map(r => r.id), 0) + 1;

  const addRow = (type: InputType) => {
    const newRow: MatrixRow = { id: nextId, type, label: "", value: type === 'checkbox' ? false : type === 'slider' ? 50 : "" };
    if (type === 'radio') { newRow.options = ["Option 1", "Option 2", "Option 3"]; newRow.value = "Option 1"; }
    setMatrix([...matrix, newRow]);
  };

  const removeRow = (id: number) => setMatrix(matrix.filter(r => r.id !== id));

  const updateRow = (id: number, updates: Partial<MatrixRow>) => {
    setMatrix(matrix.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const inputTypes: { type: InputType; icon: React.ReactNode; label: string }[] = [
    { type: 'text', icon: <Type size={14} />, label: 'Text' },
    { type: 'checkbox', icon: <CheckSquare size={14} />, label: 'Check' },
    { type: 'slider', icon: <Sliders size={14} />, label: 'Slider' },
    { type: 'radio', icon: <List size={14} />, label: 'Radio' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16">
      <div className="max-w-[900px] mx-auto">
        <header className="mb-12">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">Action Plan: {module.title}</h1>
          <p className="text-lg text-[#666]">Commit to applying what you&apos;ve learned</p>
        </header>

        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-semibold text-white bg-transparent border-none outline-none flex-1"
              placeholder="Action Protocol Title"
            />
            {isApplied && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-green-400 text-[0.8125rem] font-semibold">
                <CheckCircle2 size={18} /> Applied
              </motion.div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {matrix.map((row) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4 bg-[#050505] border border-[#222] rounded-xl p-4"
                >
                  {row.type === 'text' && (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="w-1/3 bg-transparent border border-[#222] rounded-lg px-3 py-2 text-white text-[0.875rem] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) => updateRow(row.id, { value: e.target.value })}
                        className="flex-1 bg-transparent border border-[#222] rounded-lg px-3 py-2 text-white/80 text-[0.875rem] outline-none"
                      />
                    </div>
                  )}
                  {row.type === 'checkbox' && (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="flex-1 bg-transparent border border-[#222] rounded-lg px-3 py-2 text-white text-[0.875rem] outline-none"
                      />
                      <label className="flex items-center gap-2 cursor-pointer text-[0.875rem] text-white/70">
                        <input
                          type="checkbox"
                          checked={row.value}
                          onChange={(e) => updateRow(row.id, { value: e.target.checked })}
                          className="accent-white"
                        />
                        {row.value ? "Yes" : "No"}
                      </label>
                    </div>
                  )}
                  {row.type === 'slider' && (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="w-1/3 bg-transparent border border-[#222] rounded-lg px-3 py-2 text-white text-[0.875rem] outline-none"
                      />
                      <input
                        type="range"
                        min="0" max="100"
                        value={row.value}
                        onChange={(e) => updateRow(row.id, { value: parseInt(e.target.value) })}
                        className="flex-1 accent-white"
                      />
                      <span className="text-[0.8125rem] text-white/60 min-w-[30px]">{row.value}</span>
                    </div>
                  )}
                  {row.type === 'radio' && (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="w-1/4 bg-transparent border border-[#222] rounded-lg px-3 py-2 text-white text-[0.875rem] outline-none"
                      />
                      <div className="flex gap-2">
                        {row.options?.map((opt: string) => (
                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-[0.8125rem] text-white/70">
                            <input
                              type="radio"
                              name={`radio-${row.id}`}
                              checked={row.value === opt}
                              onChange={() => updateRow(row.id, { value: opt })}
                              className="accent-white"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOptions = row.options?.map(o => o === opt ? e.target.value : o);
                                updateRow(row.id, { options: newOptions });
                              }}
                              className="bg-transparent border border-[#222] rounded px-2 py-1 text-white text-[0.8125rem] w-[80px] outline-none"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => removeRow(row.id)} className="shrink-0 text-[#555] hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-1">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {inputTypes.map(({ type, icon, label }) => (
              <button key={type} onClick={() => addRow(type)} className="flex items-center gap-1.5 px-4 py-2 bg-[#050505] border border-[#222] rounded-xl text-[0.75rem] text-[#888] cursor-pointer hover:border-white/20 hover:text-white transition-all">
                <Plus size={14} /> {icon} {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleMarkApplied}
            disabled={saving}
            className={`w-full py-4 rounded-xl text-[0.9375rem] font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
              saving ? 'opacity-50 pointer-events-none' :
              isApplied ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-white text-black hover:opacity-90'
            }`}
          >
            {saving ? "Saving..." : isApplied ? (
              <><CheckCircle2 size={18} /> Applied</>
            ) : (
              <><CheckCircle2 size={18} /> Mark as Applied</>
            )}
          </button>
        </div>

        <Link href={`/models/${slug}/quiz`} className="group flex items-center justify-between bg-[#111] border border-[#222] rounded-2xl p-6 no-underline hover:bg-[#1a1a1a] transition-all">
          <div>
            <div className="text-[0.75rem] font-semibold text-[#666] uppercase tracking-[0.05em] mb-1">Next Step</div>
            <div className="font-semibold text-white">Test your knowledge</div>
          </div>
          <ArrowRight size={20} className="text-[#444] group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  );
}
