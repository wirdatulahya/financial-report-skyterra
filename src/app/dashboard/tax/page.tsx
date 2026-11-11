import { Calculator } from "lucide-react";
import ComingSoon from "@/components/coming-soon";

export const metadata = { title: "Kalkulator Pajak — SkyTerra Financial Portal" };

export default function TaxPage() {
  return (
    <ComingSoon
      title="Kalkulator Pajak"
      subtitle="Estimasi beban pajak dan analisis selisih saldo."
      description="Perhitungan otomatis estimasi PPh/PPN dan analisis selisih pencatatan saldo kas akan tersedia pada pembaruan berikutnya."
      icon={Calculator}
    />
  );
}
