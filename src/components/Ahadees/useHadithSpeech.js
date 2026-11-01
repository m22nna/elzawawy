// src/components/Ahadees/useHadithSpeech.js — قراءة الأحاديث بصوت المتصفح عبر المشغّل العام
// مفيش محرّك هنا: ده طبقة رفيعة فوق context/AudioContext، والقراءة بتظهر في شريط الصوت الوحيد وبتكمّل لما المستخدم يتنقل.
import { useCallback } from "react";
import { useAudio } from "../../context/AudioContext";

export const SPEEDS = [0.75, 1, 1.25, 1.5];

const snippet = (text, max = 60) => {
  const s = String(text).replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
};

/** تحويل حديث (من الباك) لمقطع قراءة آلية */
export const hadithTrack = (h) => ({
  id: `hadith-${h.sortOrder}`,
  kind: "speech",
  text: h.textArabic,
  title: `حديث: ${snippet(h.textArabic)}`,
  reciter: h.source ? `${h.source} • قراءة آلية` : "قراءة آلية",
});

export function useHadithSpeech() {
  const a = useAudio();
  const { playTrack, pauseTrack, closePlayer } = a;
  const isSpeech = a.currentTrack?.kind === "speech";

  // play(hadith, list?) — لو اتبعتت list (أحاديث المكتبة) السابق/التالي في الشريط بيمشوا عليها
  const play = useCallback(
    (hadith, list) => {
      if (hadith) playTrack(hadithTrack(hadith), list ? { queue: list.map(hadithTrack) } : undefined);
    },
    [playTrack]
  );

  // توافق مع الاستدعاء القديم بالنص بس
  const toggle = useCallback(
    (text) => {
      if (text) playTrack({ id: `hadith-text-${snippet(text, 24)}`, kind: "speech", text, title: `حديث: ${snippet(text)}`, reciter: "قراءة آلية" });
    },
    [playTrack]
  );

  return {
    available: a.speechAvailable,
    playing: isSpeech && a.isPlaying,
    current: isSpeech ? a.currentTrack.text : null,
    progress: isSpeech && a.duration ? Math.min(1, a.currentTime / a.duration) : 0,
    elapsed: isSpeech ? a.currentTime : 0,
    estTotal: isSpeech ? a.duration : 0,
    rate: a.playbackRate,
    setRate: a.setPlaybackRate,
    play,
    toggle,
    stop: () => isSpeech && pauseTrack(),
    close: () => isSpeech && closePlayer(),
  };
}
