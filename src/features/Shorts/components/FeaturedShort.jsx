import { BadgeCheck, Bookmark, BookmarkCheck, Clock, Play, Share2, Sparkles, User } from "lucide-react";
import { fmtDuration } from "../utils";

export default function FeaturedShort({ short, saved, onToggleSaved, onShare, onOpen }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#E3EEE8] bg-gradient-to-br from-[#FBF3DF] via-[#F0F9F4] to-[#E4F3EA] p-6 sm:p-10">
      {/* توهّج زخرفي */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F6D98A]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-[#9ED9B8]/40 blur-3xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] lg:gap-12">
        {/* الفيديو */}
        <button
          type="button"
          onClick={() => onOpen(short)}
          aria-label={`تشغيل: ${short.title}`}
          className="group relative mx-auto block aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-3xl bg-[#0F3F31] shadow-2xl ring-1 ring-black/5"
        >
          {short.thumbnailUrl && (
            <img src={short.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B2E]/70 via-transparent to-[#0B3B2E]/20" />
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-[#0B3B2E]/90 px-2 py-1 text-[10px] font-bold text-white" dir="ltr">
            <Clock size={10} />
            {fmtDuration(short.durationSeconds)}
          </span>
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0B3B2E] shadow-xl transition group-hover:scale-110">
            <Play size={26} fill="currentColor" className="mr-1" />
          </span>
        </button>

        {/* التفاصيل */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#FFE3A6] px-3 py-1 text-[11px] font-extrabold text-[#7A5A14]">
              <Sparkles size={12} />
              مقطع مختار اليوم
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-extrabold leading-[1.45] text-[#0B3B2E] sm:text-4xl">{short.title}</h2>

          <div className="mt-5 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pine text-white">
              <User size={18} />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-[#0B3B2E]">
                فضيلة الشيخ عبدالرحمن الزواوي
                <BadgeCheck size={16} className="text-[#C69234]" />
              </p>
              <p className="text-[11px] text-muted">عالم وقارئ معتمد • حفظه الله</p>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-muted">{short.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpen(short)}
              className="flex items-center gap-2 rounded-xl bg-[#0B3B2E] px-6 py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-[#0F4E3C]"
            >
              <Play size={13} fill="currentColor" />
              تشغيل المقطع
            </button>
            <button
              type="button"
              onClick={() => onShare(short)}
              className="flex items-center gap-2 rounded-xl border border-[#E3EEE8] bg-white px-5 py-3 text-xs font-bold text-[#0B3B2E] transition hover:bg-[#F2F7F4]"
            >
              <Share2 size={14} />
              مشاركة المقطع
            </button>
            <button
              type="button"
              onClick={() => onToggleSaved(short.id)}
              aria-label={saved ? "إزالة من المحفوظات" : "حفظ المقطع"}
              aria-pressed={saved}
              className={`grid h-11 w-11 place-items-center rounded-xl border transition ${
                saved ? "border-[#C69234] bg-[#FFF3D6] text-[#7A5A14]" : "border-[#E3EEE8] bg-white text-[#0B3B2E] hover:bg-[#F2F7F4]"
              }`}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}