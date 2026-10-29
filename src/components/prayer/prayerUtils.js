
export const API_BASE = 'https://zawawy-api-staging.onrender.com';

export const ADHAN_URL = 'https://islamic-audio.org/adhan/makkah.mp3';


export const HERO_IMAGE = "url('/images/prayer-bg.png')";

/* الصلوات الخمس بالترتيب (الشروق مش صلاة فمش داخل في العدّاد) */
export const PRAYERS = [
  { key: 'fajr', name: 'الفجر' },
  { key: 'dhuhr', name: 'الظهر' },
  { key: 'asr', name: 'العصر' },
  { key: 'maghrib', name: 'المغرب' },
  { key: 'isha', name: 'العشاء' }
];
export const ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
export const TABLE_COLS = [
  { key: 'fajr', name: 'الفجر' },
  { key: 'sunrise', name: 'الشروق' },
  { key: 'dhuhr', name: 'الظهر' },
  { key: 'asr', name: 'العصر' },
  { key: 'maghrib', name: 'المغرب' },
  { key: 'isha', name: 'العشاء' }
];

/* ---------- المدن ----------
   country بيحدد طريقة الحساب في الباك: EG مساحة مصرية، SA أم القرى، US/CA ISNA، غير كده رابطة العالم الإسلامي */
const EG = { country: 'EG', countryName: 'جمهورية مصر العربية', tz: 'Africa/Cairo' };
const SA = { country: 'SA', countryName: 'المملكة العربية السعودية', tz: 'Asia/Riyadh' };

export const PLACES = [
  { id: 'cairo', name: 'القاهرة', lat: '30.0444', lng: '31.2357', ...EG },
  { id: 'giza', name: 'الجيزة', lat: '30.0131', lng: '31.2089', ...EG },
  { id: 'alex', name: 'الإسكندرية', lat: '31.2001', lng: '29.9187', ...EG },
  { id: 'damanhur', name: 'دمنهور', lat: '31.0341', lng: '30.4682', ...EG },
  { id: 'tanta', name: 'طنطا', lat: '30.7865', lng: '31.0004', ...EG },
  { id: 'mansoura', name: 'المنصورة', lat: '31.0409', lng: '31.3785', ...EG },
  { id: 'portsaid', name: 'بورسعيد', lat: '31.2653', lng: '32.3019', ...EG },
  { id: 'ismailia', name: 'الإسماعيلية', lat: '30.5965', lng: '32.2715', ...EG },
  { id: 'suez', name: 'السويس', lat: '29.9668', lng: '32.5498', ...EG },
  { id: 'asyut', name: 'أسيوط', lat: '27.1809', lng: '31.1837', ...EG },
  { id: 'luxor', name: 'الأقصر', lat: '25.6872', lng: '32.6396', ...EG },
  { id: 'aswan', name: 'أسوان', lat: '24.0889', lng: '32.8998', ...EG },
  { id: 'makkah', name: 'مكة المكرمة', lat: '21.3891', lng: '39.8579', ...SA },
  { id: 'madinah', name: 'المدينة المنورة', lat: '24.5247', lng: '39.5692', ...SA },
  { id: 'riyadh', name: 'الرياض', lat: '24.7136', lng: '46.6753', ...SA },
  { id: 'jeddah', name: 'جدة', lat: '21.4858', lng: '39.1925', ...SA },
  { id: 'dubai', name: 'دبي', lat: '25.2048', lng: '55.2708', country: 'AE', countryName: 'الإمارات العربية المتحدة', tz: 'Asia/Dubai' }
];
export const DEFAULT_PLACE = PLACES[0];

// لو المستخدم استخدم "موقعي الحالي" بنخمّن الدولة من المنطقة الزمنية (غير كده بتتحسب برابطة العالم الإسلامي)
export const COUNTRY_BY_TZ = {
  'Africa/Cairo': 'EG',
  'Asia/Riyadh': 'SA',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA'
};

export const placeKeyOf = (p) => `${p.lat},${p.lng}`;

