import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  Clock,
  Download,
  Bookmark,
  PlayCircle,
  Moon,
  BookMarked,
  ArrowLeft,
  Quote,
  ScrollText,
} from "lucide-react";
import { useAdhkarProgress } from "../features/Home/hooks/useAdhkarProgress";
import { getLastRead } from "../features/Quran/lastRead";
import { TOTAL_PAGES, hizbOfPage, juzOfPage } from "../features/Quran/mushaf";
import { arNum } from "../features/Quran/utils";

const API_URL = "https://zawawy-api-staging.onrender.com";

const QUICK_LINKS = [
  {
    title: "القرآن الكريم",
    subtitle: "تلاوة ومصحف",
    href: "/quran",
    Icon: BookOpen,
    iconColor: "#087c58",
    bg: "#e9fbf3",
  },
  {
    title: "الأحاديث النبوية",
    subtitle: "صحيح ومأثور",
    href: "#hadith",
    Icon: BookMarked,
    iconColor: "#a94b00",
    bg: "#fff5e8",
  },
  {
    title: "تفسير وعلوم القرآن",
    subtitle: "دروس ومقالات",
    href: "#tafsir",
    Icon: ScrollText,
    iconColor: "#087c78",
    bg: "#eefbf8",
  },
  {
    title: "التنزيلات",
    subtitle: "للاستماع دون إنترنت",
    href: "/downloads",
    Icon: Download,
    iconColor: "#244fd0",
    bg: "#eef4ff",
  },
  {
    title: "المحفوظات",
    subtitle: "الصفحات والمقاطع",
    href: "#bookmarks",
    Icon: Bookmark,
    iconColor: "#087747",
    bg: "#effcf4",
  },
  {
    title: "مواقيت الصلاة",
    subtitle: "حسب موقعك",
    href: "#prayers",
    Icon: Clock,
    iconColor: "#c4320a",
    bg: "#fff5eb",
  },
  {
    title: "شورتس إسلامية",
    subtitle: "مقاطع قصيرة مؤثرة",
    href: "/shorts",
    Icon: PlayCircle,
    iconColor: "#c51b42",
    bg: "#fff0f3",
  },
  {
    title: "رمضان 2026",
    subtitle: "تلاوات وختمات",
    href: "#ramadan",
    Icon: Moon,
    iconColor: "#3d36c8",
    bg: "#eef1ff",
  },
];

