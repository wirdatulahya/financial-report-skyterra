"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Building2,
  CheckCircle2,
  KeyRound,
  Loader2,
  Plus,
  Shield,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { categories, divisions } from "@/lib/mock-data";
import { ROLE_LABEL, type Role, type SessionUser } from "@/lib/roles";
import {
  createUserAction,
  deleteUserAction,
  updateUserAccessAction,
  type UserMgmtState,
} from "@/lib/auth-actions";

interface SettingsClientProps {
  users: SessionUser[];
  currentUserId: string;
}

const ROLE_BADGE: Record<Role, string> = {
  super_admin: "bg-skyterra-navy text-white",
  manajer_divisi: "bg-skyterra-cyan/15 text-skyterra-blue",
  viewer: "bg-gray-100 text-gray-700",
};

const RBAC_MATRIX: {
  module: string;
  super_admin: string;
  manajer_divisi: string;
  viewer: string;
}[] = [
  {
    module: "Dashboard Overview",
    super_admin: "Semua Divisi",
    manajer_divisi: "Divisi Sendiri",
    viewer: "Divisi Sendiri",
  },
  {
    module: "Arus Kas (Single & Bulk Upload)",
    super_admin: "Lihat, Tambah, Upload, Hapus",
    manajer_divisi: "Lihat, Tambah, Upload, Hapus (Divisi Sendiri)",
    viewer: "Hanya Lihat (Divisi Sendiri)",
  },
  {
    module: "Inventaris Sparepart",
    super_admin: "Lihat, Tambah, Ubah, Mutasi, Hapus",
    manajer_divisi: "Lihat, Tambah, Ubah, Mutasi, Hapus",
    viewer: "Hanya Lihat",
  },
  {
    module: "Kalkulator Pajak & Rekonsiliasi",
    super_admin: "Akses Penuh (Semua Divisi)",
    manajer_divisi: "Akses Penuh (Divisi Sendiri)",
    viewer: "Tidak Dapat Mengakses",
  },
  {
    module: "Laporan PDF Formal",
    super_admin: "Semua Divisi & Cetak A4",
    manajer_divisi: "Divisi Sendiri & Cetak A4",
    viewer: "Divisi Sendiri & Cetak A4",
  },
  {
    module: "Pengaturan & RBAC",
    super_admin: "Kelola Akun & Hak Akses",
    manajer_divisi: "Tidak Dapat Mengakses",
    viewer: "Tidak Dapat Mengakses",
  },
];

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

