import { arNum } from "../../features/Quran/utils";

const SOURCE_DESCRIPTIONS = {
  "متفق عليه": "أحاديث اتفق الإمامان البخاري ومسلم على روايتها، وهي من أعلى مراتب الصحة.",
  "صحيح البخاري": "أحاديث رواها الإمام البخاري في جامعه الصحيح، وهو أصح كتب الحديث عند جمهور العلماء.",
  "صحيح مسلم": "أحاديث رواها الإمام مسلم في صحيحه، وهو ثاني أصح كتب الحديث عند جمهور العلماء.",
};

export const describeSource = (name) => SOURCE_DESCRIPTIONS[name] ?? `أحاديث نبوية من ${name}.`;

export const countLabel = (n) => {
  if (n === 1) return "حديث واحد";
  if (n === 2) return "حديثان";
  if (n >= 3 && n <= 10) return `${arNum(n)} أحاديث`;
  return `${arNum(n)} حديثاً`;
};

export const TILE_STYLES = [
  { bg: "bg-[#E8F0EC]", icon: "text-[#1E3E30]" },
  { bg: "bg-[#F6EBD0]", icon: "text-[#B98F3E]" },
  { bg: "bg-[#E8F0EC]", icon: "text-[#1E3E30]" },
];

export const tileStyle = (i) => TILE_STYLES[i % 3];

export const TAG_STYLES = ["bg-[#E8EEEA] text-[#2C3E35]", "bg-[#F8EED6] text-[#A27B22]"];