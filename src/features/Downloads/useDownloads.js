import { useSyncExternalStore } from "react";
import { downloadManager as m } from "./downloadManager";

export const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "quran", label: "القرآن الكريم" },
  // { key: "adhkar", label: "الأذكار" },
  // { key: "hadith", label: "الحديث والتفسير" },
  { key: "shorts", label: "الشورتس الإسلامية" },
];

export function useDownloads() {
  const items = useSyncExternalStore(m.subscribe, m.getItems);
  return { items, start: m.start, pause: m.pause, resume: m.resume, remove: m.remove, getUrl: m.getUrl };
}