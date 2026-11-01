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

// Modul aplikasi — dipakai untuk menampilkan hak akses di halaman Profil.
export const MODULES: { name: string; href: string }[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Arus Kas", href: "/dashboard/cashflow" },
  { name: "Inventaris Sparepart", href: "/dashboard/sparepart" },
  { name: "Kalkulator Pajak", href: "/dashboard/tax" },
  { name: "Laporan PDF", href: "/dashboard/reports" },
  { name: "Pengaturan", href: "/dashboard/settings" },
];

export const ROLE_DESCRIPTION: Record<Role, string> = {
  super_admin: "Akses penuh ke semua modul dan data seluruh divisi.",
  manajer_divisi: "Mengelola transaksi, stok, dan laporan untuk divisinya sendiri.",
  viewer: "Melihat data divisinya tanpa bisa menambah atau mengubah.",
};
