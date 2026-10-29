import { Link } from "react-router-dom";
import DownloadRow from "./DownloadRow";

export default function DownloadsList({ items, hasAny, currentId, playing, onPlay, onPause, onResume, onRemove }) {
  if (!items.length) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-8 text-center">
        <p className="text-sm text-muted">{hasAny ? "مفيش تنزيلات مطابقة." : "لسه مفيش تنزيلات."}</p>
        {!hasAny && (
          <Link to="/" className="mt-4 inline-block rounded-lg bg-pine px-5 py-2.5 text-xs font-bold text-white">
            تصفح الصوتيات من الرئيسية
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <DownloadRow
          key={item.id}
          item={item}
          isPlaying={currentId === item.id && playing}
          onPlay={() => onPlay(item)}
          onPause={() => onPause(item.id)}
          onResume={() => onResume(item.id)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </ul>
  );
}