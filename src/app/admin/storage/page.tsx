"use client";

import { useEffect, useState } from "react";
import { getStorageFiles, deleteStorageFile, StorageFile } from "@/lib/adminApi";
import { Loader, Database, Search, File, Film, Image as ImageIcon, Trash2, Folder, HardDrive } from "lucide-react";
import { formatBytes } from "@/lib/videoCompressor";

export default function StoragePage() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const data = await getStorageFiles();
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const handleDelete = async (filePath: string) => {
    if (!confirm("Are you sure you want to permanently delete this file? This cannot be undone.")) return;
    setDeleting(filePath);
    try {
      await deleteStorageFile(filePath);
      setFiles(f => f.filter(file => file.path !== filePath));
    } catch (err: any) {
      alert("Failed to delete file: " + err.message);
    }
    setDeleting(null);
  }

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.folder.toLowerCase().includes(search.toLowerCase()));
  const totalSize = filteredFiles.reduce((acc, f) => acc + f.size, 0);

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (["mp4", "webm", "mov", "mkv", "avi", "ts"].includes(ext || "")) return <Film size={18} className="text-blue-400" />;
    if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext || "")) return <ImageIcon size={18} className="text-green-400" />;
    if (ext === "m3u8") return <File size={18} className="text-purple-400" />;
    return <File size={18} className="text-white/40" />;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader size={32} className="text-brand-orange animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-monument text-2xl text-white flex items-center gap-3">
            <HardDrive className="text-brand-orange" />
            Server Storage
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage all uploaded files across your server</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
            <Database size={16} className="text-brand-orange" />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/50">Total Size</p>
              <p className="text-sm font-monument text-white">{formatBytes(totalSize)}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
            <File size={16} className="text-blue-400" />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/50">Files</p>
              <p className="text-sm font-monument text-white">{filteredFiles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search files by name or folder..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* File List */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
        {filteredFiles.length === 0 ? (
           <div className="p-12 text-center text-white/30 text-sm">No files found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/50 font-monument">File</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/50 font-monument">Folder</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/50 font-monument">Size</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/50 font-monument">Date</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/50 font-monument text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFiles.map((file) => (
                  <tr key={file.path} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="max-w-[300px]">
                          <a href={file.url} target="_blank" rel="noreferrer" className="text-sm text-white hover:text-brand-orange transition-colors truncate block">
                            {file.name}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/60 text-xs">
                        <Folder size={14} className="text-white/30" />
                        {file.folder}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60 whitespace-nowrap">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-6 py-4 text-xs text-white/60 whitespace-nowrap">
                      {new Date(file.createdAt).toLocaleDateString()} {new Date(file.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(file.path)}
                        disabled={deleting === file.path}
                        className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                        title="Delete permanently"
                      >
                        {deleting === file.path ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
