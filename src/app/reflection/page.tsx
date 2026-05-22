"use client";

import { useState } from "react";
import { BookOpen, Calendar, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/format";
import Pagination from "@/components/Pagination";
import { useReflections, useDeleteReflection } from "@/lib/query-hooks";
import { useAuth } from "@/lib/auth-context";

const PER_PAGE = 12;

export default function ReflectionListPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data: reflections, isLoading } = useReflections();
  const deleteMutation = useDeleteReflection();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-16 text-center">
        <BookOpen size={32} className="mx-auto text-[#222] mb-4" />
        <h1 className="text-3xl font-black mb-4">Sign in to view your reflections</h1>
        <Link href="/login" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-[-0.04em]">Reflections</h1>
        <p className="text-muted text-lg max-w-[500px]">Review your learning reflections ({reflections?.length || 0})</p>
      </header>

      {!reflections || reflections.length === 0 ? (
        <div className="text-center py-20 text-[#444] text-[0.875rem]">No reflections yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {reflections.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((ref, idx) => (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="group bg-[#080808] border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-200 h-full flex flex-col">
                <div className="p-6 pb-3 flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {ref.module?.category && (
                      <span className="px-2.5 py-0.5 rounded-full text-[0.625rem] font-semibold bg-white/5 text-white/70 border border-white/10">
                        {ref.module.category.charAt(0).toUpperCase() + ref.module.category.slice(1).replace(/-/g, ' ')}
                      </span>
                    )}
                    <span className="text-[0.6875rem] text-[#555] flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(new Date(ref.timestamp).getTime())}
                    </span>
                  </div>

                  <Link
                    href={ref.module?.slug ? `/models/${ref.module.slug}` : '#'}
                    className="text-[0.6875rem] text-[#666] hover:text-white transition-colors no-underline mb-2 block"
                  >
                    {ref.module?.title || "Unknown Module"}
                  </Link>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {ref.title}
                  </h3>

                  <p className="text-[0.8125rem] text-[#666] leading-relaxed whitespace-pre-wrap line-clamp-5">
                    {ref.content}
                  </p>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
                  {ref.module?.slug ? (
                    <Link
                      href={`/models/${ref.module.slug}/reflection`}
                      className="flex items-center gap-1 text-[0.6875rem] font-semibold text-[#555] hover:text-white transition-colors no-underline"
                    >
                      Open Module <ArrowRight size={12} />
                    </Link>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(ref.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg text-[#444] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer bg-transparent border-none disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(reflections.length / PER_PAGE))} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
