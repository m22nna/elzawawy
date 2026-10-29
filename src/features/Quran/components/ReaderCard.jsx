import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lightbulb, Maximize2, Minimize2, Pause, Play, Share2 } from "lucide-react";
import { usePlayer } from "../player/PlayerProvider";
import { JUZ_NAMES, TOTAL_PAGES, clampPage, hizbOfPage, juzOfPage } from "../mushaf";
import { BASMALA, arNum, placeLabel, startsWithBasmala, surahTitle } from "../utils";
import TafsirBox from "./TafsirBox";

const SIZES = [24, 28, 32, 36, 40, 44, 48, 52];
const SIZE_KEY = "zawawy:quran:fontSize";
const QURAN_FONT = '"Amiri Quran","KFGQPC Uthman Taha Naskh","Amiri",serif';

const readSize = () => {
  try {
    const v = Number(localStorage.getItem(SIZE_KEY));
    return SIZES.includes(v) ? v : 36;
  } catch {
    return 36;
  }
};

const toolBtn =
  "grid h-9 min-w-9 place-items-center rounded-lg border border-[#E6EFE9] bg-white px-2 text-xs font-bold text-pine transition hover:bg-[#F2F7F4]";

// آيات الصفحة متجمّعة حسب السورة (صفحة ممكن فيها آخر سورة وأول اللي بعدها)
function groupBySurah(ayahs) {
  const groups = [];
  for (const a of ayahs) {
    const last = groups[groups.length - 1];
    if (last && last.surahId === a.surahId) last.ayahs.push(a);
    else groups.push({ surahId: a.surahId, ayahs: [a] });
  }
  return groups;
}

const isBasmalaAyah = (a) => a.surahId === 1 && a.ayahNumber === 1 && startsWithBasmala(a.textUthmani);

function PageJump({ page, onGo }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));
          if (Number.isFinite(n) && n >= 1) onGo(n);
          setEditing(false);
        }}
        className="flex items-center gap-2"
      >
        <input
          autoFocus
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setEditing(false)}
          placeholder={`1 - ${TOTAL_PAGES}`}
          aria-label="رقم الصفحة"
          className="w-28 rounded-full border border-[#C69234] bg-white px-3 py-1.5 text-center text-xs font-bold text-pine outline-none"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setValue("");
        setEditing(true);
      }}
      title="اذهب إلى صفحة"
      className="rounded-full bg-[#F2F7F4] px-4 py-1.5 text-xs font-bold text-pine hover:bg-[#E6EFE9]"
    >
      الصفحة {arNum(page)} • الحزب {arNum(hizbOfPage(page))}
    </button>
  );
}

