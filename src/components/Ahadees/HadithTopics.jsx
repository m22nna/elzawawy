import React, { useState } from 'react';
import { 
  Scale, 
  Star, 
  Building2, 
  Users, 
  Shield, 
  BookOpen, 
  ArrowLeft, 
  Bookmark, 
  Play
} from 'lucide-react';

const HadithTopics = () => {
  const [activeTab, setActiveTab] = useState('الكل');

  // البيانات الخاصة بأقسام المواضيع (6 بطاقات علوية)
  const topicCards = [
    {
      id: 1,
      title: 'الأخلاق والآداب',
      description: 'أحاديث في الصدق، الأمانة، التواضع، حسن الخلق، والبر بالوالدين والإحسان للناس.',
      count: '١٤٢ حديثاً محققاً',
      icon: Scale,
      bgColor: 'bg-[#EFF6F2]',
      iconColor: 'text-[#2D5A43]',
    },
    {
      id: 2,
      title: 'الذكر والدعاء',
      description: 'فضائل الأذكار والأوراد النبوية، أوقات الاستجابة، وأدعية الصباح والمساء المأثورة.',
      count: '٩٨ حديثاً محققاً',
      icon: Star,
      bgColor: 'bg-[#FEF9EC]',
      iconColor: 'text-[#C29B38]',
    },
    {
      id: 3,
      title: 'الصلاة والعبادات',
      description: 'صفة صلاة النبي ﷺ، أحكام الطهارة، الصيام، الزكاة، وسنن النوافل وقيام الليل.',
      count: '٢١٥ حديثاً محققاً',
      icon: Building2,
      bgColor: 'bg-[#EFF6F2]',
      iconColor: 'text-[#2D5A43]',
    },
    {
      id: 4,
      title: 'الأسرة والعلاقات',
      description: 'توجيهات نبوية في الحياة الزوجية، تربية الأبناء، صلة الأرحام، وحسن جوار الجار.',
      count: '٧٤ حديثاً محققاً',
      icon: Users,
      bgColor: 'bg-[#EFF6F2]',
      iconColor: 'text-[#2D5A43]',
    },
    {
      id: 5,
      title: 'الصبر والابتلاء',
      description: 'بشارات الصابرين والمحتسبين، أجر المرض والمصائب، والرضا التام بقضاء الله وقدره.',
      count: '٦٣ حديثاً محققاً',
      icon: Shield,
      bgColor: 'bg-[#FEF9EC]',
      iconColor: 'text-[#C29B38]',
    },
    {
      id: 6,
      title: 'العلم وطلب المعرفة',
      description: 'الحث على التعلّم والتفقه في الدين، فضل مجالس العلم، ووصايا رسول الله ﷺ لمعلمي الناس.',
      count: '٨٩ حديثاً محققاً',
      icon: BookOpen,
      bgColor: 'bg-[#EFF6F2]',
      iconColor: 'text-[#2D5A43]',
    },
  ];

  // أزرار الفلترة
  const tabs = ['الأعمال الصالحة',  'الأخلاق','المتفق عليه', 'الكل'];

  // البيانات الخاصة بالأحاديث المختارة (3 بطاقات سفلية)
  const selectedHadiths = [
    {
      id: 1,
      categoryTag: 'النيات والعبادات',
      categoryTagBg: 'bg-[#EAF3EE] text-[#2D5A43]',
      statusTag: 'صحيح متفق عليه',
      statusTagBg: 'bg-[#E3F5EC] text-[#0D7D4D]',
      text: '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...»',
      rawi: 'عمر بن الخطاب رضي الله عنه',
      source: 'صحيح البخاري (رقم 1) وصحيح مسلم',
    },
    {
      id: 2,
      categoryTag: 'الأخلاق والآداب',
      categoryTagBg: 'bg-[#FEF7E6] text-[#A17C20]',
      statusTag: 'صحيح البخاري',
      statusTagBg: 'bg-[#E3F5EC] text-[#0D7D4D]',
      text: '«الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَر مَا نَهَى اللَّهُ عَنْهُ»',
      rawi: 'عبدالله بن عمرو رضي الله عنهما',
      source: 'صحيح البخاري (رقم 10)',
    },
    {
      id: 3,
      categoryTag: 'المودة والإيمان',
      categoryTagBg: 'bg-[#EAF3EE] text-[#2D5A43]',
      statusTag: 'صحيح مسلم',
      statusTagBg: 'bg-[#E3F5EC] text-[#0D7D4D]',
      text: '«لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»',
      rawi: 'أنس بن مالك رضي الله عنه',
      source: 'متفق عليه (مسلم رقم 45)',
    },
  ];

  return (
    <div className=" bg-[#FAF8F5] text-[#2C3E35] p-4 md:p-10 font-sans" >
      {/* تضمين الخطوط العربية */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700;800&display=swap" 
        rel="stylesheet" 
      />

      <div className="max-w-7xl mx-auto space-y-12" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        
        {/* ================= SECTION 1: TOPICS GRID ================= */}
        <section className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-6 bg-[#1E3E30] rounded-full inline-block"></span>
              <h2 className="text-2xl font-bold text-[#1E3E30]">
                اكتشف الأحاديث حسب الموضوع
              </h2>
            </div>

            <button className="flex items-center gap-1.5 text-xs text-[#7A7368] hover:text-[#1E3E30] transition-colors font-semibold">
              <span>عرض جميع الأبواب</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Topics 6-Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topicCards.map((topic) => {
              const IconComponent = topic.icon;
              return (
                <div 
                  key={topic.id}
                  className="bg-white border border-[#EBE6DD] rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Icon Header */}
                    <div className="flex justify-end">
                      <div className={`w-12 h-12 rounded-xl ${topic.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                        <IconComponent className={`w-6 h-6 ${topic.iconColor}`} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[#1E3E30] text-right">
                      {topic.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#7A7368] leading-relaxed text-right min-h-[40px]">
                      {topic.description}
                    </p>
                  </div>

                  {/* Card Footer: Count and Arrow */}
                  <div className="pt-4 border-t border-[#F5F1EA] flex items-center justify-between text-xs text-[#8A8378]">
                    <ArrowLeft className="w-4 h-4 text-[#A59F94] group-hover:-translate-x-1 transition-transform" />
                    <span>{topic.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 2: SELECTED HADITHS ================= */}
        <section className="space-y-6 pt-4">
          
          {/* Header with Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Filter Tabs (Left visual side) */}
            <div className="flex items-center gap-2 order-2 md:order-1 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-[#1E3E30] text-white shadow-xs'
                      : 'bg-white text-[#7A7368] border border-[#EAE5DD] hover:bg-[#F5F2EC]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-2.5 order-1 md:order-2 self-start md:self-auto">
              <span className="bg-[#E2ECE7] text-[#1E3E30] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#CBDCD2]">
                من جوامع الكلم
              </span>
              <h2 className="text-2xl font-bold text-[#1E3E30] flex items-center gap-2">
                أحاديث مختارة
                <span className="w-2 h-6 bg-[#1E3E30] rounded-full inline-block"></span>
              </h2>
            </div>

          </div>

          {/* Selected Hadiths 3-Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" >
            {selectedHadiths.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-[#EBE6DD] rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6"
              >
                {/* Header Tags */}
                <div className="flex items-center justify-between ">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${item.statusTagBg}`}>
                    {item.statusTag}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${item.categoryTagBg}`}>
                    {item.categoryTag}
                  </span>
                </div>

                {/* Hadith Text */}
                <div className="py-2">
                  <p 
                    className="text-xl md:text-2xl text-[#1E3E30] font-bold text-center leading-relaxed"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {item.text}
                  </p>
                </div>

                {/* Narrator & Source */}
                <div className="space-y-1 text-xs text-right  border-t border-[#F5F1EA] pt-4 text-[#7A7368]" >
                  <p>
                    <span className="font-semibold text-[#1E3E30]">الراوي:</span> {item.rawi}
                  </p>
                  <p>
                    <span className="font-semibold text-[#1E3E30]">المصدر:</span> {item.source}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button 
                    className="p-2 border border-[#EBE6DD] rounded-lg text-[#8A8378] hover:bg-[#F5F2EC] hover:text-[#1E3E30] transition-colors"
                    title="حفظ"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button className="flex items-center gap-1.5 bg-[#F5F2EC] hover:bg-[#EAE4D9] text-[#1E3E30] text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    <div className="w-4 h-4 rounded-full bg-[#1E3E30] flex items-center justify-center text-white">
                      <Play className="w-2.5 h-2.5 fill-current mr-0.5" />
                    </div>
                    <span>قراءة التفاصيل</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
};

export default HadithTopics;