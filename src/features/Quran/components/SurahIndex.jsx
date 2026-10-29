import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LayoutGrid, Pause, Play } from "lucide-react";
import { usePlayer } from "../player/PlayerProvider";
import { JUZ_LINK_PAGE, JUZ_NAMES, firstPageOfSurah, juzOfPage, pageRangeOfSurah } from "../mushaf";
import { arNum, isMakki, placeLabel, surahTitle } from "../utils";

const FEATURED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 19, 36, 55, 67, 114];

function SurahCard({ surah, current }) {
  const player = usePlayer();
  const playing = player.surahId === surah.id && player.playing;
  const range = pageRangeOfSurah(surah.id).map(arNum).join("-");

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 ${
        current ? "border-[#C69234] ring-1 ring-[#C6923440]" : "border-[#E6EFE9]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F7EDE0] text-xs font-extrabold text-bronze">
            {arNum(surah.id)}
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-pine">{surahTitle(surah)}</h3>
            <p className="text-[10px] text-muted" dir="ltr">{surah.nameEnglish}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isMakki(surah) ? "bg-[#F7EDE0] text-bronze" : "bg-[#E6EFE9] text-pine"}`}>
          {placeLabel(surah)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-muted">
          {arNum(surah.ayahCount)} آية • صفحة {range}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => player.toggle(surah.id)}
            disabled={!player.hasTrack?.(surah.id)}
            aria-label={playing ? "إيقاف التلاوة" : "تشغيل التلاوة"}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#E6EFE9] text-pine disabled:opacity-40"
          >
            {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
          <Link
            to={`/quran/page/${firstPageOfSurah(surah.id)}`}
            className={`rounded-lg px-4 py-1.5 text-[11px] font-bold ${current ? "bg-pine text-white" : "border border-[#E6EFE9] bg-white text-pine hover:bg-[#F2F7F4]"}`}
          >
            قراءة
          </Link>
        </div>
      </div>
    </article>
  );
}

function JuzCard({ juz, current }) {
  const page = JUZ_LINK_PAGE[juz - 1];
  return (
    <article
      className={`flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 ${
        current ? "border-[#C69234] ring-1 ring-[#C6923440]" : "border-[#E6EFE9]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#E6EFE9] text-xs font-extrabold text-pine">{arNum(juz)}</span>
        <div>
          <h3 className="text-sm font-extrabold text-pine">الجزء {JUZ_NAMES[juz - 1]}</h3>
          <p className="text-[10px] text-muted">يبدأ من صفحة {arNum(page)}</p>
        </div>
      </div>
      <Link
        to={`/quran/page/${page}`}
        className={`rounded-lg px-4 py-1.5 text-[11px] font-bold ${current ? "bg-pine text-white" : "border border-[#E6EFE9] bg-white text-pine hover:bg-[#F2F7F4]"}`}
      >
        قراءة
      </Link>
    </article>
  );
}

export default function SurahIndex({ surahs, currentId, currentPage }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const counts = useMemo(() => {
    const makki = surahs?.filter(isMakki).length ?? 0;
    return { all: surahs?.length ?? 114, makki, madani: (surahs?.length ?? 114) - makki };
  }, [surahs]);

  const list = useMemo(() => {
    if (!surahs || filter === "juz") return [];
    const byFilter = surahs.filter((s) => filter === "all" || (filter === "makki" ? isMakki(s) : !isMakki(s)));
    return filter === "all" && !expanded ? byFilter.filter((s) => FEATURED.includes(s.id)) : byFilter;
  }, [surahs, filter, expanded]);

  const chips = [
    ["all", `جميع السور (${arNum(counts.all)})`],
    ["makki", `السور المكية (${arNum(counts.makki)})`],
    ["madani", `السور المدنية (${arNum(counts.madani)})`],
    ["juz", "الأجزاء"],
  ];
  const currentJuz = currentPage ? juzOfPage(currentPage) : null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-pine">فهرس السور</h2>
          <p className="text-[11px] text-muted">{arNum(114)} سورة مباركة</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold transition ${filter === key ? "bg-pine text-white" : "bg-white text-pine hover:bg-[#E6EFE9]"}`}
            >
              {key === "juz" && <LayoutGrid size={12} />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {filter === "juz" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 30 }, (_, i) => (
            <JuzCard key={i + 1} juz={i + 1} current={i + 1 === currentJuz} />
          ))}
        </div>
      ) : !surahs ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#E6EFE9]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <SurahCard key={s.id} surah={s} current={s.id === currentId} />
          ))}
        </div>
      )}

      {filter === "all" && surahs && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6EFE9] bg-white px-6 py-2.5 text-xs font-bold text-pine hover:bg-[#F2F7F4]"
          >
            {expanded ? "عرض أقل" : "عرض المزيد من السور (باقي المصحف الشريف)"}
            <ChevronDown size={14} className={expanded ? "rotate-180" : ""} />
          </button>
          <p className="mt-2 text-[10px] text-muted">تصفح المصحف كاملاً ({arNum(114)} سورة مباركة)</p>
        </div>
      )}
    </section>
  );
}