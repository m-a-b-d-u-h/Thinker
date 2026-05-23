"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Eye,
  Save,
  Trash2,
  Plus,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import ModuleGraph from "@/components/ModuleGraph";
import ModuleGraphEditor from "@/components/ModuleGraphEditor";
import ModuleContent from "@/components/ModuleContent";

interface NodeForm {
  id: string;
  positionX: number;
  positionY: number;
  label: string;
  type: string;
}

interface EdgeForm {
  id: string;
  source: string;
  target: string;
  label: string;
  animated: boolean;
}

interface QuestionForm {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function toNodeForm(n: any): NodeForm {
  if (n.positionX != null) {
    return { id: n.id, positionX: n.positionX, positionY: n.positionY, label: n.label, type: n.type || "custom" };
  }
  return {
    id: n.id,
    positionX: n.position?.x ?? 0,
    positionY: n.position?.y ?? 0,
    label: n.data?.label ?? n.label ?? "",
    type: n.type || "custom",
  };
}

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.id as string;
  const isNew = slug === "new";

  const [editing, setEditing] = useState(isNew);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    content: "",
    isPremium: false,
    nodes: [] as NodeForm[],
    edges: [] as EdgeForm[],
    questions: [] as QuestionForm[],
  });

  const { data: mod, isLoading } = useQuery({
    queryKey: ["admin", "module", slug],
    queryFn: async () => {
      const { data } = await api.get(`/modules/${slug}?admin=true`);
      return data;
    },
    enabled: !!slug && !isNew,
  });

  useEffect(() => {
    if (mod && !isNew && !editing) {
      setForm({
        title: mod.title || "",
        slug: mod.slug || "",
        description: mod.description || "",
        category: mod.category || "",
        content: mod.content || "",
        isPremium: mod.isPremium || false,
        nodes: (mod.nodes || []).map(toNodeForm),
        edges: (mod.edges || []).map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || "",
          animated: e.animated ?? true,
        })),
        questions: (mod.questions || []).map((q: any) => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer ?? 0,
          explanation: q.explanation || "",
        })),
      });
    }
  }, [mod, editing, isNew]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: res } = await api.post("/modules", {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        content: data.content,
        isPremium: data.isPremium,
        nodes: data.nodes,
        edges: data.edges,
        questions: data.questions,
      });
      return res;
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "modules"] });
      toast.success("Module created");
      router.replace(`/dashboard/modules/${res.slug}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || err.response?.data?.error || "Failed to create";
      toast.error(typeof msg === "string" ? msg : "Failed to create");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload: any = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        content: data.content,
        isPremium: data.isPremium,
      };
      if (data.nodes) payload.nodes = data.nodes;
      if (data.edges) payload.edges = data.edges;
      if (data.questions) payload.questions = data.questions;
      const { data: res } = await api.patch(`/modules/${slug}`, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "module", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "modules"] });
      setEditing(false);
      toast.success("Module updated");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || err.response?.data?.error || "Failed to update";
      toast.error(typeof msg === "string" ? msg : "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/modules/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "modules"] });
      toast.success("Module deleted");
      router.replace("/dashboard/modules");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || "Failed to delete";
      toast.error(typeof msg === "string" ? msg : "Failed to delete");
      setDeleting(false);
    },
  });

  const addQuestion = useCallback(() => {
    setForm((f) => ({
      ...f,
      questions: [...f.questions, { question: "", options: ["", ""], correctAnswer: 0, explanation: "" }],
    }));
  }, []);

  const updateField = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="text-center py-20">
        <p className="text-[#555]">Module not found</p>
        <Link href="/dashboard/modules" className="text-sm text-white underline mt-4 inline-block">
          Back to modules
        </Link>
      </div>
    );
  }

  const viewNodes = isNew ? [] : (mod.nodes || []).map((n: any) => ({
    id: n.id,
    position: n.position || { x: n.positionX, y: n.positionY },
    data: n.data || { label: n.label },
    type: n.type || "custom",
  }));

  const graphEnabled = viewNodes.length > 0;

  const handleSave = () => {
    if (isNew) {
      createMutation.mutate(form);
    } else {
      updateMutation.mutate(form);
    }
  };

  return (
    <div className="max-w-[960px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {isNew ? (
          <Link
            href="/dashboard/modules"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-all"
          >
            <ArrowLeft size={16} /> Back to Modules
          </Link>
        ) : (
          <Link
            href="/dashboard/modules"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-all"
          >
            <ArrowLeft size={16} /> Back to Modules
          </Link>
        )}
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              {!isNew && (
                <button
                  onClick={() => { setEditing(false); setDeleting(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Eye size={15} /> Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending || createMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white text-black hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Save size={15} /> {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            !isNew && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all"
              >
                <Pencil size={15} /> Edit
              </button>
            )
          )}
        </div>
      </div>

      {editing ? (
        /* ===== EDIT MODE ===== */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest text-xs">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
                />
              </div>
              <div className="space-y-1.5 flex items-end pb-2.5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-xs font-medium text-white/40">Premium</span>
                  <button
                    type="button"
                    onClick={() => updateField("isPremium", !form.isPremium)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isPremium ? "bg-amber-500" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPremium ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40">Description</label>
              <input
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40">Content (Markdown)</label>
              <textarea
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                rows={12}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all font-mono resize-y"
              />
            </div>
          </div>

          {/* Knowledge Graph */}
          <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Knowledge Graph</h3>
            <ModuleGraphEditor
              nodes={form.nodes}
              edges={form.edges}
              onNodesChange={(nodes) => updateField("nodes", nodes)}
              onEdgesChange={(edges) => updateField("edges", edges)}
              slug={form.slug || "module"}
            />
          </div>

          {/* Questions */}
          <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Questions ({form.questions.length})</h3>
              <button onClick={addQuestion} className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white transition-all">
                <Plus size={13} /> Add Question
              </button>
            </div>
            <div className="space-y-4">
              {form.questions.map((q, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/30">Q{i + 1}</span>
                    <button
                      onClick={() => updateField("questions", form.questions.filter((_, j) => j !== i))}
                      className="text-white/20 hover:text-red-400 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    value={q.question}
                    onChange={(e) => {
                      const n = [...form.questions];
                      n[i] = { ...n[i], question: e.target.value };
                      updateField("questions", n);
                    }}
                    placeholder="Question text"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                  />
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const n = [...form.questions];
                            n[i] = { ...n[i], correctAnswer: oi };
                            updateField("questions", n);
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            oi === q.correctAnswer ? "border-emerald-400" : "border-white/10"
                          }`}
                        >
                          {oi === q.correctAnswer && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const n = [...form.questions];
                            const opts = [...n[i].options];
                            opts[oi] = e.target.value;
                            n[i] = { ...n[i], options: opts };
                            updateField("questions", n);
                          }}
                          placeholder={`Option ${oi + 1}`}
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                        />
                        {q.options.length > 2 && (
                          <button
                            onClick={() => {
                              const n = [...form.questions];
                              const opts = n[i].options.filter((_, j) => j !== oi);
                              let ca = n[i].correctAnswer;
                              if (oi < ca) ca--;
                              else if (oi === ca) ca = 0;
                              n[i] = { ...n[i], options: opts, correctAnswer: ca };
                              updateField("questions", n);
                            }}
                            className="text-white/20 hover:text-red-400 transition-all"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const n = [...form.questions];
                        n[i] = { ...n[i], options: [...n[i].options, ""] };
                        updateField("questions", n);
                      }}
                      className="text-xs text-white/30 hover:text-white transition-all"
                    >
                      + Add option
                    </button>
                  </div>
                </div>
              ))}
              {form.questions.length === 0 && (
                <p className="text-xs text-white/20 text-center py-6">No questions yet</p>
              )}
            </div>
          </div>

          {/* Delete */}
          <div className="border border-red-500/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
                <p className="text-xs text-white/30 mt-1">Permanently delete this module and all its data.</p>
              </div>
              {deleting ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleting(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    <AlertTriangle size={14} /> {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleting(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ) : !isNew ? (
        /* ===== VIEW MODE ===== */
        <>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 text-white/50">
              {mod.category}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                mod.isPremium
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {mod.isPremium ? "Premium" : "Free"}
            </span>
            {mod.questions?.length > 0 && (
              <span className="text-xs font-medium text-white/30">
                {mod.questions.length} question{mod.questions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <article>
            <ModuleContent title={mod.title} description={mod.description} content={mod.content || ""} />
          </article>

          {graphEnabled && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Knowledge Graph</h3>
              <ModuleGraph nodes={viewNodes} edges={mod.edges || []} />
            </div>
          )}

          {mod.questions && mod.questions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Quiz Questions ({mod.questions.length})</h3>
              <div className="space-y-3">
                {mod.questions.map((q: any, i: number) => (
                  <div key={q.id || i} className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
                    <p className="text-sm text-white font-medium mb-3">
                      {i + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options?.map((opt: string, oi: number) => (
                        <div
                          key={oi}
                          className={`text-xs px-3 py-1.5 rounded-lg ${
                            oi === q.correctAnswer
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
