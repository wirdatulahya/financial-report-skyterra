"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  changePassword,
  createSessionToken,
  verifyCredentials,
  verifySessionToken,
} from "@/lib/auth";

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
