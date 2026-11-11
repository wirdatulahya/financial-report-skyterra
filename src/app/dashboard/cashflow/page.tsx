import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canWrite, listTransactions } from "@/lib/transactions";
import CashflowClient from "./cashflow-client";

export const dynamic = "force-dynamic";

export default async function CashflowPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <CashflowClient
      transactions={listTransactions(user)}
      canWrite={canWrite(user)}
      lockedDivision={user.role === "super_admin" ? null : user.division}
    />
  );
}
