
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../api/client";

const PAGE_LIMIT = 50; 
const MAX_PAGES = 10; // حد أمان عشان اللوب ما يكمّلش للأبد

const normalizeShort = (s) => ({
  id: Number(s.id),
  title: s.title ?? "",
  description: s.description ?? "",
  category: s.category ?? "",
  thumbnailUrl: s.thumbnailUrl || null,
  videoUrl: s.videoUrl || null,
  durationSeconds: Number(s.durationSeconds) || 0,
  publishedAt: s.publishedAt ?? null,
});

async function fetchAllShorts(signal) {
  const all = [];
  let cursor = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const qs = new URLSearchParams({ limit: String(PAGE_LIMIT) });
    if (cursor) qs.set("cursor", cursor);
    const data = await api(`/v1/shorts?${qs}`, { signal });
    all.push(...(data?.items ?? []).map(normalizeShort));
    cursor = data?.nextCursor ?? null;
    if (!cursor) break;
  }
  return all;
}

async function fetchCategoryNames(signal, shorts) {
  try {
    const data = await api("/v1/shorts/categories", { signal });
    const names = (Array.isArray(data) ? data : []).map((c) => c?.name).filter(Boolean);
    if (names.length) return names;
  } catch (error) {
    if (error.name === "AbortError") throw error;
  }
  return [...new Set(shorts.map((s) => s.category).filter(Boolean))];
}

const ALL_TAB = { slug: "all", label: "الكل" };

export function useShorts() {
  const [state, setState] = useState({ shorts: null, categories: [ALL_TAB], error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ shorts: null, categories: [ALL_TAB], error: null });

    (async () => {
      const shorts = await fetchAllShorts(ctrl.signal);
      const names = await fetchCategoryNames(ctrl.signal, shorts);
      setState({
        shorts,
        categories: [ALL_TAB, ...names.map((name) => ({ slug: name, label: name }))],
        error: null,
      });
    })().catch((error) => {
      if (error.name === "AbortError") return;
      console.error("API error: shorts", error);
      setState({ shorts: null, categories: [ALL_TAB], error });
    });

    return () => ctrl.abort();
  }, [tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return {
    shorts: state.shorts,
    categories: state.categories,
    error: state.error,
    loading: !state.shorts && !state.error,
    retry,
  };
}

const SAVED_KEY = "zawawy:shorts:saved";

export function useSavedShorts() {
  const [ids, setIds] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(SAVED_KEY));
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {

      }
      return next;
    });
  }, []);

  return [ids, toggle];
}