const MARKS = "[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*"; // تشكيل وتطويل (اختياري بين الحروف)
const MARKS_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

const VARIANTS = [
  "اأإآٱ", // الألف بكل أشكالها
  "يى", // الياء والألف المقصورة
  "هة", // الهاء والتاء المربوطة
];
const classOf = (ch) => {
  const group = VARIANTS.find((g) => g.includes(ch));
  return group ? `[${group}]` : ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const toLatinDigits = (s = "") => String(s).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

export function buildMatcher(query) {
  const tokens = String(query ?? "").replace(MARKS_RE, "").trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const regs = tokens.map((t) => new RegExp([...t].map(classOf).join(MARKS), "u"));
  return {
    tokens,
    test: (text) => regs.every((r) => r.test(String(text ?? ""))),
    first: (text) => regs[0].exec(String(text ?? "")),
    split: (text) => String(text ?? "").split(new RegExp(`(${regs.map((r) => r.source).join("|")})`, "u")),
  };
}

export function snippet(text, matcher, length = 110) {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= length) return s;
  const m = matcher?.first(s);
  const start = m ? Math.max(0, m.index - 30) : 0;
  const end = Math.min(s.length, start + length);
  return `${start > 0 ? "… " : ""}${s.slice(start, end).trim()}${end < s.length ? " …" : ""}`;
}
