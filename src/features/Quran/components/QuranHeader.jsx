import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Search } from "lucide-react";
import {
  JUZ_LINK_PAGE,
  JUZ_NAMES,
  TOTAL_PAGES,
  firstPageOfSurah,
} from "../mushaf";
import { arNum, plain, surahTitle } from "../utils";

const toLatinDigits = (value = "") =>
  value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const digits = "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹";
    const latinDigits = "01234567890123456789";
    return latinDigits[digits.indexOf(digit)];
  });

const normalizeSearch = (value = "") =>
  plain(
    value
      .toLowerCase()
      .replace(/^(سورة|سوره|السورة)\s*/i, "")
      .replace(/^(surah|sura)\s*/i, "")
      .replace(/[-_]/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();

const JUZ_WORDS = {
  "الأول": 1,
  "الاول": 1,
  "الأول": 1,
  "الأول": 1,
  "الثاني": 2,
  "الثالث": 3,
  "الرابع": 4,
  "الخامس": 5,
  "السادس": 6,
  "السابع": 7,
  "الثامن": 8,
  "التاسع": 9,
  "العاشر": 10,

  "الحادي عشر": 11,
  "الحاديعشر": 11,
  "الحادي عشر": 11,

  "الثاني عشر": 12,
  "الثانيعشر": 12,

  "الثالث عشر": 13,
  "الثالثعشر": 13,

  "الرابع عشر": 14,
  "الرابععشر": 14,

  "الخامس عشر": 15,
  "الخامسعشر": 15,

  "السادس عشر": 16,
  "السادسعشر": 16,

  "السابع عشر": 17,
  "السابععشر": 17,

  "الثامن عشر": 18,
  "الثامنعشر": 18,

  "التاسع عشر": 19,
  "التاسععشر": 19,

  "العشرون": 20,
  "العشرين": 20,

  "الحادي والعشرون": 21,
  "الحادي والعشرين": 21,
  "الحادي والعشرون": 21,

  "الثاني والعشرون": 22,
  "الثاني والعشرين": 22,

  "الثالث والعشرون": 23,
  "الثالث والعشرين": 23,

  "الرابع والعشرون": 24,
  "الرابع والعشرين": 24,

  "الخامس والعشرون": 25,
  "الخامس والعشرين": 25,

  "السادس والعشرون": 26,
  "السادس والعشرين": 26,

  "السابع والعشرون": 27,
  "السابع والعشرين": 27,

  "الثامن والعشرون": 28,
  "الثامن والعشرين": 28,

  "التاسع والعشرون": 29,
  "التاسع والعشرين": 29,

  "الثلاثون": 30,
  "الثلاثين": 30,
};

const normalizeJuzQuery = (query) => {
  let value = normalizeSearch(query)
    .replace(/^(جزء|الجزء)\s*/, "")
    .trim();

  value = value.replace(/\s+/g, " ");

  const compactValue = value.replace(/\s/g, "");

  if (/^\d{1,2}$/.test(value)) {
    return Number(value);
  }

  return JUZ_WORDS[value] ?? JUZ_WORDS[compactValue] ?? null;
};

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

    // Search by page number
    const page = q.match(/^(?:صفحة|الصفحة|الصفحه|صفحه|ص|page|p)\s*(\d{1,3})$/i);

    if (page && +page[1] >= 1 && +page[1] <= TOTAL_PAGES) {
      out.push({
        key: `p${page[1]}`,
        title: `الصفحة ${arNum(page[1])}`,
        hint: "اذهب إلى صفحة",
        to: `/quran/page/${page[1]}`,
      });
    }

    // Search by Juz number or Arabic words
    const juz = q.match(/^(?:جزء|الجزء|juz)\s*(.+)$/i);

    if (juz) {
      const juzNumber = normalizeJuzQuery(q);

      if (juzNumber >= 1 && juzNumber <= 30) {
        out.push({
          key: `j${juzNumber}`,
          title: `الجزء ${JUZ_NAMES[juzNumber - 1]}`,
          hint: `صفحة ${arNum(JUZ_LINK_PAGE[juzNumber - 1])}`,
          to: `/quran/page/${JUZ_LINK_PAGE[juzNumber - 1]}`,
        });
      }
    }

    // Search by Surah name in Arabic or English
    const term = normalizeSearch(query);
    const latin = term.replace(/\s+/g, "");

    surahs
      .filter((s) => {
        const arabicName = normalizeSearch(s.nameArabic);

        const englishName = normalizeSearch(s.nameEnglish).replace(
          /\s+/g,
          ""
        );

        const matchesNumber = /^\d+$/.test(q) && s.id === Number(q);

        const matchesArabic = term && arabicName.includes(term);

        const matchesEnglish = latin && englishName.includes(latin);

        const matchesYasin =
          ["ياسين", "ياس", "يس"].includes(term) &&
          normalizeSearch(s.nameArabic) === normalizeSearch("يس");

        return (
          matchesNumber ||
          matchesArabic ||
          matchesEnglish ||
          matchesYasin
        );
      })
      .slice(0, 7)
      .forEach((s) => {
        out.push({
          key: `s${s.id}`,
          title: surahTitle(s),
          hint: `${s.nameEnglish} · ${arNum(s.id)}`,
          to: `/quran/page/${firstPageOfSurah(s.id)}`,
        });
      });

    return out;
  }, [query, surahs]);

  const go = (result) => {
    navigate(result.to);
    setQuery("");
    setOpen(false);
  };

  return (
    <header>
      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <Link
          to="/"
          className="flex items-center gap-1 font-bold text-pine hover:underline"
        >
          <Home size={12} />
          الرئيسية
        </Link>

        <span>›</span>
        <span>المصحف الشريف</span>
      </p>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-pine sm:text-4xl">
            القرآن الكريم
          </h1>

          <p className="mt-2 text-xs leading-6 text-muted sm:text-sm">
            اقرأ كتاب الله العظيم، واستمع إلى التلاوات المرتلة بصوت الشيخ
            عبدالرحمن الزواوي.
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                go(results[0]);
              }
            }}
            placeholder="ابحث عن سورة، أو جزء، أو صفحة..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />

          <kbd
            className="hidden shrink-0 rounded-md bg-[#F2F7F4] px-2 py-1 text-[10px] text-muted sm:block"
            dir="ltr"
          >
            Ctrl + K
          </kbd>
        </label>

      
{open && query.trim() && (
  <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[#E6EFE9] bg-white shadow-lg">
    {results.length > 0 ? (
      <ul>
        {results.map((result) => (
          <li key={result.key}>
            <button
              type="button"
              onMouseDown={() => go(result)}
              className="flex w-full items-center justify-between px-5 py-3 text-right text-sm hover:bg-[#F2F7F4]"
            >
              <span className="font-bold text-pine">
                {result.title}
              </span>

              <span className="text-[11px] text-muted">
                {result.hint}
              </span>
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="px-5 py-4 text-center text-sm text-muted">
        مفيش نتائج مطابقة لبحثك
      </p>
    )}
  </div>
)}


      </div>
    </header>
  );
}

