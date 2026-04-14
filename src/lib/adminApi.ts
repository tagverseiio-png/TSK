const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tsk_admin_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const data = await apiFetch<{ token: string; email: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("tsk_admin_token", data.token);
  localStorage.setItem("tsk_admin_email", data.email);
  return data;
}

export function logout() {
  localStorage.removeItem("tsk_admin_token");
  localStorage.removeItem("tsk_admin_email");
}

export function isLoggedIn() {
  return !!getToken();
}

// ── Works ─────────────────────────────────────────────────────────────────────
export function getWorks() {
  return apiFetch<any[]>("/api/works");
}

export function getWork(slug: string) {
  return apiFetch<any>(`/api/works/${slug}`);
}

export function createWork(data: object) {
  return apiFetch<any>("/api/works", { method: "POST", body: JSON.stringify(data) });
}

export function updateWork(id: string, data: object) {
  return apiFetch<any>(`/api/works/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteWork(id: string) {
  return apiFetch<any>(`/api/works/${id}`, { method: "DELETE" });
}

export async function uploadMedia(files: File[]): Promise<{ type: string; url: string; filename: string; originalName: string }[]> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`${API_BASE}/api/works/upload-media`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export function getBookings() {
  return apiFetch<any[]>("/api/bookings");
}

export function updateBookingStatus(id: string, status: "pending" | "confirmed" | "rejected") {
  return apiFetch<any>(`/api/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteBooking(id: string) {
  return apiFetch<any>(`/api/bookings/${id}`, { method: "DELETE" });
}

// ── Studio Config ─────────────────────────────────────────────────────────────
export function getStudioConfig() {
  return apiFetch<any>("/api/studio-config");
}

export function updateStudioConfig(data: object) {
  return apiFetch<any>("/api/studio-config", { method: "PUT", body: JSON.stringify(data) });
}

// ── Clients ───────────────────────────────────────────────────────────────────
export function getClients() {
  return apiFetch<any[]>("/api/clients");
}

export function createClient(data: object) {
  return apiFetch<any>("/api/clients", { method: "POST", body: JSON.stringify(data) });
}

export function updateClient(id: string, data: object) {
  return apiFetch<any>(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteClient(id: string) {
  return apiFetch<any>(`/api/clients/${id}`, { method: "DELETE" });
}

export async function uploadClientLogo(file: File): Promise<{ url: string; filename: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/clients/upload-logo`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "x-upload-folder": "clients",
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Logo upload failed");
  return res.json();
}

export { API_BASE };
