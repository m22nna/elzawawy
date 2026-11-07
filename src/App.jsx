import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Footer from "./components/Footer";

import { lazy, Suspense, useEffect } from "react";

import { AudioProvider } from "./context/AudioContext";
import AudioPlayer from "./components/AudioPlayer";

// Lazy Loading
const HomePage = lazy(() =>
  import("./features/Home/HomePage").then((module) => ({
    default: module.HomePage,
  }))
);

const AdhkarSection = lazy(() =>
  import("./features/Home/AdhkarSection")
);

const PrayerTimesPage = lazy(() =>
  import("./components/PrayerTimesPage")
);

const AhadithHomePage = lazy(() =>
  import("./components/Ahadees/AhadithHomePage")
);

const TafseerHomePage = lazy(() =>
  import("./components/TafseerAhadith/TafseerHomePage")
);

const RamadanPage = lazy(() =>
  import("./features/ramadan/RamadanPage")
);

const TafseerPage = lazy(() =>
  import("./features/tafseer/TafseerPage")
);

const QuranPage = lazy(() =>
  import("./features/Quran/QuranPage")
);

const ShortsPage = lazy(() =>
  import("./features/Shorts/ShortsPage")
);

const DownloadsPage = lazy(() =>
  import("./features/Downloads/DownloadsPage")
);

const NotFound = lazy(() =>
  import("./features/NotFound/NotFound")
);


const AudioLibraryPage = lazy(() =>
  import("./features/Audio/AudioLibraryPage")
);

const SearchPage = lazy(() =>
  import("./features/Search/SearchPage")
);

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
    } else if (hash === "tafsir" || hash === "tafseer") {
      navigate("/tafseer", { replace: true });
    } else if (hash === "ramadan") {
      navigate("/ramadan", { replace: true });
    }
  }, [navigate]);

  return null;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>جاري تحميل الصفحة...</p>
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <ScrollToTop />
        <HashRedirect />

        <div className="min-h-screen flex flex-col pb-36 md:pb-40">
          <main className="flex-1">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/adhkar" element={<AdhkarSection />} />
              <Route path="/azkar" element={<Navigate to="/adhkar" replace />} />
              <Route path="/prayers" element={<PrayerTimesPage />} />
              <Route path="/ahadith" element={<AhadithHomePage />} />
              <Route path="/tafseerhadith/:order?" element={<TafseerHomePage />} />
              <Route path="/tafseerhadith" element={<TafseerHomePage />} />
              <Route path="/ramadan" element={<RamadanPage />} />
              <Route path="/tafseer" element={<TafseerPage />} />
              <Route path="/tafsir" element={<Navigate to="/tafseer" replace />} />
              <Route path="/quran" element={<QuranPage />} />
              <Route path="/quran/*" element={<QuranPage />} />
              <Route path="/shorts" element={<ShortsPage />} />
              <Route path="/downloads" element={<DownloadsPage />} />
              <Route path="/audio" element={<AudioLibraryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </main>

          <Footer />
        </div>

        <AudioPlayer />
      </BrowserRouter>
    </AudioProvider>
  );
}