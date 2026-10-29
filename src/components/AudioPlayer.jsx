import React from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  AudioLines, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  X 
} from 'lucide-react';

const toArabicNumerals = (num) => {
  if (num === null || num === undefined || num === '') return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (digit) => arabicDigits[Number(digit)]);
};

const formatSecondsToTimeArabic = (sec) => {
  if (!sec || isNaN(sec)) return toArabicNumerals('00:00');
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return toArabicNumerals(formatted);
};

export const AudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isRepeat,
    isShuffle,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    cyclePlaybackRate,
    skipForward,
    skipBackward,
    toggleRepeat,
    toggleShuffle,
    closePlayer
  } = useAudio();

  // If no track is active, don't display player
  if (!currentTrack) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none transition-all duration-300"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Right Side: Waveform badge, Title & Reciter Subtitle */}
        <div className="flex items-center gap-3 w-full md:w-1/4 justify-between md:justify-start">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-2xl bg-[#edf6f2] text-[#103e2e] flex items-center justify-center flex-shrink-0 border border-emerald-100/60 shadow-sm">
              <AudioLines className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-[#0b3b2c]' : 'text-gray-400'}`} />
            </div>

            <div className="text-right truncate">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {currentTrack.title || 'تلاوة مباركة'}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                {currentTrack.reciter || 'فضيلة الشيخ عبدالرحمن الزواوي'}
              </p>
            </div>
          </div>

          {/* Close button on mobile right */}
          <button 
            onClick={closePlayer} 
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
            title="إغلاق المشغل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Controls: Playback Buttons & Interactive Seek Bar */}
        <div className="w-full md:w-2/4 flex flex-col items-center gap-1.5">
          {/* Controls Row */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isRepeat ? 'text-[#103e2e] bg-[#edf6f2] font-bold' : 'text-gray-400 hover:text-gray-700'
              }`}
              title={isRepeat ? 'إلغاء التكرار' : 'تكرار التلاوة'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipBackward(10)}
              className="p-1.5 rounded-xl text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              title="تأخير ١٠ ثوانٍ"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#103e2e] hover:bg-[#0a2c20] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skipForward(10)}
              className="p-1.5 rounded-xl text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              title="تقديم ١٠ ثوانٍ"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isShuffle ? 'text-[#103e2e] bg-[#edf6f2] font-bold' : 'text-gray-400 hover:text-gray-700'
              }`}
              title={isShuffle ? 'إلغاء التشغيل العشوائي' : 'تشغيل عشوائي'}
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Seek Bar */}
          <div className="w-full flex items-center gap-2 px-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium min-w-[36px] text-center">
              {formatSecondsToTimeArabic(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#103e2e] focus:outline-none"
            />

            <span className="text-[10px] sm:text-xs text-gray-500 font-medium min-w-[36px] text-center">
              {formatSecondsToTimeArabic(duration)}
            </span>
          </div>
        </div>

        {/* Left Side: Speed control badge, Volume Slider & Close */}
        <div className="hidden md:flex items-center gap-3 w-1/4 justify-end">
          {/* Playback Rate / Speed Badge */}
          <button
            onClick={cyclePlaybackRate}
            className="px-2.5 py-1 rounded-xl bg-[#edf6f2] hover:bg-[#e2ede7] text-[#103e2e] text-xs font-bold transition-colors cursor-pointer border border-emerald-100/80"
            title="تغيير سرعة التلاوة"
          >
            {playbackRate}x
          </button>

          {/* Volume Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 sm:w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#103e2e] focus:outline-none"
              title={`مستوى الصوت: ${toArabicNumerals(Math.round((isMuted ? 0 : volume) * 100))}%`}
            />
          </div>

          {/* Close Player */}
          <button
            onClick={closePlayer}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl transition-colors cursor-pointer"
            title="إغلاق المشغل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
