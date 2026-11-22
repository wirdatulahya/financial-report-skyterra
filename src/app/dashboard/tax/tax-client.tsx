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
  CheckCircle2,
  Ban,
  Filter,
  AlertTriangle,
  ArrowRightLeft,
  ShieldCheck,
  Coins,
  CheckCircle,
  HelpCircle,
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
  const [taxFilter, setTaxFilter] = useState<"all" | "taxable" | "exempt">("all");

  // State untuk menandai transaksi mana saja yang dibebaskan dari pajak
  const [exemptIds, setExemptIds] = useState<Set<string>>(new Set());

  // State untuk Kalkulator Simulasi Invoice
  const [simNilai, setSimNilai] = useState<string>("50000000"); // Default 50jt
  const [simPphRate, setSimPphRate] = useState<number>(2); // 2% PPh 23
  const [simPpnInclude, setSimPpnInclude] = useState<"exclude" | "include" | "none">("exclude");
  const [simActualDisburse, setSimActualDisburse] = useState<string>(""); // Nominal riil mutasi pencairan

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

  const toggleExempt = (id: string) => {
    setExemptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const markAllExempt = () => {
    setExemptIds(new Set(incomeTransactions.map((t) => t.id)));
  };

  const markAllTaxable = () => {
    setExemptIds(new Set());
  };

  // Filter tampilan tabel berdasarkan status pajak
  const displayedTransactions = incomeTransactions.filter((t) => {
    const isExempt = exemptIds.has(t.id);
    if (taxFilter === "taxable") return !isExempt;
    if (taxFilter === "exempt") return isExempt;
    return true;
  });

  // Kalkulasi rekapitulasi pajak dari data riil transaksi
  const totalSemuaPemasukan = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Transaksi yang kena pajak vs bebas pajak
  const taxableTransactions = incomeTransactions.filter((t) => !exemptIds.has(t.id));
  const exemptTransactions = incomeTransactions.filter((t) => exemptIds.has(t.id));

  const totalDppKenaPajak = taxableTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBebasPajak = exemptTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const estimasiPph23 = Math.round(totalDppKenaPajak * 0.02); // 2% PPh 23
  const estimasiPpn = Math.round(totalDppKenaPajak * 0.11); // 11% PPN
  const totalBebanPajak = estimasiPph23 + estimasiPpn;
  const kasBersihSetelahPajak = totalSemuaPemasukan - estimasiPph23; // PPh memotong kas masuk

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
  const estimasiTransferMasukKlien = totalTagihanKlien - pphNominal; // Transfer riil dari klien setelah dipotong PPh
  const kasBersihOperasional = dpp - pphNominal; // Kas riil milik SkyTerra setelah sisih PPN
  const totalSelisihPajak = totalTagihanKlien - kasBersihOperasional; // Total selisih pajak
  const rawActualDisburse = Number(simActualDisburse.replace(/\D/g, "")) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalkulator & Estimasi Perpajakan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Estimasi beban PPh 23 (Jasa Geospasial/Survei), PPN 11%, serta opsi penanganan proyek Bebas Pajak.
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
          {/* Filter Periode & Status Pajak */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Waktu */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Periode:
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

              {/* Filter Status Pajak */}
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status:
                </span>
                <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setTaxFilter("all")}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      taxFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Semua ({incomeTransactions.length})
                  </button>
                  <button
                    onClick={() => setTaxFilter("taxable")}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      taxFilter === "taxable" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Kena Pajak ({taxableTransactions.length})
                  </button>
                  <button
                    onClick={() => setTaxFilter("exempt")}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      taxFilter === "exempt" ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Bebas Pajak ({exemptTransactions.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Toggle Buttons */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={markAllExempt}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
                title="Tandai semua transaksi sebagai proyek bebas pajak"
              >
                Set Semua Bebas Pajak
              </button>
              <button
                onClick={markAllTaxable}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
                title="Kembalikan semua transaksi ke status kena pajak"
              >
                Set Semua Kena Pajak
              </button>
            </div>
          </div>

          {/* KPI Cards Perpajakan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dasar Pengenaan Pajak (DPP)
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-2">
                    {formatRupiah(totalDppKenaPajak)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {taxableTransactions.length} proyek kena pajak ({formatRupiah(totalBebasPajak)} bebas pajak)
                  </p>
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
                  <p className="text-[11px] text-gray-400 mt-1">
                    {estimasiPph23 === 0 ? "Tidak ada potongan PPh" : "Dipotong pengguna jasa"}
                  </p>
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
                  <p className="text-[11px] text-gray-400 mt-1">
                    {estimasiPpn === 0 ? "Bebas kewajiban PPN" : "PPN keluaran disetor"}
                  </p>
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
                    Total Kas Bersih Riil
                  </p>
                  <p className="text-xl font-bold text-emerald-600 mt-2">
                    {formatRupiah(kasBersihSetelahPajak)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Total pendapatan - potongan PPh
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Transaksi Kena Pajak & Bebas Pajak */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Rincian Transaksi Pendapatan Proyek
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Klik tombol status pada tabel untuk mengubah antara <strong>Kena Pajak</strong> atau <strong>Bebas Pajak (0%)</strong>.
                </p>
              </div>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                Tarif Default: PPh 23 (2%) & PPN (11%)
              </span>
            </div>

            {displayedTransactions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold">Tidak ada transaksi yang cocok dengan filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="text-left py-3 px-3 font-semibold">Tanggal</th>
                      <th className="text-left py-3 px-3 font-semibold">Deskripsi Proyek</th>
                      <th className="text-left py-3 px-3 font-semibold">Divisi</th>
                      <th className="text-center py-3 px-3 font-semibold">Status Pajak</th>
                      <th className="text-right py-3 px-3 font-semibold">Nilai Proyek</th>
                      <th className="text-right py-3 px-3 font-semibold">Est. PPh 23 (2%)</th>
                      <th className="text-right py-3 px-3 font-semibold">Est. PPN (11%)</th>
                      <th className="text-right py-3 px-3 font-semibold">Kas Bersih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTransactions.map((t) => {
                      const isExempt = exemptIds.has(t.id);
                      const pph = isExempt ? 0 : Math.round(t.amount * 0.02);
                      const ppn = isExempt ? 0 : Math.round(t.amount * 0.11);
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
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => toggleExempt(t.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                                isExempt
                                  ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              }`}
                              title="Klik untuk ubah status pajak"
                            >
                              {isExempt ? "Bebas Pajak (0%)" : "Kena Pajak"}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                            {formatRupiah(t.amount)}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap font-medium">
                            {isExempt ? (
                              <span className="text-gray-400">Rp 0</span>
                            ) : (
                              <span className="text-amber-600">-{formatRupiah(pph)}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap font-medium">
                            {isExempt ? (
                              <span className="text-gray-400">Rp 0</span>
                            ) : (
                              <span className="text-blue-600">+{formatRupiah(ppn)}</span>
                            )}
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
                      <td colSpan={4} className="py-3 px-3">
                        TOTAL REKAPITULASI ({displayedTransactions.length} Transaksi)
                      </td>
                      <td className="py-3 px-3 text-right">
                        {formatRupiah(displayedTransactions.reduce((s, t) => s + t.amount, 0))}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-600">
                        -{formatRupiah(
                          displayedTransactions
                            .filter((t) => !exemptIds.has(t.id))
                            .reduce((s, t) => s + Math.round(t.amount * 0.02), 0)
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-blue-600">
                        +{formatRupiah(
                          displayedTransactions
                            .filter((t) => !exemptIds.has(t.id))
                            .reduce((s, t) => s + Math.round(t.amount * 0.11), 0)
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-600">
                        {formatRupiah(
                          displayedTransactions.reduce((s, t) => {
                            const pph = exemptIds.has(t.id) ? 0 : Math.round(t.amount * 0.02);
                            return s + (t.amount - pph);
                          }, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Kalkulator Simulasi Kontrak / Invoice */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Input Simulasi */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-skyterra-cyan" />
                Parameter Kontrak Proyek
              </h2>
              {/* Tombol Cepat Bebas Pajak */}
              <button
                type="button"
                onClick={() => {
                  setSimPphRate(0);
                  setSimPpnInclude("none");
                }}
                className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                title="Atur PPh ke 0% dan PPN ke Non-PPN"
              >
                <Ban className="w-3 h-3" />
                Set Bebas Pajak
              </button>
            </div>

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
                <option value={0}>Bebas Potong PPh (0%) — Tanpa Pajak</option>
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
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Non-PPN (0%)
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
              Kembalikan ke Tarif Default (PPh 2% & PPN 11%)
            </button>
          </div>

          {/* Kartu Hasil Perhitungan */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Rincian Tagihan & Hasil Bersih
                {simPphRate === 0 && simPpnInclude === "none" && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-auto">
                    Mode Bebas Pajak
                  </span>
                )}
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-600">Dasar Pengenaan Pajak (DPP Jasa):</span>
                  <span className="font-semibold text-gray-900">{formatRupiah(dpp)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className={simPpnInclude === "none" ? "text-gray-400" : "text-blue-600"}>
                    PPN {simPpnInclude === "none" ? "0%" : "11%"} (Ditagihkan ke Klien):
                  </span>
                  <span className={`font-semibold ${simPpnInclude === "none" ? "text-gray-400" : "text-blue-600"}`}>
                    {simPpnInclude === "none" ? "Rp 0" : `+${formatRupiah(ppnNominal)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm bg-gray-50 px-3 rounded-lg">
                  <span className="font-bold text-gray-800">Total Nilai Tagihan (Invoice Klien):</span>
                  <span className="font-bold text-gray-900 text-base">{formatRupiah(totalTagihanKlien)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className={simPphRate === 0 ? "text-gray-400" : "text-amber-600"}>
                    Potongan PPh {simPphRate}% (Dipotong oleh Klien):
                  </span>
                  <span className={`font-semibold ${simPphRate === 0 ? "text-gray-400" : "text-amber-600"}`}>
                    {simPphRate === 0 ? "Rp 0" : `-${formatRupiah(pphNominal)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500">Estimasi PPN Disetor ke Kas Negara:</span>
                  <span className="font-medium text-gray-500">
                    {simPpnInclude === "none" ? "Rp 0" : `-${formatRupiah(ppnNominal)}`}
                  </span>
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
                    {simPphRate === 0 && simPpnInclude === "none"
                      ? "100% Nilai Kontrak diterima penuh tanpa potongan pajak"
                      : "DPP setelah dipotong PPh (uang riil operasional SkyTerra)"}
                  </p>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatRupiah(kasBersihOperasional)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODUL ANALISIS SELISIH & VALIDASI PENCAIRAN (ANTI SALAH NOMINAL) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-skyterra-cyan" />
              Analisis Selisih Nominal Pencairan & Rekonsiliasi Bank
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Gunakan modul ini untuk membedah selisih antara nilai invoice resmi, nominal transfer masuk dari klien, dan kas riil operasional agar tidak terjadi salah nominal saat pencairan kas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri: Dekomposisi Selisih Nominal */}
            <div className="lg:col-span-6 space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-2">
                <Coins className="w-4 h-4 text-skyterra-cyan" />
                Dekomposisi Selisih Transaksi Proyek
              </h3>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 text-xs">
                <span className="text-gray-600">1. Nilai Resmi Invoice Klien:</span>
                <span className="font-bold text-gray-900">{formatRupiah(totalTagihanKlien)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 text-xs">
                <span className="text-amber-700 font-medium">2. (-) Selisih Potongan PPh 23 ({simPphRate}%):</span>
                <span className="font-semibold text-amber-700">
                  {simPphRate === 0 ? "Rp 0" : `-${formatRupiah(pphNominal)}`}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 italic pl-3 -mt-1">
                *Dipungut langsung oleh klien. Wajib minta Bukti Potong PPh 23 sebagai kredit pajak tahunan.
              </p>

              <div className="flex justify-between items-center py-2 bg-blue-50/70 px-3 rounded-lg border border-blue-100 text-xs">
                <span className="font-bold text-blue-900">Ekspektasi Transfer Masuk Klien:</span>
                <span className="font-bold text-blue-900 text-sm">{formatRupiah(estimasiTransferMasukKlien)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 text-xs">
                <span className="text-gray-600">3. (-) Selisih Titipan PPN 11%:</span>
                <span className="font-semibold text-gray-600">
                  {simPpnInclude === "none" ? "Rp 0" : `-${formatRupiah(ppnNominal)}`}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 italic pl-3 -mt-1">
                *Bukan pendapatan perusahaan. Disetor ke kas negara via Faktur Pajak Keluaran.
              </p>

              <div className="flex justify-between items-center py-2 bg-emerald-50 px-3 rounded-lg border border-emerald-100 text-xs mt-2">
                <span className="font-bold text-emerald-900">Uang Kas Bersih Operasional SkyTerra:</span>
                <span className="font-bold text-emerald-800 text-sm">{formatRupiah(kasBersihOperasional)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs font-semibold text-gray-500">
                <span>Total Selisih Perpajakan:</span>
                <span className="text-red-600 font-bold">{formatRupiah(totalSelisihPajak)}</span>
              </div>
            </div>

            {/* Kolom Kanan: Alat Uji Validasi Mutasi Pencairan Rekening */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Uji Validasi Mutasi Rekening Bank (Anti Salah Nominal)
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nominal yang Tertera di Mutasi Bank / Rekening Koran (Rp):
                </label>
                <input
                  type="text"
                  value={rawActualDisburse > 0 ? new Intl.NumberFormat("id-ID").format(rawActualDisburse) : simActualDisburse}
                  onChange={(e) => setSimActualDisburse(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ketik nominal transfer yang masuk ke bank..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan"
                />
              </div>

              {/* Tombol Cepat Uji Coba */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-400 self-center">Tes Cepat:</span>
                <button
                  type="button"
                  onClick={() => setSimActualDisburse(String(estimasiTransferMasukKlien))}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-medium text-[11px]"
                >
                  Transfer Klien ({formatRupiah(estimasiTransferMasukKlien)})
                </button>
                <button
                  type="button"
                  onClick={() => setSimActualDisburse(String(totalTagihanKlien))}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors font-medium text-[11px]"
                >
                  Full Invoice ({formatRupiah(totalTagihanKlien)})
                </button>
                {rawActualDisburse > 0 && (
                  <button
                    type="button"
                    onClick={() => setSimActualDisburse("")}
                    className="px-2 py-1 text-gray-400 hover:text-gray-600 text-[11px]"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Status Validasi Real-time */}
              {rawActualDisburse > 0 ? (
                (() => {
                  if (rawActualDisburse === estimasiTransferMasukKlien) {
                    return (
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          STATUS: NOMINAL SESUAI (Pencairan Netto Klien)
                        </div>
                        <p className="text-emerald-700">
                          Nominal di rekening bank <strong>100% akurat</strong> dengan Invoice Klien setelah dipotong PPh {simPphRate}%. Tidak ada selisih nominal mencurigakan.
                        </p>
                        {pphNominal > 0 && (
                          <div className="mt-2 pt-2 border-t border-emerald-200/70 text-[11px] text-emerald-800 font-medium">
                            📌 Tindakan Lanjutan: Minta formulir <strong>Bukti Potong PPh 23</strong> senilai <strong>{formatRupiah(pphNominal)}</strong> dari pihak klien.
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (rawActualDisburse === totalTagihanKlien) {
                    return (
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
                          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                          STATUS: NOMINAL FULL INVOICE (Transfer Bruto)
                        </div>
                        <p className="text-blue-700">
                          Klien mentransfer 100% nilai invoice tanpa memotong PPh 23. Periksa apakah klien merupakan instansi non-pemotong atau perusahaan harus menyetorkan sendiri pajaknya.
                        </p>
                      </div>
                    );
                  }

                  if (rawActualDisburse === kasBersihOperasional && ppnNominal > 0) {
                    return (
                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                          STATUS: PENCAIRAN DPP SAJA (PPN Belum Ditransfer)
                        </div>
                        <p className="text-amber-700">
                          Nominal yang masuk hanya senilai DPP bersih. Uang PPN 11% sebesar <strong>{formatRupiah(ppnNominal)}</strong> belum dibayarkan oleh klien.
                        </p>
                      </div>
                    );
                  }

                  // Jika ada selisih
                  const selisihDariKlien = rawActualDisburse - estimasiTransferMasukKlien;
                  const isKurang = selisihDariKlien < 0;

                  return (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        PERINGATAN: DITEMUKAN SELISIH NOMINAL PENCAIRAN!
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-lg border border-red-100 flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700">Selisih dari Ekspektasi Transfer:</span>
                        <span className="font-bold text-red-600 text-sm">
                          {isKurang ? `-${formatRupiah(Math.abs(selisihDariKlien))}` : `+${formatRupiah(selisihDariKlien)}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-700 space-y-1">
                        <p className="font-semibold text-red-950">Kemungkinan Faktor Penyebab Selisih:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                          <li><strong>Biaya Admin Bank:</strong> Potongan transfer antar bank (BI-FAST Rp 2.500 atau RTGS Rp 25.000 s/d Rp 35.000).</li>
                          <li><strong>Retensi Garansi Proyek:</strong> Klien menahan 5% s/d 10% nilai kontrak sebagai jaminan masa pemeliharaan hasil survei.</li>
                          <li><strong>Pembulatan Pajak:</strong> Beda desimal pada faktur pajak klien.</li>
                          <li><strong>Salah Input Nominal:</strong> Kesalahan ketik nominal pada saat transfer bank oleh finance klien.</li>
                        </ul>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  <HelpCircle className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                  Masukkan nominal mutasi bank di atas untuk memverifikasi apakah ada selisih pencairan.
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
