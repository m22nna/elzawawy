
export const fmtDuration = (sec) => {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export const fmtViews = (n) => Number(n || 0).toLocaleString("en-US");

export function timeAgo(iso, now = Date.now()) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const days = Math.floor((now - t) / 864e5);
  if (days < 1) return "اليوم";
  if (days === 1) return "أمس";
  if (days === 2) return "منذ يومين";
  if (days < 7) return `منذ ${days} أيام`;
  if (days < 14) return "منذ أسبوع";
  if (days < 21) return "منذ أسبوعين";
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  const months = Math.floor(days / 30);
  if (months === 1) return "منذ شهر";
  if (months === 2) return "منذ شهرين";
  if (months < 11) return `منذ ${months} أشهر`;
  const years = Math.max(1, Math.floor(days / 365));
  return years === 1 ? "منذ سنة" : years === 2 ? "منذ سنتين" : `منذ ${years} سنوات`;
}