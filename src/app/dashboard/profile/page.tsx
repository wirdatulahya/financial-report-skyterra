import { redirect } from "next/navigation";
import { Check, Clock, LogOut, Minus } from "lucide-react";
import { getCurrentSession } from "@/lib/session";
import { logoutAction } from "@/lib/auth-actions";
import {
  MODULES,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  canAccess,
  type Role,
} from "@/lib/roles";
import PasswordForm from "./password-form";

export const metadata = { title: "Profil Saya — SkyTerra Financial Portal" };

const ROLE_STYLE: Record<Role, string> = {
  super_admin: "bg-skyterra-navy text-white",
  manajer_divisi: "bg-skyterra-cyan/15 text-skyterra-blue",
  viewer: "bg-gray-100 text-gray-700",
};

const timeFmt = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export default async function ProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const { user, expiresAt } = session;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dataScope =
    user.role === "super_admin" ? "Semua divisi" : `Hanya ${user.division}`;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-1">
          Informasi akun, hak akses, dan keamanan login Anda.
        </p>
      </div>

      {/* Identitas */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-20 bg-skyterra-navy" aria-hidden="true" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="-mt-10 shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-skyterra-cyan to-skyterra-blue ring-4 ring-white flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0 sm:pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[user.role]}`}
                >
                  {ROLE_LABEL[user.role]}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 border-t border-gray-100 pt-6">
            <Info label="Nama lengkap" value={user.name} />
            <Info label="Email kantor" value={user.email} />
            <Info label="Divisi" value={user.division} />
            <Info label="ID pengguna" value={user.id} mono />
          </dl>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Hak akses */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900">Hak akses</h2>
          <p className="text-sm text-gray-500 mt-1">
            {ROLE_DESCRIPTION[user.role]}
          </p>

          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-500">Cakupan data: </span>
            <span className="font-semibold text-gray-800">{dataScope}</span>
          </div>

          <ul className="mt-4 divide-y divide-gray-100">
            {MODULES.map((m) => {
              const allowed = canAccess(user.role, m.href);
              return (
                <li key={m.href} className="flex items-center justify-between py-3">
                  <span
                    className={
                      allowed ? "text-sm text-gray-800" : "text-sm text-gray-400"
                    }
                  >
                    {m.name}
                  </span>
                  {allowed ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <Check className="w-4 h-4" /> Bisa diakses
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <Minus className="w-4 h-4" /> Tidak ada akses
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-gray-400">
            Perubahan peran hanya bisa dilakukan oleh Super Admin.
          </p>
        </section>

        {/* Keamanan */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900">Ubah kata sandi</h2>
            <p className="text-sm text-gray-500 mt-1">
              Minimal 8 karakter, kombinasi huruf dan angka.
            </p>
            <PasswordForm />
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900">Sesi login</h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              Berakhir otomatis pukul{" "}
              <span className="font-semibold text-gray-800 tabular-nums">
                {timeFmt.format(expiresAt)} WIB
              </span>
            </p>
            <form action={logoutAction} className="mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari akun
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd
        className={`mt-1 text-sm font-semibold text-gray-800 truncate ${mono ? "tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
