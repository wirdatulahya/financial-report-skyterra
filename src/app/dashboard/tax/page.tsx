import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listTransactions } from "@/lib/transactions";
import TaxClient from "./tax-client";

export const metadata = { title: "Kalkulator Pajak — SkyTerra Financial Portal" };
export const dynamic = "force-dynamic";

export default async function TaxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const transactions = listTransactions(user);

  return <TaxClient transactions={transactions} user={user} />;
}
