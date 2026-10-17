const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function api(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, options);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}