
import { useMemo } from "react";
import { useApi } from "./useApi";

export function useRecitations() {
  const surahs = useApi("/v1/quran/surahs");
  const recs = useApi("/v1/recitations");
  const reciters = useApi("/v1/reciters");

  return useMemo(() => {
    const reciter =
      reciters.data?.find((r) => r.isDefault)?.nameArabic ?? "الشيخ عبدالرحمن الزواوي";
    if (!surahs.data || !recs.data) return { tracks: null, reciter };

    const names = new Map(surahs.data.map((s) => [Number(s.id), s.nameArabic]));
    const tracks = recs.data.map((r) => {
      const id = Number(r.surahId);
      const name = (names.get(id) ?? "").replace(/^سورة\s*/, "");
      return {
        id,
        title: `سورة ${name}`,
        audioUrl: r.audioUrl,
        duration: r.durationSeconds ? Number(r.durationSeconds) : null,
      };
    });
    return { tracks, reciter };
  }, [surahs.data, recs.data, reciters.data]);
}