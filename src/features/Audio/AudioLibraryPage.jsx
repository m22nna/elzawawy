
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Search,
  Play,
  Pause,
  Download,
  Check,
  Music2,
  Headphones,
  AudioLines,
  BookOpen,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../../components/NavBar";
import { useRecitations } from "../../api/useRecitations";
import { useAudio } from "../Home/audio/AudioContext";
import { downloadManager } from "../Downloads/downloadManager";

const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^a-z0-9\u0600-\u06FF]/g, "");
};

const surahAliases = {
  36: ["ياسين", "يا سين", "yaseen", "yasin", "yaaseen", "ya sin"],
};

const matchesSearch = (track, search) => {
  const query = normalizeText(search);

  if (!query) return true;

  const names = [
    track.title,
    track.nameEnglish,
    track.englishName,
    ...(surahAliases[track.id] || []),
  ];

  return names.some((name) =>
    normalizeText(name).includes(query)
  );
};

const getRevelationType = (track) => {
  const type = String(
    track.revelationType ||
    track.revelationPlace ||
    track.type ||
    ""
  ).toLowerCase();

  if (type.includes("madani") || type.includes("مدني")) {
    return "مدنية";
  }

  if (type.includes("makki") || type.includes("مكي")) {
    return "مكية";
  }

  const madaniSurahs = [
    2, 3, 4, 5, 8, 9, 13, 22, 24, 33,
    47, 48, 49, 55, 57, 58, 59, 60, 61,
    62, 63, 64, 65, 66, 76, 98, 99, 110,
  ];

  const surahNumber = Number(track.id);

  return madaniSurahs.includes(surahNumber)
    ? "مدنية"
    : "مكية";
};

