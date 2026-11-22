// ============================================================
// Inventaris Sparepart — model data, validasi, dan penyimpanan
// Hanya dipakai di server (Server Actions).
//
// CATATAN: Sama seperti Arus Kas, data disimpan di memori server
// (globalThis) sampai database tersedia, jadi hilang saat server restart.
// Saat pindah ke database, cukup ganti isi fungsi di bagian "Penyimpanan".
// ============================================================

import type { SessionUser } from "@/lib/roles";

import {
  SPAREPART_CATEGORIES,
  isLowStock,
  type MovementType,
  type Sparepart,
  type SparepartInput,
  type StockMovement,
} from "@/lib/inventory-shared";

export * from "@/lib/inventory-shared";

export class InventoryError extends Error {}

// ------------------------------------------------------------
// Hak akses: Super Admin & Manajer Divisi boleh mengubah, Viewer hanya melihat
// ------------------------------------------------------------
export function canManageInventory(user: SessionUser): boolean {
  return user.role === "super_admin" || user.role === "manajer_divisi";
}

// ------------------------------------------------------------
// Validasi input
// ------------------------------------------------------------
const MAX_QTY = 1_000_000;
const MAX_PRICE = 10_000_000_000; // Rp 10 miliar per unit

function parseInt0(v: unknown): number | null {
  const s = String(v ?? "").replace(/[.\s]/g, "").trim(); // izinkan "1.500.000"
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

export function validateSparepart(
  raw: Record<string, unknown>,
  opts: { requireStock: boolean }
): { ok: true; value: SparepartInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const name = String(raw.name ?? "").trim().replace(/\s+/g, " ");
  if (!name) errors.name = "Nama barang wajib diisi.";
  else if (name.length > 120) errors.name = "Nama barang maksimal 120 karakter.";

  const category = String(raw.category ?? "");
  if (!(SPAREPART_CATEGORIES as readonly string[]).includes(category))
    errors.category = "Pilih kategori yang tersedia.";

  let stock = 0;
  if (opts.requireStock) {
    const s = parseInt0(raw.stock);
    if (s === null) errors.stock = "Stok awal harus bilangan bulat ≥ 0.";
    else if (s > MAX_QTY) errors.stock = "Stok terlalu besar.";
    else stock = s;
  }

  const minStock = parseInt0(raw.minStock);
  if (minStock === null) errors.minStock = "Min. stok harus bilangan bulat ≥ 0.";
  else if (minStock > MAX_QTY) errors.minStock = "Min. stok terlalu besar.";

  const price = parseInt0(raw.price);
  if (price === null) errors.price = "Harga harus angka ≥ 0 (tanpa desimal).";
  else if (price > MAX_PRICE) errors.price = "Harga terlalu besar.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, category, stock, minStock: minStock!, price: price! } };
}

// ------------------------------------------------------------
// Penyimpanan (memori server)
// ------------------------------------------------------------
export const DEFAULT_PARTS: Sparepart[] = [
  {
    id: "part-001",
    name: "Propeller CCW/CW Matrice 300 RTK (2110)",
    category: "Drone & UAV",
    stock: 2, // Low stock: < minStock 6
    minStock: 6,
    price: 850000,
    updatedAt: "2026-11-20T08:30:00Z",
  },
  {
    id: "part-002",
    name: "Baterai Intelligent TB60 5935mAh (DJI M300)",
    category: "Baterai & Daya",
    stock: 8,
    minStock: 4,
    price: 9500000,
    updatedAt: "2026-11-19T10:15:00Z",
  },
  {
    id: "part-003",
    name: "Prisma Target Circular Leica GPR1 + Holder",
    category: "Total Station",
    stock: 3, // Low stock: < minStock 5
    minStock: 5,
    price: 3200000,
    updatedAt: "2026-11-18T14:20:00Z",
  },
  {
    id: "part-004",
    name: "Tribrach Optical Plummet Leica GDF321",
    category: "Total Station",
    stock: 6,
    minStock: 3,
    price: 4500000,
    updatedAt: "2026-11-15T09:00:00Z",
  },
  {
    id: "part-005",
    name: "Antenna GNSS Helical Multi-Band Emlid",
    category: "GNSS / GPS",
    stock: 5,
    minStock: 2,
    price: 2750000,
    updatedAt: "2026-11-12T11:45:00Z",
  },
  {
    id: "part-006",
    name: "Kabel Data Lemo 7-pin to USB Trimble/Leica",
    category: "Aksesori",
    stock: 12,
    minStock: 4,
    price: 650000,
    updatedAt: "2026-11-10T13:30:00Z",
  },
  {
    id: "part-007",
    name: "LiDAR Protective Lens Cover Livox Avia",
    category: "LiDAR & Sensor",
    stock: 1, // Low stock: < minStock 3
    minStock: 3,
    price: 4200000,
    updatedAt: "2026-11-08T15:10:00Z",
  },
  {
    id: "part-008",
    name: "Baterai Li-ion Total Station Topcon BT-52QA",
    category: "Baterai & Daya",
    stock: 7,
    minStock: 3,
    price: 1850000,
    updatedAt: "2026-11-05T09:20:00Z",
  },
  {
    id: "part-009",
    name: "Tripod Alumunium Heavy Duty Wild Leica",
    category: "Total Station",
    stock: 10,
    minStock: 4,
    price: 2100000,
    updatedAt: "2026-11-02T16:00:00Z",
  },
  {
    id: "part-010",
    name: "MicroSD Extreme Pro 128GB V30 A2 SanDisk",
    category: "Aksesori",
    stock: 15,
    minStock: 5,
    price: 380000,
    updatedAt: "2026-10-28T10:00:00Z",
  },
];

export const DEFAULT_MOVES: StockMovement[] = [
  {
    id: "move-001",
    itemId: "part-001",
    itemName: "Propeller CCW/CW Matrice 300 RTK (2110)",
    type: "out",
    qty: 4,
    stockAfter: 2,
    note: "Penggantian rutin baling-baling proyek LiDAR Tol Trans Jawa",
    by: "Wirdatul Ahya",
    at: "2026-11-20T08:30:00Z",
  },
  {
    id: "move-002",
    itemId: "part-002",
    itemName: "Baterai Intelligent TB60 5935mAh (DJI M300)",
    type: "in",
    qty: 4,
    stockAfter: 8,
    note: "Penerimaan pengadaan baterai baru vendor DJI Surabaya",
    by: "Mochamad Zhielton Akbar",
    at: "2026-11-19T10:15:00Z",
  },
  {
    id: "move-003",
    itemId: "part-003",
    itemName: "Prisma Target Circular Leica GPR1 + Holder",
    type: "out",
    qty: 2,
    stockAfter: 3,
    note: "Dipinjam tim lapangan survei topografi tambang Morowali",
    by: "Tiko Rizki Ramadhani",
    at: "2026-11-18T14:20:00Z",
  },
  {
    id: "move-004",
    itemId: "part-007",
    itemName: "LiDAR Protective Lens Cover Livox Avia",
    type: "out",
    qty: 2,
    stockAfter: 1,
    note: "Penggantian lensa lecet akibat serpihan debu koridor tambang",
    by: "Fazla Dwika Simahate",
    at: "2026-11-08T15:10:00Z",
  },
];

const store = globalThis as unknown as {
  __skyterraParts?: Sparepart[];
  __skyterraMoves?: StockMovement[];
};
const items = (store.__skyterraParts ??= [...DEFAULT_PARTS]);
const moves = (store.__skyterraMoves ??= [...DEFAULT_MOVES]);
const MAX_MOVES_KEPT = 500;

const now = () => new Date().toISOString();
const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

function logMove(m: Omit<StockMovement, "id" | "at">) {
  moves.unshift({ id: crypto.randomUUID(), at: now(), ...m });
  if (moves.length > MAX_MOVES_KEPT) moves.length = MAX_MOVES_KEPT;
}

export function listSpareparts(): Sparepart[] {
  // Stok menipis tampil paling atas, lalu urut nama
  return [...items].sort(
    (a, b) => Number(isLowStock(b)) - Number(isLowStock(a)) || a.name.localeCompare(b.name, "id")
  );
}

export function listMovements(limit = 20): StockMovement[] {
  return moves.slice(0, limit);
}

export function createSparepart(input: SparepartInput, user: SessionUser): Sparepart {
  if (items.some((i) => sameName(i.name, input.name)))
    throw new InventoryError(`Barang "${input.name}" sudah ada. Gunakan Stok Masuk untuk menambah jumlahnya.`);
  const item: Sparepart = { id: crypto.randomUUID(), ...input, updatedAt: now() };
  items.push(item);
  if (item.stock > 0)
    logMove({ itemId: item.id, itemName: item.name, type: "in", qty: item.stock, stockAfter: item.stock, note: "Stok awal", by: user.name });
  return item;
}

/** Ubah data master barang (stok tidak diubah di sini — pakai mutasi stok). */
export function updateSparepart(id: string, input: Omit<SparepartInput, "stock">): Sparepart {
  const item = items.find((i) => i.id === id);
  if (!item) throw new InventoryError("Barang tidak ditemukan. Mungkin sudah dihapus.");
  if (items.some((i) => i.id !== id && sameName(i.name, input.name)))
    throw new InventoryError(`Nama "${input.name}" sudah dipakai barang lain.`);
  Object.assign(item, input, { updatedAt: now() });
  return item;
}

export function adjustStock(
  id: string,
  type: MovementType,
  qty: number,
  note: string,
  user: SessionUser
): Sparepart {
  const item = items.find((i) => i.id === id);
  if (!item) throw new InventoryError("Barang tidak ditemukan. Mungkin sudah dihapus.");
  if (!Number.isSafeInteger(qty) || qty <= 0) throw new InventoryError("Jumlah harus bilangan bulat lebih dari 0.");
  if (qty > MAX_QTY) throw new InventoryError("Jumlah terlalu besar.");
  if (type === "out" && qty > item.stock)
    throw new InventoryError(`Stok tidak cukup. Sisa stok ${item.name}: ${item.stock}.`);
  item.stock += type === "in" ? qty : -qty;
  item.updatedAt = now();
  logMove({ itemId: item.id, itemName: item.name, type, qty, stockAfter: item.stock, note, by: user.name });
  return item;
}

export function deleteSparepart(id: string): boolean {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  return true;
}
