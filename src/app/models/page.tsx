"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Play, Clock, Search, Sparkles, Crown, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactFlow, Background, Handle, Position, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ModuleCard } from "@/components/ModuleCard";
import { useModules } from "@/lib/use-modules";
import { useAuth } from "@/lib/auth-context";
import { modulesApi } from "@/lib/api/modules";
import Pagination from "@/components/Pagination";
import type { Module as ModuleType } from "@/lib/types";

const nodeSlugs: Record<string, string> = {
  "First Principles": "first-principles",
  "Systems Thinking": "systems-thinking",
  "Inversion": "inversion-thinking",
  "Second-Order": "second-order-thinking",
  "Margin of Safety": "opportunity-cost",
  "Opportunity Cost": "opportunity-cost",
};

const MarketingNode = ({ data }: { data: any }) => {
  const router = useRouter();
  const slug = nodeSlugs[data.label];
  return (
    <div
      onClick={() => slug && router.push(`/models/${slug}`)}
      className={`cursor-pointer transition-all hover:opacity-80 ${slug ? 'cursor-pointer' : 'cursor-default'}`}
      title={slug ? `Open ${data.label}` : undefined}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-1.5 !h-1.5" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-1.5 !h-1.5" />
    </div>
  );
};

const marketingNodeTypes = { custom: MarketingNode };

