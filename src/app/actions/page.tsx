"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Target, Trash2, Type, CheckSquare, Sliders, List, Save } from "lucide-react";
import Pagination from "@/components/Pagination";
import { useActionPlans, useUpdateActionPlan, useDeleteActionPlan } from "@/lib/query-hooks";
import { useAuth } from "@/lib/auth-context";
import type { MatrixRow } from "@/lib/types";

const PER_PAGE = 10;

function MatrixInput({ row, onChange }: { row: MatrixRow; onChange: (id: number, value: any) => void }) {
  switch (row.type) {
    case "text":
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
            <Type size={11} className="text-muted-dark" />
          </div>
          <span className="text-[0.8125rem] text-muted min-w-[100px]">{row.label || "Untitled"}</span>
          <input
            type="text"
            value={row.value}
            onChange={(e) => onChange(row.id, e.target.value)}
            className="flex-1 max-w-[200px] ml-auto bg-transparent border border-border rounded-lg px-3 py-1.5 text-[0.875rem] text-fg outline-none focus:border-border-light text-right"
          />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
            <CheckSquare size={11} className="text-muted-dark" />
          </div>
          <span className="text-[0.8125rem] text-muted min-w-[100px]">{row.label || "Untitled"}</span>
          <label className="ml-auto flex items-center gap-2 cursor-pointer text-[0.875rem] text-muted">
            <input
              type="checkbox"
              checked={row.value}
              onChange={(e) => onChange(row.id, e.target.checked)}
              className="accent-fg"
            />
            {row.value ? "Yes" : "No"}
          </label>
        </div>
      );
    case "slider":
      return (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
            <Sliders size={11} className="text-muted-dark" />
          </div>
          <span className="text-[0.8125rem] text-muted min-w-[100px]">{row.label || "Untitled"}</span>
          <div className="flex-1 max-w-[160px] ml-auto flex items-center gap-2">
            <input
              type="range" min="0" max="100"
              value={row.value}
              onChange={(e) => onChange(row.id, parseInt(e.target.value))}
              className="flex-1 accent-fg"
            />
            <span className="text-[0.8125rem] text-fg min-w-[28px]">{row.value}</span>
          </div>
        </div>
      );
    case "radio":
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
            <List size={11} className="text-muted-dark" />
          </div>
          <span className="text-[0.8125rem] text-muted min-w-[100px]">{row.label || "Untitled"}</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {row.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(row.id, opt)}
                className={`text-[0.75rem] px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                  row.value === opt
                    ? "bg-bg-elevated border-border text-fg"
                    : "bg-transparent border-border-subtle text-muted-dark hover:text-muted"
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
    <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden">
      <div className="flex items-center gap-4 px-6 pt-5 pb-4 border-b border-border-subtle">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${plan.completed ? 'bg-green-500/10' : 'bg-bg-elevated'}`}>
          <CheckCircle2 size={20} className={plan.completed ? 'text-green-400' : 'text-muted-dark'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-fg truncate">{plan.title}</span>
            {plan.completed && <span className="text-[0.6875rem] text-green-400 font-semibold">Completed</span>}
          </div>
          {plan.module && (
            <div className="flex items-center gap-2">
              <span className="text-[0.75rem] text-muted-dark">{plan.module.title}</span>
              <span className="text-[0.625rem] px-2 py-0.5 rounded-full bg-bg-elevated text-muted" style={{ background: `var(--color-c-${plan.module.category})15`, color: `var(--color-c-${plan.module.category})` }}>{plan.module.category}</span>
            </div>
          )}
          <div className="text-[0.6875rem] text-muted-dark mt-1">
            {new Date(plan.appliedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={savingId === plan.id}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-[0.75rem] text-green-400 hover:bg-green-500/20 transition-all cursor-pointer disabled:opacity-40"
            >
              {savingId === plan.id ? (
                <div className="w-3.5 h-3.5 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin" />
              ) : (
                <Save size={12} />
              )}
              Save
            </button>
          )}
          <Link
            href={`/models/${plan.module?.slug}/action`}
            className="flex items-center gap-1.5 px-4 py-2 bg-bg-elevated border border-border rounded-xl text-[0.75rem] text-muted hover:text-fg hover:border-border-light transition-all no-underline"
          >
            Edit <ArrowRight size={12} />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 text-muted-dark hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none disabled:opacity-30"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        {matrix.map((row) => (
          <MatrixInput key={row.id} row={row} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}

export default function ActionsPage() {
  const { user } = useAuth();
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

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10 md:py-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-fg rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10 md:py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-[-0.02em] mb-2">Action Plans</h1>
        <p className="text-lg text-muted">Your commitments to apply what you&apos;ve learned</p>
      </header>

      {!plans || plans.length === 0 ? (
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
            {plans.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(plans.length / PER_PAGE))} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
