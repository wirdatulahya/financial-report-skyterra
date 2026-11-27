import { redirect } from "next/navigation";
import { listUsers } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pengaturan & RBAC — SkyTerra Financial Portal" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "super_admin") redirect("/dashboard");

  const users = listUsers();

  return <SettingsClient users={users} currentUserId={user.id} />;
}
