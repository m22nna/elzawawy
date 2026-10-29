
import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, ChevronDown, CirclePlay, SquarePlay } from "lucide-react";
import Navbar from "../../components/NavBar";
import { useSurahs, useTracks } from "../Quran/hooks/useQuranData";
import { PlayerProvider } from "../Quran/player/PlayerProvider";
import PlayerBar from "../Quran/components/PlayerBar";
import { plain } from "../Quran/utils";
import { useSavedShorts, useShorts } from "./hooks/useShorts";
import ShortsHeader from "./components/ShortsHeader";
import FeaturedShort from "./components/FeaturedShort";
import ShortCard from "./components/ShortCard";
import ShortModal from "./components/ShortModal";

const PAGE_SIZE = 6;

const SORTS = [
  { id: "default", label: "الترتيب المقترح", fn: null },
  { id: "newest", label: "الأحدث نشراً", fn: (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt) },
];

function Skeleton() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <div className="h-[560px] rounded-[28px] bg-[#E3EEE8]" />
      <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[9/16] rounded-2xl bg-[#E3EEE8]" />
        ))}
      </div>
    </div>
  );
}

function Content({ shorts, categories, loading, error, retry }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [savedIds, toggleSaved] = useSavedShorts();
  const [params, setParams] = useSearchParams();

  const featured = shorts?.[0] ?? null;
  const showFeatured = Boolean(featured) && category === "all" && !query.trim();

  const list = useMemo(() => {
    if (!shorts) return [];
    const term = plain(query);
    const sorter = SORTS.find((s) => s.id === sort).fn;
    const filtered = shorts
      .filter((s) => !(showFeatured && s.id === featured.id))
      .filter((s) => category === "all" || s.category === category)
      .filter((s) => !term || plain(`${s.title} ${s.description} ${s.category}`).includes(term));
    return sorter ? filtered.sort(sorter) : filtered;
  }, [shorts, category, query, sort, showFeatured, featured]);

  const opened = shorts?.find((s) => String(s.id) === params.get("v")) ?? null;
  const open = useCallback((s) => setParams({ v: String(s.id) }), [setParams]);
  const close = useCallback(() => setParams({}), [setParams]);

 const [toast, setToast] = useState("");
const toastTimer = useRef(null);
const share = useCallback(async (s) => {
  const url = `${window.location.origin}/shorts?v=${s.id}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: s.title, url });
    } catch {
    }
    return;
  }
  let msg = "تم نسخ رابط المقطع";
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    msg = "تعذّر نسخ الرابط";
  }
  setToast(msg);
  clearTimeout(toastTimer.current);
  toastTimer.current = setTimeout(() => setToast(""), 2200);
}, []);

  const onCategory = (c) => {
    setCategory(c);
    setVisible(PAGE_SIZE);
  };
  const onQuery = (q) => {
    setQuery(q);
    setVisible(PAGE_SIZE);
  };
  const resetFilters = () => {
    setCategory("all");
    setQuery("");
    setVisible(PAGE_SIZE);
  };

  return (
    <>
      <ShortsHeader query={query} onQuery={onQuery} categories={categories} category={category} onCategory={onCategory} />

      <div className="mt-8">
        {loading && <Skeleton />}

        {error && (
          <div className="rounded-2xl bg-white p-10 text-center">
            <p className="text-sm text-red-600">تعذّر تحميل المقاطع، حاول مرة أخرى بعد قليل.</p>
            <button type="button" onClick={retry} className="mt-4 rounded-lg bg-pine px-5 py-2 text-xs font-bold text-white">
              إعادة المحاولة
            </button>
          </div>
        )}

        {shorts && shorts.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center">
            <p className="text-sm font-bold text-[#0B3B2E]">لا توجد مقاطع منشورة حالياً</p>
            <p className="mt-2 text-xs text-muted">سيتم إضافة مقاطع جديدة قريباً بإذن الله.</p>
          </div>
        )}

        {shorts && shorts.length > 0 && (
          <>
            {showFeatured && (
              <FeaturedShort
                short={featured}
                saved={savedIds.includes(featured.id)}
                onToggleSaved={toggleSaved}
                onShare={share}
                onOpen={open}
              />
            )}

            <section className="mt-12">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SquarePlay size={22} className="text-pine" />
                  <h2 className="text-2xl font-extrabold text-[#0B3B2E]">أحدث المقاطع والتأملات</h2>
                  <span className="rounded-full bg-[#E3EEE8] px-3 py-1 text-[10px] font-bold text-pine">{list.length} مقطع متاح</span>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-muted">
                  ترتيب حسب:
                  <span className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none rounded-lg border border-[#E3EEE8] bg-white py-2 pl-8 pr-3 text-[11px] font-bold text-[#0B3B2E] outline-none focus:border-[#C69234]"
                    >
                      {SORTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  </span>
                </label>
              </div>

              {list.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center">
                  <p className="text-sm font-bold text-[#0B3B2E]">لا توجد مقاطع مطابقة لبحثك</p>
                  <button type="button" onClick={resetFilters} className="mt-4 rounded-lg bg-pine px-5 py-2 text-xs font-bold text-white">
                    عرض كل المقاطع
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                  {list.slice(0, visible).map((s) => (
                    <ShortCard key={s.id} short={s} onOpen={open} />
                  ))}
                </div>
              )}

              {visible < list.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D3E5DB] bg-[#E3EEE8]/70 px-7 py-3 text-xs font-bold text-[#0B3B2E] transition hover:bg-[#D3E5DB]"
                  >
                    عرض المزيد من المقاطع القصيرة
                    <CirclePlay size={14} />
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {opened && (
        <ShortModal
          short={opened}
          saved={savedIds.includes(opened.id)}
          onToggleSaved={toggleSaved}
          onShare={share}
          onClose={close}
        />
      )}

      {toast && (
  <div
    role="status"
    className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#0B3B2E] px-5 py-2.5 text-xs font-bold text-white shadow-xl"
  >
    {toast}
  </div>
)}

      <footer className="mt-14 flex flex-wrap items-center justify-between gap-2 border-t border-[#D3E5DB] pt-5 text-[10px] text-muted">
        <span className="flex items-center gap-2 font-bold text-pine">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-pine text-white">
            <BookOpen size={12} />
          </span>
          المنصة الرسمية للشيخ عبدالرحمن الزواوي
        </span>
        <span>جميع الحقوق محفوظة للمحتوى القرآني والنبوي الشريف © ١٤٤٧ هـ</span>
      </footer>
    </>
  );
}

export default function ShortsPage() {
  const { tracks, reciter } = useTracks();
  const { surahs } = useSurahs();
  const data = useShorts();

  return (
    <PlayerProvider tracks={tracks} reciter={reciter}>
      <div dir="rtl" className="min-h-screen bg-[#F1FAF5] pb-32 font-body">
        <Navbar />
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
          <Content {...data} />
        </div>
        <PlayerBar fallbackId={18} surahs={surahs} />
      </div>
    </PlayerProvider>
  );
}