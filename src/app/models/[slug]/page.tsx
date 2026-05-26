"use client";

import { notFound } from "next/navigation";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { Play, ArrowRight, RotateCcw, CheckCircle2, Highlighter, X, Crown, Lock, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { progressApi } from "@/lib/api/progress";
import { reviewsApi } from "@/lib/api/reviews";
import { useAuth } from "@/lib/auth-context";
import { useModule, useRecommended, useProgress, useCreateHighlight } from "@/lib/query-hooks";
import ModuleFloatingBar from "@/components/ModuleFloatingBar";
import TableOfContents from "@/components/TableOfContents";
import { useReading, fontSizeMap, lineHeightMap, fontFamilyMap, marginMap } from "@/contexts/ReadingContext";
import { favoritesApi } from "@/lib/api/favorites";

export default function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { user } = useAuth();
  const { data: module, isLoading } = useModule(slug);
  const { data: recommendations = [] } = useRecommended(slug);
  const { data: savedProgress } = useProgress(slug);

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
  const listenSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [note, setNote] = useState("");
  const createHighlight = useCreateHighlight();

  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { readingPrefs, tocOpen, setTocOpen } = useReading();

  const { fontSize, fontFamily, lineHeight, margin } = readingPrefs;

  const handleSubmitFeedback = async () => {
    if (!rating || feedbackSubmitting) return;
    setFeedbackSubmitting(true);
    setFeedbackError(false);
    try {
      await reviewsApi.create({ moduleSlug: slug, rating, comment: feedback || undefined });
      setFeedbackSubmitted(true);
    } catch {
      setFeedbackError(true);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const synthRef = useRef<SpeechSynthesis | null>(null);
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis;
  }
  const synth = synthRef.current;

  const unifiedCleanText = useMemo(() => {
    if (!module) return "";
    const cleanBody = (module.content || '').replace(/[#*`~_]/g, ' ');
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
    const lines = (module.content || '').split('\n');
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
    if (!module || !user || !savedProgress) return;
    const completed = savedProgress.listeningProgress >= 100 || savedProgress.readingProgress >= 100;
    setIsCompleted(completed);
    const hasListen = savedProgress.listeningProgress > 0;
    const hasRead = savedProgress.readingProgress > 0;
    if (!hasListen && !hasRead) return;

    completedRef.current = completed;
    if (hasListen) {
      setSavedListeningProgress(savedProgress.listeningProgress);
      setProgress(savedProgress.listeningProgress);
      setCurrentCharIndex(savedProgress.currentCharIndex);
      setRate(savedProgress.audioRate);
    }
    if (hasRead) {
      setSavedReadingProgress(savedProgress.readingProgress);
      if (savedProgress.scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo({ top: savedProgress.scrollPosition, behavior: "instant" });
        }, 100);
      }
    }
    setShowResume(true);
  }, [module, user, savedProgress]);

  useEffect(() => {
    if (!module) return;
    favoritesApi.check(slug).then((res) => setIsFavorited(res.isFavorited)).catch(() => {});
  }, [module, slug]);

  useEffect(() => {
    if (!module) return;
    const params = new URLSearchParams(window.location.search);
    const highlightText = params.get("highlight");
    if (!highlightText) return;

    const decoded = decodeURIComponent(highlightText);
    const scrollToText = () => {
      const article = document.querySelector("article");
      if (!article) return;

      const nodes: { node: Text; start: number; end: number }[] = [];
      let charIndex = 0;
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
      let n: Text | null;
      while (n = walker.nextNode() as Text | null) {
        nodes.push({ node: n, start: charIndex, end: charIndex + n.textContent!.length });
        charIndex += n.textContent!.length;
      }

      const totalText = nodes.map(n => n.node.textContent).join("");
      const pos = totalText.indexOf(decoded);
      if (pos < 0) return;

      let targetNode: Text | null = null;
      let offsetStart = 0;
      for (const entry of nodes) {
        if (pos >= entry.start && pos < entry.end) {
          targetNode = entry.node;
          offsetStart = pos - entry.start;
          break;
        }
      }
      if (!targetNode) return;

      const range = document.createRange();
      const endPos = pos + decoded.length;
      const endInSameNode = endPos <= (nodes.find(n => n.node === targetNode)?.end ?? 0);
      if (endInSameNode) {
        range.setStart(targetNode, offsetStart);
        range.setEnd(targetNode, Math.min(offsetStart + decoded.length, targetNode.textContent!.length));
      } else {
        range.setStart(targetNode, offsetStart);
      }

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      window.scrollTo({ top: window.scrollY + rect.top - 120, behavior: "smooth" });

      if (endInSameNode) {
        try {
          const mark = document.createElement("mark");
          mark.style.backgroundColor = "#fbbf24";
          mark.style.color = "#000";
          mark.style.borderRadius = "2px";
          mark.style.transition = "background-color 2s, color 2s";
          range.surroundContents(mark);
          setTimeout(() => { mark.style.backgroundColor = "transparent"; mark.style.color = "inherit"; }, 3000);
        } catch {}
      }
    };
    setTimeout(scrollToText, 600);
  }, [module]);

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

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        return;
      }
      const target = sel.anchorNode?.parentElement;
      if (target?.closest('[data-highlight-popup]')) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-highlight-popup]')) {
        setSelection(null);
        setNote("");
      }
    };
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSaveHighlight = async () => {
    if (!slug || !selection) return;
    try {
      await createHighlight.mutateAsync({ moduleSlug: slug, text: selection.text, note });
      setSelection(null);
      setNote("");
    } catch {
      // silently fail
    }
  };

  const handleResumeListening = () => {
    setShowResume(false);
    const idx = savedListeningProgress !== null
      ? Math.floor((savedListeningProgress / 100) * unifiedCleanText.length)
      : 0;
    startSpeech(idx, unifiedCleanText, volume, rate, selectedVoice);
  };

  const handleResumeReading = () => {
    setShowResume(false);
    if (savedReadingProgress !== null && savedProgress && savedProgress.scrollPosition > 0) {
      window.scrollTo({ top: savedProgress.scrollPosition, behavior: "smooth" });
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

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await favoritesApi.remove(slug);
        setIsFavorited(false);
      } else {
        await favoritesApi.add(slug);
        setIsFavorited(true);
      }
    } catch {}
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" />
      </div>
    );
  }

  if (!module) notFound();

  if (module.locked) {
    return (
      <div className="mx-auto w-full max-w-[600px] px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-premium/10 border border-premium/20 flex items-center justify-center mx-auto mb-8">
          <Lock size={36} className="text-premium" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-premium/10 border border-premium/30 rounded-full text-[0.75rem] font-bold text-premium uppercase tracking-wider mb-6">
          <Crown size={14} />
          Premium Content
        </div>
        <h1 className="text-4xl font-black text-fg mb-4 tracking-[-0.03em]">{module.title}</h1>
        <p className="text-lg text-muted-light mb-8 leading-relaxed">{module.description}</p>

        <div className="bg-bg-card border border-border-subtle rounded-2xl p-8 mb-8 text-left">
          <h3 className="text-xl font-bold text-fg mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-premium" />
            Upgrade to Access
          </h3>
          <ul className="flex flex-col gap-3 text-[0.875rem] text-muted mb-6">
            <li className="flex items-start gap-3"><Crown size={16} className="text-premium flex-shrink-0 mt-0.5" /> Full content with detailed explanations</li>
            <li className="flex items-start gap-3"><Crown size={16} className="text-premium flex-shrink-0 mt-0.5" /> TTS audio narration for hands-free learning</li>
            <li className="flex items-start gap-3"><Crown size={16} className="text-premium flex-shrink-0 mt-0.5" /> Interactive knowledge graph & implementation path</li>
            <li className="flex items-start gap-3"><Crown size={16} className="text-premium flex-shrink-0 mt-0.5" /> Quiz, reflection & action planning tools</li>
          </ul>
          <Link href="/#pricing" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-fg text-bg rounded-xl font-bold text-[0.9375rem] no-underline hover:opacity-90 transition-all">
            <Crown size={18} />
            View Subscription Plans
          </Link>
        </div>

        <div className="max-w-[65ch] mx-auto mt-12">
          <div className="bg-bg border border-border rounded-2xl p-6 text-left">
            {feedbackSubmitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-fg">Thank you for your feedback!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles size={15} className="text-premium" />
                  <span className="text-[0.6875rem] font-bold text-premium uppercase tracking-[0.1em]">Feedback</span>
                </div>
                <p className="text-[0.875rem] text-muted mb-5">How was your experience?</p>
                <div className="flex gap-1.5 mb-6 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => { setRating(star); setFeedbackError(false); }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                        (rating ?? 0) >= star
                          ? "bg-premium text-black shadow-lg shadow-premium/20 scale-110"
                          : "bg-bg-elevated text-muted-dark hover:bg-bg-card hover:text-fg hover:scale-105"
                      }`}
                    >
                      <Star size={22} fill={(rating ?? 0) >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                {feedbackError && (
                  <p className="text-[0.75rem] text-red-400 mb-3 text-center">Failed to submit. Please try again.</p>
                )}
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more (optional)..."
                  rows={3}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[0.875rem] text-fg outline-none resize-none mb-3 placeholder:text-muted"
                />
                <button onClick={handleSubmitFeedback} disabled={!rating || feedbackSubmitting}
                  className="w-full py-3 bg-fg text-bg rounded-xl font-bold text-[0.8125rem] cursor-pointer hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
        <li key={block.start} className="text-muted mb-3 ml-6 list-disc">
          {renderBlockContent(block)}
        </li>
      );
    }

    if (block.type === 'h1') {
      return (
        <h1 key={block.start} className="font-black text-fg mb-4 tracking-[-0.03em] leading-[1.1]" style={{ fontSize: '2em', fontFamily: fontFamilyMap[fontFamily] }}>
          {renderBlockContent(block)}
        </h1>
      );
    }

    if (block.type === 'h2') {
      return (
        <h2 key={block.start} id={headingId} className="font-bold text-fg mb-6 mt-12 pb-3 border-b border-border scroll-mt-[100px]" style={{ fontSize: '1.5em', fontFamily: fontFamilyMap[fontFamily] }}>
          {renderBlockContent(block)}
        </h2>
      );
    }

    if (block.type === 'h3') {
      return (
        <h3 key={block.start} id={headingId} className="text-muted-light mb-4 mt-8 scroll-mt-[100px]" style={{ fontSize: '1.25em', fontFamily: fontFamilyMap[fontFamily] }}>
          {renderBlockContent(block)}
        </h3>
      );
    }

    return (
      <p key={block.start} className={`${block.isDesc ? 'text-muted-light italic mb-12' : 'text-muted mb-6'}`}>
        {renderBlockContent(block)}
      </p>
    );
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 pb-[180px] pt-10 md:pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        <article
          ref={articleRef}
          className="mx-auto w-full"
          style={{
            letterSpacing: marginMap[margin],
            fontSize: fontSizeMap[fontSize],
            lineHeight: lineHeightMap[lineHeight],
            fontFamily: fontFamilyMap[fontFamily],
          }}
        >
          {contentBlocks.map((block, idx) => (
            <HighlightBlock key={idx} block={block} />
          ))}
        </article>

        <div className="hidden lg:block sticky top-[100px] pl-6 border-l border-border-light">
          <div className="text-[0.6875rem] font-semibold text-muted-dark uppercase tracking-[0.1em] mb-6">Contents</div>
          <nav className="flex flex-col gap-3">
            {contentBlocks
              .filter(b => b.type === 'h2' || b.type === 'h3')
              .map((block: any, idx: number) => (
                <a
                  key={idx}
                  href={`#${getBlockText(block).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                  className={`no-underline ${block.type === 'h3' ? 'text-[0.8125rem] pl-4' : 'text-[0.875rem]'} ${block.type === 'h3' ? 'font-normal' : 'font-medium'} text-muted-light hover:text-fg transition-colors`}
                >
                  {getBlockText(block)}
                </a>
              ))}
          </nav>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="max-w-[65ch] mx-auto mt-20 mb-8">
          <h2 className="text-2xl font-black text-fg mb-1 tracking-[-0.03em]">
            What&apos;s Next
          </h2>
          <p className="text-[0.875rem] text-muted-light mb-8">
            More in <span className="text-muted font-semibold">{module.category.charAt(0).toUpperCase() + module.category.slice(1).replace(/-/g, ' ')}</span>
          </p>
          <div className="flex flex-col gap-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                href={`/models/${rec.slug}`}
                className="group flex items-start gap-5 bg-bg-card border border-border-subtle rounded-2xl p-5 no-underline transition-all duration-300 hover:bg-bg hover:border-border hover:-translate-y-0.5"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-fg mb-1.5 group-hover:text-fg transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-[0.8125rem] text-muted-light leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-[0.75rem] font-semibold text-muted-dark group-hover:text-fg transition-colors mt-1">
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
          className="max-w-[65ch] mx-auto mb-8 bg-bg border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw size={16} className="text-premium" />
            <span className="text-[0.6875rem] font-bold text-premium uppercase tracking-[0.1em]">
              Resume
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {savedListeningProgress !== null && (
              <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Play size={14} className="text-muted" />
                  <span className="text-[0.6875rem] font-semibold text-muted uppercase tracking-[0.05em]">
                    Listening
                  </span>
                </div>
                <p className="text-2xl font-black text-fg mb-1">
                  {Math.round(savedListeningProgress)}%
                </p>
                <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-fg rounded-full" style={{ width: `${savedListeningProgress}%` }} />
                </div>
              </div>
            )}
            {savedReadingProgress !== null && (
              <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.6875rem] font-semibold text-muted uppercase tracking-[0.05em]">
                    Reading
                  </span>
                </div>
                <p className="text-2xl font-black text-fg mb-1">
                  {Math.round(savedReadingProgress)}%
                </p>
                <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-fg rounded-full" style={{ width: `${savedReadingProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {savedListeningProgress !== null && (
              <button
                onClick={handleResumeListening}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-fg text-bg rounded-lg font-bold text-[0.8125rem] hover:opacity-90 transition-all"
              >
                <Play size={14} fill="currentColor" />
                Continue Listening
              </button>
            )}
            {savedReadingProgress !== null && (
              <button
                onClick={handleResumeReading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-elevated border border-border text-fg rounded-lg font-bold text-[0.8125rem] hover:bg-bg-card transition-all"
              >
                Continue Reading
              </button>
            )}
            <button
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-border text-muted-light rounded-lg font-semibold text-[0.8125rem] hover:border-border-light hover:text-fg transition-all"
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
              : "bg-bg-card border border-border text-muted hover:border-border-light hover:text-fg"
          }`}
        >
          <CheckCircle2 size={16} />
          {isCompleted ? "Completed" : "Mark as Complete"}
        </button>
      </div>

      <div className="max-w-[65ch] mx-auto mb-12">
        <div className="bg-bg border border-border rounded-2xl p-6">
          {feedbackSubmitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-fg">Thank you for your feedback!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={15} className="text-premium" />
                <span className="text-[0.6875rem] font-bold text-premium uppercase tracking-[0.1em]">
                  Feedback
                </span>
              </div>
              <p className="text-[0.875rem] text-muted mb-5">How was your experience?</p>
              <div className="flex gap-1.5 mb-6 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => { setRating(star); setFeedbackError(false); }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                      (rating ?? 0) >= star
                        ? "bg-premium text-black shadow-lg shadow-premium/20 scale-110"
                        : "bg-bg-elevated text-muted-dark hover:bg-bg-card hover:text-fg hover:scale-105"
                    }`}
                  >
                    <Star size={22} fill={(rating ?? 0) >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              {feedbackError && (
                <p className="text-[0.75rem] text-red-400 mb-3 text-center">Failed to submit. Please try again.</p>
              )}
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more (optional)..."
                rows={3}
                className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[0.875rem] text-fg outline-none resize-none mb-3 placeholder:text-muted"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={!rating || feedbackSubmitting}
                className="w-full py-3 bg-fg text-bg rounded-xl font-bold text-[0.8125rem] cursor-pointer hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </>
          )}
        </div>
      </div>

      <ModuleFloatingBar
        isPlaying={isPlaying}
        onTogglePlay={toggleSpeech}
        progress={progress}
        durationInfo={durationInfo}
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceChange={updateVoice}
        showVoiceList={showVoiceList}
        onToggleVoiceList={() => setShowVoiceList((v) => !v)}
        rate={rate}
        onRateChange={updateRate}
        volume={volume}
        onVolumeChange={updateVolume}
        isFavorited={isFavorited}
        onToggleFavorite={toggleFavorite}
      />

      <TableOfContents
        show={tocOpen}
        onClose={() => setTocOpen(false)}
        onNavigate={(id) => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
      {selection && (
        <div
          data-highlight-popup
          className="fixed z-[2000] bg-bg-elevated border border-border rounded-2xl p-4 shadow-2xl shadow-black/60 min-w-[260px] md:min-w-[300px]"
          style={{ left: Math.max(16, Math.min(selection.x - 150, window.innerWidth - 300)), top: Math.max(16, selection.y - 180) }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-premium">
              <Highlighter size={14} />
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]">Highlight</span>
            </div>
            <button onClick={() => { setSelection(null); setNote(""); }} className="text-muted-dark hover:text-fg transition-colors cursor-pointer bg-transparent border-none p-1">
              <X size={14} />
            </button>
          </div>
          <p className="text-[0.8125rem] text-muted mb-3 line-clamp-2 leading-relaxed">"{selection.text}"</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            rows={2}
            className="w-full bg-bg-input border border-border rounded-xl px-3 py-2 text-[0.8125rem] text-fg outline-none resize-none mb-3 placeholder:text-muted-dark"
          />
          <button
            onClick={handleSaveHighlight}
            disabled={createHighlight.isPending}
            className="w-full py-2.5 bg-fg text-bg rounded-xl font-bold text-[0.75rem] cursor-pointer hover:opacity-90 transition-all disabled:opacity-50"
          >
            {createHighlight.isPending ? "Saving..." : "Save Highlight"}
          </button>
        </div>
      )}
    </div>
  );
}
