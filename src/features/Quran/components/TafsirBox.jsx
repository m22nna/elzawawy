import { Lightbulb } from "lucide-react";
import { useTafsir } from "../hooks/useQuranData";
import { arNum, surahTitle } from "../utils";

export default function TafsirBox({ surah, ayah }) {
  const { data, error, loading } = useTafsir(surah.id, ayah);

  return (
    <section className="mt-6 rounded-2xl border border-[#C6923433] bg-[#F7EDE0]/60 p-5">
      <h3 className="flex items-center gap-2 text-xs font-extrabold text-pine">
        <Lightbulb size={14} className="text-bronze" />
        التفسير الميسر • {surahTitle(surah)} • آية {arNum(ayah)}
      </h3>

      {loading && <div className="mt-3 h-12 animate-pulse rounded-lg bg-[#C6923420]" />}
      {error && <p className="mt-3 text-xs text-red-600">تعذّر تحميل التفسير، حاولي مرة أخرى بعد قليل.</p>}
      {data && <p className="mt-3 text-sm leading-8 text-pine/80">{data.text}</p>}

      <p className="mt-3 text-[10px] text-muted"> جميع الحقوق محفوظة للمحتوى القرآني والنبوي الشريف © ١٤٤٧ هـ </p>
    </section>
  );
}