import { useMemo } from "react";

export default function Waveform({ seed = 1, progress = 0, bars = 36 }) {
  const heights = useMemo(
    () => Array.from({ length: bars }, (_, i) => 30 + Math.abs(Math.sin((i + 1) * seed * 1.7)) * 70),
    [seed, bars]
  );
  const playhead = Math.floor(progress * bars);

  return (
    <div className="flex h-8 items-center justify-between gap-[3px]" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}%` }}
          className={`w-[3px] rounded-full ${
            i === playhead && progress > 0
              ? "bg-wird-gold"
              : i < playhead
              ? "bg-wird-green"
              : "bg-wird-green/15"
          }`}
        />
      ))}
    </div>
  );
}