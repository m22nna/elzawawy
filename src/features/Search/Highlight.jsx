import { snippet } from "./searchUtils";

export default function Highlight({ text, matcher, length }) {
  const shown = length ? snippet(text, matcher, length) : String(text ?? "");
  if (!matcher) return shown;
  const parts = matcher.split(shown);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-[#F6E3B0] px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
