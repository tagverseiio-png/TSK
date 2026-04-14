"use client";

import { useEffect, useState } from "react";
import { getClients, createClient, updateClient, deleteClient, uploadClientLogo, API_BASE } from "@/lib/adminApi";
import { Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";

const fixUrl = (url: string) => url.replace(/^http:\/\/localhost:\d+/, API_BASE);

interface Client {
  _id: string;
  name: string;
  logo: string;
  order: number;
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Partial<Client> | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await getClients();
      const fixedData = data.map(c => ({ ...c, logo: fixUrl(c.logo) }));
      setClients(fixedData);
    } catch (err) {
      console.error("Failed to load clients", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateNew = () => {
    setEditClient({ name: "", logo: "", order: clients.length });
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient(id);
      setClients(clients.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete client");
    }
  };

  const handleSave = async () => {
    if (!editClient?.name || !editClient?.logo) {
      alert("Name and Logo are required");
      return;
    }

    setSaving(true);
    try {
      if (editClient._id) {
        const updated = await updateClient(editClient._id, editClient);
        setClients(clients.map(c => c._id === editClient._id ? updated : c));
      } else {
        const created = await createClient(editClient);
        setClients([...clients, created]);
      }
      setIsModalOpen(false);
      setEditClient(null);
    } catch (err) {
      alert("Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { url } = await uploadClientLogo(file);
      setEditClient(prev => ({ ...prev, logo: fixUrl(url) }));
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const moveClient = async (index: number, direction: 'up' | 'down') => {
    const newClients = [...clients];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newClients.length) return;

    const temp = newClients[index];
    newClients[index] = newClients[targetIndex];
    newClients[targetIndex] = temp;

    // Update orders
    const updatedWithOrder = newClients.map((c, i) => ({ ...c, order: i }));
    setClients(updatedWithOrder);

    // Save all to backend (async)
    try {
      await Promise.all(updatedWithOrder.map(c => updateClient(c._id, { order: c.order })));
    } catch (err) {
      console.error("Failed to save reorder", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-monument text-2xl text-white uppercase tracking-wider">Our Clients</h1>
          <p className="text-white/40 text-sm mt-1">Manage partner logos on the work page</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-brand-orange text-black px-4 py-2.5 rounded-xl font-monument text-xs tracking-widest uppercase hover:bg-orange-500 transition-all"
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-orange" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client, index) => (
            <div key={client._id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 group hover:border-brand-orange/30 transition-all flex flex-col items-center">
              <div className="relative w-full aspect-[2/1] mb-4 flex items-center justify-center bg-black/20 rounded-xl overflow-hidden">
                <Image
                  src={client.logo}
                  alt={client.name}
                  fill
                  className="object-contain p-4 grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <h3 className="text-white font-monument text-xs uppercase tracking-widest mb-4">{client.name}</h3>
              
              <div className="flex items-center gap-2 mt-auto">
                <button 
                  onClick={() => moveClient(index, 'up')}
                  disabled={index === 0}
                  className="p-2 bg-white/5 rounded-lg text-white/50 hover:text-white disabled:opacity-20"
                >
                  <MoveUp size={14} />
                </button>
                <button 
                   onClick={() => moveClient(index, 'down')}
                   disabled={index === clients.length - 1}
                   className="p-2 bg-white/5 rounded-lg text-white/50 hover:text-white disabled:opacity-20"
                >
                  <MoveDown size={14} />
                </button>
                <button 
                  onClick={() => handleEdit(client)}
                  className="px-4 py-2 bg-white/5 rounded-lg text-white/60 hover:text-white text-xs font-monument uppercase tracking-wider"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(client._id)}
                  className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#1A1A1A] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="font-monument text-sm text-white uppercase tracking-widest">
                {editClient?._id ? "Edit Client" : "Add Client"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1.5 ml-1">Client Name</label>
                <input
                  type="text"
                  value={editClient?.name || ""}
                  onChange={e => setEditClient(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                  placeholder="Brand Name"
                />
              </div>

              <div>
                <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1.5 ml-1">Logo</label>
                <div className="relative group/upload border-2 border-dashed border-white/10 rounded-2xl aspect-[2/1] flex flex-col items-center justify-center hover:border-brand-orange/40 transition-all overflow-hidden cursor-pointer">
                  {editClient?.logo ? (
                    <>
                      <Image src={editClient.logo} alt="Preview" fill className="object-contain p-6" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-[10px] font-monument uppercase tracking-widest">Change</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-white/20 mb-2" />
                      <p className="text-white/30 text-[10px] font-monument uppercase tracking-widest text-center px-4">
                        {uploadingLogo ? "Uploading..." : "Click to upload SVG/PNG"}
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleLogoUpload}
                    accept="image/*"
                  />
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <Loader2 className="animate-spin text-brand-orange" size={24} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 font-monument text-xs tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingLogo}
                className="flex-[2] px-4 py-3 rounded-xl bg-brand-orange text-black font-monument text-xs tracking-widest uppercase hover:bg-orange-500 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
