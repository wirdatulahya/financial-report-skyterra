import { Calculator } from "lucide-react";

export default function TaxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalkulator Pajak</h1>
        <p className="text-sm text-gray-500 mt-1">
          Estimasi perhitungan beban PPh dan PPN internal perusahaan.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
        <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-400">
          Modul Kalkulator Pajak
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Sedang dalam tahap pengembangan — akan tersedia pada iterasi
          berikutnya.
        </p>
      </div>
    </div>
  );
}
