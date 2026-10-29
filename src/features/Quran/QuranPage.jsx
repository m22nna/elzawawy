import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import Navbar from "../../components/NavBar";
import { useMushafPage, useSurahs, useTracks } from "./hooks/useQuranData";
import { getLastReadPage, setLastRead } from "./lastRead";
import { TOTAL_PAGES, firstPageOfSurah } from "./mushaf";
import { PlayerProvider } from "./player/PlayerProvider";
import QuranHeader from "./components/QuranHeader";
import ReaderCard from "./components/ReaderCard";
import SurahIndex from "./components/SurahIndex";
import PlayerBar from "./components/PlayerBar";

const toInt = (s) => (/^\d+$/.test(s ?? "") ? Number(s) : NaN);

function resolveRoute(splat) {
  const seg = (splat ?? "").split("/").filter(Boolean);
  if (seg.length === 2 && seg[0] === "page") {
    const n = toInt(seg[1]);
    if (n >= 1 && n <= TOTAL_PAGES) return { page: n, canonical: true };
  }
  if (seg.length === 1) {
    const n = toInt(seg[0]);
    if (n >= 1 && n <= 114) return { page: firstPageOfSurah(n), canonical: false };
  }
  return { page: getLastReadPage(), canonical: false };
}

function Content({ page, surahs, data, onActive }) {
  const { ayahs } = data;
  const primaryId = ayahs?.[0]?.surahId ?? null;

  return (
    <>
      <QuranHeader surahs={surahs} />

      <ReaderCard page={page} surahs={surahs} {...data} onRetry={data.retry} onActive={onActive} />

      <SurahIndex surahs={surahs} currentId={primaryId} currentPage={page} />

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6EFE9] pt-5 text-[10px] text-muted">
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

export default function QuranPage() {
  const splat = useParams()["*"];
  const navigate = useNavigate();
  const { tracks, reciter } = useTracks();
  const { surahs } = useSurahs();

  const { page, canonical } = useMemo(() => resolveRoute(splat), [splat]);
  const data = useMushafPage(page);

  useEffect(() => {
    if (!canonical) navigate(`/quran/page/${page}`, { replace: true });
  }, [canonical, page, navigate]);

  // نحفظ مكان القراءة (السورة اللي ظاهرة فوق الصفحة) عشان "متابعة القراءة" في الرئيسية
  const firstAyah = data.ayahs?.[0];
  const saveReading = useCallback(
    (a) => {
      const surah = surahs?.find((s) => s.id === a.surahId);
      setLastRead({
        page: a.page,
        surahId: a.surahId,
        surahName: surah?.nameArabic?.replace(/^سورة\s*/, "") ?? null,
        ayah: a.ayahNumber,
      });
    },
    [surahs]
  );

  return (
    <PlayerProvider tracks={tracks} reciter={reciter}>
      <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-body">
        <Navbar />
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
          <Content page={page} surahs={surahs} data={data} onActive={canonical ? saveReading : undefined} />
        </div>
        <PlayerBar fallbackId={firstAyah?.surahId ?? 1} surahs={surahs} />
      </div>
    </PlayerProvider>
  );
}