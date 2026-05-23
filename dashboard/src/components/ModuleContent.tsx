"use client";

import { useMemo } from "react";

interface Block {
  type: "h1" | "h2" | "h3" | "li" | "p" | "desc";
  text: string;
}

export default function ModuleContent({
  title,
  description,
  content,
}: {
  title: string;
  description: string;
  content: string;
}) {
  const blocks = useMemo(() => {
    const blocks: Block[] = [];

    if (title) {
      blocks.push({ type: "h1", text: title });
    }

    if (description) {
      blocks.push({ type: "desc", text: description });
    }

    if (!content) return blocks;

    const lines = content.split("\n");

    for (const line of lines) {
      if (line.trim() === "") continue;

      if (line.startsWith("# ")) {
        blocks.push({ type: "h1", text: line.replace(/^#\s+/, "") });
      } else if (line.startsWith("## ")) {
        blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
      } else if (line.startsWith("### ")) {
        blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") });
      } else if (line.startsWith("- ") || line.match(/^\d+\.\s/)) {
        blocks.push({ type: "li", text: line.replace(/^[-•]?\s*|\d+\.\s*/, "") });
      } else {
        blocks.push({ type: "p", text: line });
      }
    }

    return blocks;
  }, [title, description, content]);

  if (blocks.length === 0) return null;

  return (
    <div className="max-w-[65ch]">
      {blocks.map((block, idx) => {
        if (block.type === "h1")
          return (
            <h1
              key={idx}
              className="text-5xl font-black text-white mb-4 tracking-[-0.03em] leading-[1.1]"
            >
              {block.text}
            </h1>
          );
        if (block.type === "desc")
          return (
            <p
              key={idx}
              className="text-xl text-[#666] italic mb-12 leading-relaxed"
            >
              {block.text}
            </p>
          );
        if (block.type === "h2")
          return (
            <h2
              key={idx}
              className="text-3xl font-bold text-white mb-6 mt-12 pb-3 border-b border-[#1a1a1a]"
            >
              {block.text}
            </h2>
          );
        if (block.type === "h3")
          return (
            <h3 key={idx} className="text-xl text-[#999] mb-4 mt-8">
              {block.text}
            </h3>
          );
        if (block.type === "li")
          return (
            <li
              key={idx}
              className="text-lg text-[#888] mb-3 ml-6 list-disc"
            >
              {block.text}
            </li>
          );
        return (
          <p key={idx} className="text-lg text-[#888] mb-6 leading-[1.8]">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
