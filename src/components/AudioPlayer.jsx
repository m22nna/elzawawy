import React, { useState } from 'react';
import {
  AudioLines,
  ListMusic,
  Mic,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const PINE = '#103e2e';
const GOLD = '#C69234';

const mmss = (s) =>
  `${String(Math.floor((s || 0) / 60)).padStart(2, '0')}:${String(Math.floor((s || 0) % 60)).padStart(2, '0')}`;

const rateLabel = (r) => `${Number.isInteger(r) ? r.toFixed(1) : r}x`;

const formatOf = (url) => {
  try {
    const ext = new URL(url, window.location.href).pathname.split('.').pop();
    return /^[a-z0-9]{2,5}$/i.test(ext) ? ext.toUpperCase() : null;
  } catch {
    return null;
  }
};


function Slider({ value, onChange, label, className = '', fill = GOLD, disabled = false, step = 0.05 }) {
  const pick = (e) => {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    onChange(Math.min(1, Math.max(0, (r.right - e.clientX) / r.width)));
  };
  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      onClick={pick}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'ArrowLeft') onChange(Math.min(1, value + step));
        if (e.key === 'ArrowRight') onChange(Math.max(0, value - step));
      }}
      className={`group relative flex h-4 items-center ${disabled ? 'cursor-default' : 'cursor-pointer'} ${className}`}
    >
      <div className="relative h-1 w-full rounded-full bg-[#E6EFE9]">
        <div className="absolute inset-y-0 right-0 rounded-full" style={{ width: `${value * 100}%`, backgroundColor: fill }} />
      </div>
    </div>
  );
}

const ctl =
  'relative grid h-8 w-8 place-items-center rounded-full text-gray-500 transition hover:text-[#103e2e] disabled:opacity-40 disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed';

