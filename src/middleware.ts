import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { canAccess } from "@/lib/roles";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const user = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  // Sudah login tapi membuka /login → arahkan ke dashboard
  if (pathname === "/login") {
    return user
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : NextResponse.next();
  }

  // Belum login → ke /login, simpan tujuan awal
  if (!user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname + search);
    const res = NextResponse.redirect(url);
    res.cookies.delete(SESSION_COOKIE); // bersihkan token kedaluwarsa/rusak
    return res;
  }

  // Login tapi perannya tidak berhak membuka halaman ini
  if (!canAccess(user.role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard?akses=ditolak", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
