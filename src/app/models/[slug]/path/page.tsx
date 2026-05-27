"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { notFound } from "next/navigation";
import React from "react";
import { ReactFlow, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useModule } from "@/lib/query-hooks";
import { progressApi } from "@/lib/api/progress";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";

const CustomNode = ({ data }: { data: any }) => (
  <div className="relative">
    <div className={`rounded-lg px-3 py-2 text-[10px] font-bold text-center whitespace-nowrap transition-all duration-200 ${
      data.isCompleted
        ? 'bg-green-950 border border-green-500 text-green-400'
        : data.highlighted
          ? 'bg-bg/90 text-fg border border-fg/40 shadow-[0_0_14px_rgba(255,255,255,0.2)]'
          : data.dimmed
            ? 'bg-bg/40 text-muted-dark border border-border opacity-25'
            : 'bg-bg/90 text-fg border border-border backdrop-blur-sm'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-muted-dark !border-0 !w-1.5 !h-1.5" isConnectable={false} />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-dark !border-0 !w-1.5 !h-1.5" isConnectable={false} />
    </div>
    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-bg-elevated/50 backdrop-blur-md border border-border shadow-lg shadow-black/40 transition-opacity duration-150 pointer-events-none w-[260px] sm:w-[360px] ${
      data.showTooltip ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="text-[10px] text-muted leading-relaxed">This is a short description about this module. Hardcoded for now. But it will be replaced with real data later.</div>
    </div>
  </div>
);

const nodeTypes = { custom: CustomNode };

export default function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { user } = useAuth();
  const { data: module, isLoading } = useModule(slug);
  const { data: completedNodes = [] } = useQuery({
    queryKey: ["completed-nodes", slug],
    queryFn: () => progressApi.getCompletedNodes(slug),
    enabled: !!user && !!slug,
  });

  const rf = useRef<any>(null);
  const selectedId = useRef<string | null>(null);

  const defaultNodes = useMemo(() => {
    if (!module) return [];
    return module.nodes.map((n: any) => ({
      ...n,
      data: { ...n.data, isCompleted: completedNodes.includes(n.id) },
    }));
  }, [module, completedNodes]);

  const defaultEdges = useMemo(() => {
    if (!module) return [];
    return module.edges.map((e: any) => ({
      ...e,
      animated: true,
      style: { stroke: 'var(--color-border)', strokeWidth: 3, opacity: 1 },
      labelStyle: { fill: 'var(--color-muted-dark)', fontSize: 9, fontWeight: 500 },
      labelBgStyle: { fill: 'transparent' },
      labelBgPadding: [0, 0] as [number, number],
      labelBgBorderRadius: 0,
    }));
  }, [module]);

  const highlightNodes = useCallback((nodeId: string | null) => {
    const instance = rf.current;
    if (!instance || !module) return;

    const cNodes = !nodeId ? null : new Set<string>([nodeId]);
    const cEdges = !nodeId ? null : new Set<string>();
    if (nodeId) {
      module.edges.forEach((e: any) => {
        if (e.source === nodeId || e.target === nodeId) {
          cEdges!.add(e.id);
          cNodes!.add(e.source);
          cNodes!.add(e.target);
        }
      });
    }

    instance.setNodes((nds: any[]) =>
      nds.map((n) => {
        const original = module.nodes.find((mn: any) => mn.id === n.id);
        return {
          ...n,
          data: {
            ...(original?.data || n.data),
            isCompleted: completedNodes.includes(n.id),
            highlighted: cNodes ? cNodes.has(n.id) : false,
            dimmed: cNodes ? !cNodes.has(n.id) : false,
            showTooltip: nodeId === n.id,
          },
        };
      })
    );

    instance.setEdges((eds: any[]) =>
      eds.map((e) => {
        const connected = cEdges ? cEdges.has(e.id) : false;
        const isReset = !nodeId;
        return {
          ...e,
          style: {
            stroke: isReset ? 'var(--color-border)' : connected ? 'var(--color-border-light)' : 'var(--color-border)',
            strokeWidth: 3,
            opacity: isReset ? 1 : connected ? 1 : 0.12,
          },
          labelStyle: {
            fill: isReset ? 'var(--color-muted-dark)' : connected ? 'var(--color-fg)' : 'var(--color-muted-dark)',
            fontSize: 9,
            fontWeight: isReset ? 500 : connected ? 600 : 500,
          },
        };
      })
    );
  }, [module, completedNodes]);

  useEffect(() => {
    if (rf.current && defaultNodes.length > 0) {
      setTimeout(() => rf.current.fitView({ padding: 0.5, duration: 300 }), 100);
    }
  }, [defaultNodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    const newId = selectedId.current === node.id ? null : node.id;
    selectedId.current = newId;
    highlightNodes(newId);
  }, [highlightNodes]);

  const onPaneClick = useCallback(() => {
    selectedId.current = null;
    highlightNodes(null);
  }, [highlightNodes]);

  if (isLoading) {
    return <div className="w-full h-dvh flex items-center justify-center bg-bg"><div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" /></div>;
  }

  if (!module) notFound();

  return (
    <div className="w-full h-dvh bg-bg relative overflow-hidden">
      <div className="absolute inset-0">
        <ReactFlow
          defaultNodes={defaultNodes}
          defaultEdges={defaultEdges}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          onInit={(instance) => { rf.current = instance; }}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.5 }}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-bg via-bg/80 to-transparent pt-2 pb-2 px-6 text-center pointer-events-none">
        <h1 className="text-3xl font-bold text-fg mt-6 leading-tight pointer-events-auto">Implementation Path: {module.title}</h1>
        <p className="text-base text-muted mt-2 pointer-events-auto">Click a node to explore connections</p>
      </div>
    </div>
  );
}
