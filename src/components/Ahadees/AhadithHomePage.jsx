import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../NavBar";
import DailyHadith from "./DailyHadith";
import HadithTopics from "./HadithTopics";
import HadithFooter from "./HadithFooter";
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


  const openHadith = useCallback(
    (hadith) => navigate(`/tafseerhadith/${hadith.sortOrder}`),
    [navigate]
  );


  const playHadith = (hadith) => speech.play(hadith, hadiths);

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
    </div>
  );
}

export default AhadithHomePage;