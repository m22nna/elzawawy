import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/NavBar";
import { runSearch, useSearchData } from "./useSearchData";
import Highlight from "./Highlight";

const PAGE_CAP = 20;

function Section({ title, count, children }) {
  if (!count) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-pine">
        <span className="h-6 w-1.5 rounded-full bg-[#C69234]" />
        {title}
        <span className="rounded-full bg-[#E6EFE9] px-2.5 py-0.5 text-[11px] font-bold text-pine">{count}</span>
      </h2>
      {children}
      {count > PAGE_CAP && <p className="mt-3 text-[11px] text-muted">عرضنا أول {PAGE_CAP} نتيجة. دقّق عبارة البحث للوصول لنتيجة أقرب.</p>}
    </section>
  );
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const { data, error, loading, ensure } = useSearchData();

  useEffect(() => {
    ensure();
  }, [ensure]);

  const r = useMemo(() => (data && q ? runSearch(data, q) : null), [data, q]);
  const total = r ? r.jumps.length + r.pages.length + r.surahs.length + r.hadiths.length + r.adhkar.length : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-body">
      <Navbar />
      <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
        <p className="flex items-center gap-1.5 text-[11px] text-muted">
          <Link to="/" className="font-bold text-pine hover:underline">الرئيسية</Link>
          <span>›</span>
          <span>نتائج البحث</span>
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-pine">
          {q ? <>نتائج البحث عن «{q}»</> : "البحث في الموقع"}
        </h1>

        {!q && <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-muted">اكتب في خانة البحث بالأعلى اسم سورة أو كلمة من حديث أو ذكر.</p>}

        {q && loading && (
          <div className="mt-8 space-y-3" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#E6EFE9]" />
            ))}
          </div>
        )}

        {q && error && !data && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center">
            <p className="text-sm text-red-600">تعذّر تحميل بيانات البحث، حاول مرة أخرى بعد قليل.</p>
            <button type="button" onClick={ensure} className="mt-4 rounded-lg bg-pine px-5 py-2 text-xs font-bold text-white">إعادة المحاولة</button>
          </div>
        )}

        {r && total === 0 && (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center">
            <p className="text-sm font-bold text-pine">لا توجد نتائج لـ «{q}»</p>
            <p className="mt-2 text-xs text-muted">جرّب كلمة أبسط، أو اسم السورة، أو كلمة من الحديث.</p>
          </div>
        )}

        {r && total > 0 && (
          <>
            <p className="mt-2 text-xs text-muted">{total} نتيجة</p>

            <Section title="اذهب إلى" count={r.jumps.length}>
              <div className="grid gap-3 sm:grid-cols-2">
                {r.jumps.map((x) => (
                  <Link key={x.key} to={x.to} className="rounded-2xl border border-[#E6EFE9] bg-white p-4 hover:shadow-md">
                    <p className="font-extrabold text-pine">{x.title}</p>
                    <p className="text-[11px] text-muted">{x.subtitle}</p>
                  </Link>
                ))}
              </div>
            </Section>

            <Section title="السور" count={r.surahs.length}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {r.surahs.slice(0, PAGE_CAP).map((x) => (
                  <Link key={x.key} to={x.to} className="flex items-center gap-3 rounded-2xl border border-[#E6EFE9] bg-white p-4 hover:shadow-md">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F7EDE0] text-xs font-extrabold text-bronze">{x.surah.id}</span>
                    <span>
                      <span className="block font-extrabold text-pine">{x.title}</span>
                      <span className="block text-[11px] text-muted">{x.subtitle}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Section>

            <Section title="الأحاديث" count={r.hadiths.length}>
              <div className="space-y-3">
                {r.hadiths.slice(0, PAGE_CAP).map((x) => (
                  <Link key={x.key} to={x.to} className="block rounded-2xl border border-[#E6EFE9] bg-white p-5 hover:shadow-md">
                    <p className="text-lg leading-loose text-pine" style={{ fontFamily: "'Amiri', serif" }}>
                      «<Highlight text={x.hadith.textArabic} matcher={r.matcher} length={220} />»
                    </p>
                    {x.field === "explanation" && (
                      <p className="mt-2 text-xs leading-6 text-muted">
                        <Highlight text={x.hadith.explanation} matcher={r.matcher} length={160} />
                      </p>
                    )}
                    <p className="mt-3 text-[11px] font-bold text-bronze">{x.hadith.source}</p>
                  </Link>
                ))}
              </div>
            </Section>

            <Section title="الأذكار والأدعية" count={r.adhkar.length}>
              <div className="space-y-3">
                {r.adhkar.slice(0, PAGE_CAP).map((x) => (
                  <Link key={x.key} to={x.to} className="block rounded-2xl border border-[#E6EFE9] bg-white p-5 hover:shadow-md">
                    <span className="rounded-full bg-[#E6EFE9] px-2.5 py-0.5 text-[10px] font-bold text-pine">{x.category}</span>
                    {x.isCategory ? (
                      <p className="mt-2 text-sm font-bold text-pine">{x.subtitle}</p>
                    ) : (
                      <p className="mt-2 text-lg leading-loose text-pine" style={{ fontFamily: "'Amiri', serif" }}>
                        <Highlight text={x.title} matcher={r.matcher} length={200} />
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </Section>

            <Section title="صفحات الموقع" count={r.pages.length}>
              <div className="grid gap-3 sm:grid-cols-2">
                {r.pages.map((x) => (
                  <Link key={x.key} to={x.to} className="rounded-2xl border border-[#E6EFE9] bg-white p-4 font-extrabold text-pine hover:shadow-md">
                    {x.title}
                  </Link>
                ))}
              </div>
            </Section>
          </>
        )}

        {q && (
          <p className="mt-12 border-t border-[#E6EFE9] pt-4 text-[11px] text-muted">
            البحث يشمل أسماء السور (وأرقامها)، والأحاديث وشرحها، والأذكار والأدعية، وصفحات الموقع. البحث داخل نص الآيات والتفسير غير متاح حالياً.
          </p>
        )}
      </main>
    </div>
  );
}
