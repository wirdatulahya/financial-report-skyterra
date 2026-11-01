import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Konfigurasi akun, manajemen pengguna, dan pengaturan sistem.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-400">
          Modul Pengaturan & RBAC
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Sedang dalam tahap pengembangan — akan tersedia pada iterasi
          berikutnya.
        </p>
      </div>
    </div>
  );
}
