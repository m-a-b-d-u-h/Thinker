"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PenLine, X, Loader2 } from "lucide-react";
import { useUpsertNotebook, useDeleteNotebook } from "@/lib/query-hooks";
import { useAuthStore } from "@/lib/store/auth";

interface NotebookSlideProps {
  moduleSlug: string;
  nodeId: string;
  nodeLabel: string;
  slideIndex: number;
  existingNote?: string | null;
}

export function NotebookSlide({
  moduleSlug,
  nodeId,
  nodeLabel,
  slideIndex,
  existingNote,
}: NotebookSlideProps) {
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(existingNote || "");
  const upsertMutation = useUpsertNotebook();
  const deleteMutation = useDeleteNotebook();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(existingNote || "");
  }, [existingNote]);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  if (!token) return null;

  const handleSave = async () => {
    if (!content.trim()) {
      await deleteMutation.mutateAsync({ moduleSlug, nodeId, slideIndex });
    } else {
      await upsertMutation.mutateAsync({
        moduleSlug,
        nodeId,
        nodeLabel,
        slideIndex,
        content: content.trim(),
      });
    }
    setOpen(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ moduleSlug, nodeId, slideIndex });
    setContent("");
    setOpen(false);
  };

  const hasNote = !!existingNote;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`absolute bottom-3 right-3 z-20 p-2 rounded-lg border transition-all cursor-pointer ${
          hasNote
            ? "bg-[#a78bfa]/10 border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20"
            : "bg-bg/50 border-border/30 text-muted-dark hover:text-muted hover:border-border/60"
        }`}
        title={hasNote ? "Edit note" : "Add note"}
      >
        <PenLine size={14} />
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-bg-card border border-border rounded-2xl p-5 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-fg">
                {nodeLabel} &middot; Slide {slideIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-muted-dark hover:text-fg hover:bg-bg-elevated transition-colors cursor-pointer bg-transparent border-none"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note for this slide..."
              className="w-full h-28 resize-none bg-bg border border-border-subtle rounded-xl p-3 text-[0.8125rem] text-fg outline-none focus:border-border transition-colors placeholder:text-muted-dark"
            />

            <div className="flex items-center justify-between mt-3">
              {hasNote && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-[0.75rem] text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none disabled:opacity-30"
                >
                  Delete note
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-[0.75rem] font-semibold text-muted hover:text-fg transition-colors cursor-pointer bg-transparent border-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={upsertMutation.isPending || deleteMutation.isPending}
                  className="px-4 py-2 rounded-lg text-[0.75rem] font-semibold bg-fg text-bg hover:opacity-90 transition-all cursor-pointer border-none disabled:opacity-30"
                >
                  {upsertMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
