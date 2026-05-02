"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ReactFlow, { Background, NodeProps, Handle, Position, useReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import React from "react";
import { CheckCircle2, Zap, Crown, ShieldCheck, Infinity, Library, Play, ArrowRight, Sparkles, Network, Clock, BookOpen, Star, Quote } from "lucide-react";
import Marquee from "react-fast-marquee";
import Navbar from "@/components/Navbar";
import { modules } from "@/lib/dummy-data";

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
  const nodes = useMemo(() => [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '' }, style: { width: 12, height: 12, borderRadius: '50%', background: '#fff', border: 'none', boxShadow: '0 0 15px #fff' } },
    { id: '2', position: { x: 100, y: -50 }, data: { label: '' }, style: { width: 8, height: 8, borderRadius: '50%', background: '#fff', border: 'none', opacity: 0.6 } },
    { id: '3', position: { x: -80, y: -100 }, data: { label: '' }, style: { width: 8, height: 8, borderRadius: '50%', background: '#fff', border: 'none', opacity: 0.6 } },
    { id: '4', position: { x: 150, y: 80 }, data: { label: '' }, style: { width: 10, height: 10, borderRadius: '50%', background: '#fff', border: 'none', opacity: 0.8 } },
    { id: '5', position: { x: -120, y: 50 }, data: { label: '' }, style: { width: 6, height: 6, borderRadius: '50%', background: '#fff', border: 'none', opacity: 0.4 } },
  ], []);

  const edges = useMemo(() => [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
    { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
    { id: 'e1-5', source: '1', target: '5', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
  ], []);

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

  const calculateTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const totalSeconds = Math.ceil(words / 2.5);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleProducts = modules.slice(0, 2);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-[1200px] px-6">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col justify-center items-center text-center py-20">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 text-[#ffb800] bg-[#ffb8001a] px-5 py-2 rounded-full mb-8 font-bold uppercase tracking-wider text-[0.75rem] border border-[#ffb80033]">
            <Library size={14} /> The Ultimate Cognitive Library
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[clamp(3.5rem,8vw,6.5rem)] font-black tracking-[-0.04em] leading-[1.1] mb-6">
            Master your <br /> <span className="bg-gradient-to-br from-white to-[#555] bg-clip-text text-transparent">thinking library.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-[#888] max-w-[650px] mx-auto mb-12 leading-relaxed">
            Explore an expansive library of mental models, cognitive tools, and frameworks. Internalize complex concepts through interactive mapping and committed action.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-4 justify-center flex-wrap">
            <Link href="/models" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all">
              Continue Learning
            </Link>
            <Link href="/models" className="inline-flex items-center gap-2 bg-transparent border border-[#222] text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/5 transition-all">
              View Modules
            </Link>
          </motion.div>
        </section>

        {/* Sample Products Section */}
        <section className="py-16">
          <header className="mb-16 text-center">
            <h2 className="text-5xl font-black mb-4 tracking-[-0.04em]">Explore the <span className="text-[#444]">Models</span></h2>
            <p className="text-muted text-lg max-w-[600px] mx-auto">A sneak peek into the cognitive frameworks available.</p>
          </header>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-10">
            {sampleProducts.map((module, idx) => (
              <motion.div initial={{ opacity: 0, y: 5 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} key={module.id}>
                <Link href={`/models/${module.slug}`} className="group flex flex-col bg-[#080808] border border-white/5 rounded-[32px] p-8 transition-all duration-300 hover:bg-[#0a0a0a] hover:border-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60 text-white no-underline h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="badge" style={{ background: `var(--c-${module.category})`, color: '#000', fontSize: '0.625rem', fontWeight: 800 }}>{module.category}</span>
                      <div className="flex items-center gap-1.5 text-[#333]">
                        <Sparkles size={12} />
                        <span className="text-[0.625rem] font-bold uppercase tracking-wider">Theory Engine</span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 leading-[1.2]">{module.title}</h2>
                    <p className="text-base text-[#666] leading-relaxed h-[3em] overflow-hidden">{module.description}</p>
                  </div>

                  {module.nodes && module.nodes.length > 0 ? (
                    <MiniPreview nodes={module.nodes} edges={module.edges || []} />
                  ) : (
                    <div className="h-[260px] bg-white/[0.01] rounded-3xl flex items-center justify-center text-[#222] my-6">
                      <Network size={28} />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-auto">
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2 text-[0.8125rem] font-bold text-white">
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                          <Play size={14} fill="currentColor" />
                        </div>
                        Listen & Learn
                      </div>
                      <div className="flex items-center gap-1.5 text-[#333] text-[0.75rem] font-semibold">
                        <Clock size={14} /> {calculateTime(module.content)}
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-[#222] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
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
            {[
              { name: 'Mindset', desc: 'Develop powerful thinking frameworks', icon: Network, color: 'var(--c-mindset)', count: 12 },
              { name: 'Clarity', desc: 'Cut through complexity with precision', icon: Sparkles, color: 'var(--c-clarity)', count: 8 },
              { name: 'Habit', desc: 'Build systems that stick', icon: ShieldCheck, color: 'var(--c-habit)', count: 10 },
              { name: 'Action', desc: 'Convert knowledge into results', icon: Zap, color: 'var(--c-action)', count: 15 },
              { name: 'Strategy', desc: 'Plan for long-term success', icon: Crown, color: '#f472b6', count: 9 },
              { name: 'Decision', desc: 'Make better choices faster', icon: CheckCircle2, color: '#38bdf8', count: 11 },
              { name: 'Communication', desc: 'Express ideas effectively', icon: Clock, color: '#a3e635', count: 7 },
              { name: 'Relationships', desc: 'Build meaningful connections', icon: Library, color: '#fb923c', count: 6 },
            ].map((collection, idx) => (
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
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${collection.color}15`, color: collection.color }}>
                    <collection.icon size={24} />
                  </div>
                  <span className="text-[0.75rem] font-bold text-[#444] bg-white/5 px-3 py-1 rounded-full">
                    {collection.count} theories
                  </span>
                </div>
                <h3 className="text-lg font-black mb-2 text-white">{collection.name}</h3>
                <p className="text-[0.875rem] text-[#666] leading-relaxed">{collection.desc}</p>
              </motion.div>
            ))}
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
              { step: '01', title: 'Explore', desc: 'Browse through mental models and frameworks across different collections.', icon: Network, color: '#a78bfa' },
              { step: '02', title: 'Learn', desc: 'Listen to theories with TTS, highlight key insights, and build understanding.', icon: BookOpen, color: '#fb923c' },
              { step: '03', title: 'Apply', desc: 'Take action with implementation paths and track your progress in the knowledge graph.', icon: Zap, color: '#2dd4bf' },
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

        {/* Obsidian-style Graph Section */}
        <section className="py-16">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-black mb-6 leading-[1.1]">
                Your Mind, <br/><span className="text-[#444]">Visualized.</span>
              </h2>
              <p className="text-muted text-lg mb-8">
                1section tracks your mental growth in a connected Obsidian-style knowledge graph. See how different mental models overlap and build upon each other.
              </p>
              <div className="flex gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white font-bold text-xl">14+</div>
                  <div className="text-[#555] text-[0.75rem] uppercase">Active Models</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white font-bold text-xl">84%</div>
                  <div className="text-[#555] text-[0.75rem] uppercase">Retention Rate</div>
                </div>
              </div>
            </div>

            <div className="h-[500px] bg-[#050505] rounded-[32px] overflow-hidden relative border border-white/5 shadow-2xl shadow-black/50">
              <ReactFlow nodes={nodes} edges={edges} proOptions={{ hideAttribution: true }} fitView zoomOnScroll={false} panOnDrag={false} style={{ pointerEvents: 'none' }}>
                <Background color="#111" gap={30} size={1} />
              </ReactFlow>
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] pointer-events-none" />
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
              <span className="text-[0.75rem] font-bold uppercase tracking-wider">Upgrade Your Journey</span>
            </div>
            <h2 className="text-6xl font-black mb-4 tracking-[-0.04em]">Invest in your <span className="text-white">Mind</span></h2>
            <p className="text-muted text-xl max-w-[600px] mx-auto">Choose a plan that fits your goals. Cancel anytime.</p>
          </header>

          <div className="grid grid-cols-4 gap-6 items-stretch">
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex flex-col bg-[#080808] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 ${plan.popular ? 'bg-gradient-to-b from-[#111] to-[#050505] border-[#ffb8004d] shadow-lg shadow-[#ffb8000d] scale-[1.02] z-10 hover:scale-[1.02]' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ffb800] to-[#ff8a00] text-black text-[0.625rem] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Popular
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
                      <span className="text-5xl font-black text-white tracking-[-0.05em]">{plan.price}</span>
                      {plan.discount && <span className="bg-[#00ff801a] text-[#00ff80] border border-[#00ff8033] px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider">{plan.discount}</span>}
                    </div>
                    <span className="text-[0.875rem] text-[#555] font-semibold">{plan.period}</span>
                  </div>

                  <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-4 flex-grow">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-[0.875rem] text-[#888] leading-relaxed">
                        <ShieldCheck size={16} className={`${plan.popular ? 'text-[#ffb800]' : 'text-white'} opacity-80 flex-shrink-0 mt-0.5`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-4 border-none rounded-xl text-[0.875rem] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02] ${plan.popular ? 'bg-white text-black' : 'bg-white/5 text-white'}`}>
                    {plan.buttonText}
                  </button>
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
              { q: "What makes 1section different from other learning platforms?", a: "1section focuses on mental models and cognitive frameworks rather than just information. Our interactive knowledge graph shows how concepts connect, and the implementation paths help you actually apply what you learn." },
              { q: "How does the daily free theory work?", a: "Every 24 hours, we unlock a new professional framework for free. This gives you a taste of our premium content and helps you build a learning habit without any commitment." },
              { q: "Can I access content offline?", a: "Yes! With our 1 Year and Lifetime plans, you can download theories and listen to them offline. Perfect for commute learning or areas with limited connectivity." },
              { q: "What's included in the lifetime access?", a: "Lifetime access includes all current and future theories, the complete knowledge graph, offline downloads, completion certificates, and free digital pocketbooks we release over time." },
              { q: "How does the knowledge graph work?", a: "As you progress through theories, they appear in your personal knowledge graph showing how different mental models connect. This helps you see the bigger picture and understand relationships between concepts." },
              { q: "Is there a refund policy?", a: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied within the first 30 days, just reach out and we'll issue a full refund, no questions asked." },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 2.5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className={`w-full p-6 bg-[#080808] border border-white/5 rounded-xl flex items-center justify-between cursor-pointer text-left transition-all duration-200 ${openFaq === idx ? 'bg-white/5' : ''}`}
                >
                  <span className="text-base font-bold text-white pr-4">{faq.q}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${openFaq === idx ? 'bg-white/10' : 'bg-white/5'}`}>
                    <div className={`w-2.5 h-2.5 border-r-2 border-b-2 border-[#888] ${openFaq === idx ? 'rotate-[-135deg] mt-[-4px]' : 'rotate-45'}`} />
                  </div>
                </button>
                {openFaq === idx && (
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
