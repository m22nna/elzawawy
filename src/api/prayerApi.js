// src/api/prayerApi.js

const BASE_URL = 'https://zawawy-api-staging.onrender.com/v1';

/**
 * جلب مواقيت الصلاة للشهر بناءً على خط العرض والطول والشهر
 */
export const fetchPrayerTimes = async (latitude = '30.0444', longitude = '31.2357', month = '2026-10') => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      month: month,
      timezone: 'Africa/Cairo',
      method: '5', // الهيئة العامة المصرية للمساحة
      days: '30'
    });

    const response = await fetch(`${BASE_URL}/prayer-times?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`خطأ من السيرفر: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("فشل جلب مواقيت الصلاة:", error);
    throw error;
  }
};