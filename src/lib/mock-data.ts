// ============================================================
// Mock Data - Data Simulasi untuk Dashboard & Transaksi
// Sesuai ERD dokumen: divisi, users, akun_kas, kategori_transaksi, transaksi
// ============================================================

// --- Divisi ---
export const divisions = [
  { id: "div-001", name: "Divisi Survei Udara (Drone)" },
  { id: "div-002", name: "Divisi Pemetaan Terestrial" },
  { id: "div-003", name: "Divisi Operasional & Umum" },
];

// --- Akun Kas ---
export const cashAccounts = [
  { id: "kas-001", name: "Kas Utama Perusahaan", saldo: 487500000 },
  { id: "kas-002", name: "Kas Operasional Drone", saldo: 125000000 },
  { id: "kas-003", name: "Kas Operasional Terestrial", saldo: 98000000 },
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

// --- Transaksi (Mock) ---
export interface Transaction {
  id: string;
  date: string;
  description: string;
  division: string;
  category: string;
  type: "income" | "expense";
  amount: number;
}

export const transactions: Transaction[] = [
  {
    id: "trx-001",
    date: "2026-10-28",
    description: "Pembayaran proyek pemetaan lahan Kab. Bandung Barat",
    division: "Divisi Pemetaan Terestrial",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 75000000,
  },
  {
    id: "trx-002",
    date: "2026-10-27",
    description: "Service rutin drone DJI Matrice 350 RTK",
    division: "Divisi Survei Udara (Drone)",
    category: "Biaya Operasional",
    type: "expense",
    amount: 8500000,
  },
  {
    id: "trx-003",
    date: "2026-10-26",
    description: "Pembelian baterai cadangan drone (4 unit)",
    division: "Divisi Survei Udara (Drone)",
    category: "Pembelian Sparepart",
    type: "expense",
    amount: 12000000,
  },
  {
    id: "trx-004",
    date: "2026-10-25",
    description: "Honor surveyor proyek GCP Cianjur",
    division: "Divisi Pemetaan Terestrial",
    category: "Gaji & Honorarium",
    type: "expense",
    amount: 6000000,
  },
  {
    id: "trx-005",
    date: "2026-10-24",
    description: "Pembayaran jasa konsultasi SIG PT Pertamina",
    division: "Divisi Operasional & Umum",
    category: "Pendapatan Jasa Konsultasi",
    type: "income",
    amount: 45000000,
  },
  {
    id: "trx-006",
    date: "2026-10-23",
    description: "Sewa kendaraan operasional survei lapangan Garut",
    division: "Divisi Pemetaan Terestrial",
    category: "Transportasi & Akomodasi",
    type: "expense",
    amount: 3500000,
  },
  {
    id: "trx-007",
    date: "2026-10-22",
    description: "Pembayaran proyek pemetaan drone PLTU Suralaya",
    division: "Divisi Survei Udara (Drone)",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 120000000,
  },
  {
    id: "trx-008",
    date: "2026-10-21",
    description: "Pembelian propeller set drone (6 set)",
    division: "Divisi Survei Udara (Drone)",
    category: "Pembelian Sparepart",
    type: "expense",
    amount: 4200000,
  },
  {
    id: "trx-009",
    date: "2026-10-20",
    description: "Biaya akomodasi tim survei proyek Sukabumi",
    division: "Divisi Operasional & Umum",
    category: "Transportasi & Akomodasi",
    type: "expense",
    amount: 5800000,
  },
  {
    id: "trx-010",
    date: "2026-10-19",
    description: "Pembayaran proyek foto udara kawasan industri Karawang",
    division: "Divisi Survei Udara (Drone)",
    category: "Pendapatan Proyek",
    type: "income",
    amount: 55000000,
  },
];

// --- Data Grafik Arus Kas Bulanan (6 bulan terakhir) ---
export const monthlyCashflow = [
  { month: "Mei", income: 180000000, expense: 95000000 },
  { month: "Jun", income: 210000000, expense: 120000000 },
  { month: "Jul", income: 165000000, expense: 88000000 },
  { month: "Agu", income: 240000000, expense: 135000000 },
  { month: "Sep", income: 195000000, expense: 110000000 },
  { month: "Okt", income: 295000000, expense: 140000000 },
];

// --- Data Ringkasan Per Divisi ---
export const divisionSummary = [
  {
    division: "Divisi Survei Udara (Drone)",
    income: 175000000,
    expense: 24700000,
    balance: 150300000,
  },
  {
    division: "Divisi Pemetaan Terestrial",
    income: 75000000,
    expense: 9500000,
    balance: 65500000,
  },
  {
    division: "Divisi Operasional & Umum",
    income: 45000000,
    expense: 5800000,
    balance: 39200000,
  },
];
