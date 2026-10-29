import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookMarked,
  BookOpen,
  CirclePause,
  CirclePlay,
  Library,
  Scale,
  ScrollText,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { arNum } from '../../features/Quran/utils';
import { bucketOf, groupBySource, matchesQuery } from './hadithData';
import { TAG_STYLES, countLabel, describeSource, tileStyle } from './hadithUi';

const FIRST_PAGE = 3; // زي التصميم: صف واحد ثم "عرض المزيد"
const SEARCH_PAGE = 6;
const STEP = 6;

const KNOWN_ICONS = { 'صحيح البخاري': BookOpen, 'صحيح مسلم': BookMarked, 'متفق عليه': ShieldCheck };
const FALLBACK_ICONS = [Library, Star, Scale, ScrollText];
const iconFor = (name, i) => KNOWN_ICONS[name] ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length];

const HadithTopics = ({
  hadiths,
  loading,
  error,
  onRetry,
  filter,
  onFilter,
  query,
  savedIds,
  onToggleSaved,
  onOpen,
  onPlay,
  speech,
}) => {
  const [more, setMore] = useState(0);

  const groups = useMemo(() => groupBySource(hadiths ?? []), [hadiths]);
  const searching = query.trim().length > 0;

  const list = useMemo(() => {
    if (!hadiths) return [];
    return hadiths.filter(
      (h) =>
        matchesQuery(h, query) &&
        (filter === 'all' || (filter === 'saved' ? savedIds.includes(h.sortOrder) : bucketOf(h.source) === filter))
    );
  }, [hadiths, query, filter, savedIds]);

  useEffect(() => setMore(0), [filter, query]);

  const visible = (filter !== 'all' || searching ? SEARCH_PAGE : FIRST_PAGE) + more;
  const scrollToList = () =>
    document.getElementById('hadith-list')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

  const tabs = [
    { id: 'all', label: 'الكل' },
    ...groups.slice(0, 3).map((g) => ({ id: g.name, label: g.name })),
    { id: 'saved', label: `المحفوظات (${arNum(savedIds.length)})` },
  ];

  const groupIndex = (name) => Math.max(0, groups.findIndex((g) => g.name === name));

  return (
    <div className="bg-[#FAF9F6] text-[#2C3E35] px-4 pt-10 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12" style={{ fontFamily: "'Tajawal', sans-serif" }}>

        {/* ===== اكتشف الأحاديث حسب المصدر ===== */}
        {!searching && (loading || groups.length > 0) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#1E3E30] rounded-full inline-block"></span>
                <h2 className="text-2xl font-bold text-[#1E3E30]">اكتشف الأحاديث حسب المصدر</h2>
              </div>

              <button
                onClick={() => {
                  onFilter('all');
                  scrollToList();
                }}
                className="flex items-center gap-1.5 text-xs text-[#1E3E30] hover:text-[#0D7D4D] transition-colors font-bold cursor-pointer"
              >
                <span>عرض جميع الأحاديث</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" dir="rtl">
              {loading
                ? Array.from({ length: 3 }, (_, i) => <div key={i} className="h-44 rounded-2xl bg-[#EBE6DD]/60 animate-pulse" />)
                : groups.slice(0, 6).map((g, i) => {
                    const style = tileStyle(i);
                    const Icon = iconFor(g.name, i);
                    const active = filter === g.name;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => {
                          onFilter(g.name);
                          scrollToList();
                        }}
                        className={`bg-white border rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col text-right gap-3 group cursor-pointer ${
                          active ? 'border-[#1E3E30] ring-1 ring-[#1E3E30]/20' : 'border-[#EBE6DD]'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                          <Icon className={`w-5 h-5 ${style.icon}`} />
                        </div>
                        <h3 className="text-lg font-extrabold text-[#1E3E30]">{g.name}</h3>
                        <p className="text-xs text-[#8A8378] leading-6 line-clamp-2 min-h-[3rem]">{describeSource(g.name)}</p>

                        <div className="mt-1 pt-4 border-t border-[#F3EFE8] flex items-center justify-between text-[11px] text-[#8A8378] w-full">
                          <span>{countLabel(g.count)}</span>
                          <ArrowLeft className="w-4 h-4 text-[#A59F94] group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
            </div>
          </section>
        )}

        {/* ===== أحاديث مختارة ===== */}
        <section id="hadith-list" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" dir="rtl">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-6 bg-[#1E3E30] rounded-full inline-block"></span>
              <h2 className="text-2xl font-bold text-[#1E3E30]">
                {searching ? `نتائج البحث (${arNum(list.length)})` : filter === 'saved' ? 'أحاديثي المحفوظة' : 'أحاديث مختارة'}
              </h2>
              {!searching && filter !== 'saved' && hadiths && (
                <span className="bg-[#E4F0EA] text-[#1E3E30] text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {countLabel(list.length)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filter === tab.id
                      ? 'bg-[#1E3E30] text-white shadow-sm'
                      : 'bg-white text-[#2C3E35] border border-[#EAE5DD] hover:bg-[#F5F2EC]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {error && !hadiths ? (
            <div className="rounded-2xl bg-white p-10 text-center" dir="rtl">
              <p className="text-sm text-red-600">تعذّر تحميل الأحاديث.</p>
              <button onClick={onRetry} className="mt-4 rounded-full bg-[#1E3E30] px-5 py-2 text-xs font-bold text-white cursor-pointer">
                إعادة المحاولة
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-64 rounded-2xl bg-[#EBE6DD]/60 animate-pulse" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#7A7368]" dir="rtl">
              {filter === 'saved' && !searching ? 'لم تحفظ أي حديث بعد. اضغط على علامة الحفظ في أي حديث.' : 'لا توجد أحاديث مطابقة.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" dir="rtl">
              {list.slice(0, visible).map((h) => {
                const saved = savedIds.includes(h.sortOrder);
                const reading = speech.playing && speech.current === h.textArabic;
                const bucket = bucketOf(h.source);
                return (
                  <article
                    key={h.sortOrder}
                    className="bg-white border border-[#EBE6DD] rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-md ${TAG_STYLES[groupIndex(bucket) % 2]}`}>{bucket}</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#BFE6D3] bg-[#F1FBF6] text-[#0D7D4D]">
                        حديث {arNum(h.sortOrder)}
                      </span>
                    </div>

                    <p
                      className="text-lg md:text-xl text-[#1E3E30] font-bold text-right leading-[1.9] line-clamp-3 min-h-[5.5rem]"
                      style={{ fontFamily: "'Amiri', serif" }}
                    >
                      «{h.textArabic}»
                    </p>

                    <div className="border-t border-[#F3EFE8] pt-3 text-[11px] text-[#7A7368] leading-6">
                      <span className="font-bold text-[#1E3E30]">المصدر: </span>
                      {h.source}
                    </div>

                    <div className="flex items-center justify-between border-t border-[#F3EFE8] pt-4 mt-auto">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpen(h)}
                          className="bg-white hover:bg-[#F5F2EC] border border-[#E5E0D8] text-[#1E3E30] text-[11px] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          قراءة التفاصيل
                        </button>
                        <button
                          onClick={() => onPlay(h)}
                          disabled={!speech.available}
                          title={speech.available ? (reading ? 'إيقاف الاستماع' : 'استمع إلى الحديث') : 'متصفحك لا يحتوي على صوت عربي'}
                          aria-label={reading ? 'إيقاف الاستماع' : 'استمع إلى الحديث'}
                          className="w-8 h-8 rounded-lg bg-[#E2ECE7] hover:bg-[#D5E3DC] text-[#1E3E30] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {reading ? <CirclePause className="w-4 h-4" /> : <CirclePlay className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        onClick={() => onToggleSaved(h.sortOrder)}
                        aria-pressed={saved}
                        className={`p-2 rounded-lg hover:bg-[#F5F2EC] transition-colors cursor-pointer ${saved ? 'text-[#C29B38]' : 'text-[#A59F94] hover:text-[#1E3E30]'}`}
                        title={saved ? 'إزالة من المحفوظات' : 'حفظ'}
                      >
                        <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {visible < list.length && (
            <div className="text-center">
              <button
                onClick={() => setMore((m) => m + STEP)}
                className="rounded-full border border-[#EAE5DD] bg-white px-6 py-2.5 text-xs font-bold text-[#1E3E30] hover:bg-[#F5F2EC] cursor-pointer"
              >
                عرض المزيد ({arNum(list.length - visible)})
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HadithTopics;