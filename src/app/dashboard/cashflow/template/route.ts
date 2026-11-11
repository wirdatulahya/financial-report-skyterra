import { categories, divisions } from "@/lib/mock-data";

// GET /dashboard/cashflow/template → file CSV contoh untuk Bulk Upload
export function GET() {
  const income = categories.find((c) => c.type === "income")!.name;
  const expense = categories.find((c) => c.type === "expense")!.name;
  const rows = [
    ["Tanggal", "Keterangan", "Divisi", "Kategori", "Jenis", "Jumlah"],
    ["2026-11-03", "Termin 1 proyek pemetaan", divisions[1].name, income, "Masuk", "75000000"],
    ["2026-11-04", "Service drone", divisions[0].name, expense, "Keluar", "8500000"],
  ];
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="template-transaksi-skyterra.csv"',
    },
  });
}
