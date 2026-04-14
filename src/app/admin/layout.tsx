"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, logout } from "@/lib/adminApi";
import {
  LayoutDashboard, Film, CalendarCheck, Settings, LogOut, Menu, X, Users, Layers
} from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/works", label: "Works", icon: Film },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pathname !== "/admin/login" && !isLoggedIn()) {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  if (!mounted) return null;
  if (pathname === "/admin/login") return <>{children}</>;
  if (!isLoggedIn()) return null;

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-white/5 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
              <span className="font-monument text-black text-xs font-bold">T</span>
            </div>
            <div>
              <p className="font-monument text-xs text-white tracking-widest">TSK ADMIN</p>
              <p className="text-white/30 text-[10px]">Control Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-brand-orange text-black"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#111] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <span className="font-monument text-xs text-white tracking-widest">TSK ADMIN</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
