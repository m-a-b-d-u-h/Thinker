"use client";

import { modules } from "@/lib/dummy-data";
import { BookOpen, PenLine, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ReflectionListPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Reflections</h1>
        <p className="text-muted text-lg max-w-[500px]">
          Review and manage your learning reflections.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, idx) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/models/${module.slug}/reflection`}
              className="no-underline"
            >
              <div className="bg-[#080808] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all duration-200 cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="badge" style={{ background: `var(--c-${module.category})`, color: '#000' }}>
                    {module.category}
                  </span>
                  <PenLine size={18} className="text-[#333] group-hover:text-white/60 transition-colors" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white/90">
                  {module.title}
                </h3>
                <p className="text-sm text-[#555] mb-4 line-clamp-2">
                  {module.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-[#444]">
                  <Calendar size={14} />
                  <span>No reflection yet</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
