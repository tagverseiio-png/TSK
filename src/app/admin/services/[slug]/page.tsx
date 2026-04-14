"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getServiceBySlug, saveService, uploadServiceMedia } from "@/lib/servicesApi";
import { ArrowLeft, Save, Upload, X, Loader, Plus, CheckCircle, Film, Image as ImageIcon } from "lucide-react";

export default function EditServicePage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const isNew = slug === 'new';

    const [form, setForm] = useState({
        _id: "",
        slug: "",
        title: "",
        description: "",
        features: [] as string[],
        mediaUrl: "",
        mediaType: "image" as "image" | "video",
        number: "01"
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isNew) {
            fetchService();
        }
    }, [slug]);

    const fetchService = async () => {
        try {
            const data = await getServiceBySlug(slug);
            setForm({
                _id: data._id,
                slug: data.slug,
                title: data.title,
                description: data.description,
                features: data.features || [],
                mediaUrl: data.mediaUrl || "",
                mediaType: data.mediaType || "image",
                number: data.number || "01"
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFeatureChange = (index: number, val: string) => {
        const next = [...form.features];
        next[index] = val;
        setForm({ ...form, features: next });
    };

    const addFeature = () => {
        setForm({ ...form, features: [...form.features, ""] });
    };

    const removeFeature = (index: number) => {
        setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadServiceMedia(file);
            setForm({ ...form, mediaUrl: res.url, mediaType: res.type });
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveService(form);
            router.push("/admin/services");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader className="animate-spin text-brand-orange" /></div>;

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-orange transition-all text-sm";

    return (
        <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/services" className="text-white/40 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-monument text-2xl text-white">{isNew ? "New Service" : "Edit Service"}</h1>
                    <p className="text-white/40 text-sm mt-0.5">Customize service page content</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-brand-orange uppercase tracking-widest">Title</label>
                            <input 
                                required className={inputCls} placeholder="Professional Photography"
                                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-brand-orange uppercase tracking-widest">URL Slug</label>
                            <input 
                                required className={inputCls} placeholder="professional-photography"
                                value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-brand-orange uppercase tracking-widest">Service Number</label>
                            <input 
                                required className={inputCls} placeholder="01"
                                value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-brand-orange uppercase tracking-widest">Description</label>
                        <textarea 
                            required className={`${inputCls} h-32 resize-none`} placeholder="Detailed service description..."
                            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Features Editor */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] text-brand-orange uppercase tracking-widest">Key Features</label>
                            <button type="button" onClick={addFeature} className="text-brand-orange flex items-center gap-1 text-[10px] uppercase font-monument">
                                <Plus size={12} /> Add Feature
                            </button>
                        </div>
                        <div className="space-y-3">
                            {form.features.map((feature, i) => (
                                <div key={i} className="flex gap-3">
                                    <input 
                                        className={inputCls} placeholder="Feature name"
                                        value={feature} onChange={(e) => handleFeatureChange(i, e.target.value)}
                                    />
                                    <button type="button" onClick={() => removeFeature(i)} className="p-3 bg-white/5 rounded-xl hover:text-red-500 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                         <label className="text-[10px] text-brand-orange uppercase tracking-widest">Media Showcase</label>
                         <div 
                             onClick={() => fileInputRef.current?.click()}
                             className="relative aspect-video w-full max-w-lg bg-white/5 border-2 border-dashed border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange/50 transition-all"
                         >
                            {uploading ? (
                                <Loader className="animate-spin text-brand-orange" />
                            ) : form.mediaUrl ? (
                                <>
                                    {form.mediaType === 'video' ? (
                                        <video src={form.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
                                    ) : (
                                        <img src={form.mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload size={24} className="text-white" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload size={32} className="text-white/20 mb-2" />
                                    <p className="text-white/40 text-xs uppercase font-monument">Click to upload image or video</p>
                                </>
                            )}
                         </div>
                         <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        type="submit" 
                        disabled={saving || uploading}
                        className="flex items-center gap-3 bg-brand-orange text-black px-8 py-4 rounded-xl font-monument uppercase tracking-widest text-sm hover:bg-orange-500 transition-all disabled:opacity-60"
                    >
                        {saving ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        {saving ? "Saving..." : (isNew ? "Create Service" : "Save Changes")}
                    </button>
                    <Link href="/admin/services" className="text-white/40 hover:text-white text-sm transition-colors">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