export default function ReaderCard({ page, ayahs, surahs, loading, error, onRetry, onActive }) {
  const navigate = useNavigate();
  const player = usePlayer();
  const cardRef = useRef(null);
  const [size, setSize] = useState(readSize);
  const [tafsirOn, setTafsirOn] = useState(true);
  const [selected, setSelected] = useState(null); // { surahId, ayahNumber }
  const [fullscreen, setFullscreen] = useState(false);

  const goToPage = useCallback((n) => navigate(`/quran/page/${clampPage(n)}`), [navigate]);

  // صفحة جديدة = نبدأ من أول آية فيها
  useEffect(() => setSelected(null), [page]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "")) return;
      if (e.key === "ArrowLeft" && page < TOTAL_PAGES) goToPage(page + 1);
      if (e.key === "ArrowRight" && page > 1) goToPage(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, goToPage]);

  const changeSize = (delta) => {
    const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(size) + delta))];
    setSize(next);
    try {
      localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      /* التخزين ممنوع */
    }
  };

  const toggleFullscreen = () =>
    document.fullscreenElement ? document.exitFullscreen?.() : cardRef.current?.requestFullscreen?.();

  const groups = useMemo(() => (ayahs ? groupBySurah(ayahs) : []), [ayahs]);
  const firstAyah = ayahs?.find((a) => !isBasmalaAyah(a));
  // الآية المحددة لازم تكون من الصفحة الحالية (وإلا نرجع لأول آية فيها)
  const selectedHere = selected && ayahs?.some((a) => a.surahId === selected.surahId && a.ayahNumber === selected.ayahNumber);
  const active = selectedHere ? selected : firstAyah ? { surahId: firstAyah.surahId, ayahNumber: firstAyah.ayahNumber } : null;
  const activeSurah = surahs?.find((s) => s.id === active?.surahId);
  const juz = juzOfPage(page);

  const share = () => {
    const url = `${window.location.origin}/quran/page/${page}`;
    return navigator.share
      ? navigator.share({ title: activeSurah ? `${surahTitle(activeSurah)} - صفحة ${arNum(page)}` : `صفحة ${arNum(page)}`, url }).catch(() => {})
      : navigator.clipboard?.writeText(url);
  };

  const playing = activeSurah && player.surahId === activeSurah.id && player.playing;

  // نبلّغ الصفحة بمكان القراءة (نفس السورة الظاهرة في الأعلى) عشان تتحفظ للرئيسية
  useEffect(() => {
    if (active && ayahs) onActive?.({ page, surahId: active.surahId, ayahNumber: active.ayahNumber });
  }, [page, ayahs, active?.surahId, active?.ayahNumber, onActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={cardRef} className="mt-6 overflow-y-auto rounded-3xl border border-[#E6EFE9] bg-white p-4 shadow-sm sm:p-6">
      {/* الأدوات */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine text-sm font-extrabold text-white">
            {activeSurah ? arNum(activeSurah.id) : "…"}
          </span>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-pine">
              {activeSurah ? surahTitle(activeSurah) : "المصحف الشريف"}
              {activeSurah && <span className="rounded-full bg-[#F7EDE0] px-2.5 py-0.5 text-[10px] font-bold text-bronze">{placeLabel(activeSurah)}</span>}
            </h2>
            <p className="text-[11px] text-muted">
              {activeSurah ? `${arNum(activeSurah.ayahCount)} آيات • ` : ""}الجزء {JUZ_NAMES[juz - 1]}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => activeSurah && player.toggle(activeSurah.id)}
            disabled={!activeSurah || !player.hasTrack?.(activeSurah.id)}
            className="flex items-center gap-2 rounded-lg bg-pine px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
            {playing ? "إيقاف التلاوة" : "استماع للتلاوة المرتلة"}
          </button>
          <button type="button" onClick={() => changeSize(-1)} aria-label="تصغير الخط" className={toolBtn}>A-</button>
          <button type="button" onClick={() => changeSize(1)} aria-label="تكبير الخط" className={toolBtn}>A+</button>
          <button
            type="button"
            onClick={() => setTafsirOn((v) => !v)}
            aria-pressed={tafsirOn}
            className={`${toolBtn} gap-1.5 ${tafsirOn ? "!bg-[#F7EDE0] !text-bronze" : ""}`}
          >
            <Lightbulb size={13} />
            التفسير
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label="ملء الشاشة" className={toolBtn}>
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button type="button" onClick={share} aria-label="مشاركة" className={toolBtn}>
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* صفحة المصحف */}
      <div className="mt-5 rounded-2xl border border-[#C6923433] bg-[#FDFBF7] px-4 py-6 sm:px-10">
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-6 flex items-center justify-between border-b border-[#C6923433] pb-2 text-[11px] font-bold text-bronze">
            <span>{activeSurah ? surahTitle(activeSurah) : ""}</span>
            <span>الجزء {JUZ_NAMES[juz - 1]}</span>
          </div>

          {loading && <div className="h-[28rem] animate-pulse rounded-xl bg-[#F2F7F4]" />}
          {error && (
            <div className="py-10 text-center">
              <p className="text-sm text-red-600">تعذّر تحميل الصفحة، حاول مرة أخرى بعد قليل.</p>
              <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-pine px-5 py-2 text-xs font-bold text-white">
                إعادة المحاولة
              </button>
            </div>
          )}

          {groups.map((g) => {
            const surah = surahs?.find((s) => s.id === g.surahId);
            const startsHere = g.ayahs[0].ayahNumber === 1;
            const body = g.ayahs.filter((a) => !isBasmalaAyah(a));
            return (
              <div key={`${g.surahId}-${g.ayahs[0].ayahNumber}`} className="mb-6 last:mb-0">
                {startsHere && surah && (
                  <div className="mx-auto mb-6 w-fit rounded-full border border-[#C69234] bg-white px-10 py-2 text-center">
                    <p className="text-lg font-extrabold text-pine">{surahTitle(surah)}</p>
                    <p className="text-[10px] text-muted">
                      آياتها {arNum(surah.ayahCount)} • {placeLabel(surah)}
                    </p>
                  </div>
                )}
                {startsHere && g.surahId !== 9 && (
                  <p className="mb-6 text-center leading-[2.2] text-pine" style={{ fontFamily: QURAN_FONT, fontSize: size + 6 }}>
                    {BASMALA}
                  </p>
                )}
                {body.length > 0 && (
                  <p
                    lang="ar"
                    className="[text-align-last:center] [text-align:justify] [text-justify:inter-word] leading-[2.4] text-pine"
                    style={{ fontFamily: QURAN_FONT, fontSize: size }}
                  >
                    {body.map((a) => {
                      const on = active?.surahId === a.surahId && active?.ayahNumber === a.ayahNumber && tafsirOn;
                      return (
                        <span
                          key={a.id ?? `${a.surahId}-${a.ayahNumber}`}
                          onClick={() => {
                            setSelected({ surahId: a.surahId, ayahNumber: a.ayahNumber });
                            setTafsirOn(true);
                          }}
                          className={`cursor-pointer rounded-md transition ${on ? "bg-[#C6923433]" : "hover:bg-[#C6923420]"}`}
                        >
                          {a.textUthmani}
                          <span className="mx-1.5 align-middle text-bronze" style={{ fontSize: "0.62em" }}>
                            ﴿{arNum(a.ayahNumber)}﴾
                          </span>{" "}
                        </span>
                      );
                    })}
                  </p>
                )}
              </div>
            );
          })}

          {ayahs && <p className="mt-8 text-center text-xs font-bold text-bronze">— {arNum(page)} —</p>}
        </div>
      </div>

      {tafsirOn && activeSurah && ayahs && (
        <TafsirBox key={`${activeSurah.id}-${active.ayahNumber}`} surah={activeSurah} ayah={active.ayahNumber} />
      )}

      {/* الصفحة السابقة والتالية */}
      <nav className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6EFE9] pt-5 text-xs">
        {page > 1 ? (
          <Link to={`/quran/page/${page - 1}`} className="flex items-center gap-1 font-bold text-pine hover:underline">
            <ChevronRight size={14} />
            الصفحة السابقة
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-muted/60"><ChevronRight size={14} />بداية المصحف الشريف</span>
        )}

        <PageJump page={page} onGo={goToPage} />

        {page < TOTAL_PAGES ? (
          <Link to={`/quran/page/${page + 1}`} className="flex items-center gap-1 font-bold text-pine hover:underline">
            الصفحة التالية
            <ChevronLeft size={14} />
          </Link>
        ) : (
              <span className="flex items-center gap-1 text-muted/60">نهاية المصحف الشريف<ChevronLeft size={14} /></span>
        )}
      </nav>
    </section>
  );
}