import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, verifySessionToken } from "@/lib/auth";

// Membaca user yang sedang login dari cookie sesi (Server Component).
export async function getCurrentUser() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

// User + waktu sesi berakhir (epoch ms).
export async function getCurrentSession() {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}
