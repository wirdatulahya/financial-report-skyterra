import { FileText } from "lucide-react";
import ComingSoon from "@/components/coming-soon";

export const metadata = { title: "Laporan PDF — SkyTerra Financial Portal" };

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Laporan PDF"
      subtitle="Laporan keuangan siap cetak dalam format PDF."
      description="Unduh laporan bulanan, kuartalan, dan tahunan dalam format PDF akan tersedia pada pembaruan berikutnya."
      icon={FileText}
    />
  );
}
