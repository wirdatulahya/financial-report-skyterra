import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { isLowStock, listSpareparts } from "@/lib/inventory";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware sudah menjaga rute ini; pengecekan ulang di server sebagai lapisan kedua.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lowStockItems = listSpareparts()
    .filter(isLowStock)
    .map((item) => ({
      id: item.id,
      name: item.name,
      stock: item.stock,
      minStock: item.minStock,
    }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} lowStockItems={lowStockItems} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
