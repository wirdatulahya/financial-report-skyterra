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
const store = globalThis as unknown as {
  __skyterraParts?: Sparepart[];
  __skyterraMoves?: StockMovement[];
};
const items = (store.__skyterraParts ??= []);
const moves = (store.__skyterraMoves ??= []);
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
