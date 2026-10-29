import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, LocateFixed, MapPin, Search, X } from 'lucide-react';
import {
  COUNTRY_BY_TZ,
  PLACES,
  TABLE_COLS,
  ampm,
  arDigits,
  compassName,
  fmt12,
  monthLabel,
  placeKeyOf,
  shiftMonth
} from './prayerUtils';

const GREEN = '#0f3d30';
const GOLD = '#b98f3e';
const BORDER = '#e6e3da';

function Modal({ title, onClose, wide = false, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      dir="rtl"
      onClick={onClose}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4 backdrop-blur-sm font-['Cairo',sans-serif]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
          wide ? 'max-w-[1000px]' : 'max-w-[460px]'
        }`}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: BORDER }}>
          <h3 className="text-[15px] font-black" style={{ color: GREEN }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-[#f1f0ea]"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ================= اختيار المدينة ================= */
export function PlaceModal({ current, onSelect, onClose }) {
  const [q, setQ] = useState('');
  const [geo, setGeo] = useState('idle'); // idle | loading | denied | unsupported

  const term = q.trim();
  const list = PLACES.filter((p) => !term || `${p.name} ${p.countryName}`.includes(term));

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeo('unsupported');
      return;
    }
    setGeo('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';
        onSelect({
          id: 'mine',
          name: 'موقعي الحالي',
          countryName: '',
          country: COUNTRY_BY_TZ[tz] ?? '',
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
          tz
        });
      },
      () => setGeo('denied'),
      { timeout: 10000 }
    );
  };

  return (
    <Modal title="تغيير المدينة" onClose={onClose}>
      <div className="space-y-3 overflow-y-auto p-5">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geo === 'loading'}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-extrabold text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          <LocateFixed size={16} />
          {geo === 'loading' ? 'جاري تحديد موقعك...' : 'استخدام موقعي الحالي'}
        </button>
        {geo === 'denied' && (
          <p className="text-center text-[11px] text-red-600">لم يتم السماح بتحديد الموقع، اختر مدينتك من القائمة.</p>
        )}
        {geo === 'unsupported' && (
          <p className="text-center text-[11px] text-red-600">المتصفح لا يدعم تحديد الموقع، اختر مدينتك من القائمة.</p>
        )}

        <label className="flex items-center gap-2 rounded-xl border bg-[#faf8f2] px-3 py-2.5" style={{ borderColor: BORDER }}>
          <Search size={14} className="text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مدينة..."
            aria-label="بحث عن مدينة"
            className="w-full bg-transparent text-[12px] outline-none placeholder:text-slate-400"
          />
        </label>

        <ul className="space-y-1.5">
          {list.map((p) => {
            const active = placeKeyOf(p) === placeKeyOf(current);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-right transition ${
                    active ? 'bg-[#e2ece9]' : 'bg-white hover:bg-[#f7f6f1]'
                  }`}
                  style={{ borderColor: active ? GREEN : BORDER }}
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin size={14} style={{ color: GOLD }} />
                    <span className="text-[13px] font-bold text-[#0f172a]">{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.countryName}</span>
                  </span>
                  {active && <Check size={15} style={{ color: GREEN }} />}
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="py-6 text-center text-[12px] text-slate-500">لا توجد مدينة بهذا الاسم</li>}
        </ul>
      </div>
    </Modal>
  );
}

