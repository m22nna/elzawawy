import React from 'react';
import { RefreshCw, Bookmark, Sparkles } from 'lucide-react';

const HadithFooter = ({ bgImageUrl }) => {
  // الصورة الافتراضية للبنر في حال عدم تمرير رابط الصورة
  const defaultBgImage = 'https://images.unsplash.com/photo-1542816417-0983cbe82752?q=80&w=1600&auto=format&fit=crop';

  return (
    <footer className="max-w-7xl mx-auto my-10 space-y-6 font-sans text-[#2C3E35]" >
      
      {/* 1. TOP HERO BANNER WITH CUSTOM BACKGROUND IMAGE */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden min-h-[220px] md:min-h-[200px] flex items-center justify-between p-6 md:p-10 shadow-sm border border-[#E8E3DA] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to left, rgba(20, 15, 8, 0.75) 0%, rgba(30, 20, 10, 0.6) 50%, rgba(10, 10, 10, 0.7) 100%), url(${bgImageUrl || defaultBgImage})`
        }}
      >
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Action Buttons (Left Side) */}
          <div className="flex items-center gap-3 order-2 md:order-1">
            {/* Blank/Secondary Action Button */}
            <div className="w-44 h-11 bg-white/95 rounded-2xl shadow-sm border border-white/20 hidden sm:block"></div>

            {/* Main Action Button */}
            <button className="bg-[#C69C3A] hover:bg-[#B58C2B] text-[#1A2E23] font-extrabold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all duration-200 cursor-pointer" dir="rtl">
              <RefreshCw className="w-4 h-4" />
              <span>اكتشف حديثًا الآن</span>
            </button>
          </div>

          {/* Text Content (Right Side) */}
          <div className="text-right text-white space-y-2 order-1 md:order-2 max-w-2xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20" dir="rtl">
              <Sparkles className="w-3.5 h-3.5 text-[#E3C878]" />
              <span>ومضة نبوية يومية</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              اكتشف حديثًا جديدًا وتدبّر في معانيه
            </h2>

            {/* Description */}
            <p className="text-xs md:text-sm text-amber-50/80 leading-relaxed font-light">
              استعرض حديثاً عشوائياً موثقاً من صحيح السنة النبوية مع الشرح الموجز، واجعله زادك اليومي في مسيرتك الإيمانية.
            </p>
          </div>

        </div>
      </div>

      {/* 2. LOCAL FAVORITES / BOOKMARKS BANNER */}
      <div className="bg-[#FAF4E8] border border-[#EFE5D3] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        
        {/* Left Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start order-2 md:order-1">
          <button className="text-xs font-medium text-[#8A8378] hover:text-[#1E3E30] transition-colors px-2">
            إغلاق
          </button>

          <button className="bg-[#1E3E30] hover:bg-[#152D23] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-2xs">
            عرض المحفوظات
          </button>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3.5 order-1 md:order-2 text-right">
          <div>
            <h3 className="text-base font-bold text-[#1E3E30]">
              حفظ الأحاديث والمفضلة المحلية
            </h3>
            <p className="text-xs text-[#7A7368] mt-0.5">
              يمكنك تصفح وقراءة الأحاديث والاستماع لها بحرية، وحفظ الأحاديث في مفضلتك المحلية على هذا المتصفح دون الحاجة لحساب.
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#D9A738]/20 border border-[#D9A738]/40 flex items-center justify-center text-[#96711D] shrink-0">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
        </div>

      </div>

    </footer>
  );
};

export default HadithFooter;