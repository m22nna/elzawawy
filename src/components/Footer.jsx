import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer dir="rtl" className="mt-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-[#E6EFE9] pt-5 text-[10px] text-muted">
        <span className="flex items-center gap-2 font-bold text-pine">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-pine text-white">
            <BookOpen size={12} />
          </span>
          المنصة الرسمية للشيخ عبدالرحمن الزواوي
        </span>

        <span>
          جميع الحقوق محفوظة للمحتوى القرآني والنبوي الشريف © ١٤٤٨ هـ
        </span>
      </div>
    </footer>
  );
}