export default function AudioLibraryPage() {
  const { tracks } = useRecitations();
  const audio = useAudio();

  const downloads = useSyncExternalStore(
    downloadManager.subscribe,
    downloadManager.getItems
  );

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  const loading = tracks === null;

  const filteredTracks = useMemo(() => {
    if (!tracks) return [];

    return tracks.filter((track) =>
      matchesSearch(track, search)
    );
  }, [tracks, search]);

  useEffect(() => {
    setVisibleCount(9);
  }, [search]);

  const displayedTracks = filteredTracks.slice(0, visibleCount);

  const handlePlay = (track) => {
    if (audio.current?.id === track.id) {
      audio.toggle(track);
    } else {
      audio.playTrack({
        ...track,
        kind: "audio",
      });
    }
  };

  const handleDownload = (track) => {
    downloadManager.start({
      id: `recitation-${track.id}`,
      url: track.audioUrl,
      title: track.title,
      tag: "القرآن الكريم",
      category: "quran",
      type: "audio",
      durationSeconds: track.duration
        ? Number(track.duration)
        : null,
    });
  };

  const getDownload = (track) =>
    downloads.find(
      (item) => item.id === `recitation-${track.id}`
    );

  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-wird-mist font-body"
    >
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="text-muted transition hover:text-wird-green"
          >
            الرئيسية
          </Link>

          <ChevronLeft size={15} className="text-muted" />

          <span className="font-bold text-wird-green">
            المكتبة الصوتية
          </span>
        </div>

        {/* Hero */}
        <section className="relative mb-12 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#174b3a] to-[#28634d] px-6 py-12 text-white sm:px-12 sm:py-16">

          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -bottom-32 right-1/3 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative z-10 max-w-2xl">

            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white">
              <Headphones size={16} />
              استمع وتدبر
            </div>

            <h1 className="font-display text-3xl font-extrabold leading-relaxed sm:text-5xl">
              المكتبة الصوتية
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-8 text-white/75 sm:text-base">
              استمتع بالاستماع إلى التلاوات القرآنية،
              واختر السور التي تحبها واحفظها للاستماع
              إليها في أي وقت.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                <Music2 size={18} className="text-emerald-200" />

                <span className="text-sm">
                  {loading ? "..." : `${tracks.length} تلاوة`}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                <Download size={18} className="text-emerald-200" />

                <span className="text-sm">
                  تحميل واستماع بدون إنترنت
                </span>
              </div>

            </div>
          </div>

          <div className="absolute left-12 top-1/2 hidden -translate-y-1/2 opacity-10 lg:block">
            <BookOpen size={180} strokeWidth={0.7} />
          </div>

        </section>

        {/* Section Heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <span className="mb-2 block text-xs font-bold text-[#56836c]">
              القرآن الكريم
            </span>

            <h2 className="font-display text-2xl font-extrabold text-wird-green sm:text-3xl">
              جميع التلاوات
            </h2>

            <p className="mt-2 text-sm text-muted">
              اختر السورة واستمع إليها أو حمّلها لجهازك.
            </p>
          </div>

          {/* Downloads Button */}
          <Link
            to="/downloads"
            className="group flex w-fit items-center gap-3 rounded-xl border border-[#d8e9df] bg-white px-5 py-3 text-sm font-bold text-wird-green shadow-sm transition hover:-translate-y-0.5 hover:border-wird-green hover:bg-[#f3faf6]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f3ec] text-wird-green transition group-hover:bg-wird-green group-hover:text-white">
              <Download size={18} />
            </span>

            <span>التنزيلات</span>

            <ChevronLeft
              size={16}
              className="text-wird-green/50 transition group-hover:-translate-x-1"
            />
          </Link>

        </div>

        {/* Search */}
        <div className="mb-8 rounded-2xl border border-[#e0ece5] bg-white p-3 shadow-sm">

          <div className="relative">

            <Search
              size={19}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم السورة..."
              className="w-full rounded-xl bg-[#f1f7f3] py-4 pr-12 pl-4 text-sm text-wird-green outline-none transition placeholder:text-muted focus:ring-1 focus:ring-wird-green/30"
            />

          </div>

        </div>

        {/* Audio Cards */}
        {loading ? (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>

        ) : filteredTracks.length === 0 ? (

          <div className="rounded-3xl border border-[#e0ece5] bg-white px-6 py-16 text-center">
            <Music2
              size={40}
              className="mx-auto mb-4 text-wird-green/50"
            />

            <h3 className="font-bold text-wird-green">
              لا توجد تلاوات مطابقة
            </h3>

            <p className="mt-2 text-sm text-muted">
              جربي البحث باسم سورة أخرى.
            </p>
          </div>

        ) : (

          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {displayedTracks.map((track) => {

                const active = audio.current?.id === track.id;
                const playing = active && audio.playing;

                const download = getDownload(track);

                const completed = download?.status === "completed";
                const downloading = download?.status === "downloading";

                const englishName =
                  track.nameEnglish ||
                  track.englishName ||
                  `Surah ${track.id}`;

                return (

                  <article
                    key={track.id}
                    className={`group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${
                      active
                        ? "border-wird-green/50"
                        : "border-[#e0ece5]"
                    }`}
                  >

                    <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#eaf4ee] blur-2xl transition group-hover:scale-150" />

                    <div className="relative z-10">

                      {/* Card Top */}
                      <div className="mb-6 flex items-center justify-between">

                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8f3ec] text-lg font-bold text-wird-green">
                          {String(track.id).padStart(2, "0")}
                        </div>

                        <span
  className={`rounded-full px-4 py-1.5 text-[11px] font-bold ${
    getRevelationType(track) === "مكية"
      ? "border border-[#d7eadc] bg-[#edf7ef] text-[#39764e]"
      : "border border-[#d8e5f2] bg-[#edf4fb] text-[#47749d]"
  }`}
>
  {getRevelationType(track)}
</span>

                      </div>

                      {/* Surah Names */}
                      <div className="mb-7">

                        <h3 className="font-display text-2xl font-extrabold text-wird-green">
                          {track.title}
                        </h3>

                        <p
                          dir="ltr"
                          className="mt-1 text-sm font-semibold tracking-wide text-muted"
                        >
                          {englishName}
                        </p>

                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">

                        <button
                          type="button"
                          onClick={() => handlePlay(track)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-wird-green py-3 text-xs font-bold text-white transition hover:bg-[#245b45]"
                        >

                          {playing ? (
                            <Pause size={16} fill="currentColor" />
                          ) : (
                            <Play
                              size={16}
                              fill="currentColor"
                              className="rotate-180"
                            />
                          )}

                          {playing ? "إيقاف مؤقت" : "استمع الآن"}

                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(track)}
                          disabled={completed || downloading}
                          title={
                            completed
                              ? "تم تحميل التلاوة"
                              : downloading
                                ? "جاري التحميل"
                                : "تحميل التلاوة"
                          }
                          className={`grid h-11 w-12 shrink-0 place-items-center rounded-xl border transition ${
                            completed
                              ? "border-[#cce5d5] bg-[#eaf6ee] text-green-700"
                              : downloading
                                ? "border-[#dcebe2] bg-[#edf5f0] text-wird-green"
                                : "border-[#dcebe2] bg-[#f1f7f3] text-wird-green hover:border-wird-green hover:bg-[#e5f1e9]"
                          }`}
                        >

                          {completed ? (
                            <Check size={19} />
                          ) : downloading ? (
                            <AudioLines size={19} className="animate-pulse" />
                          ) : (
                            <Download size={19} />
                          )}

                        </button>

                      </div>

                      {downloading && (
                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-[10px] text-muted">
                            <span>جاري التحميل</span>
                            <span>{download.progress || 0}%</span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[#e8f1eb]">
                            <div
                              className="h-full rounded-full bg-wird-green transition-all"
                              style={{
                                width: `${download.progress || 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                    </div>

                  </article>

                );
              })}

            </div>

            {/* Load More */}
            {filteredTracks.length > visibleCount && (
  <div className="mt-12 flex justify-center">
    <button
      type="button"
      onClick={() => setVisibleCount((prev) => prev + 9)}
      className="group flex items-center gap-2 rounded-full border border-[#dcebe2] bg-white px-7 py-3 text-sm font-semibold text-wird-green shadow-sm transition-all duration-300 hover:border-[#a9cbb5] hover:bg-[#f3f8f4] hover:shadow-md"
    >
      <span>عرض المزيد من السور</span>

      <ChevronDown
        size={17}
        className="transition-transform duration-300 group-hover:translate-y-1"
      />
    </button>
  </div>
)}

          </>

        )}

        {/* Footer */}
        {!loading && filteredTracks.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted">
            <AudioLines size={16} />
            عرض {displayedTracks.length} من أصل {filteredTracks.length} تلاوة
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-[#dcebe2] bg-[#eaf4ee] p-6 text-center">

          <div className="mb-3 flex justify-center text-wird-green">
            <BookOpen size={25} />
          </div>

          <p className="font-bold text-wird-green">
            اجعل القرآن رفيق يومك
          </p>

          <p className="mt-2 text-xs leading-7 text-muted">
            يمكنك تحميل التلاوات والاستماع إليها لاحقاً من صفحة التنزيلات.
          </p>

        </div>

      </main>
    </div>
  );
}
