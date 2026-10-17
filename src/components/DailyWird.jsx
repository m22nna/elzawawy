// import { ArrowLeft, BadgeCheck, Flame, RotateCcw, Trophy } from "lucide-react";
// import { WIRD_ROWS } from "../config/home";
// import { useWird } from "../features/Home/hooks/useWird";

// const R = 54;
// const C = 2 * Math.PI * R;

// export default function DailyWird() {
//   const { dhikr, rows, tiles, streak, loading, error } = useWird();
//   const pct = dhikr.repeat ? dhikr.count / dhikr.repeat : 0;
//   const hour = new Date().getHours();

//   return (
//     <section dir="rtl" lang="ar" className="bg-wird-mist px-4 pb-14 pt-6 font-body md:px-10">
//       <div className="mx-auto max-w-6xl rounded-[2rem] bg-wird-card p-6 shadow-soft md:p-10">
//         <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
//           <div>
//             <h2 className="font-display text-2xl font-extrabold text-wird-green md:text-3xl">
//               ورد اليوم والمسبحة التفاعلية
//             </h2>
//             <p className="mt-1 text-xs text-muted">
//               عطر أوقاتك بذكر الله وحافظ على دوام صلتك بالقرآن الكريم
//             </p>
//           </div>
//           <span className="flex items-center gap-1.5 rounded-full bg-wird-gold-soft px-3 py-1.5 text-[11px] font-bold text-wird-gold-dark">
//             <BadgeCheck size={14} />
//             بإشراف الشيخ عبدالرحمن الزاواوي
//           </span>
//         </header>

//         <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
//           {/* المسبحة */}
//           <div className="flex flex-col items-center rounded-3xl bg-wird-mist p-6 text-center">
//             <span className="rounded-full bg-wird-gold-soft px-3 py-0.5 text-[11px] font-bold text-wird-gold-dark">
//               الذكر الحالي
//             </span>

//             {error ? (
//               <p className="my-10 text-sm text-wird-green">تعذّر تحميل الأذكار.</p>
//             ) : (
//               <>
//                 <p className="mt-4 line-clamp-2 min-h-[3rem] font-quran text-xl font-bold leading-loose text-wird-green">
//                   {loading ? "…" : `«${dhikr.text}»`}
//                 </p>

//                 <button
//                   onClick={dhikr.tap}
//                   disabled={loading}
//                   aria-label="عدّ"
//                   className="relative my-5 h-40 w-40 rounded-full bg-white transition active:scale-95"
//                 >
//                   <svg viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
//                     <circle cx="64" cy="64" r={R} fill="none" strokeWidth="5" stroke="currentColor" className="text-wird-gold-soft" />
//                     <circle
//                       cx="64" cy="64" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
//                       stroke="currentColor" className="text-wird-gold transition-all duration-200"
//                       strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
//                     />
//                   </svg>
//                   <span className="relative flex h-full flex-col items-center justify-center">
//                     <span className="text-4xl font-extrabold text-wird-green">{dhikr.count}</span>
//                     <span className="text-[11px] text-muted">من أصل {dhikr.repeat}</span>
//                     <span className="mt-1 text-[10px] font-bold text-wird-gold">للحفظ</span>
//                   </span>
//                 </button>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={dhikr.next}
//                     className="flex items-center gap-1.5 rounded-full bg-wird-green px-4 py-2 text-xs font-bold text-white"
//                   >
//                     <ArrowLeft size={13} />
//                     الذكر التالي
//                   </button>
//                   <button
//                     onClick={dhikr.reset}
//                     className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-muted"
//                   >
//                     <RotateCcw size={13} />
//                     إعادة التصفير
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* التقدم */}
//           <div className="space-y-5">
//             <div className="flex items-center gap-4 rounded-2xl bg-wird-mist p-4">
//               <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-wird-gold-soft text-wird-gold">
//                 <Flame size={24} />
//               </span>
//               <div className="flex-1">
//                 <p className="font-bold text-wird-green">{streak} أيام متتالية من الالتزام</p>
//                 <p className="text-[11px] text-muted">
//                   ما شاء الله، واصل يومياً وداوم على أذكارك بدون انقطاع لنيل البركة
//                 </p>
//               </div>
//               <Trophy size={18} className="text-wird-gold" />
//             </div>

