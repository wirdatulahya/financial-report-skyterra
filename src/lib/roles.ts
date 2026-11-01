// Peran & aturan akses — aman diimpor dari komponen client
// (tidak berisi data akun maupun secret).

export type Role = "super_admin" | "manajer_divisi" | "viewer";

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  manajer_divisi: "Manajer Divisi",
  viewer: "Viewer",
};

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  division: string;
}

// Halaman yang hanya boleh dibuka peran tertentu (RBAC sederhana)
export const RESTRICTED_ROUTES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/settings", roles: ["super_admin"] },
  { prefix: "/dashboard/tax", roles: ["super_admin", "manajer_divisi"] },
];

export function canAccess(role: Role, pathname: string): boolean {
  const rule = RESTRICTED_ROUTES.find((r) => pathname.startsWith(r.prefix));
  return !rule || rule.roles.includes(role);
}