const QuickDashboard = () => {
  const wird = useAdhkarProgress();
  const [hadith, setHadith] = useState(null);
  const [loadingHadith, setLoadingHadith] = useState(true);

  // آخر مكان وقف عنده في المصحف (بيتحفظ من صفحة القرآن)
  const [lastRead] = useState(getLastRead);
  const readPage = lastRead?.page ?? 1;
  const readLabel = lastRead
    ? `${lastRead.surahName ? `سورة ${lastRead.surahName} – ` : ""}صفحة ${arNum(readPage)}`
    : "سورة الفاتحة – صفحة ١";

  // Fetch random hadith
  useEffect(() => {
    const controller = new AbortController();

    const fetchHadith = async () => {
      try {
        const response = await fetch(
          `${API_URL}/v1/hadiths/random`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hadith");
        }

        const data = await response.json();
        setHadith(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("خطأ في جلب الحديث:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingHadith(false);
        }
      }
    };

    fetchHadith();

    return () => controller.abort();
  }, []);

  const hadithText =
    hadith?.textArabic ||
    "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى";

  const hadithSource =
    hadith?.source || "صحيح البخاري ومسلم";

  const hadithExplanation = hadith?.explanation
    ? `${hadith.explanation.substring(0, 75)}${
        hadith.explanation.length > 75 ? "..." : ""
      }`
    : "رواه أمير المؤمنين عمر بن الخطاب رضي الله عنه";

  return (
    <section
      dir="rtl"
      className="w-full bg-[#edf5f1] px-4 py-10 font-['Cairo',sans-serif] sm:px-6 lg:px-8 lg:py-12 xl:px-10 xl:py-14 2xl:px-12"
    >
      <div className="w-full space-y-12 lg:space-y-14 xl:space-y-16">

        {/* ================= MAIN CARDS ================= */}

        <div
          dir="ltr"
          className="grid w-full grid-cols-1 gap-5 md:grid-cols-3 xl:gap-6 2xl:gap-7"
        >
          {/* HADITH CARD - LEFT */}

          <article
            dir="rtl"
            className="flex min-w-0 min-h-[280px] flex-col justify-between rounded-[22px] border border-[#efdbbb] bg-gradient-to-br from-[#fffdf9] to-[#f8eee0] p-6 xl:min-h-[300px] xl:p-7 2xl:min-h-[320px] 2xl:p-8"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[#f0dfc3] bg-white/80 px-3 py-1 text-[10px] font-bold text-[#bd8122] xl:text-xs">
                  {loadingHadith
                    ? "صحيح البخاري ومسلم"
                    : hadithSource}
                </span>

                <div className="flex items-center gap-1 text-base font-extrabold text-[#c48b25] xl:text-lg">
                  <Quote className="h-4 w-4 rotate-180 fill-current xl:h-5 xl:w-5" />
                  <span>حديث اليوم</span>
                </div>
              </div>

              <div className="space-y-3 px-1 pt-6 text-center xl:pt-8">
                <p className="text-lg font-extrabold leading-[1.9] text-[#073c30] xl:text-xl 2xl:text-2xl">
                  «{hadithText}»
                </p>

                <p className="text-[11px] font-medium leading-6 text-[#69766f] xl:text-xs">
                  {hadithExplanation}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#f0dfc8] bg-white text-xs font-extrabold text-[#073c30] transition-colors hover:bg-[#fffaf2] xl:h-11 xl:text-sm"
            >
              <span>شرح وتدبر الحديث</span>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </article>

          {/* ADHKAR CARD - CENTER */}

          <article
            dir="rtl"
            className="flex min-w-0 min-h-[280px] flex-col justify-between rounded-[22px] border border-[#e2e9e5] bg-white p-6 xl:min-h-[300px] xl:p-7 2xl:min-h-[320px] 2xl:p-8"
          >
            <div>
              <div className="flex items-center gap-4">
                {/* Replace with your own image */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-[#e7f1eb] xl:h-16 xl:w-16">
                  <img
                    src="/images/athkar.jpeg"
                    alt="الأذكار والأدعية"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1.5 text-lg font-extrabold text-[#073c30] xl:text-xl">
                    <span>الأذكار والأدعية</span>
                    {/* <Sparkles className="h-4 w-4 shrink-0 text-[#07966b] xl:h-5 xl:w-5" /> */}
                  </h3>

                  <p className="mt-1 text-[11px] text-[#67736d] xl:text-xs">
                    حصن المسلم وأذكار مأثورة
                  </p>
                </div>
              </div>

              <div className="mt-6 flex min-h-[66px] items-center justify-between gap-3 rounded-[15px] border border-[#e5eee9] bg-[#f1f7f4] px-4 xl:mt-7 xl:min-h-[72px]">
                <div className="shrink-0 rounded-full bg-[#cdf8e6] px-3 py-1.5 text-[10px] font-extrabold text-[#087451] xl:text-xs">
                  {wird.total ? `${wird.done} / ${wird.total} منجز` : "-- / -- منجز"}
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold text-[#c18c30] xl:text-xs">
                    الورد المستحق:
                  </p>
                  <p className="mt-1 text-xs font-extrabold text-[#073c30] xl:text-sm">
                    {wird.name || "أذكار اليوم"}
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/adhkar"
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#e6f0eb] text-xs font-extrabold text-[#073c30] transition-colors hover:bg-[#d9e9e1] xl:h-11 xl:text-sm cursor-pointer"
            >
              <span>اذكر الآن</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </article>

          {/* QURAN CARD - RIGHT */}

          <article
            dir="rtl"
            className="flex min-w-0 min-h-[280px] flex-col justify-between rounded-[22px] border border-[#e2e9e5] bg-white p-6 xl:min-h-[300px] xl:p-7 2xl:min-h-[320px] 2xl:p-8"
          >
            <div>
              <div className="flex items-center gap-4">
                {/* Replace with your own image */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-[#f9eed5] xl:h-16 xl:w-16">
                  <img
                    src="/images/moshaf.jpeg"
                    alt="المصحف الشريف"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1.5 text-lg font-extrabold text-[#073c30] xl:text-xl">
                    <span>المصحف الشريف</span>
                    <BookOpen className="h-4 w-4 shrink-0 text-[#d49a2e] xl:h-5 xl:w-5" />
                  </h3>

                  <p className="mt-1 text-[11px] text-[#67736d] xl:text-xs">
                    {lastRead
                      ? `متابعة القراءة من صفحة ${arNum(readPage)}`
                      : "ابدأ قراءة المصحف من صفحة ١"}
                  </p>
                </div>
              </div>

              <div className="mt-8 xl:mt-10">
                <div className="flex items-center justify-between gap-3 text-[11px] font-extrabold xl:text-xs">
                  <span className="min-w-0 text-[#073c30]">{readLabel}</span>

                  <span className="shrink-0 text-[#c58b24]">
                    جزء {arNum(juzOfPage(readPage))} · حزب{" "}
                    {arNum(hizbOfPage(readPage))}
                  </span>
                </div>

                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#e6eee9]">
                  <div
                    className="h-full rounded-full bg-[#c99435]"
                    style={{
                      width: `${Math.max(2, (readPage / TOTAL_PAGES) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <Link
              to={`/quran/page/${readPage}`}
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#003c2d] text-xs font-extrabold text-white transition-colors hover:bg-[#07513d] xl:h-11 xl:text-sm"
            >
              <span>{lastRead ? "متابعة القراءة" : "ابدأ القراءة"}</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </article>
        </div>

        {/* ================= QUICK ACCESS ================= */}

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#073c30] xl:text-2xl">
              بوابات الوصول السريع
            </h2>

            <p className="hidden text-xs font-medium text-[#7c8983] sm:block xl:text-sm">
              كل ما يحتاجه المسلم في منصة واحدة
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 xl:gap-4 2xl:gap-5">
            {QUICK_LINKS.map(
              ({ title, subtitle, href, Icon, iconColor, bg }) => {
                // روابط الصفحات الداخلية (بتبدأ بـ /) بتتنقل بدون ريفريش
                const isPage = href.startsWith("/");
                const Tile = isPage ? Link : "a";
                const linkProps = isPage ? { to: href } : { href };

                return (
                  <Tile
                    key={href}
                    {...linkProps}
                    className="group flex min-w-0 min-h-[125px] flex-col items-center justify-center rounded-[16px] border border-[#edf0ed] bg-white px-2 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d9e7df] hover:shadow-sm xl:min-h-[140px] xl:py-5 2xl:min-h-[150px]"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-transform group-hover:scale-105 xl:h-12 xl:w-12"
                      style={{ backgroundColor: bg, color: iconColor }}
                    >
                      <Icon
                        className="h-5 w-5 xl:h-6 xl:w-6"
                        strokeWidth={2}
                      />
                    </div>

                    <div className="mt-3">
                      <h4 className="text-[11px] font-extrabold leading-5 text-[#073c30] xl:text-xs 2xl:text-sm">
                        {title}
                      </h4>

                      <p className="mt-1 text-[9px] leading-4 text-[#8a9690] xl:text-[10px] 2xl:text-xs">
                        {subtitle}
                      </p>
                    </div>
                  </Tile>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickDashboard;