"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Plus, Trash2, Type, CheckSquare, Sliders, List, Save, XCircle } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useModule, useActionPlanByModule, useCreateActionPlan, useUpdateActionPlan, useDeleteActionPlan } from "@/lib/query-hooks";
import type { MatrixRow } from "@/lib/types";

type InputType = 'text' | 'checkbox' | 'slider' | 'radio';

const defaultMatrix: MatrixRow[] = [
  { id: 1, type: 'text', label: "Strategic Stance", value: "Calculated Action" },
  { id: 2, type: 'slider', label: "Intensity Level", value: 75 },
  { id: 3, type: 'checkbox', label: "Prioritize Speed?", value: true },
  { id: 4, type: 'radio', label: "Risk Profile", value: "Low", options: ["Low", "Med", "High"] },
];

export default function ActionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: module, isLoading } = useModule(slug);
  const { data: existingPlan, isLoading: planLoading } = useActionPlanByModule(slug);
  const createMutation = useCreateActionPlan();
  const updateMutation = useUpdateActionPlan();
  const deleteMutation = useDeleteActionPlan();
  const [saving, setSaving] = useState(false);
  const [optimisticApplied, setOptimisticApplied] = useState<boolean | null>(null);
  const [title, setTitle] = useState(existingPlan?.title || (module ? `${module.title} Protocol` : ""));
  const [matrix, setMatrix] = useState<MatrixRow[]>(existingPlan?.content || defaultMatrix);

  useEffect(() => {
    if (existingPlan) {
      setTitle(existingPlan.title);
      setMatrix(existingPlan.content);
    } else if (module) {
      setTitle(`${module.title} Protocol`);
    }
  }, [existingPlan, module]);

  useEffect(() => {
    if (optimisticApplied === null) return;
    const matches = optimisticApplied ? !!existingPlan : !existingPlan;
    if (matches) setOptimisticApplied(null);
  }, [existingPlan, optimisticApplied]);

  const showApplied = optimisticApplied !== null ? optimisticApplied : !!existingPlan;

  const hasChanges = useMemo(() => {
    if (!existingPlan) return false;
    if (title !== existingPlan.title) return true;
    if (JSON.stringify(matrix) !== JSON.stringify(existingPlan.content)) return true;
    return false;
  }, [existingPlan, title, matrix]);

  const handleAction = async () => {
    if (!module) return;
    setSaving(true);
    if (!existingPlan || hasChanges) setOptimisticApplied(true);
    else setOptimisticApplied(false);
    try {
      if (!existingPlan) {
        await createMutation.mutateAsync({ moduleSlug: slug, title, content: matrix });
      } else if (hasChanges) {
        await updateMutation.mutateAsync({ id: existingPlan.id, title, content: matrix });
      } else {
        await deleteMutation.mutateAsync(existingPlan.id);
      }
    } catch {
      setOptimisticApplied(null);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || planLoading) {
    return <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16 flex justify-center"><div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" /></div>;
  }

  if (!module) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16 text-center">
        <p className="text-[0.875rem] text-muted">Module not found or failed to load.</p>
        <Link href="/models" className="inline-flex items-center gap-1.5 mt-4 text-[0.8125rem] text-muted hover:text-fg transition-colors">
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
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16">
      <div className="max-w-[900px] mx-auto">
        <header className="mb-12">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-fg mt-4 mb-2">Action Plan: {module.title}</h1>
          <p className="text-lg text-muted">Commit to applying what you&apos;ve learned</p>
        </header>

        <div className="bg-bg-card border border-border rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-semibold text-fg bg-transparent border-none outline-none flex-1"
              placeholder="Action Protocol Title"
            />
            {existingPlan && (
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
                  className="flex items-center gap-4 bg-bg-elevated border border-border rounded-xl p-4"
                >
                  {row.type === 'text' && (
                    <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="w-full md:w-1/3 bg-transparent border border-border rounded-lg px-3 py-2 text-fg text-[0.875rem] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) => updateRow(row.id, { value: e.target.value })}
                        className="flex-1 bg-transparent border border-border rounded-lg px-3 py-2 text-fg/80 text-[0.875rem] outline-none"
                      />
                    </div>
                  )}
                  {row.type === 'checkbox' && (
                    <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="flex-1 bg-transparent border border-border rounded-lg px-3 py-2 text-fg text-[0.875rem] outline-none"
                      />
                      <label className="flex items-center gap-2 cursor-pointer text-[0.875rem] text-muted">
                        <input
                          type="checkbox"
                          checked={row.value}
                          onChange={(e) => updateRow(row.id, { value: e.target.checked })}
                          className="accent-fg"
                        />
                        {row.value ? "Yes" : "No"}
                      </label>
                    </div>
                  )}
                  {row.type === 'slider' && (
                    <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="w-full md:w-1/3 bg-transparent border border-border rounded-lg px-3 py-2 text-fg text-[0.875rem] outline-none"
                      />
                      <input
                        type="range"
                        min="0" max="100"
                        value={row.value}
                        onChange={(e) => updateRow(row.id, { value: parseInt(e.target.value) })}
                        className="flex-1 accent-fg"
                      />
                      <span className="text-[0.8125rem] text-muted min-w-[30px]">{row.value}</span>
                    </div>
                  )}
                  {row.type === 'radio' && (
                    <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                      <input
                        type="text"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        className="w-full md:w-1/4 bg-transparent border border-border rounded-lg px-3 py-2 text-fg text-[0.875rem] outline-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        {row.options?.map((opt: string) => (
                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-[0.8125rem] text-muted">
                            <input
                              type="radio"
                              name={`radio-${row.id}`}
                              checked={row.value === opt}
                              onChange={() => updateRow(row.id, { value: opt })}
                              className="accent-fg"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOptions = row.options?.map(o => o === opt ? e.target.value : o);
                                updateRow(row.id, { options: newOptions });
                              }}
                              className="bg-transparent border border-border rounded px-2 py-1 text-fg text-[0.8125rem] w-[70px] md:w-[80px] outline-none"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => removeRow(row.id)} className="shrink-0 text-muted-dark hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-1">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {inputTypes.map(({ type, icon, label }) => (
              <button key={type} onClick={() => addRow(type)} className="flex items-center gap-1.5 px-4 py-2 bg-bg-elevated border border-border rounded-xl text-[0.75rem] text-muted cursor-pointer hover:border-border-light hover:text-fg transition-all">
                <Plus size={14} /> {icon} {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleAction}
            disabled={saving}
            className={`w-full py-4 rounded-xl text-[0.9375rem] font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
              saving ? 'opacity-50 pointer-events-none' :
              !showApplied ? 'bg-fg text-bg hover:opacity-90' :
              hasChanges ? 'bg-fg text-bg hover:opacity-90' :
              'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}
          >
            {saving ? "Saving..." : !showApplied ? (
              <><CheckCircle2 size={18} /> Mark as Applied</>
            ) : hasChanges ? (
              <><Save size={18} /> Save Changes</>
            ) : (
              <><XCircle size={18} /> Applied</>
            )}
          </button>
        </div>

        <Link href={`/models/${slug}/quiz`} className="group flex items-center justify-between bg-bg-card border border-border rounded-2xl p-6 no-underline hover:bg-bg-elevated transition-all">
          <div>
            <div className="text-[0.75rem] font-semibold text-muted uppercase tracking-[0.05em] mb-1">Next Step</div>
            <div className="font-semibold text-fg">Test your knowledge</div>
          </div>
          <ArrowRight size={20} className="text-muted-dark group-hover:text-fg transition-colors" />
        </Link>
      </div>
    </div>
  );
}
