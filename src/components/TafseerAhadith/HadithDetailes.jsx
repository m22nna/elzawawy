import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Heart,
  Share2,
} from "lucide-react";
import { arNum } from "../../features/Quran/utils";

const FONT_MIN = 20;
const FONT_MAX = 40;

const HadithDetails = ({ hadith, total, saved, onToggleSaved }) => {
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(28);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const flash = (set) => {
    set(true);
    setTimeout(() => set(false), 1800);
  };

  const copyText = async (text, set) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(set);
    } catch {}
  };

  const plainText = `«${hadith.textArabic}»\nالمصدر: ${hadith.source}`;

  const handleCopy = () => copyText(plainText, setCopied);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "حديث نبوي",
          text: plainText,
          url,
        });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }

    copyText(`${plainText}\n${url}`, setShared);
  };

  const toolBtn =
    "flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EC] border border-[#EBE6DD] text-[#6E675D] text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer";

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* BREADCRUMB & HEADER */}
        <header className="space-y-3" dir="rtl">
          <nav
            className="flex flex-wrap items-center gap-1.5 text-xs text-[#8C857B] font-medium"
            aria-label="مسار الصفحة"
          >
            <button
              type="button"
              className="hover:text-[#1E3E30] cursor-pointer"
              onClick={() => navigate("/")}
            >
              الرئيسية
            </button>

            <span>/</span>

            <button
              type="button"
              className="hover:text-[#1E3E30] cursor-pointer"
              onClick={() => navigate("/ahadith")}
            >
              مكتبة الأحاديث النبوية
            </button>

            <span>/</span>

            <span className="text-[#2C3E35] font-semibold">
              تفاصيل الحديث وشرحه
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E3E30]">
                تفاصيل الحديث النبوي الشريف
              </h1>

              {hadith.source && (
                <span className="bg-[#EAF3EE] text-[#2D5A43] text-xs font-semibold px-3 py-1 rounded-full border border-[#D3E5DC]">
                  {hadith.source}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/ahadith")}
              className="self-start md:self-auto bg-white hover:bg-[#F5F2EC] border border-[#E2DDD5] text-[#1E3E30] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى مكتبة الأحاديث</span>
            </button>
          </div>
        </header>

        {/* HADITH CONTENT */}
        <div className="grid grid-cols-1 gap-6" dir="rtl">
          <div className="bg-white border border-[#EBE6DD] rounded-2xl p-6 md:p-8 space-y-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA] pb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1E3E30] text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>

                <div className="text-right">
                  <span className="text-[20px] font-bold text-[#1E3E30] block">
                    سنة النبي المصطفى ﷺ
                  </span>

                  <span className="text-[15px] text-[#8C857B]">
                    نص الحديث الشريف ومصدره
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-[#FAF8F5] border border-[#EBE6DD] rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setFontSize((v) => Math.min(v + 2, FONT_MAX))
                    }
                    disabled={fontSize >= FONT_MAX}
                    className="px-2.5 py-1 text-xs font-bold text-[#1E3E30] hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    title="تكبير الخط"
                  >
                    A+
                  </button>

                  <span className="text-[#D8D2C7]">|</span>

                  <button
                    type="button"
                    onClick={() =>
                      setFontSize((v) => Math.max(v - 2, FONT_MIN))
                    }
                    disabled={fontSize <= FONT_MIN}
                    className="px-2.5 py-1 text-xs font-bold text-[#1E3E30] hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    title="تصغير الخط"
                  >
                    A-
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSaved(hadith.sortOrder)}
                  aria-pressed={saved}
                  className={`flex items-center gap-1.5 border text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                    saved
                      ? "bg-[#FEF7E6] border-[#E8D4A2] text-[#A17C20]"
                      : "bg-[#FAF8F5] border-[#EBE6DD] text-[#6E675D] hover:bg-[#F5F2EC]"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`}
                  />

                  <span>{saved ? "محفوظ" : "حفظ"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className={toolBtn}
                >
                  {shared ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}

                  <span>{shared ? "تم نسخ الرابط" : "مشاركة"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={toolBtn}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  <span>{copied ? "تم النسخ" : "نسخ"}</span>
                </button>
              </div>
            </div>

            <div className="py-6 px-2 text-center space-y-6">
              <Ornament />

              <p
                className="text-[#1E3E30] font-bold text-center transition-all duration-200"
                style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: `${fontSize}px`,
                  lineHeight: 2.2,
                }}
              >
                «{hadith.textArabic}»
              </p>

              <Ornament />
            </div>

            <div className="border-t border-[#F5F1EA] pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-[#F0EBE3]">
                <Meta
                  label="المصدر"
                  value={hadith.source || "غير محدد"}
                />

                <Meta
                  label="ترتيبه في المكتبة"
                  value={`${arNum(hadith.sortOrder)} من ${arNum(total)}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Ornament = () => (
  <div
    className="flex justify-center text-[#C29B38]"
    aria-hidden="true"
  >
    <div className="w-3 h-3 rotate-45 border-2 border-[#C29B38] relative">
      <div className="w-1.5 h-1.5 bg-[#C29B38] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
);

const Meta = ({ label, value }) => (
  <div className="space-y-1 p-2">
    <div className="text-[11px] text-[#8C857B]">{label}</div>
    <p className="text-sm font-bold text-[#1E3E30]">{value}</p>
  </div>
);

export default HadithDetails;