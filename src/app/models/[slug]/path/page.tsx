"use client";

import { modules } from "@/lib/dummy-data";
import { notFound } from "next/navigation";
import React, { useMemo } from "react";
import ReactFlow, { Background, Handle, Position, NodeProps } from "reactflow";
import "reactflow/dist/style.css";

const CustomNode = ({ data }: NodeProps) => (
  <div className="bg-[#111] text-white border border-[#222] rounded-xl px-3 py-2.5 text-xs font-bold text-center min-w-[120px]">
    <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-2 !h-2" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-2 !h-2" />
  </div>
);

const nodeTypes = { custom: CustomNode };

export default function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const module = modules.find((m) => m.slug === slug);

  const nodes = useMemo(() => (module?.nodes || []).map(n => ({ ...n, type: 'custom' as const })), [module?.nodes]);
  const edges = useMemo(() => (module?.edges || []).map(edge => ({
    ...edge,
    type: 'default',
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.4)', strokeWidth: 2 },
  })), [module?.edges]);

  if (!module) notFound();

  return (
    <div className="h-[calc(100vh-104px)] bg-[#050505]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        panOnDrag={true}
        zoomOnScroll={false}
        nodesDraggable={false}
      >
        <Background color="#111" gap={30} size={1} />
      </ReactFlow>
    </div>
  );
}
