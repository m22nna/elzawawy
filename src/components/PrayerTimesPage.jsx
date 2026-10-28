import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  Compass, 
  Calendar,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  Timer,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  PlayCircle,
  SlidersHorizontal,
  MapPin,
  CalendarDays
} from 'lucide-react';
import Navbar from './NavBar';

/* ---------- أدوات الوقت (نظام 12 ساعة) ---------- */
const parseHM = (iso) => {
  const m = /T(\d{2}):(\d{2})/.exec(iso || '');
  return m ? { h: parseInt(m[1], 10), m: parseInt(m[2], 10) } : null;
};

const fmt12 = (iso) => {
  const t = parseHM(iso);
  if (!t) return '--:--';
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${String(h12).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
};

const period = (iso) => {
  const t = parseHM(iso);
  if (!t) return '';
  return t.h >= 12 ? 'مساءً' : 'صباحاً';
};

/* ---------- الألوان ---------- */
const C = {
  bg: '#f7f6f1',
  green: '#0f3d30',
  greenCard: '#175040',
  greenBtn: '#0b3a2e',
  gold: '#c9a45c',
  goldText: '#b98f3e',
  border: '#e6e3da',
  muted: '#6b7280'
};

const PrayerTimesPage = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: '01', minutes: '25', seconds: '33' });
  const [activeTab, setActiveTab] = useState('today');
  const [prayerData, setPrayerData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [adhanAudio] = useState(new Audio('https://islamic-audio.org/adhan/makkah.mp3'));

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const params = new URLSearchParams({
          latitude: '30.0444',
          longitude: '31.2357',
          month: '2026-10',
          timezone: 'Africa/Cairo',
          country: 'EG'
        });

        const res = await fetch(`https://zawawy-api-staging.onrender.com/v1/prayer-times?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPrayerData(data);
        } else {
          console.error("فشل في استجابة الخادم:", res.status);
        }
      } catch (err) {
        console.error('API Fetch Error:', err);
      }
    };

    fetchPrayerTimes();
  }, []);

  const todayRecord = prayerData?.days?.[24] || prayerData?.days?.[0];
  const timings = todayRecord?.timings || {
    fajr: '',
    sunrise: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: ''
  };
  const methodName = prayerData?.method?.name || 'الهيئة المصرية العامة للمساحة';

  const toggleAdhanAudio = () => {
    if (isAdhanPlaying) {
      adhanAudio.pause();
      setIsAdhanPlaying(false);
    } else {
      adhanAudio.play().then(() => {
        setIsAdhanPlaying(true);
      }).catch(err => console.error("تعذر تشغيل ملف الأذان:", err));
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setHours(15, 15, 0);
      let diff = Math.floor((target.getTime() - now.getTime()) / 1000);
      if (diff < 0) diff += 24 * 3600;
      setTimeLeft({
        hours: String(Math.floor(diff / 3600)).padStart(2, '0'),
        minutes: String(Math.floor((diff % 3600) / 60)).padStart(2, '0'),
        seconds: String(diff % 60).padStart(2, '0')
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cards = [
    { key: 'fajr', name: 'الفجر', Icon: Sunrise, iconColor: 'text-slate-500', sub: 'مضت' },
    { key: 'sunrise', name: 'الشروق', Icon: Sun, iconColor: 'text-amber-400', sub: 'وقت الإشراق' },
    { key: 'dhuhr', name: 'الظهر', Icon: Sun, iconColor: 'text-slate-500', sub: 'مضت' },
    { key: 'asr', name: 'العصر', state: 'current' },
    { key: 'maghrib', name: 'المغرب', state: 'next' },
    { key: 'isha', name: 'العشاء', Icon: Moon, iconColor: 'text-slate-600', sub: 'لاحقة' }
  ];

  const tabBtn = (id, label, extra = '') =>
    `px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${extra} ${
      activeTab === id ? 'bg-[#0f3d30] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
    }`;

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
              <span className="font-bold" style={{ color: C.green }}>القاهرة، جمهورية مصر العربية</span>
              <span className="text-[10px] font-semibold cursor-pointer hover:underline" style={{ color: C.goldText }}>
                تغيير
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5" style={{ color: C.goldText }} />
              <span>الخميس، ١٤ ربيع الأول ١٤٤٧ هـ — ٢٥ سبتمبر ٢٠٢٥ م</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ البانر الرئيسي الطويل (مطابق لخلفية الصورة الرمضانية) ============ */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-[#1a1208] text-white min-h-[460px] flex items-center border border-[#2d2214]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/images/moshaf.jpeg')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

          <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-14 min-h-[460px] items-center">
            {/* اليمين: تفاصيل الصلاة */}
            <div className="flex flex-col justify-between gap-8 text-right h-full py-4">
              <div className="inline-flex items-center gap-2 bg-black/50 border border-amber-300/40 text-amber-100 text-[11px] px-4 py-1.5 rounded-full w-fit backdrop-blur-md font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>الصلاة القادمة</span>
              </div>

              <div className="my-2">
                <p className="text-xs sm:text-[13px] text-white/90 mb-2 font-medium tracking-wide">
                  الفرض الرابع لهذا اليوم • حافظوا على الصلوات
                </p>
                <h2 className="text-5xl sm:text-7xl font-black leading-tight text-white mb-3">
                  صلاة العصر
                </h2>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-6xl sm:text-7xl font-black tracking-tight" style={{ color: '#d6b068' }}>
                    {fmt12(timings.asr)}
                  </span>
                  <span className="text-2xl font-bold text-white/90">{period(timings.asr)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] text-white/85 bg-black/40 w-fit px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
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
              <div className="inline-flex items-center gap-2 bg-black/40 border border-white/20 text-white/90 text-[11px] px-3.5 py-1.5 rounded-xl w-fit backdrop-blur-md font-semibold">
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                <span>أذان الحرم المكي مفعّل</span>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-white/90 mb-3 font-semibold">
                  <Timer className="w-4 h-4 text-amber-300" />
                  <span>الوقت المتبقي للأذان ⏳</span>
                </div>

                <div className="flex items-start gap-4 w-fit my-2" dir="ltr">
                  {[
                    { v: timeLeft.hours, l: 'ساعة' },
                    { v: timeLeft.minutes, l: 'دقيقة' },
                    { v: timeLeft.seconds, l: 'ثانية' }
                  ].map((b, i) => (
                    <React.Fragment key={b.l}>
                      {i > 0 && <span className="text-4xl font-black text-white/50 leading-[1] mt-3">:</span>}
                      <div className="text-center bg-black/40 border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm min-w-[75px]">
                        <span className="block text-5xl sm:text-[60px] leading-none font-black text-white">{b.v}</span>
                        <span className="block text-[11px] text-white/80 font-bold mt-2">{b.l}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-6 max-w-[360px]">
                  <div className="w-full bg-white/20 h-[4px] rounded-full overflow-hidden">
                    <div className="h-full w-[34%] rounded-full mr-0" style={{ backgroundColor: '#d6b068' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/85 mt-2 font-medium">
                    <span>الظهر ({fmt12(timings.dhuhr)} {period(timings.dhuhr) === 'مساءً' ? 'م' : 'ص'})</span>
                    <span className="font-bold text-amber-300">متبقي 66% من الوقت</span>
                    <span>العصر ({fmt12(timings.asr)} {period(timings.asr) === 'مساءً' ? 'م' : 'ص'})</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={toggleAdhanAudio}
                className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer w-fit bg-[#0f3d30] hover:bg-[#175040] border border-emerald-500/30 px-5 py-2.5 rounded-xl transition shadow-lg mt-2"
              >
                <PlayCircle className="w-5 h-5 text-amber-300" />
                <span>{isAdhanPlaying ? "إيقاف نداء الأذان" : "استماع لنداء الأذان"}</span>
              </button>
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
          {cards.map((c) => {
            const isCurrent = c.state === 'current';
            const isNext = c.state === 'next';
            return (
              <div
                key={c.key}
                className="p-4 min-h-[102px] flex flex-col justify-between border-l border-b lg:border-b-0 last:border-l-0"
                style={{
                  borderColor: C.border,
                  backgroundColor: isCurrent ? C.greenCard : isNext ? '#eef5f1' : '#ffffff',
                  color: isCurrent ? '#ffffff' : C.green
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
                  {c.Icon && <c.Icon className={`w-4 h-4 ${c.iconColor}`} />}
                </div>

                <div>
                  <div className={`text-[28px] leading-tight font-black mt-2 ${isCurrent ? 'text-white' : ''}`} style={!isCurrent ? { color: c.key === 'sunrise' ? '#6b7280' : C.green } : {}}>
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
                        متبقي 01:25:34
                      </span>
                    ) : (
                      <span className="text-slate-500">{c.sub}</span>
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
              <button onClick={() => setActiveTab('today')} className={tabBtn('today', '', '')}>
                اليوم
              </button>
              <button onClick={() => setActiveTab('tomorrow')} className={tabBtn('tomorrow')}>
                <span>الغد</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <button
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer border"
              style={{ color: C.goldText, borderColor: C.border, backgroundColor: '#faf8f2' }}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>عرض التقويم الشهري الكامل</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border text-right" style={{ borderColor: C.border }}>
            <div className="flex items-start justify-between mb-4">
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
              <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-right pt-3 border-t px-1 mb-3" style={{ borderColor: C.border }}>
              <div>
                <div className="text-slate-400 text-[10px] font-semibold">زاوية الفجر:</div>
                <div className="font-extrabold text-[#0f172a] text-[12px] mt-0.5">19.5°</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-semibold">زاوية العشاء:</div>
                <div className="font-extrabold text-[#0f172a] text-[12px] mt-0.5">17.5°</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-semibold">حساب العصر:</div>
                <div className="font-extrabold text-[#0f172a] text-[12px] mt-0.5">ظل المثل الواحد</div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-medium bg-[#f7f6f1] border rounded-lg py-2.5 px-3" style={{ borderColor: C.border }}>
              مضبوط وفق التوقيت الصيفي/الشتوي المعتمد من مجلس الوزراء ودار الإفتاء المصرية.
            </p>
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
              <button className="flex items-center gap-1 cursor-pointer hover:underline" style={{ color: '#d6b068' }}>
                <span>مسبحة الأذكار</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3 text-right">
              <div className="p-2.5 bg-[#f1f0ea] rounded-full" style={{ color: C.green }}>
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[12px] font-black text-[#0f172a]">اتجاه القبلة: 136° جنوب الشرق</div>
                <div className="text-[10px] text-slate-500 font-medium">نحو الكعبة المشرفة بمكة المكرمة</div>
              </div>
            </div>

            <button className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer hover:opacity-70 transition" style={{ color: C.green }}>
              <span>البوصلة</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============ مشغل الصوت السفلي ============ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50" style={{ borderColor: C.border }}>
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.green }}>
              <span className="flex items-center gap-[2px] h-4">
                <i className="w-[2px] h-2 bg-white rounded"></i>
                <i className="w-[2px] h-4 bg-white rounded"></i>
                <i className="w-[2px] h-3 bg-white rounded"></i>
                <i className="w-[2px] h-2 bg-white rounded"></i>
              </span>
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#0f172a]">سورة الفاتحة - تلاوة خاشعة</div>
              <div className="text-[10px] text-slate-500">الشيخ عبد الرحمن الزواوي</div>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center flex-1 max-w-md mx-4">
            <div className="flex items-center gap-4 mb-1" dir="ltr">
              <button className="text-slate-500 hover:text-slate-900 cursor-pointer"><SkipBack className="w-4 h-4" /></button>
              <button className="text-slate-500 hover:text-slate-900 cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer shadow"
                style={{ backgroundColor: C.green }}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button className="text-slate-500 hover:text-slate-900 cursor-pointer"><RotateCw className="w-4 h-4" /></button>
              <button className="text-slate-500 hover:text-slate-900 cursor-pointer"><SkipForward className="w-4 h-4" /></button>
            </div>
            
            <div className="w-full flex items-center gap-2 text-[9px] text-slate-400">
              <span>00:45</span>
              <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden cursor-pointer">
                <div className="h-full w-[35%] rounded-full" style={{ backgroundColor: '#d9a441' }}></div>
              </div>
              <span>02:18</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs" dir="ltr">
            <div className="hidden sm:block w-10 h-1 rounded-full mr-1" style={{ backgroundColor: C.green }}></div>
            <Volume2 className="w-4 h-4 text-slate-600 cursor-pointer" />
            <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">1.0x</span>
            <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">FLAC 24-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesPage;