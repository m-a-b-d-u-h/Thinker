"use client";

import { reflections } from "@/lib/dummy-data";
import { BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/format";

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reflections.map((ref, idx) => (
          <motion.div
            key={ref.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/models/${ref.moduleSlug}/reflection`}
              className="no-underline"
            >
              <div className="bg-[#080808] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-200 cursor-pointer group h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="shrink-0 px-3 py-1 rounded-full text-[0.625rem] font-semibold bg-white/5 text-white/70 border border-white/10">
                    {ref.moduleTitle}
                  </span>
                  <span className="text-[0.75rem] text-[#444] flex items-center gap-1.5">
                    <Calendar size={12} />
                    {formatDate(ref.timestamp)}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white/90 transition-colors">
                  {ref.title}
                </h3>

                <p className="text-[0.9375rem] text-[#777] leading-[1.8] whitespace-pre-wrap flex-1">
                  {ref.content}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
