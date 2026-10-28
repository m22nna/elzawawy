import React from 'react';
import { BookOpenText, Lightbulb, Sparkles, Bookmark } from 'lucide-react';

const HadithExplanation = ({ hadith, loading }) => {
  // بيانات الفوائد والدروس المستفادة العامة
  const generalBenefits = [
    {
      id: '١',
      title: 'عظم مكانة السنة النبوية',
      text: 'أن الأحاديث النبوية الشريفة أصل عظيم من أصول التشريع ومصدر متجدد للهداية والنجاة.',
    },
    {
      id: '٢',
      title: 'العمل بمقتضى الحديث',
      text: 'أن العلم بالحديث وثمرته الحقيقية تكمن في العمل به وتطبيقه في المعاملات والسلوك اليومي.',
    },
    {
      id: '٣',
      title: 'استحضار النية الصالحة',
      text: 'إخلاص القصد لله تعالى في كل قول وفعل ابتغاء مرضاته ورجاء ثوابه ومغفرته.',
    },
    {
      id: '٤',
      title: 'نشر الخير وتبليغ العلم',
      text: 'تبليغ هدي النبي ﷺ للغير ليعم النفع وتتضاعف الأجور عملاً بقوله: «بلّغوا عنّي ولو آية».',
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#2C3E35] p-4 md:p-8 font-sans" dir="rtl">
      {/* تضمين خطوط جوجل العربية */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700;800&display=swap" 
        rel="stylesheet" 
      />

      <div className="max-w-7xl mx-auto" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= RIGHT COLUMN: HADITH EXPLANATION (Col 8) ================= */}
          <div className="lg:col-span-8 bg-white border border-[#EBE6DD] rounded-2xl p-6 md:p-8 space-y-7 shadow-xs">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#F5F1EA] pb-5">
              <div className="text-right space-y-1">
                <h2 className="text-xl md:text-2xl font-bold text-[#1E3E30]">
                  شرح وتفسير الحديث الشريف
                </h2>
                <p className="text-xs text-[#8C857B]">
                  بيان المعاني الإجمالية والمقاصد الشرعية المستفادة
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD] flex items-center justify-center text-[#1E3E30] shrink-0">
                <BookOpenText className="w-5 h-5" />
              </div>
            </div>

            {/* Main Hadith Explanation Banner */}
            <div className="bg-[#FCF9F2] border-r-4 border-[#C29B38] rounded-l-xl p-6 space-y-3 text-right">
              <div className="flex items-center gap-2 text-[#96711D] font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#C29B38]" />
                <span>الشرح والتفسير المعتمد للحديث</span>
              </div>

              {loading ? (
                <div className="space-y-3 py-2 animate-pulse">
                  <div className="h-5 bg-[#C29B38]/20 rounded w-full"></div>
                  <div className="h-5 bg-[#C29B38]/20 rounded w-5/6"></div>
                  <div className="h-5 bg-[#C29B38]/20 rounded w-2/3"></div>
                </div>
              ) : (
                <p className="text-base md:text-lg text-[#3D372E] leading-loose font-medium">
                  {hadith?.explanation || 'إرشاد نبوي كريم يحث المؤمن على اغتنام الأوقات في طاعة الله وطلب مرضاته، وبيان أن كل عمل صالح يُمهد لصاحبه أسباب النجاة والفوز.'}
                </p>
              )}
            </div>

            {/* Hadith Quote Box */}
            <div className="bg-[#FAF8F5] border border-[#EBE6DD] rounded-xl p-5 space-y-2 text-right">
              <div className="text-xs font-bold text-[#8C857B]">نص الحديث الشريف:</div>
              <p 
                className="text-lg md:text-xl text-[#1E3E30] font-bold leading-relaxed"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                «{hadith?.textArabic || 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ'}»
              </p>
              <div className="text-xs text-[#8C857B] pt-1">
                <span className="font-semibold text-[#1E3E30]">التخريج والمصدر: </span>
                {hadith?.source || 'صحيح السنة النبوية'}
              </div>
            </div>

            {/* Practical Guidance */}
            <div className="space-y-4 text-right pt-1">
              <h3 className="text-base font-bold text-[#1E3E30]">
                أوجه العمل والتطبيق بالحديث الشريف
              </h3>

              <ul className="space-y-3 pr-2">
                <li className="text-xs md:text-sm text-[#5A544B] leading-relaxed flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C29B38] mt-1.5 shrink-0"></span>
                  <div>
                    <span className="font-bold text-[#1E3E30] ml-1">استحضار النية الصادقة:</span>
                    أن يقصد المسلم في أقواله وأفعاله وجه الله والدار الآخرة والتمسك بهدي نبيه ﷺ.
                  </div>
                </li>

                <li className="text-xs md:text-sm text-[#5A544B] leading-relaxed flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C29B38] mt-1.5 shrink-0"></span>
                  <div>
                    <span className="font-bold text-[#1E3E30] ml-1">الدعوة والتذكير:</span>
                    نشر ما تعلمه من هذا الحديث بين الأهل والأصدقاء ليكون له أجر العمل وأجر الدلالة على الخير.
                  </div>
                </li>
              </ul>
            </div>

            {/* Footer Source Card */}
            <div className="bg-[#FAF8F5] border border-[#EBE6DD] rounded-xl p-4 text-xs text-[#7A7368] flex flex-col md:flex-row items-center justify-between gap-3 pt-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#C29B38]" />
                <span>المصدر: {hadith?.source || 'صحيح الحديث النبوي'}</span>
              </div>

              <div className="font-bold text-[#1E3E30]">
                مراجعة وتدقيق: <span className="text-[#1E3E30]">الشيخ عبدالرحمن الزواوي</span>
              </div>
            </div>

          </div>

          {/* ================= LEFT COLUMN: BENEFITS & LESSONS (Col 4) ================= */}
          <div className="lg:col-span-4 bg-white border border-[#EBE6DD] rounded-2xl p-5 space-y-5">
            
            {/* Header */}
            <div className="flex items-center border-b border-[#EBE6DD] pb-4">
              <Lightbulb className="w-5 h-5 me-5 text-[#1a1918]" />
              <h3 className="text-base font-bold text-[#1E3E30]">
                الفوائد والدروس المستفادة
              </h3>
            </div>

            {/* Benefit List */}
            <div className="space-y-3.5">
              {generalBenefits.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-[#EBE6DD] rounded-xl p-4 flex items-start justify-between gap-3 shadow-2xs hover:border-[#D0C8BB] transition-colors"
                >
                  <span className="text-sm font-bold text-[#1E3E30] w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                    {item.id}
                  </span>
                  <div className="text-right space-y-1.5 flex-1">
                    <h4 className="text-xs md:text-sm font-bold text-[#1E3E30]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] md:text-xs text-[#7A7368] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HadithExplanation;