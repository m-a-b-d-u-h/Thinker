"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, RotateCcw, Plus, Trash2, Type, CheckSquare, Sliders, List } from "lucide-react";
import { modules } from "@/lib/dummy-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";

type InputType = 'text' | 'checkbox' | 'slider' | 'radio';

interface MatrixRow {
  id: number;
  type: InputType;
  label: string;
  value: any;
  options?: string[];
}

export default function ActionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [isApplied, setIsApplied] = useState(false);
  const [title, setTitle] = useState("");

  // Advanced Dynamic Matrix
  const [matrix, setMatrix] = useState<MatrixRow[]>([
    { id: 1, type: 'text', label: "Strategic Stance", value: "Calculated Action" },
    { id: 2, type: 'slider', label: "Intensity Level", value: 75 },
    { id: 3, type: 'checkbox', label: "Prioritize Speed?", value: true },
    { id: 4, type: 'radio', label: "Risk Profile", value: "Low", options: ["Low", "Med", "High"] }
  ]);

  const module = modules.find((m) => m.slug === slug);
  if (!module) notFound();

  React.useEffect(() => {
    setTitle(`${module.title} Protocol`);
  }, [module.title]);

  const addRow = (type: InputType) => {
    const newRow: MatrixRow = {
      id: Date.now(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      value: type === 'slider' ? 50 : type === 'checkbox' ? false : type === 'radio' ? "Option 1" : "",
      options: type === 'radio' ? ["Option 1", "Option 2"] : undefined
    };
    setMatrix([...matrix, newRow]);
  };

  const updateRow = (id: number, updates: Partial<MatrixRow>) => {
    setMatrix(matrix.map(row => row.id === id ? { ...row, ...updates } : row));
  };

  const removeRow = (id: number) => {
    setMatrix(matrix.filter(row => row.id !== id));
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <div className="max-w-[900px] mx-auto">
        <AnimatePresence mode="wait">
          {!isApplied ? (
            <motion.div key="builder" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <header className="mb-16 text-center">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-none text-white text-6xl font-black text-center outline-none tracking-[-0.04em] leading-[1.1]"
                />
                <p className="text-muted mt-4">Architect your execution protocol with custom controls.</p>
              </header>

              <div className="bg-[#080808] border border-white/5 rounded-[32px] overflow-hidden">
                {/* Row Rendering */}
                <div className="flex flex-col">
                  {matrix.map((row) => (
                    <motion.div
                      key={row.id}
                      layout
                      className="grid grid-cols-[220px_1fr_50px] gap-8 px-12 py-8 border-b border-white/[0.02] items-center"
                    >
                      {/* Label Input */}
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="bg-transparent border-none text-[#444] text-[0.875rem] font-bold outline-none uppercase"
                      />

                      {/* Dynamic Value Input */}
                      <div className="flex items-center">
                        {row.type === 'text' && (
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => updateRow(row.id, { value: e.target.value })}
                            className="w-full bg-white/[0.02] border border-[#111] rounded-lg px-4 py-3 text-white outline-none focus:border-white/20 transition-colors"
                          />
                        )}
                        {row.type === 'checkbox' && (
                          <button
                            onClick={() => updateRow(row.id, { value: !row.value })}
                            className={`w-[50px] h-[26px] rounded-[13px] relative transition-all duration-200 border-none cursor-pointer ${row.value ? 'bg-white' : 'bg-[#111]'}`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-[#000] absolute top-[3px] transition-all duration-200 ${row.value ? 'left-[27px] bg-black' : 'left-[3px] bg-[#333]'}`} />
                          </button>
                        )}
                        {row.type === 'slider' && (
                          <div className="w-full flex items-center gap-6">
                            <input
                              type="range" min="0" max="100" value={row.value}
                              onChange={(e) => updateRow(row.id, { value: parseInt(e.target.value) })}
                              className="flex-grow h-1 bg-[#111] rounded-sm accent-white cursor-pointer"
                            />
                            <span className="text-white font-bold min-w-[40px]">{row.value}%</span>
                          </div>
                        )}
                        {row.type === 'radio' && (
                          <div className="flex gap-4">
                            {row.options?.map(opt => (
                              <button
                                key={opt}
                                onClick={() => updateRow(row.id, { value: opt })}
                                className={`px-5 py-2 rounded-full text-[0.75rem] font-semibold cursor-pointer transition-all duration-200 border ${row.value === opt ? 'bg-white text-black border-white' : 'bg-transparent text-[#444] border-[#111] hover:border-white/20'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button onClick={() => removeRow(row.id)} className="text-[#222] hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Toolbar */}
                <div className="px-12 py-8 bg-white/[0.01] flex justify-center gap-4">
                  <button onClick={() => addRow('text')} className="flex items-center gap-2 text-[#666] text-[0.75rem] hover:text-white transition-colors">
                    <Type size={16} /> Text
                  </button>
                  <button onClick={() => addRow('checkbox')} className="flex items-center gap-2 text-[#666] text-[0.75rem] hover:text-white transition-colors">
                    <CheckSquare size={16} /> Toggle
                  </button>
                  <button onClick={() => addRow('slider')} className="flex items-center gap-2 text-[#666] text-[0.75rem] hover:text-white transition-colors">
                    <Sliders size={16} /> Range
                  </button>
                  <button onClick={() => addRow('radio')} className="flex items-center gap-2 text-[#666] text-[0.75rem] hover:text-white transition-colors">
                    <List size={16} /> Choice
                  </button>
                </div>
              </div>

              <div className="mt-16 flex justify-center">
                <button onClick={() => setIsApplied(true)} className="inline-flex items-center gap-4 px-16 py-5 bg-white text-black rounded-full font-bold hover:opacity-90 transition-opacity">
                  Deploy Protocol <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-[100px] h-[100px] rounded-full bg-white text-black flex items-center justify-center mx-auto mb-10">
                <CheckCircle2 size={50} />
              </div>
              <h2 className="text-5xl font-black mb-4">Protocol Deployed</h2>
              <p className="text-muted mb-16">Your custom-built execution dashboard is now active.</p>

              {/* View Only Summary */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-16">
                {matrix.map(row => (
                  <div key={row.id} className="bg-[#080808] border border-white/5 rounded-2xl p-6 text-left">
                    <div className="text-[0.625rem] text-[#444] font-black uppercase mb-3">{row.label}</div>
                    <div className="text-white font-semibold text-lg">
                      {row.type === 'checkbox' ? (row.value ? "ENABLED" : "DISABLED") : row.value.toString() + (row.type === 'slider' ? '%' : '')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-6 justify-center">
                <button onClick={() => setIsApplied(false)} className="flex items-center gap-2 text-[#444] hover:text-white transition-colors">
                  <RotateCcw size={16} /> Re-Architect
                </button>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-12 py-4 bg-white text-black rounded-full font-bold hover:opacity-90 transition-opacity">
                  Open Command Center
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
