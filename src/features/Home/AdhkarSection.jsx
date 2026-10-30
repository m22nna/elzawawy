import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark, Sun, Sunset, Moon, Share2, Play, Pause, RotateCw, RotateCcw,
  Plus, PlusCircle, ChevronRight, ChevronLeft, Volume2, VolumeX,
  BadgeCheck, BookOpen, Clock, Hand, ArrowLeft, Landmark, ScrollText,
  Infinity as InfinityIcon, SkipForward, SkipBack, Heart, X, ClipboardCheck,
  AlertTriangle, ListMusic, ListPlus,
} from "lucide-react";
import { api } from "../../api/client";
import { useRecitations } from "../../api/useRecitations";
import { markDone, loadProgress, doneCount as storeDoneCount } from "./wirdStore";
import { useWirdAudio } from "./useWirdAudio";
import { CATEGORY_UI, DEFAULT_UI, WIRD_AUDIO_SURAHS } from "../../config/adhkarUi";
import Navbar from "../../components/NavBar";
import { Link } from "react-router-dom";

/* ───────────── Design tokens ───────────── */
const C = { goldRing: "#C69234" };

// إعدادات موحّدة لعرض النصوص العربية المشكولة بدون تباعد زائد بين الحروف.
const QURAN = {
  fontFamily: "'Amiri Quran', 'Amiri', serif",
  fontWeight: 400,
  lineHeight: 2.3,
  letterSpacing: "normal",
  wordSpacing: "normal",
  fontKerning: "normal",
  fontVariantLigatures: "common-ligatures",
  textRendering: "optimizeLegibility",
  direction: "rtl",
};
const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
`;

const Wrap = ({ className = "", ...p }) => (
  <div className={`mx-auto w-full max-w-[1600px] px-6 lg:px-10 ${className}`} {...p} />
);

const times = (n) => {
  if (!n || n <= 1) return "مرة واحدة";
  if (n === 2) return "مرتان";
  if (n >= 3 && n <= 10) return `${n} مرّات`;
  return `${n} مرّة`;
};

const ORDINALS = [
  "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر",
  "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر",
  "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون",
];

const fmt = (s) => {
  if (!Number.isFinite(s) || s <= 0) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const CAT_META = {
  morning: { Icon: Sun, iconTone: "brown", group: "daily" },
  evening: { Icon: Sunset, iconTone: "green", group: "daily" },
  sleep: { Icon: Moon, iconTone: "mint", group: "daily" },
  "after-prayer": { Icon: Landmark, iconTone: "mint", group: "daily" },
  "waking-up": { Icon: Sun, iconTone: "cream", group: "daily" },
  mosque: { Icon: Volume2, iconTone: "mint", group: "occasions" },
  "quranic-duas": { Icon: BookOpen, iconTone: "cream", group: "occasions" },
  "prophetic-duas": { Icon: ScrollText, iconTone: "mint", group: "occasions" },
  "tasbih-and-istighfar": { Icon: InfinityIcon, iconTone: "mint", group: "daily" },
};
const DEFAULT_META = { Icon: BookOpen, iconTone: "mint", group: "occasions" };

const TASBIH_SLUG = "tasbih-and-istighfar";
const SAVED_ADHKAR_KEY = "adhkar:saved:v1";

const readSavedAdhkar = () => {
  try {
    const value = JSON.parse(localStorage.getItem(SAVED_ADHKAR_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const ICON_TONE = {
  brown: "bg-[#7A5A14] text-white",
  green: "bg-[#063F30] text-white",
  mint: "bg-[#E3EEE8] text-[#063F30]",
  cream: "bg-[#FFE9C2] text-[#7A5A14]",
};

const WAVE = [6, 12, 8, 16, 10, 18, 7, 14, 9, 17, 6, 13, 8, 15, 10, 12, 7, 11];

const bySortOrder = (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);

const normalize = (list) =>
  [...list].sort(bySortOrder).map((c) => ({
    ...c,
    items: [...(c.items || [])].sort(bySortOrder).map((it) => ({
      ...it,
      repeatCount: Number(it.repeatCount) || 1,
    })),
  }));

const buildTasbihCards = (categories) => {
  const cat = categories.find((c) => c.slug === TASBIH_SLUG);
  if (!cat) return [];
  return cat.items.map((it, i) => ({
    id: `api_${it.sortOrder ?? i}`,
    text: `«${String(it.textArabic).trim().replace(/[.۔]$/, "")}»`,
    target: it.repeatCount || 1,
    label: it.virtue || "",
    dotColor: i % 2 === 0 ? "#7A5A14" : "#063F30",
  }));
};

const fractionFromClick = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  return Math.min(1, Math.max(0, (r.right - e.clientX) / r.width)); // RTL: البداية من اليمين
};

function useAdhkar() {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, error: null, loading: true }));
    api("/v1/adhkar", { signal: ctrl.signal })
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setState({ data: normalize(list), error: null, loading: false });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error("API error: /v1/adhkar", error);
        setState({ data: null, error, loading: false });
      });
    return () => ctrl.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

function PageShell({ children }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#EFF8F3] text-[#063F30]" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <style>{FONTS_CSS}</style>
      <Navbar />
      {children}
    </div>
  );
}

function SlowHint() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);
  if (!slow) return null;
  return <p className="mt-2 text-xs text-[#063F30]/60"> أول تحميل ممكن ياخد لحد دقيقة</p>;
}

export default function AdhkarSection() {
  const { data, error, loading, retry } = useAdhkar();
  const categories = data || [];

  const [selectedSlug, setSelectedSlug] = useState(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [itemCounter, setItemCounter] = useState(0);
  const [filter, setFilter] = useState("all");
  const [liked, setLiked] = useState(false);
  const [savedItems, setSavedItems] = useState(readSavedAdhkar);
  const [actionMessage, setActionMessage] = useState("");
  const [storeTick, setStoreTick] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);

  const [customCards, setCustomCards] = useState([]);
  const [counters, setCounters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCardText, setNewCardText] = useState("");
  const [newCardTarget, setNewCardTarget] = useState(100);
  const [newCardLabel, setNewCardLabel] = useState("");

  const sessionRef = useRef(null);
  const advanceTimer = useRef(null);
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_ADHKAR_KEY, JSON.stringify(savedItems));
    } catch (error) {
      console.error("Could not save adhkar", error);
    }
  }, [savedItems]);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const selectedCategory =
    categories.find((c) => c.slug === selectedSlug) ||
    categories.find((c) => c.slug === "morning") ||
    categories[0] ||
    null;
  const activeSlug = selectedCategory?.slug;
  const activeItems = selectedCategory?.items || [];
  const activeItem = activeItems[activeItemIndex] || activeItems[0] || null;
  const currentUi = CATEGORY_UI[activeSlug] || DEFAULT_UI;
  const currentMeta = CAT_META[activeSlug] || DEFAULT_META;
  const HeroIcon = currentMeta.Icon;

  const repeat = activeItem?.repeatCount || 1;
  const remaining = Math.max(0, repeat - itemCounter);
  // المنجز = الأذكار اللي خلصت فعلاً (نفس المحفوظ اللي بيقراه كارت الرئيسية)
  const doneCount = useMemo(
    () => Math.min(storeDoneCount(loadProgress(), activeSlug), activeItems.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSlug, activeItems.length, storeTick],
  );
  const progressPercent = activeItems.length > 0 ? Math.round((doneCount / activeItems.length) * 100) : 0;

  const savedKey = activeItem ? `${activeSlug}:${activeItem.id ?? activeItemIndex}` : "";
  const isActiveSaved = savedItems.some((item) => item.key === savedKey);

  const toggleSaveActiveItem = () => {
    if (!activeItem || !savedKey) return;
    if (isActiveSaved) {
      setSavedItems((items) => items.filter((item) => item.key !== savedKey));
      setActionMessage("تمت إزالة الذكر من المحفوظات");
      return;
    }
    setSavedItems((items) => [
      ...items,
      {
        key: savedKey,
        slug: activeSlug,
        categoryName: selectedCategory?.nameArabic || "الأذكار",
        textArabic: activeItem.textArabic,
        reference: activeItem.reference || "",
        virtue: activeItem.virtue || "",
        savedAt: Date.now(),
      },
    ]);
    setActionMessage("تم حفظ الذكر بنجاح");
  };

  const shareActiveItem = async () => {
    if (!activeItem) return;
    const shareText = [
      `«${activeItem.textArabic}»`,
      activeItem.reference ? `المصدر: ${activeItem.reference}` : "",
      "من صفحة الأذكار والأدعية - الزواوي",
    ].filter(Boolean).join("\n\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "ذكر من الأذكار والأدعية", text: shareText });
        setActionMessage("تم فتح قائمة المشاركة");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setActionMessage("تم نسخ الذكر، يمكنك مشاركته الآن");
      } else {
        window.prompt("انسخ الذكر لمشاركته:", shareText);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareText);
          setActionMessage("تم نسخ الذكر، يمكنك مشاركته الآن");
        } catch {
          setActionMessage("تعذّرت المشاركة من هذا المتصفح");
        }
      }
    }
  };

  /* ───── الصوت ───── */
  const { tracks: recTracks, reciter } = useRecitations();
  const reciterName = reciter?.startsWith("الشيخ") ? reciter : `الشيخ ${reciter}`;

  const audioTracks = useMemo(() => {
    if (!selectedCategory) return [];
    // 1) لو الباك رجّع audioUrl للقسم يبقى هو المصدر
    if (selectedCategory.audioUrl) {
      return [{ id: `cat-${activeSlug}`, title: selectedCategory.nameArabic, url: selectedCategory.audioUrl }];
    }
    // 2) غير كده: تلاوة الشيخ لسور الورد من /v1/recitations
    const ids = WIRD_AUDIO_SURAHS[activeSlug];
    if (!ids) return [];
    if (!recTracks) return null; // لسه بيتحمّل
    const byId = new Map(recTracks.map((t) => [t.id, t]));
    return ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((t) => ({ id: t.id, title: t.title, url: t.audioUrl }));
  }, [selectedCategory, activeSlug, recTracks]);

  const audioStatus = audioTracks === null ? "loading" : audioTracks.length ? "ready" : "none";
  const audio = useWirdAudio(audioTracks || [], activeSlug);
  const audioReady = audioStatus === "ready";

  const audioSubtitle = audio.error
    ? "تعذّر تشغيل الصوت، جرّب مرة أخرى"
    : audioStatus === "none"
    ? "لا يوجد تسجيل صوتي لهذا الباب بعد"
    : audioStatus === "loading"
    ? "جاري تحميل التسجيل..."
    : `تلاوة هادئة ومحفوفة بالتجويد • ${audio.duration ? fmt(audio.duration) : "--:--"} د`;

  const goTo = (i) => {
    clearTimeout(advanceTimer.current);
    setActiveItemIndex(i);
    setItemCounter(0);
  };

  const handleIncrement = () => {
    if (!activeItem || itemCounter >= repeat) return;
    const next = itemCounter + 1;
    setItemCounter(next);
    if (next >= repeat) {
      markDone(activeSlug, activeItemIndex);
      setStoreTick((t) => t + 1);
    }
    if (next >= repeat && activeItemIndex + 1 < activeItems.length) {
      advanceTimer.current = setTimeout(() => {
        setActiveItemIndex((p) => p + 1);
        setItemCounter(0);
      }, 700);
    }
  };

  const handleTasbihIncrement = (id) => {
    setCounters((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleCreateCustomCard = (e) => {
    e.preventDefault();
    if (!newCardText.trim()) return;
    const newCard = {
      id: `custom_${Date.now()}`,
      text: `«${newCardText.trim()}»`,
      target: Number(newCardTarget) || 100,
      label: newCardLabel.trim() || "ورد خاص",
      dotColor: "#063F30",
    };
    setCustomCards((prev) => [...prev, newCard]);
    setNewCardText("");
    setNewCardLabel("");
    setIsModalOpen(false);
  };

  const selectCategory = (slug) => {
    clearTimeout(advanceTimer.current);
    setSelectedSlug(slug);
    setActiveItemIndex(0);
    setItemCounter(0);
    sessionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ───── حالات التحميل / الخطأ / الفراغ ───── */
  if (loading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center pt-32 text-[#063F30]">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#063F30] border-t-transparent" />
          <p className="text-sm font-bold">جاري تحميل الأذكار والأدعية من السيرفر...</p>
          <SlowHint />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center px-6 pt-32 text-center">
          <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#FFE9C2] text-[#7A5A14]">
            <AlertTriangle size={26} />
          </span>
          <p className="text-base font-bold">تعذّر تحميل الأذكار</p>
          <p className="mt-1 text-xs text-[#063F30]/65">اتأكد من الاتصال بالإنترنت وجرّب تاني.</p>
          <button
            onClick={retry}
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#063F30] px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-[#084e3c]"
          >
            <RotateCw size={14} /> إعادة المحاولة
          </button>
        </div>
      </PageShell>
    );
  }

  if (categories.length === 0) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center pt-32 text-center">
          <p className="text-base font-bold">لا توجد أذكار متاحة حاليًا</p>
          <button
            onClick={retry}
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#063F30] px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-[#084e3c]"
          >
            <RotateCw size={14} /> تحديث
          </button>
        </div>
      </PageShell>
    );
  }

  const visibleCategories = categories.filter((cat) => {
    if (filter === "all") return true;
    return (CAT_META[cat.slug] || DEFAULT_META).group === filter;
  });

  const tasbihCards = [...buildTasbihCards(categories), ...customCards];
  const progressFraction = audio.duration ? Math.min(1, audio.current / audio.duration) : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-[#EFF8F3] pb-44 text-[#063F30]" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <style>{FONTS_CSS}</style>
      <Navbar />

      <audio {...audio.audioProps} />

      <Wrap className="pb-2 pt-6">
        <div className="mb-3 flex items-center gap-1.5 text-xs text-[#063F30]/60">
          <Link to="/" className="cursor-pointer hover:underline">الرئيسية</Link>
          <ChevronLeft size={12} />
          <span className="font-bold text-[#063F30]">الأذكار والأدعية</span>
        </div>

        <div className="my-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#063F30] md:text-4xl">الأذكار والأدعية</h1>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F6E7C3] text-lg text-[#C69234]">✦</span>
            </div>
            <p className="mt-2 text-sm text-[#063F30]/70">
              اجعل ذكر الله جزءاً من يومك، واختر ما يناسب وقتك وحاجتك من السُّنّة المطهّرة بصوت الشيخ عبد الرحمن الزواوي.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#DCEAE2] bg-white p-3 shadow-sm">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <svg className="h-12 w-12 -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#E3EEE8" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke={C.goldRing} strokeWidth="4" fill="transparent" strokeLinecap="round"
                  strokeDasharray="125.66" strokeDashoffset={125.66 - (125.66 * progressPercent) / 100} />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#063F30]">{progressPercent}%</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#7A5A14]"></span>
                <span className="text-xs font-bold text-[#063F30]">الورد اليومي المنجز</span>
              </div>
              <span className="text-[11px] text-[#063F30]/60">
                {doneCount} من {activeItems.length} ذكراً متواصلاً
              </span>
            </div>
          </div>
        </div>
      </Wrap>

      {/* الهيرو الرئيسي */}
      {activeItem && (
        <Wrap className="my-4">
          <div
            className="relative flex min-h-[620px] flex-col justify-between overflow-hidden rounded-xl border border-[#063F30]/40 bg-cover bg-center p-6 shadow-xl md:min-h-[820px] md:p-8"
            style={{ backgroundImage: `linear-gradient(to bottom, rgba(6, 63, 48, 0.4), rgba(6, 63, 48, 0.85)), url('/background.jpg')` }}
          >
            <div className="z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-[#FFDEA4] px-4 py-1.5 text-xs font-bold text-[#063F30] shadow-sm">
                  <HeroIcon size={13} /> {selectedCategory.nameArabic}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0D2018]/60 px-3.5 py-1.5 text-[11px] text-white/90 backdrop-blur-md">
                  <Clock size={12} /> الوقت المستحب: {currentUi.when}
                </span>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-white/15 bg-[#0D2018]/60 px-4 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md">
                التكرار المطلوب: {times(repeat)}
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFDEA4]" />
                التقدم: {itemCounter} / {repeat}
              </span>
            </div>

            {/* كارت الاستماع */}
            <div className="z-10 my-6">
              <div className={`flex w-full items-center justify-between gap-4 rounded-2xl border border-white/20 bg-[#152E23]/65 p-3 shadow-xl backdrop-blur-lg ${audioStatus === "none" ? "opacity-70" : ""}`}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={audio.toggle}
                    disabled={!audioReady}
                    aria-label={audio.isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D0] text-[#063F30] shadow-md transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {audio.isPlaying ? <Pause size={18} fill="#063F30" /> : <Play size={18} fill="#063F30" className="mr-0.5" />}
                  </button>
                  <div>
                    <h4 className="text-xs font-bold text-white md:text-sm">الاستماع بصوت {reciterName}</h4>
                    <p className="text-[11px] text-white/70">{audioSubtitle}</p>
                  </div>
                  <div className="mr-4 hidden items-center gap-[3px] sm:flex">
                    {WAVE.map((h, i) => (
                      <span
                        key={i}
                        className={`w-[3px] rounded-full bg-[#FFDEA4]/80 ${audio.isPlaying ? "animate-pulse" : ""}`}
                        style={{ height: h + 4, animationDelay: `${i * 70}ms` }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={audio.toggle}
                  disabled={!audioReady}
                  className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#8C6A1C] px-5 py-2.5 text-xs font-bold text-[#FFF1D0] shadow transition hover:bg-[#9a7420] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#8C6A1C]"
                >
                  <BookOpen size={14} /> {audio.isPlaying ? "إيقاف مؤقت" : "ابدأ الورد الآن"}
                </button>
              </div>
            </div>

            <div className="z-10 grid grid-cols-1 items-end gap-6 md:grid-cols-12">
              <div className="space-y-5 md:col-span-8">
                <p className="whitespace-pre-line text-2xl leading-[2.3] tracking-normal text-white drop-shadow-md md:text-[40px]" style={QURAN}>
                  «{activeItem.textArabic}»
                </p>
                {activeItem.reference && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0D2018]/60 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-md">
                      <ScrollText size={13} className="text-[#FFDEA4]" /> المصدر: {activeItem.reference}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end md:col-span-4">
                <div className="w-full max-w-[300px] rounded-2xl border border-white/20 bg-[#0D2018]/60 p-5 text-center shadow-2xl backdrop-blur-md">
                  <span className="mb-3 block text-[11px] font-bold text-white/70">مؤشر تكرار الذكر</span>

                  <div className="relative mx-auto my-1 flex h-28 w-28 items-center justify-center">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="transparent" />
                      <circle
                        cx="40" cy="40" r="32" stroke="#FFDEA4" strokeWidth="6" fill="transparent" strokeLinecap="round"
                        strokeDasharray="201.06"
                        strokeDashoffset={201.06 - 201.06 * Math.min(1, itemCounter / repeat)}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{itemCounter} / {repeat}</span>
                      <span className="text-[10px] text-white/60">مكتمل</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-white/70">
                    <span>المتبقي: {times(remaining)}</span>
                    <span>{Math.round((itemCounter / repeat) * 100)}% منجَز</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Wrap>
      )}

      {/* جلسة الذكر التفاعلية */}
      <Wrap className="my-10">
        <div ref={sessionRef} className="mb-6 flex items-center justify-between border-b border-[#DCEAE2] pb-5">
          <div>
            <h2 className="text-[26px] font-bold text-[#063F30]">جلسة الذكر التفاعلية</h2>
            <p className="mt-1 text-sm text-[#063F30]/65">اقرأ بتمعّن، واستحضر القلب مع كل تسبيحة ودعاء.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={activeItemIndex === 0}
              onClick={() => goTo(activeItemIndex - 1)}
              aria-label="السابق"
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#E3EEE8] text-[#063F30] transition hover:bg-[#d4e6dc] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
            <span className="rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs font-bold text-[#063F30]">
              {activeItems.length > 0 ? activeItemIndex + 1 : 0} من {activeItems.length}
            </span>
            <button
              disabled={activeItemIndex + 1 >= activeItems.length}
              onClick={() => goTo(activeItemIndex + 1)}
              aria-label="التالي"
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#E3EEE8] text-[#063F30] transition hover:bg-[#d4e6dc] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        {activeItem && (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
            <div className="flex flex-col justify-between rounded-2xl border border-[#DCEAE2] bg-white p-6 shadow-sm md:col-span-8 md:min-h-[620px] md:p-12">
              <div>
                <div className="mb-5 flex items-center justify-between border-b border-[#E3EEE8] pb-5">
                  <span className="rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs font-bold text-[#063F30]">
                    الذكر {ORDINALS[activeItemIndex] || `رقم ${activeItemIndex + 1}`} • {selectedCategory.nameArabic}
                  </span>
                  <button onClick={() => setItemCounter(0)} className="flex items-center gap-1.5 text-xs text-[#063F30]/70 hover:text-[#063F30]">
                    <RotateCw size={13} /> إعادة ضبط
                  </button>
                </div>

                <p className="my-8 whitespace-pre-line text-3xl leading-[2.3] tracking-normal text-[#063F30] md:text-4xl" style={QURAN}>
                  «{activeItem.textArabic}»
                </p>

                {activeItem.virtue && (
                  <div className="relative mt-10 rounded-2xl border border-[#CFE3D8] bg-[#E8F3ED] p-5 pr-6">
                    <span className="absolute -right-3 top-6 grid h-7 w-7 place-items-center rounded-full bg-[#EFF8F3] text-[#7A5A14]">
                      <BadgeCheck size={24} />
                    </span>
                    <h5 className="mb-2 text-xs font-bold text-[#063F30]">فضل هذا الذكر:</h5>
                    <p className="text-sm leading-7 text-[#063F30]/85">{activeItem.virtue}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#E3EEE8] pt-6 text-xs text-[#063F30]/70">
                <span>{activeItem.reference ? `المصدر: ${activeItem.reference}` : ""}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSaveActiveItem}
                    aria-label={isActiveSaved ? "إزالة من المحفوظات" : "حفظ الذكر"}
                    title={isActiveSaved ? "إزالة من المحفوظات" : "حفظ الذكر"}
                    className={`grid h-11 w-11 place-items-center rounded-xl transition hover:bg-[#d4e6dc] ${isActiveSaved ? "bg-[#063F30] text-white" : "bg-[#E3EEE8] text-[#063F30]"}`}
                  >
                    <Bookmark size={16} fill={isActiveSaved ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={shareActiveItem}
                    aria-label="مشاركة الذكر"
                    title="مشاركة الذكر"
                    className="grid h-11 w-11 place-items-center rounded-xl bg-[#E3EEE8] text-[#063F30] transition hover:bg-[#d4e6dc]"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between rounded-2xl border border-[#DCEAE2] bg-white p-6 text-center shadow-sm md:col-span-4">
              <span className="mt-8 rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs font-bold text-[#063F30]">
                الهدف المطلوب: {times(repeat)}
              </span>

              <button
                onClick={handleIncrement}
                aria-label="اضغط للتسبيح"
                className="my-6 flex h-[200px] w-[200px] flex-col items-center justify-center rounded-full border-[10px] border-[#E3EEE8] bg-white shadow-[0_0_0_6px_#F0F6F3] transition active:scale-95"
              >
                <span className="text-6xl font-bold text-[#063F30]">{itemCounter}</span>
                <span className="mt-1 text-xs font-bold text-[#063F30]">اضغط للتسبيح</span>
                <Hand size={20} className="mt-1 text-[#7A5A14]" />
              </button>

              <div className="mb-4 space-y-4">
                <span className="block rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs text-[#063F30]/70">
                  المتبقي: <b className="text-[#063F30]">{times(remaining)}</b>
                </span>
                <span className="block text-sm text-[#7A5A14]">
                  {itemCounter === 0 ? "انقر لتبدأ التسبيح" : itemCounter >= repeat ? "تقبّل الله منك، أتممت الذكر" : "واصل التسبيح"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Wrap>

      {/* أبواب الأذكار */}
      <Wrap className="my-12">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-[28px] font-bold text-[#063F30]">أبواب الأذكار والأدعية المأثورة</h2>
            <p className="mt-1 text-sm text-[#063F30]/65">موسوعة مصنفة وشاملة من صحيح السُّنّة النبوية والقرآن الكريم</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: `الكل (${categories.length} أبواب)` },
              { id: "daily", label: "اليومية" },
              { id: "occasions", label: "المناسبات" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition ${
                  filter === f.id ? "bg-[#063F30] text-white" : "bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6 border-t border-[#DCEAE2]" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visibleCategories.map((cat) => {
            const meta = CAT_META[cat.slug] || DEFAULT_META;
            const ui = CATEGORY_UI[cat.slug] || DEFAULT_UI;
            const CardIcon = meta.Icon;
            const isSelected = activeSlug === cat.slug;
            const dark = isSelected || ui.featured;
            const count = cat.items?.length || 0;
            const body = ui.desc || cat.items?.[0]?.textArabic || "";

            return (
              <div
                key={cat.slug}
                className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
                  isSelected
                    ? "border-[#D9C79F] bg-gradient-to-br from-white via-[#FFF8E8] to-[#FFEFD0]"
                    : ui.featured
                    ? "border-[#CFE0D6] bg-gradient-to-br from-[#E3F1EA] to-white"
                    : "border-[#DCEAE2] bg-white"
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${ICON_TONE[meta.iconTone]}`}>
                      <CardIcon size={18} />
                    </div>
                    {ui.tag && (
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${ui.tagTone === "gold" ? "bg-[#FFE9C2] text-[#7A5A14]" : "bg-[#E3EEE8] text-[#063F30]"}`}>
                        {ui.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#063F30]">{cat.nameArabic}</h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-6 text-[#063F30]/75">{body}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E3EEE8] pt-4">
                  <span className="text-[11px] font-bold text-[#063F30]/60">{count} {ui.unit}</span>
                  <button
                    onClick={() => selectCategory(cat.slug)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      dark ? "bg-[#063F30] text-white hover:bg-[#084e3c]" : "bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]"
                    }`}
                  >
                    قراءة الأذكار <ArrowLeft size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Wrap>

      {/* المسبحة الحرة والعدادات المخصصة */}
      <Wrap className="my-16">
        <div className="rounded-2xl border border-[#DCEAE2] bg-white p-6 shadow-sm md:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#063F30] md:text-3xl">المسبحة الحرة والعدادات المخصصة</h2>
              <p className="mt-1.5 text-xs text-[#063F30]/70 md:text-sm">
                أوراد سريعة وعدادات مسبقة التجهيز لذكر الله في يومك
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#DCEAE2] bg-[#EFF8F3] px-4 py-2 text-[11px] font-bold text-[#063F30]">
              <ClipboardCheck size={14} className="text-[#7A5A14]" />
              <span>حفظ ومزامنة العدادات يتطلب تسجيل الدخول</span>
            </div>
          </div>

          {tasbihCards.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tasbihCards.map((card) => {
                const currentVal = counters[card.id] || 0;
                return (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between rounded-xl border border-[#E3EEE8] bg-[#F4F9F6] p-5 transition hover:shadow-md"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: card.dotColor }} />
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#063F30] shadow-sm">
                        {card.target} مرة
                      </span>
                    </div>

                    <p className="my-4 text-center text-xl leading-[2.2] tracking-normal text-[#063F30]" style={QURAN}>
                      {card.text}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E3EEE8] pt-4">
                      <div>
                        {card.label && (
                          <span className="block max-w-[140px] truncate text-[10px] font-semibold text-[#063F30]/60" title={card.label}>
                            {card.label}
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#7A5A14]">{currentVal} / {card.target}</span>
                      </div>
                      <button
                        onClick={() => handleTasbihIncrement(card.id)}
                        aria-label="تسبيح"
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#063F30] text-white shadow transition hover:bg-[#084e3c] active:scale-95"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#DCEAE2] bg-[#EAF4EF] p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#063F30] shadow-sm">
                <ListPlus size={18} />
              </span>
              <div>
                <h4 className="text-base font-bold text-[#063F30]">هل تريد تخصيص ورد أو ذكر معين؟</h4>
                <p className="mt-1 text-xs text-[#063F30]/75">أنشئ عدادك الخاص بالعدد المفضل، واضبط التنبيه اليومي المناسب</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#063F30] px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-[#084e3c]"
            >
              <PlusCircle size={16} />
              <span>إنشاء عداد مخصص</span>
            </button>
          </div>
        </div>
      </Wrap>

      {/* مشغل الصوت السفلي الثابت */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCEAE2] bg-[#F7FCF9]/95 px-6 py-3 shadow-2xl backdrop-blur-md">
        {queueOpen && audio.count > 0 && (
          <div className="absolute bottom-full left-6 mb-2 w-72 rounded-2xl border border-[#DCEAE2] bg-white p-2 shadow-2xl">
            <p className="px-3 py-2 text-[11px] font-bold text-[#063F30]/60">قائمة التشغيل</p>
            {audioTracks.map((t, i) => (
              <button
                key={t.id}
                onClick={() => audio.selectTrack(i)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-[#E3EEE8] ${
                  i === audio.index ? "bg-[#E3EEE8] text-[#063F30]" : "text-[#063F30]/80"
                }`}
              >
                <span>{t.title}</span>
                {i === audio.index && audio.isPlaying && <Volume2 size={13} className="text-[#7A5A14]" />}
              </button>
            ))}
          </div>
        )}

        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#063F30] text-white shadow">
              <Volume2 size={22} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#063F30]">{selectedCategory?.nameArabic}</h4>
              <p className="text-[11px] text-[#063F30]/70">
                {audio.count > 1 && audio.track ? `${audio.track.title} • ` : ""}{reciterName}
              </p>
            </div>
            <button
              onClick={() => setLiked((v) => !v)}
              aria-label="إعجاب"
              className={`mr-2 transition ${liked ? "text-[#C0392B]" : "text-[#063F30]/60 hover:text-[#063F30]"}`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="hidden max-w-xl flex-1 flex-col items-center md:flex">
            <div dir="ltr" className="flex items-center gap-5">
              <button onClick={() => audio.skip(-10)} disabled={!audioReady} aria-label="رجوع 10 ثوان" className="text-[#063F30]/70 hover:text-[#063F30] disabled:opacity-40"><RotateCcw size={16} /></button>
              <button onClick={audio.prev} disabled={!audioReady} aria-label="السابق" className="text-[#063F30]/70 hover:text-[#063F30] disabled:opacity-40"><SkipBack size={18} /></button>
              <button
                onClick={audio.toggle}
                disabled={!audioReady}
                aria-label="تشغيل أو إيقاف"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#063F30] text-white shadow hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {audio.isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              <button onClick={audio.next} disabled={!audioReady} aria-label="التالي" className="text-[#063F30]/70 hover:text-[#063F30] disabled:opacity-40"><SkipForward size={18} /></button>
              <button onClick={() => audio.skip(10)} disabled={!audioReady} aria-label="تقديم 10 ثوان" className="text-[#063F30]/70 hover:text-[#063F30] disabled:opacity-40"><RotateCw size={16} /></button>
            </div>

            <div className="mt-2 flex w-full items-center gap-3 text-[11px] text-[#063F30]/70">
              <span className="w-10 text-center tabular-nums">{fmt(audio.current)}</span>
              <div
                onClick={(e) => audioReady && audio.seek(fractionFromClick(e))}
                className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-[#DCEAE2]"
              >
                <div className="absolute h-full rounded-full bg-[#063F30]" style={{ width: `${progressFraction * 100}%` }} />
              </div>
              <span className="w-10 text-center tabular-nums">{fmt(audio.duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={audio.cycleRate}
              disabled={!audioReady}
              aria-label="سرعة التشغيل"
              className="rounded-lg bg-[#E3EEE8] px-2.5 py-1 text-[10px] font-bold text-[#063F30] disabled:opacity-50"
            >
              {audio.rate === 1 ? "1.0" : audio.rate}x
            </button>
            <button
              onClick={() => audio.setVolume(audio.volume > 0 ? 0 : 0.75)}
              aria-label="الصوت"
              className="text-[#063F30]/70 hover:text-[#063F30]"
            >
              {audio.volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <div
              onClick={(e) => audio.setVolume(fractionFromClick(e))}
              className="hidden h-1.5 w-24 cursor-pointer overflow-hidden rounded-full bg-[#DCEAE2] sm:block"
            >
              <div className="h-full bg-[#063F30]" style={{ width: `${audio.volume * 100}%` }} />
            </div>
            <button
              onClick={() => setQueueOpen((v) => !v)}
              disabled={audio.count === 0}
              aria-label="قائمة التشغيل"
              className="text-[#063F30]/70 hover:text-[#063F30] disabled:opacity-40"
            >
              <ListMusic size={16} />
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div role="status" className="fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 rounded-xl bg-[#063F30] px-5 py-3 text-sm font-bold text-white shadow-xl">
          {actionMessage}
        </div>
      )}

      {/* نافذة إنشاء العداد المخصص (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between border-b border-[#E3EEE8] pb-4">
              <h3 className="text-xl font-bold text-[#063F30]">إنشاء عداد ذكر مخصص</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="إغلاق"
                className="grid h-8 w-8 place-items-center rounded-full bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCard} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold text-[#063F30]">نص الذكر أو الدعاء:</label>
                <textarea
                  rows={3}
                  required
                  value={newCardText}
                  onChange={(e) => setNewCardText(e.target.value)}
                  placeholder="اكتب الذكر هنا، مثلاً: (سبحان الله العظيم وبحمده)..."
                  className="w-full rounded-xl border border-[#DCEAE2] bg-[#F7FCF9] p-3 text-xs text-[#063F30] outline-none focus:border-[#063F30]"
                  style={QURAN}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#063F30]">العدد المستهدف للتسبيح:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newCardTarget}
                    onChange={(e) => setNewCardTarget(e.target.value)}
                    className="w-full rounded-xl border border-[#DCEAE2] bg-[#F7FCF9] p-3 text-xs text-[#063F30] outline-none focus:border-[#063F30]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-[#063F30]">وسم العداد (التصنيف):</label>
                  <input
                    type="text"
                    value={newCardLabel}
                    onChange={(e) => setNewCardLabel(e.target.value)}
                    placeholder="مثلاً: ورد المساء"
                    className="w-full rounded-xl border border-[#DCEAE2] bg-[#F7FCF9] p-3 text-xs text-[#063F30] outline-none focus:border-[#063F30]"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#E3EEE8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-[#E3EEE8] px-5 py-2.5 text-xs font-bold text-[#063F30] hover:bg-[#d4e6dc]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#063F30] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#084e3c]"
                >
                  حفظ وإضافة العداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}