import React from 'react';

/**
 * AyahNumber — Reusable Islamic verse-end marker.
 *
 * Renders the classic 8-pointed Rub el-Hizb star (۞-style)
 * drawn in SVG with the Eastern Arabic numeral centred inside.
 *
 * Props:
 *   number  {string}  Eastern Arabic numeral(s), e.g. "١" or "١١٠"
 *   size    {number}  Diameter in px (default 44)
 *   color   {string}  Fill/stroke colour (default "#8b6528" — Quranic gold)
 *   className {string} Extra Tailwind classes on the wrapper
 */
const AyahNumber = ({ number = '١', size = 44, color = '#8b6528', className = '' }) => {
  const r = size / 2;          // outer radius (half of total size)
  const innerR = r * 0.52;     // inner ring radius
  const numSize = size * 0.30; // font size relative to star

  return (
    <span
      className={`inline-flex items-center justify-center select-none align-middle ${className}`}
      style={{ width: size, height: size }}
      aria-label={`نهاية الآية رقم ${number}`}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        {/*
          8-pointed star: two overlapping squares, each rotated 45°.
          We draw both shapes as <polygon> with the same centre (50,50)
          using a classic compass-ratio that yields the traditional
          Islamic star proportions.
        */}
        {/* Square 1 — axis-aligned */}
        <polygon
          points="30,10 70,10 70,90 30,90"
          fill={color}
          opacity="0.18"
        />
        {/* Square 2 — rotated 45° */}
        <polygon
          points="50,5 95,50 50,95 5,50"
          fill={color}
          opacity="0.18"
        />

        {/* Proper 8-pointed star path via two overlaid rotated squares */}
        <g>
          {/* Star built from 8 kite polygons for crisp edges */}
          <path
            d={buildStar(50, 50, 46, 20, 8)}
            fill={color}
            opacity="0.92"
          />
        </g>

        {/* Inner circle — white cutout to host the numeral */}
        <circle cx="50" cy="50" r="26" fill="white" />

        {/* Thin ring border */}
        <circle cx="50" cy="50" r="26" fill="none" stroke={color} strokeWidth="1.5" />

        {/* Eastern Arabic numeral */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontFamily="'Amiri', 'Scheherazade New', 'Traditional Arabic', serif"
          fontSize={numSize > 10 ? numSize : 28}
          fontWeight="700"
        >
          {number}
        </text>
      </svg>
    </span>
  );
};

/**
 * Builds the SVG path string for a regular N-pointed star.
 * @param {number} cx  Centre X
 * @param {number} cy  Centre Y
 * @param {number} R   Outer radius
 * @param {number} r   Inner radius
 * @param {number} n   Number of points
 * @returns {string}   SVG path `d` attribute
 */
function buildStar(cx, cy, R, r, n) {
  const total = n * 2;
  const step = (Math.PI * 2) / total;
  // Start offset: rotate so first spike points straight up
  const start = -Math.PI / 2;
  let d = '';

  for (let i = 0; i < total; i++) {
    const angle = start + i * step;
    const radius = i % 2 === 0 ? R : r;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    d += i === 0 ? `M${x.toFixed(3)},${y.toFixed(3)}` : `L${x.toFixed(3)},${y.toFixed(3)}`;
  }
  return d + 'Z';
}

export default AyahNumber;
