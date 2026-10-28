import React, { useState, useEffect } from 'react';
import {
  Search,
  Share2,
  Bookmark,
  BookOpen,
  Check,
  Sparkles,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchRandomHadith } from '../../api/hadithApi';

const DEFAULT_HADITH = {
  textArabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
  source: "صحيح مسلم",
  explanation: "إرشاد نبوي كريم يحث المؤمن على اغتنام الأوقات في طلب العلم النافع، وبيان أن كل خطوة ومسعى في تحصيل العلم تُمهد لصاحبها أسباب النجاة ودخول الجنة.",
  sortOrder: 1
};

const DailyHadith = ({ hadith: propHadith, onHadithLoaded }) => {
  const [hadith, setHadith] = useState(() => {
    if (propHadith) return propHadith;
    try {
      const saved = sessionStorage.getItem('currentHadith');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.textArabic) return parsed;
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState(!hadith);
  const [isCopied, setIsCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // جلب حديث عشوائي من السيرفر
  const loadRandomHadith = async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const saved = sessionStorage.getItem('currentHadith');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.textArabic) {
            setHadith(parsed);
            if (onHadithLoaded) onHadithLoaded(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}
    }

    setLoading(true);
    try {
      const data = await fetchRandomHadith();
      if (data && data.textArabic) {
        setHadith(data);
        sessionStorage.setItem('currentHadith', JSON.stringify(data));
        if (onHadithLoaded) onHadithLoaded(data);
      } else {
        setHadith(DEFAULT_HADITH);
        sessionStorage.setItem('currentHadith', JSON.stringify(DEFAULT_HADITH));
        if (onHadithLoaded) onHadithLoaded(DEFAULT_HADITH);
      }
    } catch (err) {
      console.error("فشل جلب الحديث العشوائي:", err);
      // في حال حدوث خطأ، استخدام الحديث الاحتياطي
      setHadith(DEFAULT_HADITH);
      sessionStorage.setItem('currentHadith', JSON.stringify(DEFAULT_HADITH));
      if (onHadithLoaded) onHadithLoaded(DEFAULT_HADITH);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandomHadith(false);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // مشاركة ونسخ نص الحديث
  const handleShare = () => {
    const current = hadith || DEFAULT_HADITH;
    const shareText = `«${current.textArabic}»\nالمصدر: ${current.source}\nالشرح: ${current.explanation}`;
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // تشغيل / إيقاف قراءة الحديث صوتياً
  const handleToggleAudio = () => {
    const current = hadith || DEFAULT_HADITH;
    if (!('speechSynthesis' in window)) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.textArabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  // الانتقال إلى صفحة التفسير مع تمرير نفس الحديث
  const handleNavigateToTafseer = () => {
    const current = hadith || DEFAULT_HADITH;
    sessionStorage.setItem('currentHadith', JSON.stringify(current));
    navigate('/tafseerhadith', { state: { hadith: current } });
  };

  const displayHadith = hadith || DEFAULT_HADITH;

  return (
    <div className="bg-[#FAF9F6] text-[#2C3E35] font-sans p-4 md:p-8">
      {/* Google Fonts Preloads for Typography */}
      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-7xl mx-auto space-y-6 my-7" style={{ fontFamily: "'Tajawal', sans-serif" }}>

        {/* Header / Top Navigation & Search Area */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">

          {/* Breadcrumb & Title */}
          <div className="text-right order-1 md:order-2" dir="rtl">
            <nav className="flex items-center gap-1.5 text-xs text-[#8C857B] mb-2 font-medium">
              <span className="hover:text-[#1E3E30] cursor-pointer" onClick={() => navigate('/')}>الرئيسية</span>
              <span>/</span>
              <span className="text-[#2C3E35]">الأحاديث النبوية</span>
            </nav>

            {/* Main Title Banner */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E3E30] tracking-tight">
                الأحاديث النبوية
              </h1>
              <span className="bg-[#E4ECE7] text-[#1E3E30] text-xs font-semibold px-3 py-1 rounded-full border border-[#D0DDD5] flex items-center gap-1">
                مكتبة موثقة
              </span>
            </div>

            <p className="text-sm text-[#736C62] mt-1">
              تَعرّف على الأحاديث النبوية، وتأمل معانيها، واكتشف ما ترشدنا إليه في حياتنا اليومية.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-96 order-2 md:order-1">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الأحاديث أو الرواة أو الموضوعات..."
                className="w-full py-2.5 pr-10 pl-16 text-sm bg-white border border-[#E5E0D8] rounded-full focus:outline-none focus:ring-2 focus:ring-[#1E3E30]/20 focus:border-[#1E3E30] text-[#2C3E35] placeholder-[#9A9388] transition-all shadow-sm"
              />
              <Search className="absolute right-3.5 w-4 h-4 text-[#9A9388]" />
              <div className="absolute left-3 flex items-center px-1.5 py-0.5 border border-[#E5E0D8] rounded text-[10px] text-[#9A9388] bg-[#F9F8F5]">
                Enter ↵
              </div>
            </div>
          </div>
        </header>

        {/* Section Label */}
        <div className="flex items-center justify-between pt-4" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#C29B38] rounded-full inline-block"></span>
            <h2 className="text-xl font-bold text-[#1E3E30]">حديث اليوم</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadRandomHadith(true)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-[#1E3E30] hover:text-[#0D7D4D] bg-white border border-[#E5E0D8] px-3 py-1.5 rounded-full transition-all hover:shadow-xs disabled:opacity-50 cursor-pointer"
              title="جلب حديث عشوائي آخر"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>حديث آخر</span>
            </button>
            <span className="text-xs text-[#8C857B] hidden sm:inline">
              يتجدد مع الشرح والتخريج الميسر
            </span>
          </div>
        </div>

        {/* Main Hadith Card Container */}
        <div className="relative bg-gradient-to-l from-[#E7F1EC] via-[#FCFBF8] to-[#F5F0E4] border border-[#E8E3DA] rounded-3xl p-6 md:p-10 shadow-sm overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Side: Metadata Card (بيانات التخريج والسند) */}
            <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm border border-[#EAE5DD] rounded-2xl p-5 shadow-xs order-2 lg:order-1">

              {/* Card Header Indicator */}
              <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3 mb-4" dir="rtl">
                <span className="text-xs font-bold text-[#8C857B]">بيانات التخريج والسند</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
              </div>

              {/* Detail Items */}
              <div className="space-y-3.5 text-sm" dir="rtl">

                <div className="flex justify-between items-baseline">
                  <span className="text-[#8C857B] text-xs">المصدر والتخريج:</span>
                  <span className="font-bold text-[#1E3E30]">
                    {loading ? '...' : displayHadith.source}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-[#8C857B] text-xs">ترتيب الحديث:</span>
                  <span className="font-bold text-[#1E3E30]">
                    {loading ? '...' : (displayHadith.sortOrder ? `حديث رقم: ${displayHadith.sortOrder}` : 'مأثور نبوي')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8C857B] text-xs">حكم المحدث:</span>
                  <span className="bg-[#E2F7ED] text-[#0D7D4D] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#C5F0DC]">
                    صحيح محقق
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-[#8C857B] text-xs">الموضوع الأساسي:</span>
                  <span className="font-bold text-[#1E3E30]">
                    جوامع الكلم والمأثورات
                  </span>
                </div>

                {/* Audio Status */}
                <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-between text-xs text-[#6B645A]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    تسجيل وقراءة صوتية
                  </span>
                  <span className="font-bold text-[#1E3E30]">
                    • متاح للاستماع
                  </span>
                </div>

              </div>
            </div>

            {/* Right Side: Hadith Text & Main Actions */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6 order-1 lg:order-2">

              {/* Category Tag */}
              <div className="flex items-center gap-2" dir="rtl">
                <span className="bg-[#1E3E30] text-[#DCEAE2] text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C29B38]" />
                  مختار اليوم
                </span>
                <span className="text-xs text-[#8C857B]">
                  {loading ? 'جاري التحميل...' : displayHadith.source}
                </span>
              </div>

              {/* Main Hadith Text */}
              <div className="py-2 min-h-[90px] flex items-center">
                {loading ? (
                  <div className="w-full space-y-3 animate-pulse" dir="rtl">
                    <div className="h-8 bg-[#1E3E30]/10 rounded-lg w-3/4"></div>
                    <div className="h-8 bg-[#1E3E30]/10 rounded-lg w-1/2"></div>
                  </div>
                ) : (
                  <p
                    className="text-2xl md:text-3xl lg:text-4xl text-[#1E3E30] font-bold leading-relaxed text-right"
                    style={{ fontFamily: "'Amiri', serif", wordSpacing: '2px' }}
                  >
                    «{displayHadith.textArabic}»
                  </p>
                )}
              </div>

              {/* Brief Commentary */}
              <div dir="rtl">
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-[#6E675D]/10 rounded w-full"></div>
                    <div className="h-4 bg-[#6E675D]/10 rounded w-2/3"></div>
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-[#6E675D] leading-relaxed">
                    {displayHadith.explanation}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2" dir="rtl">

                {/* Audio Button */}
                <button
                  onClick={handleToggleAudio}
                  className="flex items-center gap-2 bg-[#E2ECE7] hover:bg-[#D5E3DC] text-[#1E3E30] text-xs md:text-sm font-bold px-4 py-2.5 rounded-full transition-colors shadow-2xs cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'إيقاف الاستماع' : 'استمع إلى الحديث'}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-white hover:bg-[#F7F5F0] text-[#2C3E35] border border-[#E2DDD5] text-xs md:text-sm font-medium px-4 py-2.5 rounded-full transition-colors shadow-2xs cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-[#8C857B]" />}
                  <span>{isCopied ? 'تم النسخ!' : 'مشاركة'}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2.5 bg-white hover:bg-[#F7F5F0] border border-[#E2DDD5] rounded-full transition-colors shadow-2xs cursor-pointer ${isBookmarked ? 'text-[#C29B38]' : 'text-[#8C857B]'
                    }`}
                  title="حفظ الحديث"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                {/* Read Full Explanation Button */}
                <button
                  onClick={handleNavigateToTafseer}
                  className="flex items-center gap-2 bg-[#1E3E30] hover:bg-[#152D23] text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm mr-auto md:mr-0 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>قراءة الحديث والشرح</span>
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DailyHadith;