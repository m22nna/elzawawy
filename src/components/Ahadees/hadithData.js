import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { plain } from "../../features/Quran/utils";

const CACHE_KEY = "zawawy:hadiths:v1";
const SAVED_KEY = "zawawy:hadiths:saved";

const normalize = (raw) =>
  (Array.isArray(raw) ? raw : raw?.data ?? [])
    .map((h, i) => ({
      textArabic: h.textArabic ?? "",
      source: h.source ?? "",
      explanation: h.explanation ?? "",
      sortOrder: Number(h.sortOrder) || i + 1, // ترتيب الحديث في المكتبة (مش رقمه في الكتاب)
    }))
    .filter((h) => h.textArabic)
    .sort((a, b) => a.sortOrder - b.sortOrder);

const readCache = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(v) && v.length ? v : null;
  } catch {
    return null;
  }
};

/** كل الأحاديث بنداء واحد. آخر نسخة ناجحة بتتحفظ في المتصفح عشان الصفحة تفتح فوراً وتشتغل لو السيرفر نايم. */
export function useHadiths() {
  const [hadiths, setHadiths] = useState(readCache);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setError(null);
    api("/v1/hadiths", { signal: ctrl.signal })
      .then((data) => {
        const list = normalize(data);
        if (!list.length) throw new Error("empty hadiths response");
        setHadiths(list);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(list));
        } catch {
          /* التخزين ممنوع */
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("API error: hadiths", err);
        setError(err);
      });
    return () => ctrl.abort();
  }, [tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { hadiths, error: hadiths ? null : error, loading: !hadiths && !error, retry };
}

/** حديث اليوم: نفس الحديث طول اليوم لكل الزوار (بيتحدد من تاريخ اليوم)، و"حديث آخر" بيختار عشوائي من المكتبة. */
const dayOfYear = (d = new Date()) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);

export function useDailyHadith(hadiths) {
  const n = hadiths?.length ?? 0;
  const [picked, setPicked] = useState(null); // null = حديث اليوم
  const base = n ? dayOfYear() % n : 0;
  const index = n ? (picked ?? base) % n : 0;

  const another = useCallback(() => {
    if (n < 2) return;
    setPicked((cur) => {
      const current = (cur ?? base) % n;
      let next;
      do next = Math.floor(Math.random() * n);
      while (next === current);
      return next;
    });
  }, [n, base]);

  return { hadith: n ? hadiths[index] : null, isDailyPick: picked === null || picked % n === base, another };
}

/** الأحاديث المحفوظة (بتتخزن على نفس المتصفح بدون حساب). المفتاح = sortOrder. */
export function useSavedHadiths() {
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
        /* التخزين ممنوع */
      }
      return next;
    });
  }, []);

  return [ids, toggle];
}

/** تصنيف الحديث حسب مصدره (من نص الـ source نفسه، مش من بيانات مختلقة) */
export function bucketOf(source = "") {
  const s = plain(source);
  const bukhari = s.includes("البخاري");
  const muslim = s.includes("مسلم");
  if (s.includes("متفق عليه") || (bukhari && muslim)) return "متفق عليه";
  if (bukhari) return "صحيح البخاري";
  if (muslim) return "صحيح مسلم";
  const cleaned = String(source)
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/رقم\s*[\d٠-٩]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "مصادر أخرى";
}

/** مجموعات المصادر مرتّبة بالأكتر عدداً: [{ name, count }] */
export function groupBySource(hadiths = []) {
  const map = new Map();
  for (const h of hadiths) {
    const name = bucketOf(h.source);
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return [...map].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ar"));
}

/** بحث بدون حساسية للتشكيل والهمزات في النص والشرح والمصدر */
export function matchesQuery(h, query) {
  const q = plain(query);
  return !q || plain(`${h.textArabic} ${h.explanation} ${h.source}`).includes(q);
}