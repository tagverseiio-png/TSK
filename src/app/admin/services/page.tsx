"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServices, deleteService } from "@/lib/servicesApi";
import { Plus, Edit, Trash2, ExternalLink, Loader } from "lucide-react";

export default function AdminServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await getServices();
            setServices(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteService(id);
            setServices(services.filter(s => s._id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader className="animate-spin text-brand-orange" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-monument text-2xl text-white">Services</h1>
                    <p className="text-white/40 text-sm mt-1">Manage service page content and features</p>
                </div>
                <Link 
                    href="/admin/services/new" 
                    className="flex items-center gap-2 bg-brand-orange text-black px-6 py-3 rounded-xl font-monument text-[10px] tracking-widest uppercase hover:bg-orange-500 transition-all"
                >
                    <Plus size={16} /> Add Service
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div key={service._id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 group hover:border-brand-orange/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-brand-orange font-monument text-[10px] tracking-[4px]">#{service.number}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/admin/services/${service.slug}`} className="p-2 bg-white/5 rounded-lg hover:text-brand-orange transition-colors">
                                    <Edit size={16} />
                                </Link>
                                <button onClick={() => handleDelete(service._id)} className="p-2 bg-white/5 rounded-lg hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-monument text-lg text-white mb-2 uppercase">{service.title}</h3>
                        <p className="text-white/40 text-[12px] line-clamp-2 mb-6 font-inter">{service.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[10px] text-white/20 uppercase font-monument">{service.features?.length || 0} Features</span>
                            <Link href={`/services/${service.slug}`} target="_blank" className="text-white/40 hover:text-white transition-colors">
                                <ExternalLink size={14} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
