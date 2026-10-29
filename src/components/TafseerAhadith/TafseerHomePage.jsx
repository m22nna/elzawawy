import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Navbar from "../NavBar";
import HadithVoiceBar from "../Ahadees/HadithVoiceBar";
import { useDailyHadith, useHadiths, useSavedHadiths } from "../Ahadees/hadithData";
import { useHadithSpeech } from "../Ahadees/useHadithSpeech";
import HadithDetails from "./HadithDetailes";
import HadithExplanation from "./HadithExplanation";
import RelatedAhadith from "./RelatedAhadith";

const RELATED_COUNT = 3;

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-pulse space-y-6" dir="rtl" aria-busy="true">
      <div className="h-8 w-2/3 rounded-lg bg-[#1E3E30]/10" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-80 rounded-2xl bg-[#1E3E30]/10" />
        <div className="lg:col-span-8 h-80 rounded-2xl bg-[#1E3E30]/10" />
      </div>
    </div>
  );
}

function Notice({ title, text, action, onAction }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4" dir="rtl">
      <h1 className="text-xl font-extrabold text-[#1E3E30]">{title}</h1>
      <p className="text-sm text-[#6E675D] leading-7">{text}</p>
      <button
        type="button"
        onClick={onAction}
        className="bg-[#1E3E30] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#174828] transition-colors cursor-pointer"
      >
        {action}
      </button>
    </div>
  );
}

const TafseerHomePage = () => {
  const { order } = useParams();
  const navigate = useNavigate();
  const { hadiths, loading, error, retry } = useHadiths();
  const daily = useDailyHadith(hadiths);
  const [savedIds, toggleSaved] = useSavedHadiths();
  const speech = useHadithSpeech();

  const total = hadiths?.length ?? 0;
  const index = useMemo(
    () => (hadiths && order ? hadiths.findIndex((h) => h.sortOrder === Number(order)) : -1),
    [hadiths, order]
  );
  const hadith = index >= 0 ? hadiths[index] : null;
  const prev = index > 0 ? hadiths[index - 1] : null;
  const next = index >= 0 && index < total - 1 ? hadiths[index + 1] : null;

  // أحاديث تانية من المكتبة (التالية في الترتيب) — الباك مفيهوش تصنيف بالموضوع فمش بندّعي إنها "من نفس الباب"
  const related = useMemo(() => {
    if (!hadiths || index < 0) return [];
    const out = [];
    for (let k = 1; k < total && out.length < RELATED_COUNT; k += 1) out.push(hadiths[(index + k) % total]);
    return out;
  }, [hadiths, index, total]);

  const open = (h) => navigate(`/tafseerhadith/${h.sortOrder}`);

  // نوقف القراءة الصوتية لما المستخدم ينتقل لحديث تاني
  useEffect(() => {
    speech.stop();
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

  // بدون رقم في اللينك: نفتح حديث اليوم بلينك ثابت يتشارك ويتحمّل تاني
  if (!order && daily.hadith) return <Navigate to={`/tafseerhadith/${daily.hadith.sortOrder}`} replace />;

  let body;
  if (loading || (!order && !error)) {
    body = <Skeleton />;
  } else if (error) {
    body = (
      <Notice
        title="تعذّر تحميل الحديث"
        text="حصلت مشكلة في الاتصال بالسيرفر. تأكد من الإنترنت وحاول مرة تانية."
        action="إعادة المحاولة"
        onAction={retry}
      />
    );
  } else if (!hadith) {
    body = (
      <Notice
        title="الحديث غير موجود"
        text="الرابط ده مش بيشاور على حديث في المكتبة."
        action="العودة إلى مكتبة الأحاديث"
        onAction={() => navigate("/ahadith")}
      />
    );
  } else {
    body = (
      <>
        <HadithDetails
          hadith={hadith}
          total={total}
          saved={savedIds.includes(hadith.sortOrder)}
          onToggleSaved={toggleSaved}
          speech={speech}
        />
        <HadithExplanation hadith={hadith} prev={prev} next={next} onOpen={open} />
        <RelatedAhadith related={related} onOpen={open} />
      </>
    );
  }

  return (
    <div className="pb-28 bg-[#FAF8F5] text-[#2C3E35] min-h-screen" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <Navbar />
      {body}
      {hadith && (
        <HadithVoiceBar
          hadith={hadith}
          speech={speech}
          saved={savedIds.includes(hadith.sortOrder)}
          onToggleSaved={toggleSaved}
          onStep={(delta) => {
            const target = delta < 0 ? prev : next;
            if (target) open(target);
          }}
          hasPrev={!!prev}
          hasNext={!!next}
        />
      )}
    </div>
  );
};

export default TafseerHomePage;
