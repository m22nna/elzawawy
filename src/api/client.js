// API address for every call. Empty = same origin (/v1/... goes through the dev proxy or the Vercel rewrite).
export const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export async function api(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, options);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}