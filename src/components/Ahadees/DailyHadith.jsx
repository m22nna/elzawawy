import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Share2, Bookmark, BookOpen, Check, Sparkles, CirclePlay, CirclePause } from 'lucide-react';
import { arNum } from '../../features/Quran/utils';

const DailyHadith = ({
  hadith,
  total = 0,
  loading,
  error,
  onRetry,
  isDailyPick,
  query,
  onQuery,
  onSubmitSearch,
  saved,
  onToggleSaved,
  onOpen,
  onPlay,
  speech,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const reading = !!hadith && speech.playing && speech.current === hadith.textArabic;

  // مشاركة الحديث (مشاركة النظام لو متاحة، وإلا نسخ للحافظة)
  const handleShare = async () => {
    if (!hadith) return;
    const text = `«${hadith.textArabic}»\nالمصدر: ${hadith.source}${hadith.explanation ? `\nالشرح: ${hadith.explanation}` : ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'حديث نبوي', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      /* المستخدم لغى المشاركة */
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#2C3E35] font-sans px-4 pt-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8" style={{ fontFamily: "'Tajawal', sans-serif" }}>

        {/* ===== رأس الصفحة: المسار والعنوان والبحث ===== */}
        <header className="border-b border-[#EDE9E1] pb-5" dir="rtl">
          <nav className="flex items-center gap-2 text-[11px] text-[#8C857B] mb-3 font-medium">
            <Link to="/" className="hover:text-[#1E3E30]">الرئيسية</Link>
            <span>/</span>
            <span className="text-[#1E3E30] font-bold">الأحاديث النبوية</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E3E30] tracking-tight">الأحاديث النبوية</h1>
                <span className="bg-[#E4F0EA] text-[#1E3E30] text-[11px] font-bold px-3 py-1 rounded-full border border-[#D3E5DB]">
                  مكتبة موثّقة
                </span>
              </div>
              <p className="text-sm text-[#736C62] mt-2">
                تَعرّف على الأحاديث النبوية، وتأمل معانيها، واكتشف ما ترشدنا إليه في حياتنا اليومية.
              </p>
            </div>

            <div className="relative w-full md:w-[360px]">
              <input
                type="text"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmitSearch?.()}
                placeholder="ابحث في نص الحديث أو شرحه أو مصدره..."
                aria-label="بحث في الأحاديث"
                className="w-full py-2.5 pr-10 pl-[4.5rem] text-sm bg-white border border-[#E5E0D8] rounded-full focus:outline-none focus:ring-2 focus:ring-[#1E3E30]/20 focus:border-[#1E3E30] text-[#2C3E35] placeholder-[#9A9388] transition-all shadow-sm"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9388]" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-[#E5E0D8] rounded text-[10px] text-[#9A9388] bg-[#F4F2ED]" dir="ltr">
                Enter ↵
              </span>
            </div>
          </div>
        </header>

        {/* ===== عنوان القسم ===== */}
        <div className="flex items-center justify-between" dir="rtl">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-[#C29B38] rounded-full inline-block"></span>
            <h2 className="text-xl font-bold text-[#1E3E30]">حديث اليوم</h2>
          </div>
          <span className="text-[11px] text-[#8C857B] hidden sm:inline">يتجدد يومياً مع الشرح الميسر</span>
        </div>

        {/* ===== كارت حديث اليوم ===== */}
        <div className="relative bg-gradient-to-br from-[#E9F2EE] via-[#FCFBF8] to-[#F6F1E5] border border-[#E8E3DA] rounded-3xl p-6 md:p-10 shadow-sm overflow-hidden">
          {error && !hadith ? (
            <div className="py-10 text-center" dir="rtl">
              <p className="text-sm text-red-600">تعذّر تحميل الأحاديث، حاول مرة أخرى بعد قليل.</p>
              <button onClick={onRetry} className="mt-4 rounded-full bg-[#1E3E30] px-5 py-2 text-xs font-bold text-white cursor-pointer">
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] gap-8 lg:gap-12 items-center" dir="rtl">

              {/* النص والأزرار (يمين) */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="bg-[#1E3E30] text-[#DCEAE2] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E3C878]" />
                    {isDailyPick ? 'مختار لليوم' : 'حديث آخر'}
                  </span>
                  <span className="text-[11px] text-[#8C857B]">{loading ? 'جاري التحميل...' : hadith?.source}</span>
                </div>

                <div className="min-h-[90px] flex items-center">
                  {loading || !hadith ? (
                    <div className="w-full space-y-3 animate-pulse" aria-busy="true">
                      <div className="h-8 bg-[#1E3E30]/10 rounded-lg w-3/4"></div>
                      <div className="h-8 bg-[#1E3E30]/10 rounded-lg w-1/2"></div>
                    </div>
                  ) : (
                    <p
                      className="text-2xl md:text-3xl lg:text-[2.1rem] text-[#1E3E30] font-bold leading-[2] text-right"
                      style={{ fontFamily: "'Amiri', serif", wordSpacing: '2px' }}
                    >
                      «{hadith.textArabic}»
                    </p>
                  )}
                </div>

                <div>
                  {loading || !hadith ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-[#6E675D]/10 rounded w-full"></div>
                      <div className="h-4 bg-[#6E675D]/10 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm text-[#6E675D] leading-7">{hadith.explanation}</p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3 pt-1">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => hadith && onPlay(hadith)}
                      disabled={!hadith || !speech.available}
                      title={speech.available ? undefined : 'متصفحك لا يحتوي على صوت عربي'}
                      className="flex items-center gap-2 bg-[#E2ECE7] hover:bg-[#D5E3DC] text-[#1E3E30] text-xs md:text-sm font-bold px-5 py-2.5 rounded-xl border border-[#D3E3DA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reading ? <CirclePause className="w-4 h-4" /> : <CirclePlay className="w-4 h-4" />}
                      <span>{reading ? 'إيقاف الاستماع' : 'استمع إلى الحديث'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      disabled={!hadith}
                      className="flex items-center gap-2 bg-white hover:bg-[#F7F5F0] text-[#2C3E35] border border-[#E2DDD5] text-xs md:text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-[#8C857B]" />}
                      <span>{isCopied ? 'تم النسخ!' : 'مشاركة'}</span>
                    </button>

                    <button
                      onClick={() => hadith && onToggleSaved(hadith.sortOrder)}
                      disabled={!hadith}
                      aria-pressed={saved}
                      className={`p-2.5 bg-white hover:bg-[#F7F5F0] border border-[#E2DDD5] rounded-xl transition-colors cursor-pointer ${saved ? 'text-[#C29B38]' : 'text-[#8C857B]'}`}
                      title={saved ? 'إزالة من المحفوظات' : 'حفظ الحديث'}
                    >
                      <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={() => hadith && onOpen(hadith)}
                    disabled={!hadith}
                    className="flex items-center gap-2 bg-[#1E3E30] hover:bg-[#152D23] text-white text-xs md:text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <BookOpen className="w-4 h-4 text-[#E3C878]" />
                    <span>قراءة الحديث والشرح</span>
                  </button>
                </div>
              </div>

              {/* بيانات الحديث (شمال) */}
              <div className="bg-white/85 backdrop-blur-sm border border-[#EAE5DD] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3 mb-4">
                  <span className="text-xs font-bold text-[#8C857B]">بيانات الحديث</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-[#8C857B] text-xs shrink-0">المصدر:</span>
                    <span className="font-bold text-[#1E3E30] text-left">{loading ? '...' : hadith?.source}</span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-[#8C857B] text-xs">ترتيبه في المكتبة:</span>
                    <span className="font-bold text-[#1E3E30]">
                      {loading || !hadith ? '...' : `${arNum(hadith.sortOrder)} من ${arNum(total)}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-between text-xs text-[#6B645A]">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${speech.available ? 'bg-[#10B981]' : 'bg-[#B8B2A7]'}`}></span>
                      القراءة الصوتية
                    </span>
                    <span className="font-bold text-[#1E3E30]">
                      {speech.available ? 'قراءة آلية من المتصفح' : 'غير متاحة (لا يوجد صوت عربي)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyHadith;