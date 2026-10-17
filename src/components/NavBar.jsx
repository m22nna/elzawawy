import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Bookmark,
  Sun,
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isAdhkar = location.pathname.startsWith('/adhkar') || location.pathname.startsWith('/azkar');

  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // جلب مواقيت الصلاة والتاريخ الهجري
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const lat = 31.2001;
        const lng = 29.9187;

        const response = await fetch(
          // `https://zawawy-api-staging.onrender.com/v1/prayer-times?latitude=${lat}&longitude=${lng}`
          `/v1/prayer-times?latitude=31.2001&longitude=29.9187`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.days && data.days.length > 0) {
            setPrayerData(data.days[0]);
          }
        }
      } catch (error) {
        console.error('خطأ في جلب مواقيت الصلاة:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  // تنسيق الوقت
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';

    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';

    hours = hours % 12 || 12;

    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <header
      className="relative z-50 w-full bg-white text-[#1f2937] border-b border-gray-200/70 font-sans"
      dir="rtl"
    >
      {/* الحاوية الرئيسية: بعرض الشاشة بالكامل */}
      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-14 py-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-6">

          {/* اللوجو واسم الشيخ */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 self-center xl:self-auto cursor-pointer"
          >
            {/* مكان صورة اللوجو */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 shrink-0 flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="شعار الشيخ عبدالرحمن الزواوي"
                className="w-full h-full object-contain"
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + '/mosque.png') {
                    e.currentTarget.src = '/mosque.png';
                  }
                }}
              />
            </div>

            {/* اسم الشيخ */}
            <div className="text-right">
              <h1 className="text-lg sm:text-xl 2xl:text-2xl font-extrabold tracking-tight text-[#1a382b] flex items-center gap-1.5 whitespace-nowrap">
                <span>الشيخ</span>
                <span className="text-[#15803d]">عبدالرحمن</span>
                <span>الزواوي</span>
              </h1>

              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">
                موقع القارئ الرسمي
              </p>
            </div>
          </Link>

          {/* روابط التنقل الرئيسية */}
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 xl:gap-1 2xl:gap-2 text-xs sm:text-sm font-semibold text-gray-700">
            <Link
              to="/"
              className={`${
                isHome
                  ? 'bg-[#1b4332] text-white font-bold shadow-sm'
                  : 'text-gray-700 hover:text-[#1b4332] hover:bg-[#e2ece9]/70'
              } px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap`}
            >
              الرئيسية
            </Link>

            <a
              href="/#quran"
              className="px-2.5 sm:px-3 py-2 hover:text-[#1b4332] hover:bg-[#e2ece9]/70 transition-colors rounded-lg whitespace-nowrap"
            >
              القرآن الكريم
            </a>

            <a
              href="/#hadith"
              className="px-2.5 sm:px-3 py-2 hover:text-[#1b4332] hover:bg-[#e2ece9]/70 transition-colors rounded-lg whitespace-nowrap"
            >
              الأحاديث
            </a>

            <Link
              to="/adhkar"
              className={`${
                isAdhkar
                  ? 'bg-[#1b4332] text-white font-bold shadow-sm'
                  : 'text-gray-700 hover:text-[#1b4332] hover:bg-[#e2ece9]/70'
              } px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap`}
            >
              الأذكار
            </Link>

            <a
              href="/#tafsir"
              className="px-2.5 sm:px-3 py-2 hover:text-[#1b4332] hover:bg-[#e2ece9]/70 transition-colors rounded-lg whitespace-nowrap"
            >
              التفاسير
            </a>

            <a
              href="/#speeches"
              className="px-2.5 sm:px-3 py-2 hover:text-[#1b4332] hover:bg-[#e2ece9]/70 transition-colors rounded-lg whitespace-nowrap"
            >
              خطب ومرئيات
            </a>
          </nav>

          {/* مواقيت الصلاة والبحث والأيقونات */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto xl:flex-1 min-w-0">

            {/* التاريخ الهجري وموعد الصلاة */}
            <div className="flex items-center justify-center bg-[#e2ece9] text-[#1b4332] px-3 py-2 rounded-full text-xs font-medium border border-[#c3ded6] shadow-sm max-w-full shrink-0">
              <Sun className="w-4 h-4 text-[#d97706] ml-2 shrink-0" />

              {loading ? (
                <span className="animate-pulse whitespace-nowrap">
                  جاري التحميل...
                </span>
              ) : prayerData ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span>
                    {prayerData.hijri?.day}{' '}
                    {prayerData.hijri?.monthNameArabic}{' '}
                    {prayerData.hijri?.year} هـ
                  </span>

                  <span className="text-[#a3b18a]">•</span>

                  <span className="font-bold">
                    العصر: {formatTime(prayerData.timings?.asr)}
                  </span>
                </div>
              ) : (
                <span className="whitespace-nowrap">
                  مواقيت الصلاة غير متاحة
                </span>
              )}
            </div>

            {/* شريط البحث */}
            <form
              className="relative w-full sm:flex-1 xl:flex-none xl:w-[200px] 2xl:w-[260px] min-w-0"
              onSubmit={(e) => {
                e.preventDefault();

                if (searchQuery.trim()) {
                  window.location.hash =
                    `search?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سورة، آية، حديث..."
                aria-label="البحث في الموقع"
                className="w-full bg-[#eeeef0] text-gray-800 text-xs rounded-full pr-10 pl-4 py-2.5 border border-transparent focus:border-[#1b4332] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400"
              />

              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            {/* الأيقونات التفاعلية */}
            <div className="flex items-center justify-center gap-2 shrink-0">
              <button
                type="button"
                aria-label="الإشعارات"
                className="p-2.5 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-[#e2ece9] hover:text-[#1b4332] transition-colors shadow-sm"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                type="button"
                aria-label="المحفوظات"
                className="p-2.5 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-[#e2ece9] hover:text-[#1b4332] transition-colors shadow-sm"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
