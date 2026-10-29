import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const Ctx = createContext(null);
export const usePlayer = () => useContext(Ctx);

export function PlayerProvider({ tracks, reciter, children }) {
  const audio = useRef(null);
  const tracksRef = useRef(tracks);
  const idRef = useRef(null);
  const rateRef = useRef(1);
  tracksRef.current = tracks;

  const [state, setState] = useState({ surahId: null, playing: false, pos: 0, dur: 0, failed: false });
  const [rate, setRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);

  const load = useCallback((id) => {
    const a = audio.current;
    const url = tracksRef.current?.get(id)?.audioUrl;
    if (!a || !url) return false;
    idRef.current = id;
    a.src = url;
    a.playbackRate = rateRef.current;
    a.play().catch(() => {});
    setState({ surahId: id, playing: false, pos: 0, dur: 0, failed: false });
    return true;
  }, []);

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    audio.current = a;
    const on = {
      timeupdate: () => setState((s) => ({ ...s, pos: a.currentTime })),
      loadedmetadata: () => setState((s) => ({ ...s, dur: a.duration || 0 })),
      play: () => setState((s) => ({ ...s, playing: true })),
      pause: () => setState((s) => ({ ...s, playing: false })),
      error: () => setState((s) => ({ ...s, playing: false, failed: true })),
      ended: () => {
        const next = (idRef.current ?? 0) + 1; // بعد ما تخلص تكمّل بالسورة اللي بعدها
        if (next <= 114 && !load(next)) setState((s) => ({ ...s, playing: false }));
      },
    };
    Object.entries(on).forEach(([e, f]) => a.addEventListener(e, f));
    return () => {
      a.pause();
      Object.entries(on).forEach(([e, f]) => a.removeEventListener(e, f));
    };
  }, [load]);

  const toggle = useCallback(
    (id) => {
      const a = audio.current;
      if (!a) return;
      if (id === idRef.current) {
        if (a.paused) {
          setState((s) => ({ ...s, failed: false }));
          a.play().catch(() => {});
        } else a.pause();
      } else load(id);
    },
    [load]
  );

  const step = useCallback((id, delta) => load(Math.min(114, Math.max(1, (id ?? 1) + delta))), [load]);

  const seek = useCallback((fraction) => {
    const a = audio.current;
    if (a?.duration) a.currentTime = fraction * a.duration;
  }, []);

  const skipBy = useCallback((seconds) => {
    const a = audio.current;
    if (!a || !a.duration) return;
    a.currentTime = Math.min(a.duration, Math.max(0, a.currentTime + seconds));
  }, []);

  const setRate = useCallback((r) => {
    rateRef.current = r;
    setRateState(r);
    if (audio.current) audio.current.playbackRate = r;
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (audio.current) audio.current.volume = v;
  }, []);

const pause = useCallback(() => {
  audio.current?.pause();
}, []);

const value = useMemo(
  () => ({ ...state, rate, volume, reciter, toggle, pause, step, seek, setRate, setVolume, hasTrack: (id) => tracks?.has(id) }),
  [state, rate, volume, reciter, toggle, pause, step, seek, setRate, setVolume, tracks]
);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}