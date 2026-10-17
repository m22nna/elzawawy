import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../../api/useApi";
import { TILE_LABELS } from "../../../config/home";
import { dayStr, doneCount, loadProgress, saveProgress, withActivity, yesterday } from "../wirdStore";


const norm = (s = "") =>
  s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").replace(/[أإآٱ]/g, "ا");

export function useWird() {
  const tasbih = useApi("/v1/adhkar/tasbih-and-istighfar");
  const morning = useApi("/v1/adhkar/morning");
  const evening = useApi("/v1/adhkar/evening");
  const sleep = useApi("/v1/adhkar/sleep");

  const [progress, setProgress] = useState(loadProgress);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const items = tasbih.data?.items ?? [];
  const current = items[index];
  const repeat = current?.repeatCount || 100;
  const count = Math.min(progress.counts[index] ?? 0, repeat);

  const tap = useCallback(() => {
    if (!current || count >= repeat) return;
    setProgress((p) =>
      withActivity({ ...p, counts: { ...p.counts, [index]: (p.counts[index] ?? 0) + 1 } })
    );
  }, [current, count, repeat, index]);

  const next = () => items.length && setIndex((i) => (i + 1) % items.length);
  const reset = () => setProgress((p) => ({ ...p, counts: { ...p.counts, [index]: 0 } }));

  const sources = { morning: morning.data, evening: evening.data, sleep: sleep.data };
  const rows = Object.fromEntries(
    Object.entries(sources).map(([slug, d]) => {
      const total = d?.items?.length ?? 0;
      return [slug, { total, done: Math.min(doneCount(progress, slug), total) }];
    })
  );

  const tiles = TILE_LABELS.map((label) => ({
    label,
    value: items.reduce(
      (sum, it, i) => (norm(it.textArabic).includes(norm(label)) ? sum + (progress.counts[i] ?? 0) : sum),
      0
    ),
  }));

  const streak = [dayStr(), yesterday()].includes(progress.lastActive) ? progress.streak : 0;

  return {
    dhikr: { text: current?.textArabic, count, repeat, tap, next, reset },
    rows,
    tiles,
    streak,
    loading: tasbih.loading,
    error: tasbih.error,
  };
}