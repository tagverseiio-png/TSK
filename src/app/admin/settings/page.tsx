"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { getStudioConfig, updateStudioConfig, uploadMedia } from "@/lib/adminApi";
import { Save, Plus, X, Loader, CheckCircle, Upload, Image as ImageIcon } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSlot, setNewSlot] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [config, setConfig] = useState({
    baseRate: 80,
    minHours: 2,
    videoCoverage: 200,
    reelNoSubs: 100,
    reelWithSubs: 150,
    fullPodcast: 300,
    whatsappNumber: "",
    timeSlots: [] as string[],
    clientLogos: [] as string[],
  });

  useEffect(() => {
    getStudioConfig().then((data) => {
      if (data) setConfig({ ...config, ...data });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStudioConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const addSlot = () => {
    if (!newSlot.trim() || config.timeSlots.includes(newSlot.trim())) return;
    setConfig((c) => ({ ...c, timeSlots: [...c.timeSlots, newSlot.trim()] }));
    setNewSlot("");
  };

  const removeSlot = (slot: string) => {
    setConfig((c) => ({ ...c, timeSlots: c.timeSlots.filter((s) => s !== slot) }));
  };

  const addLogoFromUrl = () => {
    if (!newLogoUrl.trim() || config.clientLogos.includes(newLogoUrl.trim())) return;
    setConfig((c) => ({ ...c, clientLogos: [...c.clientLogos, newLogoUrl.trim()] }));
    setNewLogoUrl("");
  };

  const removeLogo = (logo: string) => {
    setConfig((c) => ({ ...c, clientLogos: c.clientLogos.filter((l) => l !== logo) }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    setUploadingLogo(true);
    try {
      const results = await uploadMedia(files);
      const newUrls = results.filter(r => r.url).map(r => r.url);
      setConfig((c) => ({ ...c, clientLogos: [...c.clientLogos, ...newUrls] }));
    } catch (err: any) {
      alert("Failed to upload logos: " + err.message);
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-all text-sm";

  if (loading) return <div className="flex items-center justify-center h-64"><Loader size={32} className="text-brand-orange animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-monument text-2xl text-white">Studio Settings</h1>
        <p className="text-white/40 text-sm mt-1">Pricing, time slots, and contact info</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pricing */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Pricing ($)</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "baseRate", label: "Base Rate (per hour)" },
              { key: "minHours", label: "Minimum Hours" },
              { key: "videoCoverage", label: "Video Coverage (per hour)" },
              { key: "reelNoSubs", label: "Reel — No Subs (each)" },
              { key: "reelWithSubs", label: "Reel — With Subs (each)" },
              { key: "fullPodcast", label: "Full Podcast Edit (per episode)" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] text-brand-orange uppercase tracking-widest">{label}</label>
                <input
                  type="number"
                  className={inputCls}
                  value={(config as any)[key]}
                  onChange={(e) => setConfig((c) => ({ ...c, [key]: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Contact</h2>
          <div className="space-y-2">
            <label className="text-[10px] text-brand-orange uppercase tracking-widest">WhatsApp Number</label>
            <input
              type="text"
              className={inputCls}
              placeholder="6591234567 (with country code, no +)"
              value={config.whatsappNumber}
              onChange={(e) => setConfig((c) => ({ ...c, whatsappNumber: e.target.value }))}
            />
            <p className="text-white/20 text-xs">No spaces or dashes. Example: 6591234567</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-brand-orange uppercase tracking-widest">Contact Email (Gmail)</label>
            <input
              type="email"
              className={inputCls}
              placeholder="admin@thesimplekrew.com"
              value={(config as any).contactEmail || ""}
              onChange={(e) => setConfig((c) => ({ ...c, contactEmail: e.target.value }))}
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Time Slots</h2>
          <div className="flex flex-wrap gap-2">
            {config.timeSlots.map((slot) => (
              <div key={slot} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <span className="text-white text-sm font-monument">{slot}</span>
                <button type="button" onClick={() => removeSlot(slot)} className="text-white/30 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
            {config.timeSlots.length === 0 && <p className="text-white/20 text-sm">No slots added</p>}
          </div>
          <div className="flex gap-3">
            <input
              className={`flex-1 ${inputCls}`}
              placeholder="e.g. 10:00 AM"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSlot())}
            />
            <button
              type="button"
              onClick={addSlot}
              className="px-4 py-3 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-xl hover:bg-brand-orange/20 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Client Logos */}
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-monument text-sm text-white/60 uppercase tracking-widest">Client Logos</h2>
              <p className="text-white/30 text-xs mt-1">Displayed in the homepage auto-scroll marquee</p>
            </div>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-4 py-2 rounded-xl text-xs font-monument uppercase tracking-wider hover:bg-brand-orange/20 transition-all disabled:opacity-50"
            >
              {uploadingLogo ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />} 
              {uploadingLogo ? "Uploading..." : "Upload Image"}
            </button>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={logoInputRef} 
              className="hidden" 
              onChange={handleLogoUpload} 
            />
          </div>

          {/* Current Logos Grid */}
          {config.clientLogos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
              {config.clientLogos.map((logo, idx) => (
                <div key={idx} className="relative group bg-white/5 border border-white/10 rounded-xl aspect-video flex items-center justify-center p-2 overflow-hidden">
                  <img src={logo} alt={`Logo ${idx}`} className="w-full h-full object-contain filter " />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeLogo(logo)}
                      className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback URL Adder */}
          <div className="flex gap-3 mt-2">
            <input
              className={`flex-1 ${inputCls}`}
              placeholder="Or add via external image URL..."
              value={newLogoUrl}
              onChange={(e) => setNewLogoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLogoFromUrl())}
            />
            <button
              type="button"
              onClick={addLogoFromUrl}
              className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-3 bg-brand-orange text-black px-8 py-4 rounded-xl font-monument uppercase tracking-widest text-sm hover:bg-orange-500 transition-all disabled:opacity-60"
        >
          {saving ? <Loader size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
