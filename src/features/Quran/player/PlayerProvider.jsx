import { createContext, useCallback, useContext, useMemo } from "react";
import { useAudio } from "../../../context/AudioContext";
import { useSurahs } from "../hooks/useQuranData";
import { surahTitle } from "../utils";

const Ctx = createContext(null);
export const usePlayer = () => useContext(Ctx);

export function PlayerProvider({ tracks, reciter, children }) {
  const audio = useAudio();
  const { surahs } = useSurahs();
  const { playTrack, pauseTrack, seekFraction, skipForward, skipBackward, setPlaybackRate, setVolume } = audio;

  const queue = useMemo(() => {
    if (!tracks) return [];
    const byId = new Map((surahs ?? []).map((s) => [s.id, s]));
    return [...tracks.entries()]
      .filter(([, t]) => t?.audioUrl)
      .sort((a, b) => a[0] - b[0])
      .map(([id, t]) => ({
        id: `quran-${id}`,
        surahId: id,
        title: `${byId.has(id) ? surahTitle(byId.get(id)) : `سورة ${id}`} - تلاوة خاشعة`,
        reciter,
        audioUrl: t.audioUrl,
      }));
  }, [tracks, surahs, reciter]);

  const bySurah = useMemo(() => new Map(queue.map((t) => [t.surahId, t])), [queue]);

  const toggle = useCallback(
    (id) => {
      const track = bySurah.get(id);
      if (track) playTrack(track, { queue });
    },
    [bySurah, queue, playTrack]
  );

  const step = useCallback(
    (id, delta) => {
      const track = bySurah.get(Math.min(114, Math.max(1, (id ?? 1) + delta)));
      if (track) playTrack(track, { queue, restart: true });
    },
    [bySurah, queue, playTrack]
  );

  const skipBy = useCallback((seconds) => (seconds >= 0 ? skipForward(seconds) : skipBackward(-seconds)), [skipForward, skipBackward]);

  const surahId = audio.currentTrack?.surahId ?? null;

  const value = useMemo(
    () => ({
      surahId,
      playing: surahId != null && audio.isPlaying,
      pos: surahId != null ? audio.currentTime : 0,
      dur: surahId != null ? audio.duration : 0,
      failed: surahId != null && audio.failed,
      rate: audio.playbackRate,
      volume: audio.volume,
      reciter,
      toggle,
      pause: pauseTrack,
      step,
      seek: seekFraction,
      skipBy,
      setRate: setPlaybackRate,
      setVolume,
      hasTrack: (id) => bySurah.has(id),
    }),
    [
      surahId, audio.isPlaying, audio.currentTime, audio.duration, audio.failed, audio.playbackRate, audio.volume,
      reciter, toggle, pauseTrack, step, seekFraction, skipBy, setPlaybackRate, setVolume, bySurah,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
