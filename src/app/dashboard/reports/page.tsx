import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listTransactions } from "@/lib/transactions";
import ReportsClient from "./reports-client";

export const metadata = { title: "Laporan PDF — SkyTerra Financial Portal" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const transactions = listTransactions(user);

  return <ReportsClient transactions={transactions} user={user} />;
}
