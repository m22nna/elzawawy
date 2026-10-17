
import { useEffect, useMemo, useState } from "react";
import { api } from "./client";


const LOCATION = { latitude: 31.2, longitude: 29.92, country: "EG" };

const PRAYERS = [
  ["fajr", "الفجر"],
  ["sunrise", "الشروق"],
  ["dhuhr", "الظهر"],
  ["asr", "العصر"],
  ["maghrib", "المغرب"],
  ["isha", "العشاء"],
];

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hms = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))} : ${pad(Math.floor((s % 3600) / 60))} : ${pad(s % 60)}`;
};

export function usePrayerTimes() {
  const [days, setDays] = useState(null);
  const [now, setNow] = useState(() => Date.now());


  useEffect(() => {
    const ctrl = new AbortController();
    const d = new Date();
    const month = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const q = new URLSearchParams({ ...LOCATION, month });
    api(`/v1/prayer-times?${q}`, { signal: ctrl.signal })
      .then((data) => setDays(data.days))
      .catch(() => {}); 
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!days) return null;
    const today = new Date(now);
    const todayRow = days.find((x) => x.date === ymd(today));
    if (!todayRow) return null;

    
    const rows = PRAYERS.map(([key, name]) => ({
      key,
      name,
      iso: todayRow.timings[key],
      time: todayRow.timings[key].slice(11, 16),
    }));


    let next = rows.find((r) => r.key !== "sunrise" && new Date(r.iso).getTime() > now);
    if (!next) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const t = days.find((x) => x.date === ymd(tomorrow));
      if (t) next = { key: "fajr", name: "الفجر", iso: t.timings.fajr };
    }
    if (!next) return { rows, next: null, countdown: "-- : -- : --" };

    return { rows, next, countdown: hms(new Date(next.iso).getTime() - now) };
  }, [days, now]);
}