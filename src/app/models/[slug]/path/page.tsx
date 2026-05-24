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
    <Handle type="target" position={Position.Top} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" isConnectable={false} />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" isConnectable={false} />
  </div>
);

const nodeTypes = { custom: CustomNode };

const Flow = React.memo(({ nodes: initialNodes, edges }: { nodes: any[]; edges: any[] }) => {
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
  }, [initialNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={styledEdges}
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
    return <div className="w-full h-dvh flex items-center justify-center bg-[#050505]"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  if (!module) notFound();

  return (
    <div className="w-full h-dvh bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0">
        <Flow nodes={styledNodes} edges={module.edges} />
      </div>
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent pt-2 pb-2 px-6 text-center">
        <span className="badge" style={{ background: `var(--color-c-${module.category})`, color: '#000' }}>{module.category}</span>
        <h1 className="text-3xl font-bold text-white mt-4 leading-tight">Implementation Path: {module.title}</h1>
        <p className="text-base text-[#666] mt-2">Visualize your progress through the knowledge graph</p>
      </div>
    </div>
  );
}
