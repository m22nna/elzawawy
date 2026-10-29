import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Compass,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  Timer,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  CirclePlay,
  CirclePause,
  SlidersHorizontal,
  MapPin,
  CalendarDays
} from 'lucide-react';
import Navbar from './NavBar';
import { PlayerProvider, usePlayer } from '../features/Quran/player/PlayerProvider';
import PlayerBar from '../features/Quran/components/PlayerBar';
import { useSurahs, useTracks } from '../features/Quran/hooks/useQuranData';
import { MonthModal, PlaceModal, QiblaModal } from './prayer/PrayerModals';
import {
  ADHAN_URL,
  DEFAULT_PLACE,
  HERO_IMAGE,
  METHOD_INFO,
  ORDINALS,
  addDays,
  ampm,
  arDigits,
  compassName,
  computeState,
  dateKey,
  fetchMonth,
  fmt12,
  isValidTz,
  neededMonths,
  period,
  placeKeyOf,
  qiblaBearing
} from './prayer/prayerUtils';

/* ---------- الألوان ---------- */
const C = {
  bg: '#f7f6f1',
  green: '#0f3d30',
  greenCard: '#175040',
  gold: '#c9a45c',
  goldText: '#b98f3e',
  border: '#e6e3da',
  muted: '#6b7280'
};

const CARDS = [
  { key: 'fajr', name: 'الفجر', Icon: Sunrise, iconColor: 'text-slate-500' },
  { key: 'sunrise', name: 'الشروق', Icon: Sun, iconColor: 'text-amber-400' },
  { key: 'dhuhr', name: 'الظهر', Icon: Sun, iconColor: 'text-slate-500' },
  { key: 'asr', name: 'العصر', Icon: Sun, iconColor: 'text-orange-400' },
  { key: 'maghrib', name: 'المغرب', Icon: Sunset, iconColor: 'text-orange-500' },
  { key: 'isha', name: 'العشاء', Icon: Moon, iconColor: 'text-slate-600' }
];

const TAB_OFFSET = { yesterday: -1, today: 0, tomorrow: 1 };
const PLACE_KEY = 'zawawy:prayer:place';
const ADHAN_KEY = 'zawawy:prayer:adhan';

const loadPlace = () => {
  try {
    const p = JSON.parse(localStorage.getItem(PLACE_KEY));
    if (p && p.lat && p.lng && p.tz && isValidTz(p.tz)) return p;
  } catch {
    /* التخزين ممنوع أو بيانات تالفة */
  }
  return DEFAULT_PLACE;
};

const loadAdhanOn = () => {
  try {
    return localStorage.getItem(ADHAN_KEY) !== 'off';
  } catch {
    return true;
  }
};

