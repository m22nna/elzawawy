import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "./features/Home/HomePage";
import AdhkarSection from "./features/Home/AdhkarSection";

import DownloadsPage from "./features/Downloads/DownloadsPage";
import QuranPage from "./features/Quran/QuranPage";
import ShortsPage from "./features/Shorts/ShortsPage";


import PrayerTimesPage from './components/PrayerTimesPage';
import AhadithHomePage from "./components/Ahadees/AhadithHomePage";
import TafseerHomePage from "./components/TafseerAhadith/TafseerHomePage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function HashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
    if (hash === "adhkar" || hash === "azkar") {
      navigate("/adhkar", { replace: true });
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <HashRedirect />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/adhkar" element={<AdhkarSection />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/quran/*" element={<QuranPage />} />
        <Route path="/shorts" element={<ShortsPage />} />
        <Route path="/azkar" element={<Navigate to="/adhkar" replace />} />
        <Route path="/prayers" element={<PrayerTimesPage />} />
        <Route path="/ahadith" element={<AhadithHomePage />} />
        <Route path="/tafseerhadith/:order?" element={<TafseerHomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );

}

