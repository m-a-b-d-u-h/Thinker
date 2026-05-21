"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Target, Trash2 } from "lucide-react";
import { actionsApi } from "@/lib/api/actions";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/lib/auth-context";
import type { ActionPlan } from "@/lib/types";

const PER_PAGE = 10;

export default function ActionsPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPlans = async () => {
    try {
      const data = await actionsApi.list();
      setPlans(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPlans();
    else setLoading(false);
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await actionsApi.remove(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch {
      // silently fail
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 text-center">
        <h1 className="text-3xl font-black mb-4">Sign in to view your action plans</h1>
        <Link href="/login" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-[-0.02em] mb-2">Action Plans</h1>
        <p className="text-lg text-[#666]">Your commitments to apply what you&apos;ve learned</p>
      </header>

      {plans.length === 0 ? (
        <div className="bg-[#0d0d0d] rounded-2xl p-12 border border-white/5 text-center">
          <Target size={40} className="mx-auto mb-4 text-[#333]" />
          <p className="text-[0.875rem] text-[#555] mb-2">No action plans yet.</p>
          <p className="text-[0.8125rem] text-[#444] mb-6">Start by marking an action plan as applied on any module.</p>
          <Link href="/models" className="inline-flex items-center gap-1.5 bg-white text-black px-6 py-3 rounded-xl font-semibold text-[0.875rem]">
            Explore modules <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {plans.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((plan) => (
            <div key={plan.id} className="bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-4 px-6 py-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${plan.completed ? 'bg-green-500/10' : 'bg-white/5'}`}>
                  <CheckCircle2 size={20} className={plan.completed ? 'text-green-400' : 'text-[#333]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white truncate">{plan.title}</span>
                    {plan.completed && <span className="text-[0.6875rem] text-green-400 font-semibold">Completed</span>}
                  </div>
                  {plan.module && (
                    <div className="flex items-center gap-2">
                      <span className="text-[0.75rem] text-[#555]">{plan.module.title}</span>
                      <span className="text-[0.625rem] px-2 py-0.5 rounded-full bg-white/5 text-[#555]" style={{ background: `var(--color-c-${plan.module.category})15`, color: `var(--color-c-${plan.module.category})` }}>{plan.module.category}</span>
                    </div>
                  )}
                  <div className="text-[0.6875rem] text-[#444] mt-1">
                    {plan.content.length} {plan.content.length > 1 ? 'items' : 'item'} · {new Date(plan.appliedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/models/${plan.module?.slug}/action`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[0.75rem] text-[#888] hover:text-white hover:border-white/20 transition-all no-underline"
                  >
                    View <ArrowRight size={12} />
                  </Link>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-[#555] hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(plans.length / PER_PAGE))} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
