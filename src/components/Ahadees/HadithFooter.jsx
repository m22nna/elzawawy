import React, { useState } from 'react';
import { RefreshCw, Bookmark, Sparkles } from 'lucide-react';
import { arNum } from '../../features/Quran/utils';

const DEFAULT_BG = "url('/images/prayer-bg.png')";
const STRIP_KEY = 'zawawy:hadiths:strip';

const readClosed = () => {
  try {
    return localStorage.getItem(STRIP_KEY) === 'closed';
  } catch {
    return false;
  }
};

const HadithFooter = ({ onDiscover, onBrowseAll, total = 0, savedCount = 0, onShowSaved }) => {
  const [stripOpen, setStripOpen] = useState(() => !readClosed());

  const closeStrip = () => {
    setStripOpen(false);
    try {
      localStorage.setItem(STRIP_KEY, 'closed');
    } catch {
      /* التخزين ممنوع */
    }
  };

  return (
    <footer className="bg-[#FAF9F6] px-4 pb-10 pt-10 md:px-8 text-[#2C3E35]">
      <div className="max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>

        {/* ===== بانر اكتشف حديثاً ===== */}
        <div
          className="relative w-full rounded-3xl overflow-hidden min-h-[200px] flex items-center p-6 md:p-10 shadow-sm border border-[#2D2214]/20 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to left, rgba(20, 15, 8, 0.35) 0%, rgba(30, 20, 10, 0.5) 55%, rgba(10, 10, 10, 0.75) 100%), ${DEFAULT_BG}`,
          }}
        >
          <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6" dir="rtl">
            <div className="text-right text-white space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-[#E3C878] text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ومضة نبوية يومية</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow">
                اكتشف حديثًا جديدًا وتدبّر في معانيه
              </h2>

              <p className="text-xs md:text-sm text-amber-50/85 leading-7 drop-shadow">
                استعرض حديثاً من مكتبة الأحاديث مع مصدره وشرحه الموجز، واجعله زادك اليومي في مسيرتك الإيمانية.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={onDiscover}
                className="bg-[#D4AE5E] hover:bg-[#C69C3A] text-[#1A2E23] font-extrabold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>اكتشف حديثًا الآن</span>
              </button>

              <button
                onClick={onBrowseAll}
                className="bg-black/40 hover:bg-black/55 backdrop-blur-sm text-white font-bold text-sm px-6 py-3 rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                تصفح جميع الأحاديث{total > 0 ? ` (${arNum(total)})` : ''}
              </button>
            </div>
          </div>
        </div>

        {/* ===== الحفظ والمفضلة المحلية ===== */}
        {stripOpen && (
          <div
            className="bg-[#FAF2E2] border border-[#EFE3C8] rounded-2xl px-5 py-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4"
            dir="rtl"
          >
            <div className="flex items-center gap-4 text-right">
              <div className="w-10 h-10 rounded-xl bg-[#C9A45C] flex items-center justify-center text-white shrink-0">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-extrabold text-[#1E3E30]">حفظ الأحاديث والمفضلة المحلية</h3>
                <p className="text-[11px] md:text-xs text-[#7A7368] mt-0.5 leading-6">
                  يمكنك تصفح وقراءة الأحاديث والاستماع لها بحرية، وحفظ الأحاديث في مفضلتك المحلية على هذا المتصفح دون الحاجة لحساب.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onShowSaved}
                className="bg-[#1E3E30] hover:bg-[#152D23] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all cursor-pointer"
              >
                عرض المحفوظات{savedCount > 0 ? ` (${arNum(savedCount)})` : ''}
              </button>
              <button
                onClick={closeStrip}
                className="text-xs font-medium text-[#8A8378] hover:text-[#1E3E30] transition-colors px-2 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default HadithFooter;