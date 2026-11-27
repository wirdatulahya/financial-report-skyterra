// ============================================================
// Autentikasi & Sesi
// Token sesi = base64url(payload).base64url(HMAC-SHA256)
// Memakai Web Crypto agar bisa dipakai di Middleware (Edge) & Server Actions.
// ============================================================

import type { Role, SessionUser } from "@/lib/roles";

export type { SessionUser };

interface Session extends SessionUser {
  exp: number; // epoch detik
}

interface StoredUser extends SessionUser {
  passwordHash: string; // SHA-256 hex
}

export const SESSION_COOKIE = "skyterra_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam (satu hari kerja)

// ------------------------------------------------------------
// Akun demo — ganti dengan tabel `users` di database (bcrypt/argon2)
// saat backend sudah tersedia.
// ------------------------------------------------------------
const DEFAULT_USERS: StoredUser[] = [
  {
    id: "usr-001",
    name: "Wirdatul Ahya",
    email: "admin@skyterra.co.id",
    role: "super_admin",
    division: "Semua Divisi",
    passwordHash: "b5af2beb9b7fd5aa4eb21b61925bd3856793e54e0a39052fbcfaf5b477fd07f3", // Admin#2026
  },
  {
    id: "usr-002",
    name: "Dimas Wicaksono",
    email: "manajer@skyterra.co.id",
    role: "manajer_divisi",
    division: "Divisi Technical",
    passwordHash: "2a492f53be2e468cc10070dab6dd19bb37b764f634b0ae96830bce66b91f988f", // Manajer#2026
  },
  {
    id: "usr-003",
    name: "Ahmad Fauzi",
    email: "viewer@skyterra.co.id",
    role: "viewer",
    division: "Divisi Finance",
    passwordHash: "52b588d5ac6e81abd20bf926a5a7a63abfb6053a7e00ec36487dcb25bce1c0aa", // Viewer#2026
  },
];

// ------------------------------------------------------------
// Helper kriptografi
// ------------------------------------------------------------
const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET belum diatur di environment.");
    }
    return "dev-only-secret-ganti-di-env-local";
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ------------------------------------------------------------
// API publik
// ------------------------------------------------------------
// Kata sandi yang diubah lewat halaman Profil. Disimpan di memori server
// (hilang saat server restart) sampai tabel `users` di database tersedia.
// Disimpan di globalThis karena Next.js bisa memuat modul ini lebih dari sekali
// (per rute), sehingga variabel modul biasa tidak saling berbagi.
const globalStore = globalThis as unknown as {
  __skyterraPw?: Map<string, string>;
  __skyterraUsers?: StoredUser[];
};
const passwordOverrides = (globalStore.__skyterraPw ??= new Map<string, string>());
const usersDb = (globalStore.__skyterraUsers ??= DEFAULT_USERS.map((u) => ({ ...u })));

function toSessionUser(u: StoredUser): SessionUser {
  const { passwordHash: _omit, ...sessionUser } = u;
  return sessionUser;
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = usersDb.find((u) => u.email === email.trim().toLowerCase());
  const hash = await sha256Hex(password);
  const expected = user ? passwordOverrides.get(user.id) ?? user.passwordHash : "";
  if (!user || !timingSafeEqual(hash, expected)) return null;
  return toSessionUser(user);
}

export function listUsers(): SessionUser[] {
  return usersDb.map(toSessionUser);
}

export function updateUserAccess(
  userId: string,
  role: Role,
  division: string
): { ok: true; user: SessionUser } | { ok: false; message: string } {
  const target = usersDb.find((u) => u.id === userId);
  if (!target) return { ok: false, message: "Pengguna tidak ditemukan." };
  if (target.role === "super_admin" && role !== "super_admin") {
    const adminCount = usersDb.filter((u) => u.role === "super_admin").length;
    if (adminCount <= 1) {
      return { ok: false, message: "Minimal harus ada satu Super Admin aktif." };
    }
  }
  target.role = role;
  target.division = role === "super_admin" ? "Semua Divisi" : division;
  return { ok: true, user: toSessionUser(target) };
}

export async function createUserAccount(input: {
  name: string;
  email: string;
  role: Role;
  division: string;
  password: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; message: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (usersDb.some((u) => u.email === normalizedEmail)) {
    return { ok: false, message: `Email ${normalizedEmail} sudah terdaftar.` };
  }
  const newUser: StoredUser = {
    id: `usr-${String(usersDb.length + 1).padStart(3, "0")}-${crypto.randomUUID().slice(0, 4)}`,
    name: input.name.trim(),
    email: normalizedEmail,
    role: input.role,
    division: input.role === "super_admin" ? "Semua Divisi" : input.division,
    passwordHash: await sha256Hex(input.password),
  };
  usersDb.push(newUser);
  return { ok: true, user: toSessionUser(newUser) };
}

export function deleteUserAccount(
  userId: string,
  actorId: string
): { ok: true } | { ok: false; message: string } {
  if (userId === actorId) {
    return { ok: false, message: "Tidak dapat menghapus akun yang sedang aktif digunakan." };
  }
  const idx = usersDb.findIndex((u) => u.id === userId);
  if (idx === -1) return { ok: false, message: "Pengguna tidak ditemukan." };
  if (usersDb[idx].role === "super_admin") {
    const adminCount = usersDb.filter((u) => u.role === "super_admin").length;
    if (adminCount <= 1) {
      return { ok: false, message: "Minimal harus ada satu Super Admin aktif." };
    }
  }
  usersDb.splice(idx, 1);
  passwordOverrides.delete(userId);
  return { ok: true };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const session: Session = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifySession(
  token: string | undefined
): Promise<{ user: SessionUser; expiresAt: number } | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      fromBase64Url(sig),
      encoder.encode(payload)
    );
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as Session;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    const { exp, ...user } = session;
    return { user, expiresAt: exp * 1000 };
  } catch {
    return null;
  }
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionUser | null> {
  return (await verifySession(token))?.user ?? null;
}

export async function changePassword(
  userId: string,
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await verifyCredentials(email, currentPassword);
  if (!user || user.id !== userId) return false;
  passwordOverrides.set(userId, await sha256Hex(newPassword));
  return true;
}
