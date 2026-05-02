"use client";

import { modules } from "@/lib/dummy-data";
import { notFound } from "next/navigation";
import React, { useMemo, useState, useCallback } from "react";
import ReactFlow, { Background, Handle, Position, NodeProps, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Play, Sparkles, Edit3, Save, RotateCcw, Zap, MessageSquare } from "lucide-react";
import Link from "next/link";

const CustomNode = ({ data }: NodeProps) => (
  <div className="bg-[#111] text-white border border-[#222] rounded-xl px-3 py-2.5 text-xs font-bold text-center min-w-[120px]">
    <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-2 !h-2" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-2 !h-2" />
  </div>
);

const nodeTypes = { custom: CustomNode };

const aiExplanations: Record<string, string> = {
  default: "This mental model shows how different concepts connect. Each node represents a key idea, and the edges show relationships between them.",
  "stop-waiting": "This framework reveals the motivation trap: we wait for motivation, but actually motivation comes AFTER action, not before. The key insight is to start before you feel ready.",
  "first-principles": "Breaking down problems to their most basic elements and rebuilding from scratch. This helps avoid assumptions and enables innovative solutions.",
};

export default function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const module = modules.find((m) => m.slug === slug);

  const [isEditing, setIsEditing] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (module?.nodes || []).map(n => ({ ...n, type: 'custom' }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (module?.edges || []).map(edge => ({
      ...edge,
      type: 'default',
      animated: true,
      style: { stroke: 'rgba(255,255,255,0.4)', strokeWidth: 2 },
    }))
  );
  const [aiExplanation, setAiExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onConnect = (params: any) => {
    if (!isEditing) return;
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'rgba(255,255,255,0.4)' } }, eds));
  };

  const generateAIExplanation = async () => {
    setIsGenerating(true);
    const selectedNodeData = selectedNode
      ? nodes.find(n => n.id === selectedNode)?.data?.label
      : null;

    await new Promise(resolve => setTimeout(resolve, 1500));

    let explanation = aiExplanations[slug || ''] || aiExplanations.default;

    if (selectedNodeData) {
      explanation = `"${selectedNodeData}" is a key concept in this mental model. It connects to other ideas through the edges shown in the chart. Understanding this node helps you grasp the core principle of ${module?.title || 'this framework'}.`;
    }

    if (nodes.length > 2) {
      explanation += ` This chart has ${nodes.length} interconnected concepts.`;
    }

    setAiExplanation(explanation);
    setIsGenerating(false);
  };

  const updateNodeLabel = (nodeId: string, newLabel: string) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
    ));
  };

  const addNewNode = () => {
    const newId = `new-${Date.now()}`;
    const newNode = {
      id: newId,
      position: { x: Math.random() * 300, y: Math.random() * 200 },
      type: 'custom',
      data: { label: 'New Concept' },
    };
    setNodes(nds => [...nds, newNode]);
  };

  const resetChart = () => {
    setNodes((module?.nodes || []).map(n => ({ ...n, type: 'custom' })));
    setEdges((module?.edges || []).map(edge => ({
      ...edge,
      type: 'default',
      animated: true,
      style: { stroke: 'rgba(255,255,255,0.4)', strokeWidth: 2 },
    })));
    setIsEditing(false);
  };

  if (!module) notFound();

  return (
    <div className="w-full min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="sticky top-16 z-50 bg-[#050505e6] backdrop-blur-[20px] border-b border-white/5">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-6">
          <Link
            href="/models"
            className="inline-flex items-center gap-2 text-[#666] text-[0.875rem] font-semibold mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Frameworks
          </Link>

          <div className="flex items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge" style={{ background: `var(--c-${module.category})`, color: '#000', fontSize: '0.625rem', fontWeight: 800 }}>
                  {module.category}
                </span>
                <div className="flex items-center gap-1.5 text-[#333]">
                  <BookOpen size={12} />
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider">
                    Implementation Path
                  </span>
                </div>
              </div>
              <h1 className="text-2xl font-black text-white tracking-[-0.02em]">
                {module.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {isEditing && (
                <button
                  onClick={addNewNode}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-semibold text-[0.8125rem] cursor-pointer hover:bg-white/10 transition-all"
                >
                  + Add Node
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg font-semibold text-[0.8125rem] cursor-pointer transition-all ${isEditing ? 'bg-white/10 border-white/10' : 'bg-white/5 border-white/10 hover:bg-white/10'} text-white`}
              >
                <Edit3 size={14} />
                {isEditing ? 'Done Editing' : 'Edit Chart'}
              </button>
              {isEditing && (
                <button
                  onClick={resetChart}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 font-semibold text-[0.8125rem] cursor-pointer hover:bg-red-500/20 transition-all"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}
              <button
                className="flex items-center gap-3 px-6 py-3.5 bg-white text-black border-none rounded-xl font-bold text-[0.875rem] cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Play size={16} fill="currentColor" />
                Start Path
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-[1fr_380px] gap-6 p-6">
        {/* Flow Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[calc(100vh-280px)] bg-gradient-to-b from-[#080808] to-[#050505] rounded-2xl border border-white/5 overflow-hidden relative"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            onPaneClick={() => setSelectedNode(null)}
            proOptions={{ hideAttribution: true }}
            fitView
            panOnDrag={!isEditing}
            zoomOnScroll={false}
            nodesDraggable={isEditing}
          >
            <Background color="#111" gap={30} size={1} />
          </ReactFlow>

          {selectedNode && isEditing && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#111] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                defaultValue={nodes.find(n => n.id === selectedNode)?.data?.label}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateNodeLabel(selectedNode, (e.target as HTMLInputElement).value);
                  }
                }}
                className="bg-transparent border-none text-white text-[0.875rem] font-semibold outline-none w-[200px]"
                placeholder="Edit label..."
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Edit label..."]') as HTMLInputElement;
                  if (input) updateNodeLabel(selectedNode, input.value);
                }}
                className="px-4 py-2 bg-white text-black border-none rounded-lg text-[0.75rem] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >
                Update
              </button>
            </div>
          )}

          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
        </motion.div>

        {/* AI Explanation Panel */}
        <motion.div
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#080808] rounded-2xl border border-white/5 flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-black text-white">AI Explanation</h2>
            </div>
            <p className="text-[0.8125rem] text-[#666]">
              Click on any node in the chart, then ask AI to explain it.
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {aiExplanation ? (
              <motion.div
                initial={{ opacity: 0, y: 2.5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white/[0.02] rounded-xl border border-white/5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <span className="text-[0.75rem] font-bold text-[#a78bfa]">1section AI</span>
                </div>
                <p className="text-[0.9375rem] text-[#ccc] leading-relaxed">
                  {aiExplanation}
                </p>
              </motion.div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-center">
                <MessageSquare size={32} className="text-[#222] mb-4" />
                <p className="text-[0.875rem] text-[#444]">
                  Click a node or generate AI explanation
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/5">
            <button
              onClick={generateAIExplanation}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-3 py-4 border-none rounded-xl font-bold text-[0.875rem] cursor-pointer transition-all duration-200 ${isGenerating ? 'bg-[#a78bfa33] cursor-wait' : 'bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] hover:opacity-90'} text-white`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Explain with AI
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
