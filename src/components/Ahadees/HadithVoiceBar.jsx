import React, { useState } from 'react';
import { Check, Copy, FastForward, Heart, Mic, Pause, Play, Repeat, RotateCcw, Rewind, Volume2, VolumeX } from 'lucide-react';
import { mmss } from '../../features/Quran/utils';
import { SPEEDS } from './useHadithSpeech';

const rateLabel = (r) => `${Number.isInteger(r) ? r.toFixed(1) : r}x`;

// شريط القراءة الآلية للحديث (بصوت المتصفح، مش تسجيل للشيخ)
const HadithVoiceBar = ({ hadith, speech, saved, onToggleSaved, onStep, hasPrev = true, hasNext = true }) => {
  const [copied, setCopied] = useState(false);
  const nextSpeed = () => speech.setRate(SPEEDS[(SPEEDS.indexOf(speech.rate) + 1) % SPEEDS.length]);
  const muted = speech.volume === 0;
  const reading = !!hadith && speech.playing && speech.current === hadith.textArabic;
  const fraction = reading ? speech.progress : 0;

  const copy = async () => {
    if (!hadith) return;
    try {
      await navigator.clipboard.writeText(`«${hadith.textArabic}»\nالمصدر: ${hadith.source}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* الحافظة غير متاحة */
    }
  };

  const small = 'w-8 h-8 grid place-items-center rounded-full text-[#9A9388] hover:text-[#1E3E30] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAE5DD] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-3 px-4 md:px-8 text-[#2C3E35] z-50 font-sans"
      dir="rtl"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_minmax(320px,520px)_1fr] items-center gap-x-6 gap-y-3">

        {/* يمين: معلومات الحديث */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#1E3E30] flex items-center justify-center text-[#E3C878] shrink-0">
            <Mic className="w-5 h-5" />
          </div>

          <div className="text-right min-w-0">
            <h4 className="text-sm font-extrabold text-[#1E3E30] truncate max-w-[240px] sm:max-w-[300px]">
              {hadith ? `حديث: ${hadith.textArabic}` : 'جاري تحميل الحديث...'}
            </h4>
            <p className="text-[11px] text-[#7A7368] truncate max-w-[240px] sm:max-w-[300px]">
              {hadith?.source ? `${hadith.source} • ` : ''}
              {speech.available ? (
                <span className="text-[#0D7D4D] font-semibold">قراءة آلية من المتصفح</span>
              ) : (
                <span>القراءة الصوتية غير متاحة في متصفحك</span>
              )}
            </p>
          </div>

          <button
            onClick={() => hadith && onToggleSaved(hadith.sortOrder)}
            disabled={!hadith}
            aria-label={saved ? 'إزالة من المحفوظات' : 'حفظ الحديث'}
            aria-pressed={saved}
            className="mr-1 text-[#A59F94] hover:text-[#C29B38] transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-[#C29B38] text-[#C29B38]' : ''}`} />
          </button>
        </div>

        {/* وسط: التحكم والتقدّم */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-3" dir="ltr">
            <button
              onClick={() => hadith && speech.restart(hadith.textArabic)}
              disabled={!hadith || !speech.available}
              aria-label="إعادة القراءة من البداية"
              title="إعادة القراءة من البداية"
              className={small}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => onStep?.(1)} disabled={!hasNext || !hadith} aria-label="الحديث التالي" title="الحديث التالي" className={small}>
              <FastForward className="w-4 h-4" fill="currentColor" />
            </button>
            <button
              onClick={() => hadith && speech.toggle(hadith.textArabic)}
              disabled={!hadith || !speech.available}
              aria-label={reading ? 'إيقاف' : 'استمع'}
              className="w-10 h-10 rounded-full bg-[#1E3E30] hover:bg-[#152D23] text-white flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reading ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button onClick={() => onStep?.(-1)} disabled={!hasPrev || !hadith} aria-label="الحديث السابق" title="الحديث السابق" className={small}>
              <Rewind className="w-4 h-4" fill="currentColor" />
            </button>
            <button
              onClick={() => speech.setLoop(!speech.loop)}
              aria-label="تكرار القراءة"
              aria-pressed={speech.loop}
              title={speech.loop ? 'إيقاف التكرار' : 'تكرار القراءة'}
              className={`${small} ${speech.loop ? '!text-[#1E3E30] bg-[#E2ECE7]' : ''}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[#8A8378]">
            <span className="w-9 tabular-nums">{mmss(reading ? speech.elapsed : 0)}</span>
            <div className="relative flex-1 h-1 rounded-full bg-[#E6EFE9] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(fraction * 100)}>
              <div className="absolute inset-y-0 right-0 rounded-full bg-[#1E3E30] transition-[width] duration-300" style={{ width: `${fraction * 100}%` }} />
            </div>
            <span className="w-12 text-left tabular-nums" title="مدة تقديرية">
              {reading ? `≈ ${mmss(speech.estTotal)}` : '--:--'}
            </span>
          </div>
        </div>

        {/* شمال: نسخ، الصوت، السرعة، الحالة */}
        <div className="flex items-center gap-3 justify-start md:justify-end" dir="ltr">
          <button
            onClick={copy}
            disabled={!hadith}
            aria-label="نسخ الحديث"
            title="نسخ الحديث"
            className="text-[#9A9388] hover:text-[#1E3E30] transition-colors cursor-pointer disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(speech.volume * 100)}
              onChange={(e) => speech.setVolume(Number(e.target.value) / 100)}
              aria-label="مستوى الصوت"
              className="w-20 accent-[#1E3E30] h-1 cursor-pointer"
            />
            <button
              onClick={() => speech.setVolume(muted ? 1 : 0)}
              aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
              className="text-[#8A8378] hover:text-[#1E3E30] cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={nextSpeed}
            aria-label="سرعة القراءة"
            className="border border-[#E2DDD5] bg-white hover:bg-[#F7F5F0] text-[#1E3E30] text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {rateLabel(speech.rate)}
          </button>

          <span className="hidden sm:flex items-center gap-1.5 border border-[#E2DDD5] bg-[#FAF8F5] rounded-xl px-3 py-1.5 text-[10px] font-bold text-[#1E3E30]" dir="rtl">
            قراءة آلية
            <span className={`w-1.5 h-1.5 rounded-full ${speech.available ? 'bg-[#10B981]' : 'bg-[#B8B2A7]'}`} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default HadithVoiceBar;