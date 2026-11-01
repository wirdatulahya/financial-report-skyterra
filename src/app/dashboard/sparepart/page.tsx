"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

// --- Mock Sparepart Data ---
interface Sparepart {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  lastUpdated: string;
}

const spareparts: Sparepart[] = [
  {
    id: "sp-001",
    name: "Propeller Set DJI Matrice 350 RTK",
    category: "Drone",
    stock: 4,
    minStock: 3,
    price: 1050000,
    lastUpdated: "2026-10-28",
  },
  {
    id: "sp-002",
    name: "Baterai TB65 Intelligent Flight Battery",
    category: "Drone",
    stock: 2,
    minStock: 4,
    price: 8750000,
    lastUpdated: "2026-10-26",
  },
  {
    id: "sp-003",
    name: "Filter UV Lensa Kamera Zenmuse P1",
    category: "Kamera",
    stock: 6,
    minStock: 2,
    price: 350000,
    lastUpdated: "2026-10-20",
  },
  {
    id: "sp-004",
    name: "Tripod Aluminium Total Station Leica",
    category: "Alat Ukur",
    stock: 1,
    minStock: 2,
    price: 2400000,
    lastUpdated: "2026-10-18",
  },
  {
    id: "sp-005",
    name: "Prisma Reflector untuk Total Station",
    category: "Alat Ukur",
    stock: 5,
    minStock: 3,
    price: 1200000,
    lastUpdated: "2026-10-15",
  },
  {
    id: "sp-006",
    name: "Charger Hub DJI Matrice (4-Slot)",
    category: "Drone",
    stock: 3,
    minStock: 2,
    price: 3200000,
    lastUpdated: "2026-10-12",
  },
  {
    id: "sp-007",
    name: "Landing Gear Set Drone DJI M300",
    category: "Drone",
    stock: 1,
    minStock: 2,
    price: 950000,
    lastUpdated: "2026-10-10",
  },
  {
    id: "sp-008",
    name: "SD Card Industrial 256GB",
    category: "Aksesoris",
    stock: 8,
    minStock: 4,
    price: 650000,
    lastUpdated: "2026-10-08",
  },
];

export default function SparepartPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const lowStockItems = spareparts.filter((s) => s.stock <= s.minStock);

  const filtered = spareparts.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventaris Sparepart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola suku cadang alat survei dan pemetaan geospasial.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Tambah Sparepart
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Peringatan Stok Menipis
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {lowStockItems.length} item berada di bawah batas minimum stok:{" "}
              {lowStockItems.map((i) => i.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-skyterra-cyan/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-skyterra-cyan" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Item</p>
            <p className="text-lg font-bold text-gray-800">
              {spareparts.length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Stok Menipis</p>
            <p className="text-lg font-bold text-amber-600">
              {lowStockItems.length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">
              Total Nilai Stok
            </p>
            <p className="text-lg font-bold text-emerald-600">
              {formatRupiah(
                spareparts.reduce((sum, s) => sum + s.stock * s.price, 0)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700">Daftar Sparepart</h2>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-72">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari sparepart..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-3 px-3 font-semibold">
                  Nama Sparepart
                </th>
                <th className="text-left py-3 px-3 font-semibold">Kategori</th>
                <th className="text-center py-3 px-3 font-semibold">Stok</th>
                <th className="text-center py-3 px-3 font-semibold">
                  Min. Stok
                </th>
                <th className="text-right py-3 px-3 font-semibold">
                  Harga Satuan
                </th>
                <th className="text-center py-3 px-3 font-semibold">Status</th>
                <th className="text-left py-3 px-3 font-semibold">
                  Terakhir Update
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sp) => {
                const isLow = sp.stock <= sp.minStock;
                return (
                  <tr
                    key={sp.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-3 text-gray-800 font-medium">
                      {sp.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {sp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-gray-800">
                      {sp.stock}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-400">
                      {sp.minStock}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {formatRupiah(sp.price)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isLow
                            ? "bg-red-50 text-red-500"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isLow ? "Stok Rendah" : "Aman"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">
                      {new Date(sp.lastUpdated).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
