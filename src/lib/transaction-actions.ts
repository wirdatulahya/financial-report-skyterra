"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import {
  UploadError,
  canWrite,
  deleteTransactions,
  insertTransactions,
  parseUpload,
  validateRow,
  type NewTransaction,
  type RowError,
} from "@/lib/transactions";

export interface UploadState {
  status: "idle" | "preview" | "imported" | "error";
  message?: string;
  fileName?: string;
  totalRows?: number;
  validCount?: number;
  preview?: NewTransaction[]; // beberapa baris valid pertama
  errors?: RowError[];
  errorCount?: number;
}

const MAX_ERRORS_SHOWN = 50;

function revalidateCashflow() {
  revalidatePath("/dashboard/cashflow");
  revalidatePath("/dashboard");
}

async function requireWriter() {
  const user = await getCurrentUser();
  if (!user) throw new UploadError("Sesi berakhir. Silakan login ulang.");
  if (!canWrite(user)) throw new UploadError("Peran Viewer tidak dapat menambah transaksi.");
  return user;
}

/**
 * Satu action untuk dua langkah:
 *  - intent=preview → baca & validasi file, belum menyimpan apa pun
 *  - intent=import  → baca & validasi ULANG file yang sama, lalu simpan baris valid
 * File diproses ulang saat impor supaya server tidak pernah mempercayai data dari browser.
 */
export async function uploadTransactionsAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const intent = formData.get("intent") === "import" ? "import" : "preview";
  const file = formData.get("file");

  try {
    const user = await requireWriter();
    if (!(file instanceof File)) throw new UploadError("Pilih file terlebih dahulu.");

    const result = await parseUpload(file, user);
    const base = {
      fileName: file.name,
      totalRows: result.totalRows,
      validCount: result.valid.length,
      errors: result.errors.slice(0, MAX_ERRORS_SHOWN),
      errorCount: result.errors.length,
    };

    if (intent === "preview") {
      return { status: "preview", ...base, preview: result.valid.slice(0, 5) };
    }

    if (result.valid.length === 0) {
      return { status: "error", ...base, message: "Tidak ada baris valid untuk diimpor." };
    }
    const saved = insertTransactions(result.valid);
    revalidateCashflow();
    return {
      status: "imported",
      ...base,
      message:
        `${saved} transaksi berhasil diimpor` +
        (result.errors.length ? `, ${result.errors.length} baris dilewati karena error.` : "."),
    };
  } catch (e) {
    if (e instanceof UploadError) return { status: "error", message: e.message };
    console.error("[upload transaksi]", e);
    return { status: "error", message: "Terjadi kesalahan saat memproses file. Coba lagi." };
  }
}

export interface AddState {
  status: "idle" | "success" | "error";
  messages?: string[];
}

export async function addTransactionAction(
  _prev: AddState,
  formData: FormData
): Promise<AddState> {
  try {
    const user = await requireWriter();
    const get = (k: string) => String(formData.get(k) ?? "");
    const v = validateRow(
      {
        date: get("date"),
        description: get("description"),
        division: get("division"),
        category: get("category"),
        type: get("type"),
        amount: get("amount"),
      },
      user
    );
    if (!v.ok) return { status: "error", messages: v.messages };
    insertTransactions([v.value]);
    revalidateCashflow();
    return { status: "success" };
  } catch (e) {
    if (e instanceof UploadError) return { status: "error", messages: [e.message] };
    console.error("[tambah transaksi]", e);
    return { status: "error", messages: ["Terjadi kesalahan. Coba lagi."] };
  }
}

export interface DeleteResult {
  ok: boolean;
  deleted?: number;
  message?: string;
}

export async function deleteTransactionsAction(ids: string[]): Promise<DeleteResult> {
  try {
    const user = await requireWriter();
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 1000 || !ids.every((x) => typeof x === "string"))
      return { ok: false, message: "Tidak ada transaksi yang dipilih." };
    const deleted = deleteTransactions(ids, user);
    revalidateCashflow();
    return { ok: true, deleted };
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, message: e.message };
    console.error("[hapus transaksi]", e);
    return { ok: false, message: "Gagal menghapus transaksi. Coba lagi." };
  }
}
