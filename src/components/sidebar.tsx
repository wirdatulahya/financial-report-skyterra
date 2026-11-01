"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Package,
  Calculator,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
  {
    label: "Menu Utama",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Arus Kas",
        href: "/dashboard/cashflow",
        icon: ArrowLeftRight,
      },
      {
        name: "Inventaris Sparepart",
        href: "/dashboard/sparepart",
        icon: Package,
      },
    ],
  },
  {
    label: "Kalkulasi & Laporan",
    items: [
      {
        name: "Kalkulator Pajak",
        href: "/dashboard/tax",
        icon: Calculator,
      },
      {
        name: "Laporan PDF",
        href: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        name: "Pengaturan",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-skyterra-dark border-r border-white/10 text-white transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-skyterra-cyan to-skyterra-blue flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold tracking-wide leading-none">
              SKYTERRA
            </p>
            <p className="text-[10px] text-gray-400 tracking-widest">
              NUSANTARA
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuItems.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mb-2">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-skyterra-cyan/15 text-skyterra-cyan"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          isActive ? "text-skyterra-cyan" : "text-gray-500"
                        )}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 w-full">
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-skyterra-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
