import React from 'react';
import { Link2, ChevronLeft } from 'lucide-react';

const RelatedAhadith = () => {
  const relatedList = [
    {
      id: 1,
      category: 'العلم والعمل',
      source: 'سنن ابن ماجه (٢٢٤)',
      text: '«طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ»',
      description: 'بيان وجوب تحصيل ما لا يستقيم دين المسلم إلا به من العقائد والفرائض وأحكام العبادات.',
    },
    {
      id: 2,
      category: 'فضل العلماء',
      source: 'سنن أبي داود (٣٦٤١)',
      text: '«إِنَّ الْعُلَمَاءَ وَرَثَةُ الأَنْبِيَاءِ»',
      description: 'شرف أهل العلم ورفعة درجتهم وأنهم ورثة الوحي ونقلة الشريعة للأجيال بعد الرسل.',
    },
    {
      id: 3,
      category: 'الفقه والبصيرة',
      source: 'صحيح البخاري (٧١)',
      text: '«مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ»',
      description: 'علامة محبة الله للعبد وإرادة الخير له أن يرزقه الفهم العميق لكتابه وسنة نبيه.',
    },
  ];

  return (
    <div className=" mb-10 bg-[#FAF8F5] text-[#2C3E35] p-4 md:p-8 font-sans" >
      {/* Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700;800&display=swap" 
        rel="stylesheet" 
      />

      <div className="max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Back/All Chapter Link */}
          <button className="flex items-center gap-1 text-xs md:text-sm font-semibold text-[#6E675D] hover:text-[#1E3E30] transition-colors order-2 sm:order-1 self-start sm:self-auto">
            <ChevronLeft className="w-4 h-4" />
            <span>عرض كل أحاديث الباب</span>
          </button>

          {/* Title & Icon */}
          <div className="flex items-center gap-3 order-1 sm:order-2">
            <div className="text-right">
              <h2 className="text-lg md:text-xl font-bold text-[#1E3E30]">
                أحاديث ذات صلة بطلب العلم والعمل
              </h2>
              <p className="text-xs text-[#8C857B] mt-0.5">
                أحاديث نبوية شريفة تشترك في نفس الباب والموضوع
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE6DD] flex items-center justify-center text-[#1E3E30] shadow-2xs shrink-0">
              <Link2 className="w-5 h-5 text-[#2C3E35]" />
            </div>
          </div>

        </div>

        {/* 3-Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedList.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-[#EBE6DD] rounded-2xl p-6 md:p-7 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-md hover:border-[#DCD5C9] transition-all duration-300 group cursor-pointer"
            >
              
              {/* Category & Source Header */}
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-[#8C857B] font-medium">
                  {item.source}
                </span>
                <span className="font-bold text-[#1E3E30]">
                  {item.category}
                </span>
              </div>

              {/* Hadith Quote */}
              <div className="py-2 text-center">
                <p 
                  className="text-xl md:text-2xl text-[#1E3E30] font-bold leading-relaxed"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {item.text}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-[#7A7368] leading-relaxed text-center font-normal px-2">
                {item.description}
              </p>

              {/* Footer Button */}
              <div className="pt-2 border-t border-[#F5F1EA] flex items-center justify-between text-xs font-bold text-[#1E3E30] group-hover:text-[#0D7D4D] transition-colors">
                <ChevronLeft className="w-4 h-4 text-[#A59F94] group-hover:-translate-x-1 group-hover:text-[#0D7D4D] transition-all" />
                <span>قراءة الحديث كاملاً</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RelatedAhadith;