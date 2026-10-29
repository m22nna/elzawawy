import { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client";
import { useApi } from "../../../api/useApi";

export function useSurahs() {
  const { data, error, loading } = useApi("/v1/quran/surahs");
  const surahs = useMemo(
    () => data?.map((s) => ({ ...s, id: Number(s.id), ayahCount: Number(s.ayahCount) })) ?? null,
    [data]
  );
  return { surahs, error, loading };
}

export function useAyahs(surahId) {
  const { data, error, loading } = useApi(`/v1/quran/surahs/${surahId}/ayahs`);
  const ayahs = useMemo(
    () => data?.map((a) => ({ ...a, ayahNumber: Number(a.ayahNumber), pageNumber: Number(a.pageNumber) })) ?? null,
    [data]
  );
  return { ayahs, error, loading };
}

// ---- صفحات المصحف (604 صفحة) ----
const pageCache = new Map(); // pageNumber -> ayahs[]

const normalizePage = (data) =>
  (data?.ayahs ?? []).map((a) => ({
    ...a,
    surahId: Number(a.surahId),
    ayahNumber: Number(a.ayahNumber),
    pageNumber: Number(a.pageNumber),
  }));

// بنجيب الصفحة اللي بعدها واللي قبلها من غير ما نستنى، عشان التقليب يبقى فوري
function prefetchPage(n) {
  if (n < 1 || n > 604 || pageCache.has(n)) return;
  api(`/v1/quran/pages/${n}`)
    .then((d) => pageCache.set(n, normalizePage(d)))
    .catch(() => {});
}

export function useMushafPage(pageNumber) {
  const [tick, setTick] = useState(0);
  const [res, setRes] = useState({ page: null, ayahs: null, error: null });

  useEffect(() => {
    const cached = pageCache.get(pageNumber);
    if (cached) {
      setRes({ page: pageNumber, ayahs: cached, error: null });
      prefetchPage(pageNumber + 1);
      prefetchPage(pageNumber - 1);
      return;
    }
    setRes((r) => (r.page === pageNumber && r.error ? { page: pageNumber, ayahs: null, error: null } : r));
    const ctrl = new AbortController();
    api(`/v1/quran/pages/${pageNumber}`, { signal: ctrl.signal })
      .then((d) => {
        const ayahs = normalizePage(d);
        pageCache.set(pageNumber, ayahs);
        setRes({ page: pageNumber, ayahs, error: null });
        prefetchPage(pageNumber + 1);
        prefetchPage(pageNumber - 1);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error("API error: page", pageNumber, error);
        setRes({ page: pageNumber, ayahs: null, error });
      });
    return () => ctrl.abort();
  }, [pageNumber, tick]);

  const current = res.page === pageNumber ? res : { ayahs: pageCache.get(pageNumber) ?? null, error: null };
  return {
    ayahs: current.ayahs,
    error: current.error,
    loading: !current.ayahs && !current.error,
    retry: () => setTick((t) => t + 1),
  };
}

export const useTafsir = (surahId, ayahNumber) => useApi(`/v1/tafsir/${surahId}/${ayahNumber}`);

export function useTracks() {
  const recs = useApi("/v1/recitations");
  const reciters = useApi("/v1/reciters");
  return useMemo(() => {
    const reciter = reciters.data?.find((r) => r.isDefault)?.nameArabic ?? "الشيخ عبدالرحمن الزواوي";
    const tracks = new Map((recs.data ?? []).map((r) => [Number(r.surahId), { audioUrl: r.audioUrl }]));
    return { tracks, reciter, loading: recs.loading };
  }, [recs.data, recs.loading, reciters.data]);
}