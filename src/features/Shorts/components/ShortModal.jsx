import { useEffect } from "react";
import { Bookmark, BookmarkCheck, Share2, VideoOff, X } from "lucide-react";
import { usePlayer } from "../../Quran/player/PlayerProvider";
import { timeAgo } from "../utils";

export default function ShortModal({ short, saved, onToggleSaved, onShare, onClose }) {
  const player = usePlayer();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={short.title}
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[400px] overflow-hidden rounded-3xl bg-[#0B3B2E] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X size={16} />
        </button>

        <div className="relative aspect-[9/16] max-h-[72vh] w-full bg-black">
          {short.videoUrl ? (
            <video
              src={short.videoUrl}
              poster={short.thumbnailUrl ?? undefined}
              controls
              autoPlay
              playsInline
              onPlay={() => player?.pause?.()} // نوقف صوت التلاوة لما الفيديو يشتغل
              className="h-full w-full object-contain"
            />
          ) : (
            <>
              {short.thumbnailUrl && <img src={short.thumbnailUrl} alt="" className="h-full w-full object-cover opacity-60" />}
              <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
                <div>
                  <VideoOff size={34} className="mx-auto mb-3 opacity-80" />
                  <p className="text-sm font-bold">المقطع غير متاح للتشغيل حالياً</p>
                  <p className="mt-1 text-xs text-white/70">سيتوفر قريباً بإذن الله</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 text-white">
          <p className="text-[11px] font-bold text-[#E8C37A]">{short.category}</p>
          <h3 className="mt-1 text-lg font-extrabold leading-snug">{short.title}</h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-white/70">
              الشيخ عبدالرحمن الزواوي • {timeAgo(short.publishedAt)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleSaved(short.id)}
                aria-label={saved ? "إزالة من المحفوظات" : "حفظ المقطع"}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
              >
                {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              </button>
              <button type="button" onClick={() => onShare(short)} aria-label="مشاركة" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20">
                <Share2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}