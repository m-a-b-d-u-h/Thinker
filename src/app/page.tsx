"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactFlow, { Background, NodeProps, Handle, Position, useReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import React from "react";
import { CheckCircle2, Zap, Crown, ShieldCheck, Infinity, Library, Play, ArrowRight, Sparkles, Network, Clock, BookOpen, Star, Quote } from "lucide-react";
import Marquee from "react-fast-marquee";
import Navbar from "@/components/Navbar";
import { ModuleCard } from "@/components/ModuleCard";
import { modulesApi } from "@/lib/api/modules";
import { paymentsApi } from "@/lib/api/payments";
import { useAuth } from "@/lib/auth-context";
import type { ModuleListItem, CategoryWithCount } from "@/lib/types";

// Custom Node Component for MiniPreview
const CustomNode = ({ data }: NodeProps) => (
  <div className="bg-[#111] text-white border border-[#222] rounded-xl px-3 py-2.5 text-xs font-bold text-center min-w-[120px]">
    <Handle type="target" position={Position.Top} className="!bg-[#333] !border-0 !w-2 !h-2" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!bg-[#333] !border-0 !w-2 !h-2" />
  </div>
);

const nodeTypes = { custom: CustomNode };

const FlowFocus = ({ nodeId }: { nodeId: string }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({
        nodes: [{ id: nodeId }],
        padding: 0.8,
        duration: 0,
        minZoom: 0.8,
        maxZoom: 1.2
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [nodeId, fitView]);

  return null;
};

const MiniPreview = ({ nodes, edges }: { nodes: any[], edges: any[] }) => {
  const styledNodes = useMemo(() => nodes.map(n => ({
    ...n,
    style: n.type === 'custom' ? n.style : {
      ...n.style,
      background: '#111',
      color: '#fff',
      border: '1px solid #222',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 600,
      padding: '10px 14px',
      width: 'auto',
      minWidth: '100px',
      textAlign: 'center' as const
    }
  })), [nodes]);

  const styledEdges = useMemo(() => edges.map(e => ({
    ...e,
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }
  })), [edges]);

  return (
    <div className="h-[260px] w-full bg-[#050505] rounded-3xl overflow-hidden border border-white/5 pointer-events-none my-6">
      <ReactFlowProvider>
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 50, zoom: 1 }}
        >
          <Background color="#111" gap={12} size={0.5} />
          <FlowFocus nodeId="1" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [collections, setCollections] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    modulesApi.list({ limit: "4" }).then((res) => setModules(res.data)).catch(() => {});
    modulesApi.getCategories().then(setCollections).catch(() => {});
  }, []);

  const categoryMeta: Record<string, { icon: any; desc: string }> = {
    mindset: { icon: Network, desc: "Develop powerful thinking frameworks" },
    clarity: { icon: Sparkles, desc: "Cut through complexity with precision" },
    habit: { icon: ShieldCheck, desc: "Build systems that stick" },
    action: { icon: Zap, desc: "Convert knowledge into results" },
    strategy: { icon: Crown, desc: "Plan for long-term success" },
    "decision-making": { icon: CheckCircle2, desc: "Make better choices faster" },
    communication: { icon: Clock, desc: "Express ideas effectively" },
    relationships: { icon: Library, desc: "Build meaningful connections" },
    focus: { icon: Zap, desc: "Sharpen your concentration" },
    productivity: { icon: Zap, desc: "Do more with less effort" },
    creativity: { icon: Sparkles, desc: "Unlock innovative thinking" },
    learning: { icon: BookOpen, desc: "Accelerate your skill acquisition" },
    wellbeing: { icon: ShieldCheck, desc: "Nurture your mental health" },
    logic: { icon: Network, desc: "Reason with precision" },
    psychology: { icon: BookOpen, desc: "Understand the mind" },
    success: { icon: Crown, desc: "Achieve your goals" },
    stoicism: { icon: ShieldCheck, desc: "Build resilience and calm" },
    "cognitive-bias": { icon: Network, desc: "Recognize thinking traps" },
    business: { icon: Crown, desc: "Grow your venture" },
    "mental-model": { icon: Network, desc: "Build a lattice of mental models" },
    "problem-solving": { icon: Zap, desc: "Solve tough problems" },
    "game-theory": { icon: Network, desc: "Master strategic thinking" },
    resilience: { icon: ShieldCheck, desc: "Bounce back stronger" },
    risk: { icon: ShieldCheck, desc: "Navigate uncertainty" },
    economics: { icon: Crown, desc: "Understand market forces" },
  };

  const handleSubscribe = async (planType: "MONTHLY" | "YEARLY" | "LIFETIME") => {
    if (!user) {
      router.push("/login");
      return;
    }
    setSubscribing(planType);
    try {
      const isUpgrade = user.subscriptionStatus && user.subscriptionStatus !== "FREE";
      const result = isUpgrade
        ? await paymentsApi.upgradeSubscription(planType)
        : await paymentsApi.createCheckoutSession(planType);
      if ("success" in result && result.success) {
        window.location.reload();
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setSubscribing(null);
    }
  };

  const plans = [
    {
      name: "Free", price: "$0", period: "/ forever", desc: "Start your journey with basic access.", icon: Zap,
      features: ["1 Free theory per day", "Basic community access", "Standard progress tracking", "Ad-supported platform"],
      buttonText: "Start Free", popular: false, color: "#888", discount: null
    },
    {
      name: "1 Month", price: "$10", period: "/ month", desc: "Full access for short-term goals.", icon: CheckCircle2,
      features: ["Unlimited theory access", "TTS & Highlighter mode", "Interactive Implementation Path", "Ad-free experience"],
      buttonText: "Subscribe Now", popular: false, color: "#0070f3", discount: null
    },
    {
      name: "1 Year", price: "$50", period: "/ year", desc: "Commit to your growth and save.", icon: Crown,
      features: ["Everything in 1 Month", "Completion certificates", "Offline downloads", "Early access to features"],
      buttonText: "Choose Popular", popular: true, color: "#ffb800", discount: "Save 58%"
    },
    {
      name: "Lifetime", price: "$100", period: "one-time", desc: "A lifelong investment in knowledge.", icon: Infinity,
      features: ["Everything in 1 Year", "Exclusive mentor access", "Free digital pocketbooks", "24/7 priority support"],
      buttonText: "Get Lifetime", popular: false, color: "#ff5f00", discount: "Best Value"
    }
  ];

  const calculateTime = (content?: string) => {
    if (!content) return "0:00";
    const words = content.split(/\s+/).length;
    const totalSeconds = Math.ceil(words / 2.5);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleProducts = modules.slice(0, 4);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-[1200px] px-6">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center py-20">
          <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 text-[#ffb800] bg-[#ffb8001a] px-5 py-2 rounded-full mb-8 font-bold uppercase tracking-wider text-[0.75rem] border border-[#ffb80033] w-fit">
                <Library size={14} /> The Ultimate Cognitive Library
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-[-0.04em] leading-[1.1] mb-6">
                Master your <br /> <span className="bg-gradient-to-br from-white to-[#555] bg-clip-text text-transparent">thinking library.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-[#888] max-w-[500px] mb-8 leading-relaxed">
                Explore an expansive library of mental models, cognitive tools, and frameworks. Internalize complex concepts through interactive mapping and committed action.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-4 flex-wrap mb-10">
                <Link href="/models" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
                  Continue Learning
                </Link>
                <Link href="/models" className="inline-flex items-center gap-2 bg-transparent border border-[#222] text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/5 transition-all">
                  View Modules
                </Link>
              </motion.div>

              {/* App Store Badges */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#080808] border border-white/5 rounded-xl opacity-50 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div className="text-left">
                    <div className="text-[0.5rem] text-[#666] leading-tight">Download on the</div>
                    <div className="text-[0.8125rem] font-bold text-white leading-tight">App Store</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#080808] border border-white/5 rounded-xl opacity-50 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                  <div className="text-left">
                    <div className="text-[0.5rem] text-[#666] leading-tight">Get it on</div>
                    <div className="text-[0.8125rem] font-bold text-white leading-tight">Google Play</div>
                  </div>
                </div>
                <span className="text-[0.625rem] text-[#444] font-semibold">Mobile app in development</span>
              </motion.div>
            </div>

            {/* Right: Device Mockups */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="relative">
              {/* Desktop Mockup */}
              <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50 bg-[#050505]">
                <div className="h-7 bg-[#111] flex items-center px-4 gap-2 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <div className="ml-6 flex-1 max-w-[300px] h-4 rounded-md bg-white/5 flex items-center justify-center text-[0.5rem] text-[#555] font-semibold">1section.app/models</div>
                </div>
                <div className="aspect-[16/10] bg-[#0a0a0c] grid grid-cols-2 gap-px">
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-white/10" />
                      <div className="h-2.5 w-20 rounded-full bg-white/10" />
                      <div className="h-5 w-16 rounded-full bg-[#ffb800]/20 ml-auto" />
                    </div>
                    <div className="h-5 w-3/4 rounded bg-white/10" />
                    <div className="h-3 w-full rounded bg-white/5" />
                    <div className="h-3 w-2/3 rounded bg-white/5" />
                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 flex items-center justify-center">
                        <div className="w-8 h-8 rounded border border-white/10" />
                      </div>
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 flex items-center justify-center">
                        <div className="w-8 h-8 rounded border border-white/10" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white/10" />
                      <div className="h-2.5 w-16 rounded-full bg-white/10" />
                    </div>
                    <div className="h-4 w-full rounded bg-white/5" />
                    <div className="h-4 w-3/4 rounded bg-white/5" />
                    <div className="flex gap-2 mt-auto">
                      <div className="flex-1 h-8 rounded-lg bg-white/10" />
                      <div className="flex-1 h-8 rounded-lg border border-white/10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet Mockup */}
              <div className="absolute -bottom-6 -left-6 w-[200px] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/40 bg-[#050505] hidden md:block">
                <div className="aspect-[4/3] bg-[#0a0a0c] p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ffb800]" />
                    <div className="h-2 w-12 rounded-full bg-white/10" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-16 rounded-lg bg-white/5" />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="h-2 w-full rounded bg-white/10" />
                      <div className="h-2 w-2/3 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-16 rounded-lg bg-white/5" />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="h-2 w-full rounded bg-white/10" />
                      <div className="h-2 w-2/3 rounded bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="absolute -top-4 -right-4 w-[140px] rounded-[1.5rem] border border-white/10 overflow-hidden shadow-xl shadow-black/40 bg-[#050505] hidden sm:block">
                <div className="h-5 bg-[#111] flex items-center justify-center gap-2 border-b border-white/5">
                  <div className="w-12 h-1.5 rounded-full bg-[#222]" />
                </div>
                <div className="aspect-[9/16] bg-[#0a0a0c] p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffb800]" />
                    <div className="flex-1" />
                    <div className="w-4 h-4 rounded bg-white/10" />
                  </div>
                  <div className="h-2 w-3/4 rounded bg-white/10" />
                  <div className="w-full h-16 rounded-lg bg-gradient-to-b from-[#ffb800]/10 to-transparent border border-[#ffb800]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#ffb800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  </div>
                  <div className="flex gap-1.5 mt-auto">
                    <div className="flex-1 h-6 rounded-md bg-white/10" />
                    <div className="flex-1 h-6 rounded-md border border-white/10" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sample Products Section */}
        <section className="py-16">
          <header className="mb-16 text-center">
            <h2 className="text-5xl font-black mb-4 tracking-[-0.04em]">Explore the <span className="text-[#444]">Models</span></h2>
            <p className="text-muted text-lg max-w-[600px] mx-auto">A sneak peek into the cognitive frameworks available.</p>
          </header>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
            {sampleProducts.map((module, idx) => (
              <motion.div initial={{ opacity: 0, y: 5 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} key={module.id}>
                <ModuleCard module={module} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/models" className="inline-flex items-center gap-2 bg-transparent border border-[#222] text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/5 transition-all">
              View All Frameworks <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Browse by Collection Section */}
        <section className="py-16">
          <header className="mb-12 text-center">
            <h2 className="text-5xl font-black mb-4 tracking-[-0.04em]">Browse by <span className="text-[#444]">Collection</span></h2>
            <p className="text-muted text-lg max-w-[600px] mx-auto">Explore frameworks organized by focus area.</p>
          </header>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {collections.sort((a, b) => b.count - a.count).slice(0, 8).map((collection, idx) => {
              const meta = categoryMeta[collection.name] || { icon: Library, desc: "Explore this collection" };
              const Icon = meta.icon;
              return (
                <motion.div
                  key={collection.name}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#080808] border border-white/5 rounded-2xl p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-white/10"
                  whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/10 text-orange-500">
                      <Icon size={24} />
                    </div>
                    <span className="text-[0.75rem] font-bold text-[#444] bg-white/5 px-3 py-1 rounded-full">
                      {collection.count} {collection.count === 1 ? 'theory' : 'theories'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black mb-2 text-white">{collection.name.charAt(0).toUpperCase() + collection.name.slice(1).replace(/-/g, ' ')}</h3>
                  <p className="text-[0.875rem] text-[#666] leading-relaxed">{meta.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/collection" className="inline-flex items-center gap-2 bg-transparent border border-[#222] text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/5 transition-all">
              View All Collections <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <header className="mb-16 text-center">
            <h2 className="text-5xl font-black mb-4 tracking-[-0.04em]">How It <span className="text-[#444]">Works</span></h2>
            <p className="text-muted text-lg max-w-[600px] mx-auto">Transform your thinking in three simple steps.</p>
          </header>

          <div className="grid grid-cols-3 gap-8 relative">
            <div className="absolute top-10 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

            {[
              { step: '01', title: 'Explore', desc: 'Browse an expansive library of mental models, filter by category, and discover your daily free theory.', icon: Network, color: '#a78bfa' },
              { step: '02', title: 'Learn', desc: 'Read with immersive TTS narration, highlight key passages, and track your progress automatically.', icon: BookOpen, color: '#fb923c' },
              { step: '03', title: 'Master', desc: 'Build action protocols, reflect with guided prompts, quiz yourself, and visualize connections in your knowledge graph.', icon: Zap, color: '#2dd4bf' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center relative z-10"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, color: item.color }}>
                  <item.icon size={32} />
                </div>
                <div className="text-[0.625rem] font-bold tracking-[0.1em] mb-3" style={{ color: item.color }}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-black mb-3 text-white">
                  {item.title}
                </h3>
                <p className="text-[0.9375rem] text-[#666] leading-relaxed max-w-[280px] mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Knowledge Graph Section */}
        <section className="py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-[1fr_1.5fr] gap-12 items-center">
              <div>
                <h2 className="text-5xl font-black mb-6 leading-[1.1]">
                  Your Mind, <br/><span className="text-[#444]">Visualized.</span>
                </h2>
                <p className="text-muted text-lg mb-8 leading-relaxed">
                  Every framework you master becomes a living node in your personal thought universe. Watch your understanding deepen as ideas connect, overlap, and compound into something bigger.
                </p>
                <div className="flex gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-white font-bold text-xl">14+</div>
                    <div className="text-[#555] text-[0.75rem] uppercase">Frameworks</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-white font-bold text-xl">84%</div>
                    <div className="text-[#555] text-[0.75rem] uppercase">Knowledge Retained</div>
                  </div>
                </div>
              </div>

              <div className="h-[600px] bg-[#050505] rounded-[32px] overflow-hidden relative border border-white/5 shadow-2xl shadow-black/50">
                <KnowledgeGraph />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 overflow-hidden">
          <header className="mb-12 text-center">
            <h2 className="text-5xl font-black mb-4 tracking-[-0.04em]">What Learners <span className="text-[#444]">Say</span></h2>
            <p className="text-muted text-lg max-w-[600px] mx-auto">Join thousands who have transformed their thinking.</p>
          </header>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-[100px] bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[100px] bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

            <Marquee pauseOnHover speed={50} className="mb-6">
              {[
                { name: "Sarah Chen", role: "Product Manager at Stripe", text: "1section has completely changed how I approach problem-solving. The mental models are incredibly practical.", color: '#a78bfa' },
                { name: "Marcus Webb", role: "Startup Founder", text: "I finally understand the frameworks that took years to learn. The interactive path makes it stick.", color: '#fb923c' },
                { name: "Elena Rodriguez", role: "Software Engineer at Google", text: "The knowledge graph feature is brilliant. It shows how everything connects.", color: '#2dd4bf' },
                { name: "James Liu", role: "Strategy Consultant", text: "My clients are amazed at how quickly I break down complex problems now.", color: '#fbbf24' },
                { name: "Priya Sharma", role: "Head of Design at Figma", text: "Finally, a platform that makes cognitive frameworks actually fun to learn.", color: '#f472b6' },
                { name: "David Park", role: "Serial Entrepreneur", text: "Worth every penny. The lifetime access was the best investment I made this year.", color: '#38bdf8' },
              ].map((testimonial, idx) => (
                <div key={idx} className="min-w-[360px] max-w-[360px] bg-[#080808] border border-white/5 rounded-2xl p-8 flex flex-col transition-all duration-300 hover:border-white/10 hover:-translate-y-1 ml-6">
                  <Quote size={24} className="text-[#222] mb-4" />
                  <p className="text-base text-[#888] leading-relaxed mb-6 flex-grow">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4 border-t border-white/5 pt-5">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[0.875rem] flex-shrink-0" style={{ background: `${testimonial.color}15`, color: testimonial.color }}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-white text-[0.9375rem]">{testimonial.name}</div>
                      <div className="text-[0.75rem] text-[#555]">{testimonial.role}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#ffb800" color="#ffb800" />)}
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>

            <Marquee direction="right" pauseOnHover speed={50}>
              {[
                { name: "Aisha Mohammed", role: "VP of Marketing", text: "The collection feature helps me revisit frameworks exactly when I need them.", color: '#a3e635' },
                { name: "Thomas Berg", role: "CFO at TechCorp", text: "My decision-making improved dramatically after just 2 weeks.", color: '#60a5fa' },
                { name: "Yuki Tanaka", role: "Research Scientist", text: "Best tool for building systematic thinking I've ever used.", color: '#f9a8d4' },
                { name: "Alex Rivera", role: "Engineering Lead", text: "The TTS feature is a game changer for my commute learning.", color: '#34d399' },
              ].map((testimonial, idx) => (
                <div key={idx} className="min-w-[360px] max-w-[360px] bg-[#080808] border border-white/5 rounded-2xl p-8 flex flex-col transition-all duration-300 hover:border-white/10 hover:-translate-y-1 ml-6">
                  <Quote size={24} className="text-[#222] mb-4" />
                  <p className="text-base text-[#888] leading-relaxed mb-6 flex-grow">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4 border-t border-white/5 pt-5">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[0.875rem] flex-shrink-0" style={{ background: `${testimonial.color}15`, color: testimonial.color }}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-white text-[0.9375rem]">{testimonial.name}</div>
                      <div className="text-[0.75rem] text-[#555]">{testimonial.role}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#ffb800" color="#ffb800" />)}
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32">
          <header className="mb-16 text-center">
            <div className="inline-flex items-center gap-1.5 text-[#ffb800] bg-[#ffb8001a] px-4 py-2 rounded-full mb-6">
              <Crown size={14} />
              <span className="text-[0.75rem] font-bold uppercase tracking-wider">{user && user.subscriptionStatus !== "FREE" ? "Your Plan" : "Upgrade Your Journey"}</span>
            </div>
            <h2 className="text-6xl font-black mb-4 tracking-[-0.04em]">Invest in your <span className="text-white">Mind</span></h2>
            <p className="text-muted text-xl max-w-[600px] mx-auto">{user && user.subscriptionStatus !== "FREE" ? "You're already subscribed. Manage your plan below." : "Choose a plan that fits your goals. Cancel anytime."}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {(() => {
              const planOrder = ["Free", "1 Month", "1 Year", "Lifetime"];
              const statusToPlan: Record<string, string> = { FREE: "Free", MONTHLY: "1 Month", YEARLY: "1 Year", LIFETIME: "Lifetime" };
              const currentPlanName = user ? statusToPlan[user.subscriptionStatus || "FREE"] : "Free";
              const currentIdx = planOrder.indexOf(currentPlanName);
              return plans.filter(p => !user || user.subscriptionStatus === "FREE" || planOrder.indexOf(p.name) >= currentIdx);
            })().map((plan, idx) => {
              const Icon = plan.icon;
              const planToStatus: Record<string, string> = { "1 Month": "MONTHLY", "1 Year": "YEARLY", Lifetime: "LIFETIME" };
              const isCurrentPlan = user && planToStatus[plan.name] === user.subscriptionStatus;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative flex flex-col bg-[#080808] border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 w-[280px] ${isCurrentPlan ? 'border-[#00ff80] shadow-lg shadow-[#00ff800d]' : plan.popular ? 'bg-gradient-to-b from-[#111] to-[#050505] border-[#ffb8004d] shadow-lg shadow-[#ffb8000d] scale-[1.02] z-10 hover:scale-[1.02]' : 'border-white/5'}`}
                >
                  {plan.popular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ffb800] to-[#ff8a00] text-black text-[0.625rem] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Popular
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00ff80] to-[#00cc66] text-black text-[0.625rem] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Current Plan
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6" style={{ color: plan.color }}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                    <p className="text-[0.875rem] text-[#666] leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="mb-10 flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const planPrices: Record<string, number> = { "1 Month": 10, "1 Year": 50, Lifetime: 100 };
                        const planNameKey = user ? ({ FREE: "Free", MONTHLY: "1 Month", YEARLY: "1 Year", LIFETIME: "Lifetime" } as Record<string, string>)[user.subscriptionStatus || "FREE"] : "Free";
                        const currentPrice = planPrices[planNameKey] || 0;
                        const planPrice = planPrices[plan.name] || 0;
                        const upgradePrice = planPrice - currentPrice;
                        const isUpgrade = user && user.subscriptionStatus !== "FREE" && upgradePrice > 0;
                        return (
                          <>
                            {isUpgrade && <span className="text-2xl font-black text-[#444] line-through tracking-[-0.05em]">{plan.price}</span>}
                            <span className="text-5xl font-black text-white tracking-[-0.05em]">{isUpgrade ? `$${upgradePrice}` : plan.price}</span>
                            {isUpgrade && <span className="bg-[#ffb8001a] text-[#ffb800] border border-[#ffb80033] px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider whitespace-nowrap">Save ${currentPrice}</span>}
                          </>
                        );
                      })()}
                      {plan.discount && !(user && user.subscriptionStatus !== "FREE") && <span className="bg-[#00ff801a] text-[#00ff80] border border-[#00ff8033] px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider">{plan.discount}</span>}
                    </div>
                    <span className="text-[0.875rem] text-[#555] font-semibold">{(() => {
                      const planPrices: Record<string, number> = { "1 Month": 10, "1 Year": 50, Lifetime: 100 };
                      const pn = user ? ({ FREE: "Free", MONTHLY: "1 Month", YEARLY: "1 Year", LIFETIME: "Lifetime" } as Record<string, string>)[user.subscriptionStatus || "FREE"] : "Free";
                      const cp = planPrices[pn] || 0;
                      const pp = planPrices[plan.name] || 0;
                      return user && user.subscriptionStatus !== "FREE" && pp > cp ? "upgrade (one-time)" : plan.period;
                    })()}</span>
                  </div>

                  <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-4 flex-grow">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-[0.875rem] text-[#888] leading-relaxed">
                        <ShieldCheck size={16} className={`${isCurrentPlan ? 'text-[#00ff80]' : plan.popular ? 'text-[#ffb800]' : 'text-white'} opacity-80 flex-shrink-0 mt-0.5`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <div className="w-full py-4 rounded-xl text-[0.875rem] font-bold text-center bg-[#00ff801a] text-[#00ff80] border border-[#00ff8033]">
                      Active
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (plan.name === "Free") {
                          router.push("/login");
                          return;
                        }
                        const planTypes: Record<string, "MONTHLY" | "YEARLY" | "LIFETIME"> = {
                          "1 Month": "MONTHLY",
                          "1 Year": "YEARLY",
                          Lifetime: "LIFETIME",
                        };
                        const mapped = planTypes[plan.name];
                        if (mapped) handleSubscribe(mapped);
                      }}
                      disabled={subscribing !== null}
                      className={`w-full py-4 border-none rounded-xl text-[0.875rem] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${plan.popular ? 'bg-white text-black' : 'bg-white/5 text-white'}`}
                    >
                      {subscribing ? "Redirecting..." : user && user.subscriptionStatus !== "FREE" ? "Upgrade" : plan.buttonText}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <header className="mb-16 text-center">
            <h2 className="text-5xl font-black mb-4 tracking-[-0.04em]">Frequently Asked <span className="text-[#444]">Questions</span></h2>
            <p className="text-muted text-lg max-w-[600px] mx-auto">Everything you need to know about 1section.</p>
          </header>

          <div className="max-w-[800px] mx-auto flex flex-col gap-4">
            {[
              { id: "diff", q: "What makes 1section different from other learning platforms?", a: "1section focuses on mental models and cognitive frameworks rather than just information. Our interactive knowledge graph shows how concepts connect, and the implementation paths help you actually apply what you learn." },
              { id: "free", q: "How does the daily free theory work?", a: "Every 24 hours, we unlock a new professional framework for free. This gives you a taste of our premium content and helps you build a learning habit without any commitment." },
              { id: "offline", q: "Can I access content offline?", a: "Yes! With our 1 Year and Lifetime plans, you can download theories and listen to them offline. Perfect for commute learning or areas with limited connectivity." },
              { id: "lifetime", q: "What's included in the lifetime access?", a: "Lifetime access includes all current and future theories, the complete knowledge graph, offline downloads, completion certificates, and free digital pocketbooks we release over time." },
              { id: "graph", q: "How does the knowledge graph work?", a: "As you progress through theories, they appear in your personal knowledge graph showing how different mental models connect. This helps you see the bigger picture and understand relationships between concepts." },
              { id: "refund", q: "Is there a refund policy?", a: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied within the first 30 days, just reach out and we'll issue a full refund, no questions asked." },
            ].map((faq, idx) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 2.5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className={`w-full p-6 bg-[#080808] border border-white/5 rounded-xl flex items-center justify-between cursor-pointer text-left transition-all duration-200 ${openFaq === faq.id ? 'bg-white/5' : ''}`}
                >
                  <span className="text-base font-bold text-white pr-4">{faq.q}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${openFaq === faq.id ? 'bg-white/10' : 'bg-white/5'}`}>
                    <div className={`w-2.5 h-2.5 border-r-2 border-b-2 border-[#888] ${openFaq === faq.id ? 'rotate-[-135deg] mt-[-4px]' : 'rotate-45'}`} />
                  </div>
                </button>
                {openFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 bg-white/5 border border-white/5 border-t-0 rounded-b-xl -mt-px"
                  >
                    <p className="text-[0.9375rem] text-[#666] leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
