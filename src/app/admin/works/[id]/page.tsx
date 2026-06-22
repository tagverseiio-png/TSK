"use client";

import { useEffect, useState, useRef, DragEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getWorks, updateWork, uploadMediaWithProgress, deleteMedia } from "@/lib/adminApi";
import { formatBytes } from "@/lib/videoCompressor";
import { uploadFileToS3Direct, triggerMediaConvertJob } from "@/lib/clientS3";
import Combobox from "@/components/admin/Combobox";
import { ArrowLeft, Plus, X, Film, Image as ImageIcon, Move, Loader, CheckCircle, Upload, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  srcHigh?: string;
  srcLow?: string;
  hlsUrl?: string;
  caption: string;
  uploading?: boolean;
  error?: string;
  preview?: string;
  originalSize?: number;
  compressedSize?: number;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] text-brand-orange uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams();
  const workId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    firstName: "",
    lastName: "",
    slug: "",
    category: "",
    year: "",
    count: "",
    tagline: "",
    description: "",
    heroTagline: "",
    services: "",
    number: "",
    featured: false,
  });

  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const works = await getWorks();
        const work = works.find((w: any) => w._id === workId);
        if (!work) {
          router.push("/admin/works");
          return;
        }
        setForm({
          name: work.name || "",
          firstName: work.firstName || "",
          lastName: work.lastName || "",
          slug: work.slug || "",
          category: work.category || "",
          year: work.year || "",
          count: work.count || "",
          tagline: work.tagline || "",
          description: work.description || "",
          heroTagline: work.heroTagline || "",
          services: Array.isArray(work.services) ? work.services.join(", ") : work.services || "",
          number: work.number || "",
          featured: !!work.featured,
        });
        setMedia((work.media || []).map((m: any) => ({ ...m })));
      } catch { }
      setLoading(false);
    }
    load();
  }, [workId, router]);

  const processFiles = async (files: File[]) => {
    const newItemsCount = files.map((f) => ({
      type: f.type.startsWith("video/") ? "video" : "image"
    }));
    const existingVideos = media.filter(m => m.type === "video").length;
    const newVideos = newItemsCount.filter(i => i.type === "video").length;
    if (existingVideos + newVideos > 3) {
      alert("Maximum 3 videos allowed per work.");
      return;
    }

    const newItems: MediaItem[] = files.map((f) => ({
      type: f.type.startsWith("video/") ? "video" : "image",
      src: "", caption: f.name.replace(/\.[^.]+$/, ""),
      uploading: true,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      originalSize: f.size,
    }));

    const startIdx = media.length;
    setMedia((prev) => [...prev, ...newItems]);

    setUploadProgress(0);
    setProcessingFiles(false);

    try {
      const imageFiles: { file: File; index: number }[] = [];
      const videoFiles: { file: File; index: number }[] = [];
      files.forEach((f, i) => {
        if (f.type.startsWith("video/")) {
          videoFiles.push({ file: f, index: i });
        } else {
          imageFiles.push({ file: f, index: i });
        }
      });

      const allResults: any[] = new Array(files.length);

      if (imageFiles.length > 0) {
        const rawImages = imageFiles.map(img => img.file);
        const imageResults = await uploadMediaWithProgress(rawImages, (percent) => {
          if (videoFiles.length === 0) {
            setUploadProgress(percent);
          }
        });
        imageFiles.forEach((img, i) => {
          allResults[img.index] = imageResults[i];
        });
      }

      for (let v = 0; v < videoFiles.length; v++) {
        const { file, index } = videoFiles[v];

        const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || ".mp4";
        const rawS3Key = `raw-uploads/${uniqueId}${ext}`;
        const baseFilename = uniqueId;

        setCompressing(true);
        setCompressionStatus(`[${v + 1}/${videoFiles.length}] Uploading ${file.name} directly to S3...`);

        await uploadFileToS3Direct(file, rawS3Key, (percent) => {
          setCompressionStatus(
            `[${v + 1}/${videoFiles.length}] Uploading ${file.name} to S3: ${percent}%`
          );
          setUploadProgress(percent);
        });

        setCompressionStatus(`[${v + 1}/${videoFiles.length}] Triggering AWS MediaConvert for ${file.name}...`);
        setProcessingFiles(true);

        const mcResult = await triggerMediaConvertJob(rawS3Key, baseFilename);
        allResults[index] = {
          url: mcResult.url,
          srcHigh: mcResult.srcHigh,
          srcLow: mcResult.srcLow,
          poster: mcResult.poster,
          hlsUrl: mcResult.hlsUrl,
          compressedSize: file.size,
        };

        setProcessingFiles(false);
      }

      setCompressing(false);
      setCompressionStatus("All uploads & processing jobs initiated!");
      setTimeout(() => setCompressionStatus(null), 3000);

      setMedia((prev) =>
        prev.map((item, i) => {
          if (i < startIdx) return item;
          const res = allResults[i - startIdx];
          if (!res) return { ...item, uploading: false, error: "Upload failed" };
          return {
            ...item,
            src: res.url,
            srcHigh: res.srcHigh,
            srcLow: res.srcLow,
            poster: res.poster,
            hlsUrl: res.hlsUrl,
            compressedSize: res.compressedSize,
            uploading: false
          };
        })
      );
    } catch (err: any) {
      console.error("Upload error:", err);
      setMedia((prev) =>
        prev.map((item, i) =>
          i >= startIdx ? { ...item, uploading: false, error: err.message || "Upload failed" } : item
        )
      );
    } finally {
      setUploadProgress(null);
      setProcessingFiles(false);
      setCompressing(false);
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
      const firstMedia = media.find((m) => m.src);
      const heroImageSrc = firstMedia?.type === "image" ? firstMedia.src : firstMedia?.poster || "";
      await updateWork(workId, {
        ...form,
        firstName: form.firstName,
        lastName: form.lastName,
        image: heroImageSrc || "",
        bgImage: heroImageSrc || "",
        media: media.filter((m) => m.src).map(({ type, src, poster, srcHigh, srcLow, hlsUrl, caption }) => ({
          type, src, poster, srcHigh, srcLow, hlsUrl, caption
        })),
      });
      router.refresh();
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
            <Field label="First Name (Project Name) *">
              <input required className={inputCls} value={form.firstName} onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  firstName: val,
                  name: val + (f.lastName ? " " + f.lastName : ""),
                  slug: (val + (f.lastName ? "-" + f.lastName : "")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                }));
              }} />
            </Field>
            <Field label="Last Name">
              <input className={inputCls} value={form.lastName} onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  lastName: val,
                  name: f.firstName + (val ? " " + val : ""),
                  slug: (f.firstName + (val ? "-" + val : "")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                }));
              }} />
            </Field>

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
          {/* Chunked Upload Progress */}
          {(compressing || compressionStatus) && (
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-400 text-xs leading-relaxed animate-pulse">
              <Loader size={18} className={`flex-shrink-0 mt-0.5 ${compressing ? 'animate-spin' : ''}`} />
              <div>
                <p className="font-semibold uppercase tracking-wider mb-1">
                  {compressing ? 'Chunked Upload' : 'Upload Complete'}
                </p>
                <p className="text-white/75">{compressionStatus}</p>
                {compressing && (
                  <p className="text-white/50 mt-1">Large files are uploaded in 90MB chunks to bypass hosting limits.</p>
                )}
              </div>
            </div>
          )}

          {sizeWarning && (
            <div className="flex items-start gap-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 text-brand-orange text-xs leading-relaxed">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold uppercase tracking-wider mb-1">Large Media Warning</p>
                <p className="text-white/75">{sizeWarning}</p>
              </div>
            </div>
          )}

          <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? "border-brand-orange bg-brand-orange/5" : "border-white/10 hover:border-white/20"}`}>
            <Upload size={28} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Drop new files here or click to browse</p>
          </div>

          {/* Progress Indicator */}
          {uploadProgress !== null && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-monument tracking-wider">
                <span className="text-white/60">
                  {processingFiles
                    ? "COMPRESSING & GENERATING HLS (THIS MAY TAKE 2-5 MINS)..."
                    : `UPLOADING MEDIA FILES (${uploadProgress}%)...`}
                </span>
                <span className="text-brand-orange">
                  {processingFiles ? "PROCESSING..." : `${uploadProgress}%`}
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative">
                <div
                  className={`h-full bg-brand-orange rounded-full transition-all duration-300 ${
                    processingFiles ? "animate-pulse" : ""
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {processingFiles && (
                <p className="text-white/30 text-[11px] leading-relaxed">
                  Please do not close this page. The server is creating high/low resolution variants, optimizing audio streams, and compiling HLS chunks to enable smooth web playback.
                </p>
              )}
            </div>
          )}

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
                {item.uploading && <p className="text-brand-orange text-xs animate-pulse mt-1">Uploading & compressing…</p>}
                {!item.uploading && !item.error && item.src && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/40 mt-1">
                    <span className="truncate max-w-[200px]">{item.src}</span>
                    {item.originalSize && (
                      <span>
                        Original: {(item.originalSize / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                    {item.compressedSize && (
                      <span className="text-green-400 font-semibold">
                        Compressed: {(item.compressedSize / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {idx > 0 && <button type="button" onClick={() => setMedia((prev) => { const u = [...prev]; const [m] = u.splice(idx, 1); return [m, ...u]; })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-brand-orange/20 hover:text-brand-orange text-white/30 transition-all"><Move size={14} /></button>}
                <button type="button" onClick={async () => {
                  const item = media[idx];
                  if (item.src && !item.uploading) {
                    try { await deleteMedia(item.src); } catch (e) { console.error("Failed to delete media from server", e); }
                  }
                  setMedia((prev) => prev.filter((_, i) => i !== idx));
                }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/30 transition-all"><X size={14} /></button>
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
