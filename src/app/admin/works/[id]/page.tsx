"use client";

import { useEffect, useState, useRef, DragEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getWorks, updateWork, uploadMedia } from "@/lib/adminApi";
import Combobox from "@/components/admin/Combobox";
import { ArrowLeft, Plus, X, Film, Image as ImageIcon, Move, Loader, CheckCircle, Upload, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "Creative Direction", "Professional Photography", "Social Media Content", 
  "High-End Commercials", "Brand Campaigns", "Account Growth", 
  "Event Coverage", "Influencer Marketing", "Podcast Services", "Concert Production"
];
const YEARS = ["2023", "2024", "2025", "2026"];
const COUNT_LABELS = ["01", "02", "03", "04", "05", "10+", "20+", "50+"];
const COMMON_SERVICES = ["Creative Direction", "Post-Production", "Cinematography", "Photography", "VFX & Animation", "Color Grading", "Sound Design", "Copywriting"];

interface MediaItem {
  type: "image" | "video";
  src: string;
  poster?: string;
  caption: string;
  uploading?: boolean;
  error?: string;
  preview?: string;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2"><label className="text-[10px] text-brand-orange uppercase tracking-widest">{label}</label>{children}</div>
);

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [workId, setWorkId] = useState("");

  const [form, setForm] = useState({
    name: "", firstName: "", lastName: "", slug: "", category: "",
    year: "", count: "", tagline: "", description: "", heroTagline: "",
    services: "", number: "", featured: false,
  });
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const works = await getWorks();
        const work = works.find((w: any) => w._id === params.id);
        if (!work) { router.push("/admin/works"); return; }

        setWorkId(work._id);
        setForm({
          name: work.name || "",
          firstName: work.firstName || "",
          lastName: work.lastName || "",
          slug: work.slug || "",
          category: work.category || "",
          year: work.year || "",
          count: work.count || "01",
          tagline: work.tagline || "",
          description: work.description || "",
          heroTagline: work.heroTagline || "",
          services: Array.isArray(work.services) ? work.services.join(", ") : work.services || "",
          number: work.number || "",
          featured: work.featured || false,
        });
        setMedia((work.media || []).map((m: any) => ({ ...m })));
      } catch {}
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  const processFiles = async (files: File[]) => {
    const newItems: MediaItem[] = files.map((f) => ({
      type: f.type.startsWith("video/") ? "video" : "image",
      src: "", caption: f.name.replace(/\.[^.]+$/, ""),
      uploading: true,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    // Check video limit
    const existingVideos = media.filter(m => m.type === "video").length;
    const newVideos = newItems.filter(i => i.type === "video").length;
    if (existingVideos + newVideos > 3) {
      alert("Maximum 3 videos allowed per work.");
      return;
    }

    const startIdx = media.length;
    setMedia((prev) => [...prev, ...newItems]);
    try {
      const results = await uploadMedia(files);
      setMedia((prev) =>
        prev.map((item, i) => {
          if (i < startIdx) return item;
          const res = results[i - startIdx];
          return res ? { ...item, src: res.url, uploading: false } : { ...item, uploading: false, error: "Failed" };
        })
      );
    } catch {
      setMedia((prev) => prev.map((item, i) => i >= startIdx ? { ...item, uploading: false, error: "Failed" } : item));
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (files.length) processFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (media.some((m) => m.uploading)) { alert("Wait for uploads"); return; }
    setSaving(true);
    try {
      const heroImage = media.find((m) => m.type === "image" && m.src);
      await updateWork(workId, {
        ...form,
        image: heroImage?.src || form.name,
        bgImage: heroImage?.src || "",
        media: media.filter((m) => m.src).map(({ type, src, poster, caption }) => ({ type, src, poster, caption })),
      });
      router.push("/admin/works");
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-orange transition-all text-sm";


  if (loading) return <div className="flex items-center justify-center h-64"><Loader size={32} className="text-brand-orange animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/works" className="text-white/40 hover:text-white"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-monument text-2xl text-white">Edit Work</h1>
          <p className="text-white/40 text-sm mt-0.5">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-6">
          <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Project Name *"><input required className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="URL Slug *"><input required className={inputCls} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></Field>
            <Field label="Category"><Combobox value={form.category} onChange={(val) => setForm((f) => ({ ...f, category: val }))} options={CATEGORIES} /></Field>
            <Field label="Year"><Combobox value={form.year} onChange={(val) => setForm((f) => ({ ...f, year: val }))} options={YEARS} /></Field>
            <Field label="Number"><input className={inputCls} value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} /></Field>
            <Field label="Count Label"><Combobox value={form.count} onChange={(val) => setForm((f) => ({ ...f, count: val }))} options={COUNT_LABELS} /></Field>
          </div>
          <Field label="Tagline"><input className={inputCls} value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} /></Field>
          <Field label="Description"><textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
          <Field label="Hero Tagline (CAPS)"><textarea className={`${inputCls} resize-none`} rows={2} value={form.heroTagline} onChange={(e) => setForm((f) => ({ ...f, heroTagline: e.target.value }))} /></Field>
          <Field label="Services (comma separated)"><Combobox value={form.services} onChange={(val) => setForm((f) => ({ ...f, services: val }))} options={COMMON_SERVICES} /></Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${form.featured ? "bg-brand-orange" : "bg-white/10"}`} onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${form.featured ? "ml-auto" : ""}`} />
            </div>
            <span className="text-sm text-white/60">Featured</span>
          </label>
        </div>

        {/* Media */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Media ({media.length})</h2>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-4 py-2 rounded-xl text-xs font-monument uppercase tracking-wider hover:bg-brand-orange/20 transition-all">
              <Plus size={14} /> Add Files
            </button>
          </div>
          <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? "border-brand-orange bg-brand-orange/5" : "border-white/10 hover:border-white/20"}`}>
            <Upload size={28} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Drop new files here or click to browse</p>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => { if (e.target.files) processFiles(Array.from(e.target.files)); e.target.value = ""; }} />
          {media.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                {item.uploading ? <Loader size={18} className="text-brand-orange animate-spin" /> :
                 item.error ? <AlertCircle size={18} className="text-red-400" /> :
                 item.type === "video" ? <Film size={24} className="text-white/40" /> :
                 <img src={item.preview || item.src} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-orange transition-all" value={item.caption} onChange={(e) => setMedia((prev) => prev.map((m, i) => i === idx ? { ...m, caption: e.target.value } : m))} placeholder="Caption" />
                {item.error && <p className="text-red-400 text-xs mt-1">{item.error}</p>}
                {!item.uploading && !item.error && <p className="text-white/20 text-[10px] mt-1 truncate">{item.src}</p>}
              </div>
              <div className="flex flex-col gap-2">
                {idx > 0 && <button type="button" onClick={() => setMedia((prev) => { const u = [...prev]; const [m] = u.splice(idx, 1); return [m, ...u]; })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-brand-orange/20 hover:text-brand-orange text-white/30 transition-all"><Move size={14} /></button>}
                <button type="button" onClick={() => setMedia((prev) => prev.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/30 transition-all"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving || media.some((m) => m.uploading)} className="flex items-center gap-3 bg-brand-orange text-black px-8 py-4 rounded-xl font-monument uppercase tracking-widest text-sm hover:bg-orange-500 transition-all disabled:opacity-60">
            {saving ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/admin/works" className="text-white/40 hover:text-white text-sm transition-colors flex items-center">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
