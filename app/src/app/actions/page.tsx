"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Target, Trash2, Type, CheckSquare, Sliders, List, Save, Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useActionPlans, useUpdateActionPlan, useDeleteActionPlan } from "@/lib/query-hooks";
import { useAuth } from "@/lib/auth-context";
import type { MatrixRow } from "@/lib/types";

const PER_PAGE = 10;

function MatrixInput({ row, onChange }: { row: MatrixRow; onChange: (id: number, value: any) => void }) {
  switch (row.type) {
    case "text":
      return (
        <div className="flex items-center gap-3 px-1">
          <div className="w-6 h-6 rounded-lg bg-fg/5 flex items-center justify-center shrink-0">
            <Type size={12} className="text-fg/40" />
          </div>
          <span className="text-[0.8125rem] text-fg/60 font-medium min-w-[120px]">{row.label || "Untitled"}</span>
          <input
            type="text"
            value={row.value}
            onChange={(e) => onChange(row.id, e.target.value)}
            className="flex-1 max-w-[240px] ml-auto bg-bg-elevated/50 border border-border-subtle rounded-lg px-3 py-1.5 text-[0.875rem] text-fg outline-none focus:border-border focus:bg-bg-elevated transition-all"
          />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-3 px-1">
          <div className="w-6 h-6 rounded-lg bg-fg/5 flex items-center justify-center shrink-0">
            <CheckSquare size={12} className="text-fg/40" />
          </div>
          <span className="text-[0.8125rem] text-fg/60 font-medium min-w-[120px]">{row.label || "Untitled"}</span>
          <label className="ml-auto flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={row.value}
              onChange={(e) => onChange(row.id, e.target.checked)}
              className="accent-fg w-4 h-4"
            />
            <span className={`text-[0.8125rem] transition-colors ${row.value ? 'text-fg font-medium' : 'text-muted-dark'}`}>
              {row.value ? "Yes" : "No"}
            </span>
          </label>
        </div>
      );
    case "slider":
      return (
        <div className="flex items-center gap-3 px-1">
          <div className="w-6 h-6 rounded-lg bg-fg/5 flex items-center justify-center shrink-0">
            <Sliders size={12} className="text-fg/40" />
          </div>
          <span className="text-[0.8125rem] text-fg/60 font-medium min-w-[120px]">{row.label || "Untitled"}</span>
          <div className="flex-1 max-w-[200px] ml-auto flex items-center gap-3">
            <input
              type="range" min="0" max="100"
              value={row.value}
              onChange={(e) => onChange(row.id, parseInt(e.target.value))}
              className="flex-1 accent-fg h-1.5"
            />
            <span className="text-[0.8125rem] text-fg font-medium tabular-nums min-w-[28px] text-right">{row.value}</span>
          </div>
        </div>
      );
    case "radio":
      return (
        <div className="flex items-center gap-3 px-1">
          <div className="w-6 h-6 rounded-lg bg-fg/5 flex items-center justify-center shrink-0">
            <List size={12} className="text-fg/40" />
          </div>
          <span className="text-[0.8125rem] text-fg/60 font-medium min-w-[120px]">{row.label || "Untitled"}</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {row.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(row.id, opt)}
                className={`text-[0.75rem] px-3 py-1.5 rounded-lg border cursor-pointer transition-all font-medium ${
                  row.value === opt
                    ? "bg-fg text-bg border-fg"
                    : "bg-transparent border-border-subtle text-muted-dark hover:text-fg hover:border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function PlanCard({ plan }: { plan: import("@/lib/types").ActionPlan }) {
  const [matrix, setMatrix] = useState<MatrixRow[]>(plan.content);
  const [savingId, setSavingId] = useState<string | null>(null);
  const updateMutation = useUpdateActionPlan();
  const deleteMutation = useDeleteActionPlan();

  const hasChanges = JSON.stringify(matrix) !== JSON.stringify(plan.content);

  const handleChange = useCallback((id: number, value: any) => {
    setMatrix((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }, []);

  const handleSave = async () => {
    setSavingId(plan.id);
    try {
      await updateMutation.mutateAsync({ id: plan.id, content: matrix });
    } catch {
      // silently fail
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(plan.id);
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden hover:border-border transition-colors">
      <div className="px-6 pt-5 pb-4 border-b border-border-subtle">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <h3 className="font-semibold text-fg break-words">{plan.title}</h3>
              {plan.completed && (
                <span className="text-[0.6875rem] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md shrink-0">Completed</span>
              )}
            </div>

            <span className="text-[0.6875rem] text-muted-dark/60 mt-1 block">
              {new Date(plan.appliedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={savingId === plan.id}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-fg text-bg rounded-xl text-[0.75rem] font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
              >
                {savingId === plan.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-bg/20 border-t-bg rounded-full animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                Save
              </button>
            )}
            <Link
              href={`/models/${plan.module?.slug}/action`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-[0.75rem] text-muted hover:text-fg hover:border-border transition-all no-underline"
            >
              Edit <ArrowRight size={12} />
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-2 text-muted-dark hover:text-red-400 bg-transparent border border-transparent hover:border-red-400/20 rounded-xl transition-all cursor-pointer disabled:opacity-30"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-2.5">
        {matrix.map((row) => (
          <MatrixInput key={row.id} row={row} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}

export default function ActionsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: plans, isLoading } = useActionPlans();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10 md:py-16 text-center">
        <h1 className="text-3xl font-black mb-4">Sign in to view your action plans</h1>
        <Link href="/login" className="inline-flex items-center gap-2 bg-fg text-bg px-6 py-3 rounded-lg font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  const filteredPlans = (plans || []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setPage(1); }, [search]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10 md:py-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10 md:py-16">
      <PageHeader
        icon={<Zap size={16} />}
        title="Action Plans"
        description="Your commitments to apply what you&apos;ve learned"
        search={{ value: search, onChange: setSearch, placeholder: "Search action plans..." }}
      />

      {!filteredPlans || filteredPlans.length === 0 ? (
        <div className="bg-bg-card rounded-2xl p-12 border border-border-subtle text-center">
          <Target size={40} className="mx-auto mb-4 text-muted-dark" />
          <p className="text-[0.875rem] text-muted mb-2">No action plans yet.</p>
          <p className="text-[0.8125rem] text-muted-dark mb-6">Start by marking an action plan as applied on any module.</p>
          <Link href="/models" className="inline-flex items-center gap-1.5 bg-fg text-bg px-6 py-3 rounded-xl font-semibold text-[0.875rem]">
            Explore modules <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {filteredPlans.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(filteredPlans.length / PER_PAGE))} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
