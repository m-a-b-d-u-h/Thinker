"use client";

import React, { useState } from "react";
import { Bookmark, Search } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <Bookmark size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Saved</h1>
        <p className="text-muted text-lg max-w-[500px]">
          Your saved items for later.
        </p>
      </header>

      <div className="text-center mt-16 text-[#444] text-[0.875rem]">
        No saved items yet. Start saving theories you want to revisit.
      </div>
    </div>
  );
}
