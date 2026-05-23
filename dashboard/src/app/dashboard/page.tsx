"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  Sparkles,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import Link from "next/link";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";

const fmt = (n: number) => n.toLocaleString("en-US");
const currency = (c: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);

export default function DashboardPage() {
  const { data: modules } = useQuery({
    queryKey: ["admin", "modules"],
    queryFn: async () => {
      const { data } = await api.get("/modules?limit=100");
      return data.data || [];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data } = await api.get("/payments/history?all=true");
      return Array.isArray(data) ? data : data.data || [];
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ["admin", "users-list"],
    queryFn: async () => {
      const { data } = await api.get("/auth/users");
      return Array.isArray(data) ? data : [];
    },
  });

  const totalUsers = allUsers?.length || 0;
  const premiumUsers = allUsers?.filter(
    (u: any) => u.subscriptionStatus && u.subscriptionStatus !== "FREE"
  ) || [];

  const succeededPayments = payments?.filter((p: any) => p.status === "SUCCEEDED") || [];
  const totalRevenue = succeededPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalSessions = payments?.length || 0;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthRevenue = succeededPayments
    .filter((p: any) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const donutData = [
    { name: "Free", value: Math.max(totalUsers - premiumUsers.length, 0), color: "#1f2937" },
    { name: "Premium", value: premiumUsers.length || 0, color: "#f59e0b" },
  ];

  const moduleCatData = modules
    ? Object.entries(
        modules.reduce((acc: any, m: any) => {
          const cat = m.category || "uncategorized";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
        .sort((a, b) => (b.count as number) - (a.count as number))
    : [];

  const recentPayments = (payments as any[])?.slice(0, 8) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">
            Real-time overview of your platform metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 tracking-wide">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Modules"
          value={fmt(modules?.length || 0)}
          icon={BookOpen}
          color="#a78bfa"
          accent="#a78bfa"
        />
        <StatCard
          title="Active Users"
          value={fmt(totalUsers)}
          icon={Users}
          color="#38bdf8"
          accent="#38bdf8"
        />
        <StatCard
          title="Premium Users"
          value={fmt(premiumUsers.length)}
          icon={Sparkles}
          color="#f59e0b"
          accent="#f59e0b"
        />
        <StatCard
          title="Total Revenue"
          value={currency(totalRevenue)}
          icon={DollarSign}
          color="#34d399"
          accent="#34d399"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">User Distribution</h3>
              <p className="text-xs text-white/30 mt-0.5">{fmt(totalUsers)} total users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#1f2937]" />
                <span className="text-white/40">Free</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span className="text-white/40">Premium</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] relative">
            {totalUsers === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,17,17,0.95)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                    formatter={(value: any, name: any) => [fmt(Number(value)), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-white">{premiumUsers.length}</div>
                <div className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Premium</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Modules by Category</h3>
                <p className="text-xs text-white/30 mt-0.5">{fmt(modules?.length || 0)} total modules</p>
              </div>
            </div>
            <div className="h-[240px]">
              {moduleCatData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleCatData} layout="vertical" barCategoryGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(17,17,17,0.95)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {moduleCatData.map((_: any, i: number) => (
                        <Cell
                          key={i}
                          fill={`hsl(${250 + i * 25}, 70%, ${65 - i * 3}%)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 lg:col-span-2 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Payments</h3>
                <p className="text-xs text-white/30 mt-0.5">Last {recentPayments.length} transactions</p>
              </div>
              <Link
                href="/dashboard/payments"
                className="flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-white transition-colors"
              >
                View all <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 py-3">User</th>
                    <th className="text-right text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 py-3">Amount</th>
                    <th className="text-left text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 py-3">Plan</th>
                    <th className="text-left text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 py-3">Status</th>
                    <th className="text-right text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-12 text-center text-white/20 text-sm">No payments yet</td>
                    </tr>
                  ) : (
                    recentPayments.map((p: any, i: number) => (
                      <tr
                        key={p.id || i}
                        className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-xs font-bold text-white/30">
                              {(p.user?.name || p.user?.email || "?")?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white/80">{p.user?.name || "—"}</div>
                              <div className="text-xs text-white/25">{p.user?.email || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right text-sm font-bold text-white tabular-nums">
                          ${(p.amount / 100).toFixed(2)}
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-xs text-white/40 font-medium">{p.planType}</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${
                              p.status === "SUCCEEDED"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : p.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400"
                                : p.status === "REFUNDED"
                                ? "bg-sky-500/10 text-sky-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right text-sm text-white/30 tabular-nums">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="relative">
            <h3 className="text-sm font-bold text-white mb-5">Quick Stats</h3>
            <div className="space-y-4">
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-white/30 mb-2">
                  <TrendingUp size={13} />
                  <span>Total Sessions</span>
                </div>
                <div className="text-xl font-extrabold text-white tabular-nums">{fmt(totalSessions)}</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-white/30 mb-2">
                  <DollarSign size={13} />
                  <span>This Month</span>
                </div>
                <div className="text-xl font-extrabold text-white tabular-nums">{currency(monthRevenue)}</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-white/30 mb-2">
                  <Users size={13} />
                  <span>Premium Rate</span>
                </div>
                <div className="text-xl font-extrabold text-white tabular-nums">
                  {totalUsers > 0 ? ((premiumUsers.length / totalUsers) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
