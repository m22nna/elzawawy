import { Link } from "react-router-dom";
import { CloudDownload } from "lucide-react";

export default function DownloadsHeader() {
  return (
    <>
      <p className="text-[11px] text-muted">
        <Link to="/" className="font-bold text-pine hover:underline">
          الرئيسية
        </Link>{" "}
        › التنزيلات
      </p>
      <header className="mt-4">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold text-bronze">
          <CloudDownload size={13} />
          المكتبة المحفوظة دون اتصال
        </p>
        <h1 className="text-3xl font-extrabold text-pine">التنزيلات</h1>
        <p className="mt-2 text-xs text-muted">
          محتواك المحفوظ للاستماع والمشاهدة في أي وقت ودون الحاجة للاتصال بالشبكة.
        </p>
      </header>
    </>
  );
}