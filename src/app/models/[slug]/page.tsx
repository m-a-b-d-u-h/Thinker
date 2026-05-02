"use client";

import { modules } from "@/lib/dummy-data";
import { notFound } from "next/navigation";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Play, Square, ChevronUp, Volume2, FastForward, Settings2, ArrowRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showVoiceList, setShowVoiceList] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const module = modules.find((m) => m.slug === slug);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis;
  }
  const synth = synthRef.current;

  const unifiedCleanText = useMemo(() => {
    if (!module) return "";
    const cleanBody = module.content.replace(/[#*`~_]/g, ' ');
    return `${module.title}. ${module.description}. ${cleanBody}`;
  }, [module]);

  const durationInfo = useMemo(() => {
    const words = unifiedCleanText.split(/\s+/).length;
    const wordsPerSecond = 2.5 * rate;
    const totalSeconds = Math.ceil(words / wordsPerSecond);

    const formatTime = (s: number) => {
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      totalSeconds,
      totalFormatted: formatTime(totalSeconds),
      currentFormatted: (p: number) => formatTime(Math.floor((p / 100) * totalSeconds))
    };
  }, [unifiedCleanText, rate]);

  const currentTextRef = useRef(unifiedCleanText);
  const currentVolumeRef = useRef(volume);
  const currentRateRef = useRef(rate);
  const currentVoiceRef = useRef(selectedVoice);
  const currentCharIndexRef = useRef(currentCharIndex);
  const currentProgressRef = useRef(progress);

  currentTextRef.current = unifiedCleanText;
  currentVolumeRef.current = volume;
  currentRateRef.current = rate;
  currentVoiceRef.current = selectedVoice;
  currentCharIndexRef.current = currentCharIndex;
  currentProgressRef.current = progress;

  const contentBlocks = useMemo(() => {
    if (!module) return [];
    const blocks: any[] = [];

    blocks.push({ type: 'h1', segments: [{ text: module.title, start: 0, end: module.title.length }], start: 0, end: module.title.length });

    const descStart = module.title.length + 2;
    blocks.push({ type: 'p', isDesc: true, segments: [{ text: module.description, start: descStart, end: descStart + module.description.length }], start: descStart, end: descStart + module.description.length });

    const bodyStart = descStart + module.description.length + 2;
    const lines = module.content.split('\n');
    let currentOffset = bodyStart;

    lines.forEach((line) => {
      if (line.trim().length === 0) { currentOffset += line.length + 1; return; }
      let type = 'p';
      if (line.startsWith('# ')) type = 'h1';
      else if (line.startsWith('## ')) type = 'h2';
      else if (line.startsWith('### ')) type = 'h3';
      else if (line.startsWith('- ')) type = 'li';
      else if (line.match(/^\d+\. /)) type = 'li';

      const segments: any[] = [];
      const regex = /(\*\*|\*|__|_|`|#+\s|-\s|\d+\.\s)/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          const text = line.substring(lastIndex, match.index);
          segments.push({ text, isSymbol: false, start: currentOffset + lastIndex, end: currentOffset + match.index });
        }
        segments.push({ text: match[0], isSymbol: true, start: currentOffset + lastIndex, end: currentOffset + regex.lastIndex });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        const text = line.substring(lastIndex);
        segments.push({ text, isSymbol: false, start: currentOffset + lastIndex, end: currentOffset + line.length });
      }
      blocks.push({ type, segments, start: currentOffset, end: currentOffset + line.length });
      currentOffset += line.length + 1;
    });
    return blocks;
  }, [module]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      const filteredVoices = v
        .filter(voice => {
          const isEnglish = voice.lang.startsWith('en');
          const isRobot = /David|Mark|Zira/i.test(voice.name);
          return isEnglish && !isRobot;
        })
        .map(voice => ({
          original: voice,
          name: voice.name,
          displayName: voice.name
            .replace(/Microsoft |Google |Apple |Natural |Online |Multilingual /gi, '')
            .split(' ')[0]
            .trim()
        }));

      setVoices(filteredVoices);
      const natural = filteredVoices.find(v => v.name.includes('Natural') || v.name.includes('Google'));
      if (natural) setSelectedVoice(natural.name);
      else if (filteredVoices.length > 0) setSelectedVoice(filteredVoices[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startSpeech = (startIndex: number, text: string, vol: number, spd: number, voiceName: string) => {
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text.slice(startIndex));
    utterance.lang = 'en-US';
    const voiceWrapper = voices.find((v: any) => v.name === voiceName);
    if (voiceWrapper) utterance.voice = voiceWrapper.original;
    utterance.volume = vol;
    utterance.rate = spd;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const globalIdx = startIndex + event.charIndex;
        setCurrentCharIndex(globalIdx);
        setProgress((globalIdx / text.length) * 100);
      }
    };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    synth.speak(utterance);
    setIsPlaying(true);
  };

  const updateSpeechSettings = () => {
    if (!isPlaying) return;
    const currentIndex = Math.floor((currentProgressRef.current / 100) * currentTextRef.current.length);
    startSpeech(currentIndex, currentTextRef.current, currentVolumeRef.current, currentRateRef.current, currentVoiceRef.current);
  };

  const updateRate = (newRate: number) => {
    setRate(newRate);
    currentRateRef.current = newRate;
    if (isPlaying) {
      const currentIndex = Math.floor((currentProgressRef.current / 100) * currentTextRef.current.length);
      startSpeech(currentIndex, currentTextRef.current, currentVolumeRef.current, newRate, currentVoiceRef.current);
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    currentVolumeRef.current = newVolume;
    if (isPlaying) {
      const currentIndex = Math.floor((currentProgressRef.current / 100) * currentTextRef.current.length);
      startSpeech(currentIndex, currentTextRef.current, newVolume, currentRateRef.current, currentVoiceRef.current);
    }
  };

  const updateVoice = (newVoice: string) => {
    setSelectedVoice(newVoice);
    currentVoiceRef.current = newVoice;
    if (isPlaying) {
      const currentIndex = Math.floor((currentProgressRef.current / 100) * currentTextRef.current.length);
      startSpeech(currentIndex, currentTextRef.current, currentVolumeRef.current, currentRateRef.current, newVoice);
    }
  };

  const toggleSpeech = () => {
    if (isPlaying) { synth?.cancel(); setIsPlaying(false); }
    else { startSpeech(Math.floor((progress / 100) * unifiedCleanText.length), unifiedCleanText, volume, rate, selectedVoice); }
  };

  if (!module) notFound();

  const getBlockText = (block: any) => {
    return block.segments
      .filter((s: any) => !s.isSymbol)
      .map((s: any) => s.text)
      .join('');
  };

  const renderBlockContent = (block: any) => {
    const text = getBlockText(block);
    let globalOffset = block.start;

    const nonSymbolSegments = block.segments.filter((s: any) => !s.isSymbol);
    if (nonSymbolSegments.length > 0) {
      globalOffset = nonSymbolSegments[0].start;
    }

    const words = text.split(/(\s+)/);
    let localIndex = 0;

    return words.map((word: string, j: number) => {
      if (/^\s+$/.test(word) || word === '') {
        localIndex += word.length;
        return <span key={j}>{word}</span>;
      }

      const start = globalOffset + localIndex;
      const end = start + word.length;
      localIndex += word.length;

      const isWordHighlighted = isPlaying && currentCharIndex >= start && currentCharIndex < end;

      return (
        <span key={j} style={{
          color: isWordHighlighted ? '#000' : 'inherit',
          backgroundColor: isWordHighlighted ? '#fff' : 'transparent',
          borderRadius: '2px',
          transition: 'background-color 0.08s',
          padding: isWordHighlighted ? '0 1px' : '0',
        }}>{word}</span>
      );
    });
  };

  const HighlightBlock = ({ block }: { block: any }) => {
    const headingText = getBlockText(block);
    const headingId = headingText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (block.type === 'li') {
      return (
        <li key={block.start} className="text-[1.0625rem] text-[#888] mb-3 ml-6 list-disc">
          {renderBlockContent(block)}
        </li>
      );
    }

    if (block.type === 'h1') {
      return (
        <h1 key={block.start} className="text-5xl font-black text-white mb-4 tracking-[-0.03em] leading-[1.1]">
          {renderBlockContent(block)}
        </h1>
      );
    }

    if (block.type === 'h2') {
      return (
        <h2 key={block.start} id={headingId} className="text-3xl font-bold text-white mb-6 mt-12 pb-3 border-b border-[#1a1a1a] scroll-mt-[100px]">
          {renderBlockContent(block)}
        </h2>
      );
    }

    if (block.type === 'h3') {
      return (
        <h3 key={block.start} id={headingId} className="text-xl text-[#999] mb-4 mt-8 scroll-mt-[100px]">
          {renderBlockContent(block)}
        </h3>
      );
    }

    return (
      <p key={block.start} className={`${block.isDesc ? 'text-xl text-[#666] italic mb-12 leading-relaxed' : 'text-lg text-[#888] mb-6 leading-[1.8]'}`}>
        {renderBlockContent(block)}
      </p>
    );
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 pb-[160px] pt-8">
      <div className="grid grid-cols-[1fr_320px] gap-8 items-start">
        <article className="max-w-[65ch] mx-auto">
          <header className="mb-8">
            <span className="badge" style={{ background: `var(--c-${module.category})`, color: '#000', marginBottom: '1.5rem' }}>{module.category}</span>
          </header>
          {contentBlocks.map((block, idx) => (
            <HighlightBlock key={idx} block={block} />
          ))}
        </article>

        <div className="sticky top-[100px] pl-6 border-l border-[#333]">
          <div className="text-[0.6875rem] font-semibold text-[#444] uppercase tracking-[0.1em] mb-6">Contents</div>
          <nav className="flex flex-col gap-3">
            {contentBlocks
              .filter(b => b.type === 'h2' || b.type === 'h3')
              .map((block: any, idx: number) => (
                <a
                  key={idx}
                  href={`#${getBlockText(block).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                  className={`no-underline ${block.type === 'h3' ? 'text-[0.8125rem] pl-4' : 'text-[0.875rem]'} ${block.type === 'h3' ? 'font-normal' : 'font-medium'} text-[#666] hover:text-[#ccc] transition-colors`}
                >
                  {getBlockText(block)}
                </a>
              ))}
          </nav>
        </div>
      </div>

      {/* TTS Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050505cc] backdrop-blur-[30px] border-t border-[var(--border)] z-[1000] py-6 shadow-2xl shadow-black/50">
        <div className="mx-auto w-full max-w-[1200px] px-6 flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <span className="text-[0.75rem] text-[#555] min-w-[40px] tabular-nums">
              {durationInfo.currentFormatted(progress)}
            </span>
            <div className="relative flex-grow h-1 bg-[#1a1a1a] rounded-sm">
              <div className="absolute left-0 top-0 h-full bg-white rounded-sm" style={{ width: `${progress}%` }} />
              <input
                type="range" min="0" max="100" value={progress}
                onChange={(e) => {
                  const p = parseInt(e.target.value); setProgress(p);
                }}
                onMouseUp={(e) => { if (isPlaying) startSpeech(Math.floor((parseInt((e.target as HTMLInputElement).value) / 100) * unifiedCleanText.length), unifiedCleanText, volume, rate, selectedVoice); }}
                className="absolute top-[-10px] left-0 w-full h-6 opacity-0 cursor-pointer z-5"
              />
              <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none" style={{ left: `${progress}%` }} />
            </div>
            <span className="text-[0.75rem] text-[#555] min-w-[40px] tabular-nums">
              {durationInfo.totalFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-6 items-center flex-1">
              <div className="relative">
                <button onClick={() => setShowVoiceList(!showVoiceList)} className="bg-transparent border-none text-[#888] flex items-center gap-2 cursor-pointer text-[0.875rem]">
                  <Volume2 size={18} />
                  <span>{selectedVoice ? voices.find(v => v.name === selectedVoice)?.displayName || "Voice" : "Voice"}</span>
                  <ChevronUp size={14} className={`transition-transform duration-300 ${showVoiceList ? '' : 'rotate-180'}`} />
                </button>
                <AnimatePresence>
                  {showVoiceList && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-[150%] left-0 w-[180px] max-h-[250px] overflow-y-auto bg-[#111] border border-[#222] rounded-xl p-2 shadow-2xl shadow-black/80 z-[1001]">
                      {voices.map((voice: any) => (
                        <button key={voice.name} onClick={() => { setShowVoiceList(false); updateVoice(voice.name); }} className={`w-full px-3 py-2 text-left text-[0.8125rem] rounded-lg cursor-pointer ${selectedVoice === voice.name ? 'text-white bg-[#1a1a1a]' : 'text-[#666] hover:bg-[#1a1a1a]'}`}>{voice.displayName}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 text-[#444]">
                <FastForward size={16} />
                <select value={rate} onChange={(e) => updateRate(parseFloat(e.target.value))} className="bg-transparent border-none text-[#888] text-[0.8125rem] cursor-pointer outline-none">
                  <option value="0.8">0.8x</option><option value="1">1.0x</option><option value="1.2">1.2x</option><option value="1.5">1.5x</option>
                </select>
              </div>
            </div>
            <div className="flex gap-6 items-center flex-1 justify-center">
              <button onClick={toggleSpeech} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center border-none cursor-pointer shadow-lg shadow-white/20">
                {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
            </div>
            <div className="flex gap-6 items-center flex-1 justify-end">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-[#444]" />
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => updateVolume(parseFloat(e.target.value))} className="w-[100px] h-0.5 accent-white cursor-pointer" />
              </div>
              <button className="text-[#444] bg-transparent border-none cursor-pointer" onClick={() => setShowSettings(!showSettings)}><Settings2 size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
