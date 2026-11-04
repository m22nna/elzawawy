import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, FileText, Loader2, ScrollText, Search, Sparkles } from "lucide-react";
import { runSearch, useSearchData } from "./useSearchData";
import Highlight from "./Highlight";

const GROUP_META = {
  jump: { label: "اذهب إلى", Icon: BookOpen },
  surah: { label: "السور", Icon: BookOpen },
  hadith: { label: "الأحاديث", Icon: ScrollText },
  adhkar: { label: "الأذكار", Icon: Sparkles },
  site: { label: "صفحات الموقع", Icon: FileText },
};

const LIMITS = { surah: 3, hadith: 3, adhkar: 2, site: 2 };


function toSuggestions(r) {
  if (!r) return [];
  const out = [];
  r.jumps.forEach((x) => out.push({ ...x, group: "jump" }));
  r.surahs.slice(0, LIMITS.surah).forEach((x) => out.push({ ...x, group: "surah" }));
  r.hadiths.slice(0, LIMITS.hadith).forEach((x) => out.push({ ...x, group: "hadith" }));
  r.adhkar.slice(0, LIMITS.adhkar).forEach((x) => out.push({ ...x, group: "adhkar" }));
  r.pages.slice(0, LIMITS.site).forEach((x) => out.push({ ...x, group: "site" }));
  return out;
}

export default function NavSearch({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef(null);
  const { data, error, loading, ensure } = useSearchData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // في صفحة النتائج نعرض عبارة البحث الحالية
  useEffect(() => {
    if (location.pathname === "/search") setQuery(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const q = query.trim();
  const results = useMemo(() => (data && q ? runSearch(data, q) : null), [data, q]);
  const suggestions = useMemo(() => toSuggestions(results), [results]);
  const total = results ? results.jumps.length + results.surahs.length + results.hadiths.length + results.adhkar.length + results.pages.length : 0;

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!q) return;
    const picked = suggestions[active];
    go(picked ? picked.to : `/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  };

  let lastGroup = null;
  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form onSubmit={submit} role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
            ensure();
          }}
          onFocus={() => {
            ensure();
            if (q) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="ابحث عن سورة، حديث..."
          aria-label="البحث في الموقع"
          role="combobox"
          aria-expanded={open && !!q}
          aria-controls="nav-search-results"
          autoComplete="off"
          className="w-full bg-[#eeeef0] text-gray-800 text-xs rounded-full pr-10 pl-4 py-2.5 border border-transparent focus:border-[#1b4332] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400"
        />
        <button type="submit" aria-label="بحث" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b4332]">
          {loading && q ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {open && q && (
        <div
          id="nav-search-results"
          role="listbox"
          className="absolute right-0 top-full z-[60] mt-2 w-[min(92vw,440px)] overflow-hidden rounded-2xl border border-gray-100 bg-white text-right shadow-2xl"
        >
          {error && !data ? (
            <p className="p-4 text-xs text-red-600">تعذّر تحميل بيانات البحث، حاول مرة أخرى بعد قليل.</p>
          ) : !data ? (
            <p className="p-4 text-xs text-gray-500">جاري تحميل بيانات البحث…</p>
          ) : suggestions.length === 0 ? (
            <p className="p-4 text-xs text-gray-500">لا توجد نتائج لـ «{q}». جرّب كلمة أخرى.</p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {suggestions.map((s, i) => {
                const header = s.group !== lastGroup;
                lastGroup = s.group;
                const Icon = GROUP_META[s.group].Icon;
                return (
                  <li key={s.key} role="presentation">
                    {header && <p className="px-4 pb-1 pt-3 text-[10px] font-bold text-gray-400">{GROUP_META[s.group].label}</p>}
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(s.to)}
                      className={`flex w-full items-start gap-3 px-4 py-2 text-right transition ${i === active ? "bg-[#e2ece9]" : "hover:bg-gray-50"}`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#1b4332]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-[#1b4332]">
                          {s.group === "hadith" || (s.group === "adhkar" && !s.isCategory) ? (
                            <Highlight text={s.title} matcher={results.matcher} length={70} />
                          ) : (
                            s.title
                          )}
                        </span>
                        <span className="block truncate text-[10px] text-gray-500">{s.subtitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              <li className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}
                  className="w-full px-4 py-3 text-right text-xs font-bold text-[#1b4332] hover:bg-gray-50"
                >
                  عرض كل النتائج عن «{q}» ({total})
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
