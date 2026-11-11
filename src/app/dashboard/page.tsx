import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Building2, FileSpreadsheet, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { divisions } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/session";
import { listTransactions } from "@/lib/transactions";
import CashflowChart from "./cashflow-chart";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "YYYY-MM" untuk bulan ini (WIB) dikurangi `back` bulan */
function monthKey(back = 0) {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function pctChange(curr: number, prev: number): string | null {
  if (prev === 0) return null;
  const p = ((curr - prev) / prev) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trx = listTransactions(user);
  const sum = (type: "income" | "expense", month?: string) =>
    trx
      .filter((t) => t.type === type && (!month || t.date.startsWith(month)))
      .reduce((s, t) => s + t.amount, 0);

  const thisMonth = monthKey(0);
  const lastMonth = monthKey(1);
  const incomeNow = sum("income", thisMonth);
  const expenseNow = sum("expense", thisMonth);
  const balance = sum("income") - sum("expense");

  const kpis = [
    { title: "Total Saldo Kas", value: balance, change: null as string | null, good: true, icon: Wallet, color: "from-skyterra-cyan to-skyterra-blue", note: "dari semua transaksi" },
    { title: "Pemasukan Bulan Ini", value: incomeNow, change: pctChange(incomeNow, sum("income", lastMonth)), good: true, icon: TrendingUp, color: "from-emerald-500 to-emerald-600", note: "vs bulan lalu" },
    { title: "Pengeluaran Bulan Ini", value: expenseNow, change: pctChange(expenseNow, sum("expense", lastMonth)), good: false, icon: TrendingDown, color: "from-rose-500 to-rose-600", note: "vs bulan lalu" },
  ];

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const key = monthKey(5 - i);
    return { month: MONTHS[Number(key.slice(5)) - 1], income: sum("income", key), expense: sum("expense", key) };
  });

  const visibleDivisions = user.role === "super_admin" ? divisions.map((d) => d.name) : [user.division];
  const divisionSummary = visibleDivisions.map((name) => {
    const rows = trx.filter((t) => t.division === name);
    const income = rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = rows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { division: name, income, expense, balance: income - expense };
  });

  const recent = trx.slice(0, 5);
  const isEmpty = trx.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bench Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan arus kas dan performa keuangan PT SkyTerra Nusantara</p>
      </div>

      {isEmpty && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white p-5">
          <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-gray-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Belum ada data transaksi</p>
            <p className="text-sm text-gray-500">
              Ringkasan dan grafik akan terisi otomatis setelah transaksi ditambahkan melalui menu{" "}
              <Link href="/dashboard/cashflow" className="text-skyterra-cyan font-semibold hover:underline">
                Arus Kas
              </Link>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpis.map((card) => {
          const up = card.change?.startsWith("+");
          const positive = card.good ? up : !up;
          return (
            <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className={`text-2xl font-bold mt-2 ${isEmpty ? "text-gray-300" : "text-gray-900"}`}>{formatRupiah(card.value)}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    {card.change ? (
                      <>
                        {up ? <ArrowUpRight className={`w-4 h-4 ${positive ? "text-emerald-500" : "text-rose-500"}`} /> : <ArrowDownRight className={`w-4 h-4 ${positive ? "text-emerald-500" : "text-rose-500"}`} />}
                        <span className={`font-semibold ${positive ? "text-emerald-500" : "text-rose-500"}`}>{card.change}</span>
                        <span className="text-gray-400">{card.note}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">{card.title === "Total Saldo Kas" ? card.note : "Belum ada data bulan lalu"}</span>
                    )}
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Tren Arus Kas (6 Bulan Terakhir)</h2>
          <div className="h-72 relative">
            <CashflowChart data={chartData} />
            {isEmpty && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">Belum ada data untuk ditampilkan</p>
            )}
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

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Ringkasan Kas Per Divisi</h2>
          <div className="space-y-4">
            {divisionSummary.map((div) => (
              <div key={div.division} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-skyterra-cyan" />
                  <p className="text-xs font-semibold text-gray-700 truncate">{div.division}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Pemasukan</p>
                    <p className="font-semibold text-emerald-600">{formatRupiah(div.income)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pengeluaran</p>
                    <p className="font-semibold text-rose-500">{formatRupiah(div.expense)}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400">Saldo Bersih</p>
                  <p className="text-sm font-bold text-gray-800">{formatRupiah(div.balance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700">Transaksi Terbaru</h2>
          <Link href="/dashboard/cashflow" className="text-xs font-semibold text-skyterra-cyan hover:underline">
            Lihat Semua →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Belum ada transaksi.</p>
        ) : (
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
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50">
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                      {new Date(t.date + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-medium max-w-xs truncate">{t.description}</td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{t.division}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{t.category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                        {t.type === "income" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${t.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                      {t.type === "income" ? "+" : "-"}
                      {formatRupiah(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
