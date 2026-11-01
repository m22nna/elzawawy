import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAudio } from "../../context/AudioContext";

export function useWirdAudio(tracks, resetKey) {
  const audio = useAudio();
  const { playTrack, togglePlayPause, pauseTrack, next: nextTrack, prev: prevTrack, seekFraction, skipForward, skipBackward } = audio;

  const queue = useMemo(
    () => tracks.map((t) => ({ id: `wird-${t.id}`, group: "wird", title: t.title, audioUrl: t.url })),
    [tracks]
  );

  const currentId = audio.currentTrack?.id;
  const found = currentId ? queue.findIndex((q) => q.id === currentId) : -1;
  const active = found >= 0;
  const index = active ? found : 0;

  const groupRef = useRef(null);
  groupRef.current = audio.currentTrack?.group;
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (groupRef.current === "wird") pauseTrack();
  }, [resetKey, pauseTrack]);

  const toggle = useCallback(() => {
    if (!queue.length) return;
    if (active) togglePlayPause();
    else playTrack(queue[0], { queue });
  }, [queue, active, togglePlayPause, playTrack]);

  const selectTrack = useCallback(
    (i) => {
      if (queue[i]) playTrack(queue[i], { queue, restart: true });
    },
    [queue, playTrack]
  );

  return {
    track: tracks[index] ?? null,
    index,
    count: tracks.length,
    isPlaying: active && audio.isPlaying,
    current: active ? audio.currentTime : 0,
    duration: active ? audio.duration : 0,
    volume: audio.volume,
    rate: audio.playbackRate,
    error: active && audio.failed,
    toggle,
    pause: useCallback(() => active && pauseTrack(), [active, pauseTrack]),
    next: useCallback(() => active && nextTrack(), [active, nextTrack]),
    prev: useCallback(() => active && prevTrack(), [active, prevTrack]),
    skip: useCallback((s) => active && (s >= 0 ? skipForward(s) : skipBackward(-s)), [active, skipForward, skipBackward]),
    seek: useCallback((f) => active && seekFraction(f), [active, seekFraction]),
    selectTrack,
    setVolume: audio.setVolume,
    cycleRate: audio.cyclePlaybackRate,
  };
}
