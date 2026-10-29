/**
 * Tafsir Service
 * Connects with Zawawy API staging for Quran Surahs, Ayahs, and Tafsir data.
 */

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'https://zawawy-api-staging.onrender.com').replace(/\/+$/, '');

// Cache objects for rapid in-memory navigation without redundant network requests
const surahCache = {
  surahs: null,
  ayahsBySurah: {},
  tafsirCache: {},
};

/**
 * Arabic Eastern Numeral Converter
 * Converts Western digits (0-9) to Eastern Arabic digits (٠-٩)
 */
export const toArabicNumerals = (num) => {
  if (num === null || num === undefined || num === '') return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (digit) => arabicDigits[Number(digit)]);
};

/**
 * Standard Tafsir Sources
 */
export const TAFSIR_SOURCES = [
  {
    id: 'ar.muyassar',
    name: 'التفسير الميسر',
    fullName: 'التفسير الميسر — مجمع الملك فهد لطباعة المصحف الشريف',
    author: 'نخبة من العلماء بإشراف مجمع الملك فهد',
    edition: 'طبعة مجمع الملك فهد بالمدينة المنورة',
    isDefault: true,
  },
  {
    id: 'saadi',
    name: 'تفسير السعدي',
    fullName: 'تيسير الكريم الرحمن في تفسير كلام المنان — للعلامة عبدالرحمن بن ناصر السعدي',
    author: 'الشيخ عبدالرحمن بن ناصر السعدي (رحمه الله)',
    edition: 'طبعة دار ابن الجوزي',
    isDefault: false,
  },
  {
    id: 'ibnkathir',
    name: 'تفسير ابن كثير',
    fullName: 'تفسير القرآن العظيم — للإمام الحافظ إسماعيل بن عمر بن كثير',
    author: 'الحافظ عماد الدين إسماعيل بن كثير (رحمه الله)',
    edition: 'طبعة دار طيبة',
    isDefault: false,
  },
  {
    id: 'tabari',
    name: 'تفسير الطبري',
    fullName: 'جامع البيان عن تأويل آي القرآن — للإمام أبي جعفر محمد بن جرير الطبري',
    author: 'الإمام محمد بن جرير الطبري (رحمه الله)',
    edition: 'طبعة دار هجر',
    isDefault: false,
  },
  {
    id: 'qurtubi',
    name: 'تفسير القرطبي',
    fullName: 'الجامع لأحكام القرآن والمبين لما تضمنه من السنة وآي الفرقان',
    author: 'الإمام شمس الدين أبو عبد الله القرطبي (رحمه الله)',
    edition: 'طبعة دار الكتب المصرية',
    isDefault: false,
  },
];

/**
 * Helper to execute API requests with fallback for /v1 and /api/v1
 */
async function requestApi(endpoint) {
  // Normalize leading slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Try direct endpoint first (e.g. /v1/...)
  let url = `${API_BASE_URL}${cleanEndpoint}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
    // If 404 and doesn't contain /api/v1, attempt /api prefix
    if (res.status === 404 && !cleanEndpoint.startsWith('/api')) {
      const altUrl = `${API_BASE_URL}/api${cleanEndpoint}`;
      const altRes = await fetch(altUrl);
      if (altRes.ok) {
        return await altRes.json();
      }
    }
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Fetch all 114 Surahs with metadata
 */
export async function getSurahs() {
  if (surahCache.surahs) {
    return surahCache.surahs;
  }

  try {
    const data = await requestApi('/v1/quran/surahs');
    surahCache.surahs = data;
    return data;
  } catch (err) {
    console.error('Failed to fetch surahs:', err);
    throw err;
  }
}

/**
 * Fetch all Ayahs for a given Surah
 */
export async function getSurahAyahs(surahId) {
  const sid = Number(surahId);
  if (surahCache.ayahsBySurah[sid]) {
    return surahCache.ayahsBySurah[sid];
  }

  try {
    const data = await requestApi(`/v1/quran/surahs/${sid}/ayahs`);
    surahCache.ayahsBySurah[sid] = data;
    return data;
  } catch (err) {
    console.error(`Failed to fetch ayahs for surah ${sid}:`, err);
    throw err;
  }
}

/**
 * Fetch Tafsir for a specific Surah and Ayah
 * @param {number|string} surahId - 1-114
 * @param {number|string} ayahNumber - 1-N
 * @param {string} source - tafsir source id (default: 'ar.muyassar')
 */
export async function getAyahTafsir(surahId, ayahNumber, source = 'ar.muyassar') {
  const sid = Number(surahId);
  const aid = Number(ayahNumber);
  const cacheKey = `${sid}:${aid}:${source}`;

  if (surahCache.tafsirCache[cacheKey]) {
    return surahCache.tafsirCache[cacheKey];
  }

  try {
    // API provides Tafsir al-Muyassar at /v1/tafsir/{surahId}/{ayahNumber}
    const data = await requestApi(`/v1/tafsir/${sid}/${aid}`);
    const result = {
      ...data,
      surahId: Number(data.surahId ?? sid),
      ayahNumber: Number(data.ayahNumber ?? aid),
      source: data.source || source,
      text: data.text || '',
    };
    surahCache.tafsirCache[cacheKey] = result;
    return result;
  } catch (err) {
    console.error(`Failed to fetch tafsir for Surah ${sid}, Ayah ${aid}:`, err);
    throw err;
  }
}

/**
 * Get available Tafsir sources list
 */
export function getTafsirSources() {
  return TAFSIR_SOURCES;
}

/**
 * Normalize Arabic text by removing tashkeel / diacritics and unifying letters
 */
export const normalizeArabic = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove Arabic diacritics / Quranic marks
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

/**
 * Search Tafsir and Quranic Texts
 * @param {string} query
 * @param {number} [surahId]
 */
export async function searchTafsir(query, surahId = null) {
  if (!query || !query.trim()) return [];
  const normalizedQuery = normalizeArabic(query).replace(/^سوره\s+/, '').trim();

  try {
    const results = [];

    // 1. If surahId is provided, search within its ayahs first
    if (surahId) {
      const ayahs = await getSurahAyahs(surahId);
      const matchedAyahs = ayahs.filter(a => {
        if (!a.textUthmani) return false;
        return normalizeArabic(a.textUthmani).includes(normalizedQuery);
      });

      matchedAyahs.forEach(a => {
        results.push({
          type: 'ayah',
          surahId: Number(surahId),
          ayahNumber: Number(a.ayahNumber),
          textUthmani: a.textUthmani,
        });
      });
    }

    // 2. Also search across surah names
    const surahs = await getSurahs();
    const matchedSurahs = surahs.filter(s => {
      const sNorm = normalizeArabic(s.nameArabic);
      const sEng = (s.nameEnglish || '').toLowerCase();
      return sNorm.includes(normalizedQuery) || sEng.includes(normalizedQuery.toLowerCase());
    });

    matchedSurahs.forEach(s => {
      results.push({
        type: 'surah',
        surahId: Number(s.id),
        nameArabic: s.nameArabic,
        ayahCount: s.ayahCount,
      });
    });

    return results;
  } catch (err) {
    console.error('Failed to search tafsir:', err);
    return [];
  }
}

