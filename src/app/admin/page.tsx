"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookings, getWorks } from "@/lib/adminApi";
import { Film, CalendarCheck, Clock, CheckCircle, XCircle, Settings, Plus } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, rejected: 0, works: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bookings, works] = await Promise.all([getBookings(), getWorks()]);
        const pending = bookings.filter((b: any) => b.status === "pending").length;
        const confirmed = bookings.filter((b: any) => b.status === "confirmed").length;
        const rejected = bookings.filter((b: any) => b.status === "rejected").length;
        setStats({ total: bookings.length, pending, confirmed, rejected, works: works.length });
        setRecentBookings(bookings.slice(0, 5));
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: "Pending Bookings", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
    { label: "Total Works", value: stats.works, icon: Film, color: "text-brand-orange", bg: "bg-brand-orange/10 border-brand-orange/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-monument text-2xl md:text-3xl text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Overview of TSK operations</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/works/new"
            className="flex items-center gap-2 bg-brand-orange text-black px-4 py-2.5 rounded-xl font-monument text-xs tracking-widest uppercase hover:bg-orange-500 transition-all"
          >
            <Plus size={16} /> New Work
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`border rounded-2xl p-6 ${bg}`}>
              <div className="flex items-start justify-between mb-4">
                <Icon size={22} className={color} />
              </div>
              <p className={`font-monument text-3xl ${color}`}>{value}</p>
              <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/admin/bookings", label: "Manage Bookings", desc: "Review and confirm pending bookings", icon: CalendarCheck },
          { href: "/admin/works/new", label: "Add New Work", desc: "Upload a new case study with media", icon: Film },
          { href: "/admin/settings", label: "Studio Settings", desc: "Update pricing, slots, WhatsApp number", icon: Settings },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 hover:border-brand-orange/40 hover:bg-white/5 transition-all group">
            <Icon size={24} className="text-brand-orange mb-4" />
            <h3 className="font-monument text-sm text-white group-hover:text-brand-orange transition-colors">{label}</h3>
            <p className="text-white/30 text-xs mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-monument text-sm text-white tracking-widest uppercase">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-brand-orange text-xs hover:underline">View All →</Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">No bookings yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentBookings.map((b) => (
              <div key={b._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{b.name}</p>
                  <p className="text-white/40 text-xs">{b.date} at {b.startTime} · {b.duration}h</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider ${
                  b.status === "confirmed" ? "bg-green-400/10 text-green-400" :
                  b.status === "rejected" ? "bg-red-400/10 text-red-400" :
                  "bg-yellow-400/10 text-yellow-400"
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
