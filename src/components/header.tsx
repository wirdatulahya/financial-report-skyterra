"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, CheckCircle2, Search } from "lucide-react";
import { ROLE_LABEL, type SessionUser } from "@/lib/roles";

export interface LowStockNotice {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export default function Header({
  user,
  lowStockItems = [],
}: {
  user: SessionUser;
  lowStockItems?: LowStockNotice[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/dashboard/cashflow?q=${encodeURIComponent(trimmed)}` : "/dashboard/cashflow"
    );
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-skyterra-cyan/30"
      >
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari transaksi lalu tekan Enter..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
        />
      </form>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifikasi stok sparepart"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Notifikasi Sistem
                </p>
                {lowStockItems.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                    {lowStockItems.length} menipis
                  </span>
                )}
              </div>

              {lowStockItems.length === 0 ? (
                <div className="flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Semua stok sparepart dalam kondisi aman.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lowStockItems.map((item) => (
                    <Link
                      key={item.id}
                      href="/dashboard/sparepart"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-50 border border-amber-100 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-amber-700">
                          Sisa stok {item.stock} (min. {item.minStock})
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role Badge */}
        <span className="text-[10px] font-bold uppercase tracking-wider bg-skyterra-cyan/10 text-skyterra-cyan px-2.5 py-1 rounded-full">
          {ROLE_LABEL[user.role]}
        </span>

        {/* Profile */}
        <Link
          href="/dashboard/profile"
          title="Lihat profil"
          className="flex items-center gap-3 pl-4 border-l border-gray-200 rounded-lg hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyterra-blue/30"
        >
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-[11px] text-gray-400">{user.division}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-skyterra-cyan to-skyterra-blue flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{initials}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
