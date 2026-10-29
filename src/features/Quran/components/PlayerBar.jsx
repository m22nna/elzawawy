import { AudioLines, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from "../player/PlayerProvider";
import { mmss, surahTitle } from "../utils";

const RATES = [0.75, 1, 1.25, 1.5, 2];
const rateLabel = (r) => `${Number.isInteger(r) ? r.toFixed(1) : r}x`;

const formatOf = (url) => {
  try {
    const ext = new URL(url).pathname.split(".").pop();
    return /^[a-z0-9]{2,5}$/i.test(ext) ? ext.toUpperCase() : null;
  } catch {
    return null;
  }
};

function Slider({ value, onChange, label, className = "", fill = "bg-[#C69234]", step = 0.05 }) {
  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange(Math.min(1, Math.max(0, (r.right - e.clientX) / r.width)));
  };
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      onClick={pick}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onChange(Math.min(1, value + step));
        if (e.key === "ArrowRight") onChange(Math.max(0, value - step));
      }}
      className={`group relative flex h-4 cursor-pointer items-center ${className}`}
    >
      <div className="relative h-1 w-full rounded-full bg-[#E6EFE9]">
        <div className={`absolute inset-y-0 right-0 rounded-full ${fill}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

const ctl = "grid h-8 w-8 place-items-center text-muted transition hover:text-pine disabled:opacity-40";

export default function PlayerBar({ fallbackId, surahs }) {
  const p = usePlayer();
  const id = p.surahId ?? fallbackId;
  const surah = surahs?.find((s) => s.id === id);
  const fraction = p.dur ? p.pos / p.dur : 0;
  const fmt = formatOf(p.urlOf?.(id));
  const active = p.surahId === id;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E6EFE9] bg-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 md:grid-cols-[1fr_minmax(340px,520px)_1fr] lg:px-10">
        {/* يمين: العنوان */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pine text-white">
            <AudioLines size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-pine">
              {surah ? `${surahTitle(surah)} - تلاوة خاشعة` : "جارٍ التحميل…"}
            </p>
            <p className="truncate text-[10px]">
              {p.failed ? <span className="text-red-600">تعذّر تشغيل الصوت حاليًا</span> : <span className="text-muted">{p.reciter}</span>}
            </p>
          </div>
        </div>

        {/* وسط: التحكم والتقدّم */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-3" dir="ltr">
            <button type="button" onClick={() => p.step(id, -1)} disabled={id <= 1} aria-label="السورة السابقة" className={ctl}>
              <SkipBack size={15} fill="currentColor" />
            </button>
            <button type="button" onClick={() => p.skipBy(-10)} disabled={!active} aria-label="رجوع 10 ثواني" className={`${ctl} relative`}>
              <RotateCcw size={18} />
              <span className="absolute text-[7px] font-bold">10</span>
            </button>
            <button
              type="button"
              onClick={() => p.toggle(id)}
              disabled={!p.hasTrack?.(id)}
              aria-label={p.playing && active ? "إيقاف" : "تشغيل"}
              className="grid h-10 w-10 place-items-center rounded-full bg-pine text-white shadow-md transition hover:opacity-90 disabled:opacity-40"
            >
              {p.playing && active ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
            </button>
            <button type="button" onClick={() => p.skipBy(10)} disabled={!active} aria-label="تقديم 10 ثواني" className={`${ctl} relative`}>
              <RotateCw size={18} />
              <span className="absolute text-[7px] font-bold">10</span>
            </button>
            <button type="button" onClick={() => p.step(id, 1)} disabled={id >= 114} aria-label="السورة التالية" className={ctl}>
              <SkipForward size={15} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted">
            <span className="w-9 tabular-nums">{mmss(active ? p.pos : 0)}</span>
            <Slider value={active ? fraction : 0} onChange={p.seek} label="التقدّم" className="flex-1" />
            <span className="w-9 text-left tabular-nums">{mmss(active ? p.dur : 0)}</span>
          </div>
        </div>

        {/* شمال: الصوت والسرعة والصيغة */}
        <div className="flex items-center justify-start gap-3 md:justify-end" dir="ltr">
          <Slider value={p.volume} onChange={p.setVolume} label="الصوت" className="w-24" fill="bg-pine" />
          <Volume2 size={14} className="text-muted" />
          <button
            type="button"
            onClick={() => p.setRate(RATES[(RATES.indexOf(p.rate) + 1) % RATES.length])}
            aria-label="سرعة التشغيل"
            className="rounded-md bg-[#F2F7F4] px-2.5 py-1 text-[10px] font-bold text-pine"
          >
            {rateLabel(p.rate)}
          </button>
          {fmt && <span className="rounded-md bg-[#C6923433] px-2 py-1 text-[9px] font-bold text-bronze">{fmt}</span>}
        </div>
      </div>
    </div>
  );
}