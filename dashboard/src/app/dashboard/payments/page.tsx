"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import { RefreshCw } from "lucide-react";

export default function PaymentsPage() {
  const { data: payments, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data } = await api.get("/payments/history?all=true");
      return Array.isArray(data) ? data : data.data || [];
    },
    refetchInterval: 5000,
  });

  const columns = [
    {
      key: "user",
      label: "User",
      sortable: true,
      render: (p: any) => (
        <div className="text-sm">
          <div className="text-white">{p.user?.name || "—"}</div>
          <div className="text-[#555] text-xs">{p.user?.email || "—"}</div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (p: any) => <span className="text-white font-semibold">${(p.amount / 100).toFixed(2)}</span>,
    },
    {
      key: "planType",
      label: "Plan",
      sortable: true,
      render: (p: any) => (
        <span className="text-xs bg-white/5 px-2.5 py-1 rounded-full text-[#888]">
          {p.planType}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p: any) => (
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            p.status === "SUCCEEDED"
              ? "bg-[#34d3991a] text-[#34d399]"
              : p.status === "PENDING"
              ? "bg-[#ffb8001a] text-[#ffb800]"
              : p.status === "REFUNDED"
              ? "bg-[#38bdf81a] text-[#38bdf8]"
              : "bg-[#ef44441a] text-[#ef4444]"
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: "stripePaymentId",
      label: "Stripe ID",
      render: (p: any) => (
        <span className="text-[#555] text-xs font-mono">
          {p.stripePaymentId?.slice(0, 14)}...
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (p: any) => (
        <span className="text-[#555]">
          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Payments</h2>
          <p className="text-sm text-[#666] mt-1">View transaction history and subscription revenue.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 bg-white/5 text-sm text-[#888] px-3 py-2 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <DataTable
        columns={columns}
        data={payments || []}
        searchKeys={["stripePaymentId", "planType", "status", "user.email", "user.name"]}
      />
    </div>
  );
}
