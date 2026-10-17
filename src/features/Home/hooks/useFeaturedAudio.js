import { useMemo } from "react";
import { useApi } from "../../../api/useApi";
import { FEATURED_AUDIO } from "../../../config/home";

export function useFeaturedAudio() {
  const rec = useApi("/v1/recitations");
  const surahs = useApi("/v1/quran/surahs");
  const reciters = useApi("/v1/reciters");

  const reciterName = reciters.data?.[0]?.nameArabic
    ? `الشيخ ${reciters.data[0].nameArabic}`
    : "";

  const items = useMemo(() => {
    if (!rec.data || !surahs.data) return [];
    return FEATURED_AUDIO.map((f) => {
      const surah = surahs.data.find((s) => s.id === f.surahId);
      const r = rec.data.find((x) => x.surahId === f.surahId);
      if (!surah || !r) return null;
      return {
        id: f.surahId,
        tag: f.tag,
        image: f.image,
        title: f.title ?? `سورة ${surah.nameArabic}`,
        audioUrl: r.audioUrl,
        durationSeconds: r.durationSeconds,
      };
    }).filter(Boolean);
  }, [rec.data, surahs.data]);

  return {
    items,
    reciterName,
    loading: rec.loading || surahs.loading,
    error: rec.error || surahs.error,
  };
}