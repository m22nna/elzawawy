import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../NavBar";
import DailyHadith from "./DailyHadith";
import HadithTopics from "./HadithTopics";
import HadithFooter from "./HadithFooter";
import HadithVoiceBar from "./HadithVoiceBar";
import { useDailyHadith, useHadiths, useSavedHadiths } from "./hadithData";
import { useHadithSpeech } from "./useHadithSpeech";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700;800&display=swap";

const scrollToList = () =>
  document.getElementById("hadith-list")?.scrollIntoView?.({ behavior: "smooth", block: "start" });

export function AhadithHomePage() {
  const navigate = useNavigate();
  const { hadiths, loading, error, retry } = useHadiths();
  const daily = useDailyHadith(hadiths);
  const [savedIds, toggleSaved] = useSavedHadiths();
  const speech = useHadithSpeech();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | saved | اسم المصدر
  const [barHadith, setBarHadith] = useState(null); // الحديث اللي ظاهر في شريط الصوت (null = حديث اليوم)

  // لما حديث اليوم يتغيّر نوقف القراءة ونرجّع الشريط لحديث اليوم
  useEffect(() => {
    speech.stop();
    setBarHadith(null);
  }, [daily.hadith]); // eslint-disable-line react-hooks/exhaustive-deps

  const openHadith = useCallback(
    (hadith) => navigate(`/tafseerhadith/${hadith.sortOrder}`),
    [navigate]
  );

  // قراءة حديث (من حديث اليوم أو من أي كارت): الشريط السفلي بيعرض الحديث ده
  const playHadith = (hadith) => {
    setBarHadith(hadith);
    speech.toggle(hadith.textArabic);
  };

  const audioHadith = barHadith ?? daily.hadith;
  const audioIndex = audioHadith && hadiths ? hadiths.findIndex((h) => h.sortOrder === audioHadith.sortOrder) : -1;

  // الحديث السابق/التالي في المكتبة من الشريط السفلي
  const stepAudio = (delta) => {
    const next = hadiths?.[audioIndex + delta];
    if (!next) return;
    const wasPlaying = speech.playing;
    setBarHadith(next);
    if (wasPlaying) speech.toggle(next.textArabic);
  };

  const discover = () => {
    daily.another();
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const browseAll = () => {
    setQuery("");
    setFilter("all");
    scrollToList();
  };

  const showSaved = () => {
    setQuery("");
    setFilter("saved");
    scrollToList();
  };

  const total = hadiths?.length ?? 0;

  return (
    <div className="pb-28 bg-[#FAF9F6] min-h-screen">
      <link href={FONTS} rel="stylesheet" />
      <Navbar />
      <DailyHadith
        hadith={daily.hadith}
        total={total}
        loading={loading}
        error={error}
        onRetry={retry}
        isDailyPick={daily.isDailyPick}
        query={query}
        onQuery={(q) => {
          setQuery(q);
          if (filter === "saved") setFilter("all");
        }}
        onSubmitSearch={scrollToList}
        saved={daily.hadith ? savedIds.includes(daily.hadith.sortOrder) : false}
        onToggleSaved={toggleSaved}
        onOpen={openHadith}
        onPlay={playHadith}
        speech={speech}
      />
      <HadithTopics
        hadiths={hadiths}
        loading={loading}
        error={error}
        onRetry={retry}
        filter={filter}
        onFilter={setFilter}
        query={query}
        savedIds={savedIds}
        onToggleSaved={toggleSaved}
        onOpen={openHadith}
        onPlay={playHadith}
        speech={speech}
      />
      <HadithFooter
        onDiscover={discover}
        onBrowseAll={browseAll}
        total={total}
        savedCount={savedIds.length}
        onShowSaved={showSaved}
      />
      <HadithVoiceBar
        hadith={audioHadith}
        speech={speech}
        saved={audioHadith ? savedIds.includes(audioHadith.sortOrder) : false}
        onToggleSaved={toggleSaved}
        onStep={stepAudio}
        hasPrev={audioIndex > 0}
        hasNext={audioIndex >= 0 && audioIndex < total - 1}
      />
    </div>
  );
}

export default AhadithHomePage;