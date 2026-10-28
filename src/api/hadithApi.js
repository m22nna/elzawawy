// src/api/hadithApi.js

const BASE_URL = 'https://zawawy-api-staging.onrender.com/v1';

/**
 * جلب حديث عشوائي من السيرفر
 * GET /v1/hadiths/random
 * @returns {Promise<{textArabic: string, source: string, explanation: string, sortOrder: number}>}
 */
export const fetchRandomHadith = async () => {
  try {
    const response = await fetch(`${BASE_URL}/hadiths/random`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`خطأ في جلب الحديث النبوي: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("فشل جلب الحديث العشوائي:", error);
    throw error;
  }
};

/**
 * جلب جميع الأحاديث النبوية
 * GET /v1/hadiths
 */
export const fetchAllHadiths = async () => {
  try {
    const response = await fetch(`${BASE_URL}/hadiths`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`خطأ في جلب قائمة الأحاديث: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("فشل جلب قائمة الأحاديث:", error);
    throw error;
  }
};
