"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface TocItem {
  type: "h2" | "h3";
  text: string;
  id: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function TableOfContents({ show, onClose, onNavigate }: Props) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    if (!show) return;
    const article = document.querySelector("article");
    if (!article) return;
    const headings = article.querySelectorAll("h2, h3");
    const toc: TocItem[] = [];
    headings.forEach((h) => {
      const text = h.textContent || "";
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      h.id = h.id || id;
      toc.push({ type: h.tagName.toLowerCase() as "h2" | "h3", text, id });
    });
    setItems(toc);
  }, [show]);

  const handleClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-md rounded-t-2xl p-6 shadow-2xl max-h-[60vh] overflow-y-auto"
        style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>Table of Contents</h3>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: "var(--muted)" }}>
            <X size={18} />
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--muted)" }}>No headings found</p>
        ) : (
          <nav className="flex flex-col gap-1">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(item.id)}
                className="text-left py-2 px-3 rounded-xl text-sm transition-all hover:opacity-80"
                style={{
                  paddingLeft: item.type === "h3" ? "1.5rem" : "0.75rem",
                  color: "var(--text)",
                  fontWeight: item.type === "h2" ? 600 : 400,
                }}
              >
                {item.text}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
