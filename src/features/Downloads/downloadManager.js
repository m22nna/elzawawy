
const META_KEY = "zawawy:downloads:v2";
const DB_NAME = "zawawy-downloads";
const STORE = "files";

/* ---------- IndexedDB: الملفات نفسها ---------- */
let dbPromise;
const db = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};

const withStore = async (mode, fn) => {
  const database = await db();
  return new Promise((resolve, reject) => {
    const t = database.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
};

const putFile = (id, blob) => withStore("readwrite", (s) => s.put(blob, id));
const getFile = (id) => withStore("readonly", (s) => s.get(id));
const delFile = (id) => withStore("readwrite", (s) => s.delete(id));

/* ---------- الحالة ---------- */
const listeners = new Set();
const controllers = new Map(); // id -> AbortController (التحميل الشغّال)
const partials = new Map(); // id -> { chunks, received } (الجزء اللي اتحمّل لحد دلوقتي)
const urls = new Map(); // id -> blob: URL للتشغيل

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(META_KEY)) ?? [];
    // لو الصفحة اتقفلت أثناء التحميل الجزء المحمّل اتفقد، فنعتبره متوقف ويبدأ من الأول
    return saved.map((i) =>
      i.status === "downloading" ? { ...i, status: "paused", progress: 0, receivedBytes: 0 } : i
    );
  } catch {
    return [];
  }
};

let items = load();

const commit = (next) => {
  items = next;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(items));
  } catch {
  
  }
  listeners.forEach((l) => l());
};

const patch = (id, changes) => commit(items.map((i) => (i.id === id ? { ...i, ...changes } : i)));

/* ---------- التحميل الفعلي ---------- */
async function run(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;

  const part = partials.get(id) ?? { chunks: [], received: 0 };
  partials.set(id, part);

  const ctrl = new AbortController();
  controllers.set(id, ctrl);
  patch(id, { status: "downloading", error: null });

  try {
    const headers = part.received ? { Range: `bytes=${part.received}-` } : {};
    const res = await fetch(item.url, { signal: ctrl.signal, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // السيرفر مش بيدعم Range: نبدأ من الأول
    if (part.received && res.status !== 206) {
      part.chunks = [];
      part.received = 0;
    }

    const len = Number(res.headers.get("content-length")) || 0;
    const total = len ? len + part.received : item.sizeBytes || 0;
    const reader = res.body.getReader();

    let last = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      part.chunks.push(value);
      part.received += value.length;

      const now = Date.now();
      if (now - last > 250) {
        last = now;
        patch(id, {
          receivedBytes: part.received,
          sizeBytes: total,
          progress: total ? Math.min(99, Math.round((part.received / total) * 100)) : 0,
        });
      }
    }

    const blob = new Blob(part.chunks, { type: res.headers.get("content-type") || "audio/mpeg" });
    await putFile(id, blob);
    partials.delete(id);
    patch(id, { status: "completed", progress: 100, receivedBytes: blob.size, sizeBytes: blob.size });
  } catch (err) {
    if (err.name === "AbortError") return; // إيقاف مؤقت أو إلغاء: اتعالج في pause/remove
    patch(id, { status: "failed", error: err.message });
  } finally {
    if (controllers.get(id) === ctrl) controllers.delete(id);
  }
}

/* ---------- الواجهة العامة ---------- */
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const getItems = () => items;

// meta: { id, url, title, tag, category, type, durationSeconds }
function start(meta) {
  const existing = items.find((i) => i.id === meta.id);
  if (existing) {
    if (existing.status === "paused" || existing.status === "failed") resume(meta.id);
    return existing;
  }
  const item = {
    sizeBytes: 0,
    receivedBytes: 0,
    progress: 0,
    createdAt: Date.now(),
    ...meta,
    status: "downloading",
    error: null,
  };
  commit([item, ...items]);
  run(item.id);
  return item;
}

function pause(id) {
  patch(id, { status: "paused" });
  controllers.get(id)?.abort();
}

function resume(id) {
  if (!controllers.has(id)) run(id);
}

async function remove(id) {
  controllers.get(id)?.abort();
  partials.delete(id);
  if (urls.has(id)) {
    URL.revokeObjectURL(urls.get(id));
    urls.delete(id);
  }
  commit(items.filter((i) => i.id !== id));
  try {
    await delFile(id);
  } catch {

  }
}

async function getUrl(id) {
  if (urls.has(id)) return urls.get(id);
  const blob = await getFile(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urls.set(id, url);
  return url;
}

export const downloadManager = { subscribe, getItems, start, pause, resume, remove, getUrl };