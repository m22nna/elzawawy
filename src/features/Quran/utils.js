export const arNum = (n) => Number(n).toLocaleString("ar-EG", { useGrouping: false });

// تشكيل وعلامات قرآنية + توحيد الألف والياء والتاء المربوطة (للبحث وللمقارنة بس)
const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
export const plain = (s = "") =>
  String(s).replace(MARKS, "").replace(/[ٱأإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim();

export const isMakki = (surah) => /mak|mecc|مك/i.test(String(surah?.revelationPlace ?? ""));
export const placeLabel = (surah) => (isMakki(surah) ? "مكية" : "مدنية");
export const surahTitle = (surah) => `سورة ${String(surah?.nameArabic ?? "").replace(/^سورة\s*/, "")}`;

export const BASMALA = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
export const startsWithBasmala = (text) => plain(text).startsWith("بسم الله الرحمن الرحيم");

export const clampSurah = (n) => Math.min(114, Math.max(1, Number(n) || 1));

export const mmss = (s) =>
  `${String(Math.floor((s || 0) / 60)).padStart(2, "0")}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;