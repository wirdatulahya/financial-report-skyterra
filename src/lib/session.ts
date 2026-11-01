import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Membaca user yang sedang login dari cookie sesi (Server Component).
export async function getCurrentUser() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}
