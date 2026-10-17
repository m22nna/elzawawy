import FeaturedAudio from "../../components/FeaturedAudio";
import { AudioProvider } from "./audio/AudioContext";
import DailyWird from "../../components/DailyWird";
import Navbar from "../../components/NavBar";
import Hero from "../../components/Hero";
import QuickDashboard from "../../components/QuickDashboard";

export function HomePage() {
  return (
   <>
    <Navbar />
    <Hero />
    <QuickDashboard />
    <AudioProvider>
      <FeaturedAudio />
      <DailyWird />
    </AudioProvider>
   </>
  );
}

export default HomePage;