// ============================================================
// Autentikasi & Sesi
// Token sesi = base64url(payload).base64url(HMAC-SHA256)
// Memakai Web Crypto agar bisa dipakai di Middleware (Edge) & Server Actions.
// ============================================================

import type { SessionUser } from "@/lib/roles";

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
const USERS: StoredUser[] = [
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
    division: "Divisi Survei Udara (Drone)",
    passwordHash: "2a492f53be2e468cc10070dab6dd19bb37b764f634b0ae96830bce66b91f988f", // Manajer#2026
  },
  {
    id: "usr-003",
    name: "Ahmad Fauzi",
    email: "viewer@skyterra.co.id",
    role: "viewer",
    division: "Divisi Pemetaan Terestrial",
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
export async function verifyCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = USERS.find((u) => u.email === email.trim().toLowerCase());
  const hash = await sha256Hex(password);
  if (!user || !timingSafeEqual(hash, user.passwordHash)) return null;
  const { passwordHash: _omit, ...sessionUser } = user;
  return sessionUser;
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

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionUser | null> {
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
    const { exp: _exp, ...user } = session;
    return user;
  } catch {
    return null;
  }
}
