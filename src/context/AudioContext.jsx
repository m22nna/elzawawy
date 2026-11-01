// src/context/AudioContext.jsx — المحرّك الصوتي الوحيد للموقع كله
// عنصر <audio> واحد + قراءة آلية (speechSynthesis) + قايمة تشغيل (queue)، والشريط الوحيد هو components/AudioPlayer.jsx.
// الصفحات كلها بتشغّل من هنا بـ playTrack(...) والصوت بيكمّل لما المستخدم يتنقل بين الصفحات.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

const RATES = [0.75, 1, 1.25, 1.5, 2];
const SPEECH_CPS = 13; 
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;


const normalizeTrack = (t) => {
  const kind = t.kind ?? (t.text && !t.audioUrl ? 'speech' : 'audio');
  return {
    ...t,
    kind,
    id: t.id ?? t.audioUrl ?? t.text,
    title: t.title || (kind === 'speech' ? 'قراءة الحديث' : 'تلاوة مباركة'),
    reciter: t.reciter ?? t.subtitle ?? (kind === 'speech' ? '' : 'فضيلة الشيخ عبدالرحمن الزواوي'),
    duration: t.duration || t.durationSeconds || 0,
  };
};

const isPlayable = (t) => (t.kind === 'speech' ? !!t.text : !!t.audioUrl);

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const currentRef = useRef(null);
  const queueRef = useRef([]);
  const playingRef = useRef(false);
  const onEndedRef = useRef(() => {});
  const speechRef = useRef({ token: 0, startedAt: 0, boundary: 0, est: 0, timer: null });
  const optsRef = useRef({ volume: 0.85, muted: false, rate: 1, repeat: false, shuffle: false });

  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueueState] = useState([]);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [failed, setFailed] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);

  const setPlaying = useCallback((v) => {
    playingRef.current = v;
    setIsPlayingState(v);
  }, []);

  const setCurrent = useCallback((track) => {
    currentRef.current = track;
    setCurrentTrack(track);
  }, []);

  const setQueue = useCallback((q) => {
    queueRef.current = q;
    setQueueState(q);
  }, []);

  /* ---------- القراءة الآلية ---------- */
  const stopSpeechEngine = useCallback(() => {
    const sp = speechRef.current;
    sp.token += 1; // أي أحداث قديمة بتتجاهل
    clearInterval(sp.timer);
    sp.timer = null;
    if (speechSupported()) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (track) => {
      if (!speechSupported() || !track?.text) return;
      const sp = speechRef.current;
      const o = optsRef.current;
      stopSpeechEngine();
      const mine = sp.token;

      const est = Math.max(2, track.text.length / (SPEECH_CPS * o.rate));
      const u = new SpeechSynthesisUtterance(track.text);
      u.lang = 'ar-SA';
      u.rate = clamp(o.rate * 0.9, 0.5, 2);
      u.volume = o.muted ? 0 : o.volume;
      u.onboundary = (e) => {
        if (mine === sp.token && typeof e.charIndex === 'number') sp.boundary = Math.min(1, e.charIndex / track.text.length);
      };
      u.onend = () => {
        if (mine === sp.token) onEndedRef.current();
      };
      u.onerror = (e) => {
        if (mine !== sp.token || e.error === 'interrupted' || e.error === 'canceled') return;
        clearInterval(sp.timer);
        setPlaying(false);
        setFailed(true);
      };

      sp.startedAt = Date.now();
      sp.boundary = 0;
      sp.est = est;
      setDuration(est);
      setCurrentTime(0);
      setFailed(false);
      setPlaying(true);
      sp.timer = setInterval(() => {
        const frac = Math.min(0.98, Math.max(sp.boundary, (Date.now() - sp.startedAt) / 1000 / est));
        setCurrentTime(frac * est);
      }, 250);
      window.speechSynthesis.speak(u);
    },
    [setPlaying, stopSpeechEngine]
  );

  /* ---------- تشغيل مقطع ---------- */
  const startTrack = useCallback(
    (track) => {
      const audio = audioRef.current;
      setFailed(false);
      stopSpeechEngine();
      setCurrent(track);
      setCurrentTime(0);
      setDuration(track.duration || 0);

      if (track.kind === 'speech') {
        audio?.pause();
        speak(track);
        return;
      }
      if (!audio) return;
      audio.src = track.audioUrl;
      audio.currentTime = 0;
      audio.playbackRate = optsRef.current.rate;
      audio.play().catch((e) => console.warn('Audio play error:', e));
    },
    [setCurrent, speak, stopSpeechEngine]
  );

  const togglePlayPause = useCallback(() => {
    const cur = currentRef.current;
    if (!cur) return;
    if (cur.kind === 'speech') {
      if (playingRef.current) {
        stopSpeechEngine();
        setPlaying(false);
      } else {
        speak(cur);
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch((e) => console.warn('Play error:', e));
    else audio.pause();
  }, [setPlaying, speak, stopSpeechEngine]);

  const pauseTrack = useCallback(() => {
    const cur = currentRef.current;
    if (cur?.kind === 'speech') {
      stopSpeechEngine();
      setPlaying(false);
    } else {
      audioRef.current?.pause();
    }
  }, [setPlaying, stopSpeechEngine]);

  

  const playTrack = useCallback(
    (trackData, opts = {}) => {
      if (!trackData) return;
      const track = normalizeTrack(trackData);
      if (!isPlayable(track)) return;

      const cur = currentRef.current;
      const same = !!cur && (cur.id === track.id || (!!cur.audioUrl && cur.audioUrl === track.audioUrl));

      if (opts.queue) {
        setQueue(opts.queue.map(normalizeTrack));
      } else if (!same && !queueRef.current.some((q) => q.id === track.id)) {
        setQueue([track]);
      }

      if (same && !opts.restart) {
        if (track.title && cur.title !== track.title) setCurrent({ ...cur, title: track.title });
        togglePlayPause();
        return;
      }
      startTrack(track);
    },
    [setCurrent, setQueue, startTrack, togglePlayPause]
  );

  /* ---------- السابق / التالي ---------- */
  const next = useCallback(() => {
    const q = queueRef.current;
    const cur = currentRef.current;
    if (!cur || q.length < 2) return false;
    const i = q.findIndex((t) => t.id === cur.id);
    let j = i + 1;
    if (optsRef.current.shuffle) {
      do j = Math.floor(Math.random() * q.length);
      while (j === i);
    }
    if (j < 0 || j >= q.length) return false;
    startTrack(q[j]);
    return true;
  }, [startTrack]);

  const prev = useCallback(() => {
    const q = queueRef.current;
    const cur = currentRef.current;
    if (!cur) return false;
    const audio = audioRef.current;
    if (cur.kind !== 'speech' && audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return true;
    }
    const i = q.findIndex((t) => t.id === cur.id);
    if (i <= 0) return false;
    startTrack(q[i - 1]);
    return true;
  }, [startTrack]);

  // لما المقطع يخلص: تكرار، أو التالي في القايمة، أو وقوف
  onEndedRef.current = () => {
    const cur = currentRef.current;
    if (!cur) return;
    if (optsRef.current.repeat) {
      startTrack(cur);
      return;
    }
    if (next()) return;
    clearInterval(speechRef.current.timer);
    setPlaying(false);
    setCurrentTime(0);
  };

  /* ---------- عنصر الصوت الوحيد ---------- */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = optsRef.current.volume;
    audioRef.current = audio;
    const isSpeech = () => currentRef.current?.kind === 'speech';

    const onTime = () => {
      if (isSpeech()) return;
      setCurrentTime(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onMeta = () => {
      if (isSpeech()) return;
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onPlay = () => {
      if (isSpeech()) return;
      setPlaying(true);
      setFailed(false);
    };
    const onPause = () => {
      if (isSpeech()) return;
      setPlaying(false);
    };
    const onEnded = () => {
      if (isSpeech()) return;
      onEndedRef.current();
    };
    const onError = () => {
      if (isSpeech() || !audio.getAttribute('src')) return;
      setPlaying(false);
      setFailed(true);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      stopSpeechEngine();
    };
  }, [setPlaying, stopSpeechEngine]);

  // هل في صوت عربي للقراءة الآلية؟
  useEffect(() => {
    if (!speechSupported()) return undefined;
    const synth = window.speechSynthesis;
    const check = () => setSpeechAvailable(synth.getVoices().some((v) => /^ar/i.test(v.lang)));
    check();
    synth.addEventListener?.('voiceschanged', check);
    return () => synth.removeEventListener?.('voiceschanged', check);
  }, []);

  useEffect(() => {
    optsRef.current.volume = volume;
    optsRef.current.muted = isMuted;
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    optsRef.current.rate = playbackRate;
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    optsRef.current.repeat = isRepeat;
    if (audioRef.current) audioRef.current.loop = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    optsRef.current.shuffle = isShuffle;
  }, [isShuffle]);

  /* ---------- باقي التحكّم ---------- */
  const seekTo = useCallback((timeInSeconds) => {
    const audio = audioRef.current;
    if (!audio || currentRef.current?.kind === 'speech') return;
    const max = Number.isFinite(audio.duration) ? audio.duration : 0;
    const t = clamp(timeInSeconds, 0, max);
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  const seekFraction = useCallback(
    (fraction) => {
      const audio = audioRef.current;
      if (audio && Number.isFinite(audio.duration)) seekTo(clamp(fraction, 0, 1) * audio.duration);
    },
    [seekTo]
  );

  const skipForward = useCallback((secs = 10) => audioRef.current && seekTo(audioRef.current.currentTime + secs), [seekTo]);
  const skipBackward = useCallback((secs = 10) => audioRef.current && seekTo(audioRef.current.currentTime - secs), [seekTo]);

  const setVolume = useCallback((val) => {
    setVolumeState(clamp(val, 0, 1));
    setIsMuted(false);
  }, []);
  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);
  const setPlaybackRate = useCallback((rate) => setPlaybackRateState(rate), []);
  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRateState((r) => RATES[(RATES.indexOf(r) + 1) % RATES.length]);
  }, []);
  const toggleRepeat = useCallback(() => setIsRepeat((v) => !v), []);
  const toggleShuffle = useCallback(() => setIsShuffle((v) => !v), []);

  const closePlayer = useCallback(() => {
    audioRef.current?.pause();
    stopSpeechEngine();
    setCurrent(null);
    setQueue([]);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setFailed(false);
  }, [setCurrent, setPlaying, setQueue, stopSpeechEngine]);

  // اسم قديم بتستخدمه صفحات تانية
  const toggle = useCallback((item) => playTrack(item), [playTrack]);

  const queueIndex = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
  const hasNext = isShuffle ? queue.length > 1 : queueIndex >= 0 && queueIndex < queue.length - 1;
  const hasPrev = queueIndex > 0 || (currentTrack?.kind !== 'speech' && currentTime > 3);
  const progress = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0;

  const value = useMemo(
    () => ({
      currentTrack,
      current: currentTrack,
      isPlaying,
      playing: isPlaying,
      currentTime,
      duration,
      progress,
      volume: isMuted ? 0 : volume,
      isMuted,
      playbackRate,
      isRepeat,
      isShuffle,
      failed,
      speechAvailable,
      queue,
      queueIndex,
      hasNext,
      hasPrev,
      playTrack,
      pauseTrack,
      togglePlayPause,
      next,
      prev,
      seekTo,
      seekFraction,
      setVolume,
      toggleMute,
      setPlaybackRate,
      cyclePlaybackRate,
      skipForward,
      skipBackward,
      toggleRepeat,
      toggleShuffle,
      closePlayer,
      toggle,
    }),
    [
      currentTrack, isPlaying, currentTime, duration, progress, volume, isMuted, playbackRate, isRepeat, isShuffle,
      failed, speechAvailable, queue, queueIndex, hasNext, hasPrev, playTrack, pauseTrack, togglePlayPause, next, prev,
      seekTo, seekFraction, setVolume, toggleMute, setPlaybackRate, cyclePlaybackRate, skipForward, skipBackward,
      toggleRepeat, toggleShuffle, closePlayer, toggle,
    ]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
