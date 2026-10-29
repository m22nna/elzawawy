import { useEffect, useState } from "react";
import { useApi } from "../../../api/useApi";
import { WIRD_ROWS } from "../../../config/home";
import { doneCount, loadProgress, subscribeProgress } from "../wirdStore";

/* الورد المستحق حسب الوقت: الصباح، ومن ساعة فتح المساء (WIRD_ROWS) يبقى المساء */
const dueSlug = (hour) => {
  const evening = WIRD_ROWS.find((r) => r.slug === "evening");
  return evening?.unlockHour && hour >= evening.unlockHour ? "evening" : "morning";
};

/* تقدّم الأذكار اللي اتعلّم عليها "منجز" في صفحة الأذكار (نفس wirdStore).
   بيعرض القسم اللي بتشتغل عليه ولسه ماخلصش، وإلا الورد المستحق حسب الوقت. */
export function useAdhkarProgress() {
  const adhkar = useApi("/v1/adhkar");
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    setProgress(loadProgress());
    return subscribeProgress(() => setProgress(loadProgress()));
  }, []);

  const cats = Array.isArray(adhkar.data) ? adhkar.data : [];
  const stat = (slug) => {
    const c = cats.find((x) => x.slug === slug);
    const total = c?.items?.length ?? 0;
    return {
      slug,
      name: c?.nameArabic ?? "",
      total,
      done: Math.min(doneCount(progress, slug), total),
    };
  };

  const due = stat(dueSlug(new Date().getHours()));
  const last = progress.last ? stat(progress.last) : null;
  const shown = last && last.total > 0 && last.done < last.total ? last : due;

  return { ...shown, loading: adhkar.loading, error: adhkar.error };
}