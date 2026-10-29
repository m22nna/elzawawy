import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "./features/Home/HomePage";
import AdhkarSection from "./features/Home/AdhkarSection";
import PrayerTimesPage from './components/PrayerTimesPage';
import AhadithHomePage from "./components/Ahadees/AhadithHomePage";
import TafseerHomePage from "./components/TafseerAhadith/TafseerHomePage";
import RamadanPage from './features/ramadan/RamadanPage';
import TafseerPage from './features/tafseer/TafseerPage';
import { AudioProvider } from './context/AudioContext';
import AudioPlayer from './components/AudioPlayer';

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
    <AudioProvider>
      <BrowserRouter>
        <ScrollToTop />
        <HashRedirect />
        <div className="min-h-screen flex flex-col pb-36 md:pb-40">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/adhkar" element={<AdhkarSection />} />
            <Route path="/azkar" element={<Navigate to="/adhkar" replace />} />
            <Route path="/prayers" element={<PrayerTimesPage />} />
            <Route path="/ahadith" element={<AhadithHomePage />} />
            <Route path="/tafseerhadith" element={<TafseerHomePage />} />
            <Route path="/ramadan" element={<RamadanPage />} />
            <Route path="/tafseer" element={<TafseerPage />} />
            <Route path="/quran" element={<TafseerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <AudioPlayer />
      </BrowserRouter>
    </AudioProvider>
  );
}