export const isValidTz = (tz) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/* ---------- طرق الحساب (أرقام aladhan) ---------- */
export const METHOD_INFO = {
  1: { name: 'جامعة العلوم الإسلامية بكراتشي', fajr: '18°', isha: '18°' },
  2: { name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', fajr: '15°', isha: '15°' },
  3: { name: 'رابطة العالم الإسلامي', fajr: '18°', isha: '17°' },
  4: { name: 'جامعة أم القرى بمكة المكرمة', fajr: '18.5°', isha: '90 دقيقة بعد المغرب' },
  5: { name: 'الهيئة المصرية العامة للمساحة', fajr: '19.5°', isha: '17.5°' }
};

/* ---------- أدوات الوقت (نظام 12 ساعة) ---------- */
const parseHM = (iso) => {
  const m = /T(\d{2}):(\d{2})/.exec(iso || '');
  return m ? { h: parseInt(m[1], 10), m: parseInt(m[2], 10) } : null;
};

export const fmt12 = (iso) => {
  const t = parseHM(iso);
  if (!t) return '--:--';
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${String(h12).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
};

export const period = (iso) => {
  const t = parseHM(iso);
  if (!t) return '';
  return t.h >= 12 ? 'مساءً' : 'صباحاً';
};

export const ampm = (iso) => (period(iso) === 'مساءً' ? 'م' : 'ص');

export const arDigits = (n) => Number(n).toLocaleString('ar-EG', { useGrouping: false });

/* تاريخ اليوم بتوقيت المدينة بصيغة YYYY-MM-DD (مش بتوقيت جهاز المستخدم) */
export const dateKey = (ms, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(ms);

export const addDays = (key, n) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

export const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat('ar-EG', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
    calendar: 'gregory'
  }).format(Date.UTC(y, m - 1, 1));
};

/* الشهور المطلوبة: الحالي، ولو أول يوم نجيب اللي قبله (تبويب "الأمس")،
   ولو آخر يوم نجيب اللي بعده (فجر بكرة وتبويب "الغد") */
export function neededMonths(todayKey) {
  const cur = todayKey.slice(0, 7);
  const [y, m, d] = todayKey.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const list = [cur];
  if (d === 1) list.push(shiftMonth(cur, -1));
  if (d === lastDay) list.push(shiftMonth(cur, 1));
  return list;
}

export async function fetchMonth(place, month, signal) {
  const params = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lng),
    month
  });
  if (place.country) params.set('country', place.country);
  const res = await fetch(`${API_BASE}/v1/prayer-times?${params}`, { signal });
  if (!res.ok) throw new Error(`prayer-times ${res.status}`);
  return res.json();
}

/* بيحسب الصلاة الحالية والقادمة من الأوقات الحقيقية.
   byDate: Map من 'YYYY-MM-DD' إلى سجل اليوم.
   الأوقات جاية بتوقيت محلي مع الـ offset، فـ Date.parse بيطلّع لحظة مطلقة
   ومقارنتها بالوقت الحالي مش بتتأثر بتوقيت جهاز المستخدم. */
export function computeState(byDate, nowMs, todayKey) {
  if (!byDate.get(todayKey)) return { next: null, prev: null, current: null };

  const events = [];
  [-1, 0, 1].forEach((offset) => {
    const rec = byDate.get(addDays(todayKey, offset));
    if (!rec) return;
    const sunriseT = Date.parse(rec.timings?.sunrise);
    PRAYERS.forEach((p, order) => {
      const iso = rec.timings?.[p.key];
      const t = Date.parse(iso);
      if (Number.isNaN(t)) return;
      events.push({
        ...p,
        iso,
        t,
        order,
        offset,
        // وقت الفجر بينتهي بالشروق، وباقي الصلوات بتنتهي لما اللي بعدها تبدأ
        endT: p.key === 'fajr' && !Number.isNaN(sunriseT) ? sunriseT : null
      });
    });
  });
  events.forEach((e, i) => {
    if (e.endT == null) e.endT = events[i + 1]?.t ?? Infinity;
  });

  const nextIdx = events.findIndex((e) => e.t > nowMs);
  const next = nextIdx >= 0 ? events[nextIdx] : null;
  const prev = nextIdx > 0 ? events[nextIdx - 1] : null;
  // الصلاة "الحالية" = آخر صلاة بدأ وقتها ولسه ما انتهاش (بين الشروق والظهر مفيش صلاة حالية)
  const current = prev && nowMs < prev.endT ? prev : null;
  return { next, prev, current };
}

/* ---------- القبلة ---------- */
const KAABA = { lat: 21.4225, lng: 39.8262 };

// الزاوية من الشمال الحقيقي (بالدرجات مع عقارب الساعة) لحد الكعبة
export function qiblaBearing(lat, lng) {
  const rad = (d) => (d * Math.PI) / 180;
  const p1 = rad(lat);
  const p2 = rad(KAABA.lat);
  const dl = rad(KAABA.lng - lng);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const DIRECTIONS = ['شمال', 'شمال الشرق', 'شرق', 'جنوب الشرق', 'جنوب', 'جنوب الغرب', 'غرب', 'شمال الغرب'];
export const compassName = (deg) => DIRECTIONS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];