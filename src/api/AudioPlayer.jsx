
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const Ctx = createContext(null);

export function AudioPlayerProvider({ children }) {
  const audio = useRef(null);
  const trackRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    audio.current = a;
    const handlers = {
      timeupdate: () => setPos(a.currentTime),
      loadedmetadata: () => setDur(a.duration || 0),
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => setPlaying(false),
      error: () => setPlaying(false),
    };
    Object.entries(handlers).forEach(([e, f]) => a.addEventListener(e, f));
    return () => {
      a.pause();
      Object.entries(handlers).forEach(([e, f]) => a.removeEventListener(e, f));
    };
  }, []);


  const toggle = useCallback((t) => {
    const a = audio.current;
    if (!a || !t) return;
    if (trackRef.current?.id !== t.id) {
      trackRef.current = t;
      setTrack(t);
      setPos(0);
      setDur(t.duration ?? 0);
      a.src = t.audioUrl;
      a.play().catch(() => {});
    } else if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }, []);

  const value = useMemo(() => ({ track, playing, pos, dur, toggle }), [track, playing, pos, dur, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAudioPlayer = () => useContext(Ctx);