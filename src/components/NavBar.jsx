import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Bookmark,
  Sun,
} from 'lucide-react';
import { usePrayerTimes } from '../api/usePrayerTimes';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isAdhkar =
    location.pathname.startsWith('/adhkar') ||
    location.pathname.startsWith('/azkar');
  const isQuran = location.pathname.startsWith('/quran');
  const isTafseer = location.pathname.startsWith('/tafseer') || location.pathname.startsWith('/tafsir');
  const isAhadith =
    location.pathname.startsWith('/ahadith') ||
    location.pathname.startsWith('/tafseerhadith');
  const isShorts = location.pathname.startsWith('/shorts');
  const prayer = usePrayerTimes(); // null لحد ما البيانات توصل
  const [searchQuery, setSearchQuery] = useState('');
  const imgRef = useRef(null);

  // تنسيق الوقت بصيغة 12 ساعة بالعربية
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const timePart = isoString.slice(11, 16);
    const [h, m] = timePart.split(':').map(Number);
    const displayHour = h % 12 || 12;
    const period = h < 12 ? 'ص' : 'م';
    return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  };

  // معالج فشل تحميل الصورة بدون حلقة لا نهائية
  const handleImgError = (e) => {
    const fallback = '/mosque.png';
    const current = e.currentTarget.getAttribute('src');
    if (current !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  // تقديم البحث عبر React Router
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
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
                ref={imgRef}
                src="/images/logo.png"
                alt="شعار الشيخ عبدالرحمن الزواوي"
                className="w-full h-full object-contain"
                onError={handleImgError}
              />
            </div>

            {/* اسم الشيخ */}
            <div className="text-right">
              <h1 className="font-sans text-xs sm:text-sm font-extrabold leading-[1.35] text-[#1b4332] text-right">
                الشيخ
                <br />
                عبدالرحمن
                <br />
                الزواوي
              </h1>
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

            <Link
              to="/quran"
              className={`${
                isQuran
                  ? 'bg-[#1b4332] text-white font-bold shadow-sm'
                  : 'text-gray-700 hover:text-[#1b4332] hover:bg-[#e2ece9]/70'
              } px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap`}
            >
              القرآن الكريم
            </Link>

            <Link
              to="/ahadith"
              className={`${
                isAhadith
                  ? 'bg-[#1b4332] text-white font-bold shadow-sm'
                  : 'text-gray-700 hover:text-[#1b4332] hover:bg-[#e2ece9]/70'
              } px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap`}
            >
              الأحاديث
            </Link>

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

            <Link
              to="/tafseer"
              className={`${
                isTafseer
                  ? 'bg-[#1b4332] text-white font-bold shadow-sm'
                  : 'text-gray-700 hover:text-[#1b4332] hover:bg-[#e2ece9]/70'
              } px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap`}
            >
              التفاسير
            </Link>

            <Link
              to="/shorts"
              className={`${
                isShorts
                  ? 'bg-[#1b4332] text-white font-bold shadow-sm'
                  : 'text-gray-700 hover:text-[#1b4332] hover:bg-[#e2ece9]/70'
              } px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap`}
            >
              خطب ومرئيات
            </Link>
          </nav>

          {/* مواقيت الصلاة والبحث والأيقونات */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto xl:flex-1 min-w-0">

            {/* التاريخ الهجري وموعد الصلاة */}
            <div className="flex items-center justify-center bg-[#e2ece9] text-[#1b4332] px-3 py-2 rounded-full text-xs font-medium border border-[#c3ded6] shadow-sm max-w-full shrink-0">
              <Sun className="w-4 h-4 text-[#d97706] ml-2 shrink-0" />

              {!prayer ? (
                <span className="animate-pulse whitespace-nowrap">
                  جاري التحميل...
                </span>
              ) : (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span>
                    {prayer.hijri?.day}{' '}
                    {prayer.hijri?.monthNameArabic}{' '}
                    {prayer.hijri?.year} هـ
                  </span>

                  <span className="text-[#a3b18a]">•</span>

                  <span className="font-bold">
                    {prayer.next?.name}: {formatTime(prayer.next?.iso)}
                  </span>
                </div>
              )}
            </div>

            {/* شريط البحث */}
            <form
              className="relative w-full sm:flex-1 xl:flex-none xl:w-[200px] 2xl:w-[260px] min-w-0"
              onSubmit={handleSearchSubmit}
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