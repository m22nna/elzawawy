import { useEffect, useMemo, useState } from "react";

import {
  PRAYERS,
  dateKey,
  neededMonths,
  fetchMonth,
  loadSavedPlace,
  placeKeyOf,
} from "../components/prayer/prayerUtils";

// Every prayer time on the site is for Alexandria. country=EG makes the API use the Egyptian
// General Authority of Survey method.
export const LOCATION = { latitude: 31.2, longitude: 29.92, country: "EG" };

const pad = (n) => String(n).padStart(2, "0");

const hms = (ms) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));

  return `${pad(Math.floor(seconds / 3600))} : ${pad(
    Math.floor((seconds % 3600) / 60)
  )} : ${pad(seconds % 60)}`;
};

export function usePrayerTimes() {
  const [place, setPlace] = useState(loadSavedPlace);
  const [days, setDays] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // متابعة تغيير المدينة المحفوظة
  useEffect(() => {
    const checkSavedPlace = () => {
      const savedPlace = loadSavedPlace();

      setPlace((currentPlace) => {
        if (placeKeyOf(currentPlace) !== placeKeyOf(savedPlace)) {
          return savedPlace;
        }

        return currentPlace;
      });
    };

    // التغيير في نفس التبويب أو من تبويب آخر
    const interval = setInterval(checkSavedPlace, 500);

    window.addEventListener("storage", checkSavedPlace);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkSavedPlace);
    };
  }, []);

  // تحديث الوقت الحالي كل ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // جلب مواقيت الصلاة حسب المدينة المختارة
  useEffect(() => {
    if (!place) return;

    const controller = new AbortController();

    setDays(null);

    const todayKey = dateKey(Date.now(), place.tz);
    const months = neededMonths(todayKey);

    Promise.all(
      months.map((month) => fetchMonth(place, month, controller.signal))
    )
      .then((responses) => {
        if (controller.signal.aborted) return;

        const allDays = responses.flatMap((response) =>
          Array.isArray(response.days) ? response.days : []
        );

        setDays(allDays);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Failed to load prayer times:", error);
          setDays(null);
        }
      });

    return () => controller.abort();
  }, [place?.id, place?.lat, place?.lng, place?.country, place?.tz]);

  return useMemo(() => {
    if (!days || !place) return null;

    // تحديد تاريخ اليوم حسب توقيت المدينة المختارة
    const todayKey = dateKey(now, place.tz);

    const byDate = new Map();

    days.forEach((day) => {
      const key = day.date || day.timings?.fajr?.slice(0, 10);

      if (key) {
        byDate.set(key, day);
      }
    });

    const todayRow = byDate.get(todayKey);

    if (!todayRow) return null;

    const rows = [
      ...PRAYERS.map(({ key, name }) => ({
        key,
        name,
        iso: todayRow.timings?.[key],
        time: todayRow.timings?.[key]?.slice(11, 16) || "--:--",
      })),
      {
        key: "sunrise",
        name: "الشروق",
        iso: todayRow.timings?.sunrise,
        time: todayRow.timings?.sunrise?.slice(11, 16) || "--:--",
      },
    ];

    const events = [];

    [-1, 0, 1].forEach((offset) => {
      const date = new Date(`${todayKey}T12:00:00Z`);
      date.setUTCDate(date.getUTCDate() + offset);

      const dayKey = date.toISOString().slice(0, 10);
      const record = byDate.get(dayKey);

      if (!record) return;

      PRAYERS.forEach(({ key, name }) => {
        const iso = record.timings?.[key];
        const timestamp = Date.parse(iso);

        if (!iso || Number.isNaN(timestamp)) return;

        events.push({
          key,
          name,
          iso,
          t: timestamp,
        });
      });
    });

    events.sort((a, b) => a.t - b.t);

    const next = events.find((event) => event.t > now);

    const previousEvents = events.filter((event) => event.t <= now);
    const previous = previousEvents[previousEvents.length - 1];

    const currentKey = previous?.key ?? "isha";
    const hijri = todayRow.hijri;

    if (!next) {
      return {
        rows,
        next: null,
        currentKey,
        hijri,
        countdown: "-- : -- : --",
        placeName: place.name,
      };
    }

    return {
      rows,
      next,
      currentKey,
      hijri,
      countdown: hms(next.t - now),
      placeName: place.name,
    };
  }, [days, now, place]);
}