/* ================= التقويم الشهري ================= */
export function MonthModal({ place, todayKey, getMonth, loadMonth, onClose }) {
  const [ym, setYm] = useState(todayKey.slice(0, 7));
  const [failed, setFailed] = useState(false);
  const todayRow = useRef(null);
  const days = getMonth(ym);

  useEffect(() => {
    if (days) return;
    setFailed(false);
    loadMonth(ym).catch(() => setFailed(true));
  }, [ym, days, loadMonth]);

  useEffect(() => {
    todayRow.current?.scrollIntoView({ block: 'center' });
  }, [days]);

  return (
    <Modal title={`التقويم الشهري — ${place.name}`} onClose={onClose} wide>
      <div className="flex items-center justify-between px-5 py-3" dir="rtl">
        <button
          type="button"
          onClick={() => setYm(shiftMonth(ym, -1))}
          className="flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold hover:bg-[#f7f6f1]"
          style={{ borderColor: BORDER, color: GREEN }}
        >
          <ChevronRight size={13} />
          الشهر السابق
        </button>
        <span className="text-[14px] font-black" style={{ color: GREEN }}>
          {monthLabel(ym)}
        </span>
        <button
          type="button"
          onClick={() => setYm(shiftMonth(ym, 1))}
          className="flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold hover:bg-[#f7f6f1]"
          style={{ borderColor: BORDER, color: GREEN }}
        >
          الشهر التالي
          <ChevronLeft size={13} />
        </button>
      </div>

      <div className="min-h-[200px] overflow-auto px-5 pb-5">
        {failed ? (
          <div className="py-12 text-center">
            <p className="text-[12px] text-red-600">تعذّر تحميل مواقيت هذا الشهر.</p>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                loadMonth(ym).catch(() => setFailed(true));
              }}
              className="mt-3 cursor-pointer rounded-lg px-5 py-2 text-[11px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : !days ? (
          <p className="animate-pulse py-12 text-center text-[12px] text-slate-500">جاري التحميل...</p>
        ) : (
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-center text-[12px]">
            <thead>
              <tr>
                <th className="sticky top-0 bg-white px-2 py-2 text-right text-[11px] font-extrabold text-slate-500">اليوم</th>
                {TABLE_COLS.map((c) => (
                  <th key={c.key} className="sticky top-0 bg-white px-2 py-2 text-[11px] font-extrabold" style={{ color: GREEN }}>
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((rec) => {
                const d = rec.timings?.fajr?.slice(0, 10);
                const isToday = d === todayKey;
                const fajrMs = Date.parse(rec.timings?.fajr);
                const weekday = Number.isNaN(fajrMs)
                  ? ''
                  : new Intl.DateTimeFormat('ar-EG', { weekday: 'long', timeZone: place.tz }).format(fajrMs);
                return (
                  <tr key={d} ref={isToday ? todayRow : null} className={isToday ? 'bg-[#e2ece9]' : 'odd:bg-[#faf8f2]'}>
                    <td className="whitespace-nowrap rounded-r-lg px-2 py-2 text-right">
                      <span className="font-extrabold text-[#0f172a]">{arDigits(Number(d?.slice(8, 10)))}</span>{' '}
                      <span className="text-[10px] text-slate-500">{weekday}</span>
                      {rec.hijri && (
                        <span className="block text-[9px] text-slate-400">
                          {arDigits(rec.hijri.day)} {rec.hijri.monthNameArabic}
                        </span>
                      )}
                    </td>
                    {TABLE_COLS.map((c, i) => (
                      <td
                        key={c.key}
                        className={`whitespace-nowrap px-2 py-2 font-bold ${i === TABLE_COLS.length - 1 ? 'rounded-l-lg' : ''}`}
                        style={{ color: c.key === 'sunrise' ? '#6b7280' : GREEN }}
                      >
                        {fmt12(rec.timings?.[c.key])} <span className="text-[9px] font-medium text-slate-500">{ampm(rec.timings?.[c.key])}</span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}

/* ================= البوصلة ================= */
const norm180 = (deg) => ((((deg % 360) + 540) % 360) - 180);

export function QiblaModal({ bearing, place, onClose }) {
  const [status, setStatus] = useState('idle'); // idle | active | denied | nosensor
  const [heading, setHeading] = useState(null);
  const gotReading = useRef(false);
  const cleanup = useRef(() => {});

  useEffect(() => () => cleanup.current(), []);

  const start = async () => {
    try {
      // iOS بيطلب إذن صريح لحساس الاتجاه
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') {
          setStatus('denied');
          return;
        }
      }
    } catch {
      setStatus('denied');
      return;
    }

    const onOri = (e) => {
      let h = null;
      if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading; // iOS
      else if (e.absolute && typeof e.alpha === 'number') h = (360 - e.alpha) % 360; // أندرويد (مطلق ناحية الشمال)
      if (h != null) {
        gotReading.current = true;
        setHeading(h);
        setStatus('active');
      }
    };
    window.addEventListener('deviceorientationabsolute', onOri, true);
    window.addEventListener('deviceorientation', onOri, true);
    const timer = setTimeout(() => {
      if (!gotReading.current) setStatus('nosensor');
    }, 2500);
    cleanup.current = () => {
      clearTimeout(timer);
      window.removeEventListener('deviceorientationabsolute', onOri, true);
      window.removeEventListener('deviceorientation', onOri, true);
    };
  };

  const live = status === 'active' && heading != null;
  const delta = live ? norm180(bearing - heading) : null;
  const aligned = live && Math.abs(delta) <= 5;
  const rotation = live ? -heading : 0;

  const R = 112;
  const cardinal = [
    { t: 'ش', a: 0 },
    { t: 'شر', a: 90 },
    { t: 'ج', a: 180 },
    { t: 'غ', a: 270 }
  ];
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <Modal title="اتجاه القبلة" onClose={onClose}>
      <div className="overflow-y-auto p-5 text-center">
        <p className="text-[13px] font-black text-[#0f172a]">
          {Math.round(bearing)}° {compassName(bearing)}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500">من {place.name} نحو الكعبة المشرفة بمكة المكرمة</p>

        <div className="relative mx-auto mt-4 h-[260px] w-[260px]">
          {/* مؤشر ثابت: اتجاه أعلى الهاتف */}
          <div
            className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2"
            style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `12px solid ${aligned ? '#087c58' : GREEN}` }}
          />
          <svg viewBox="0 0 260 260" className="h-full w-full" role="img" aria-label="بوصلة القبلة">
            <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '130px 130px', transition: 'transform 0.15s linear' }}>
              <circle cx="130" cy="130" r={R + 8} fill="#faf8f2" stroke={aligned ? '#087c58' : BORDER} strokeWidth={aligned ? 4 : 2} />
              {ticks.map((a) => (
                <line
                  key={a}
                  x1="130"
                  y1={130 - (R + 6)}
                  x2="130"
                  y2={130 - (R - (a % 90 === 0 ? 10 : a % 30 === 0 ? 6 : 3))}
                  stroke="#9ca3af"
                  strokeWidth={a % 90 === 0 ? 2 : 1}
                  transform={`rotate(${a} 130 130)`}
                />
              ))}
              {cardinal.map((c) => (
                <text
                  key={c.t}
                  x={130 + 84 * Math.sin((c.a * Math.PI) / 180)}
                  y={130 - 84 * Math.cos((c.a * Math.PI) / 180) + 5}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="800"
                  fill={c.a === 0 ? '#c4320a' : GREEN}
                >
                  {c.t}
                </text>
              ))}
              {/* سهم القبلة */}
              <g transform={`rotate(${bearing} 130 130)`}>
                <line x1="130" y1="130" x2="130" y2="40" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
                <path d="M130 22 L118 46 L142 46 Z" fill={GOLD} />
              </g>
              <circle cx="130" cy="130" r="6" fill={GREEN} />
            </g>
          </svg>
        </div>

        <div className="mt-3 min-h-[44px] text-[11px]">
          {aligned && <p className="font-extrabold text-[#087c58]">أنت متجه نحو القبلة ✓</p>}
          {live && !aligned && (
            <p className="font-bold text-slate-600">
              لفّ الهاتف {Math.abs(Math.round(delta))}° {delta > 0 ? 'يميناً' : 'يساراً'}
            </p>
          )}
          {status === 'nosensor' && (
            <p className="text-slate-600">جهازك لا يوفّر حساس الاتجاه، فالزاوية الظاهرة مقاسة من الشمال. جرّب من هاتفك.</p>
          )}
          {status === 'denied' && <p className="text-red-600">لم يتم السماح باستخدام حساس الاتجاه.</p>}
          {status === 'idle' && (
            <p className="text-slate-500">فعّل بوصلة الهاتف ليتحرك السهم مع اتجاهك، أو اتجه نحو الزاوية الموضحة.</p>
          )}
        </div>

        {status !== 'active' && (
          <button
            type="button"
            onClick={start}
            className="mt-2 cursor-pointer rounded-xl px-6 py-2.5 text-[12px] font-extrabold text-white"
            style={{ backgroundColor: GREEN }}
          >
            تفعيل بوصلة الهاتف
          </button>
        )}
      </div>
    </Modal>
  );
}