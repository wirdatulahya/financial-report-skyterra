"use client";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/utils";
import {
  monthlyCashflow,
  divisionSummary,
  transactions,
} from "@/lib/mock-data";

// ──────────────── KPI Cards ────────────────
const kpiCards = [
  {
    title: "Total Saldo Kas",
    value: 710500000,
    change: "+8.2%",
    trend: "up" as const,
    icon: Wallet,
    color: "from-skyterra-cyan to-skyterra-blue",
  },
  {
    title: "Pemasukan Bulan Ini",
    value: 295000000,
    change: "+15.4%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    title: "Pengeluaran Bulan Ini",
    value: 140000000,
    change: "+4.1%",
    trend: "down" as const,
    icon: TrendingDown,
    color: "from-rose-500 to-rose-600",
  },
];

// ──────────────── Custom Tooltip untuk Chart ────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === "income" ? "Pemasukan" : "Pengeluaran"}:{" "}
          {formatRupiah(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ──────────────── Dashboard Page ────────────────
export default function DashboardPage() {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bench Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan arus kas dan performa keuangan PT SkyTerra Nusantara
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatRupiah(card.value)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-500" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      card.trend === "up"
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-xs text-gray-400">vs bulan lalu</span>
                </div>
              </div>
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Divisi Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-4">
            Tren Arus Kas (6 Bulan Terakhir)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCashflow}>
                <defs>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00a3e0" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00a3e0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `${(v / 1000000).toFixed(0)} jt`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#00a3e0"
                  strokeWidth={2.5}
                  fill="url(#gradIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fill="url(#gradExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-skyterra-cyan" />
              <span className="text-xs text-gray-500">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-xs text-gray-500">Pengeluaran</span>
            </div>
          </div>
        </div>

        {/* Ringkasan Per Divisi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-4">
            Ringkasan Kas Per Divisi
          </h2>
          <div className="space-y-4">
            {divisionSummary.map((div) => (
              <div
                key={div.division}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-skyterra-cyan" />
                  <p className="text-xs font-semibold text-gray-700 truncate">
                    {div.division}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Pemasukan</p>
                    <p className="font-semibold text-emerald-600">
                      {formatRupiah(div.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pengeluaran</p>
                    <p className="font-semibold text-rose-500">
                      {formatRupiah(div.expense)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400">Saldo Bersih</p>
                  <p className="text-sm font-bold text-gray-800">
                    {formatRupiah(div.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terbaru */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700">
            Transaksi Terbaru
          </h2>
          <a
            href="/dashboard/cashflow"
            className="text-xs font-semibold text-skyterra-cyan hover:underline"
          >
            Lihat Semua →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-3 px-3 font-semibold">Tanggal</th>
                <th className="text-left py-3 px-3 font-semibold">Keterangan</th>
                <th className="text-left py-3 px-3 font-semibold">Divisi</th>
                <th className="text-left py-3 px-3 font-semibold">Kategori</th>
                <th className="text-left py-3 px-3 font-semibold">Jenis</th>
                <th className="text-right py-3 px-3 font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                    {new Date(trx.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-3 text-gray-800 font-medium max-w-xs truncate">
                    {trx.description}
                  </td>
                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                    {trx.division}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {trx.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        trx.type === "income"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {trx.type === "income" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${
                      trx.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }`}
                  >
                    {trx.type === "income" ? "+" : "-"}
                    {formatRupiah(trx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
