import { Home, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function ShortsHeader({ query, onQuery, categories, category, onCategory }) {
  return (
    <header>
      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <Link to="/" className="flex items-center gap-1 font-bold text-pine hover:underline">
          <Home size={12} />
          الرئيسية
        </Link>
        <span>›</span>
        <span>الشورتس والمقاطع</span>
      </p>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-[#0B3B2E] sm:text-4xl">
            الشورتس الإسلامية
            <span aria-hidden className="h-8 w-2 rounded-full bg-gradient-to-b from-[#C69234] to-[#8C6A1C]" />
          </h1>
          <p className="mt-2 text-xs leading-6 text-muted sm:text-sm">
            مقاطع قصيرة من المحتوى الإسلامي للتعلّم والتذكّر بصوت وتوجيه الشيخ عبدالرحمن الزواوي.
          </p>
        </div>

        <label className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-[#E3EEE8] bg-white px-4 py-3 shadow-sm focus-within:border-[#C69234] sm:w-80">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="ابحث عن مقطع أو موضوع..."
            aria-label="بحث في المقاطع"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5" role="tablist" aria-label="تصنيفات المقاطع">
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            role="tab"
            aria-selected={category === c.slug}
            onClick={() => onCategory(c.slug)}
            className={`rounded-full px-5 py-2 text-[11px] font-bold transition ${
              category === c.slug ? "bg-[#0B3B2E] text-white shadow" : "border border-[#E3EEE8] bg-white text-[#0B3B2E] hover:bg-[#E6F2EB]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </header>
  );
}