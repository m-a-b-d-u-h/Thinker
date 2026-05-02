"use client";

import { useState } from "react";
import Link from "next/link";
import { modules } from "@/lib/dummy-data";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

export default function CollectionPage() {
  const [search, setSearch] = useState("");
  const categories = [...new Set(modules.map(m => m.category))];

  const categoryData: Record<string, { desc: string; color: string }> = {
    mindset: { desc: "Mental models for thinking", color: "#a78bfa" },
    clarity: { desc: "Tools for clarity and focus", color: "#fb923c" },
    habit: { desc: "Build lasting habits", color: "#34d399" },
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-[#262626] flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Collection</h1>
          <p className="text-[0.875rem] text-[#525252] mt-1">{modules.length} theories</p>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#525252]" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[180px] py-2 pl-8 pr-3 bg-[#171717] border border-[#262626] rounded-md text-white text-[0.875rem] outline-none focus:border-[#404040] transition-colors"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const data = categoryData[cat] || { desc: "Mental models", color: "#888" };
          return (
            <Link
              key={cat}
              href={`/models?category=${cat}`}
              className="block no-underline relative min-h-[160px]"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[#262626] translate-x-4 translate-y-4" />
              <div className="absolute top-0 left-0 w-full h-full bg-[#1f1f1f] translate-x-2 translate-y-2" />
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-[#171717] border border-[#262626] p-5 hover:-translate-x-1 hover:-translate-y-1 hover:border-[#404040] transition-all duration-200"
                whileHover={{ y: -4, x: -4 }}
              >
                <div className="w-5 h-5 rounded-sm" style={{ background: `${data.color}20`, marginBottom: '1rem' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[data.color] m-[7px]" />
                </div>
                <div className="text-base font-semibold capitalize text-[#e5e5e5]">{cat}</div>
                <div className="text-[0.75rem] text-[#525252] mt-1">{data.desc}</div>
                <div className="text-[0.65rem] text-[#404040] mt-auto flex items-center gap-1">
                  {modules.filter(m => m.category === cat).length} theories <ArrowRight size={10} />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
