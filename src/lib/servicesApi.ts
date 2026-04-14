const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getServices() {
    const res = await fetch(`${API_BASE}/api/services`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
}

export async function getServiceBySlug(slug: string) {
    const res = await fetch(`${API_BASE}/api/services/${slug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch service');
    return res.json();
}

export async function saveService(payload: any) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/services`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save service');
    }
    return res.json();
}

export async function deleteService(id: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return res.json();
}

export async function uploadServiceMedia(file: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/api/services/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'x-upload-folder': 'services'
        },
        body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
}
