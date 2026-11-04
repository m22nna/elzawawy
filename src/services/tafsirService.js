/**
 * Tafsir Service
 * Connects with Zawawy API staging for Quran Surahs, Ayahs, Tafsir, and Recitations.
 */

const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL ||
  'https://zawawy-api-staging.onrender.com'
).replace(/\/+$/, '');

const surahCache = {
  surahs: null,
  ayahsBySurah: {},
  tafsirCache: {},
  recitations: null,
};

/**
 * Arabic Eastern Numeral Converter
 */
export const toArabicNumerals = (num) => {
  if (num === null || num === undefined || num === '') return '';

  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  return String(num).replace(
    /[0-9]/g,
    (digit) => arabicDigits[Number(digit)]
  );
};

/**
 * Supported Tafsir Sources
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
];

/**
 * Helper to execute API requests with fallback for /api/v1
 */
async function requestApi(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url);

    if (res.ok) {
      return await res.json();
    }

    if (res.status === 404 && !cleanEndpoint.startsWith('/api')) {
      const altUrl = `${API_BASE_URL}/api${cleanEndpoint}`;
      const altRes = await fetch(altUrl);

      if (altRes.ok) {
        return await altRes.json();
      }

      throw new Error(`API Error: ${altRes.status} ${altRes.statusText}`);
    }

    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Fetch all Surahs
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
 */
export async function getAyahTafsir(surahId, ayahNumber) {
  const sid = Number(surahId);
  const aid = Number(ayahNumber);
  const cacheKey = `${sid}:${aid}`;

  if (surahCache.tafsirCache[cacheKey]) {
    return surahCache.tafsirCache[cacheKey];
  }

  try {
    const data = await requestApi(`/v1/tafsir/${sid}/${aid}`);

    const result = {
      ...data,
      surahId: Number(data.surahId ?? sid),
      ayahNumber: Number(data.ayahNumber ?? aid),
      source: 'ar.muyassar',
      text: data.text || '',
    };

    surahCache.tafsirCache[cacheKey] = result;

    return result;
  } catch (err) {
    console.error(
      `Failed to fetch tafsir for Surah ${sid}, Ayah ${aid}:`,
      err
    );

    throw err;
  }
}

/**
 * Fetch available recitations
 */
export async function getRecitations() {
  if (surahCache.recitations) {
    return surahCache.recitations;
  }

  try {
    const data = await requestApi('/v1/recitations');

    if (!Array.isArray(data)) {
      throw new Error('Invalid recitations response');
    }

    surahCache.recitations = data;

    return data;
  } catch (err) {
    console.error('Failed to fetch recitations:', err);
    throw err;
  }
}

/**
 * Get available Tafsir sources
 */
export function getTafsirSources() {
  return TAFSIR_SOURCES;
}

/**
 * Normalize Arabic text
 */
export const normalizeArabic = (text) => {
  if (!text) return '';

  return String(text)
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ؤئ]/g, '')
    .replace(/[۞۩ـ]/g, '')
    .replace(/[^\u0621-\u064A0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

/**
 * Search across all Quran Surahs and Ayahs
 */
export async function searchTafsir(query, surahId = null) {
  if (!query || !query.trim()) return [];

  const normalizedQuery = normalizeArabic(query)
    .replace(/^سوره\s+/, '')
    .trim();

  if (!normalizedQuery) return [];

  try {
    const surahs = await getSurahs();
    const results = [];

    // Search Surah names
    const matchedSurahs = surahs.filter((surah) => {
      const arabicName = normalizeArabic(surah.nameArabic || '');
      const englishName = (surah.nameEnglish || '').toLowerCase();

      return (
        arabicName.includes(normalizedQuery) ||
        englishName.includes(normalizedQuery.toLowerCase())
      );
    });

    matchedSurahs.forEach((surah) => {
      results.push({
        type: 'surah',
        surahId: Number(surah.id),
        surahNameArabic: surah.nameArabic,
        nameArabic: surah.nameArabic,
        ayahCount: surah.ayahCount,
      });
    });

    // Search Quranic text in all Surahs
    const batchSize = 8;

    for (let i = 0; i < surahs.length; i += batchSize) {
      const batch = surahs.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (surah) => {
          try {
            const ayahs = await getSurahAyahs(surah.id);

            return ayahs
              .filter((ayah) => {
                if (!ayah.textUthmani) return false;

                return normalizeArabic(ayah.textUthmani).includes(
                  normalizedQuery
                );
              })
              .map((ayah) => ({
                type: 'ayah',
                surahId: Number(surah.id),
                surahNameArabic: surah.nameArabic,
                ayahNumber: Number(ayah.ayahNumber),
                textUthmani: ayah.textUthmani,
              }));
          } catch (error) {
            console.error(
              `Failed to search in Surah ${surah.id}:`,
              error
            );

            return [];
          }
        })
      );

      batchResults.forEach((matches) => {
        results.push(...matches);
      });
    }

    return results;
  } catch (err) {
    console.error('Failed to search Quran:', err);
    throw err;
  }
}