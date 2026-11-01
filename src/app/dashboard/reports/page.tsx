import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan PDF</h1>
        <p className="text-sm text-gray-500 mt-1">
          Unduh laporan keuangan otomatis berformat PDF (bulanan, kuartalan,
          tahunan).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-400">
          Modul Ekspor Laporan PDF
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Sedang dalam tahap pengembangan — akan tersedia pada iterasi
          berikutnya.
        </p>
      </div>
    </div>
  );
}
