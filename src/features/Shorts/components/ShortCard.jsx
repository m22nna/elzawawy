
import { Play } from "lucide-react";
import { fmtDuration, timeAgo } from "../utils";

export default function ShortCard({ short, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(short)}
      aria-label={`تشغيل: ${short.title}`}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-[#0F3F31] text-right shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C69234]"
    >
      {short.thumbnailUrl && (
        <img
          src={short.thumbnailUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B3B2E]/30 to-[#0B3B2E]" />

      <span className="absolute left-3 top-3 rounded-md bg-[#0B3B2E]/90 px-2 py-1 text-[10px] font-bold text-white" dir="ltr">
        {fmtDuration(short.durationSeconds)}
      </span>

      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full bg-white/90 text-[#0B3B2E] opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
        <Play size={22} fill="currentColor" className="mr-0.5" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[11px] font-bold text-[#E8C37A]">{short.category}</p>
        <h3 className="mt-1.5 line-clamp-2 text-lg font-extrabold leading-snug text-white">{short.title}</h3>
        <div className="mt-3 flex items-center justify-between text-[10px] text-white/70">
          <span>الشيخ عبدالرحمن الزواوي</span>
          <span>{timeAgo(short.publishedAt)}</span>
        </div>
      </div>
    </button>
  );
}