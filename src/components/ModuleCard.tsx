"use client";

import React, { useMemo, useState } from "react";
import { Play, Network, Headphones, BookOpen, Bookmark, Crown, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactFlow, Handle, Position, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { calculateDurations } from "@/lib/calculate";
import { favoritesApi } from "@/lib/api/favorites";
import { useAuth } from "@/lib/auth-context";

interface ModuleData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content?: string;
  nodes?: any[];
  edges?: any[];
  isFavorited?: boolean;
  isPremium?: boolean;
  isDailyFree?: boolean;
  listenMin?: number;
  readMin?: number;
}

const CustomNode = ({ data }: any) => (
  <div className="bg-[#0d0d0d]/90 text-white border border-[#333] rounded-lg px-3 py-2 text-[10px] font-bold text-center whitespace-nowrap backdrop-blur-sm">
    <Handle type="target" position={Position.Top} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
  </div>
);

const nodeTypes = { custom: CustomNode };

const FlowAutoFit = React.memo(({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
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
});

const MiniPreview = React.memo(({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
  const styledNodes = useMemo(() => nodes.map(n => ({
    ...n,
    type: 'custom'
  })), [nodes]);

  const styledEdges = useMemo(() => edges.map(e => ({
    ...e,
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.45)', strokeWidth: 2.5 }
  })), [edges]);

  return (
    <ReactFlowProvider>
      <FlowAutoFit nodes={styledNodes} edges={styledEdges} />
    </ReactFlowProvider>
  );
});

export function ModuleCard({ module }: { module: ModuleData }) {
  const router = useRouter();
  const { user } = useAuth();
  const durations = module.content
    ? calculateDurations(module.content)
    : { listenMin: module.listenMin ?? 0, readMin: module.readMin ?? 0 };
  const [isFavorited, setIsFavorited] = useState(module.isFavorited ?? false);

  const isSubscribed = user && user.subscriptionStatus && user.subscriptionStatus !== "FREE";
  const isAccessible = module.isDailyFree || isSubscribed;

  const handleClick = () => {
    router.push(`/models/${module.slug}`);
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/models/${module.slug}`);
  };

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
      onClick={handleClick}
      className="group relative flex flex-col bg-[#080808] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[#0c0c0c] hover:border-white/10 hover:-translate-y-1 cursor-pointer"
    >
      {module.isPremium && !module.isDailyFree && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-[#ffb800]/10 border border-[#ffb800]/30 rounded-full">
          <Crown size={11} className="text-[#ffb800]" />
          <span className="text-[0.625rem] font-bold text-[#ffb800] uppercase tracking-wider">Premium</span>
        </div>
      )}

      {!isAccessible && (
        <div className="absolute inset-0 z-20 bg-[#080808]/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href="/#pricing" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffb800] text-black rounded-xl font-bold text-[0.8125rem] no-underline hover:bg-[#ffb800]/90 transition-all">
            <Lock size={14} />
            Subscribe to Access
          </Link>
        </div>
      )}

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
            onClick={handleStartClick}
            className="group/btn flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-[0.6875rem] font-bold no-underline cursor-pointer hover:bg-white/90 transition-all"
          >
            {isAccessible ? (
              <><Play size={12} fill="currentColor" /><span>Start Learning</span></>
            ) : (
              <><Lock size={12} /><span>Locked</span></>
            )}
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
          {(durations.listenMin > 0 || durations.readMin > 0) && (
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
          )}
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
