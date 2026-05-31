"use client";

import { useState, useRef, useEffect } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import { Trash2, History, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useModule, useReflections, useCreateReflection, useDeleteReflection } from "@/lib/query-hooks";
import { useAuth } from "@/lib/auth-context";

export default function ReflectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const { data: module, isLoading } = useModule(slug);
  const { data: allReflections } = useReflections();
  const createMutation = useCreateReflection();
  const deleteMutation = useDeleteReflection();
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const existingReflections = (allReflections || []).filter((r) => r.module?.slug === slug);
  const charLimit = 5000;
  const charCount = content.length;
  const charPercent = Math.min((charCount / charLimit) * 100, 100);
  const nearLimit = charCount > charLimit * 0.85;

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleSave = async () => {
    if (!user || !module || !content.trim()) return;
    setSaving(true);
    try {
      await createMutation.mutateAsync({
        title: `Reflection on ${module.title}`,
        content: content.trim(),
        moduleSlug: slug,
      });
      setContent("");
      setSaved(true);
    } catch {
      alert("Failed to save reflection");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" />
      </div>
    );
  }

  if (!module) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16">
      <div className="max-w-[700px] mx-auto">
        <header className="mb-12">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-fg mt-4 mb-2">
            Reflection: {module.title}
          </h1>
          <p className="text-lg text-muted">
            Solidify your learning by writing down your thoughts
          </p>
        </header>

        {!user ? (
          <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted mb-4">Sign in to write reflections</p>
            <a href="/login" className="inline-flex items-center gap-2 px-6 py-3.5 bg-fg text-bg rounded-xl text-[0.9375rem] font-semibold no-underline">
              Sign In
            </a>
          </div>
        ) : (
          <>
            <div className="relative bg-gradient-to-b from-bg-card to-bg-elevated border border-border rounded-2xl overflow-hidden focus-within:border-border-light focus-within:shadow-[0_0_0_1px_var(--color-border-light)] transition-all">
              <textarea
                ref={textareaRef}
                className="w-full min-h-[280px] bg-transparent border-none p-6 pb-4 text-fg text-base resize-y focus:outline-none placeholder:text-muted-dark leading-relaxed"
                placeholder={"What did you learn?\nHow does it apply to your life?\nWhat will you do differently?"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="sticky bottom-0 bg-gradient-to-t from-bg-card via-bg-card/95 to-transparent px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className={`h-1 w-20 rounded-full bg-bg-elevated overflow-hidden ${nearLimit ? 'ring-1 ring-red-500/30' : ''}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        nearLimit ? 'bg-red-500' : 'bg-premium/60'
                      }`}
                      style={{ width: `${charPercent}%` }}
                    />
                  </div>
                  <span className={`text-[0.6875rem] font-medium tabular-nums ${nearLimit ? 'text-red-400' : 'text-muted-dark'}`}>
                    {charCount}/{charLimit}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <AnimatePresence mode="wait">
                    {saved && (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 text-green-400 text-[0.8125rem] font-medium"
                      >
                        <Check size={14} />
                        Saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !content.trim()}
                    className="relative px-5 py-2.5 bg-fg text-bg rounded-xl text-[0.8125rem] font-semibold cursor-pointer hover:opacity-90 transition-all disabled:opacity-25 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {saving && (
                      <motion.span
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

            {existingReflections.length > 0 && (
              <div className="mt-14">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-border">
                  <History size={16} className="text-muted-dark" />
                  <h2 className="text-base font-bold text-fg">
                    Previous Reflections
                  </h2>
                  <span className="text-[0.6875rem] font-medium text-muted-dark bg-bg-card border border-border-subtle px-2 py-0.5 rounded-md ml-auto">{existingReflections.length}</span>
                </div>
                <div className="space-y-3">
                  {existingReflections.map((ref, idx) => (
                    <motion.div
                      key={ref.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative bg-bg-card border border-border rounded-xl p-5 hover:border-border-light transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[0.6875rem] font-bold text-muted-dark">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[0.9375rem] text-muted leading-relaxed whitespace-pre-wrap">
                              {ref.content}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleDelete(ref.id)}
                              className="p-1.5 text-muted-dark opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer bg-transparent border-none rounded-lg hover:bg-red-500/10 flex-shrink-0 mt-0.5"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-[0.6875rem] text-muted-dark mt-3 font-medium">
                            {new Date(ref.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
