import { ArrowLeft, Download, Heart, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useAudio } from "../features/Home/audio/AudioContext";
import { useFeaturedAudio } from "../features/Home/hooks/useFeaturedAudio";
import Waveform from "./ui/Waveform";

const fmt = (s) =>
  s
    ? `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
        Math.round(s % 60)
      ).padStart(2, "0")}`
    : null;

function AudioCard({ item, reciterName }) {
  const { current, playing, progress, failed, toggle } = useAudio();
  const [liked, setLiked] = useState(false);

  const active = current?.id === item.id;
  const isPlaying = active && playing;
  const duration = fmt(item.durationSeconds);

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl bg-wird-card p-2 shadow-soft transition duration-300 hover:-translate-y-1">
      {/* Audio Cover */}
      <div className="relative h-44 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-wird-green to-wird-gold-dark sm:h-48 lg:h-52 xl:h-56">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-wird-gold-dark">
          {item.tag}
        </span>

        {duration && (
          <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 font-mono text-[11px] text-white">
            {duration} دقيقة
          </span>
        )}
      </div>

      {/* Audio Information */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4 sm:px-4">
        <h3 className="line-clamp-2 min-h-[3.5rem] font-display text-base font-bold leading-7 text-wird-green sm:text-lg">
          {item.title}
        </h3>

        <p className="mt-1 text-xs text-muted">{reciterName}</p>

        <div className="my-4">
           <div className="rounded-xl  px-3 py-2">
               <Waveform seed={item.id} progress={active ? progress : 0} />
           </div>
               {active && failed && (
               <p className="mt-2 text-[11px] text-red-600">تعذّر تشغيل الصوت حاليًا</p>
            )}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-wird-green/5 pt-3">
          <button
            type="button"
            onClick={() => toggle(item)}
            className="flex items-center gap-2 rounded-full bg-wird-green px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 sm:px-5"
          >
            {isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play
                size={14}
                fill="currentColor"
                className="rotate-180"
              />
            )}

            {isPlaying ? "إيقاف مؤقت" : "استمع الآن"}
          </button>

          <div className="flex items-center gap-4 text-muted">
            <a
              href={item.audioUrl}
              download
              target="_blank"
              rel="noreferrer"
              aria-label="تحميل التسجيل"
              title="تحميل"
              className="transition hover:text-wird-green"
            >
              <Download size={18} />
            </a>

            <button
              type="button"
              onClick={() => setLiked((value) => !value)}
              aria-label={liked ? "إلغاء الإعجاب" : "إعجاب"}
              aria-pressed={liked}
              title="إعجاب"
              className="transition hover:text-wird-green"
            >
              <Heart
                size={18}
                className={
                  liked ? "fill-wird-gold text-wird-gold" : ""
                }
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedAudio() {
  const { items, reciterName, loading, error } = useFeaturedAudio();

  return (
    <section
      dir="rtl"
      lang="ar"
      className="w-full bg-wird-mist px-4 pb-8 pt-10 font-body sm:px-6 sm:pt-12 lg:px-8 xl:px-10 2xl:px-12"
    >
      <div className="mx-auto w-full max-w-none">
        {/* Header */}
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-9">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-wird-gold-dark">
              <span className="h-2 w-2 shrink-0 rounded-full bg-wird-gold" />
              مكتبة الصوتيات المختارة
            </p>

            <h2 className="font-display text-2xl font-extrabold leading-relaxed text-wird-green sm:text-3xl lg:text-4xl">
              تلاوات ودروس الشيخ عبدالرحمن الزاواوي
            </h2>

            <p className="mt-1 text-xs leading-6 text-muted sm:text-sm">
              تسجيلات استوديو بجودة نقية بصوت رخيم وتدبر عميق
            </p>
          </div>

          <a
            href="/audio"
            className="flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-wird-green transition hover:bg-wird-card hover:underline"
          >
            <ArrowLeft size={15} />
            تصفح كافة الصوتيات
          </a>
        </header>

        {/* Audio Cards */}
        {error ? (
          <p className="rounded-2xl bg-wird-card p-6 text-center text-sm text-wird-green">
            تعذّر تحميل الصوتيات، حاول مرة أخرى بعد قليل.
          </p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-7 2xl:gap-8">
            {loading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-96 animate-pulse rounded-3xl bg-wird-card"
                  />
                ))
              : items.map((item) => (
                  <AudioCard
                    key={item.id}
                    item={item}
                    reciterName={reciterName}
                  />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
