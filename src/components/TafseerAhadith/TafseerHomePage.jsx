import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HadithVoiceBar from "../Ahadees/HadithVoiceBar";
import HadithDetails from "./HadithDetailes";
import HadithExplanation from "./HadithExplanation";
import RelatedAhadith from "./RelatedAhadith";
import Navbar from "../NavBar";
import { fetchRandomHadith } from "../../api/hadithApi";

const DEFAULT_HADITH = {
  textArabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
  source: "صحيح مسلم",
  explanation: "إرشاد نبوي كريم يحث المؤمن على اغتنام الأوقات في طلب العلم النافع، وبيان أن كل خطوة ومسعى في تحصيل العلم تُمهد لصاحبها أسباب النجاة ودخول الجنة.",
  sortOrder: 1
};

const TafseerHomePage = () => {
  const location = useLocation();

  // الحصول على الحديث الممرر من صفحة الأحاديث، أو من التخزين المؤقت
  const [hadith, setHadith] = useState(() => {
    if (location.state && location.state.hadith) {
      return location.state.hadith;
    }
    try {
      const saved = sessionStorage.getItem('currentHadith');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading saved hadith:", e);
    }
    return null;
  });

  const [loading, setLoading] = useState(!hadith);

  useEffect(() => {
    let isMounted = true;
    if (!hadith) {
      setLoading(true);
      fetchRandomHadith()
        .then((data) => {
          if (isMounted) {
            if (data && data.textArabic) {
              setHadith(data);
              try {
                sessionStorage.setItem('currentHadith', JSON.stringify(data));
              } catch (e) {}
            } else {
              setHadith(DEFAULT_HADITH);
            }
          }
        })
        .catch((err) => {
          console.error("فشل جلب الحديث في صفحة التفسير:", err);
          if (isMounted) {
            setHadith(DEFAULT_HADITH);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [hadith]);

  return (
    <>
      <Navbar />
      <HadithDetails hadith={hadith} loading={loading} />
      <HadithExplanation hadith={hadith} loading={loading} />
      <RelatedAhadith currentHadith={hadith} />
      <HadithVoiceBar hadith={hadith} />
    </>
  );
};

export default TafseerHomePage;