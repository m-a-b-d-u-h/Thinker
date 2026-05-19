"use client";

import { notFound } from "next/navigation";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Play, Square, ChevronUp, Volume2, FastForward, Settings2, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { modulesApi } from "@/lib/api/modules";
import { progressApi } from "@/lib/api/progress";
import { useAuth } from "@/lib/auth-context";
import type { Module } from "@/lib/types";

export default function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showVoiceList, setShowVoiceList] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [savedListeningProgress, setSavedListeningProgress] = useState<number | null>(null);
  const [savedReadingProgress, setSavedReadingProgress] = useState<number | null>(null);
  const [showResume, setShowResume] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [recommendations, setRecommendations] = useState<Module[]>([]);
  const listenSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const fetchedSlugRef = useRef("");
  const completedRef = useRef(false);

  useEffect(() => {
    if (fetchedSlugRef.current === slug) return;
    fetchedSlugRef.current = slug;
    modulesApi.getBySlug(slug).then((m) => {
      setModule(m);
      setLoading(false);
      modulesApi.getRecommended(slug).then(setRecommendations).catch(() => {});
    }).catch(() => {
      setLoading(false);
    });
  }, [slug]);

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
    const s = window.speechSynthesis;
    const loadVoices = () => {
      const v = s.getVoices();
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
    s.addEventListener('voiceschanged', loadVoices);
    return () => s.removeEventListener('voiceschanged', loadVoices);
  }, []);

  useEffect(() => {
    if (!module || !user) return;
    progressApi.getBySlug(module.slug).then((saved) => {
      if (!saved) return;
      const completed = saved.listeningProgress >= 100 || saved.readingProgress >= 100;
      setIsCompleted(completed);
      const hasListen = saved.listeningProgress > 0;
      const hasRead = saved.readingProgress > 0;
      if (!hasListen && !hasRead) return;

      completedRef.current = completed;
      if (hasListen) {
        setSavedListeningProgress(saved.listeningProgress);
        setProgress(saved.listeningProgress);
        setCurrentCharIndex(saved.currentCharIndex);
        setRate(saved.audioRate);
      }
      if (hasRead) {
        setSavedReadingProgress(saved.readingProgress);
        if (saved.scrollPosition > 0) {
          setTimeout(() => {
            window.scrollTo({ top: saved.scrollPosition, behavior: "instant" });
          }, 100);
        }
      }
      setShowResume(true);
    }).catch(() => {});
  }, [module, user]);

  const saveProgress = useCallback(async (data: Record<string, any>) => {
    if (!user) return;
    try {
      await progressApi.upsert(slug, data);
    } catch {}
  }, [slug, user]);

  useEffect(() => {
    if (progress > 0 && isPlaying) {
      if (listenSaveTimer.current) clearTimeout(listenSaveTimer.current);
      listenSaveTimer.current = setTimeout(() => {
        saveProgress({
          listeningProgress: progress,
          currentCharIndex,
          audioRate: rate,
        });
      }, 2000);
    }
  }, [progress, isPlaying, slug, currentCharIndex, rate, saveProgress]);

  useEffect(() => {
    const onScroll = () => {
      const article = articleRef.current;
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const scrollY = window.scrollY;
      const scrolled = Math.max(0, scrollY - articleTop);
      const pct = Math.min(100, Math.round((scrolled / articleHeight) * 100));
      if (readSaveTimer.current) clearTimeout(readSaveTimer.current);
      readSaveTimer.current = setTimeout(() => {
        if (completedRef.current) return;
        saveProgress({
          readingProgress: pct,
          scrollPosition: window.scrollY,
        });
      }, 1000);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug, saveProgress]);

  const saveOnLeave = useCallback(() => {
    if (completedRef.current) return;
    const data: Record<string, any> = {};
    if (progress > 0) {
      data.listeningProgress = progress;
      data.currentCharIndex = currentCharIndex;
      data.audioRate = rate;
    }
    const article = articleRef.current;
    if (article) {
      data.scrollPosition = window.scrollY;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const scrollY = window.scrollY;
      const scrolled = Math.max(0, scrollY - articleTop);
      const pct = Math.min(100, Math.round((scrolled / articleHeight) * 100));
      data.readingProgress = pct;
    }
    if (Object.keys(data).length === 0) return;
    saveProgress(data);
  }, [slug, progress, currentCharIndex, rate, saveProgress]);

  useEffect(() => {
    window.addEventListener("beforeunload", saveOnLeave);
    window.addEventListener("pagehide", saveOnLeave);
    return () => {
      window.removeEventListener("beforeunload", saveOnLeave);
      window.removeEventListener("pagehide", saveOnLeave);
      saveOnLeave();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [saveOnLeave]);

  const handleResumeListening = () => {
    setShowResume(false);
    const idx = savedListeningProgress !== null
      ? Math.floor((savedListeningProgress / 100) * unifiedCleanText.length)
      : 0;
    startSpeech(idx, unifiedCleanText, volume, rate, selectedVoice);
  };

  const handleResumeReading = () => {
    setShowResume(false);
    if (savedReadingProgress !== null) {
      progressApi.getBySlug(slug).then((saved) => {
        if (saved && saved.scrollPosition > 0) {
          window.scrollTo({ top: saved.scrollPosition, behavior: "smooth" });
        }
      }).catch(() => {});
    }
  };

  const handleStartOver = async () => {
    setShowResume(false);
    setSavedListeningProgress(null);
    setSavedReadingProgress(null);
    setProgress(0);
    setCurrentCharIndex(0);
    await saveProgress({ listeningProgress: 0, readingProgress: 0, currentCharIndex: 0, scrollPosition: 0 });
  };

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

  const handleMarkComplete = async () => {
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    completedRef.current = newCompleted;
    await saveProgress({
      listeningProgress: newCompleted ? 100 : 0,
      readingProgress: newCompleted ? 100 : 0,
      completed: newCompleted,
    });
    if (newCompleted) {
      setSavedListeningProgress(100);
      setSavedReadingProgress(100);
      setProgress(100);
    } else {
      setSavedListeningProgress(null);
      setSavedReadingProgress(null);
      setProgress(0);
      setShowResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

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
        <article ref={articleRef} className="max-w-[65ch] mx-auto">
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

      {recommendations.length > 0 && (
        <section className="max-w-[65ch] mx-auto mt-20 mb-8">
          <h2 className="text-2xl font-black text-white mb-1 tracking-[-0.03em]">
            What&apos;s Next
          </h2>
          <p className="text-[0.875rem] text-[#666] mb-8">
            More in <span className="text-[#888] font-semibold">{module.category.charAt(0).toUpperCase() + module.category.slice(1).replace(/-/g, ' ')}</span>
          </p>
          <div className="flex flex-col gap-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                href={`/models/${rec.slug}`}
                className="group flex items-start gap-5 bg-[#080808] border border-white/5 rounded-2xl p-5 no-underline transition-all duration-300 hover:bg-[#0a0a0a] hover:border-white/10 hover:-translate-y-0.5"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-white/90 transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-[0.8125rem] text-[#666] leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-[0.75rem] font-semibold text-[#555] group-hover:text-white transition-colors mt-1">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showResume && (savedListeningProgress !== null || savedReadingProgress !== null) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[65ch] mx-auto mb-8 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw size={16} className="text-[#fbbf24]" />
            <span className="text-[0.6875rem] font-bold text-[#fbbf24] uppercase tracking-[0.1em]">
              Resume
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {savedListeningProgress !== null && (
              <div className="bg-[#080808] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Play size={14} className="text-[#888]" />
                  <span className="text-[0.6875rem] font-semibold text-[#888] uppercase tracking-[0.05em]">
                    Listening
                  </span>
                </div>
                <p className="text-2xl font-black text-white mb-1">
                  {Math.round(savedListeningProgress)}%
                </p>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${savedListeningProgress}%` }} />
                </div>
              </div>
            )}
            {savedReadingProgress !== null && (
              <div className="bg-[#080808] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.6875rem] font-semibold text-[#888] uppercase tracking-[0.05em]">
                    Reading
                  </span>
                </div>
                <p className="text-2xl font-black text-white mb-1">
                  {Math.round(savedReadingProgress)}%
                </p>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${savedReadingProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {savedListeningProgress !== null && (
              <button
                onClick={handleResumeListening}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-bold text-[0.8125rem] hover:bg-white/90 transition-all"
              >
                <Play size={14} fill="currentColor" />
                Continue Listening
              </button>
            )}
            {savedReadingProgress !== null && (
              <button
                onClick={handleResumeReading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111] border border-white/10 text-white rounded-lg font-bold text-[0.8125rem] hover:bg-[#1a1a1a] transition-all"
              >
                Continue Reading
              </button>
            )}
            <button
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-white/10 text-[#666] rounded-lg font-semibold text-[0.8125rem] hover:border-white/20 hover:text-white transition-all"
            >
              Start Over
            </button>
          </div>
        </motion.div>
      )}

      <div className="max-w-[65ch] mx-auto mb-8">
        <button
          onClick={handleMarkComplete}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-[0.8125rem] transition-all ${
            isCompleted
              ? "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
              : "bg-[#080808] border border-white/10 text-[#888] hover:border-white/20 hover:text-white"
          }`}
        >
          <CheckCircle2 size={16} />
          {isCompleted ? "Completed" : "Mark as Complete"}
        </button>
      </div>

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
