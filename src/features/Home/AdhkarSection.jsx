import React, { useEffect, useState, useRef } from "react";
import {
  Bell, Bookmark, Search, Sun, Sunset, Moon, Share2, Play, Pause, RotateCw,
  Plus, PlusCircle, ChevronRight, ChevronLeft, Volume2, CheckCircle2,
  BadgeCheck, BookOpen, Clock, Repeat, Hand, ArrowLeft, Landmark, ScrollText,
  Infinity as InfinityIcon, RotateCcw, SkipForward, SkipBack, Heart, X, ClipboardCheck
} from "lucide-react";
import { api } from "../../api/client";
import { usePrayerTimes } from "../../api/usePrayerTimes";
import { useKhatmDua } from "../../api/useKhatmDua";
import { markDone } from "./wirdStore";
import Navbar from "../../components/NavBar";
import { Link } from "react-router-dom";





/* ───────────── Design tokens ───────────── */
const C = {
  page: "#EFF8F3",
  ink: "#063F30",
  mint: "#E3EEE8",
  mintSoft: "#EAF4EF",
  line: "#DCEAE2",
  gold: "#7A5A14",
  goldRing: "#C69234",
  peach: "#FFE2A8",
};

const QURAN = { fontFamily: "'Amiri', 'Amiri Quran', serif" };
const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
`;

const Wrap = ({ className = "", ...p }) => (
  <div className={`mx-auto w-full max-w-[1600px] px-6 lg:px-10 ${className}`} {...p} />
);

const NAV = ["الرئيسية", "القرآن الكريم", "الأحاديث", "الأذكار", "التفاسير", "خطب ومرئيات"];

const to12h = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
};

const times = (n) => {
  if (!n || n <= 1) return "مرة واحدة";
  if (n === 2) return "مرتان";
  if (n >= 3 && n <= 10) return `${n} مرّات`;
  return `${n} مرّة`;
};

const ORDINALS = [
  "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر",
  "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر",
  "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون",
];

const CAT_META = {
  morning: { Icon: Sun, iconTone: "brown", tag: "الورد الحالي", tagTone: "gold", when: "بعد صلاة الفجر حتى الشروق", group: "daily" },
  evening: { Icon: Sunset, iconTone: "green", tag: "من العصر للغروب", tagTone: "gold", when: "من العصر حتى الغروب", group: "daily", featured: true },
  sleep: { Icon: Moon, iconTone: "mint", tag: "قبل النوم", tagTone: "gray", when: "عند النوم وعند الاستيقاظ", group: "daily" },
  "after-prayer": { Icon: Landmark, iconTone: "mint", tag: "عقب كل فريضة", tagTone: "gray", when: "عقب كل صلاة مفروضة", group: "daily" },
  "waking-up": { Icon: Sun, iconTone: "cream", tag: "الاستيقاظ", tagTone: "gray", when: "عند الاستيقاظ من النوم", group: "daily" },
  mosque: { Icon: Volume2, iconTone: "mint", tag: "النداء والدخول", tagTone: "gray", when: "عند دخول وخروج المسجد", group: "occasions" },
  "quranic-duas": { Icon: BookOpen, iconTone: "cream", tag: "جامعة الخيرين", tagTone: "gray", when: "في كل وقت", group: "occasions" },
  "prophetic-duas": { Icon: ScrollText, iconTone: "mint", tag: "جوامع الكلم", tagTone: "gray", when: "في كل وقت", group: "occasions" },
  "tasbih-and-istighfar": { Icon: InfinityIcon, iconTone: "mint", tag: "ذكر مطلق", tagTone: "gray", when: "في كل وقت وحين", group: "daily" },
};

const FULL_ADHAKAR_DATA = [
  {
    "slug": "morning",
    "nameArabic": "أذكار الصباح",
    "sortOrder": 0,
    "items": [
      {
        "textArabic": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "سيد الاستغفار — من قالها موقناً بها حين يصبح فمات من يومه دخل الجنة.",
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "( اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "آية الكرسي — من قرأها حين يصبح أُجير من الجن حتى يمسي.",
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ )",
        "repeatCount": 3,
        "reference": null,
        "virtue": "سورة الإخلاص (٣ مرات) — تكفي من كل شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 3
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ )",
        "repeatCount": 3,
        "reference": null,
        "virtue": "سورة الفلق (٣ مرات) — تكفي من كل شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 4
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَـٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ )",
        "repeatCount": 3,
        "reference": null,
        "virtue": "سورة الناس (٣ مرات) — تكفي من كل شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 5
      },
      {
        "textArabic": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 6
      },
      {
        "textArabic": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.",
        "repeatCount": 3,
        "reference": null,
        "virtue": "من قالها ثلاثاً حين يصبح كان حقاً على الله أن يرضيه يوم القيامة.",
        "firstAyahNumber": 1,
        "sortOrder": 7
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.",
        "repeatCount": 4,
        "reference": null,
        "virtue": "من قالها حين يصبح ٤ مرات أعتقه الله من النار.",
        "firstAyahNumber": 1,
        "sortOrder": 8
      },
      {
        "textArabic": "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
        "repeatCount": 7,
        "reference": null,
        "virtue": "من قالها ٧ مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.",
        "firstAyahNumber": 1,
        "sortOrder": 9
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": "لم يضره شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 10
      },
      {
        "textArabic": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 11
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 12
      },
      {
        "textArabic": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 13
      },
      {
        "textArabic": "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 14
      },
      {
        "textArabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 15
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 16
      },
      {
        "textArabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": "حُطت خطاياه وإن كانت مثل زبد البحر.",
        "firstAyahNumber": 1,
        "sortOrder": 17
      },
      {
        "textArabic": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": "كانت له عدل عشر رقاب وكُتبت له مائة حسنة ومُحيت عنه مائة سيئة.",
        "firstAyahNumber": 1,
        "sortOrder": 18
      },
      {
        "textArabic": "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 19
      }
    ]
  },
  {
    "slug": "evening",
    "nameArabic": "أذكار المساء",
    "sortOrder": 1,
    "items": [
      {
        "textArabic": "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "سيد الاستغفار — من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة.",
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "( اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "آية الكرسي — من قرأها حين يمسي أُجير من الجن حتى يصبح.",
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ )",
        "repeatCount": 3,
        "reference": null,
        "virtue": "سورة الإخلاص (٣ مرات) — تكفي من كل شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 3
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ )",
        "repeatCount": 3,
        "reference": null,
        "virtue": "سورة الفلق (٣ مرات) — تكفي من كل شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 4
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَـٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ )",
        "repeatCount": 3,
        "reference": null,
        "virtue": "سورة الناس (٣ مرات) — تكفي من كل شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 5
      },
      {
        "textArabic": "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 6
      },
      {
        "textArabic": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": "لم يضره شيء في تلك الليلة.",
        "firstAyahNumber": 1,
        "sortOrder": 7
      },
      {
        "textArabic": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.",
        "repeatCount": 3,
        "reference": null,
        "virtue": "كان حقاً على الله أن يرضيه يوم القيامة.",
        "firstAyahNumber": 1,
        "sortOrder": 8
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.",
        "repeatCount": 4,
        "reference": null,
        "virtue": "من قالها ٤ مرات حين يمسي أعتقه الله من النار.",
        "firstAyahNumber": 1,
        "sortOrder": 9
      },
      {
        "textArabic": "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
        "repeatCount": 7,
        "reference": null,
        "virtue": "كفاه الله ما أهمه من أمر الدنيا والآخرة.",
        "firstAyahNumber": 1,
        "sortOrder": 10
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": "لم يضره شيء.",
        "firstAyahNumber": 1,
        "sortOrder": 11
      },
      {
        "textArabic": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 12
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 13
      },
      {
        "textArabic": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 14
      },
      {
        "textArabic": "أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 15
      },
      {
        "textArabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 16
      },
      {
        "textArabic": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 17
      },
      {
        "textArabic": "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
        "repeatCount": 10,
        "reference": null,
        "virtue": "من صلى عليّ حين يصبح عشراً وحين يمسي عشراً أدركته شفاعتي يوم القيامة.",
        "firstAyahNumber": 1,
        "sortOrder": 18
      }
    ]
  },
  {
    "slug": "sleep",
    "nameArabic": "أذكار النوم",
    "sortOrder": 2,
    "items": [
      {
        "textArabic": "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "إذا أخذت مضجعك وتوفيت من ليلتك مت على الفطرة.",
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 3
      },
      {
        "textArabic": "( اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "آية الكرسي قبل النوم — لن يزال عليك من الله حافظ ولا يقربك شيطان حتى تصبح.",
        "firstAyahNumber": 1,
        "sortOrder": 4
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ )\n\nبِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ )\n\nبِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَـٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ )",
        "repeatCount": 3,
        "reference": null,
        "virtue": "تُقرأ المعوذات ٣ مرات مع النفث في الكفين ومسح ما استطاع من الجسد.",
        "firstAyahNumber": 1,
        "sortOrder": 5
      },
      {
        "textArabic": "( آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "الآيتان من آخر سورة البقرة — من قرأهما في ليلة كفتاه.",
        "firstAyahNumber": 285,
        "sortOrder": 6
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ يَا أَيُّهَا الْكَافِرُونَ ۝ لَا أَعْبُدُ مَا تَعْبُدُونَ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ لَكُمْ دِينُكُمْ وَلِيَ دِينِ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "سورة الكافرون — براءة من الشرك.",
        "firstAyahNumber": 1,
        "sortOrder": 7
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "سورة الملك — آيات من بدايتها.",
        "firstAyahNumber": 1,
        "sortOrder": 8
      },
      {
        "textArabic": "سُبْحَانَ اللَّهِ (٣٣)، وَالْحَمْدُ لِلَّهِ (٣٣)، وَاللَّهُ أَكْبَرُ (٣٤).",
        "repeatCount": 1,
        "reference": null,
        "virtue": "التسبيح قبل النوم خير من خادم.",
        "firstAyahNumber": 1,
        "sortOrder": 9
      },
      {
        "textArabic": "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 10
      },
      {
        "textArabic": "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 11
      }
    ]
  },
  {
    "slug": "after-prayer",
    "nameArabic": "بعد الصلاة",
    "sortOrder": 3,
    "items": [
      {
        "textArabic": "أَسْتَغْفِرُ اللَّهَ.",
        "repeatCount": 3,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلَهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 3
      },
      {
        "textArabic": "سُبْحَانَ اللَّهِ (٣٣)، وَالْحَمْدُ لِلَّهِ (٣٣)، وَاللَّهُ أَكْبَرُ (٣٣).",
        "repeatCount": 1,
        "reference": null,
        "virtue": "ثم تمام المائة: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        "firstAyahNumber": 1,
        "sortOrder": 4
      },
      {
        "textArabic": "( اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "آية الكرسي دبر كل صلاة مكتوبة — لم يمنعه من دخول الجنة إلا أن يموت.",
        "firstAyahNumber": 1,
        "sortOrder": 5
      },
      {
        "textArabic": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ )\n\nبِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ )\n\nبِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\n( قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَـٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": "تُقرأ المعوذات مرة بعد كل صلاة، وثلاث مرات بعد صلاتي الفجر والمغرب.",
        "firstAyahNumber": 1,
        "sortOrder": 6
      },
      {
        "textArabic": "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 7
      }
    ]
  },
  {
    "slug": "waking-up",
    "nameArabic": "الاستيقاظ",
    "sortOrder": 4,
    "items": [
      {
        "textArabic": "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "دعاء الاستيقاظ والتعارّ من الليل — غُفر له فإن دعا استُجيب له.",
        "firstAyahNumber": 1,
        "sortOrder": 2
      }
    ]
  },
  {
    "slug": "mosque",
    "nameArabic": "أذكار المسجد",
    "sortOrder": 5,
    "items": [
      {
        "textArabic": "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "دعاء دخول المسجد بالقدم اليمنى.",
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "عند دخول المسجد.",
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "دعاء الخروج من المسجد بالقدم اليسرى.",
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَفِي سَمْعِي نُورًا، وَفِي بَصَرِي نُورًا، وَمِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا، وَمِنْ أَمَامِي نُورًا، وَمِنْ خَلْفِي نُورًا، وَاجْعَلْ لِي نُورًا.",
        "repeatCount": 1,
        "reference": null,
        "virtue": "دعاء الذهاب إلى المسجد.",
        "firstAyahNumber": 1,
        "sortOrder": 3
      }
    ]
  },
  {
    "slug": "quranic-duas",
    "nameArabic": "أدعية قرآنية",
    "sortOrder": 6,
    "items": [
      {
        "textArabic": "( رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "( رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "( رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "( رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي ۝ يَفْقَهُوا قَوْلِي )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 3
      },
      {
        "textArabic": "( رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 4
      },
      {
        "textArabic": "( رَّبِّ زِدْنِي عِلْمًا )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 5
      },
      {
        "textArabic": "( رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 6
      },
      {
        "textArabic": "( رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ ۝ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 7
      },
      {
        "textArabic": "( رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 8
      },
      {
        "textArabic": "( لَّا إِلَـٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ )",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 9
      }
    ]
  },
  {
    "slug": "prophetic-duas",
    "nameArabic": "أدعية مأثورة",
    "sortOrder": 7,
    "items": [
      {
        "textArabic": "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 3
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 4
      },
      {
        "textArabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.",
        "repeatCount": 1,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 5
      }
    ]
  },
  {
    "slug": "tasbih-and-istighfar",
    "nameArabic": "تسابيح واستغفار",
    "sortOrder": 8,
    "items": [
      {
        "textArabic": "سُبْحَانَ اللَّهِ.",
        "repeatCount": 33,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 0
      },
      {
        "textArabic": "الْحَمْدُ لِلَّهِ.",
        "repeatCount": 33,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 1
      },
      {
        "textArabic": "اللَّهُ أَكْبَرُ.",
        "repeatCount": 34,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 2
      },
      {
        "textArabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 3
      },
      {
        "textArabic": "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 4
      },
      {
        "textArabic": "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 5
      },
      {
        "textArabic": "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
        "repeatCount": 100,
        "reference": null,
        "virtue": null,
        "firstAyahNumber": 1,
        "sortOrder": 6
      }
    ]
  }
];

const DEFAULT_TASBIH_CARDS = [
  { id: "subhanAllah", text: "«سُبْحَانَ اللَّهِ وَبِحَمْدِهِ»", target: 100, label: "حُطَّتْ خَطَايَاهُ", dotColor: "#7A5A14" },
  { id: "astaghfirullah", text: "«أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ»", target: 100, label: "مِفْتَاحُ الفَرَجِ وَالرِّزْقِ", dotColor: "#063F30" },
  { id: "laHawla", text: "«لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ»", target: 33, label: "كَنْزٌ مِنْ كُنُوزِ الجَنَّةِ", dotColor: "#7A5A14" },
  { id: "salawat", text: "«اللَّهُمَّ صَلِّ عَلَى نَبِيِّنَا مُحَمَّدٍ»", target: 100, label: "كُفِيتَ هَمَّكَ وَغُفِرَ ذَنْبُكَ", dotColor: "#063F30" },
];

const ICON_TONE = {
  brown: "bg-[#7A5A14] text-white",
  green: "bg-[#063F30] text-white",
  mint: "bg-[#E3EEE8] text-[#063F30]",
  cream: "bg-[#FFE9C2] text-[#7A5A14]",
};

const WAVE = [6, 12, 8, 16, 10, 18, 7, 14, 9, 17, 6, 13, 8, 15, 10, 12, 7, 11];

function HomeHeader() {
  return <Navbar />;
}

export default function AdhkarSection({ onNavigate }) {
  const prayer = usePrayerTimes();
  const { data: khatmDuaData, loading: khatmDuaLoading, error: khatmDuaError } = useKhatmDua();

  const [categories, setCategories] = useState(FULL_ADHAKAR_DATA);
  const [selectedSlug, setSelectedSlug] = useState("morning");
  const [loading, setLoading] = useState(false);

  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [itemCounter, setItemCounter] = useState(0);
  const [filter, setFilter] = useState("all");

  const [tasbihCards, setTasbihCards] = useState(DEFAULT_TASBIH_CARDS);
  const [customCounters, setCustomCounters] = useState({
    subhanAllah: 0,
    astaghfirullah: 0,
    laHawla: 0,
    salawat: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCardText, setNewCardText] = useState("");
  const [newCardTarget, setNewCardTarget] = useState(100);
  const [newCardLabel, setNewCardLabel] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const sessionRef = useRef(null);
  const advanceTimer = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAdhkar() {
      try {
        const response = await api("/v1/adhkar");
        const list = Array.isArray(response) ? response : (response?.data || []);
        if (list.length > 0 && isMounted) {
          const merged = FULL_ADHAKAR_DATA.map(localCat => {
            const apiMatch = list.find(c => c.slug === localCat.slug);
            return apiMatch ? { ...localCat, items: apiMatch.items || localCat.items } : localCat;
          });
          setCategories(merged);
        }
      } catch (err) {
        // Fallback to FULL_ADHAKAR_DATA
      }
    }
    fetchAdhkar();
    return () => {
      isMounted = false;
      clearTimeout(advanceTimer.current);
    };
  }, []);

  const selectedCategory = categories.find((c) => c.slug === selectedSlug) || categories[0] || null;
  const activeItems = selectedCategory?.items || [];
  const activeItem = activeItems[activeItemIndex] || activeItems[0] || null;

  const currentMeta = CAT_META[selectedCategory?.slug] || CAT_META["morning"];

  const repeat = activeItem?.repeatCount || 1;
  const remaining = Math.max(0, repeat - itemCounter);

  const currentAudioSource = activeItem?.audioUrl || "https://server8.mp3quran.net/afs/001.mp3";

  const doneCount = activeItemIndex + (itemCounter >= repeat ? 1 : 0);
  const progressPercent = activeItems.length > 0 ? Math.round((doneCount / activeItems.length) * 100) : 0;

  const goTo = (i) => {
    clearTimeout(advanceTimer.current);
    setActiveItemIndex(i);
    setItemCounter(0);
  };

  const handleIncrement = () => {
    if (!activeItem || itemCounter >= repeat) return;
    const next = itemCounter + 1;
    setItemCounter(next);
    if (next >= repeat) markDone(selectedSlug, activeItemIndex);
    if (next >= repeat && activeItemIndex + 1 < activeItems.length) {
      advanceTimer.current = setTimeout(() => {
        setActiveItemIndex((p) => p + 1);
        setItemCounter(0);
      }, 700);
    }
  };

  const handleCustomTasbihIncrement = (id) => {
    setCustomCounters((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleCreateCustomCard = (e) => {
    e.preventDefault();
    if (!newCardText.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newCard = {
      id: newId,
      text: `«${newCardText.trim()}»`,
      target: Number(newCardTarget) || 100,
      label: newCardLabel.trim() || "ورد خاص",
      dotColor: "#063F30",
    };

    setTasbihCards((prev) => [...prev, newCard]);
    setCustomCounters((prev) => ({ ...prev, [newId]: 0 }));
    setNewCardText("");
    setNewCardLabel("");
    setIsModalOpen(false);
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.error("Audio error:", err));
    }
  };

  const selectCategory = (slug) => {
    clearTimeout(advanceTimer.current);
    setSelectedSlug(slug);
    setActiveItemIndex(0);
    setItemCounter(0);
    sessionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#EFF8F3]" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
        <style>{FONTS_CSS}</style>
        <HomeHeader prayer={prayer} onNavigate={onNavigate} />
        <div className="flex flex-col items-center justify-center pt-32 text-[#063F30]">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#063F30] border-t-transparent"></div>
          <p className="text-sm font-bold">جاري تحميل الأذكار والأدعية من السيرفر...</p>
        </div>
      </div>
    );
  }

  const visibleCategories = categories.filter((cat) => {
    const meta = CAT_META[cat.slug];
    if (filter === "all") return true;
    return meta && meta.group === filter;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[#EFF8F3] pb-44 text-[#063F30]" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <style>{FONTS_CSS}</style>
      <HomeHeader prayer={prayer} onNavigate={onNavigate} />

      <audio
        ref={audioRef}
        src={currentAudioSource}
        onEnded={() => setIsPlaying(false)}
      />

      <Wrap className="pb-2 pt-6">
        <div className="mb-3 flex items-center gap-1.5 text-xs text-[#063F30]/60">
          <Link to="/" className="cursor-pointer hover:underline">الرئيسية</Link>
          <ChevronLeft size={12} />
          <span className="font-bold text-[#063F30]">الأذكار والأدعية</span>
        </div>

        <div className="my-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#063F30] md:text-4xl">الأذكار والأدعية</h1>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F6E7C3] text-lg text-[#C69234]">✦</span>
            </div>
            <p className="mt-2 text-sm text-[#063F30]/70">
              اجعل ذكر الله جزءاً من يومك، واختر ما يناسب وقتك وحاجتك من السُّنّة المطهّرة بصوت الشيخ عبد الرحمن الزواوي.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#DCEAE2] bg-white p-3 shadow-sm">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <svg className="h-12 w-12 -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#E3EEE8" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke={C.goldRing} strokeWidth="4" fill="transparent" strokeLinecap="round"
                  strokeDasharray="125.66" strokeDashoffset={125.66 - (125.66 * progressPercent) / 100} />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#063F30]">{progressPercent}%</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#7A5A14]"></span>
                <span className="text-xs font-bold text-[#063F30]">الورد اليومي المنجز</span>
              </div>
              <span className="text-[11px] text-[#063F30]/60">
                {doneCount} من {activeItems.length} ذكراً متواصلاً
              </span>
            </div>
          </div>
        </div>
      </Wrap>

      {/* الهيرو الرئيسي */}
      <Wrap className="my-4">
        <div
          className="relative flex min-h-[620px] flex-col justify-between overflow-hidden rounded-xl border border-[#063F30]/40 bg-cover bg-center p-6 shadow-xl md:p-8"
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(6, 63, 48, 0.4), rgba(6, 63, 48, 0.85)), url('/background.jpg')` }}
        >
          <div className="z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-[#FFDEA4] px-4 py-1.5 text-xs font-bold text-[#063F30] shadow-sm">
                <Sun size={13} /> {selectedCategory?.nameArabic || "أذكار الصباح"}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0D2018]/60 px-3.5 py-1.5 text-[11px] text-white/90 backdrop-blur-md">
                <Clock size={12} /> الوقت المستحب: {currentMeta.when}
              </span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0D2018]/60 px-4 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md">
              <Repeat size={12} /> التكرار المطلوب: {times(repeat)} | التقدم: {itemCounter} / {repeat}
            </span>
          </div>

          <div className="z-10 my-6">
            <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/20 bg-[#152E23]/65 p-3 shadow-xl backdrop-blur-lg">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayAudio}
                  aria-label="تشغيل"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-[#0D2018]/70 text-white shadow-md transition hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="mr-0.5" />}
                </button>
                <div>
                  <h4 className="text-xs font-bold text-white md:text-sm">الاستماع بصوت الشيخ عبد الرحمن الزواوي</h4>
                  <p className="text-[11px] text-white/70">تلاوة خاشعة ومحفوفة بالتجويد • 02:45 د</p>
                </div>
                <div className="mr-4 hidden items-center gap-[3px] sm:flex">
                  {WAVE.map((h, i) => (
                    <span
                      key={i}
                      className={`w-[3px] rounded-full bg-[#FFDEA4]/80 ${isPlaying ? "animate-pulse" : ""}`}
                      style={{ height: h + 4, animationDelay: `${i * 70}ms` }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={togglePlayAudio}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#8C6A1C] px-5 py-2.5 text-xs font-bold text-[#FFF1D0] shadow transition hover:bg-[#9a7420]"
              >
                <BookOpen size={14} /> {isPlaying ? "إيقاف مؤقت" : "ابدأ الورد الآن"}
              </button>
            </div>
          </div>

          <div className="z-10 grid grid-cols-1 items-end gap-6 md:grid-cols-12">
            <div className="space-y-5 md:col-span-8">
              <p className="text-2xl leading-[2] tracking-wide text-white drop-shadow-md md:text-[44px]" style={QURAN}>
                «{activeItem?.textArabic || "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ..."}»
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0D2018]/60 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-md">
                  <CheckCircle2 size={13} className="text-[#FFDEA4]" /> حديث صحيح
                </span>
                {activeItem?.reference && (
                  <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0D2018]/60 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-md">
                    <ScrollText size={13} className="text-[#FFDEA4]" /> المصدر: {activeItem.reference}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end md:col-span-4">
              <div className="w-full max-w-[300px] rounded-2xl border border-white/20 bg-[#0D2018]/60 p-5 text-center shadow-2xl backdrop-blur-md">
                <span className="mb-3 block text-[11px] font-bold text-white/70">مؤشر تكرار الذكر</span>

                <div className="relative mx-auto my-1 flex h-28 w-28 items-center justify-center">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40" cy="40" r="32" stroke="#FFDEA4" strokeWidth="6" fill="transparent" strokeLinecap="round"
                      strokeDasharray="201.06"
                      strokeDashoffset={201.06 - 201.06 * Math.min(1, itemCounter / repeat)}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-white">{itemCounter} / {repeat}</span>
                    <span className="text-[10px] text-white/60">مكتمل</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-white/70">
                  <span>المتبقي: {times(remaining)}</span>
                  <span>{Math.round((itemCounter / repeat) * 100)}% منجَز</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrap>

      {/* جلسة الذكر التفاعلية */}
      <Wrap className="my-10">
        <div ref={sessionRef} className="mb-6 flex items-center justify-between border-b border-[#DCEAE2] pb-5">
          <div>
            <h2 className="text-[26px] font-bold text-[#063F30]">جلسة الذكر التفاعلية</h2>
            <p className="mt-1 text-sm text-[#063F30]/65">اقرأ بتمعّن، واستحضر القلب مع كل تسبيحة ودعاء.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={activeItemIndex === 0}
              onClick={() => goTo(activeItemIndex - 1)}
              aria-label="السابق"
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#E3EEE8] text-[#063F30] transition hover:bg-[#d4e6dc] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs font-bold text-[#063F30]">
              {activeItems.length > 0 ? activeItemIndex + 1 : 0} من {activeItems.length}
            </span>
            <button
              disabled={activeItemIndex + 1 >= activeItems.length}
              onClick={() => goTo(activeItemIndex + 1)}
              aria-label="التالي"
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#E3EEE8] text-[#063F30] transition hover:bg-[#d4e6dc] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {activeItem && (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
            <div className="flex flex-col justify-between rounded-2xl border border-[#DCEAE2] bg-white p-6 shadow-sm md:col-span-8 md:min-h-[620px] md:p-12">
              <div>
                <div className="mb-5 flex items-center justify-between border-b border-[#E3EEE8] pb-5">
                  <span className="rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs font-bold text-[#063F30]">
                    الذكر {ORDINALS[activeItemIndex] || `رقم ${activeItemIndex + 1}`} — {selectedCategory?.nameArabic}
                  </span>
                  <button onClick={() => setItemCounter(0)} className="flex items-center gap-1.5 text-xs text-[#063F30]/70 hover:text-[#063F30]">
                    <RotateCw size={13} /> إعادة ضبط
                  </button>
                </div>

                <p className="my-8 text-3xl leading-[2] text-[#063F30] md:text-5xl whitespace-pre-line" style={QURAN}>
                  «{activeItem.textArabic}»
                </p>

                {activeItem.virtue && (
                  <div className="relative mt-10 rounded-2xl border border-[#CFE3D8] bg-[#E8F3ED] p-5 pr-6">
                    <span className="absolute -right-3 top-6 grid h-7 w-7 place-items-center rounded-full bg-[#EFF8F3] text-[#7A5A14]">
                      <BadgeCheck size={24} />
                    </span>
                    <h5 className="mb-2 text-xs font-bold text-[#063F30]">فضل هذا الذكر:</h5>
                    <p className="text-sm leading-7 text-[#063F30]/85">{activeItem.virtue}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-[#E3EEE8] pt-6 text-xs text-[#063F30]/70">
                <span>{activeItem.reference ? `المصدر: ${activeItem.reference}` : ""}</span>
                <div className="flex items-center gap-2">
                  <button aria-label="حفظ" className="grid h-11 w-11 place-items-center rounded-xl bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]">
                    <Bookmark size={16} />
                  </button>
                  <button aria-label="مشاركة" className="grid h-11 w-11 place-items-center rounded-xl bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between rounded-2xl border border-[#DCEAE2] bg-white p-6 text-center shadow-sm md:col-span-4">
              <span className="mt-8 rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs font-bold text-[#063F30]">
                الهدف المطلوب: {times(repeat)}
              </span>

              <button
                onClick={handleIncrement}
                aria-label="اضغط للتسبيح"
                className="my-6 flex h-[200px] w-[200px] flex-col items-center justify-center rounded-full border-[10px] border-[#E3EEE8] bg-white shadow-[0_0_0_6px_#F0F6F3] transition active:scale-95"
              >
                <span className="text-6xl font-bold text-[#063F30]">{itemCounter}</span>
                <span className="mt-1 text-xs font-bold text-[#063F30]">اضغط للتسبيح</span>
                <Hand size={20} className="mt-1 text-[#7A5A14]" />
              </button>

              <div className="mb-4 space-y-4">
                <span className="block rounded-full bg-[#E3EEE8] px-4 py-1.5 text-xs text-[#063F30]/70">
                  المتبقي: <b className="text-[#063F30]">{times(remaining)}</b>
                </span>
                <span className="block text-sm text-[#7A5A14]">
                  {itemCounter === 0 ? "انقر لتبدأ التسبيح" : itemCounter >= repeat ? "تقبّل الله منك، أتممت الذكر" : "واصل التسبيح"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Wrap>

      {/* أبواب الأذكار المفهرسة ديناميكياً */}
      <Wrap className="my-12">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-[28px] font-bold text-[#063F30]">أبواب الأذكار والأدعية المأثورة</h2>
            <p className="mt-1 text-sm text-[#063F30]/65">موسوعة مصنفة وشاملة من صحيح السُّنّة النبوية والقرآن الكريم</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: `الكل (${categories.length} أبواب)` },
              { id: "daily", label: "اليومية" },
              { id: "occasions", label: "المناسبات" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition ${
                  filter === f.id ? "bg-[#063F30] text-white" : "bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6 border-t border-[#DCEAE2]" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visibleCategories.map((cat) => {
            const meta = CAT_META[cat.slug] || CAT_META["morning"];
            const CardIcon = meta.Icon || Sun;
            const isSelected = selectedSlug === cat.slug;
            const dark = isSelected || meta.featured;

            return (
              <div
                key={cat.slug}
                className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
                  isSelected
                    ? "border-[#D9C79F] bg-gradient-to-br from-white via-[#FFF8E8] to-[#FFEFD0]"
                    : meta.featured
                    ? "border-[#CFE0D6] bg-gradient-to-br from-[#E3F1EA] to-white"
                    : "border-[#DCEAE2] bg-white"
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${ICON_TONE[meta.iconTone]}`}>
                      <CardIcon size={18} />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${meta.tagTone === "gold" ? "bg-[#FFE9C2] text-[#7A5A14]" : "bg-[#E3EEE8] text-[#063F30]"}`}>
                      {meta.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#063F30]">{cat.nameArabic}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#063F30]/75">
                    {cat.items?.length || 0} أذكار مأثورة ومصنفة من السنّة النبوية والقرآن الكريم.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E3EEE8] pt-4">
                  <span className="text-[11px] font-bold text-[#063F30]/60">{cat.items?.length || 0} ذكراً مأثوراً</span>
                  <button
                    onClick={() => selectCategory(cat.slug)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      dark ? "bg-[#063F30] text-white hover:bg-[#084e3c]" : "bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]"
                    }`}
                  >
                    قراءة الأذكار <ArrowLeft size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Wrap>

      {/* المسبحة الحرة والعدادات المخصصة */}
      <Wrap className="my-16">
        <div className="rounded-2xl border border-[#DCEAE2] bg-white p-6 shadow-sm md:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#063F30] md:text-3xl">المسبحة الحرة والعدادات المخصصة</h2>
              <p className="mt-1.5 text-xs text-[#063F30]/70 md:text-sm">
                أوراد سريعة وعدادات مسبقة التجهيز لذكر الله في يومك
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#DCEAE2] bg-[#EFF8F3] px-4 py-2 text-[11px] font-bold text-[#063F30]">
              <ClipboardCheck size={14} className="text-[#7A5A14]" />
              <span>حفظ ومزامنة العدادات يتطلب تسجيل الدخول</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tasbihCards.map((card) => {
              const currentVal = customCounters[card.id] || 0;
              return (
                <div
                  key={card.id}
                  className="flex flex-col justify-between rounded-xl border border-[#E3EEE8] bg-[#F4F9F6] p-5 transition hover:shadow-md"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#063F30] shadow-sm">
                      {card.target} مرة
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: card.dotColor }}
                    />
                  </div>

                  <p className="my-4 text-center text-xl font-bold leading-relaxed text-[#063F30]" style={QURAN}>
                    {card.text}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#E3EEE8] pt-4">
                    <button
                      onClick={() => handleCustomTasbihIncrement(card.id)}
                      aria-label="تسبيح"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#063F30] text-white shadow transition hover:bg-[#084e3c] active:scale-95"
                    >
                      <Plus size={18} />
                    </button>
                    <div className="text-left">
                      <span className="block text-[10px] font-semibold text-[#063F30]/60">{card.label}</span>
                      <span className="text-xs font-bold text-[#7A5A14]">{currentVal} / {card.target}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#DCEAE2] bg-[#EAF4EF] p-6 sm:flex-row">
            <div>
              <h4 className="text-base font-bold text-[#063F30]">هل تريد تخصيص ورد أو ذكر معين؟</h4>
              <p className="mt-1 text-xs text-[#063F30]/75">أنشئ عدادك الخاص بالعدد المفضل، واضبط التنبيه اليومي المناسب</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#063F30] px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-[#084e3c]"
            >
              <PlusCircle size={16} />
              <span>إنشاء عداد مخصص</span>
            </button>
          </div>
        </div>
      </Wrap>

      {/* مشغل الصوت السفلي الثابت */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCEAE2] bg-[#F7FCF9]/95 px-6 py-3 shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#063F30] text-white shadow">
              <Volume2 size={22} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#063F30]">أذكار الصباح كاملة ومباركة</h4>
              <p className="text-[11px] text-[#063F30]/70">الشيخ عبد الرحمن الزواوي</p>
            </div>
            <button aria-label="إعجاب" className="mr-2 text-[#063F30]/60 hover:text-[#063F30]">
              <Heart size={16} />
            </button>
          </div>

          <div className="hidden flex-1 flex-col items-center max-w-xl md:flex">
            <div className="flex items-center gap-5">
              <button aria-label="تخطي للوراء" className="text-[#063F30]/70 hover:text-[#063F30]"><RotateCcw size={16} /></button>
              <button aria-label="السابق" className="text-[#063F30]/70 hover:text-[#063F30]"><SkipBack size={18} /></button>
              <button
                onClick={togglePlayAudio}
                aria-label="تشغيل أو إيقاف"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#063F30] text-white shadow hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="mr-0.5" />}
              </button>
              <button aria-label="التالي" className="text-[#063F30]/70 hover:text-[#063F30]"><SkipForward size={18} /></button>
              <button aria-label="تخطي للأمام" className="text-[#063F30]/70 hover:text-[#063F30]"><RotateCcw size={16} className="-scale-x-100" /></button>
            </div>

            <div className="mt-2 flex w-full items-center gap-3 text-[11px] text-[#063F30]/70">
              <span>03:45</span>
              <div className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-[#DCEAE2]">
                <div className="absolute h-full w-[35%] bg-[#063F30] rounded-full"></div>
              </div>
              <span>18:20</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Volume2 size={16} className="text-[#063F30]/70" />
            <div className="hidden h-1.5 w-24 cursor-pointer overflow-hidden rounded-full bg-[#DCEAE2] sm:block">
              <div className="h-full w-[75%] bg-[#063F30]"></div>
            </div>
            <span className="rounded-lg bg-[#E3EEE8] px-2.5 py-1 text-[10px] font-bold text-[#063F30]">1.0x</span>
          </div>
        </div>
      </div>

      {/* نافذة إنشاء العداد المخصص (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E3EEE8] pb-4">
              <h3 className="text-xl font-bold text-[#063F30]">إنشاء عداد ذكر مخصص</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="إغلاق"
                className="grid h-8 w-8 place-items-center rounded-full bg-[#E3EEE8] text-[#063F30] hover:bg-[#d4e6dc]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCard} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#063F30] mb-2">نص الذكر أو الدعاء:</label>
                <textarea
                  rows={3}
                  required
                  value={newCardText}
                  onChange={(e) => setNewCardText(e.target.value)}
                  placeholder="اكتب الذكر هنا، مثلاً: (سبحان الله العظيم وبحمده)..."
                  className="w-full rounded-xl border border-[#DCEAE2] bg-[#F7FCF9] p-3 text-xs text-[#063F30] outline-none focus:border-[#063F30]"
                  style={QURAN}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#063F30] mb-2">العدد المستهدف للتسبيح:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newCardTarget}
                    onChange={(e) => setNewCardTarget(e.target.value)}
                    className="w-full rounded-xl border border-[#DCEAE2] bg-[#F7FCF9] p-3 text-xs text-[#063F30] outline-none focus:border-[#063F30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#063F30] mb-2">وسم العداد (التصنيف):</label>
                  <input
                    type="text"
                    value={newCardLabel}
                    onChange={(e) => setNewCardLabel(e.target.value)}
                    placeholder="مثلاً: ورد المساء"
                    className="w-full rounded-xl border border-[#DCEAE2] bg-[#F7FCF9] p-3 text-xs text-[#063F30] outline-none focus:border-[#063F30]"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#E3EEE8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-[#E3EEE8] px-5 py-2.5 text-xs font-bold text-[#063F30] hover:bg-[#d4e6dc]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#063F30] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#084e3c]"
                >
                  حفظ وإضافة العداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}