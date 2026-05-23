"use client";

import { useMemo, useRef, useEffect } from "react";
import { notFound } from "next/navigation";
import React from "react";
import { ReactFlow, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useModule } from "@/lib/query-hooks";
import { progressApi } from "@/lib/api/progress";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";

const CustomNode = ({ data }: { data: any }) => (
  <div className={`rounded-lg px-3 py-2 text-[10px] font-bold text-center whitespace-nowrap ${
    data.isCompleted
      ? 'bg-[#1a3a1a] border border-green-500 text-[#86efac]'
      : 'bg-[#0d0d0d]/90 text-white border border-[#333] backdrop-blur-sm'
  }`}>
    <Handle type="target" position={Position.Top} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
  </div>
);

const nodeTypes = { custom: CustomNode };

const Flow = React.memo(({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
  const reactFlowInstance = useRef<any>(null);

  const styledEdges = useMemo(() => edges.map(e => ({
    ...e,
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5 },
    labelStyle: { fill: '#666', fontSize: 10, fontWeight: 600 },
  })), [edges]);

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
        edges={styledEdges}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        onInit={(instance) => { reactFlowInstance.current = instance; }}
        fitView
        fitViewOptions={{ padding: 0.5 }}
      >
      </ReactFlow>
    </div>
  );
});

export default function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { user } = useAuth();
  const { data: module, isLoading } = useModule(slug);
  const { data: completedNodes = [] } = useQuery({
    queryKey: ["completed-nodes", slug],
    queryFn: () => progressApi.getCompletedNodes(slug),
    enabled: !!user && !!slug,
  });

  const styledNodes = useMemo(() => {
    if (!module) return [];
    return module.nodes.map((n: any) => ({
      ...n,
      data: { ...n.data, isCompleted: completedNodes.includes(n.id) },
    }));
  }, [module, completedNodes]);

  if (isLoading) {
    return <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16 flex justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  if (!module) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pb-[160px] pt-10 md:pt-16">
      <div className="max-w-[900px] mx-auto">
        <header className="mb-8">
          <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">Implementation Path: {module.title}</h1>
          <p className="text-lg text-[#666]">Visualize your progress through the knowledge graph</p>
        </header>

        <div className="h-[400px] md:h-[600px] bg-[#050505] rounded-3xl overflow-hidden border border-white/5">
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
