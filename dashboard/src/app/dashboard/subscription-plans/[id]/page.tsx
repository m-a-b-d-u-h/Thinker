"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, AlertTriangle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface PlanForm {
  planType: "MONTHLY" | "YEARLY" | "LIFETIME";
  name: string;
  slug: string;
  description: string;
  price: number;
  interval: string | null;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  lemonsqueezyVariantId: string | null;
}

export default function SubscriptionPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const isNew = id === "new";

  const [form, setForm] = useState<PlanForm>({
    planType: "MONTHLY",
    name: "",
    slug: "",
    description: "",
    price: 0,
    interval: "month",
    features: [],
    isActive: true,
    sortOrder: 0,
    lemonsqueezyVariantId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["subscription-plan", id],
    queryFn: async () => {
      const { data } = await api.get(`/subscription-plans/${id}`);
      return data;
    },
    enabled: !!id && !isNew,
  });

  useEffect(() => {
    if (plan && !isNew) {
      setForm({
        planType: plan.planType,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price: plan.price,
        interval: plan.interval,
        features: plan.features || [],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
        lemonsqueezyVariantId: plan.lemonsqueezyVariantId || null,
      });
    }
  }, [plan, isNew]);

  const updateField = useCallback(<K extends keyof PlanForm>(key: K, value: PlanForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: PlanForm) => {
      const { data: res } = await api.post("/subscription-plans", data);
      return res;
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Plan created");
      router.replace(`/dashboard/subscription-plans/${res.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to create");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PlanForm) => {
      const { data: res } = await api.patch(`/subscription-plans/${id}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", id] });
      toast.success("Plan updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { await api.delete(`/subscription-plans/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Plan deleted");
      router.replace("/dashboard/subscription-plans");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to delete");
      setDeleting(false);
    },
  });

  const handleSave = () => {
    if (isNew) { createMutation.mutate(form); }
    else { updateMutation.mutate(form); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[720px] space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/subscription-plans"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-all"
        >
          <ArrowLeft size={16} /> Back to Plans
        </Link>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || createMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white text-black hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Save size={15} /> {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-5">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Plan Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/40">Name</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
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
            <label className="text-xs font-medium text-white/40">Plan Type</label>
            <select
              value={form.planType}
              onChange={(e) => updateField("planType", e.target.value as PlanForm["planType"])}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="LIFETIME">Lifetime</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/40">Interval</label>
            <select
              value={form.interval || ""}
              onChange={(e) => updateField("interval", e.target.value || null)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
            >
              <option value="">None (lifetime)</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/40">Price (cents)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", parseInt(e.target.value) || 0)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
            />
            <p className="text-[10px] text-white/20">${(form.price / 100).toFixed(2)}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/40">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => updateField("sortOrder", parseInt(e.target.value) || 0)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
            />
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

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-xs font-medium text-white/40">Active</span>
            <button
              type="button"
              onClick={() => updateField("isActive", !form.isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40">Lemon Squeezy Variant ID (optional)</label>
          <input
            value={form.lemonsqueezyVariantId || ""}
            onChange={(e) => updateField("lemonsqueezyVariantId", e.target.value || null)}
            placeholder="123456"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all font-mono placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Features</h3>
          <button
            onClick={() => updateField("features", [...form.features, ""])}
            className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white transition-all"
          >
            <Plus size={13} /> Add Feature
          </button>
        </div>
        <div className="space-y-2">
          {form.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={feat}
                onChange={(e) => {
                  const n = [...form.features];
                  n[i] = e.target.value;
                  updateField("features", n);
                }}
                placeholder="Feature description"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all placeholder:text-white/20"
              />
              <button
                onClick={() => updateField("features", form.features.filter((_, j) => j !== i))}
                className="text-white/20 hover:text-red-400 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {form.features.length === 0 && (
            <p className="text-xs text-white/20 text-center py-4">No features added</p>
          )}
        </div>
      </div>

      {/* Delete */}
      {!isNew && (
        <div className="border border-red-500/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
              <p className="text-xs text-white/30 mt-1">Permanently delete this plan.</p>
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
                  <AlertTriangle size={14} /> Delete
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
      )}
    </div>
  );
}
