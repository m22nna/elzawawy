import { ArrowLeft, ArrowRight, BookOpenText, Sparkles } from "lucide-react";

// الشرح بييجي من الباك كنص واحد (explanation) — بنقسمه فقرات على الأسطر لو فيه أسطر
const toParagraphs = (text = "") =>
  String(text)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

const snippet = (h) => (h.textArabic.length > 90 ? `${h.textArabic.slice(0, 90)}…` : h.textArabic);

const NavButton = ({ hadith, label, Icon, onOpen, align }) =>
  hadith ? (
    <button
      type="button"
      onClick={() => onOpen(hadith)}
      className="w-full text-right rounded-xl border border-[#EFE9DE] bg-white hover:bg-[#FCF9F2] hover:border-[#E3D6B8] transition-colors p-4 space-y-2 cursor-pointer"
    >
      <span className={`flex items-center gap-1.5 text-xs font-bold text-[#96711D] ${align}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="block text-sm leading-7 text-[#3D372E] line-clamp-3" style={{ fontFamily: "'Amiri', serif" }}>
        {snippet(hadith)}
      </span>
    </button>
  ) : null;

const HadithExplanation = ({ hadith, prev, next, onOpen }) => {
  const paragraphs = toParagraphs(hadith.explanation);

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ---------- التنقل بين الأحاديث (يمين في RTL = يسار الديزاين) ---------- */}
        {(prev || next) && (
          <aside className="lg:col-span-4 bg-white border border-[#EBE6DD] rounded-2xl p-5 space-y-4 shadow-xs order-2 lg:order-1">
            <h2 className="text-base font-bold text-[#1E3E30]">تصفّح الأحاديث</h2>
            <div className="space-y-3">
              <NavButton hadith={next} label="الحديث التالي" Icon={ArrowLeft} onOpen={onOpen} align="justify-start" />
              <NavButton hadith={prev} label="الحديث السابق" Icon={ArrowRight} onOpen={onOpen} align="justify-start" />
            </div>
          </aside>
        )}

        {/* ---------- الشرح ---------- */}
        <section
          className={`${prev || next ? "lg:col-span-8" : "lg:col-span-12"} bg-white border border-[#EBE6DD] rounded-2xl p-6 md:p-8 space-y-6 shadow-xs order-1 lg:order-2`}
        >
          <div className="flex items-start justify-between border-b border-[#F5F1EA] pb-5">
            <div className="text-right space-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-[#1E3E30]">شرح الحديث الشريف وبيان معانيه</h2>
              <p className="text-xs text-[#8C857B]">بيان المعنى الإجمالي للحديث</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD] flex items-center justify-center text-[#1E3E30] shrink-0">
              <BookOpenText className="w-5 h-5" />
            </div>
          </div>

          {paragraphs.length ? (
            <div className="bg-[#FCF9F2] border-r-4 border-[#C29B38] rounded-l-xl p-6 space-y-4 text-right">
              <div className="flex items-center gap-2 text-[#96711D] font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#C29B38]" />
                <span>الشرح</span>
              </div>
              {paragraphs.map((p, i) => (
                <p key={i} className="text-base md:text-lg text-[#3D372E] leading-loose font-medium">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8C857B] text-center py-8">لا يوجد شرح مسجّل لهذا الحديث حتى الآن.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default HadithExplanation;
