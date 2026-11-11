// ============================================================
// Data master (divisi & kategori) + tipe Transaksi.
// Data transaksi tidak lagi berupa contoh: semuanya berasal dari upload /
// input pengguna (lihat src/lib/transactions.ts).
// ============================================================

// --- Divisi ---
export const divisions = [
  { id: "div-001", name: "Divisi Survei Udara (Drone)" },
  { id: "div-002", name: "Divisi Pemetaan Terestrial" },
  { id: "div-003", name: "Divisi Operasional & Umum" },
];

// --- Kategori Transaksi ---
export const categories = [
  { id: "cat-001", name: "Pendapatan Proyek", type: "income" as const },
  { id: "cat-002", name: "Biaya Operasional", type: "expense" as const },
  { id: "cat-003", name: "Pembelian Sparepart", type: "expense" as const },
  { id: "cat-004", name: "Gaji & Honorarium", type: "expense" as const },
  { id: "cat-005", name: "Transportasi & Akomodasi", type: "expense" as const },
  { id: "cat-006", name: "Pendapatan Jasa Konsultasi", type: "income" as const },
];

// --- Transaksi ---
export interface Transaction {
  id: string;
  date: string;
  description: string;
  division: string;
  category: string;
  type: "income" | "expense";
  amount: number;
}
