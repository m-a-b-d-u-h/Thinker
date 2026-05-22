"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Bookmark } from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";
import Pagination from "@/components/Pagination";
import { useFavorites } from "@/lib/query-hooks";
import { useAuth } from "@/lib/auth-context";

const PER_PAGE = 10;

export default function FavoritesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: favorites, isLoading } = useFavorites();

  const filteredModules = (favorites || []).filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredModules.length / PER_PAGE));
  const pagedModules = filteredModules.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search]);

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 text-center">
        <Bookmark size={32} className="mx-auto text-[#222] mb-4" />
        <h1 className="text-3xl font-black mb-4">Sign in to view your favorites</h1>
        <Link href="/login" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <Bookmark size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Favorites</h1>
        <p className="text-muted text-lg max-w-[500px]">Your saved mental models for quick access.</p>
      </header>

      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-[400px] py-3 pl-12 pr-4 bg-[#080808] border border-white/5 rounded-xl text-white text-[0.875rem] outline-none focus:border-white/15 transition-colors"
          />
        </div>
      </div>

      {pagedModules.length > 0 ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-8">
            {pagedModules.map((module, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={module.slug}
              >
                <ModuleCard module={{ ...module, isFavorited: true }} />
              </motion.div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-20">
          <Bookmark size={32} className="mx-auto text-[#222] mb-4" />
          <p className="text-[#444] text-[0.875rem]">No favorites yet</p>
          <Link href="/models" className="text-[#f97316] text-[0.8125rem] hover:underline mt-2 inline-block">
            Browse models →
          </Link>
        </div>
      )}
    </div>
  );
}
