import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const Ctx = createContext(null);
export const useAudio = () => useContext(Ctx);

export function AudioProvider({ children }) {
  const ref = useRef(null);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    ref.current = a;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => { setPlaying(false); setFailed(true); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onError);
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onError);
    };
  }, []);

  const toggle = useCallback(
    (item) => {
      const a = ref.current;
      setFailed(false);
      if (current?.id === item.id) {
        a.paused ? a.play().catch(() => {}) : a.pause();
      } else {
        a.src = item.audioUrl;
        setCurrent(item);
        setProgress(0);
        a.play().catch(() => {});
      }
    },
    [current]
  );

  return <Ctx.Provider value={{ current, playing, progress, failed, toggle }}>{children}</Ctx.Provider>;
}