import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Copy,
  Share2,
  Heart,
  BookOpen,
  Play,
  Pause,
  User,
  FileText,
  Hash,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HadithDetails = ({ bgImageUrl, hadith, loading }) => {
  const [fontSize, setFontSize] = useState(28);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const navigate = useNavigate();

  // الصورة الافتراضية لخلفية الصوت في حال عدم تمرير صورة خاصة
  const defaultAudioBg = "https://images.unsplash.com/photo-1542816417-0983cbe82752?q=80&w=1000&auto=format&fit=crop";

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    const textToCopy = hadith
      ? `«${hadith.textArabic}»\nالمصدر: ${hadith.source}\nالشرح: ${hadith.explanation}`
      : "«عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ»";
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(hadith?.textArabic || '');
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#2C3E35] p-4 md:p-8 font-sans">
      {/* تضمين خطوط جوجل العربية المميزة */}
      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>

        {/* ================= BREADCRUMB & HEADER ================= */}
        <header className="space-y-3" dir="rtl">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8C857B] font-medium">
            <span className="hover:text-[#1E3E30] cursor-pointer" onClick={() => navigate('/')}>🏠 الرئيسية</span>
            <span>/</span>
            <span className="hover:text-[#1E3E30] cursor-pointer" onClick={() => navigate('/ahadith')}>مكتبة الأحاديث النبوية</span>
            <span>/</span>
            <span className="text-[#2C3E35] font-semibold">تفاصيل الحديث وتفسيره</span>
          </nav>

          {/* Title Banner with Action Return Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E3E30]">
                تفاصيل الحديث النبوي الشريف
              </h1>
              <span className="bg-[#EAF3EE] text-[#2D5A43] text-xs font-semibold px-3 py-1 rounded-full border border-[#D3E5DC]">
                {hadith?.source || 'صحيح مأثور'}
              </span>
            </div>

            <button
              onClick={() => navigate('/ahadith')}
              className="self-start md:self-auto bg-white hover:bg-[#F5F2EC] border border-[#E2DDD5] text-[#1E3E30] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى مكتبة الأحاديث</span>
            </button>
          </div>
        </header>

        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ---------------- LEFT SIDE: AUDIO & NARRATOR GUIDANCE (Col 4) ---------------- */}
          <div className="lg:col-span-4 space-y-5 order-2 lg:order-1">

            {/* Audio Record Card with Background Image */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-md text-white border border-[#E2DDD5] min-h-[320px] flex flex-col justify-between p-5 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 18, 0.6) 0%, rgba(15, 23, 18, 0.85) 100%), url(${bgImageUrl || defaultAudioBg})`
              }}
            >
              {/* Audio Top Badges */}
              <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
                <span className="bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  320kbps
                </span>
                <span className="bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  تسجيل صوتي مخصص
                </span>
                <span className="text-amber-200 font-mono">
                  {hadith?.sortOrder ? `رقم: ${hadith.sortOrder}` : 'حديث مبارك'}
                </span>
              </div>

              {/* Center Play Button and Description */}
              <div className="my-auto text-center space-y-3 py-4">
                <h3 className="text-lg font-bold text-white drop-shadow-sm leading-snug">
                  قراءة الحديث وضبط ألفاظه
                </h3>
                <p className="text-xs text-amber-100/80 font-medium">
                  {hadith?.source ? `المصدر: ${hadith.source}` : 'بصوت الشيخ عبدالرحمن الزواوي'}
                </p>

                <button
                  onClick={handleToggleAudio}
                  className="w-14 h-14 rounded-full bg-white text-[#1E3E30] hover:scale-105 transition-transform flex items-center justify-center mx-auto shadow-lg cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current mr-0.5" />
                  )}
                </button>
              </div>

              {/* Audio Bottom Progress Bar & Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] text-amber-100/90 font-mono">
                  <span>02:18</span>
                  <span className="bg-black/40 px-2 py-0.5 rounded text-[10px]">السرعة: 1.0x</span>
                  <span>00:45</span>
                </div>

                {/* Progress Line */}
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full w-[35%] rounded-full"></div>
                </div>

                {/* Bottom Studio Tag */}
                <div className="flex items-center justify-between pt-1">
                  <div className="w-20 h-7 bg-white/10 rounded-lg backdrop-blur-xs"></div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>تسجيل استوديو نقي</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Reciter Guidance Box */}
            <div className="bg-[#FAF6EE] border border-[#E8E0D2] rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="flex border-b border-[#E8E0D2] pb-3" dir="rtl">
                <div className="w-9 h-9 rounded-full bg-[#1E3E30] text-white flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-right ms-3">
                  <span className="text-[10px] font-bold text-[#9C9488] block">توجيه نبوي وتذكير</span>
                  <h4 className="text-sm font-bold text-[#1E3E30]">الشيخ عبدالرحمن الزواوي</h4>
                </div>
              </div>

              <p className="text-sm text-[#6E675D] leading-relaxed italic text-right">
                «من حفظ أحاديث النبي ﷺ وتأمل معانيها وعمل بما فيها، نال شرف الاتباع وسعادة الدارين».
              </p>
            </div>

          </div>

          {/* ---------------- RIGHT SIDE: HADITH TEXT & METADATA (Col 8) ---------------- */}
          <div className="lg:col-span-8 bg-white border border-[#EBE6DD] rounded-2xl p-6 md:p-8 space-y-8 shadow-xs order-1 lg:order-2">

            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA] pb-5">

              {/* Font Resizer & Action Buttons (Left) */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Font Size Buttons */}
                <div className="flex items-center bg-[#FAF8F5] border border-[#EBE6DD] rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setFontSize(prev => Math.min(prev + 2, 40))}
                    className="px-2.5 py-1 text-xs font-bold text-[#1E3E30] hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="تكبير الخط"
                  >
                    A+ الخط
                  </button>
                  <span className="text-[#D8D2C7]">|</span>
                  <button
                    onClick={() => setFontSize(prev => Math.max(prev - 2, 20))}
                    className="px-2.5 py-1 text-xs font-bold text-[#1E3E30] hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="تصغير الخط"
                  >
                    A-
                  </button>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-1.5 border text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${isSaved
                      ? 'bg-[#FEF7E6] border-[#E8D4A2] text-[#A17C20]'
                      : 'bg-[#FAF8F5] border-[#EBE6DD] text-[#6E675D] hover:bg-[#F5F2EC]'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'محفوظ' : 'حفظ'}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EC] border border-[#EBE6DD] text-[#6E675D] text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة</span>
                </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EC] border border-[#EBE6DD] text-[#6E675D] text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
                </button>

              </div>

              {/* Section Badge Tag (Right) */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[20px] font-bold text-[#1E3E30] block">سنة النبي المصطفى ﷺ</span>
                  <span className="text-[15px] text-[#8C857B]">نص الحديث الشريف وتخريجه</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#1E3E30] text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>

            </div>

            {/* Hadith Main Text Container with Decorative Shapes */}
            <div className="py-6 px-2 text-center space-y-6">

              {/* Decorative Top Ornament */}
              <div className="flex justify-center text-[#C29B38]">
                <div className="w-3 h-3 rotate-45 border-2 border-[#C29B38] relative">
                  <div className="w-1.5 h-1.5 bg-[#C29B38] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>

              {/* Arabic Text */}
              {loading ? (
                <div className="py-8 space-y-4 animate-pulse">
                  <div className="h-8 bg-[#1E3E30]/10 rounded-lg w-3/4 mx-auto"></div>
                  <div className="h-8 bg-[#1E3E30]/10 rounded-lg w-1/2 mx-auto"></div>
                </div>
              ) : (
                <p
                  className="text-[#1E3E30] font-bold leading-loose text-center transition-all duration-200"
                  style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: `${fontSize}px`,
                    lineHeight: '2.2'
                  }}
                >
                  «{hadith?.textArabic || 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ'}»
                </p>
              )}

              {/* Decorative Bottom Ornament */}
              <div className="flex justify-center text-[#C29B38]">
                <div className="w-3 h-3 rotate-45 border-2 border-[#C29B38] relative">
                  <div className="w-1.5 h-1.5 bg-[#C29B38] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>

            </div>

            {/* Bottom Hadith Metadata Footer Bar */}
            <div className="border-t border-[#F5F1EA] pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#F0EBE3]">

                {/* 1. Health Grade */}
                <div className="space-y-1 p-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#8C857B]" dir="rtl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>درجة الصحة</span>
                  </div>
                  <p className="text-xs font-bold text-[#0D7D4D] flex items-center justify-center gap-1">
                    <span>صحيح مُحقَّق</span>
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  </p>
                </div>

                {/* 2. Hadith Number */}
                <div className="space-y-1 p-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#8C857B]" dir="rtl">
                    <Hash className="w-3.5 h-3.5 text-[#C29B38]" />
                    <span>رقم الحديث</span>
                  </div>
                  <p className="text-xs font-bold text-[#1E3E30]">
                    {hadith?.sortOrder ? `حديث رقم: ${hadith.sortOrder}` : 'حديث مبارك'}
                  </p>
                </div>

                {/* 3. Source & Chapter */}
                <div className="space-y-1 p-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#8C857B]" dir="rtl">
                    <FileText className="w-3.5 h-3.5" />
                    <span>المصدر والتخريج</span>
                  </div>
                  <p className="text-xs font-bold text-[#1E3E30] truncate">
                    {hadith?.source || 'صحيح السنة'}
                  </p>
                </div>

                {/* 4. Explanation status */}
                <div className="space-y-1 p-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#8C857B]" dir="rtl">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>التفسير والبيان</span>
                  </div>
                  <p className="text-xs font-bold text-[#1E3E30]">شرح ميسر وموثق</p>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HadithDetails;