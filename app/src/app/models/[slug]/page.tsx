"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import React from "react";
import { ReactFlow, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useModule } from "@/lib/query-hooks";
import { BookOpen, Headphones, HelpCircle, CheckCircle2, MessageSquare } from "lucide-react";

const CustomNode = ({ data }: { data: any; id: string }) => {
  return (
    <div className="relative">
      {data.showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-bg-elevated/10 backdrop-blur-[3px] border border-border/60 shadow-lg shadow-black/20 w-[180px] sm:w-[220px] pointer-events-none">
          <div className="text-[10px] text-muted/90 leading-[1.6]">{data.description || "This section covers the key concepts and practical steps needed to understand and apply this topic."}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-bg-elevated/10 border-r border-b border-border/60 rotate-45 -mt-[3px]" />
        </div>
      )}

      <div className={`rounded-lg px-3 py-2 text-[10px] font-bold text-center whitespace-nowrap transition-all duration-200 ${
        data.isCompleted
          ? 'bg-green-950 border border-green-500 text-green-400'
          : data.highlighted
            ? 'bg-bg/90 text-fg border border-fg/40 shadow-[0_0_14px_rgba(255,255,255,0.2)]'
            : data.dimmed
              ? 'bg-bg/40 text-muted-dark border border-border opacity-25'
              : 'bg-bg/90 text-fg border border-border backdrop-blur-[3px]'
      }`}>
        <Handle type="target" position={Position.Top} className="!bg-muted-dark !border-0 !w-1.5 !h-1.5" isConnectable={false} />
        {data.label}
        <Handle type="source" position={Position.Bottom} className="!bg-muted-dark !border-0 !w-1.5 !h-1.5" isConnectable={false} />
      </div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

export default function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { data: module, isLoading } = useModule(slug);

  const rf = useRef<any>(null);
  const selectedId = useRef<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<{id: string; data: any} | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const selectedVoiceRef = useRef<string>('');

  useEffect(() => {
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    const load = () => {
      const all = synth.getVoices();
      const priority = ['William', 'Aria', 'Guy', 'Jenny', 'Ryan', 'Sonia', 'Andrew', 'Ava'];
      const matched: SpeechSynthesisVoice[] = [];
      for (const name of priority) {
        const found = all.find(v => v.lang.startsWith('en') && v.name.includes(name));
        if (found) matched.push(found);
      }
      voicesRef.current = matched;
      if (matched.length > 0 && !selectedVoiceRef.current) {
        selectedVoiceRef.current = matched[0].name;
      }
    };
    load();
    synth.addEventListener('voiceschanged', load);
    return () => {
      synth.cancel();
      synth.removeEventListener('voiceschanged', load);
    };
  }, []);

  const speakText = useCallback((text: string) => {
    const synth = synthRef.current;
    if (!synth || !text) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    if (selectedVoiceRef.current) {
      const voice = voicesRef.current.find(v => v.name === selectedVoiceRef.current);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = 1;
    utterance.volume = 1;
    synth.speak(utterance);
  }, []);

  const defaultNodes = useMemo(() => {
    if (!module) return [];
    return module.nodes.map((n: any) => ({
      ...n,
      data: {
        ...n.data,
        slug: module.slug,
        onAudio: () => {
          const title = n.data?.label || '';
          const desc = n.data?.description || '';
          speakText(`${title}. ${desc}`);
        },
        onComplete: () => {
          const instance = rf.current;
          if (!instance) return;
          instance.setNodes((nds: any[]) =>
            nds.map((nd: any) => {
              if (nd.id === n.id) {
                return {
                  ...nd,
                  data: { ...nd.data, isCompleted: !nd.data.isCompleted },
                };
              }
              return nd;
            })
          );
        },
      },
    }));
  }, [module, speakText]);

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

    if (nodeId) {
      const node = module.nodes.find((n: any) => n.id === nodeId);
      if (node) {
        const title = node.data?.label || '';
        const desc = node.data?.description || "This section covers the key concepts and practical steps needed to understand and apply this topic.";
        const text = `${title}. ${desc}`;
        speakText(text);
      }
    } else {
      synthRef.current?.cancel();
    }

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
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          highlighted: cNodes ? cNodes.has(n.id) : false,
          dimmed: cNodes ? !cNodes.has(n.id) : false,
          showTooltip: nodeId === n.id,
        },
      }))
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
  }, [module, speakText]);

  useEffect(() => {
    if (rf.current && defaultNodes.length > 0) {
      setTimeout(() => rf.current.fitView({ padding: 0.5, duration: 300 }), 100);
    }
  }, [defaultNodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    const newId = selectedId.current === node.id ? null : node.id;
    selectedId.current = newId;
    setSelectedNode(newId ? { id: node.id, data: node.data } : null);
    highlightNodes(newId);
  }, [highlightNodes]);

  const onPaneClick = useCallback(() => {
    selectedId.current = null;
    setSelectedNode(null);
    highlightNodes(null);
  }, [highlightNodes]);

  if (isLoading) {
    return <div className="w-full h-dvh flex items-center justify-center bg-bg"><div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" /></div>;
  }

  if (!module) notFound();

  return (
    <div className="w-full h-full bg-bg relative overflow-hidden">
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
        <h1 className="text-3xl font-bold text-fg mt-6 leading-tight pointer-events-auto">{module.title}</h1>
        <p className="text-base text-muted mt-2 pointer-events-auto">Click a node to explore connections</p>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-50 w-max bg-bg/95 border border-border backdrop-blur-md rounded-xl px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => router.push(`/models/${selectedNode.data.slug}/read/${selectedNode.id}`)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted/80 bg-bg/20 border border-border/50 hover:text-fg hover:bg-bg/40 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Read</span>
            </button>
            <button
              onClick={() => router.push(`/models/${selectedNode.data.slug}/audio/${selectedNode.id}`)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted/80 bg-bg/20 border border-border/50 hover:text-fg hover:bg-bg/40 transition-all"
            >
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              <span>Audio</span>
            </button>
            <button
              onClick={() => router.push(`/models/${selectedNode.data.slug}/quiz/${selectedNode.id}`)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted/80 bg-bg/20 border border-border/50 hover:text-fg hover:bg-bg/40 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Quiz</span>
            </button>
            <button
              onClick={() => router.push(`/models/${selectedNode.data.slug}/reflection/${selectedNode.id}`)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted/80 bg-bg/20 border border-border/50 hover:text-fg hover:bg-bg/40 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Reflect</span>
            </button>
            <button
              onClick={() => selectedNode.data.onComplete?.()}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-green-400/90 bg-green-950/20 border border-green-500/40 hover:bg-green-950/40 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Done</span>
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
