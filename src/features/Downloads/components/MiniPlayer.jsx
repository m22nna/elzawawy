import { Pause, Play } from "lucide-react";
import { useAudio } from "../../Home/audio/AudioContext";

export default function MiniPlayer() {
  const { current, playing, progress, toggle } = useAudio();
  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <button
          type="button"
          onClick={() => toggle(current)}
          aria-label={playing ? "إيقاف" : "تشغيل"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine text-white"
        >
          {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-pine">{current.title}</p>
          <div className="mt-1.5 h-1 rounded-full bg-[#E6EFE9]">
            <div className="h-full rounded-full bg-wird-gold" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}