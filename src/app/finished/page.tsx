"use client";

import React, { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import Link from "next/link";

export default function FinishedPage() {
  const items = [
    { id: 1, title: "First Principles Thinking", progress: 100, date: "2 days ago" },
    { id: 2, title: "Inversion", progress: 100, date: "5 days ago" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Finished</h1>
        <p className="text-muted text-lg max-w-[500px]">
          Your completed learning modules.
        </p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-[#080808] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={14} className="text-[#10b981]" />
              <span className="text-[0.6875rem] text-[#10b981] uppercase font-bold">Completed</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} fill="#ffb800" color="#ffb800" />
              ))}
            </div>
            <span className="text-[0.75rem] text-[#444]">Completed {item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
