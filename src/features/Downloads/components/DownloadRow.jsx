import { AudioLines, CheckCircle2, Clock, HardDrive, Library, Pause, Play, RotateCw, Trash2, X } from "lucide-react";
import { ICONS, SHEIKH, mb, mmss } from "../utils";

const CHIP = {
  completed: ["bg-[#F0FDF4] text-green-700", "مكتمل"],
  paused: ["bg-[#FFF7ED] text-orange-600", "متوقف مؤقتاً"],
  failed: ["bg-[#FFF1F2] text-rose-600", "فشل التحميل"],
};

export default function DownloadRow({ item, isPlaying, onPlay, onPause, onResume, onRemove }) {
  const busy = item.status === "downloading";
  const paused = item.status === "paused";
  const failed = item.status === "failed";
  const done = item.status === "completed";
  const Icon = busy ? AudioLines : ICONS[item.category] ?? Library;


  const known = item.sizeBytes > 0;
  const [chipCls, chipText] = busy
    ? ["bg-[#FFFBEB] text-bronze", known ? `جاري التحميل ${item.progress}%` : "جاري التحميل"]
    : CHIP[item.status];

  return (
    <li className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F2F7F4] text-pine">
          <Icon size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-muted">
            <span className="text-bronze">{item.tag}</span> · {SHEIKH}
          </p>
          <h3 className="truncate text-base font-extrabold text-pine">{item.title}</h3>
          <p className="mt-0.5 flex flex-wrap gap-3 text-[10px] text-muted">
            {item.durationSeconds ? (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {mmss(item.durationSeconds)} دقيقة
              </span>
            ) : null}
            {item.sizeBytes ? (
              <span className="flex items-center gap-1">
                <HardDrive size={10} />
                {mb(item.sizeBytes)} ميجابايت
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${chipCls}`}>
            {done && <CheckCircle2 size={11} />}
            {chipText}
          </span>

          {busy && (
            <button type="button" onClick={onPause} aria-label="إيقاف مؤقت" className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFFBEB] text-bronze">
              <Pause size={14} fill="currentColor" />
            </button>
          )}

          {paused && (
            <button type="button" onClick={onResume} className="flex items-center gap-1.5 rounded-lg bg-[#FFDEA4] px-4 py-2 text-xs font-bold text-pine">
              استئناف
              <Play size={11} />
            </button>
          )}

          {failed && (
            <button type="button" onClick={onResume} className="flex items-center gap-1.5 rounded-lg bg-[#FFF1F2] px-4 py-2 text-xs font-bold text-rose-600">
              إعادة المحاولة
              <RotateCw size={11} />
            </button>
          )}

          {done && (
            <button type="button" onClick={onPlay} className="flex items-center gap-1.5 rounded-lg bg-pine px-4 py-2 text-xs font-bold text-white">
              {isPlaying ? "إيقاف" : "استماع"}
              {isPlaying ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
            </button>
          )}

          <button type="button" onClick={onRemove} aria-label={busy ? "إلغاء التحميل" : "حذف"} className="p-2 text-muted hover:text-red-600">
            {busy ? <X size={16} /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {(busy || paused) && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#E6EFE9]">
            <div
              className={`h-full rounded-full bg-wird-gold transition-[width] duration-300 ${known ? "" : "w-1/3 animate-pulse"}`}
              style={known ? { width: `${item.progress}%` } : undefined}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted">
            {known ? `${item.progress}% — ` : ""}
            {mb(item.receivedBytes)}
            {known ? ` / ${mb(item.sizeBytes)}` : ""} ميجابايت
          </p>
        </div>
      )}

      {failed && (
        <p className="mt-2 text-[10px] text-rose-600">
                     تأكد من الاتصال   
        </p>
      )}
    </li>
  );
}