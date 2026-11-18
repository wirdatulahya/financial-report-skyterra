import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageInventory, listMovements, listSpareparts } from "@/lib/inventory";
import InventoryClient from "./inventory-client";

export const metadata = { title: "Inventaris Sparepart — SkyTerra Financial Portal" };
export const dynamic = "force-dynamic";

export default async function SparepartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <InventoryClient
      items={listSpareparts()}
      movements={listMovements(15)}
      canManage={canManageInventory(user)}
    />
  );
}