export default function SettingsClient({ users, currentUserId }: SettingsClientProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [roleInput, setRoleInput] = useState<Role>("manajer_divisi");
  const [feedback, setFeedback] = useState<UserMgmtState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [addState, addAction] = useFormState<UserMgmtState, FormData>(createUserAction, {});

  useEffect(() => {
    if (addState.status === "success") {
      setShowAdd(false);
      setFeedback(addState);
    }
  }, [addState]);

  const handleAccessChange = (userId: string, role: Role, division: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateUserAccessAction(userId, role, division);
      setFeedback(res);
    });
  };

  const handleDelete = (u: SessionUser) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteUserAction(u.id);
      setFeedback(res);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan & RBAC</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola akun pengguna, pembatasan hak akses divisi, dan konfigurasi master sistem PT SkyTerra Nusantara.
        </p>
      </div>

      {feedback?.message && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${
            feedback.status === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {feedback.message}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Bagian 1: Manajemen Pengguna */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-skyterra-cyan/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-skyterra-cyan" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Manajemen Pengguna</h2>
              <p className="text-xs text-gray-500">
                {users.length} akun terdaftar. Perubahan peran atau divisi berlaku saat pengguna login ulang.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-skyterra-cyan to-skyterra-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Tambah Akun
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-6 font-semibold">Pengguna</th>
                <th className="text-left py-3 px-4 font-semibold">Peran (Role)</th>
                <th className="text-left py-3 px-4 font-semibold">Divisi Akses</th>
                <th className="text-right py-3 px-6 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const fallbackDivision =
                  divisions.find((d) => d.name === u.division)?.name ?? divisions[0].name;
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Anda
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        aria-label={`Peran untuk ${u.name}`}
                        value={u.role}
                        disabled={isPending}
                        onChange={(e) => {
                          const nextRole = e.target.value as Role;
                          handleAccessChange(
                            u.id,
                            nextRole,
                            nextRole === "super_admin" ? "Semua Divisi" : fallbackDivision
                          );
                        }}
                        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30"
                      >
                        <option value="super_admin">{ROLE_LABEL.super_admin}</option>
                        <option value="manajer_divisi">{ROLE_LABEL.manajer_divisi}</option>
                        <option value="viewer">{ROLE_LABEL.viewer}</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === "super_admin" ? (
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE.super_admin}`}>
                          Semua Divisi
                        </span>
                      ) : (
                        <select
                          aria-label={`Divisi untuk ${u.name}`}
                          value={fallbackDivision}
                          disabled={isPending}
                          onChange={(e) => handleAccessChange(u.id, u.role, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30"
                        >
                          {divisions.map((d) => (
                            <option key={d.id} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        disabled={isSelf || isPending}
                        onClick={() => handleDelete(u)}
                        title={isSelf ? "Akun aktif tidak bisa dihapus" : `Hapus ${u.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bagian 2: Matriks RBAC & Konfigurasi Master */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matriks RBAC */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Shield className="w-5 h-5 text-skyterra-cyan" />
            <h2 className="text-base font-bold text-gray-900">Matriks Hak Akses (RBAC)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2.5 pr-3 font-semibold">Modul</th>
                  <th className="text-left py-2.5 px-3 font-semibold">Super Admin</th>
                  <th className="text-left py-2.5 px-3 font-semibold">Manajer Divisi</th>
                  <th className="text-left py-2.5 pl-3 font-semibold">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {RBAC_MATRIX.map((row) => (
                  <tr key={row.module} className="border-b border-gray-50">
                    <td className="py-2.5 pr-3 font-semibold text-gray-800">{row.module}</td>
                    <td className="py-2.5 px-3 text-emerald-700">{row.super_admin}</td>
                    <td className="py-2.5 px-3 text-skyterra-blue">{row.manajer_divisi}</td>
                    <td className="py-2.5 pl-3 text-gray-500">{row.viewer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Data Master & Tarif Sistem */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <Building2 className="w-5 h-5 text-skyterra-cyan" />
              <h2 className="text-base font-bold text-gray-900">Divisi Operasional Aktif</h2>
            </div>
            <ul className="space-y-2">
              {divisions.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <span className="font-semibold text-gray-800">{d.name}</span>
                  <span className="font-mono text-[11px] text-gray-400">{d.id}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <Tag className="w-5 h-5 text-skyterra-cyan" />
              <h2 className="text-base font-bold text-gray-900">Kategori & Tarif Default</h2>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {categories.map((c) => (
                <span
                  key={c.id}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    c.type === "income"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {c.name}
                </span>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50">
                <p className="text-gray-400">Default PPh 23</p>
                <p className="font-bold text-gray-800 mt-0.5">2.0%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50">
                <p className="text-gray-400">Default PPN</p>
                <p className="font-bold text-gray-800 mt-0.5">11.0%</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Tambah Akun */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Tambah Akun Baru"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-skyterra-cyan" />
                Tambah Akun Pengguna
              </h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                aria-label="Tutup"
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form action={addAction} className="space-y-4">
              {addState.status === "error" && addState.message && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {addState.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nama Lengkap
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Nama staf..."
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email Kantor
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="nama@skyterra.co.id"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Peran (Role)
                  </label>
                  <select
                    name="role"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as Role)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="manajer_divisi">Manajer Divisi</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Divisi
                  </label>
                  <select
                    name="division"
                    disabled={roleInput === "super_admin"}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Kata Sandi Awal (min. 8 karakter)
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skyterra-cyan/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <SubmitBtn label="Simpan Akun" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
