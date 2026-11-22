// ============================================================
// Transaksi Arus Kas — penyimpanan, validasi, dan parsing file upload
// Hanya dipakai di server (Server Actions / Route Handlers).
//
// CATATAN: Data disimpan di memori server (globalThis) sampai database
// tersedia. Data hilang saat server di-restart. Ganti fungsi-fungsi di
// bagian "Penyimpanan" dengan query database tanpa mengubah pemanggilnya.
// ============================================================

import { categories, divisions, type Transaction } from "@/lib/mock-data";
import type { SessionUser } from "@/lib/roles";

export type NewTransaction = Omit<Transaction, "id">;

export interface RowError {
  row: number; // nomor baris di file (baris 1 = header)
  messages: string[];
}

export interface ParseResult {
  totalRows: number;
  valid: NewTransaction[];
  errors: RowError[];
}

export const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_ROWS = 500;

// ------------------------------------------------------------
// Penyimpanan
// ------------------------------------------------------------
export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "trx-001",
    date: "2026-11-20",
    description: "Termin 1 Pembayaran Proyek LiDAR Koridor Tol Trans-Sumatera (PT Hutama Karya)",
    division: "Divisi Survei Udara (Drone)",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 125000000,
  },
  {
    id: "trx-002",
    date: "2026-11-18",
    description: "Pembelian 4 Unit Baterai Intelligent TB60 DJI Matrice 300 RTK",
    division: "Divisi Survei Udara (Drone)",
    category: "Pembelian Sparepart",
    type: "expense",
    amount: 38000000,
  },
  {
    id: "trx-003",
    date: "2026-11-15",
    description: "Pelunasan Jasa Survei Batimetri & Topografi Pelabuhan Patimban (PT Pelindo)",
    division: "Divisi Pemetaan Terestrial",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 85000000,
  },
  {
    id: "trx-004",
    date: "2026-11-14",
    description: "Honorarium & Uang Harian Surveyor Tim Lapangan Morowali (5 Personel)",
    division: "Divisi Pemetaan Terestrial",
    category: "Gaji & Honorarium",
    type: "expense",
    amount: 22500000,
  },
  {
    id: "trx-005",
    date: "2026-11-10",
    description: "Pendapatan Jasa Konsultasi Analisis GIS Tata Ruang Pemda Jawa Barat",
    division: "Divisi Operasional & Umum",
    category: "Pendapatan Jasa Konsultasi",
    type: "income",
    amount: 45000000,
  },
  {
    id: "trx-006",
    date: "2026-11-08",
    description: "BBM Operasional Lapangan & Sewa Mobil Double Cabin Survey Kalimantan",
    division: "Divisi Survei Udara (Drone)",
    category: "Transportasi & Akomodasi",
    type: "expense",
    amount: 14200000,
  },
  {
    id: "trx-007",
    date: "2026-11-05",
    description: "Biaya Internet Dedicated Fiber Optic & Cloud Server GCP Kantor",
    division: "Divisi Operasional & Umum",
    category: "Biaya Operasional",
    type: "expense",
    amount: 5800000,
  },
  {
    id: "trx-008",
    date: "2026-11-02",
    description: "Termin 2 Survei Kadastral Pemetaan Bidang Tanah BPN Wilayah Banten",
    division: "Divisi Pemetaan Terestrial",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 95000000,
  },
  {
    id: "trx-009",
    date: "2026-10-27",
    description: "Pengadaan Prisma Circular & Tribrach Optical Leica Geosystems",
    division: "Divisi Pemetaan Terestrial",
    category: "Pembelian Sparepart",
    type: "expense",
    amount: 18500000,
  },
  {
    id: "trx-010",
    date: "2026-10-22",
    description: "Pendapatan Survei Pemetaan Perkebunan Kelapa Sawit Riau 2.500 Ha",
    division: "Divisi Survei Udara (Drone)",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 110000000,
  },
  {
    id: "trx-011",
    date: "2026-10-18",
    description: "Tiket Pesawat & Akomodasi Tim Pilot Drone Balikpapan - Berau",
    division: "Divisi Survei Udara (Drone)",
    category: "Transportasi & Akomodasi",
    type: "expense",
    amount: 16750000,
  },
  {
    id: "trx-012",
    date: "2026-10-12",
    description: "Kalibrasi Tahunan 2 Unit Total Station Leica TS07 & GNSS Emlid Reach",
    division: "Divisi Pemetaan Terestrial",
    category: "Biaya Operasional",
    type: "expense",
    amount: 12000000,
  },
  {
    id: "trx-013",
    date: "2026-10-05",
    description: "Pendapatan Pemodelan 3D Mesh Jembatan & Terowongan Kereta Cepat",
    division: "Divisi Survei Udara (Drone)",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 78000000,
  },
  {
    id: "trx-014",
    date: "2026-09-28",
    description: "Gaji Pokok & Tunjangan Operasional Bulanan Staf Keuangan & IT",
    division: "Divisi Operasional & Umum",
    category: "Gaji & Honorarium",
    type: "expense",
    amount: 28000000,
  },
  {
    id: "trx-015",
    date: "2026-09-15",
    description: "Termin Final Survei Topografi Saluran Irigasi Kementrian PUPR",
    division: "Divisi Pemetaan Terestrial",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 60000000,
  },
];

