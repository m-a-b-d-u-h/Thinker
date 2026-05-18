"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import React, { useMemo, useRef } from "react";
import ReactFlow, { Background, Handle, Position, NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import { modulesApi } from "@/lib/api/modules";
import { progressApi } from "@/lib/api/progress";
import { useAuth } from "@/lib/auth-context";
import type { Module } from "@/lib/types";

const CustomNode = ({ data }: NodeProps) => (
  <div className="bg-[#111] text-white border border-[#222] rounded-xl px-3 py-2.5 text-xs font-bold text-center min-w-[120px]">
    <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-2 !h-2" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-2 !h-2" />
  </div>
);

const nodeTypes = { custom: CustomNode };

function Flow({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  const reactFlowInstance = useRef<any>(null);

  useEffect(() => {
    if (reactFlowInstance.current) {
      const timer = setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.5, duration: 300 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        onInit={(instance) => { reactFlowInstance.current = instance; }}
        fitView
        fitViewOptions={{ padding: 0.5 }}
      >
        <Background color="#111" gap={20} size={0.5} />
      </ReactFlow>
    </div>
  );
}

export default function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    modulesApi.getBySlug(slug).then((m) => {
      setModule(m);
      setLoading(false);
    }).catch(() => setLoading(false));
    if (user) {
      progressApi.getCompletedNodes(slug).then(setCompletedNodes).catch(() => {});
    }
  }, [slug, user]);

  const styledNodes = useMemo(() => {
    if (!module) return [];
    return module.nodes.map((n) => ({
      ...n,
      style: {
        ...(completedNodes.includes(n.id)
          ? { background: '#1a3a1a', border: '1px solid #22c55e', color: '#86efac' }
          : { background: '#111', border: '1px solid #222' }),
      },
    }));
  }, [module, completedNodes]);

  if (loading) {
    return <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16 flex justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  if (!module) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16">
      <div className="max-w-[900px] mx-auto">
        <header className="mb-8">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">Implementation Path: {module.title}</h1>
          <p className="text-lg text-[#666]">Visualize your progress through the knowledge graph</p>
        </header>

        <div className="h-[600px] bg-[#050505] rounded-3xl overflow-hidden border border-white/5">
          <Flow nodes={styledNodes} edges={module.edges} />
        </div>

        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2 text-[0.75rem] text-[#666]">
            <div className="w-3 h-3 rounded-sm bg-[#1a3a1a] border border-green-500" />
            Completed ({completedNodes.length})
          </div>
          <div className="flex items-center gap-2 text-[0.75rem] text-[#666]">
            <div className="w-3 h-3 rounded-sm bg-[#111] border border-[#222]" />
            Pending ({module.nodes.length - completedNodes.length})
          </div>
          <div className="flex-1" />
          <div className="text-[0.75rem] text-[#444] font-semibold">
            {Math.round((completedNodes.length / module.nodes.length) * 100)}% Complete
          </div>
        </div>
      </div>
    </div>
  );
}
