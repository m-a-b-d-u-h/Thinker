"use client";

import { modules } from "@/lib/dummy-data";
import { getContinueLearning } from "@/lib/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { Play, Clock, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ModuleCard } from "@/components/ModuleCard";
import ReactFlow, { Background, NodeProps, Handle, Position, useReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const CustomNode = ({ data }: NodeProps) => (
  <div className="bg-[#111] text-white border border-[#222] rounded-xl px-3 py-2.5 text-xs font-bold text-center min-w-[120px]">
    <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-2 !h-2" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-2 !h-2" />
  </div>
);

const nodeTypes = { custom: CustomNode };

const MarketingNode = ({ data }: NodeProps) => (
  <div>
    <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-1.5 !h-1.5" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-1.5 !h-1.5" />
  </div>
);

const marketingNodeTypes = { custom: MarketingNode };

const MarketingFlow = () => {
  const nodes = useMemo(() => [
    {
      id: '1',
      type: 'custom',
      position: { x: 20, y: 70 },
      data: { label: 'First Principles' }
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 170, y: 25 },
      data: { label: 'Systems Thinking' }
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 155, y: 120 },
      data: { label: 'Inversion' }
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 320, y: 45 },
      data: { label: 'Second-Order' }
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 305, y: 140 },
      data: { label: 'Margin of Safety' }
    },
    {
      id: '6',
      type: 'custom',
      position: { x: 470, y: 90 },
      data: { label: 'Opportunity Cost' }
    }
  ], []);

  const edges = useMemo(() => [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'rgba(251,191,36,0.35)', strokeWidth: 1.5 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'rgba(251,191,36,0.25)', strokeWidth: 1 } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'rgba(251,191,36,0.4)', strokeWidth: 1.5 } },
    { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: 'rgba(251,191,36,0.25)', strokeWidth: 1 } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: 'rgba(251,191,36,0.35)', strokeWidth: 1.5 } },
    { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: 'rgba(251,191,36,0.4)', strokeWidth: 1.5 } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: 'rgba(251,191,36,0.3)', strokeWidth: 1 } },
  ], []);

  const styledNodes = useMemo(() => nodes.map((n, i) => ({
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const itemsPerPage = 6;
  const router = useRouter();

  const [historyModules, setHistoryModules] = useState(modules.slice(0, 3));
  const [historyProgress, setHistoryProgress] = useState<Record<string, { listening: number; reading: number }>>({});

  useEffect(() => {
    const saved = getContinueLearning();
    if (saved.length > 0) {
      const modulesMap: Record<string, { listening: number; reading: number }> = {};
      saved.forEach((p) => {
        modulesMap[p.slug] = { listening: p.listeningProgress, reading: p.readingProgress };
      });
      setHistoryProgress(modulesMap);

      const ordered = saved
        .map((p) => modules.find((m) => m.slug === p.slug))
        .filter(Boolean) as typeof modules;
      if (ordered.length > 0) {
        setHistoryModules(ordered);
      }
    }
  }, []);

  const filteredModules = useMemo(() => {
    let validModules = modules.filter(m => m.slug && m.title && m.description);

    if (selectedCategory) {
      validModules = validModules.filter(m => m.category === selectedCategory);
    }

    if (searchQuery) {
      validModules = validModules.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return validModules;
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedModules = filteredModules.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16 min-h-[90vh]">
      {/* Knowledge Graph Banner + Daily Material */}
      <div className="grid grid-cols-2 gap-5 mb-8">
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
                Daily Material
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                {modules[0].title}
              </h3>
              <p className="text-[0.8125rem] text-[#666] mb-4 leading-relaxed line-clamp-2">
                {modules[0].description}
              </p>
              <div className="flex items-center justify-between">
                <span className="shrink-0 px-3 py-1 rounded-full text-[0.625rem] font-semibold bg-white/5 text-white/70 border border-white/10">
                  {modules[0].category.charAt(0).toUpperCase() + modules[0].category.slice(1).replace(/-/g, ' ')}
                </span>
                <Link href={`/models/${modules[0].slug}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-lg no-underline font-bold text-[0.75rem] hover:bg-white/90 transition-all">
                  <Play size={12} fill="currentColor" />
                  Start
                </Link>
              </div>
            </div>
          </div>
        </div>
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
                  {historyProgress[module.slug] && (
                    <div className="mb-4 space-y-2.5">
                      {historyProgress[module.slug].listening > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[0.625rem] text-[#555] mb-1">
                            <span className="flex items-center gap-1">
                              <Play size={10} /> Listening
                            </span>
                            <span>{Math.round(historyProgress[module.slug].listening)}%</span>
                          </div>
                          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${historyProgress[module.slug].listening}%` }} />
                          </div>
                        </div>
                      )}
                      {historyProgress[module.slug].reading > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[0.625rem] text-[#555] mb-1">
                            <span>Reading</span>
                            <span>{Math.round(historyProgress[module.slug].reading)}%</span>
                          </div>
                          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-white/60 rounded-full" style={{ width: `${historyProgress[module.slug].reading}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-[0.75rem] font-semibold text-[#888] group-hover:text-white transition-colors">
                      <Play size={12} fill="currentColor" />
                      {historyProgress[module.slug] ? "Continue" : "Start"}
                    </div>
                    <span className="text-[0.75rem] text-[#444]">
                      {historyProgress[module.slug]
                        ? "Last read recently"
                        : "New"}
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
              {["mindset", "focus", "productivity", "strategy", "creativity", "learning", "wellbeing", "clarity", "habit", "mental-model", "logic", "psychology", "success", "stoicism", "cognitive-bias", "decision-making", "business", "problem-solving", "game-theory", "resilience", "risk", "economics"].map(cat => (
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



      <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-8">
        {paginatedModules.map((module, idx) => (
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 rounded-lg bg-[#080808] border border-white/5 text-[#888] flex items-center justify-center transition-all duration-200 ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-white/15 cursor-pointer'}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-10 h-10 rounded-lg font-bold text-[0.875rem] transition-all duration-200 ${currentPage === page ? 'bg-white text-black' : 'bg-[#080808] border border-white/5 text-[#888] hover:border-white/15'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 rounded-lg bg-[#080808] border border-white/5 text-[#888] flex items-center justify-center transition-all duration-200 ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:border-white/15 cursor-pointer'}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