const store = globalThis as unknown as { __skyterraTrx?: Transaction[] };
const db = (store.__skyterraTrx ??= [...DEFAULT_TRANSACTIONS]);

/** Transaksi yang boleh dilihat user: Super Admin semua, lainnya hanya divisinya. */
export function listTransactions(user: SessionUser): Transaction[] {
  const rows =
    user.role === "super_admin" ? db : db.filter((t) => t.division === user.division);
  return [...rows].sort((a, b) => b.date.localeCompare(a.date));
}

export function insertTransactions(rows: NewTransaction[]): number {
  for (const r of rows) db.push({ id: crypto.randomUUID(), ...r });
  return rows.length;
}

/** Hapus transaksi berdasarkan id. Non-Super Admin hanya bisa menghapus data divisinya. */
export function deleteTransactions(ids: string[], user: SessionUser): number {
  const target = new Set(ids);
  let removed = 0;
  for (let i = db.length - 1; i >= 0; i--) {
    const t = db[i];
    if (!target.has(t.id)) continue;
    if (user.role !== "super_admin" && t.division !== user.division) continue;
    db.splice(i, 1);
    removed++;
  }
  return removed;
}

// ------------------------------------------------------------
// Hak akses
// ------------------------------------------------------------
export function canWrite(user: SessionUser): boolean {
  return user.role === "super_admin" || user.role === "manajer_divisi";
}

// ------------------------------------------------------------
// Validasi satu baris
// ------------------------------------------------------------
type Cell = string | number | boolean | Date | null | undefined;

export interface RawRow {
  date: Cell;
  description: Cell;
  division: Cell;
  category: Cell;
  type: Cell;
  amount: Cell;
}

const text = (v: Cell) => (v == null ? "" : String(v).trim());
const norm = (v: string) => v.toLowerCase().replace(/\s+/g, " ").trim();

function parseDate(v: Cell): string | null {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  const s = text(v);
  let y: number, m: number, d: number;
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); // 2026-10-28
  if (match) [y, m, d] = [+match[1], +match[2], +match[3]];
  else if ((match = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/))) // 28/10/2026
    [d, m, y] = [+match[1], +match[2], +match[3]];
  else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d)
    return null; // contoh: 31/02/2026
  return date.toISOString().slice(0, 10);
}

function parseAmount(v: Cell): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = text(v).replace(/rp\.?/i, "").replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(".") && s.includes(",")) s = s.replace(/\./g, "").replace(",", "."); // 1.500.000,50
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // 1.500.000
  else if (/^\d{1,3}(,\d{3})+$/.test(s)) s = s.replace(/,/g, ""); // 1,500,000
  else s = s.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

function parseType(v: Cell): "income" | "expense" | null {
  const s = norm(text(v));
  if (["masuk", "pemasukan", "income", "in"].includes(s)) return "income";
  if (["keluar", "pengeluaran", "expense", "out"].includes(s)) return "expense";
  return null;
}

export function validateRow(
  raw: RawRow,
  user: SessionUser
): { ok: true; value: NewTransaction } | { ok: false; messages: string[] } {
  const messages: string[] = [];

  const date = parseDate(raw.date);
  if (!date) messages.push("Tanggal tidak valid (gunakan YYYY-MM-DD atau DD/MM/YYYY)");

  const description = text(raw.description);
  if (!description) messages.push("Keterangan kosong");
  else if (description.length > 200) messages.push("Keterangan maksimal 200 karakter");

  const divisionName = text(raw.division);
  const division = divisions.find((d) => norm(d.name) === norm(divisionName));
  if (!division) messages.push(`Divisi "${divisionName || "-"}" tidak dikenal`);
  else if (user.role !== "super_admin" && division.name !== user.division)
    messages.push(`Anda hanya boleh mencatat transaksi untuk ${user.division}`);

  const type = parseType(raw.type);
  if (!type) messages.push("Jenis harus Masuk atau Keluar");

  const categoryName = text(raw.category);
  const category = categories.find((c) => norm(c.name) === norm(categoryName));
  if (!category) messages.push(`Kategori "${categoryName || "-"}" tidak dikenal`);
  else if (type && category.type !== type)
    messages.push(
      `Kategori "${category.name}" hanya untuk ${category.type === "income" ? "pemasukan" : "pengeluaran"}`
    );

  const amount = parseAmount(raw.amount);
  if (amount === null) messages.push("Jumlah bukan angka");
  else if (amount <= 0) messages.push("Jumlah harus lebih dari 0");

  if (messages.length) return { ok: false, messages };
  return {
    ok: true,
    value: {
      date: date!,
      description,
      division: division!.name,
      category: category!.name,
      type: type!,
      amount: Math.round(amount!),
    },
  };
}

