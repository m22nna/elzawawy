import { clampPage, firstPageOfSurah } from "./mushaf";

const KEY = "zawawy:quran:lastRead:v2";
const OLD_KEY = "zawawy:quran:lastRead";

export const getLastRead = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw);
      return {
        page: clampPage(v.page),
        surahId: v.surahId ?? null,
        surahName: v.surahName ?? null,
        ayah: v.ayah ?? null,
      };
    }
    const old = Number(localStorage.getItem(OLD_KEY));
    if (old >= 1 && old <= 114) {
      return { page: firstPageOfSurah(old), surahId: old, surahName: null, ayah: null };
    }
  } catch {

  }
  return null;
};

export const getLastReadPage = () => getLastRead()?.page ?? 1;

export const setLastRead = ({ page, surahId = null, surahName = null, ayah = null }) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ page: clampPage(page), surahId, surahName, ayah }));
  } catch {

  }
};