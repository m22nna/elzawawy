import { Search } from "lucide-react";
import { FILTERS } from "../useDownloads";

export default function DownloadsToolbar({ filter, onFilter, query, onQuery, counts }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilter(f.key)}
            className={`rounded-full px-4 py-2 text-[11px] font-bold transition ${
              filter === f.key ? "bg-pine text-white" : "bg-white text-pine hover:bg-[#E6EFE9]"
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      <label className="flex min-w-[260px] items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Search size={14} className="text-muted" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="ابحث في التنزيلات المحفوظة..."
          className="w-full bg-transparent text-xs outline-none placeholder:text-muted"
        />
      </label>
    </div>
  );
}