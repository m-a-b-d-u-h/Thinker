"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import DataTable from "@/components/DataTable";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function SubscriptionPlansPage() {
  const router = useRouter();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data } = await api.get("/subscription-plans");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (p: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white">
            {p.name?.charAt(0)}
          </div>
          <div>
            <div className="text-white font-medium">{p.name}</div>
            <div className="text-[#555] text-xs">{p.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "planType",
      label: "Type",
      sortable: true,
      render: (p: any) => (
        <span className="text-xs font-mono text-white/50">{p.planType}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (p: any) => (
        <span className="text-sm font-bold text-white">${(p.price / 100).toFixed(2)}</span>
      ),
    },
    {
      key: "interval",
      label: "Interval",
      render: (p: any) => (
        <span className="text-xs text-white/40">{p.interval || "—"}</span>
      ),
    },
    {
      key: "isActive",
      label: "Active",
      sortable: true,
      render: (p: any) => (
        p.isActive ? (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
        ) : (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400">Inactive</span>
        )
      ),
    },
    {
      key: "sortOrder",
      label: "Order",
      render: (p: any) => (
        <span className="text-xs text-white/30">{p.sortOrder}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Subscription Plans</h1>
          <p className="text-sm text-[#555] mt-1">Manage pricing plans and features</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/subscription-plans/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white text-black hover:opacity-90 transition-all"
        >
          <Plus size={16} /> Add Plan
        </button>
      </div>

      <DataTable
        columns={columns}
        data={plans || []}
        onRowClick={(row) => router.push(`/dashboard/subscription-plans/${row.id}`)}
      />
    </div>
  );
}