//             <div className="space-y-4 px-1">
//               {WIRD_ROWS.map((row) => {
//                 const { done, total } = rows[row.slug] ?? { done: 0, total: 0 };
//                 const p = total ? (done / total) * 100 : 0;
//                 const locked = row.unlockHour && hour < row.unlockHour && done === 0;
//                 return (
//                   <div key={row.slug}>
//                     <div className="mb-1.5 flex justify-between text-[11px]">
//                       <span className="font-bold text-wird-green">{row.label}</span>
//                       <span className="text-wird-gold-dark">
//                         {locked ? row.note : `منجز ${total} / ${done}${p ? ` (${Math.round(p)}%)` : ""}`}
//                       </span>
//                     </div>
//                     <div className="h-1.5 overflow-hidden rounded-full bg-wird-green/10">
//                       <div className={`h-full rounded-full transition-all ${row.bar}`} style={{ width: `${p}%` }} />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//               {tiles.map((t) => (
//                 <div key={t.label} className="rounded-xl bg-wird-mist px-3 py-3 text-center">
//                   <p className="text-[10px] text-muted">{t.label}</p>
//                   <p className="text-lg font-extrabold text-wird-gold">{t.value}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import {
  ArrowLeft,
  BadgeCheck,
  Flame,
  RotateCcw,
  Trophy,
} from "lucide-react";

import { WIRD_ROWS } from "../config/home";
import { useWird } from "../features/Home/hooks/useWird";

const R = 54;
const C = 2 * Math.PI * R;

