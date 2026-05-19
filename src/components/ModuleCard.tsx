"use client";

import React, { useMemo, useState } from "react";
import { Play, Network, Headphones, BookOpen, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactFlow, { Handle, Position, ReactFlowProvider, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import { calculateDurations } from "@/lib/calculate";
import { favoritesApi } from "@/lib/api/favorites";

interface ModuleData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string;
  nodes?: any[];
  edges?: any[];
  isFavorited?: boolean;
}

const CustomNode = ({ data }: any) => (
  <div className="bg-[#0d0d0d]/90 text-white border border-[#333] rounded-lg px-3 py-2 text-[10px] font-bold text-center whitespace-nowrap backdrop-blur-sm">
    <Handle type="target" position={Position.Top} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
  </div>
);

const nodeTypes = { custom: CustomNode };

const FlowAutoFit = ({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
  const { fitView } = useReactFlow();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ nodes: [{ id: nodes[0]?.id }], padding: 0.2, duration: 0, minZoom: 0.6, maxZoom: 1.2 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView, nodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      fitView
    >
    </ReactFlow>
  );
};

const MiniPreview = ({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
  const styledNodes = useMemo(() => nodes.map(n => ({
    ...n,
    type: 'custom'
  })), [nodes]);

  const styledEdges = useMemo(() => edges.map(e => ({
    ...e,
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5 }
  })), [edges]);

  return (
    <ReactFlowProvider>
      <FlowAutoFit nodes={styledNodes} edges={styledEdges} />
    </ReactFlowProvider>
  );
};

export function ModuleCard({ module }: { module: ModuleData }) {
  const router = useRouter();
  const durations = calculateDurations(module.content);
  const [isFavorited, setIsFavorited] = useState(module.isFavorited ?? false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = isFavorited;
    setIsFavorited(!prev);
    try {
      if (prev) {
        await favoritesApi.remove(module.slug);
      } else {
        await favoritesApi.add(module.slug);
      }
    } catch {
      setIsFavorited(prev);
    }
  };

  return (
    <div
      onClick={() => router.push(`/models/${module.slug}`)}
      className="group relative flex flex-col bg-[#080808] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[#0c0c0c] hover:border-white/10 hover:-translate-y-1 cursor-pointer"
    >
      <div className="absolute inset-0 z-0">
        {module.nodes && module.nodes.length > 0 ? (
          <MiniPreview nodes={module.nodes} edges={module.edges || []} />
        ) : (
          <div className="w-full h-full bg-[#080808]" />
        )}
      </div>

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080808] via-[#080808]/80 to-transparent z-10" />

      <div className="relative z-20 p-8 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black text-white leading-[1.25] line-clamp-2 flex-1">{module.title}</h2>
          <span className="shrink-0 px-3 py-1 rounded-full text-[0.625rem] font-semibold bg-white/5 text-white/70 border border-white/10 mt-1">{module.category.charAt(0).toUpperCase() + module.category.slice(1).replace(/-/g, ' ')}</span>
        </div>
        <p className="text-[0.75rem] text-[#777] leading-relaxed mt-1">{module.description}</p>
      </div>

      <div className="flex-1 relative z-10 min-h-[160px]" />

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080808] via-[#080808]/90 to-transparent z-10" />

      <div className="relative z-20 flex items-center justify-between px-8 pb-6 pt-8">
        <div className="flex items-center gap-2">
          <div
            onClick={() => router.push(`/models/${module.slug}`)}
            className="group/btn flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-[0.6875rem] font-bold no-underline cursor-pointer hover:bg-white/90 transition-all"
          >
            <Play size={12} fill="currentColor" />
            <span>Start Learning</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/models/${module.slug}/path`);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 text-white/60 text-[0.6875rem] font-semibold hover:bg-white/10 hover:text-white/80 transition-all"
          >
            <Network size={12} />
            <span>Path</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.6875rem] text-[#666] flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Headphones size={12} />
              <span>Listen {durations.listenMin}m</span>
            </span>
            <span className="text-[#444]">·</span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              <span>Read {durations.readMin}m</span>
            </span>
          </span>
          <button
            onClick={toggleFavorite}
            className="p-2.5 rounded-full text-[#888] hover:text-[#fbbf24] hover:bg-white/10 transition-all"
          >
            <Bookmark size={16} fill={isFavorited ? "#fbbf24" : "none"} stroke={isFavorited ? "#fbbf24" : "currentColor"} />
          </button>
        </div>
      </div>
    </div>
  );
}
