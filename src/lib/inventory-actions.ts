"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import {
  InventoryError,
  adjustStock,
  canManageInventory,
  createSparepart,
  deleteSparepart,
  updateSparepart,
  validateSparepart,
} from "@/lib/inventory";

export interface FormResult {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function requireManager() {
  const user = await getCurrentUser();
  if (!user) throw new InventoryError("Sesi berakhir. Silakan login ulang.");
  if (!canManageInventory(user)) throw new InventoryError("Peran Viewer hanya dapat melihat inventaris.");
  return user;
}

function fail(e: unknown, tag: string): FormResult {
  if (e instanceof InventoryError) return { status: "error", message: e.message };
  console.error(`[inventaris] ${tag}`, e);
  return { status: "error", message: "Terjadi kesalahan. Coba lagi." };
}

const refresh = () => revalidatePath("/dashboard/sparepart");

/** Tambah barang baru (id kosong) atau ubah data barang (id terisi). */
export async function saveSparepartAction(_prev: FormResult, formData: FormData): Promise<FormResult> {
  try {
    const user = await requireManager();
    const id = String(formData.get("id") ?? "");
    const raw = Object.fromEntries(formData.entries());
    const v = validateSparepart(raw, { requireStock: !id });
    if (!v.ok) return { status: "error", fieldErrors: v.errors };

    if (id) {
      const { stock: _ignored, ...rest } = v.value;
      updateSparepart(id, rest);
    } else {
      createSparepart(v.value, user);
    }
    refresh();
    return { status: "success", message: id ? "Data barang diperbarui." : `"${v.value.name}" ditambahkan.` };
  } catch (e) {
    return fail(e, "simpan");
  }
}

/** Catat stok masuk / keluar. */
export async function adjustStockAction(_prev: FormResult, formData: FormData): Promise<FormResult> {
  try {
    const user = await requireManager();
    const id = String(formData.get("id") ?? "");
    const type = formData.get("type") === "out" ? "out" : "in";
    const qtyRaw = String(formData.get("qty") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim().slice(0, 200);
    if (!/^\d+$/.test(qtyRaw) || Number(qtyRaw) <= 0)
      return { status: "error", fieldErrors: { qty: "Jumlah harus bilangan bulat lebih dari 0." } };

    const item = adjustStock(id, type, Number(qtyRaw), note, user);
    refresh();
    return {
      status: "success",
      message: `Stok ${type === "in" ? "masuk" : "keluar"} ${qtyRaw} unit dicatat. Stok ${item.name} sekarang ${item.stock}.`,
    };
  } catch (e) {
    return fail(e, "mutasi stok");
  }
}

export async function deleteSparepartAction(id: string): Promise<FormResult> {
  try {
    await requireManager();
    if (typeof id !== "string" || !deleteSparepart(id))
      return { status: "error", message: "Barang tidak ditemukan." };
    refresh();
    return { status: "success", message: "Barang dihapus." };
  } catch (e) {
    return fail(e, "hapus");
  }
}
