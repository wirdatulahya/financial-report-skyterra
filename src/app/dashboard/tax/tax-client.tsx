"use client";

import { useState } from "react";
import {
  Calculator,
  Percent,
  Receipt,
  Scale,
  Building2,
  FileSpreadsheet,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import type { Transaction } from "@/lib/mock-data";
import type { SessionUser } from "@/lib/roles";

interface TaxClientProps {
  transactions: Transaction[];
  user: SessionUser;
}

export default function TaxClient({ transactions, user }: TaxClientProps) {
  const [activeTab, setActiveTab] = useState<"rekap" | "simulasi">("rekap");
  const [periodFilter, setPeriodFilter] = useState<"all" | "this_month" | "this_year">("all");

  // State untuk Kalkulator Simulasi Invoice
  const [simNilai, setSimNilai] = useState<string>("50000000"); // Default 50jt
  const [simPphRate, setSimPphRate] = useState<number>(2); // 2% PPh 23
  const [simPpnInclude, setSimPpnInclude] = useState<"exclude" | "include" | "none">("exclude");

  // Filter transaksi pemasukan / pendapatan
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYearKey = `${now.getFullYear()}`;

  const incomeTransactions = transactions.filter((t) => {
    if (t.type !== "income") return false;
    if (periodFilter === "this_month") return t.date.startsWith(currentMonthKey);
    if (periodFilter === "this_year") return t.date.startsWith(currentYearKey);
    return true;
  });

  // Kalkulasi rekapitulasi pajak dari data riil transaksi
  const totalPendapatanProyek = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const estimasiPph23 = Math.round(totalPendapatanProyek * 0.02); // 2% PPh 23 Jasa Survei
  const estimasiPpn = Math.round(totalPendapatanProyek * 0.11); // 11% PPN
  const totalBebanPajak = estimasiPph23 + estimasiPpn;
  const kasBersihSetelahPajak = totalPendapatanProyek - estimasiPph23; // PPh memotong kas masuk

  // Perhitungan Simulasi Invoice
  const rawSimNilai = Number(simNilai.replace(/\D/g, "")) || 0;
  let dpp = rawSimNilai;
  let ppnNominal = 0;

  if (simPpnInclude === "include") {
    // Jika nilai sudah include PPN 11%: DPP = Nilai / 1.11
    dpp = Math.round(rawSimNilai / 1.11);
    ppnNominal = rawSimNilai - dpp;
  } else if (simPpnInclude === "exclude") {
    // Jika belum termasuk PPN: PPN = 11% * DPP
    ppnNominal = Math.round(dpp * 0.11);
  }

  const pphNominal = Math.round(dpp * (simPphRate / 100));
  const totalTagihanKlien = simPpnInclude === "exclude" ? dpp + ppnNominal : rawSimNilai;
  const kasBersihDiterima = totalTagihanKlien - ppnNominal - pphNominal; // Kas riil setelah setor PPN & dipotong PPh

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalkulator & Estimasi Perpajakan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Estimasi beban PPh 23 (Jasa Geospasial/Survei) dan PPN 11% PT SkyTerra Nusantara.
        </p>
      </div>

      {/* Tabs Navigasi */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab("rekap")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "rekap"
              ? "border-skyterra-cyan text-skyterra-cyan"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Scale className="w-4 h-4" />
          Rekapitulasi Pajak Transaksi Riil
        </button>
        <button
          onClick={() => setActiveTab("simulasi")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "simulasi"
              ? "border-skyterra-cyan text-skyterra-cyan"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Kalkulator Simulasi Kontrak / Invoice
        </button>
      </div>

      {activeTab === "rekap" ? (
        <div className="space-y-6">
          {/* Filter Periode */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Periode Rekapitulasi:
              </span>
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setPeriodFilter("all")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    periodFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Semua Waktu
                </button>
                <button
                  onClick={() => setPeriodFilter("this_month")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    periodFilter === "this_month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setPeriodFilter("this_year")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    periodFilter === "this_year" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tahun Ini
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Menampilkan {incomeTransactions.length} transaksi pendapatan proyek kena pajak
            </p>
          </div>

          {/* KPI Cards Perpajakan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Dasar Pengenaan Pajak (DPP)
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-2">
                    {formatRupiah(totalPendapatanProyek)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Akumulasi pendapatan proyek</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-skyterra-cyan/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-skyterra-cyan" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estimasi PPh 23 (2%)
                  </p>
                  <p className="text-xl font-bold text-amber-600 mt-2">
                    {formatRupiah(estimasiPph23)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Dipotong pihak pengguna jasa</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estimasi PPN 11%
                  </p>
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    {formatRupiah(estimasiPpn)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Kewajiban PPN keluaran</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Estimasi Beban
                  </p>
                  <p className="text-xl font-bold text-rose-600 mt-2">
                    {formatRupiah(totalBebanPajak)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">PPh 23 + PPN 11%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-rose-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Transaksi Kena Pajak */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800">
                Rincian Transaksi Pendapatan Proyek Kena Pajak
              </h2>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                Tarif Acuan: PPh 23 (2%) & PPN (11%)
              </span>
            </div>

            {incomeTransactions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold">Belum ada transaksi pendapatan pada periode ini.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Transaksi bertipe pemasukan yang dicatat di menu Arus Kas akan otomatis dikalkulasi di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="text-left py-3 px-3 font-semibold">Tanggal</th>
                      <th className="text-left py-3 px-3 font-semibold">Deskripsi Proyek</th>
                      <th className="text-left py-3 px-3 font-semibold">Divisi</th>
                      <th className="text-right py-3 px-3 font-semibold">Nilai Kontrak (DPP)</th>
                      <th className="text-right py-3 px-3 font-semibold">Est. PPh 23 (2%)</th>
                      <th className="text-right py-3 px-3 font-semibold">Est. PPN (11%)</th>
                      <th className="text-right py-3 px-3 font-semibold">Kas Bersih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeTransactions.map((t) => {
                      const pph = Math.round(t.amount * 0.02);
                      const ppn = Math.round(t.amount * 0.11);
                      const net = t.amount - pph;
                      return (
                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-3 text-gray-500 whitespace-nowrap text-xs">
                            {formatTanggal(t.date)}
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-800 max-w-xs truncate">
                            {t.description}
                          </td>
                          <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                            {t.division}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                            {formatRupiah(t.amount)}
                          </td>
                          <td className="py-3 px-3 text-right text-amber-600 font-medium whitespace-nowrap">
                            -{formatRupiah(pph)}
                          </td>
                          <td className="py-3 px-3 text-right text-blue-600 font-medium whitespace-nowrap">
                            +{formatRupiah(ppn)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                            {formatRupiah(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50/70 font-bold text-gray-900 text-xs">
                      <td colSpan={3} className="py-3 px-3">TOTAL REKAPITULASI</td>
                      <td className="py-3 px-3 text-right">{formatRupiah(totalPendapatanProyek)}</td>
                      <td className="py-3 px-3 text-right text-amber-600">-{formatRupiah(estimasiPph23)}</td>
                      <td className="py-3 px-3 text-right text-blue-600">+{formatRupiah(estimasiPpn)}</td>
                      <td className="py-3 px-3 text-right text-emerald-600">{formatRupiah(kasBersihSetelahPajak)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Kalkulator Simulasi Kontrak / Invoice */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Input Simulasi */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-skyterra-cyan" />
              Parameter Kontrak Proyek
            </h2>

            {/* Input Nilai Kontrak */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Nilai Proyek / Kontrak (Rp)
              </label>
              <input
                type="text"
                value={new Intl.NumberFormat("id-ID").format(rawSimNilai)}
                onChange={(e) => setSimNilai(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan"
              />
            </div>

            {/* Pilihan Tarif PPh */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tarif Pemotongan PPh
              </label>
              <select
                value={simPphRate}
                onChange={(e) => setSimPphRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan"
              >
                <option value={2}>PPh 23 — Jasa Survei & Pemetaan Geospasial (2.0%)</option>
                <option value={1.75}>PPh Final 4(2) — Perencanaan/Konsultansi Konstruksi (1.75%)</option>
                <option value={2.65}>PPh Final 4(2) — Pengawasan Konstruksi (2.65%)</option>
                <option value={0}>Bebas Potong PPh (0%)</option>
              </select>
            </div>

            {/* Pilihan Perlakuan PPN */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Perlakuan PPN (11%)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSimPpnInclude("exclude")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    simPpnInclude === "exclude"
                      ? "border-skyterra-cyan bg-skyterra-cyan/10 text-skyterra-cyan"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  + PPN 11% (Exclude)
                </button>
                <button
                  type="button"
                  onClick={() => setSimPpnInclude("include")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    simPpnInclude === "include"
                      ? "border-skyterra-cyan bg-skyterra-cyan/10 text-skyterra-cyan"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Termasuk PPN (Include)
                </button>
                <button
                  type="button"
                  onClick={() => setSimPpnInclude("none")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    simPpnInclude === "none"
                      ? "border-skyterra-cyan bg-skyterra-cyan/10 text-skyterra-cyan"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Non-PPN
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                setSimNilai("50000000");
                setSimPphRate(2);
                setSimPpnInclude("exclude");
              }}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1.5 pt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kembalikan ke Nilai Awal
            </button>
          </div>

          {/* Kartu Hasil Perhitungan */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Rincian Tagihan & Hasil Bersih
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-600">Dasar Pengenaan Pajak (DPP Jasa):</span>
                  <span className="font-semibold text-gray-900">{formatRupiah(dpp)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-blue-600">PPN 11% (Ditagihkan ke Klien):</span>
                  <span className="font-semibold text-blue-600">+{formatRupiah(ppnNominal)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm bg-gray-50 px-3 rounded-lg">
                  <span className="font-bold text-gray-800">Total Nilai Tagihan (Invoice Klien):</span>
                  <span className="font-bold text-gray-900 text-base">{formatRupiah(totalTagihanKlien)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-amber-600">
                    Potongan PPh {simPphRate}% (Dipotong oleh Klien):
                  </span>
                  <span className="font-semibold text-amber-600">-{formatRupiah(pphNominal)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500">Estimasi PPN Disetor ke Kas Negara:</span>
                  <span className="font-medium text-gray-500">-{formatRupiah(ppnNominal)}</span>
                </div>
              </div>
            </div>

            {/* Total Kas Riil */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 bg-emerald-50/60 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Estimasi Kas Bersih Diterima Perusahaan
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    DPP setelah dipotong PPh (uang riil operasional SkyTerra)
                  </p>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatRupiah(dpp - pphNominal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
