"use client";

import { modules } from "@/lib/dummy-data";
import { notFound } from "next/navigation";
import { use } from "react";

export default function ReflectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const module = modules.find((m) => m.slug === slug);

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

        <div className="bg-[#111] border border-[#222] rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Your Reflection</h2>
          <textarea
            className="w-full h-64 bg-[#050505] border border-[#222] rounded-xl p-4 text-white text-base resize-none focus:outline-none focus:border-white/20 transition-colors"
            placeholder="Write your reflections here... What did you learn? How will you apply this?"
          />
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => alert('Reflection saved!')}
              className="px-6 py-3.5 bg-white text-black rounded-xl text-[0.9375rem] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Save Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
