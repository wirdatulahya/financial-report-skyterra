import { Package } from "lucide-react";
import ComingSoon from "@/components/coming-soon";

export const metadata = { title: "Inventaris Sparepart — SkyTerra Financial Portal" };

export default function SparepartPage() {
  return (
    <ComingSoon
      title="Inventaris Sparepart"
      subtitle="Stok suku cadang alat survei dan pemetaan geospasial."
      description="Pengelolaan stok, pencatatan stok masuk/keluar, dan notifikasi stok menipis akan tersedia pada pembaruan berikutnya."
      icon={Package}
    />
  );
}
