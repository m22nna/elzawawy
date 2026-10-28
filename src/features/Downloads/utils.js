import { BookOpen, HandHeart, Library, PlayCircle, Sun } from "lucide-react";

export const SHEIKH = "الشيخ عبدالرحمن الزواوي";

export const ICONS = {
  quran: BookOpen,
  adhkar: Sun,
  hadith: HandHeart,
  shorts: PlayCircle,
  library: Library,
};

export const mmss = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;

// bytes -> ميجابايت
export const mb = (bytes) => (bytes / 1048576).toFixed(1);