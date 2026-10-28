import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { JUZ_LINK_PAGE, JUZ_NAMES, TOTAL_PAGES, firstPageOfSurah } from "../mushaf";
import { arNum, plain, surahTitle } from "../utils";

const toLatinDigits = (s) => s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

export default function QuranHeader({ surahs }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = toLatinDigits(query.trim());
    if (!q || !surahs) return [];
    const out = [];

    const page = q.match(/^(?:صفحة|الصفحة|ص|page|p)\s*(\d{1,3})$/i);
    if (page && +page[1] >= 1 && +page[1] <= TOTAL_PAGES) {
      out.push({ key: `p${page[1]}`, title: `الصفحة ${arNum(page[1])}`, hint: "اذهب إلى صفحة", to: `/quran/page/${page[1]}` });
    }
    const juz = q.match(/^(?:جزء|الجزء|juz)\s*(\d{1,2})$/i);
    if (juz && +juz[1] >= 1 && +juz[1] <= 30) {
      out.push({ key: `j${juz[1]}`, title: `الجزء ${JUZ_NAMES[juz[1] - 1]}`, hint: `صفحة ${arNum(JUZ_LINK_PAGE[juz[1] - 1])}`, to: `/quran/page/${JUZ_LINK_PAGE[juz[1] - 1]}` });
    }

    const term = plain(query);
    const num = Number(q);
    const latin = query.trim().toLowerCase();
    surahs
      .filter((s) => s.id === num || plain(s.nameArabic).includes(term) || s.nameEnglish?.toLowerCase().includes(latin))
      .slice(0, 7)
      .forEach((s) =>
        out.push({ key: `s${s.id}`, title: surahTitle(s), hint: `${s.nameEnglish} · ${arNum(s.id)}`, to: `/quran/page/${firstPageOfSurah(s.id)}` })
      );
    return out;
  }, [query, surahs]);

  const go = (r) => {
    navigate(r.to);
    setQuery("");
    setOpen(false);
  };

  return (
    <header>
      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <Link to="/" className="flex items-center gap-1 font-bold text-pine hover:underline">
          <Home size={12} />
          الرئيسية
        </Link>
        <span>›</span>
        <span>المصحف الشريف</span>
      </p>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-pine sm:text-4xl">القرآن الكريم</h1>
          <p className="mt-2 text-xs leading-6 text-muted sm:text-sm">
            اقرأ كتاب الله العظيم، واستمع إلى التلاوات المرتلة بصوت الشيخ عبدالرحمن الزواوي.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-[#E6EFE9] bg-white px-4 py-2 text-[10px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C69234]" />
          رواية حفص عن عاصم • مصحف المدينة المنورة
        </span>
      </div>

      <div className="relative mt-6">
        <label className="flex items-center gap-3 rounded-2xl border border-[#E6EFE9] bg-white px-5 py-4 shadow-sm">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && results[0] && go(results[0])}
            placeholder="ابحث عن سورة، أو جزء، أو صفحة..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded-md bg-[#F2F7F4] px-2 py-1 text-[10px] text-muted sm:block" dir="ltr">
            Ctrl + K
          </kbd>
        </label>

        {open && results.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[#E6EFE9] bg-white shadow-lg">
            {results.map((r) => (
              <li key={r.key}>
                <button
                  type="button"
                  onMouseDown={() => go(r)}
                  className="flex w-full items-center justify-between px-5 py-3 text-right text-sm hover:bg-[#F2F7F4]"
                >
                  <span className="font-bold text-pine">{r.title}</span>
                  <span className="text-[11px] text-muted">{r.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}