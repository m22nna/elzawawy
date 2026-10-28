import { useCallback, useEffect, useRef, useState } from "react";

const RATES = [1, 1.25, 1.5, 0.75];

export function useWirdAudio(tracks, resetKey) {
  const audioRef = useRef(null);
  const wantPlay = useRef(false);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState(false);

  const track = tracks[index] ?? null;
  const url = track?.url;

  // قسم جديد = إيقاف وبداية من الأول
  useEffect(() => {
    audioRef.current?.pause();
    wantPlay.current = false;
    setIndex(0);
    setIsPlaying(false);
    setCurrent(0);
    setDuration(0);
    setError(false);
  }, [resetKey]);

  const tryPlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || !a.src) return;
    wantPlay.current = true;
    setError(false);
    a.play().catch(() => {
      wantPlay.current = false;
      setIsPlaying(false);
      setError(true);
    });
  }, []);

  // تغيّر المقطع (بداية، تالي، سابق): كمّل تشغيل لو كان شغال
  useEffect(() => {
    setCurrent(0);
    setDuration(0);
    if (wantPlay.current) tryPlay();
  }, [url, tryPlay]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const pause = useCallback(() => {
    wantPlay.current = false;
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (!track) return;
    if (isPlaying) pause();
    else tryPlay();
  }, [track, isPlaying, pause, tryPlay]);

  const seek = useCallback((fraction) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration)) return;
    a.currentTime = Math.min(1, Math.max(0, fraction)) * a.duration;
    setCurrent(a.currentTime);
  }, []);

  const skip = useCallback((seconds) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration)) return;
    a.currentTime = Math.min(a.duration, Math.max(0, a.currentTime + seconds));
    setCurrent(a.currentTime);
  }, []);

  const selectTrack = useCallback(
    (i) => {
      if (i < 0 || i >= tracks.length) return;
      wantPlay.current = true;
      if (i === index) {
        const a = audioRef.current;
        if (a) a.currentTime = 0;
        tryPlay();
      } else {
        setIndex(i);
      }
    },
    [index, tracks.length, tryPlay],
  );

  const next = useCallback(() => {
    if (index + 1 < tracks.length) selectTrack(index + 1);
  }, [index, tracks.length, selectTrack]);

  const prev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    if (index > 0) selectTrack(index - 1);
  }, [index, selectTrack]);

  const cycleRate = useCallback(() => {
    setRate((r) => RATES[(RATES.indexOf(r) + 1) % RATES.length]);
  }, []);

  const setVolume = useCallback((v) => setVolumeState(Math.min(1, Math.max(0, v))), []);

  // خصائص عنصر <audio>
  const audioProps = {
    ref: audioRef,
    src: url || undefined,
    preload: "metadata",
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onTimeUpdate: (e) => setCurrent(e.currentTarget.currentTime),
    onLoadedMetadata: (e) => {
      const a = e.currentTarget;
      if (Number.isFinite(a.duration)) setDuration(a.duration);
      a.playbackRate = rate;
      a.volume = volume;
    },
    onEnded: () => {
      if (index + 1 < tracks.length) {
        setIndex(index + 1); // wantPlay لسه true فهيكمّل لوحده
      } else {
        wantPlay.current = false;
        setIsPlaying(false);
        setCurrent(0);
        setIndex(0);
      }
    },
    onError: () => {
      if (!url) return;
      wantPlay.current = false;
      setIsPlaying(false);
      setError(true);
    },
  };

  return {
    audioProps,
    track,
    index,
    count: tracks.length,
    isPlaying,
    current,
    duration,
    volume,
    rate,
    error,
    toggle,
    pause,
    next,
    prev,
    skip,
    seek,
    selectTrack,
    setVolume,
    cycleRate,
  };
}