const MarketingFlow = () => {
  const nodes = React.useMemo(() => [
    { id: '1', type: 'custom', position: { x: 20, y: 70 }, data: { label: 'First Principles' } },
    { id: '2', type: 'custom', position: { x: 170, y: 25 }, data: { label: 'Systems Thinking' } },
    { id: '3', type: 'custom', position: { x: 155, y: 120 }, data: { label: 'Inversion' } },
    { id: '4', type: 'custom', position: { x: 320, y: 45 }, data: { label: 'Second-Order' } },
    { id: '5', type: 'custom', position: { x: 305, y: 140 }, data: { label: 'Margin of Safety' } },
    { id: '6', type: 'custom', position: { x: 470, y: 90 }, data: { label: 'Opportunity Cost' } },
  ], []);

  const edges = React.useMemo(() => [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'rgba(251,191,36,0.35)', strokeWidth: 1.5 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'rgba(251,191,36,0.25)', strokeWidth: 1 } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'rgba(251,191,36,0.4)', strokeWidth: 1.5 } },
    { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: 'rgba(251,191,36,0.25)', strokeWidth: 1 } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: 'rgba(251,191,36,0.35)', strokeWidth: 1.5 } },
    { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: 'rgba(251,191,36,0.4)', strokeWidth: 1.5 } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: 'rgba(251,191,36,0.3)', strokeWidth: 1 } },
  ], []);

  const styledNodes = React.useMemo(() => nodes.map((n, i) => ({
    ...n,
    style: {
      background: i === 0 ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))' : 'transparent',
      color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.7)',
      border: i === 0 ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: i === 0 ? '8px 12px' : '6px 10px',
      fontSize: '11px',
      fontWeight: 700,
      boxShadow: i === 0 ? '0 0 24px rgba(251,191,36,0.08)' : 'none'
    }
  })), [nodes]);

  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          nodeTypes={marketingNodeTypes}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          minZoom={0.5}
          maxZoom={1.5}
          fitView
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
        >
          <Background color="#1a1a1a" gap={24} size={0.5} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default function ProductsPage() {
  const { user, preferences } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [dailyFree, setDailyFree] = useState<ModuleType | null>(null);

  const { modules, categories, historyModules, totalPages, loading, error, fetchHistory } = useModules(
    currentPage,
    selectedCategory,
    debouncedSearch,
  );

  const sortedModules = [...modules].sort((a, b) => {
    const aPref = preferences.includes(a.category) ? 0 : 1;
    const bPref = preferences.includes(b.category) ? 0 : 1;
    return aPref - bPref;
  });

  const historyFetchedRef = useRef(false);

  useEffect(() => {
    modulesApi.getDailyFree().then(setDailyFree).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && !historyFetchedRef.current) {
      historyFetchedRef.current = true;
      fetchHistory();
    }
  }, [user, fetchHistory]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSubscribed = user && user.subscriptionStatus && user.subscriptionStatus !== "FREE";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16 min-h-[90vh]">
      {/* Knowledge Graph Banner + Daily Material */}
      <div className="mb-8">
        {!isSubscribed && (
          <div className="grid grid-cols-2 gap-5">
            <div className="h-[280px] bg-[#0a0a0c] rounded-3xl border border-white/10 overflow-hidden relative">
              <div className="absolute inset-0">
                <MarketingFlow />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent z-10" />
              <div className="relative z-20 h-full flex items-center">
                <div className="p-8 max-w-[380px]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[0.6875rem] font-bold text-white/90 uppercase tracking-[0.1em] mb-3 w-fit">
                    <Sparkles size={12} className="text-[#fbbf24]" />
                    Premium Feature
                  </div>
                  <h2 className="text-xl font-black mb-2 text-white leading-tight">
                    Your Second Brain Awaits
                  </h2>
                  <p className="text-[0.8125rem] text-[#666] mb-4 leading-relaxed max-w-[300px]">
                    Visualize and grow your knowledge graph in real-time.
                  </p>
                  <Link href="/#pricing" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl no-underline font-bold text-[0.8125rem] hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-white/20">
                    <Sparkles size={14} />
                    See It In Action
                  </Link>
                </div>
              </div>
            </div>

            <div className="h-[280px] bg-[#0a0a0c] rounded-3xl border border-white/10 overflow-hidden relative">
              <div className="h-full flex items-center p-8">
                <div className="w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[0.6875rem] font-bold text-white/90 uppercase tracking-[0.1em] mb-3 w-fit">
                    <Sparkles size={12} className="text-[#fbbf24]" />
                    Daily Free Material
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                    {dailyFree?.title ?? 'Loading...'}
                  </h3>
                  <p className="text-[0.8125rem] text-[#666] mb-4 leading-relaxed line-clamp-2">
                    {dailyFree?.description ?? ''}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="shrink-0 px-3 py-1 rounded-full text-[0.625rem] font-semibold bg-white/5 text-white/70 border border-white/10">
                      {dailyFree?.category ? dailyFree.category.charAt(0).toUpperCase() + dailyFree.category.slice(1).replace(/-/g, ' ') : ''}
                    </span>
                    <Link href={`/models/${dailyFree?.slug ?? '#'}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-lg no-underline font-bold text-[0.75rem] hover:bg-white/90 transition-all">
                      <Play size={12} fill="currentColor" />
                      Start Free
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <header className="mb-16 max-w-[800px]">
        <h1 className="text-6xl font-black mb-4 tracking-[-0.04em] leading-none">
          Master Your <span className="text-[#444]">Thinking Library</span>
        </h1>
        <p className="text-muted text-lg leading-relaxed">
          Visual mental models and immersive audio narration for deep learning.
        </p>
      </header>

      {historyModules.length > 0 && (
        <section className="mb-16">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[#888] mb-2">
              <Clock size={14} />
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.05em]">Continue Learning</span>
            </div>
            <h2 className="text-3xl font-black tracking-[-0.04em]">Your Learning <span className="text-[#444]">History</span></h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {historyModules.map((module, idx) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/models/${module.slug}`} className="group flex flex-col bg-[#080808] border border-white/5 rounded-2xl p-6 no-underline transition-all duration-300 hover:bg-[#0a0a0a] hover:border-white/10 hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="shrink-0 px-3 py-1 rounded-full text-[0.625rem] font-semibold bg-white/5 text-white/70 border border-white/10">{module.category.charAt(0).toUpperCase() + module.category.slice(1).replace(/-/g, ' ')}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{module.title}</h3>
                  <p className="text-[0.875rem] text-[#666] leading-relaxed mb-4">{module.description}</p>
                  {module.progress && (
                    <div className="mb-4 space-y-2.5">
                      {module.progress.listeningProgress > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[0.625rem] text-[#555] mb-1">
                            <span className="flex items-center gap-1"><Play size={10} /> Listening</span>
                            <span>{Math.round(module.progress.listeningProgress)}%</span>
                          </div>
                          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${module.progress.listeningProgress}%` }} />
                          </div>
                        </div>
                      )}
                      {module.progress.readingProgress > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[0.625rem] text-[#555] mb-1">
                            <span>Reading</span>
                            <span>{Math.round(module.progress.readingProgress)}%</span>
                          </div>
                          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-white/60 rounded-full" style={{ width: `${module.progress.readingProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-[0.75rem] font-semibold text-[#888] group-hover:text-white transition-colors">
                      <Play size={12} fill="currentColor" />
                      {module.progress ? "Continue" : "Start"}
                    </div>
                    <span className="text-[0.75rem] text-[#444]">
                      {module.progress ? "Last read recently" : "New"}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <div className="mb-12">
        <div className="mb-5">
          <p className="text-[0.6875rem] font-bold text-[#444] uppercase tracking-[0.1em] mb-3">Categories</p>

          <div className={`relative ${!showAllCategories ? 'overflow-hidden max-h-[42px]' : ''}`}>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setCurrentPage(1); }}
                  className={`px-4 py-2.5 rounded-full text-[0.75rem] font-semibold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-[#080808] border border-white/5 text-[#555] hover:border-white/15 hover:text-white'}`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
            {!showAllCategories && (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent pointer-events-none" />
                <button
                  onClick={() => setShowAllCategories(true)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-full text-[0.75rem] font-semibold bg-[#080808] border border-white/10 text-white hover:bg-white/15 transition-all whitespace-nowrap z-10"
                >
                  More
                </button>
              </>
            )}
            {showAllCategories && (
              <button
                onClick={() => setShowAllCategories(false)}
                className="mt-2 px-4 py-2.5 rounded-full text-[0.75rem] font-semibold bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-all whitespace-nowrap"
              >
                Less
              </button>
            )}
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-2 px-4 py-2 rounded-full text-[0.75rem] font-semibold text-red-400 hover:text-red-300 transition-all whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Search frameworks..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full py-4 pl-11 pr-4 bg-[#080808] border border-white/5 rounded-xl text-white text-[0.875rem] outline-none focus:border-white/15 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="text-center py-10 text-red-400">{error}</div>
      )}

      {!isSubscribed && sortedModules.length > 0 && (
        <div className="mb-8 p-4 bg-[#ffb800]/5 border border-[#ffb800]/20 rounded-xl flex items-center gap-3">
          <Crown size={18} className="text-[#ffb800] flex-shrink-0" />
          <p className="text-[0.875rem] text-[#ccc]">
            Unlock all modules with a subscription.{" "}
            <Link href="/#pricing" className="text-[#ffb800] font-bold no-underline hover:underline">
              View Plans
            </Link>
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-8">
            {sortedModules.map((module, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={module.id}
              >
                <ModuleCard module={module} />
              </motion.div>
            ))}
          </div>

          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
