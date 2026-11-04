
import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Menu, X } from 'lucide-react';
import { usePrayerTimes } from '../api/usePrayerTimes';
import NavSearch from '../features/Search/NavSearch';

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === '/' || pathname === '/home';

  const isAdhkar =
    pathname.startsWith('/adhkar') ||
    pathname.startsWith('/azkar');

  const isQuran = pathname.startsWith('/quran');

  const isTafseer =
    pathname === '/tafseer' ||
    pathname.startsWith('/tafseer/');

  const isAhadith =
    pathname === '/ahadith' ||
    pathname.startsWith('/ahadith/') ||
    pathname === '/tafseerhadith' ||
    pathname.startsWith('/tafseerhadith/');

  const isShorts = pathname.startsWith('/shorts');

  const prayer = usePrayerTimes();
  const imgRef = useRef(null);

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';

    const timePart = isoString.slice(11, 16);
    const [h, m] = timePart.split(':').map(Number);
    const displayHour = h % 12 || 12;
    const period = h < 12 ? 'ص' : 'م';

    return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  };

  const handleImgError = (e) => {
    const fallback = '/mosque.png';
    const current = e.currentTarget.getAttribute('src');

    if (current !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  const navLinks = [
    { to: '/', label: 'الرئيسية', active: isHome },
    { to: '/quran', label: 'القرآن الكريم', active: isQuran },
    { to: '/ahadith', label: 'الأحاديث', active: isAhadith },
    { to: '/adhkar', label: 'الأذكار', active: isAdhkar },
    { to: '/tafseer', label: 'التفاسير', active: isTafseer },
    { to: '/shorts', label: 'مقاطع قصيرة', active: isShorts },
  ];

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = (active) =>
    `${
      active
        ? 'bg-[#1b4332] text-white font-bold shadow-sm'
        : 'text-gray-700 hover:text-[#1b4332] hover:bg-[#e2ece9]/70'
    } px-3 sm:px-4 py-2.5 xl:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap`;

  return (
    <header
      className="relative z-50 w-full bg-white text-[#1f2937] border-b border-gray-200/70 font-sans"
      dir="rtl"
    >
      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-14 py-2.5 xl:py-3">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-6">

          {/* Logo + Mobile Menu Button */}
          <div className="flex items-center justify-between xl:contents">

            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-3 shrink-0 self-center xl:self-auto cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 shrink-0 flex items-center justify-center">
                <img
                  ref={imgRef}
                  src="/images/logo.webp"
                  alt="شعار الشيخ عبدالرحمن الزواوي"
                  className="w-full h-full object-contain"
                  onError={handleImgError}
                />
              </div>

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

            {/* يظهر على الموبايل فقط */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={menuOpen}
              className="xl:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-[#e2ece9] text-[#1b4332] border border-[#c3ded6] transition-colors hover:bg-[#d4e5dc]"
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

          </div>

          {/* Desktop Navigation - نفس التصميم الأصلي */}
          <nav className="hidden xl:flex flex-wrap items-center justify-center gap-1 sm:gap-2 xl:gap-1 2xl:gap-2 text-xs sm:text-sm font-semibold text-gray-700">

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={navLinkClass(link.active)}
              >
                {link.label}
              </Link>
            ))}

          </nav>

          {/* Prayer Times + Search - نفس تصميم الديسكتوب الأصلي */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-center justify-center xl:justify-end gap-2.5 xl:gap-3 w-full xl:w-auto xl:flex-1 min-w-0">

            {/* Prayer Times */}
            <div className="flex items-center justify-center bg-[#e2ece9] text-[#1b4332] px-3 py-2 rounded-full text-xs font-medium border border-[#c3ded6] shadow-sm max-w-full shrink-0 w-full sm:w-auto">

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

            {/* Search */}
            <NavSearch className="w-full sm:flex-1 xl:flex-none xl:w-[200px] 2xl:w-[260px] min-w-0" />

          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav className="xl:hidden grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-gray-100">

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={`${navLinkClass(link.active)} text-center border ${
                    link.active
                      ? 'border-[#1b4332]'
                      : 'border-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

            </nav>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;

