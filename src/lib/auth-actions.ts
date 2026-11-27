"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  changePassword,
  createSessionToken,
  createUserAccount,
  deleteUserAccount,
  updateUserAccess,
  verifyCredentials,
  verifySessionToken,
} from "@/lib/auth";
import { divisions } from "@/lib/mock-data";
import type { Role } from "@/lib/roles";

export interface LoginState {
  error?: string;
  email?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "");

  if (!email || !password) {
    return { error: "Isi email dan kata sandi.", email };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: "Email atau kata sandi salah. Periksa kembali lalu coba lagi.", email };
  }

  cookies().set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Hanya izinkan redirect internal ke area dashboard
  redirect(from.startsWith("/dashboard") ? from : "/dashboard");
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}

export interface PasswordState {
  status?: "success" | "error";
  message?: string;
  field?: "current" | "new" | "confirm";
}

export async function changePasswordAction(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const user = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) redirect("/login");

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("new") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current) return { status: "error", field: "current", message: "Isi kata sandi saat ini." };
  if (next.length < 8)
    return { status: "error", field: "new", message: "Kata sandi baru minimal 8 karakter." };
  if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next))
    return { status: "error", field: "new", message: "Gunakan kombinasi huruf dan angka." };
  if (next === current)
    return { status: "error", field: "new", message: "Kata sandi baru harus berbeda dari yang lama." };
  if (next !== confirm)
    return { status: "error", field: "confirm", message: "Konfirmasi tidak sama dengan kata sandi baru." };

  const ok = await changePassword(user.id, user.email, current, next);
  if (!ok) return { status: "error", field: "current", message: "Kata sandi saat ini salah." };

  return { status: "success", message: "Kata sandi berhasil diubah. Gunakan kata sandi baru saat login berikutnya." };
}

export interface UserMgmtState {
  status?: "success" | "error";
  message?: string;
}

const VALID_ROLES: Role[] = ["super_admin", "manajer_divisi", "viewer"];

export async function createUserAction(
  _prev: UserMgmtState,
  formData: FormData
): Promise<UserMgmtState> {
  const actor = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!actor) redirect("/login");
  if (actor.role !== "super_admin") {
    return { status: "error", message: "Hanya Super Admin yang dapat mengelola pengguna." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "") as Role;
  const division = String(formData.get("division") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { status: "error", message: "Nama lengkap wajib diisi." };
  if (!email || !email.includes("@")) return { status: "error", message: "Email tidak valid." };
  if (!VALID_ROLES.includes(role)) return { status: "error", message: "Peran tidak valid." };
  if (role !== "super_admin" && !divisions.some((d) => d.name === division)) {
    return { status: "error", message: "Pilih divisi yang valid." };
  }
  if (password.length < 8) {
    return { status: "error", message: "Kata sandi awal minimal 8 karakter." };
  }

  const res = await createUserAccount({ name, email, role, division, password });
  if (!res.ok) return { status: "error", message: res.message };

  revalidatePath("/dashboard/settings");
  return { status: "success", message: `Akun ${res.user.name} (${res.user.email}) berhasil ditambahkan.` };
}

export async function updateUserAccessAction(
  userId: string,
  role: Role,
  division: string
): Promise<UserMgmtState> {
  const actor = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!actor) redirect("/login");
  if (actor.role !== "super_admin") {
    return { status: "error", message: "Hanya Super Admin yang dapat mengubah hak akses." };
  }
  if (!VALID_ROLES.includes(role)) return { status: "error", message: "Peran tidak valid." };
  if (role !== "super_admin" && !divisions.some((d) => d.name === division)) {
    return { status: "error", message: "Divisi tidak valid." };
  }

  const res = updateUserAccess(userId, role, division);
  if (!res.ok) return { status: "error", message: res.message };

  revalidatePath("/dashboard/settings");
  return { status: "success", message: `Hak akses ${res.user.name} diperbarui.` };
}

export async function deleteUserAction(userId: string): Promise<UserMgmtState> {
  const actor = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!actor) redirect("/login");
  if (actor.role !== "super_admin") {
    return { status: "error", message: "Hanya Super Admin yang dapat menghapus akun." };
  }

  const res = deleteUserAccount(userId, actor.id);
  if (!res.ok) return { status: "error", message: res.message };

  revalidatePath("/dashboard/settings");
  return { status: "success", message: "Akun berhasil dihapus." };
}
