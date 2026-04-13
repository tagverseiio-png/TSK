"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorks, deleteWork } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Film, Image as ImageIcon } from "lucide-react";

export default function AdminWorksPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getWorks();
      setWorks(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all uploaded media files.`)) return;
    setDeleting(id);
    try {
      await deleteWork(id);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-monument text-2xl text-white">Works</h1>
          <p className="text-white/40 text-sm mt-1">{works.length} case studies</p>
        </div>
        <Link
          href="/admin/works/new"
          className="flex items-center gap-2 bg-brand-orange text-black px-5 py-3 rounded-xl font-monument text-xs tracking-widest uppercase hover:bg-orange-500 transition-all"
        >
          <Plus size={16} /> New Work
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-16 text-center">
          <Film size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No works yet</p>
          <Link href="/admin/works/new" className="text-brand-orange text-sm mt-2 inline-block hover:underline">Create your first →</Link>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {works.map((w) => (
              <div key={w._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all group">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {w.image ? (
                    <img src={w.image} alt={w.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={20} className="text-white/20" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-monument text-sm text-white truncate">{w.name}</p>
                    {w.featured && (
                      <span className="text-[9px] bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-white/40 text-xs">{w.category}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/40 text-xs">{w.year}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="flex items-center gap-1 text-white/30 text-xs">
                      <Film size={10} />
                      {(w.media || []).length} media
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/works/${w._id}`}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-brand-orange/20 hover:text-brand-orange text-white/50 transition-all"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(w._id, w.name)}
                    disabled={deleting === w._id}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/50 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
