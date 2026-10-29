import { useCallback, useEffect, useRef, useState } from "react";

export const SPEEDS = [0.75, 0.85, 1, 1.25];

const CHARS_PER_SECOND = 13; // تقدير تقريبي لسرعة القراءة العربية عند سرعة 1x (بنستخدمه للوقت الكلي فقط)

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function useHadithSpeech() {
  const [hasArabic, setHasArabic] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(null); // نص الحديث اللي بيتقرأ دلوقتي
  const [rate, setRate] = useState(0.85);
  const [volume, setVolume] = useState(1);
  const [loop, setLoop] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [boundary, setBoundary] = useState(0); // نسبة التقدّم من أحداث الكلمات (لو المتصفح بيدعمها)

  const opts = useRef({ rate, volume, loop });
  opts.current = { rate, volume, loop };
  const token = useRef(0); // عشان نتجاهل أحداث القراءة القديمة لما نبدّل الحديث
  const startedAt = useRef(0);

  useEffect(() => {
    if (!supported()) return undefined;
    const synth = window.speechSynthesis;
    const check = () => setHasArabic(synth.getVoices().some((v) => /^ar/i.test(v.lang)));
    check();
    synth.addEventListener?.("voiceschanged", check);
    return () => {
      synth.removeEventListener?.("voiceschanged", check);
      token.current += 1;
      synth.cancel();
    };
  }, []);

  // عدّاد الوقت المنقضي أثناء القراءة
  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 250);
    return () => clearInterval(timer);
  }, [playing]);

  const stop = useCallback(() => {
    token.current += 1;
    if (supported()) window.speechSynthesis.cancel();
    setPlaying(false);
    setCurrent(null);
    setElapsed(0);
    setBoundary(0);
  }, []);

  const speak = useCallback((text) => {
    if (!supported() || !text) return;
    const synth = window.speechSynthesis;
    token.current += 1;
    const mine = token.current;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-SA";
    u.rate = opts.current.rate;
    u.volume = opts.current.volume;
    u.onboundary = (e) => {
      if (mine === token.current && typeof e.charIndex === "number") setBoundary(Math.min(1, e.charIndex / text.length));
    };
    u.onend = () => {
      if (mine !== token.current) return;
      if (opts.current.loop) {
        speak(text); // تكرار القراءة
        return;
      }
      setPlaying(false);
      setCurrent(null);
      setElapsed(0);
      setBoundary(0);
    };
    u.onerror = (e) => {
      if (mine !== token.current || e.error === "interrupted" || e.error === "canceled") return;
      setPlaying(false);
      setCurrent(null);
    };

    startedAt.current = Date.now();
    setElapsed(0);
    setBoundary(0);
    setCurrent(text);
    setPlaying(true);
    synth.speak(u);
  }, []);

  // لو نفس الحديث شغّال يوقفه، وإلا يبدأ قراءة الحديث ده (حتى لو في حديث تاني شغّال)
  const toggle = useCallback(
    (text) => {
      if (!supported() || !hasArabic || !text) return;
      if (playing && current === text) stop();
      else speak(text);
    },
    [hasArabic, playing, current, stop, speak]
  );

  const restart = useCallback(
    (text) => {
      const t = text ?? current;
      if (supported() && hasArabic && t) speak(t);
    },
    [hasArabic, current, speak]
  );

  const estTotal = current ? Math.max(2, current.length / (CHARS_PER_SECOND * rate)) : 0;
  const progress = playing ? Math.min(0.98, Math.max(boundary, elapsed / (estTotal || 1))) : 0;

  return {
    available: supported() && hasArabic,
    playing,
    current,
    progress,
    elapsed,
    estTotal,
    toggle,
    restart,
    stop,
    rate,
    setRate,
    volume,
    setVolume,
    loop,
    setLoop,
  };
}