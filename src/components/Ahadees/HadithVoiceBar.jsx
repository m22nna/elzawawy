import React, { useState } from 'react';
import {

  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Heart,
  Mic
} from 'lucide-react';

const HadithVoiceBar = ({ hadith }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const speeds = ['0.8x', '1.0x', '1.25x', '1.5x', '2.0x'];

  const toggleSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAE5DD] shadow-lg py-3 px-4 md:px-8 text-[#2C3E35] z-50 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Right Section: Hadith Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-start">
          <div className="w-10 h-10 rounded-xl bg-[#1E3E30] flex items-center justify-center text-white shrink-0">
            <Mic className="w-5 h-5" />
          </div>

          <div className="text-right">
            <h4 className="text-sm font-bold text-[#1E3E30] truncate max-w-[250px] sm:max-w-[320px]">
              {hadith?.textArabic ? `حديث: ${hadith.textArabic}` : 'حديث: فضل طلب العلم والمسارعة إليه...'}
            </h4>
            <p className="text-[11px] text-[#7A7368]">
              {hadith?.source ? `${hadith.source} • ` : ''}الشيخ عبدالرحمن الزواوي • <span className="text-[#0D7D4D]">تسجيل استوديو</span>
            </p>
          </div>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className="mr-2 text-[#A59F94] hover:text-[#C29B38] transition-colors"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#C29B38] text-[#C29B38]' : ''}`} />
          </button>
        </div>

        {/* Center Section: Audio Player Controls & Progress */}
        <div className="flex items-center gap-3 w-full md:w-1/2 max-w-xl justify-center">
          <span className="text-[11px] text-[#8A8378] font-mono w-9 text-left">00:45</span>

          {/* Player Main Buttons */}
          <div className="flex items-center gap-2">
            <button className="text-[#8A8378] hover:text-[#1E3E30] p-1 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-[#F7F5F0] border border-[#E0D9CE] hover:bg-[#EAE4D9] flex items-center justify-center text-[#1E3E30] transition-all shadow-2xs"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current mr-0.5" />
              )}
            </button>

            <button className="text-[#8A8378] hover:text-[#1E3E30] p-1 transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar Container */}
          <div className="flex-1 bg-[#EAE5DD] h-1.5 rounded-full relative overflow-hidden cursor-pointer">
            <div className="bg-[#1E3E30] h-full w-[35%] rounded-full relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1E3E30] rounded-full shadow-xs"></div>
            </div>
          </div>

          <span className="text-[11px] text-[#8A8378] font-mono w-9 text-right">02:18</span>
        </div>

        {/* Left Section: Extras (HQ Tag, Speed, Volume, Download) */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">

          {/* Audio Quality Tag */}
          <div className="flex items-center gap-1.5 bg-[#F2F7F4] border border-[#D5E5DC] text-[#1E3E30] text-[11px] font-bold px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>صوت نقي HQ</span>
          </div>

          {/* Speed Toggle Button */}
          <button
            onClick={toggleSpeed}
            className="border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#1E3E30] text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
          >
            {playbackSpeed}
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-[#8A8378] hover:text-[#1E3E30]"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
              className="w-16 accent-[#1E3E30] h-1 bg-[#E2DDD5] rounded-lg cursor-pointer"
            />
          </div>

          {/* Download Button */}
          <button className="text-[#8A8378] hover:text-[#1E3E30] p-1.5 rounded-lg border border-[#E2DDD5] hover:bg-[#F5F2EC] transition-colors">
            <Download className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};

export default HadithVoiceBar;