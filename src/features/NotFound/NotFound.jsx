import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-8xl font-bold text-green-700">404</h1>

      <h2 className="text-2xl font-bold mt-4">
        الصفحة غير موجودة
      </h2>

      <p className="text-gray-500 mt-3 max-w-md">
        عذرًا، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-xl bg-green-700 text-white hover:bg-green-800 transition"
      >
        العودة للرئيسية
      </Link>
    </main>
  );
}