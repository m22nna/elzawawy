import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  BookOpen,
  Clock
} from 'lucide-react';
import { usePrayerTimes } from '../api/usePrayerTimes';
import { Link } from 'react-router-dom';

const PRAYER_ROWS = [
  ['fajr', 'الفجر'],
  ['sunrise', 'الشروق'],
  ['dhuhr', 'الظهر'],
  ['asr', 'العصر'],
  ['maghrib', 'المغرب'],
  ['isha', 'العشاء'],
];

const cleanBgImage = (url) => {
  const fallback = '/images/hero-bg.jpeg';

  if (!url) return fallback;

  let clean = url.replace(/\\/g, '/');

  if (clean.includes('/public/')) {
    clean = clean.substring(clean.indexOf('/public/') + 7);
  } else if (clean.startsWith('public/')) {
    clean = '/' + clean.substring(7);
  } else if (clean.startsWith('\\public\\')) {
    clean = '/' + clean.substring(8);
  }

  if (!clean.startsWith('/') && !clean.startsWith('http')) {
    clean = '/' + clean;
  }

  return clean;
};

const Hero = ({ bgImageUrl }) => {
  const prayer = usePrayerTimes();
  const loadingPrayers = !prayer;
  const prayerTimes = prayer
    ? Object.fromEntries(prayer.rows.map((r) => [r.key, r.iso]))
    : null;

  // مشغل التلاوة
  const [recitation, setRecitation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // جلب تلاوة سورة الكهف
  useEffect(() => {
    const fetchRecitation = async () => {
      try {
        const res = await fetch(
          'https://zawawy-api-staging.onrender.com/v1/recitations?reciter=zawawy'
        );

        if (res.ok) {
          const data = await res.json();
          const kahf = data.find((item) => item.surahId === 18);

          setRecitation(kahf || data[0]);
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات التلاوة:', err);
      }
    };

    fetchRecitation();
  }, []);

  // تشغيل وإيقاف الصوت
  const togglePlay = async () => {
    if (!recitation?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(recitation.audioUrl);

      audioRef.current.onended = () => setIsPlaying(false);

      audioRef.current.onerror = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('تعذر تشغيل التلاوة:', err);
        setIsPlaying(false);
      }
    }
  };

  // تنسيق مواقيت الصلاة
  const formatTime = (isoStr) => {
    if (!isoStr) return '--:--';

   
    const [h, m] = isoStr.slice(11, 16).split(':').map(Number);

    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'ص' : 'م'}`;
  };

  const currentBg = cleanBgImage(bgImageUrl);

  return (
    <section
      className="relative w-full bg-[#071e17] text-white overflow-hidden dir-rtl font-sans select-none"
      dir="rtl"
    >
      {/* صورة الخلفية */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentBg}
          alt="خلفية الهيرو"
          className="w-full h-full object-cover object-left md:object-center pointer-events-none"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#071e17]/95 via-[#071e17]/40 to-transparent lg:hidden pointer-events-none" />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-14 py-8 lg:py-12 min-h-[540px] lg:min-h-[600px] flex flex-col justify-between z-10">

        {/* النصوص وكارت مواقيت الصلاة */}
        <div className="flex flex-col lg:flex-row items-start justify-start gap-8 lg:gap-14 pt-2">

          {/* النصوص والأزرار */}
          <div className="max-w-xl space-y-5 text-right">


            <div className="inline-flex items-center gap-2 bg-[#0e2c22]/90 border border-[#1e523f] px-3.5 py-1.5 rounded-full text-xs text-[#86efac] shadow-sm backdrop-blur-md">
              <BookOpen className="w-3.5 h-3.5 text-[#86efac] shrink-0" />
              <span className="font-medium">
                تلاوات الشيخ عبدالرحمن الزواوي
              </span>
            </div>

            {/* العنوان */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4.1rem] font-black tracking-tight leading-[1.18] text-white drop-shadow-sm">
              أنصِت بقلبك،
              <br />
              وعِش مع
              <br />
              القرآن.
            </h1>

            {/* الوصف */}
            <p className="text-gray-200/90 text-sm sm:text-base max-w-md leading-relaxed font-normal">
              تلاوات وتدبر ومحتوى إيماني من تراث الشيخ عبدالرحمن الزواوي
              بجودة استثنائية وبصوت نقي يلامس القلوب.
            </p>

            {/* الأزرار */}
            <div className="flex flex-col gap-3 pt-2 w-full sm:w-auto items-start">

              <Link
                to="/quran"
                className="inline-flex items-center justify-center gap-3 bg-[#13372c]/90 hover:bg-[#1a4738] text-white border border-[#245b48] font-bold px-7 py-3 rounded-xl transition-all text-sm backdrop-blur-md shadow-md min-w-[210px] w-full sm:w-auto"
              >
                <span>تصفح المصحف</span>
                <BookOpen className="w-4 h-4" />
              </Link>

              <a
                href="#recitations"
                className="inline-flex items-center justify-center gap-3 bg-[#d4973b] hover:bg-[#c2862d] text-[#112d22] font-bold px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm min-w-[210px] w-full sm:w-auto"
              >
                <span>استمع للتلاوات</span>
                <Play className="w-4 h-4 fill-current" />
              </a>

            </div>
          </div>

          {/* كارت مواقيت الصلاة */}
          <div className="w-full sm:w-[270px] shrink-0 self-center lg:self-auto mt-2 lg:mt-6">
            <div className="w-full bg-[#0c241c]/80 backdrop-blur-md border border-[#1e4e3e]/70 rounded-2xl p-4 shadow-2xl text-xs space-y-2">

              {/* الهيدر */}
              <div className="flex items-center justify-between border-b border-[#1e4e3e]/60 pb-2.5 text-gray-300">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-[#d4973b]" />
                  <span>مواقيت الصلاة</span>
                </div>

                <span className="text-[11px] text-gray-400">
                  الإسكندرية
                </span>
              </div>

              {PRAYER_ROWS.map(([key, name]) => {
                const active = prayer?.next?.key === key;
                return (
                  <div
                    key={key}
                    className={
                      active
                        ? 'flex justify-between items-center bg-[#b8860b]/35 border border-[#c69234]/50 text-[#fef08a] px-3 py-1.5 rounded-lg font-bold shadow-sm'
                        : 'flex justify-between items-center py-1 px-1.5 font-medium'
                    }
                  >
                    <span className={active ? '' : 'text-gray-300'}>
                      {active ? `• ${name} (التالية)` : name}
                    </span>
                    <span className={active ? '' : 'text-white font-semibold'}>
                      {formatTime(prayerTimes?.[key])}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>
        </div>


        <div className="mt-8 lg:mt-6 w-full max-w-[600px] self-center lg:translate-x-[-70px]">

          {/* Glassmorphism Audio Player */}
          {/* <div className="relative overflow-hidden bg-[#0a1e17]/35 backdrop-blur-xl border border-white/15 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-1 ring-white/5 transition-all duration-300 hover:bg-[#0a1e17]/45 hover:border-white/20"> */}
<div className="relative overflow-hidden bg-white/[0.035] backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/[0.04] transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15 ">
            <div
              className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none rounded-2xl"
              aria-hidden="true"
            />

            {/* بيانات التلاوة والتحكم */}
            <div className="relative z-10 flex items-center gap-3 min-w-0">

              {/* زرار التشغيل */}
              <button
                onClick={togglePlay}
                disabled={!recitation?.audioUrl}
                aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
                className="w-10 h-10 bg-white text-[#0a1e17] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* موجات الصوت */}
              <div
                className="flex items-center gap-1 h-5 px-1 shrink-0"
                aria-hidden="true"
              >
                <span
                  className={`w-1 bg-[#d4973b] rounded-full transition-all ${
                    isPlaying ? 'h-5 animate-pulse' : 'h-3'
                  }`}
                />

                <span
                  className={`w-1 bg-[#d4973b] rounded-full transition-all ${
                    isPlaying ? 'h-3 animate-bounce' : 'h-5'
                  }`}
                />

                <span
                  className={`w-1 bg-[#d4973b] rounded-full transition-all ${
                    isPlaying ? 'h-5 animate-pulse' : 'h-2'
                  }`}
                />

                <span
                  className={`w-1 bg-[#d4973b] rounded-full transition-all ${
                    isPlaying ? 'h-2 animate-bounce' : 'h-4'
                  }`}
                />

                <span
                  className={`w-1 bg-[#d4973b] rounded-full transition-all ${
                    isPlaying ? 'h-4 animate-pulse' : 'h-3'
                  }`}
                />
              </div>

              {/* عنوان التلاوة */}
              <div className="text-right min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                  {recitation?.surahName || 'سورة الكهف'} – تلاوة خاشعة
                </h2>

                <p className="text-[11px] text-gray-200/80 mt-0.5 truncate">
                  الشيخ عبدالرحمن الزواوي
                </p>
              </div>
            </div>

            {/* الجودة وأيقونة الصوت */}
            <div className="relative z-10 flex items-center gap-2 shrink-0">
              <span className="bg-white/10 border border-white/15 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-200 backdrop-blur-sm">
                HQ
              </span>

              <Volume2 className="w-4 h-4 text-[#d4973b]" />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;