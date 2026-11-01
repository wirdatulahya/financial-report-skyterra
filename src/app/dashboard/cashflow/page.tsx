"use client";

import { useState } from "react";
import {
  Plus,
  Upload,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { transactions, categories, divisions } from "@/lib/mock-data";
import type { Transaction } from "@/lib/mock-data";

// ──────────────── Modal Tambah Transaksi ────────────────
function AddTransactionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            Tambah Transaksi Baru
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form className="space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              placeholder="Deskripsi transaksi..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan"
            />
          </div>

          {/* Divisi + Kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Divisi
              </label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan bg-white">
                <option value="">Pilih divisi</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Kategori
              </label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan bg-white">
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jenis + Jumlah */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Jenis
              </label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan bg-white">
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Jumlah (Rp)
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30 focus:border-skyterra-cyan"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────── Dropzone Bulk Upload ────────────────
function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            Bulk Upload Transaksi
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
            dragActive
              ? "border-skyterra-cyan bg-skyterra-cyan/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">
            Seret file Excel/CSV ke sini
          </p>
          <p className="text-xs text-gray-400 mt-1">
            atau klik untuk memilih file (.xlsx, .csv — maksimal 500 baris)
          </p>
          <input type="file" accept=".xlsx,.csv" className="hidden" />
          <button className="mt-4 px-5 py-2 bg-gray-100 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            Pilih File
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-4">
          Format kolom: Tanggal | Keterangan | Divisi | Kategori | Jenis
          (Masuk/Keluar) | Jumlah
        </p>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button className="flex-1 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            Upload & Proses
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────── Halaman Arus Kas ────────────────
export default function CashflowPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = transactions.filter((trx) => {
    if (filterType !== "all" && trx.type !== filterType) return false;
    if (
      searchQuery &&
      !trx.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arus Kas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola transaksi pemasukan dan pengeluaran harian perusahaan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">
              Total Pemasukan
            </p>
            <p className="text-lg font-bold text-emerald-600">
              {formatRupiah(totalIncome)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">
              Total Pengeluaran
            </p>
            <p className="text-lg font-bold text-rose-500">
              {formatRupiah(totalExpense)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-skyterra-cyan/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-skyterra-cyan" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Saldo Bersih</p>
            <p className="text-lg font-bold text-gray-800">
              {formatRupiah(totalIncome - totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["all", "income", "expense"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    filterType === type
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {type === "all"
                    ? "Semua"
                    : type === "income"
                    ? "Pemasukan"
                    : "Pengeluaran"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-3 px-3 font-semibold">Tanggal</th>
                <th className="text-left py-3 px-3 font-semibold">
                  Keterangan
                </th>
                <th className="text-left py-3 px-3 font-semibold">Divisi</th>
                <th className="text-left py-3 px-3 font-semibold">Kategori</th>
                <th className="text-left py-3 px-3 font-semibold">Jenis</th>
                <th className="text-right py-3 px-3 font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trx) => (
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
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              Tidak ada transaksi yang cocok dengan filter.
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTransactionModal onClose={() => setShowAddModal(false)} />
      )}
      {showBulkModal && (
        <BulkUploadModal onClose={() => setShowBulkModal(false)} />
      )}
    </div>
  );
}
