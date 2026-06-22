"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadMediaWithProgress, createWork, deleteMedia } from "@/lib/adminApi";
import { needsChunkedUpload, uploadFileChunked, formatBytes } from "@/lib/videoCompressor";
import Combobox from "@/components/admin/Combobox";
import {
  ArrowLeft, Upload, X, Film, Image as ImageIcon, Plus, Move,
  CheckCircle, AlertCircle, Loader
} from "lucide-react";

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

export default function NewWorkPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    year: new Date().getFullYear().toString(),
    count: "01",
    tagline: "",
    description: "",
    heroTagline: "",
    services: "",
    number: "",
    featured: false,
  });

  const [media, setMedia] = useState<MediaItem[]>([]);

  // Auto-generate slug from names
  const handleFirstNameChange = (val: string) => {
    setForm((f) => {
      const slug = (val + (f.lastName ? "-" + f.lastName : "")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const name = val + (f.lastName ? " " + f.lastName : "");
      return { ...f, firstName: val, name, slug };
    });
  };

  const handleLastNameChange = (val: string) => {
    setForm((f) => {
      const slug = (f.firstName + (val ? "-" + val : "")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const name = f.firstName + (val ? " " + val : "");
      return { ...f, lastName: val, name, slug };
    });
  };

  const processFiles = async (files: File[]) => {
    // Check video limit
    const newItemsCount = files.map((f) => ({
      type: f.type.startsWith("video/") ? "video" : "image"
    }));
    const existingVideos = media.filter(m => m.type === "video").length;
    const newVideos = newItemsCount.filter(i => i.type === "video").length;
    if (existingVideos + newVideos > 3) {
      alert("Maximum 3 videos allowed per work.");
      return;
    }

    // Split files into regular (<90MB) and large (>90MB, needs chunked upload)
    const regularFiles: File[] = [];
    const largeFiles: { file: File; index: number }[] = [];
    files.forEach((f, i) => {
      if (needsChunkedUpload(f)) {
        largeFiles.push({ file: f, index: i });
      } else {
        regularFiles.push(f);
      }
    });

    if (largeFiles.length > 0) {
      setSizeWarning(`${largeFiles.length} file(s) over 90MB will be uploaded in chunks. This may take a few minutes.`);
    } else {
      setSizeWarning(null);
    }

    const newItems: MediaItem[] = files.map((f) => ({
      type: f.type.startsWith("video/") ? "video" : "image",
      src: "",
      caption: f.name.replace(/\.[^.]+$/, ""),
      uploading: true,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      originalSize: f.size,
    }));

    setMedia((prev) => [...prev, ...newItems]);
    const startIdx = media.length;

    setUploadProgress(0);
    setProcessingFiles(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("tsk_admin_token") : null;

    try {
      // Upload large files via chunked upload
      const chunkedResults: { result: any; originalIndex: number }[] = [];
      for (const { file, index } of largeFiles) {
        setCompressing(true);
        setCompressionStatus(`Uploading ${file.name} (${formatBytes(file.size)}) in chunks...`);

        const result = await uploadFileChunked(file, token, API_BASE, (progress) => {
          setCompressionStatus(
            progress.stage === "uploading"
              ? `Uploading ${file.name}: chunk ${progress.chunkIndex}/${progress.totalChunks} (${progress.percent}%)`
              : progress.stage === "processing"
              ? `Server processing ${file.name}...`
              : `Done: ${file.name}`
          );
        });
        chunkedResults.push({ result, originalIndex: index });
      }
      setCompressing(false);
      setTimeout(() => setCompressionStatus(null), 3000);

      // Upload regular files via single request
      let regularResults: any[] = [];
      if (regularFiles.length > 0) {
        regularResults = await uploadMediaWithProgress(regularFiles, (percent) => {
          setUploadProgress(percent);
          if (percent >= 100) {
            setProcessingFiles(true);
          }
        });
      }

      // Merge results in original order
      const allResults: any[] = new Array(files.length);
      let regularIdx = 0;
      for (let i = 0; i < files.length; i++) {
        const chunkedResult = chunkedResults.find((cr) => cr.originalIndex === i);
        if (chunkedResult) {
          allResults[i] = chunkedResult.result;
        } else {
          allResults[i] = regularResults[regularIdx++];
        }
      }

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
      setMedia((prev) =>
        prev.map((item, i) =>
          i >= startIdx ? { ...item, uploading: false, error: err.message || "Upload failed" } : item
        )
      );
    } finally {
      setUploadProgress(null);
      setProcessingFiles(false);
      setSizeWarning(null);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length) processFiles(files);
  };

  const removeMedia = async (idx: number) => {
    const item = media[idx];
    if (item.src && !item.uploading) {
      try { await deleteMedia(item.src); } catch (e) { console.error("Failed to delete media from server", e); }
    }
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCaption = (idx: number, caption: string) => {
    setMedia((prev) => prev.map((item, i) => (i === idx ? { ...item, caption } : item)));
  };

  const setAsHero = (idx: number) => {
    const item = media[idx];
    if (item.type === "image") setForm((f) => ({ ...f }));
    // Move to top
    setMedia((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(idx, 1);
      return [moved, ...updated];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (media.some((m) => m.uploading)) {
      alert("Please wait for all uploads to finish.");
      return;
    }
    if (!form.slug) {
      alert("Slug is required.");
      return;
    }

    setSaving(true);
    try {
      const firstMedia = media.find((m) => m.src);
      const heroImageSrc = firstMedia?.type === "image" ? firstMedia.src : firstMedia?.poster || "";
      const payload = {
        ...form,
        firstName: form.firstName,
        lastName: form.lastName,
        image: heroImageSrc || "",
        bgImage: heroImageSrc || "",
        media: media.filter((m) => m.src).map(({ type, src, poster, srcHigh, srcLow, hlsUrl, caption }) => ({
          type, src, poster, srcHigh, srcLow, hlsUrl, caption,
        })),
      };
      await createWork(payload);
      router.push("/admin/works");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };



  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-orange transition-all text-sm";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/works" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-monument text-2xl text-white">New Work</h1>
          <p className="text-white/40 text-sm mt-0.5">Add a new case study with media</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Basic Info ── */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-6">
          <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Basic Info</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="First Name (Project Name) *">
              <input
                required className={inputCls} placeholder="Chuan"
                value={form.firstName} onChange={(e) => handleFirstNameChange(e.target.value)}
              />
            </Field>
            <Field label="Last Name">
              <input
                className={inputCls} placeholder="Watch"
                value={form.lastName} onChange={(e) => handleLastNameChange(e.target.value)}
              />
            </Field>

            <Field label="URL Slug *">
              <input
                required className={inputCls} placeholder="chuan-watch"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </Field>

            <Field label="Category *">
              <Combobox
                required placeholder="Product Photography"
                value={form.category} onChange={(val) => setForm((f) => ({ ...f, category: val }))}
                options={CATEGORIES}
              />
            </Field>
            <Field label="Year">
              <Combobox
                placeholder="2024"
                value={form.year} onChange={(val) => setForm((f) => ({ ...f, year: val }))}
                options={YEARS}
              />
            </Field>
            <Field label="Number (01, 02...)">
              <input
                className={inputCls} placeholder="01"
                value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
              />
            </Field>
            <Field label="Count Label">
              <Combobox
                placeholder="50+ or 01"
                value={form.count} onChange={(val) => setForm((f) => ({ ...f, count: val }))}
                options={COUNT_LABELS}
              />
            </Field>
          </div>

          <Field label="Tagline (short — shown in roster list)">
            <input
              className={inputCls} placeholder="Luxury Product Campaign · 50+ Cinematic Shots · 2024"
              value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
            />
          </Field>

          <Field label="Description (1–2 sentences)">
            <textarea
              className={`${inputCls} resize-none`} rows={3}
              placeholder="Luxury product campaign — cinematic shots that positioned...</"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>

          <Field label="Hero Tagline (CAPS — large text on case study page)">
            <textarea
              className={`${inputCls} resize-none`} rows={2}
              placeholder="ENGINEERED A LUXURY PRODUCT PHOTOGRAPHY CAMPAIGN..."
              value={form.heroTagline}
              onChange={(e) => setForm((f) => ({ ...f, heroTagline: e.target.value }))}
            />
          </Field>

          <Field label="Services (comma separated)">
            <Combobox
              placeholder="Product Photography, Creative Direction"
              value={form.services} onChange={(val) => setForm((f) => ({ ...f, services: val }))}
              options={COMMON_SERVICES}
            />
          </Field>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${form.featured ? "bg-brand-orange" : "bg-white/10"}`}
              onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${form.featured ? "ml-auto" : ""}`} />
            </div>
            <span className="text-sm text-white/60">Featured (shown first in portfolio)</span>
          </label>
        </div>

        {/* ── Media Upload ── */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Media</h2>
              <p className="text-white/30 text-xs mt-1">Upload images and videos. First item becomes the hero/thumbnail. Max 500MB per video.</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-4 py-2 rounded-xl text-xs font-monument uppercase tracking-wider hover:bg-brand-orange/20 transition-all"
            >
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

          {/* Drop zone */}
          {sizeWarning && (
            <div className="flex items-start gap-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 text-brand-orange text-xs leading-relaxed">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold uppercase tracking-wider mb-1">Large Media Warning</p>
                <p className="text-white/75">{sizeWarning}</p>
              </div>
            </div>
          )}

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-brand-orange bg-brand-orange/5"
                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            }`}
          >
            <Upload size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Drag & drop images / videos here</p>
            <p className="text-white/20 text-xs mt-1">or click to browse • JPG, PNG, WebP, MP4, WebM, MOV</p>
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

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFilePick}
          />

          {/* Media Grid */}
          {media.length > 0 && (
            <div className="space-y-3">
              {media.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 bg-white/[0.03] border border-white/8 rounded-xl p-4"
                >
                  {/* Preview */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                    {item.uploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader size={18} className="text-brand-orange animate-spin" />
                      </div>
                    ) : item.error ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <AlertCircle size={18} className="text-red-400" />
                      </div>
                    ) : item.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/40">
                        <Film size={24} className="text-white/40" />
                      </div>
                    ) : (
                      <img src={item.preview || item.src} alt="" className="w-full h-full object-cover" />
                    )}
                    {!item.uploading && !item.error && (
                      <div className="absolute top-1 right-1">
                        {item.type === "video"
                          ? <Film size={10} className="text-blue-400" />
                          : <ImageIcon size={10} className="text-green-400" />
                        }
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="flex-1 space-y-1">
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-orange transition-all"
                      placeholder="Caption (e.g. Hero shot — cinematic dial close-up)"
                      value={item.caption}
                      onChange={(e) => updateCaption(idx, e.target.value)}
                    />
                    {item.error && <p className="text-red-400 text-xs">{item.error}</p>}
                    {item.uploading && <p className="text-brand-orange text-xs animate-pulse">Uploading & compressing…</p>}
                    {!item.uploading && !item.error && item.src && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/40">
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

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => setAsHero(idx)}
                        title="Move to top (hero)"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-brand-orange/20 hover:text-brand-orange text-white/30 transition-all"
                      >
                        <Move size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/30 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || media.some((m) => m.uploading)}
            className="flex items-center gap-3 bg-brand-orange text-black px-8 py-4 rounded-xl font-monument uppercase tracking-widest text-sm hover:bg-orange-500 transition-all disabled:opacity-60"
          >
            {saving ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {saving ? "Saving…" : "Create Work"}
          </button>
          <Link href="/admin/works" className="text-white/40 hover:text-white text-sm transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
