"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import { modulesApi } from "@/lib/api/modules";
import { reflectionsApi } from "@/lib/api/reflections";
import { useAuth } from "@/lib/auth-context";
import type { Module, Reflection } from "@/lib/types";

export default function ReflectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [existingReflections, setExistingReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    modulesApi.getBySlug(slug).then(setModule).catch(() => {});
    if (user) {
      reflectionsApi.list().then((refs) => {
        setExistingReflections(refs.filter((r) => r.moduleId === module?.id));
      }).catch(() => {});
    }
    setLoading(false);
  }, [slug, user, module?.id]);

  const handleSave = async () => {
    if (!user || !module || !title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await reflectionsApi.create({
        title,
        content,
        moduleId: module.id,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save reflection");
    } finally {
      setSaving(false);
    }
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
            Reflect on what you've learned from this module
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
          <div className="bg-[#111] border border-[#222] rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Write Your Reflection</h2>
            <input
              type="text"
              placeholder="Reflection title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 px-4 py-3 bg-[#050505] border border-[#222] rounded-xl text-white text-base outline-none focus:border-white/20 transition-colors"
            />
            <textarea
              className="w-full h-64 bg-[#050505] border border-[#222] rounded-xl p-4 text-white text-base resize-none focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Write your reflections here... What did you learn? How will you apply this?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="mt-6 flex items-center justify-between">
              {saved && <span className="text-green-400 text-sm">Saved!</span>}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
                className="ml-auto px-6 py-3.5 bg-white text-black rounded-xl text-[0.9375rem] font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                {saving ? "Saving..." : "Save Reflection"}
              </button>
            </div>
          </div>
        )}

        {existingReflections.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-white mb-4">Previous Reflections</h2>
            <div className="space-y-4">
              {existingReflections.map((ref) => (
                <div key={ref.id} className="bg-[#111] border border-[#222] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{ref.title}</h3>
                  <p className="text-[0.9375rem] text-[#888] leading-relaxed whitespace-pre-wrap">{ref.content}</p>
                  <p className="text-[0.75rem] text-[#555] mt-3">{new Date(ref.timestamp).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
