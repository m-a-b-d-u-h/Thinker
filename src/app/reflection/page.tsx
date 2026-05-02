"use client";

import { modules } from "@/lib/dummy-data";
import { BookOpen, PenLine, Calendar } from "lucide-react";
import Link from "next/link";

export default function ReflectionListPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-24">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">My Reflections</h1>
        <p className="text-lg text-[#666]">
          Review and manage your learning reflections
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={`/models/${module.slug}/reflection`}
            className="no-underline"
          >
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 hover:border-white/20 transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <span className="badge" style={{ background: 'var(--c-mindset)', color: '#000' }}>
                  {module.category}
                </span>
                <PenLine size={18} className="text-[#444] group-hover:text-white/60 transition-colors" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90">
                {module.title}
              </h3>
              <p className="text-sm text-[#666] mb-4 line-clamp-2">
                {module.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-[#444]">
                <Calendar size={14} />
                <span>No reflection yet</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
