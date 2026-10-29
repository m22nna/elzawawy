import { Link2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RelatedAhadith = ({ related = [], onOpen }) => {
  const navigate = useNavigate();
  if (!related.length) return null;

  return (
    <div className="mb-10 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE6DD] flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5 text-[#2C3E35]" />
            </div>
            <div className="text-right">
              <h2 className="text-lg md:text-xl font-bold text-[#1E3E30]">المزيد من الأحاديث</h2>
              <p className="text-xs text-[#8C857B] mt-0.5">من مكتبة الأحاديث النبوية</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/ahadith")}
            className="flex items-center gap-1 text-xs md:text-sm font-semibold text-[#6E675D] hover:text-[#1E3E30] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>عرض كل الأحاديث</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {related.map((h) => (
            <article
              key={h.sortOrder}
              className="bg-white border border-[#EBE6DD] rounded-2xl p-5 flex flex-col gap-4 shadow-xs hover:shadow-md transition-shadow"
            >
              {h.source && <span className="self-start text-[11px] font-bold text-[#2C3E35] bg-[#E8EEEA] px-2.5 py-1 rounded-md">{h.source}</span>}

              <p className="text-[#1E3E30] font-bold text-lg leading-9 line-clamp-4" style={{ fontFamily: "'Amiri', serif" }}>
                «{h.textArabic}»
              </p>

              {h.explanation && <p className="text-xs text-[#6E675D] leading-6 line-clamp-2">{h.explanation}</p>}

              <button
                type="button"
                onClick={() => onOpen(h)}
                className="mt-auto flex items-center justify-between text-xs font-bold text-[#1E3E30] hover:text-[#96711D] transition-colors cursor-pointer"
              >
                <span>قراءة الحديث كاملاً</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedAhadith;
