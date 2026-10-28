import { useMemo, useState } from "react";
import Navbar from "../../components/NavBar";
import { Container } from "../../components/ui";
import { AudioProvider, useAudio } from "../Home/audio/AudioContext";
import { FILTERS, useDownloads } from "./useDownloads";
import DownloadsHeader from "./components/DownloadsHeader";
import DownloadsToolbar from "./components/DownloadsToolbar";
import DownloadsList from "./components/DownloadsList";
import MiniPlayer from "./components/MiniPlayer";

function Page() {
  const { items, pause, resume, remove, getUrl } = useDownloads();
  const audio = useAudio();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((f) => [f.key, f.key === "all" ? items.length : items.filter((i) => i.category === f.key).length])
      ),
    [items]
  );

  const shown = items.filter(
    (i) => (filter === "all" || i.category === filter) && (!query.trim() || i.title.includes(query.trim()))
  );

  // بيشغّل من الملف المحفوظ (offline)، ولو مش موجود يشغّل من الرابط الأصلي
  const play = async (item) => {
    if (audio.current?.id === item.id) return audio.toggle(audio.current);
    const audioUrl = (await getUrl(item.id)) ?? item.url;
    audio.toggle({ id: item.id, audioUrl, title: item.title });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F2F7F4] pb-24 font-body">
      <Navbar />
      <Container className="py-10 lg:max-w-6xl">
        <DownloadsHeader />
        <DownloadsToolbar filter={filter} onFilter={setFilter} query={query} onQuery={setQuery} counts={counts} />
        <DownloadsList
          items={shown}
          hasAny={items.length > 0}
          currentId={audio.current?.id}
          playing={audio.playing}
          onPlay={play}
          onPause={pause}
          onResume={resume}
          onRemove={remove}
        />
      </Container>
      <MiniPlayer />
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <AudioProvider>
      <Page />
    </AudioProvider>
  );
}