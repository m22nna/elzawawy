import DailyHadith from "./DailyHadith";
import Navbar from "../NavBar";
import HadithTopics from "./HadithTopics";
import HadithFooter from "./HadithFooter";
import HadithVoiceBar from "./HadithVoiceBar";
export function AhadithHomePage() {
  return (
    <>
      <Navbar />
      <DailyHadith />
      <HadithTopics />
      <HadithFooter />
      <HadithVoiceBar />
    </>
  );
}

export default AhadithHomePage;