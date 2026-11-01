import { Package } from "lucide-react";

export const metadata = { title: "Inventaris Sparepart — SkyTerra Financial Portal" };

export default function SparepartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventaris Sparepart</h1>
        <p className="text-sm text-gray-500 mt-1">
          Stok suku cadang alat survei dan pemetaan geospasial.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-skyterra-cyan/10 flex items-center justify-center">
          <Package className="w-7 h-7 text-skyterra-blue" />
        </div>
        <span className="mt-5 inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          Coming soon
        </span>
        <h2 className="mt-3 text-lg font-semibold text-gray-900">
          Fitur ini sedang disiapkan
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Pengelolaan stok, pencatatan stok masuk/keluar, dan notifikasi stok menipis
          akan tersedia pada pembaruan berikutnya.
        </p>
      </section>
    </div>
  );
}