// ------------------------------------------------------------
// Parsing file
// ------------------------------------------------------------
const HEADER_ALIASES: Record<keyof RawRow, string[]> = {
  date: ["tanggal", "tgl", "date"],
  description: ["keterangan", "deskripsi", "description"],
  division: ["divisi", "division"],
  category: ["kategori", "category"],
  type: ["jenis", "jenis (masuk/keluar)", "tipe", "type"],
  amount: ["jumlah", "jumlah (rp)", "nominal", "amount"],
};
const COLUMN_ORDER: (keyof RawRow)[] = ["date", "description", "division", "category", "type", "amount"];

/** CSV sederhana: dukung tanda kutip, pemisah koma atau titik koma, dan BOM. */
function parseCsv(content: string): string[][] {
  const textContent = content.replace(/^\uFEFF/, "");
  const firstLine = textContent.split(/\r?\n/, 1)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < textContent.length; i++) {
    const ch = textContent[i];
    if (quoted) {
      if (ch === '"' && textContent[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && textContent[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export class UploadError extends Error {}

async function readRows(file: File): Promise<Cell[][]> {
  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());
  if (name.endsWith(".csv")) return parseCsv(buf.toString("utf8"));
  if (name.endsWith(".xlsx")) {
    if (buf[0] !== 0x50 || buf[1] !== 0x4b) throw new UploadError("File .xlsx rusak atau bukan file Excel.");
    const { readSheet } = await import("read-excel-file/node");
    try {
      return (await readSheet(buf)) as Cell[][];
    } catch {
      throw new UploadError("File Excel tidak bisa dibaca. Simpan ulang sebagai .xlsx lalu coba lagi.");
    }
  }
  throw new UploadError("Format file harus .xlsx atau .csv.");
}

export async function parseUpload(file: File, user: SessionUser): Promise<ParseResult> {
  if (!file || file.size === 0) throw new UploadError("Pilih file terlebih dahulu.");
  if (file.size > MAX_FILE_BYTES) throw new UploadError("Ukuran file maksimal 2 MB.");

  const rows = await readRows(file);
  const isBlank = (r: Cell[]) => r.every((c) => text(c) === "");
  if (rows.length === 0 || rows.every(isBlank)) throw new UploadError("File kosong.");

  // Header: petakan kolom berdasarkan nama; kalau tidak ada header, pakai urutan default.
  const header = rows[0].map((c) => norm(text(c)));
  const hasHeader = header.some((h) => HEADER_ALIASES.date.includes(h));
  const index: Record<keyof RawRow, number> = Object.fromEntries(
    COLUMN_ORDER.map((key, i) => {
      if (!hasHeader) return [key, i];
      return [key, header.findIndex((h) => HEADER_ALIASES[key].includes(h))];
    })
  ) as Record<keyof RawRow, number>;

  if (hasHeader) {
    const missing = COLUMN_ORDER.filter((k) => index[k] === -1);
    if (missing.length) {
      const label: Record<keyof RawRow, string> = {
        date: "Tanggal", description: "Keterangan", division: "Divisi",
        category: "Kategori", type: "Jenis", amount: "Jumlah",
      };
      throw new UploadError(`Kolom tidak ditemukan: ${missing.map((k) => label[k]).join(", ")}.`);
    }
  }

  const start = hasHeader ? 1 : 0;
  const dataRows = rows.slice(start).map((r, i) => ({ r, rowNo: i + start + 1 })).filter(({ r }) => !isBlank(r));
  if (dataRows.length === 0) throw new UploadError("Tidak ada baris data di file.");
  if (dataRows.length > MAX_ROWS)
    throw new UploadError(`Maksimal ${MAX_ROWS} baris per file (file ini ${dataRows.length} baris).`);

  const result: ParseResult = { totalRows: dataRows.length, valid: [], errors: [] };
  for (const { r, rowNo } of dataRows) {
    const raw = Object.fromEntries(COLUMN_ORDER.map((k) => [k, r[index[k]]])) as unknown as RawRow;
    const v = validateRow(raw, user);
    if (v.ok) result.valid.push(v.value);
    else result.errors.push({ row: rowNo, messages: v.messages });
  }
  return result;
}
