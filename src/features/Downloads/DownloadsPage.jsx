import { useMemo, useState } from "react";
import Navbar from "../../components/NavBar";
import { Container } from "../../components/ui";
import { AudioProvider, useAudio } from "../Home/audio/AudioContext";
import { FILTERS, useDownloads } from "./useDownloads";
import DownloadsHeader from "./components/DownloadsHeader";
import DownloadsToolbar from "./components/DownloadsToolbar";
import DownloadsList from "./components/DownloadsList";

function Page() {
  const { items, pause, resume, remove, getUrl } = useDownloads();
  const audio = useAudio();

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((f) => [
          f.key,
          f.key === "all"
            ? items.length
            : items.filter((i) => i.category === f.key).length,
        ])
      ),
    [items]
  );

  const shown = items.filter(
    (i) =>
      (filter === "all" || i.category === filter) &&
      (!query.trim() ||
        i.title.toLowerCase().includes(query.trim().toLowerCase()))
  );

  const play = async (item) => {
    if (audio.current?.id === item.id) {
      return audio.toggle(audio.current);
    }

    const audioUrl = (await getUrl(item.id)) ?? item.url;

    audio.toggle({
      id: item.id,
      audioUrl,
      title: item.title,
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F2F7F4] pb-24 font-body">
      <Navbar />

      <Container className="py-10 lg:max-w-6xl">
        <DownloadsHeader />

        <DownloadsToolbar
          filter={filter}
          onFilter={setFilter}
          query={query}
          onQuery={setQuery}
          counts={counts}
        />

        {items.length > 0 && shown.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#E6EFE9] bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-base font-bold text-pine">
لا توجد نتائج مطابقة لبحثك
            </p>

            <p className="mt-2 text-sm text-muted">
حاول البحث باستخدام كلمة أخرى          </p>
          </div>
        ) : (
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
        )}
      </Container>
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

