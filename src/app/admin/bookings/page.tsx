"use client";

import { useEffect, useState } from "react";
import { getBookings, updateBookingStatus, deleteBooking } from "@/lib/adminApi";
import { CheckCircle, XCircle, Trash2, Clock, Phone, CalendarDays, DollarSign, Filter } from "lucide-react";

type Status = "all" | "pending" | "confirmed" | "rejected";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>("all");
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setBookings(await getBookings()); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: "confirmed" | "rejected" | "pending") => {
    setActing(id);
    try { await updateBookingStatus(id, status); await load(); } catch (e: any) { alert(e.message); }
    setActing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    setActing(id);
    try { await deleteBooking(id); await load(); } catch (e: any) { alert(e.message); }
    setActing(null);
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-green-400/10 text-green-400 border-green-400/20" :
    s === "rejected" ? "bg-red-400/10 text-red-400 border-red-400/20" :
    "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-monument text-2xl text-white">Bookings</h1>
        <p className="text-white/40 text-sm mt-1">Confirm or reject studio booking requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "confirmed", "rejected"] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-monument uppercase tracking-wider transition-all ${
              filter === s ? "bg-brand-orange text-black" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {s} <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === s ? "bg-black/20 text-black" : "bg-white/10"}`}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white/5 rounded-2xl h-32 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-16 text-center">
          <CalendarDays size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No bookings {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b._id} className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-monument text-lg text-white">{b.name}</h3>
                    <span className={`text-[10px] px-3 py-1 rounded-full border uppercase tracking-widest font-bold ${statusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Phone size={14} className="text-brand-orange" />{b.phone}
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <CalendarDays size={14} className="text-brand-orange" />{b.date}
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Clock size={14} className="text-brand-orange" />{b.startTime} · {b.duration}h
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <DollarSign size={14} className="text-brand-orange" />${b.totalPrice || "—"}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {b.videoCoverage && <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50">Video Coverage</span>}
                    {b.reelsNoSubs > 0 && <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50">{b.reelsNoSubs}× Reels (no subs)</span>}
                    {b.reelsWithSubs > 0 && <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50">{b.reelsWithSubs}× Reels (w/ subs)</span>}
                    {b.fullPodcast > 0 && <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50">{b.fullPodcast}× Full Podcast Edit</span>}
                  </div>

                  <p className="text-white/20 text-xs">
                    Submitted: {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 flex-wrap md:flex-nowrap">
                  {b.status !== "confirmed" && (
                    <button
                      disabled={acting === b._id}
                      onClick={() => handleStatus(b._id, "confirmed")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={15} /> Confirm
                    </button>
                  )}
                  {b.status !== "rejected" && (
                    <button
                      disabled={acting === b._id}
                      onClick={() => handleStatus(b._id, "rejected")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  )}
                  {b.status === "confirmed" && (
                    <button
                      disabled={acting === b._id}
                      onClick={() => handleStatus(b._id, "pending")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <Filter size={15} /> Reopen
                    </button>
                  )}
                  <button
                    disabled={acting === b._id}
                    onClick={() => handleDelete(b._id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 text-xs hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
