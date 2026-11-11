"use client";

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

export default function CashflowChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
  );
}
