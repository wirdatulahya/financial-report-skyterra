"use client";

import { useState } from "react";
import {
  Printer,
  Download,
  Calendar,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { divisions } from "@/lib/mock-data";
import type { Transaction } from "@/lib/mock-data";
import type { SessionUser } from "@/lib/roles";

interface ReportsClientProps {
  transactions: Transaction[];
  user: SessionUser;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function ReportsClient({ transactions, user }: ReportsClientProps) {
  const now = new Date();
  const [periodType, setPeriodType] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-11
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(now.getMonth() / 3) + 1); // 1-4
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  // Filter transaksi berdasarkan periode
  const filtered = transactions.filter((t) => {
    // Filter divisi
    if (selectedDivision !== "all" && t.division !== selectedDivision) return false;
    // Batasan user non-super-admin
    if (user.role === "manajer_divisi" && t.division !== user.division) return false;

    const [tYear, tMonth] = t.date.split("-").map(Number);
    if (tYear !== selectedYear) return false;

    if (periodType === "monthly") {
      return tMonth === selectedMonth + 1;
    }

    if (periodType === "quarterly") {
      const qStart = (selectedQuarter - 1) * 3 + 1;
      const qEnd = selectedQuarter * 3;
      return tMonth >= qStart && tMonth <= qEnd;
    }

    if (periodType === "yearly") {
      return true;
    }

    return true;
  });

  // Urutkan transaksi dari tanggal terlama ke terbaru untuk buku kas
  const sortedTransactions = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  // Hitung total pemasukan & pengeluaran
  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  // Rekapitulasi per divisi
  const visibleDivisions =
    user.role === "super_admin"
      ? selectedDivision === "all"
        ? divisions.map((d) => d.name)
        : [selectedDivision]
      : [user.division];

  const divisionStats = visibleDivisions.map((divName) => {
    const dRows = filtered.filter((t) => t.division === divName);
    const inc = dRows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = dRows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { name: divName, income: inc, expense: exp, net: inc - exp };
  });

  // Label periode untuk dokumen cetak
  const periodLabel =
    periodType === "monthly"
      ? `Bulan ${MONTH_NAMES[selectedMonth]} ${selectedYear}`
      : periodType === "quarterly"
      ? `Kuartal ${selectedQuarter} (Tahun ${selectedYear})`
      : `Tahun Anggaran ${selectedYear}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Kontrol Filter & Tombol Cetak (Tidak ikut tercetak saat print) */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan & Arus Kas</h1>
            <p className="text-sm text-gray-500 mt-1">
              Pratinjau dan unduh dokumen financial report resmi berformat PDF.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-md transition-all shrink-0"
          >
            <Printer className="w-4 h-4" />
            Cetak / Unduh PDF
          </button>
        </div>

        {/* Baris Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center gap-4 text-xs">
          {/* Tipe Periode */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Rentang:</span>
            <div className="flex bg-gray-100 p-0.5 rounded-lg font-semibold">
              <button
                onClick={() => setPeriodType("monthly")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  periodType === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setPeriodType("quarterly")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  periodType === "quarterly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Kuartalan
              </button>
              <button
                onClick={() => setPeriodType("yearly")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  periodType === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Tahunan
              </button>
            </div>
          </div>

          {/* Pemilihan Bulan (jika Bulanan) */}
          {periodType === "monthly" && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-600">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pemilihan Kuartal (jika Kuartalan) */}
          {periodType === "quarterly" && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-600">Kuartal:</span>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none"
              >
                <option value={1}>Kuartal I (Jan - Mar)</option>
                <option value={2}>Kuartal II (Apr - Jun)</option>
                <option value={3}>Kuartal III (Jul - Sep)</option>
                <option value={4}>Kuartal IV (Okt - Des)</option>
              </select>
            </div>
          )}

          {/* Pemilihan Tahun */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-600">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Pemilihan Divisi (Super Admin) */}
          {user.role === "super_admin" && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-600">Divisi:</span>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none"
              >
                <option value="all">Semua Divisi</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Lembar Dokumen Laporan Resmi (Printable Sheet) */}
      <div className="printable-document bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm text-gray-900 max-w-4xl mx-auto">
        {/* Kop Surat Perusahaan */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl font-black tracking-wider text-gray-950 uppercase">
                PT SKYTERRA NUSANTARA
              </h2>
              <p className="text-xs font-semibold text-gray-700 tracking-wide">
                Spatial, Surveying & Geospatial Technology Services
              </p>
              <p className="text-[11px] text-gray-500">
                Jl. Ir. H. Juanda, Kemiri Muka, Kecamatan Beji, Kota Depok, Jawa Barat 16423
              </p>
              <p className="text-[10px] text-gray-400">
                Portal: financial-report.skyterra.id • Email: finance@skyterra.id
              </p>
            </div>
            <div className="text-right border-l-2 border-gray-300 pl-4 py-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-skyterra-blue block">
                Financial Report
              </span>
              <span className="text-xs font-mono font-semibold text-gray-600">
                DOC: FR/STN/{selectedYear}/
                {periodType === "monthly" ? String(selectedMonth + 1).padStart(2, "0") : `Q${selectedQuarter}`}
              </span>
            </div>
          </div>
        </div>

        {/* Judul Laporan */}
        <div className="text-center my-6">
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 underline decoration-2 underline-offset-4">
            LAPORAN ARUS KAS & POSISI KEUANGAN
          </h3>
          <p className="text-xs font-semibold text-gray-600 mt-1">Periode: {periodLabel}</p>
          <p className="text-[11px] text-gray-400">
            Cakupan: {selectedDivision === "all" ? "Konsolidasi Seluruh Divisi" : selectedDivision}
          </p>
        </div>

        {/* Bagian I: Ringkasan Eksekutif Arus Kas */}
        <div className="my-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-3">
            I. Ringkasan Arus Kas (Cash Flow Summary)
          </h4>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Total Arus Kas Masuk (Pemasukan Proyek)</td>
                <td className="py-2 text-right font-bold text-emerald-600">
                  {formatRupiah(totalIncome)}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">
                  Total Arus Kas Keluar (Beban Operasional & Pengadaan)
                </td>
                <td className="py-2 text-right font-bold text-rose-600">
                  ({formatRupiah(totalExpense)})
                </td>
              </tr>
              <tr className="bg-gray-50/80 font-bold">
                <td className="py-2.5 px-2 text-gray-900">
                  Arus Kas Bersih Periode Ini (Surplus / Defisit)
                </td>
                <td
                  className={`py-2.5 px-2 text-right text-sm ${
                    netCashflow >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatRupiah(netCashflow)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bagian II: Rekapitulasi per Divisi */}
        <div className="my-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-3">
            II. Kinerja Kas per Divisi Operasional
          </h4>
          <table className="w-full text-xs border border-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
              <tr>
                <th className="py-2 px-3 text-left">Divisi</th>
                <th className="py-2 px-3 text-right">Pemasukan</th>
                <th className="py-2 px-3 text-right">Pengeluaran</th>
                <th className="py-2 px-3 text-right">Saldo Bersih</th>
              </tr>
            </thead>
            <tbody>
              {divisionStats.map((d) => (
                <tr key={d.name} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium text-gray-800">{d.name}</td>
                  <td className="py-2 px-3 text-right text-emerald-600">{formatRupiah(d.income)}</td>
                  <td className="py-2 px-3 text-right text-rose-600">{formatRupiah(d.expense)}</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">
                    {formatRupiah(d.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bagian III: Rincian Transaksi Buku Kas */}
        <div className="my-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-3">
            III. Rincian Buku Kas Transaksi ({filtered.length} Transaksi)
          </h4>
          {sortedTransactions.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">
              Tidak ada catatan transaksi pada periode yang dipilih.
            </p>
          ) : (
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                <tr>
                  <th className="py-2 px-2 text-left">Tgl</th>
                  <th className="py-2 px-2 text-left">Keterangan</th>
                  <th className="py-2 px-2 text-left">Divisi</th>
                  <th className="py-2 px-2 text-left">Kategori</th>
                  <th className="py-2 px-2 text-right">Masuk (Debit)</th>
                  <th className="py-2 px-2 text-right">Keluar (Kredit)</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 text-[11px]">
                    <td className="py-1.5 px-2 text-gray-600 whitespace-nowrap">
                      {t.date.slice(5)}
                    </td>
                    <td className="py-1.5 px-2 font-medium text-gray-900">{t.description}</td>
                    <td className="py-1.5 px-2 text-gray-600 whitespace-nowrap">{t.division}</td>
                    <td className="py-1.5 px-2 text-gray-500">{t.category}</td>
                    <td className="py-1.5 px-2 text-right text-emerald-600 font-medium whitespace-nowrap">
                      {t.type === "income" ? formatRupiah(t.amount) : "-"}
                    </td>
                    <td className="py-1.5 px-2 text-right text-rose-600 font-medium whitespace-nowrap">
                      {t.type === "expense" ? formatRupiah(t.amount) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold text-[11px] border-t border-gray-200">
                <tr>
                  <td colSpan={4} className="py-2 px-2 text-gray-800">TOTAL PERIODE</td>
                  <td className="py-2 px-2 text-right text-emerald-700">{formatRupiah(totalIncome)}</td>
                  <td className="py-2 px-2 text-right text-rose-700">{formatRupiah(totalExpense)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Bagian IV: Lembar Pengesahan & Tanda Tangan */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-start text-xs">
            <div className="text-left space-y-16">
              <div>
                <p className="text-gray-500">Disusun oleh,</p>
                <p className="font-semibold text-gray-800 mt-1">Staf Keuangan / Pelapor</p>
              </div>
              <div>
                <p className="font-bold underline text-gray-900">{user.name}</p>
                <p className="text-[10px] text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="text-right space-y-16">
              <div>
                <p className="text-gray-500">Depok, {formatTanggal(now)}</p>
                <p className="font-semibold text-gray-800 mt-1">Mengetahui & Menyetujui,</p>
              </div>
              <div>
                <p className="font-bold underline text-gray-900">Rio Candra Indrawan</p>
                <p className="text-[10px] text-gray-500">Founder & CEO PT SkyTerra Nusantara</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
