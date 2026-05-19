"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import { BookOpen, Lightbulb, Target, Zap, Sparkles, Trash2, History } from "lucide-react";
import { modulesApi } from "@/lib/api/modules";
import { reflectionsApi } from "@/lib/api/reflections";
import { useAuth } from "@/lib/auth-context";
import type { Module, Reflection } from "@/lib/types";

const prompts = [
  { icon: Lightbulb, label: "Key Insight", text: "What was the single most important idea you learned from this module?" },
  { icon: Target, label: "Personal Connection", text: "How does this concept relate to your own life or work?" },
  { icon: Zap, label: "Action Step", text: "What is one specific thing you will do differently after learning this?" },
  { icon: BookOpen, label: "Challenge", text: "What part of this module was hardest to understand or apply?" },
  { icon: Sparkles, label: "Surprise", text: "What surprised you or challenged your existing beliefs?" },
];

export default function ReflectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [existingReflections, setExistingReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    modulesApi.getBySlug(slug).then((m) => {
      setModule(m);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    reflectionsApi.list().then((refs) => {
      setExistingReflections(refs.filter((r) => r.module?.slug === slug));
    }).catch(() => {});
  }, [user, slug]);

  const handleSave = async () => {
    if (!user || !module || !content.trim()) return;
    setSaving(true);
    try {
      await reflectionsApi.create({
        title: `Reflection on ${module.title}`,
        content: content.trim(),
        moduleSlug: slug,
      });
      setContent("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      const refs = await reflectionsApi.list();
      setExistingReflections(refs.filter((r) => r.module?.slug === slug));
    } catch {
      alert("Failed to save reflection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reflectionsApi.remove(id);
      setExistingReflections((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  const applyPrompt = (promptText: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${promptText}\n` : `${promptText}\n`));
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!module) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16">
      <div className="max-w-[700px] mx-auto">
        <header className="mb-12">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">
            Reflection: {module.title}
          </h1>
          <p className="text-lg text-[#666]">
            Solidify your learning by writing down your thoughts
          </p>
        </header>

        {!user ? (
          <div className="bg-[#111] border border-[#222] rounded-2xl p-8 text-center">
            <p className="text-[#888] mb-4">Sign in to write reflections</p>
            <a href="/login" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl text-[0.9375rem] font-semibold no-underline">
              Sign In
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {prompts.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPrompt(p.text)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-white/5 rounded-lg text-[0.75rem] text-[#666] cursor-pointer hover:border-white/10 hover:text-[#ccc] transition-all"
                    title={p.text}
                  >
                    <Icon size={14} />
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#111] border border-[#222] rounded-2xl p-8">
              <textarea
                className="w-full min-h-[300px] bg-[#050505] border border-[#222] rounded-xl p-5 text-white text-base resize-y focus:outline-none focus:border-white/20 transition-colors"
                placeholder="What did you learn? How does it apply to your life? What will you do differently?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[0.75rem] text-[#555]">{content.length}/5000</span>
                <div className="flex items-center gap-3">
                  {saved && <span className="text-green-400 text-sm">Saved!</span>}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !content.trim()}
                    className="px-6 py-3.5 bg-white text-black rounded-xl text-[0.9375rem] font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-30"
                  >
                    {saving ? "Saving..." : "Save Reflection"}
                  </button>
                </div>
              </div>
            </div>

            {existingReflections.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <History size={18} className="text-[#666]" />
                  <h2 className="text-xl font-semibold text-white">Previous Reflections</h2>
                </div>
                <div className="space-y-4">
                  {existingReflections.map((ref) => (
                    <div key={ref.id} className="group bg-[#111] border border-[#222] rounded-2xl p-6 hover:border-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{ref.title}</h3>
                        <button
                          type="button"
                          onClick={() => handleDelete(ref.id)}
                          className="p-2 text-[#555] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer bg-transparent border-none"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[0.9375rem] text-[#888] leading-relaxed whitespace-pre-wrap">{ref.content}</p>
                      <p className="text-[0.75rem] text-[#555] mt-3">{new Date(ref.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
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
