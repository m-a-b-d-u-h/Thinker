"use client";

import { modules } from "@/lib/dummy-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { Play, ArrowRight, Sparkles, Network, Clock, Search } from "lucide-react";
import { motion } from "framer-motion";
import ReactFlow, { Background, NodeProps, Handle, Position, useReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

const CustomNode = ({ data }: NodeProps) => (
  <div className="bg-[#111] text-white border border-[#222] rounded-xl px-3 py-2.5 text-xs font-bold text-center min-w-[120px]">
    <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-2 !h-2" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-2 !h-2" />
  </div>
);

const nodeTypes = { custom: CustomNode };

const MarketingFlow = () => {
  const nodes = useMemo(() => [
    {
      id: '1',
      type: 'custom',
      position: { x: 30, y: 60 },
      data: { label: 'First Principles' }
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 200, y: 20 },
      data: { label: 'Systems Thinking' }
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 180, y: 140 },
      data: { label: 'Inversion' }
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 380, y: 50 },
      data: { label: 'Second-Order Thinking' }
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 370, y: 160 },
      data: { label: 'Margin of Safety' }
    },
    {
      id: '6',
      type: 'custom',
      position: { x: 550, y: 100 },
      data: { label: 'Opportunity Cost' }
    }
  ], []);

  const edges = useMemo(() => [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'rgba(251,191,36,0.4)', strokeWidth: 2 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'rgba(251,191,36,0.3)', strokeWidth: 1.5 } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'rgba(251,191,36,0.5)', strokeWidth: 2 } },
    { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: 'rgba(251,191,36,0.3)', strokeWidth: 1.5 } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: 'rgba(251,191,36,0.4)', strokeWidth: 2 } },
    { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: 'rgba(251,191,36,0.5)', strokeWidth: 2 } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: 'rgba(251,191,36,0.3)', strokeWidth: 1.5 } },
  ], []);

  const styledNodes = useMemo(() => nodes.map((n, i) => ({
    ...n,
    style: {
      background: i === 0 ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))' : 'rgba(255,255,255,0.03)',
      color: '#fff',
      border: i === 0 ? '1px solid rgba(251,191,36,0.6)' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '10px 14px',
      fontSize: '11px',
      fontWeight: 700,
      boxShadow: i === 0 ? '0 0 20px rgba(251,191,36,0.1)' : 'none'
    }
  })), [nodes]);

  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
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

const FlowFocus = ({ nodeId }: { nodeId: string }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({
        nodes: [{ id: nodeId }],
        padding: 0.8,
        duration: 0,
        minZoom: 0.8,
        maxZoom: 1.2
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [nodeId, fitView]);

  return null;
};

const MiniPreview = ({ nodes, edges }: { nodes: any[], edges: any[] }) => {
  const styledNodes = useMemo(() => nodes.map(n => ({
    ...n,
    style: n.type === 'custom' ? n.style : {
      ...n.style,
      background: '#111',
      color: '#fff',
      border: '1px solid #222',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 600,
      padding: '10px 14px',
      width: 'auto',
      minWidth: '100px',
      textAlign: 'center' as const
    }
  })), [nodes]);

  const styledEdges = useMemo(() => edges.map(e => ({
    ...e,
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }
  })), [edges]);

  return (
    <div className="h-[260px] w-full bg-[#050505] rounded-3xl overflow-hidden border border-white/5 pointer-events-none my-6">
      <ReactFlowProvider>
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 50, zoom: 1 }}
        >
          <Background color="#111" gap={12} size={0.5} />
          <FlowFocus nodeId="1" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const router = useRouter();

  const calculateTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const totalSeconds = Math.ceil(words / 2.5);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const historyModules = modules.slice(0, 3);

  const filteredModules = useMemo(() => {
    let validModules = modules.filter(m => m.slug && m.title && m.description);

    if (searchQuery) {
      validModules = validModules.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return validModules;
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedModules = filteredModules.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16 min-h-[90vh]">
      {/* Knowledge Graph Banner */}
      <div className="h-[320px] bg-[#0a0a0c] rounded-3xl mb-8 border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0">
          <MarketingFlow />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent z-10" />
        <div className="relative z-20 h-full flex items-center">
          <div className="p-10 max-w-[420px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[0.6875rem] font-bold text-white/90 uppercase tracking-[0.1em] mb-4 w-fit">
              <Sparkles size={12} className="text-[#fbbf24]" />
              Premium Feature
            </div>
            <h2 className="text-2xl font-black mb-2 text-white leading-tight">
              Your Second Brain Awaits
            </h2>
            <p className="text-[0.8125rem] text-[#666] mb-5 leading-relaxed max-w-[350px]">
              Visualize and grow your knowledge graph in real-time.
            </p>
            <Link href="/#pricing" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl no-underline font-bold text-[0.875rem] hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-white/20">
              <Sparkles size={16} />
              See It In Action
            </Link>
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
                    <span className="badge" style={{ background: `var(--c-${module.category})`, color: '#000', fontSize: '0.625rem', fontWeight: 800 }}>{module.category}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{module.title}</h3>
                  <p className="text-[0.875rem] text-[#666] leading-relaxed mb-4">{module.description}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-[0.75rem] font-semibold text-[#888] group-hover:text-white transition-colors">
                      <Play size={12} fill="currentColor" />
                      Resume
                    </div>
                    <span className="text-[0.75rem] text-[#444]">Started 2 hours ago</span>
                  </div>
                </Link>
                </motion.div>
              ))}
      </div>
      </section>
        )}

      <div className="mb-12">
        <div className="relative flex-1 max-w-[400px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Search frameworks..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full py-3.5 pl-11 pr-4 bg-[#080808] border border-white/5 rounded-xl text-white text-[0.875rem] outline-none focus:border-white/15 transition-colors"
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
            onClick={() => router.push(`/models/${module.slug}`)}
            className="group flex flex-col bg-[#080808] border border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 hover:bg-[#0a0a0a] hover:border-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60 cursor-pointer"
          >
            <div className="p-8 pb-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="badge" style={{ background: `var(--c-${module.category})`, color: '#000', fontSize: '0.625rem', fontWeight: 800 }}>{module.category}</span>
                <div className="flex items-center gap-1.5 text-[#333] group-hover:text-[#444] transition-colors">
                  <Sparkles size={12} />
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider">Theory Engine</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 leading-[1.2] group-hover:text-white/95 transition-colors">{module.title}</h2>
              <p className="text-base text-[#666] leading-relaxed mb-2">{module.description}</p>
            </div>

            {module.nodes && module.nodes.length > 0 ? (
              <div className="px-6 pb-2">
                <MiniPreview nodes={module.nodes} edges={module.edges || []} />
              </div>
            ) : (
              <div className="mx-6 mb-2 h-[260px] bg-white/[0.01] rounded-3xl flex items-center justify-center text-[#222]">
                <Network size={28} />
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/5 px-8 py-5 mt-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 text-[0.8125rem] font-bold text-white/90 group-hover:text-white transition-colors">
                  <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/10 group-hover:scale-105 transition-transform">
                    <Play size={14} fill="currentColor" />
                  </div>
                  <span className="group-hover:translate-x-0.5 transition-transform">Listen</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/models/${module.slug}/path`);
                  }}
                  className="flex items-center gap-2.5 text-[0.8125rem] font-bold text-[#333] hover:text-white transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <Network size={14} />
                  </div>
                  <span>Path</span>
                </button>
              </div>
              <div className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/5 transition-all">
                <ArrowRight size={16} className="text-[#222] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
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
