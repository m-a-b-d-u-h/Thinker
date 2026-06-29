"use client";

import { notFound, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, MessageSquare, Type, CaseSensitive, ArrowUpDown, ArrowLeftRight, Maximize } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import { useModule } from "@/lib/query-hooks";
import { getSlides } from "@/lib/course-content";

type FontSize = "sm" | "md" | "lg" | "xl";
type FontFamily = "inter" | "serif" | "mono" | "outfit";
type LineH = "tight" | "normal" | "relaxed";
type LetterSp = "tight" | "normal" | "wide";
type AspectRatio = "9-16" | "3-4";

const fontSizeValues: Record<FontSize, string> = {
  sm: "4cqi", md: "4.5cqi", lg: "5cqi", xl: "5.5cqi",
};
const fontFamilyValues: Record<FontFamily, string> = {
  inter: "'Inter', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
  outfit: "'Outfit', sans-serif",
};
const lineHeightValues: Record<LineH, string> = {
  tight: "1.5", normal: "1.75", relaxed: "2.1",
};
const letterSpacingValues: Record<LetterSp, string> = {
  tight: "-0.02em", normal: "0.02em", wide: "0.05em",
};
const aspectRatioValues: Record<AspectRatio, string> = {
  "9-16": "9/16",
  "3-4": "3/4",
};

const fontSizeOptions: { key: FontSize; label: string }[] = [
  { key: "sm", label: "Sm" },
  { key: "md", label: "Md" },
  { key: "lg", label: "Lg" },
  { key: "xl", label: "Xl" },
];
const fontFamilyOptions: { key: FontFamily; label: string }[] = [
  { key: "inter", label: "Inter" },
  { key: "serif", label: "Serif" },
  { key: "mono", label: "Mono" },
  { key: "outfit", label: "Outfit" },
];
const lineHeightOptions: { key: LineH; label: string }[] = [
  { key: "tight", label: "Tight" },
  { key: "normal", label: "Normal" },
  { key: "relaxed", label: "Relaxed" },
];
const letterSpacingOptions: { key: LetterSp; label: string }[] = [
  { key: "tight", label: "Tight" },
  { key: "normal", label: "Normal" },
  { key: "wide", label: "Wide" },
];
const aspectRatioOptions: { key: AspectRatio; label: string }[] = [
  { key: "9-16", label: "9:16" },
  { key: "3-4", label: "3:4" },
];

function SettingIcon({
  icon: Icon,
  active,
  onClick,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
          active ? "bg-fg/15 text-fg" : "text-muted/70 hover:text-fg hover:bg-bg/50"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
      </button>
      {children}
    </div>
  );
}