export const AudioPlayer = () => {
  const a = useAudio();
  const [queueOpen, setQueueOpen] = useState(false);
  const t = a.currentTrack;


  if (!t) return null;

  const speech = t.kind === 'speech';
  const fmt = speech ? 'قراءة آلية' : formatOf(t.audioUrl);
  const hasQueue = a.queue.length > 1;
  const fraction = a.duration > 0 ? Math.min(1, a.currentTime / a.duration) : 0;
  const canSeek = !speech;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E6EFE9] bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md select-none"
      dir="rtl"
    >
      {/* قايمة التشغيل */}
      {queueOpen && hasQueue && (
        <div className="absolute bottom-full left-4 mb-2 max-h-72 w-80 max-w-[calc(100vw-2rem)] overflow-auto rounded-2xl border border-[#DCEAE2] bg-white p-2 shadow-2xl">
          {a.queue.map((item, i) => {
            const active = i === a.queueIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => a.playTrack(item, { restart: true })}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-right text-xs font-bold transition ${
                  active ? 'bg-[#E3EEE8] text-[#063F30]' : 'text-[#063F30]/80 hover:bg-[#F2F7F4]'
                }`}
              >
                <span className="truncate">{item.title}</span>
                {active && a.isPlaying ? <Volume2 size={13} className="shrink-0 text-[#7A5A14]" /> : null}
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 md:grid-cols-[1fr_minmax(340px,520px)_1fr] lg:px-10">
        {/* يمين: العنوان */}
        <div className="flex min-w-0 items-center justify-between gap-3 md:justify-start">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: PINE }}>
              {speech ? <Mic size={20} /> : <AudioLines size={20} className={a.isPlaying ? 'animate-pulse' : ''} />}
            </span>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-extrabold" style={{ color: PINE }}>
                {t.title}
              </p>
              <p className="truncate text-[11px]">
                {a.failed ? (
                  <span className="text-red-600">{speech ? 'تعذّرت القراءة الآلية حاليًا' : 'تعذّر تشغيل الصوت حاليًا'}</span>
                ) : (
                  <span className="text-gray-500">{t.reciter}</span>
                )}
              </p>
            </div>
          </div>

          <button type="button" onClick={a.closePlayer} aria-label="إغلاق المشغّل" className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-600 md:hidden">
            <X size={16} />
          </button>
        </div>

        {/* وسط: التحكم والتقدّم */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-3" dir="ltr">
            <button type="button" onClick={a.prev} disabled={!a.hasPrev} aria-label="السابق" title="السابق" className={ctl}>
              <SkipBack size={15} fill="currentColor" />
            </button>
            <button type="button" onClick={() => a.skipBackward(10)} disabled={!canSeek} aria-label="رجوع 10 ثواني" title="رجوع 10 ثواني" className={ctl}>
              <RotateCcw size={18} />
              <span className="absolute text-[7px] font-bold">10</span>
            </button>
            <button
              type="button"
              onClick={a.togglePlayPause}
              aria-label={a.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-white shadow-md transition hover:scale-105 active:scale-95"
              style={{ backgroundColor: PINE }}
            >
              {a.isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
            </button>
            <button type="button" onClick={() => a.skipForward(10)} disabled={!canSeek} aria-label="تقديم 10 ثواني" title="تقديم 10 ثواني" className={ctl}>
              <RotateCw size={18} />
              <span className="absolute text-[7px] font-bold">10</span>
            </button>
            <button type="button" onClick={a.next} disabled={!a.hasNext} aria-label="التالي" title="التالي" className={ctl}>
              <SkipForward size={15} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="w-9 tabular-nums">{mmss(a.currentTime)}</span>
            <Slider value={fraction} onChange={a.seekFraction} label="التقدّم" className="flex-1" disabled={!canSeek} />
            <span className="w-12 text-left tabular-nums" title={speech ? 'مدة تقديرية' : undefined}>
              {a.duration ? `${speech ? '≈ ' : ''}${mmss(a.duration)}` : '--:--'}
            </span>
          </div>
        </div>

        {/* شمال: الأدوات */}
        <div className="hidden items-center justify-end gap-2.5 md:flex" dir="ltr">
          {hasQueue && (
            <button
              type="button"
              onClick={() => setQueueOpen((v) => !v)}
              aria-label="قايمة التشغيل"
              aria-pressed={queueOpen}
              title="قايمة التشغيل"
              className={`${ctl} ${queueOpen ? '!text-[#103e2e] bg-[#E3EEE8]' : ''}`}
            >
              <ListMusic size={16} />
            </button>
          )}
          {hasQueue && (
            <button
              type="button"
              onClick={a.toggleShuffle}
              aria-label="تشغيل عشوائي"
              aria-pressed={a.isShuffle}
              title={a.isShuffle ? 'إلغاء التشغيل العشوائي' : 'تشغيل عشوائي'}
              className={`${ctl} ${a.isShuffle ? '!text-[#103e2e] bg-[#E3EEE8]' : ''}`}
            >
              <Shuffle size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={a.toggleRepeat}
            aria-label="تكرار"
            aria-pressed={a.isRepeat}
            title={a.isRepeat ? 'إلغاء التكرار' : 'تكرار'}
            className={`${ctl} ${a.isRepeat ? '!text-[#103e2e] bg-[#E3EEE8]' : ''}`}
          >
            <Repeat size={15} />
          </button>

          <Slider value={a.volume} onChange={a.setVolume} label="الصوت" className="w-20" fill={PINE} />
          <button type="button" onClick={a.toggleMute} aria-label={a.isMuted ? 'إلغاء الكتم' : 'كتم الصوت'} className="cursor-pointer text-gray-500 hover:text-[#103e2e]">
            {a.isMuted || a.volume === 0 ? <VolumeX size={15} className="text-red-500" /> : <Volume2 size={15} />}
          </button>

          <button
            type="button"
            onClick={a.cyclePlaybackRate}
            aria-label="سرعة التشغيل"
            className="cursor-pointer rounded-md bg-[#F2F7F4] px-2.5 py-1 text-[10px] font-bold hover:bg-[#E3EEE8]"
            style={{ color: PINE }}
          >
            {rateLabel(a.playbackRate)}
          </button>

          {fmt && (
            <span className="rounded-md bg-[#C6923433] px-2 py-1 text-[9px] font-bold" style={{ color: '#8A6418' }}>
              {fmt}
            </span>
          )}

          <button type="button" onClick={a.closePlayer} aria-label="إغلاق المشغّل" title="إغلاق المشغّل" className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
