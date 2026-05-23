"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
  type NodeProps,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const CustomNode = ({ data }: NodeProps) => (
  <div className="bg-[#0d0d0d]/90 text-white border border-[#333] rounded-lg px-3 py-2 text-[10px] font-bold text-center whitespace-nowrap backdrop-blur-sm shadow-lg shadow-black/20">
    <Handle type="target" position={Position.Top} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
    {data.label as string}
    <Handle type="source" position={Position.Bottom} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
  </div>
);

const nodeTypes = { custom: CustomNode };

function Graph({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        type: "custom" as const,
      })),
    [nodes]
  );

  const styledEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        animated: true,
        style: { stroke: "rgba(255,255,255,0.45)", strokeWidth: 2.5 },
      })),
    [edges]
  );

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      fitView
      fitViewOptions={{ padding: 0.3, duration: 300 }}
      minZoom={0.3}
      maxZoom={2.5}
      panOnDrag={false}
      zoomOnScroll={false}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background color="#ffffff06" gap={20} size={0.5} />
    </ReactFlow>
  );
}

export default function ModuleGraph({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="h-[400px] bg-[#050505] rounded-2xl overflow-hidden border border-white/5">
      <ReactFlowProvider>
        <Graph nodes={nodes} edges={edges || []} />
      </ReactFlowProvider>
    </div>
  );
}