export default function DailyWird() {
  const { dhikr, rows, tiles, streak, loading, error } = useWird();

  const pct = dhikr.repeat
    ? Math.min(dhikr.count / dhikr.repeat, 1)
    : 0;

  const hour = new Date().getHours();

  return (
    <section
      dir="rtl"
      lang="ar"
      className="w-full bg-wird-mist px-4 py-6 font-body sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
    >
      <div className="mx-auto w-full max-w-none rounded-[2rem] bg-wird-card p-5 shadow-soft sm:p-7 lg:p-9 xl:p-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-10">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-wird-green sm:text-3xl lg:text-4xl">
              ورد اليوم والمسبحة التفاعلية
            </h2>

            <p className="mt-2 text-xs leading-6 text-muted sm:text-sm">
              عطر أوقاتك بذكر الله وحافظ على دوام صلتك بالقرآن الكريم
            </p>
          </div>

          <span className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-wird-gold-soft px-4 py-2 text-xs font-bold text-wird-gold-dark">
            <BadgeCheck size={16} />
            بإشراف الشيخ عبدالرحمن الزاواوي
          </span>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,2fr)] lg:gap-8 xl:grid-cols-[minmax(340px,0.8fr)_minmax(0,2.2fr)] xl:gap-10 2xl:gap-12">
          {/* Interactive Tasbeeh */}
          <div className="flex min-w-0 flex-col items-center justify-center rounded-3xl bg-wird-mist p-6 text-center sm:p-8 lg:p-8 xl:p-10">
            <span className="rounded-full bg-wird-gold-soft px-4 py-1.5 text-xs font-bold text-wird-gold-dark">
              الذكر الحالي
            </span>

            {error ? (
              <p className="my-10 text-sm text-wird-green">
                تعذّر تحميل الأذكار.
              </p>
            ) : (
              <>
                <p className="mt-5 min-h-12 max-w-full line-clamp-2 font-quran text-xl font-bold leading-loose text-wird-green sm:text-2xl">
                  {loading ? "…" : `«${dhikr.text}»`}
                </p>

                <button
                  type="button"
                  onClick={dhikr.tap}
                  disabled={loading}
                  aria-label="عدّ"
                  className="relative my-7 h-40 w-40 shrink-0 rounded-full bg-white transition-transform duration-200 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:h-44 sm:w-44 lg:h-44 lg:w-44 xl:h-48 xl:w-48"
                >
                  <svg
                    viewBox="0 0 128 128"
                    className="absolute inset-0 h-full w-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="64"
                      cy="64"
                      r={R}
                      fill="none"
                      strokeWidth="5"
                      stroke="currentColor"
                      className="text-wird-gold-soft"
                    />

                    <circle
                      cx="64"
                      cy="64"
                      r={R}
                      fill="none"
                      strokeWidth="5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      className="text-wird-gold transition-all duration-200"
                      strokeDasharray={C}
                      strokeDashoffset={C * (1 - pct)}
                    />
                  </svg>

                  <span className="relative flex h-full flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-wird-green sm:text-5xl">
                      {dhikr.count}
                    </span>

                    <span className="mt-1 text-xs text-muted">
                      من أصل {dhikr.repeat}
                    </span>

                    <span className="mt-1 text-[10px] font-bold text-wird-gold">
                      للحفظ
                    </span>
                  </span>
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={dhikr.next}
                    className="flex items-center gap-2 rounded-full bg-wird-green px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    <ArrowLeft size={14} />
                    الذكر التالي
                  </button>

                  <button
                    type="button"
                    onClick={dhikr.reset}
                    className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-muted transition hover:bg-white/70"
                  >
                    <RotateCcw size={14} />
                    إعادة التصفير
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Progress and Statistics */}
          <div className="flex min-w-0 flex-col gap-6">
            {/* Streak */}
            <div className="flex items-center gap-4 rounded-2xl bg-wird-mist p-4 sm:p-5 lg:p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-wird-gold-soft text-wird-gold sm:h-14 sm:w-14">
                <Flame size={26} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-bold leading-6 text-wird-green sm:text-lg">
                  {streak} أيام متتالية من الالتزام
                </p>

                <p className="mt-1 text-[11px] leading-6 text-muted sm:text-xs">
                  ما شاء الله، واصل يومياً وداوم على أذكارك بدون انقطاع لنيل البركة
                </p>
              </div>

              <Trophy
                size={22}
                className="shrink-0 text-wird-gold"
              />
            </div>

            {/* Daily Progress */}
            <div className="grid gap-5 px-1 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 xl:gap-x-10">
              {WIRD_ROWS.map((row) => {
                const { done, total } = rows[row.slug] || {
                  done: 0,
                  total: 0,
                };

                const p = total
                  ? Math.min((done / total) * 100, 100)
                  : 0;

                const locked =
                  Boolean(row.unlockHour) &&
                  hour < row.unlockHour &&
                  done === 0;

                return (
                  <div key={row.slug} className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold leading-6 text-wird-green">
                        {row.label}
                      </span>

                      <span className="text-wird-gold-dark">
                        {locked
                          ? row.note
                          : `منجز ${done} / ${total}${
                              p ? ` (${Math.round(p)}%)` : ""
                            }`}
                      </span>
                    </div>

                    <div
                      className="h-2 overflow-hidden rounded-full bg-wird-green/10"
                      role="progressbar"
                      aria-label={row.label}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(p)}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${row.bar}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Statistics Tiles */}
            <div className="mt-auto grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
              {tiles.map((t) => (
                <div
                  key={t.label}
                  className="flex min-w-0 flex-col justify-center rounded-2xl bg-wird-mist px-4 py-4 text-center transition hover:-translate-y-0.5 sm:py-5"
                >
                  <p className="text-[11px] leading-5 text-muted sm:text-xs">
                    {t.label}
                  </p>

                  <p className="mt-1 break-words text-xl font-extrabold text-wird-gold sm:text-2xl">
                    {t.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
