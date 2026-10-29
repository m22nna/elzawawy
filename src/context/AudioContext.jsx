import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

/**
 * Global Audio Provider
 * Manages audio state globally across all pages and route changes without interrupting playback.
 */
export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [failed, setFailed] = useState(false);

  // Initialize single persistent Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setFailed(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleError = () => {
      setIsPlaying(false);
      setFailed(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update volume & mute states
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Update repeat mode
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isRepeat;
    }
  }, [isRepeat]);

  // Play a track
  const playTrack = useCallback((trackData) => {
    const audio = audioRef.current;
    if (!audio || !trackData || !trackData.audioUrl) return;

    setFailed(false);

    // If same track URL or same ID, toggle play/pause
    const isSameTrack = currentTrack && (
      currentTrack.audioUrl === trackData.audioUrl ||
      (trackData.id && currentTrack.id === trackData.id)
    );

    if (isSameTrack) {
      if (trackData.title && currentTrack.title !== trackData.title) {
        setCurrentTrack(prev => ({ ...prev, title: trackData.title }));
      }
      if (audio.paused) {
        audio.play().catch(e => console.warn('Play error:', e));
      } else {
        audio.pause();
      }
      return;
    }

    // New track selected
    const newTrack = {
      id: trackData.id || trackData.audioUrl,
      title: trackData.title || 'تلاوة مباركة',
      reciter: trackData.reciter || trackData.subtitle || 'فضيلة الشيخ عبدالرحمن الزواوي',
      audioUrl: trackData.audioUrl,
      duration: trackData.duration || trackData.durationSeconds || 0,
      image: trackData.image,
      tag: trackData.tag
    };

    setCurrentTrack(newTrack);
    audio.src = trackData.audioUrl;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(e => console.warn('Audio play error:', e));
  }, [currentTrack]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      audio.play().catch(e => console.warn('Play error:', e));
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const seekTo = useCallback((timeInSeconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    const maxDur = duration || audio.duration || 0;
    const clamped = Math.max(0, Math.min(timeInSeconds, maxDur));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const setVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(val, 1));
    setVolumeState(v);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setPlaybackRate = useCallback((rate) => {
    setPlaybackRateState(rate);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [1.0, 1.25, 1.5, 2.0, 0.75];
    setPlaybackRateState(prev => {
      const idx = rates.indexOf(prev);
      const nextIdx = (idx + 1) % rates.length;
      return rates[nextIdx];
    });
  }, []);

  const skipForward = useCallback((secs = 10) => {
    if (audioRef.current) {
      seekTo(audioRef.current.currentTime + secs);
    }
  }, [seekTo]);

  const skipBackward = useCallback((secs = 10) => {
    if (audioRef.current) {
      seekTo(audioRef.current.currentTime - secs);
    }
  }, [seekTo]);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Backward compatibility alias for existing components
  const toggle = useCallback((item) => {
    playTrack(item);
  }, [playTrack]);

  const progress = duration > 0 ? currentTime / duration : 0;

  const value = {
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
    playTrack,
    pauseTrack,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    cyclePlaybackRate,
    skipForward,
    skipBackward,
    toggleRepeat,
    toggleShuffle,
    closePlayer,
    toggle
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
