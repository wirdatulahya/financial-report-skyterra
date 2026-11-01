"use client";

import { Bell, Search } from "lucide-react";
import { ROLE_LABEL, type SessionUser } from "@/lib/roles";

export default function Header({ user }: { user: SessionUser }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 w-full max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari transaksi, sparepart, laporan..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Role Badge */}
        <span className="text-[10px] font-bold uppercase tracking-wider bg-skyterra-cyan/10 text-skyterra-cyan px-2.5 py-1 rounded-full">
          {ROLE_LABEL[user.role]}
        </span>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-[11px] text-gray-400">{user.division}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-skyterra-cyan to-skyterra-blue flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