function Popup({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
      <div className="bg-bg-elevated border border-border/50 rounded-xl shadow-xl p-2">
        {children}
      </div>
    </div>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`text-[10px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
            value === o.key
              ? "bg-fg text-bg shadow-sm"
              : "bg-bg text-muted border border-border/30 hover:text-fg hover:border-border/60"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ReadPage({ params }: { params: Promise<{ slug: string; nodeId: string }> }) {
  const { slug, nodeId } = React.use(params);
  const router = useRouter();
  const { data: module, isLoading } = useModule(slug);

  const nodes = useMemo(() => module?.nodes || [], [module]);

  const allSlides = useMemo(() => getSlides(nodes), [nodes]);

  const nodeSlides = useMemo(
    () => allSlides.filter((s) => s.nodeId === nodeId),
    [allSlides, nodeId],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSetting, setActiveSetting] = useState<"fontSize" | "fontFamily" | "lineHeight" | "letterSpacing" | "aspectRatio" | null>(null);

  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [fontFamily, setFontFamily] = useState<FontFamily>("inter");
  const [lineHeight, setLineHeight] = useState<LineH>("normal");
  const [letterSpacing, setLetterSpacing] = useState<LetterSp>("normal");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3-4");

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg">
        <div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" />
      </div>
    );
  }

  if (!module || nodes.length === 0) notFound();

  const baseFontSize = fontSizeValues[fontSize];
  const baseFontFamily = fontFamilyValues[fontFamily];
  const baseLineHeight = lineHeightValues[lineHeight];
  const baseLetterSpacing = letterSpacingValues[letterSpacing];
  const baseAspectRatio = aspectRatioValues[aspectRatio];

  return (
    <div className="h-full bg-bg flex flex-col">
      {/* Embla Carousel */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px]" style={{ aspectRatio: baseAspectRatio, containerType: 'inline-size' }}>
          {selectedIndex > 0 && (
            <button
              onClick={scrollPrev}
              className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-elevated/80 border border-border/40 flex items-center justify-center text-muted hover:text-fg hover:bg-bg-elevated transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="overflow-hidden w-full h-full rounded-2xl" ref={emblaRef}>
            <div className="flex h-full">
              {nodeSlides.map((slide, i) => (
                <div key={i} className="min-w-0 flex-[0_0_100%] h-full flex items-center justify-center">
                  <div className="w-full h-full bg-bg-elevated border border-border/40 rounded-2xl shadow-lg flex flex-col p-5 sm:p-7" style={{ fontSize: baseFontSize, fontFamily: baseFontFamily, lineHeight: baseLineHeight, letterSpacing: baseLetterSpacing }}>
                    {/* Slide progress dots */}
                    <div className="flex items-center gap-1 mb-4">
                      {nodeSlides.map((_, di) => (
                        <span
                          key={di}
                          className={`block h-0.5 rounded-full transition-all duration-300 ${
                            di === i ? 'w-6 bg-fg/70' : 'w-2 bg-border/50'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Module + Node title (first slide only) */}
                    {slide.slideIndex === 0 && (
                      <div className="mb-5">
                        <p className="text-[0.65em] text-muted/70 font-semibold uppercase mb-1.5" style={{ letterSpacing: "0.15em" }}>{module.title}</p>
                        <h1 className="text-[1.4em] font-bold text-fg leading-[1.15]">
                          {slide.nodeLabel}
                        </h1>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <p style={{ color: "rgba(255,255,255,0.85)" }}>
                        {slide.content}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => router.push(`/models/${slug}`)}
                          className="text-[10px] text-muted-dark/50 hover:text-muted transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                          Back
                        </button>
                        <div className="flex gap-1.5 items-center">
                          {i > 0 && (
                            <button
                              onClick={scrollPrev}
                              className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-bg-elevated border border-border/40 text-muted hover:text-fg hover:border-border/70 transition-all cursor-pointer"
                            >
                              Prev
                            </button>
                          )}
                          {i < nodeSlides.length - 1 && (
                            <button
                              onClick={scrollNext}
                              className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-bg-elevated border border-border/40 text-muted hover:text-fg hover:border-border/70 transition-all cursor-pointer"
                            >
                              Next
                            </button>
                          )}
                          {i === nodeSlides.length - 1 && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => router.push(`/models/${slug}/quiz/${nodeId}`)}
                                className="px-2 py-1 text-[10px] font-medium rounded-lg bg-bg-elevated border border-border/40 text-muted hover:text-fg hover:border-border/70 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <HelpCircle className="w-2.5 h-2.5" />
                                Quiz
                              </button>
                              <button
                                onClick={() => router.push(`/models/${slug}/reflection/${nodeId}`)}
                                className="px-2 py-1 text-[10px] font-medium rounded-lg bg-bg-elevated border border-border/40 text-muted hover:text-fg hover:border-border/70 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <MessageSquare className="w-2.5 h-2.5" />
                                Reflect
                              </button>
                              <button
                                onClick={() => router.push(`/models/${slug}`)}
                                className="px-3 py-1 text-[10px] font-medium rounded-lg bg-fg text-bg hover:opacity-90 transition-all cursor-pointer"
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedIndex < nodeSlides.length - 1 && (
          <button
            onClick={scrollNext}
            className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-elevated/80 border border-border/40 flex items-center justify-center text-muted hover:text-fg hover:bg-bg-elevated transition-all cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      </div>

      {/* Fixed bottom settings bar */}
      <div className="fixed bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-border/60 rounded-xl px-3 py-1.5 shadow-lg">
          <SettingIcon
            icon={Type}
            active={activeSetting === "fontSize"}
            onClick={() => setActiveSetting(activeSetting === "fontSize" ? null : "fontSize")}
          >
            {activeSetting === "fontSize" && (
              <Popup>
                <RadioGroup options={fontSizeOptions} value={fontSize} onChange={setFontSize} />
              </Popup>
            )}
          </SettingIcon>

          <SettingIcon
            icon={CaseSensitive}
            active={activeSetting === "fontFamily"}
            onClick={() => setActiveSetting(activeSetting === "fontFamily" ? null : "fontFamily")}
          >
            {activeSetting === "fontFamily" && (
              <Popup>
                <RadioGroup options={fontFamilyOptions} value={fontFamily} onChange={setFontFamily} />
              </Popup>
            )}
          </SettingIcon>

          <div className="w-px h-5 bg-border/40" />

          <SettingIcon
            icon={ArrowUpDown}
            active={activeSetting === "lineHeight"}
            onClick={() => setActiveSetting(activeSetting === "lineHeight" ? null : "lineHeight")}
          >
            {activeSetting === "lineHeight" && (
              <Popup>
                <RadioGroup options={lineHeightOptions} value={lineHeight} onChange={setLineHeight} />
              </Popup>
            )}
          </SettingIcon>

          <SettingIcon
            icon={ArrowLeftRight}
            active={activeSetting === "letterSpacing"}
            onClick={() => setActiveSetting(activeSetting === "letterSpacing" ? null : "letterSpacing")}
          >
            {activeSetting === "letterSpacing" && (
              <Popup>
                <RadioGroup options={letterSpacingOptions} value={letterSpacing} onChange={setLetterSpacing} />
              </Popup>
            )}
          </SettingIcon>

          <div className="w-px h-5 bg-border/40" />

          <SettingIcon
            icon={Maximize}
            active={activeSetting === "aspectRatio"}
            onClick={() => setActiveSetting(activeSetting === "aspectRatio" ? null : "aspectRatio")}
          >
            {activeSetting === "aspectRatio" && (
              <Popup>
                <RadioGroup options={aspectRatioOptions} value={aspectRatio} onChange={setAspectRatio} />
              </Popup>
            )}
          </SettingIcon>
        </div>
      </div>
    </div>
  );
}