function PrayerTimesContent() {
  const player = usePlayer();
  const [activeTab, setActiveTab] = useState('today');
  const [modal, setModal] = useState(null); // null | 'place' | 'month' | 'qibla'
  const [methodOpen, setMethodOpen] = useState(true);
  const [place, setPlace] = useState(loadPlace);
  const placeKey = placeKeyOf(place);

  /* الوقت الحالي (بيتحدّث كل ثانية) */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ---------- جلب المواقيت ---------- */
  const [months, setMonths] = useState({}); // 'lat,lng|YYYY-MM' -> days[]
  const [methods, setMethods] = useState({}); // 'lat,lng' -> { id, name }
  const [error, setError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const loaded = useRef({});

  const todayKey = dateKey(now, place.tz);
  const neededKey = neededMonths(todayKey).join(',');

  const loadMonth = useCallback(
    async (ym, signal) => {
      const key = `${placeKey}|${ym}`;
      if (loaded.current[key]) return;
      const data = await fetchMonth(place, ym, signal);
      loaded.current[key] = true;
      setMonths((prev) => ({ ...prev, [key]: data?.days ?? [] }));
      if (data?.method) setMethods((prev) => ({ ...prev, [placeKey]: data.method }));
    },
    [place, placeKey]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    setError(false);
    Promise.all(neededKey.split(',').map((ym) => loadMonth(ym, ctrl.signal))).catch((err) => {
      if (err.name === 'AbortError') return;
      console.error('API Fetch Error:', err);
      setError(true);
    });
    return () => ctrl.abort();
  }, [neededKey, loadMonth, retryTick]);

  const getMonth = useCallback((ym) => months[`${placeKey}|${ym}`], [months, placeKey]);

  // كل أيام المدينة الحالية المتحمّلة، بمفتاح التاريخ
  const byDate = useMemo(() => {
    const map = new Map();
    Object.keys(months)
      .filter((k) => k.startsWith(`${placeKey}|`))
      .forEach((k) => months[k].forEach((rec) => map.set(rec.timings?.fajr?.slice(0, 10), rec)));
    return map;
  }, [months, placeKey]);

  /* ---------- الصلاة الحالية والقادمة ---------- */
  const { next, prev, current } = computeState(byDate, now, todayKey);
  const todayRecord = byDate.get(todayKey);
  const selectedRecord = byDate.get(addDays(todayKey, TAB_OFFSET[activeTab]));
  const timings = selectedRecord?.timings ?? {};
  const isTodayTab = activeTab === 'today';

  const secs = next ? Math.max(0, Math.floor((next.t - now) / 1000)) : null;
  const timeLeft = {
    hours: secs == null ? '--' : String(Math.floor(secs / 3600)).padStart(2, '0'),
    minutes: secs == null ? '--' : String(Math.floor((secs % 3600) / 60)).padStart(2, '0'),
    seconds: secs == null ? '--' : String(secs % 60).padStart(2, '0')
  };
  const countdownText = `${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`;

  const elapsedPct = prev && next ? Math.min(100, Math.max(0, ((now - prev.t) / (next.t - prev.t)) * 100)) : 0;
  const remainingPct = Math.round(100 - elapsedPct);

  /* ---------- التاريخ في الهيدر ---------- */
  const weekday = new Intl.DateTimeFormat('ar-EG', { timeZone: place.tz, weekday: 'long' }).format(now);
  const gregorian = new Intl.DateTimeFormat('ar-EG', {
    timeZone: place.tz,
    calendar: 'gregory',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);
  const hijri = todayRecord?.hijri;
  const hijriText = hijri ? `${arDigits(hijri.day)} ${hijri.monthNameArabic} ${arDigits(hijri.year)} هـ` : '';

  /* ---------- طريقة الحساب ---------- */
  const method = methods[placeKey];
  const methodInfo = METHOD_INFO[method?.id];
  const methodName = methodInfo?.name ?? method?.name ?? 'الجهة المعتمدة';
  const placeTitle = `${place.name}${place.countryName ? `، ${place.countryName}` : ''}`;

  /* ---------- القبلة ---------- */
  const bearing = useMemo(() => qiblaBearing(Number(place.lat), Number(place.lng)), [place]);

  /* ---------- حالة كل كارت ---------- */
  const cardState = (key) => {
    if (!isTodayTab) return null;
    if (current?.offset === 0 && current.key === key) return 'current';
    if (next?.offset === 0 && next.key === key) return 'next';
    return null;
  };

  const cardSub = (key) => {
    if (!isTodayTab) return '';
    if (key === 'sunrise') return 'وقت الإشراق';
    const t = Date.parse(timings[key]);
    if (Number.isNaN(t)) return '';
    return t <= now ? 'مضت' : 'لاحقة';
  };

  /* ---------- نداء الأذان ---------- */
  const adhanRef = useRef(null);
  const firedRef = useRef(null);
  const [adhanOn, setAdhanOn] = useState(loadAdhanOn);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [adhanError, setAdhanError] = useState(false);

  const getAdhan = () => {
    if (!adhanRef.current) {
      const audio = new Audio(ADHAN_URL);
      audio.addEventListener('ended', () => setIsAdhanPlaying(false));
      audio.addEventListener('pause', () => setIsAdhanPlaying(false));
      audio.addEventListener('error', () => {
        setIsAdhanPlaying(false);
        setAdhanError(true);
      });
      adhanRef.current = audio;
    }
    return adhanRef.current;
  };

  useEffect(() => () => adhanRef.current?.pause(), []);

  const playAdhan = () => {
    if (player?.playing) player.toggle(player.surahId); // نوقف التلاوة وقت الأذان
    const audio = getAdhan();
    audio.currentTime = 0;
    return audio
      .play()
      .then(() => {
        setIsAdhanPlaying(true);
        setAdhanError(false);
      })
      .catch((err) => {
        console.error('تعذر تشغيل ملف الأذان:', err);
        setAdhanError(true);
      });
  };
  const playAdhanRef = useRef(playAdhan);
  playAdhanRef.current = playAdhan;

  const toggleAdhanAudio = () => {
    if (isAdhanPlaying) getAdhan().pause();
    else playAdhan();
  };

  const toggleAdhanOn = () => {
    const nextVal = !adhanOn;
    setAdhanOn(nextVal);
    try {
      localStorage.setItem(ADHAN_KEY, nextVal ? 'on' : 'off');
    } catch {
      /* التخزين ممنوع */
    }
  };

  // لما يحين وقت صلاة والتشغيل التلقائي مفعّل والصفحة مفتوحة، يشتغل الأذان
  useEffect(() => {
    if (!adhanOn || !prev) return;
    const age = now - prev.t;
    if (age >= 0 && age < 5000 && firedRef.current !== prev.t) {
      firedRef.current = prev.t;
      playAdhanRef.current();
    }
  }, [now, prev, adhanOn]);

  /* ---------- تغيير المدينة ---------- */
  const changePlace = (p) => {
    setPlace(p);
    setActiveTab('today');
    setError(false);
    firedRef.current = null;
    try {
      localStorage.setItem(PLACE_KEY, JSON.stringify(p));
    } catch {
      /* التخزين ممنوع */
    }
    setModal(null);
  };

  const tabBtn = (id) =>
    `px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
      activeTab === id ? 'bg-[#0f3d30] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
    }`;

  const loadingData = !todayRecord && !error;

  return (
    <div
      className="min-h-screen text-[#1e293b] font-['Cairo',sans-serif] pb-28 select-none"
      style={{ backgroundColor: C.bg }}
      dir="rtl"
    >
      <Navbar />

      {/* ============ رأس الصفحة ============ */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <div className="max-w-[460px]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1" style={{ color: C.goldText }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.gold }}></span>
              <span>التقويم الفلكي والمواقيت الشرعية</span>
            </div>
            <h1 className="text-4xl sm:text-[44px] leading-tight font-black mb-1" style={{ color: C.green }}>
              مواقيت الصلاة
            </h1>
            <p className="text-[12px] sm:text-[13px] leading-6" style={{ color: C.muted }}>
              تابع مواقيت الصلاة اليومية وفق الأفق المحلي وحسابات {methodName}.
            </p>
          </div>

          <div className="space-y-1.5 text-[12px] pb-0.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" style={{ color: C.goldText }} />
              <span className="font-bold" style={{ color: C.green }}>{placeTitle}</span>
              <button
                type="button"
                onClick={() => setModal('place')}
                className="text-[10px] font-semibold cursor-pointer hover:underline"
                style={{ color: C.goldText }}
              >
                تغيير
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5" style={{ color: C.goldText }} />
              <span>
                {weekday}
                {hijriText ? `، ${hijriText}` : ''} — {gregorian}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ البانر الرئيسي ============ */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-[#1a1208] text-white min-h-[460px] flex items-center border border-[#2d2214]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: HERO_IMAGE }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

          <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-14 min-h-[460px] items-center">
            {/* اليمين: تفاصيل الصلاة */}
            <div className="flex flex-col justify-between gap-8 text-right h-full py-4">
              <div className="inline-flex items-center gap-2 bg-black/40 border border-amber-300/30 text-amber-100 text-[11px] px-4 py-1.5 rounded-full w-fit backdrop-blur-md font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>الصلاة القادمة</span>
              </div>

              <div className="my-2">
                {error && !todayRecord ? (
                  <p className="text-xs sm:text-[13px] text-white/90 mb-2 font-medium tracking-wide">
                    تعذّر تحميل المواقيت.{' '}
                    <button
                      type="button"
                      onClick={() => setRetryTick((t) => t + 1)}
                      className="underline font-bold text-amber-300 cursor-pointer"
                    >
                      إعادة المحاولة
                    </button>
                  </p>
                ) : (
                  <p className="text-xs sm:text-[13px] text-white/90 mb-2 font-medium tracking-wide drop-shadow">
                    {next
                      ? `الفرض ${ORDINALS[next.order]} ${next.offset === 0 ? 'لهذا اليوم' : 'ليوم الغد'} • حافظوا على الصلوات`
                      : 'حافظوا على الصلوات'}
                  </p>
                )}
                <h2 className="text-5xl sm:text-7xl font-black leading-tight text-white mb-3 drop-shadow-lg">
                  {next ? `صلاة ${next.name}` : loadingData ? 'جاري التحميل...' : 'مواقيت الصلاة'}
                </h2>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-6xl sm:text-7xl font-black tracking-tight drop-shadow-lg" style={{ color: '#d6b068' }}>
                    {fmt12(next?.iso)}
                  </span>
                  <span className="text-2xl font-bold text-white/90">{period(next?.iso)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] text-white/85 w-fit drop-shadow">
                <span className="flex items-end gap-[3px] h-3.5">
                  <i className="w-[3px] h-2 bg-amber-300/90 rounded"></i>
                  <i className="w-[3px] h-3.5 bg-amber-300/90 rounded"></i>
                  <i className="w-[3px] h-2.5 bg-amber-300/90 rounded"></i>
                </span>
                <span>الصوت المعتمد: أذان الشيخ علي ملا (الحرم المكي)</span>
              </div>
            </div>

            {/* اليسار: العدّاد والتشغيل */}
            <div className="flex flex-col justify-between gap-6 text-right h-full py-4 border-t lg:border-t-0 lg:border-r border-white/10 lg:pr-8 pt-6 lg:pt-0">
              <button
                type="button"
                onClick={toggleAdhanOn}
                aria-pressed={adhanOn}
                title="يشغّل الأذان تلقائياً عند دخول وقت كل صلاة طالما الصفحة مفتوحة"
                className="inline-flex items-center gap-2 bg-black/40 border border-white/20 text-white/90 text-[11px] px-3.5 py-1.5 rounded-xl w-fit backdrop-blur-md font-semibold cursor-pointer hover:bg-black/55 transition"
              >
                {adhanOn ? <Bell className="w-3.5 h-3.5 text-amber-300" /> : <BellOff className="w-3.5 h-3.5 text-white/60" />}
                <span>{adhanOn ? 'أذان الحرم المكي مفعّل' : 'الأذان التلقائي متوقف'}</span>
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs text-white/90 mb-3 font-semibold drop-shadow">
                  <Timer className="w-4 h-4 text-amber-300" />
                  <span>الوقت المتبقي للأذان</span>
                </div>

                <div className="flex items-start gap-5 w-fit my-2" dir="ltr">
                  {[
                    { v: timeLeft.hours, l: 'ساعة' },
                    { v: timeLeft.minutes, l: 'دقيقة' },
                    { v: timeLeft.seconds, l: 'ثانية' }
                  ].map((b, i) => (
                    <React.Fragment key={b.l}>
                      {i > 0 && <span className="text-4xl font-black text-white/40 leading-[1] mt-3">:</span>}
                      <div className="text-center min-w-[64px]">
                        <span className="block text-5xl sm:text-[64px] leading-none font-black text-white tabular-nums drop-shadow-lg">
                          {b.v}
                        </span>
                        <span className="block text-[11px] text-white/80 font-bold mt-2 drop-shadow">{b.l}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-6 max-w-[360px]">
                  <div className="w-full bg-white/25 h-[4px] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full mr-0"
                      style={{ width: `${elapsedPct}%`, backgroundColor: '#d6b068' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/85 mt-2 font-medium drop-shadow">
                    <span>{prev ? `${prev.name} (${fmt12(prev.iso)} ${ampm(prev.iso)})` : ''}</span>
                    <span className="font-bold text-amber-300">
                      {prev && next ? `متبقي ${remainingPct}% من الوقت` : ''}
                    </span>
                    <span>{next ? `${next.name} (${fmt12(next.iso)} ${ampm(next.iso)})` : ''}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={toggleAdhanAudio}
                  className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer w-fit hover:text-amber-200 transition drop-shadow"
                >
                  {isAdhanPlaying ? <CirclePause className="w-5 h-5" /> : <CirclePlay className="w-5 h-5" />}
                  <span>{isAdhanPlaying ? 'إيقاف نداء الأذان' : 'استماع لنداء الأذان'}</span>
                </button>
                {adhanError && (
                  <p className="mt-1.5 text-[10px] text-amber-200">تعذّر تشغيل ملف الأذان، تأكد من رابط الملف.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ جدول الصلوات الخمس اليومي ============ */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[17px] font-black flex items-center gap-2" style={{ color: C.green }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green }}></span>
            جدول الصلوات الخمس اليومي
          </h3>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
            مواقيت شرعية معتمدة وفق الأفق المحلي
          </span>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" style={{ borderColor: C.border }}>
          {CARDS.map((c) => {
            const state = cardState(c.key);
            const isCurrent = state === 'current';
            const isNext = state === 'next';
            const sub = cardSub(c.key);
            return (
              <div
                key={c.key}
                className="p-4 min-h-[102px] flex flex-col justify-between border-l border-b lg:border-b-0 last:border-l-0"
                style={{
                  borderColor: C.border,
                  backgroundColor: isCurrent ? C.greenCard : isNext ? '#eef5f1' : '#ffffff',
                  color: isCurrent ? '#ffffff' : C.green,
                  boxShadow: isCurrent ? `inset 0 3px 0 ${C.gold}` : undefined
                }}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-[13px] font-extrabold ${isCurrent ? 'text-white' : 'text-[#1e293b]'}`}>
                    {c.name}
                  </span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[8px] bg-white/15 border border-amber-300/50 text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                      <span className="w-1 h-1 rounded-full bg-amber-300"></span>
                      الوقت الحالي
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      القادمة
                    </span>
                  )}
                  {!isCurrent && !isNext && <c.Icon className={`w-4 h-4 ${c.iconColor}`} />}
                </div>

                <div>
                  <div
                    className={`text-[28px] leading-tight font-black mt-2 ${isCurrent ? 'text-white' : ''}`}
                    style={!isCurrent ? { color: c.key === 'sunrise' ? '#6b7280' : C.green } : {}}
                  >
                    {fmt12(timings[c.key])}
                  </div>
                  <div className={`text-[10px] mt-2 font-medium ${isCurrent ? 'text-white/80' : 'text-slate-500'}`}>
                    {period(timings[c.key])}
                  </div>
                  <div className="text-[10px] mt-1.5 font-medium flex items-center gap-1">
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-white/90">
                        جارية الآن <Clock className="w-3 h-3 text-amber-300" />
                      </span>
                    ) : isNext ? (
                      <span className="flex items-center gap-1 font-bold" style={{ color: '#087c58' }}>
                        <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                        متبقي {countdownText}
                      </span>
                    ) : (
                      <span className="text-slate-500">{sub}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ القسم السفلي ============ */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* اليمين: التبويبات + طريقة الحساب */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white px-3 py-2.5 rounded-2xl border flex items-center justify-between gap-2" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-1">
              <button onClick={() => setActiveTab('yesterday')} className={tabBtn('yesterday')}>
                <ChevronRight className="w-3 h-3" />
                <span>الأمس</span>
              </button>
              <button onClick={() => setActiveTab('today')} className={tabBtn('today')}>
                اليوم
              </button>
              <button onClick={() => setActiveTab('tomorrow')} className={tabBtn('tomorrow')}>
                <span>الغد</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setModal('month')}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer border hover:bg-[#f3efe2]"
              style={{ color: C.goldText, borderColor: C.border, backgroundColor: '#faf8f2' }}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>عرض التقويم الشهري الكامل</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border text-right" style={{ borderColor: C.border }}>
            <button
              type="button"
              onClick={() => setMethodOpen((o) => !o)}
              aria-expanded={methodOpen}
              className="flex w-full items-start justify-between cursor-pointer text-right"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#f1f0ea] text-slate-600">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-[#0f172a]">طريقة الحساب والضوابط الشرعية</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {methodName} • مذهب الجمهور (الشافعي والمالكي والحنبلي)
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 mt-1 transition-transform ${methodOpen ? '' : '-rotate-90'}`} />
            </button>

            {methodOpen && (
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2 text-right pt-3 border-t px-1 mb-3" style={{ borderColor: C.border }}>
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold">زاوية الفجر:</div>
                    <div className="font-extrabold text-[#0f172a] text-[12px] mt-0.5">{methodInfo?.fajr ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold">زاوية العشاء:</div>
                    <div className="font-extrabold text-[#0f172a] text-[12px] mt-0.5">{methodInfo?.isha ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold">حساب العصر:</div>
                    <div className="font-extrabold text-[#0f172a] text-[12px] mt-0.5">ظل المثل الواحد</div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center font-medium bg-[#f7f6f1] border rounded-lg py-2.5 px-3" style={{ borderColor: C.border }}>
                  {place.country === 'EG'
                    ? 'مضبوط وفق التوقيت الصيفي/الشتوي المعتمد من مجلس الوزراء ودار الإفتاء المصرية.'
                    : 'مضبوط وفق التوقيت المحلي للمدينة المختارة (بما فيه التوقيت الصيفي/الشتوي).'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* اليسار: الأذكار + اتجاه القبلة */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="text-white p-5 rounded-2xl flex flex-col justify-between min-h-[135px]"
            style={{ backgroundColor: C.greenCard }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold" style={{ color: '#d6b068' }}>
                  من سنن ما بعد الصلاة المكتوبة
                </span>
                <Sparkles className="w-4 h-4 text-white/70" />
              </div>
              <p
                className="text-[15px] sm:text-[17px] leading-[2.1] text-right"
                style={{ fontFamily: "'Amiri','Scheherazade New',serif", color: '#efe3c3' }}
              >
                «أَسْتَغْفِرُ اللهَ (ثَلاثَاً)، اللَّهُمَّ أَنْتَ السَّلامُ وَمِنْكَ السَّلامُ، تَبَارَكْتَ يَا ذَا الجَلالِ وَالإِكْرَامِ»
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] mt-3 pt-2 border-t border-white/10 font-bold">
              <span className="text-white/80">صحيح مسلم</span>
              <Link to="/adhkar" className="flex items-center gap-1 cursor-pointer hover:underline" style={{ color: '#d6b068' }}>
                <span>مسبحة الأذكار</span>
                <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3 text-right">
              <div className="p-2.5 bg-[#f1f0ea] rounded-full" style={{ color: C.green }}>
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[12px] font-black text-[#0f172a]">
                  اتجاه القبلة: {Math.round(bearing)}° {compassName(bearing)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">نحو الكعبة المشرفة بمكة المكرمة</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModal('qibla')}
              className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer hover:opacity-70 transition"
              style={{ color: C.green }}
            >
              <span>البوصلة</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {modal === 'place' && <PlaceModal current={place} onSelect={changePlace} onClose={() => setModal(null)} />}
      {modal === 'month' && (
        <MonthModal place={place} todayKey={todayKey} getMonth={getMonth} loadMonth={loadMonth} onClose={() => setModal(null)} />
      )}
      {modal === 'qibla' && <QiblaModal bearing={bearing} place={place} onClose={() => setModal(null)} />}
    </div>
  );
}

export default function PrayerTimesPage() {
  const { tracks, reciter } = useTracks();
  const { surahs } = useSurahs();

  return (
    <PlayerProvider tracks={tracks} reciter={reciter}>
      <PrayerTimesContent />

      <div dir="rtl">
        <PlayerBar fallbackId={1} surahs={surahs} />
      </div>
    </PlayerProvider>
  );
}