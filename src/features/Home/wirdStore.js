const KEY = "wird:v1";

export const dayStr = (d = new Date()) => d.toLocaleDateString("en-CA");
export const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayStr(d);
};

const fresh = () => ({ date: dayStr(), counts: {}, done: {}, streak: 0, lastActive: null });

export function loadProgress() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s) return fresh();
    return s.date === dayStr()
      ? s
      : { ...fresh(), streak: s.streak ?? 0, lastActive: s.lastActive ?? null };
  } catch {
    return fresh();
  }
}

export function saveProgress(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}


export function withActivity(p) {
  const today = dayStr();
  if (p.lastActive === today) return p;
  return { ...p, streak: p.lastActive === yesterday() ? p.streak + 1 : 1, lastActive: today };
}


export function markDone(slug, index) {
  const p = loadProgress();
  const list = Array.isArray(p.done[slug]) ? p.done[slug] : [];
  if (list.includes(index)) return;
  saveProgress(
    withActivity({ ...p, last: slug, done: { ...p.done, [slug]: [...list, index] } })
  );
  try {
    window.dispatchEvent(new Event("wird:update"));
  } catch {}
}

// بيشتغل لما التقدّم يتغيّر (نفس التاب أو تاب تاني)
export function subscribeProgress(cb) {
  const onStorage = (e) => {
    if (e.key === null || e.key === KEY) cb();
  };
  window.addEventListener("wird:update", cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("wird:update", cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const doneCount = (p, slug) =>
  Array.isArray(p.done?.[slug]) ? p.done[slug].length : 0;