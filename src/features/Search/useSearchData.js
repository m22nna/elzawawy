import { useCallback, useState } from "react";
import { api } from "../../api/client";
import { JUZ_LINK_PAGE, TOTAL_PAGES, firstPageOfSurah, lastPageOfSurah } from "../Quran/mushaf";
import { buildMatcher, toLatinDigits } from "./searchUtils";
import { plain } from "../Quran/utils";

let cache = null;
let inflight = null;

const asList = (r) => (Array.isArray(r) ? r : r?.data ?? []);

export function loadSearchData() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = Promise.allSettled([api("/v1/quran/surahs"), api("/v1/hadiths"), api("/v1/adhkar")]).then(
      ([surahs, hadiths, adhkar]) => {
        if ([surahs, hadiths, adhkar].every((r) => r.status === "rejected")) {
          inflight = null;
          throw surahs.reason;
        }
        cache = {
          surahs: surahs.status === "fulfilled" ? asList(surahs.value).map((s) => ({ ...s, id: Number(s.id) })) : [],
          hadiths: hadiths.status === "fulfilled" ? asList(hadiths.value) : [],
          adhkar: adhkar.status === "fulfilled" ? asList(adhkar.value) : [],
        };
        return cache;
      }
    );
  }
  return inflight;
}

export function useSearchData() {
  const [data, setData] = useState(cache);
  const [error, setError] = useState(null);
  const ensure = useCallback(() => {
    if (cache) {
      setData(cache);
      return;
    }
    setError(null);
    loadSearchData().then(setData).catch((e) => {
      console.error("search data error", e);
      setError(e);
    });
  }, []);
  return { data, error, loading: !data && !error, ensure };
}

// صفحات الموقع
const SITE_PAGES = [
  { title: "القرآن الكريم", to: "/quran", keywords: "المصحف قران تلاوة سور" },
  { title: "الأحاديث النبوية", to: "/ahadith", keywords: "احاديث حديث سنة" },
  { title: "الأذكار والأدعية", to: "/adhkar", keywords: "اذكار ورد دعاء ادعية تسبيح استغفار" },
  { title: "التفاسير", to: "/tafseer", keywords: "تفسير تفاسير" },
  { title: "خطب ومرئيات (الشورتس)", to: "/shorts", keywords: "شورتس خطب مرئيات فيديو مقاطع" },
  { title: "مواقيت الصلاة", to: "/prayers", keywords: "صلاة مواقيت اذان القبلة" },
  { title: "رمضان", to: "/ramadan", keywords: "رمضان ختمات تراويح" },
  { title: "التنزيلات", to: "/downloads", keywords: "تحميل تنزيلات اوفلاين" },
];

const EMPTY = { matcher: null, jumps: [], pages: [], surahs: [], hadiths: [], adhkar: [] };

export function runSearch(data, rawQuery) {
  const q = String(rawQuery ?? "").trim();
  const matcher = buildMatcher(q);
  if (!matcher || !data) return { ...EMPTY, matcher };

  const latin = toLatinDigits(q);
  const jumps = [];

  const page = latin.match(/^(?:صفحة|الصفحة|ص|page|p)\s*(\d{1,3})$/i);
  if (page && +page[1] >= 1 && +page[1] <= TOTAL_PAGES) {
    jumps.push({ key: `page-${page[1]}`, title: `الصفحة ${page[1]} من المصحف`, subtitle: "اذهب مباشرة", to: `/quran/page/${page[1]}` });
  }
  const juz = latin.match(/^(?:جزء|الجزء|juz)\s*(\d{1,2})$/i);
  if (juz && +juz[1] >= 1 && +juz[1] <= 30) {
    const p = JUZ_LINK_PAGE[juz[1] - 1];
    jumps.push({ key: `juz-${juz[1]}`, title: `الجزء ${juz[1]}`, subtitle: `يبدأ من صفحة ${p}`, to: `/quran/page/${p}` });
  }

  const pages = SITE_PAGES.filter((p) => matcher.test(`${p.title} ${p.keywords}`)).map((p) => ({
    key: `site-${p.to}`,
    title: p.title,
    subtitle: "صفحة في الموقع",
    to: p.to,
  }));

  const num = /^\d{1,3}$/.test(latin) ? Number(latin) : null;
  const lq = q.toLowerCase();
  const surahs = data.surahs
    .map((s) => {
      const name = plain(String(s.nameArabic ?? "").replace(/^سورة\s*/, ""));
      const pq = plain(q.replace(/^سورة\s*/, ""));
      let rank = null;
      if (num !== null && s.id === num) rank = 0;
      else if (pq && name === pq) rank = 1;
      else if (pq && name.startsWith(pq)) rank = 2;
      else if (matcher.test(`${s.nameArabic}`) || (lq.length > 1 && String(s.nameEnglish ?? "").toLowerCase().includes(lq))) rank = 3;
      return rank === null ? null : { rank, s };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || a.s.id - b.s.id)
    .map(({ s }) => {
      const from = firstPageOfSurah(s.id);
      const to = lastPageOfSurah(s.id);
      return {
        key: `surah-${s.id}`,
        surah: s,
        title: `سورة ${String(s.nameArabic ?? "").replace(/^سورة\s*/, "")}`,
        subtitle: `${s.ayahCount} آية • صفحة ${from === to ? from : `${from}-${to}`}`,
        to: `/quran/page/${from}`,
      };
    });

  const hadiths = data.hadiths
    .map((h) => {
      const inText = matcher.test(h.textArabic);
      const inRest = !inText && matcher.test(`${h.explanation} ${h.source}`);
      return inText || inRest ? { h, field: inText ? "textArabic" : "explanation", rank: inText ? 0 : 1 } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || a.h.sortOrder - b.h.sortOrder)
    .map(({ h, field }) => ({
      key: `hadith-${h.sortOrder}`,
      hadith: h,
      field,
      title: h.textArabic,
      subtitle: h.source,
      to: `/tafseerhadith/${h.sortOrder}`,
    }));

  const adhkar = [];
  for (const c of data.adhkar) {
    if (matcher.test(c.nameArabic)) {
      adhkar.push({ key: `adhkar-cat-${c.slug}`, category: c.nameArabic, title: c.nameArabic, subtitle: `${c.items?.length ?? 0} ذكراً`, to: "/adhkar", isCategory: true });
    }
    (c.items ?? []).forEach((it, i) => {
      if (matcher.test(`${it.textArabic} ${it.virtue ?? ""}`)) {
        adhkar.push({
          key: `adhkar-${c.slug}-${i}`,
          category: c.nameArabic,
          title: it.textArabic,
          subtitle: c.nameArabic,
          field: matcher.test(it.textArabic) ? "textArabic" : "virtue",
          virtue: it.virtue,
          to: "/adhkar",
        });
      }
    });
  }
  adhkar.sort((a, b) => Number(!!b.isCategory) - Number(!!a.isCategory));

  return { matcher, jumps, pages, surahs, hadiths, adhkar };
}
