import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/NavBar';
import AyahNumber from '../../components/AyahNumber';
import {
  getSurahs,
  getSurahAyahs,
  getAyahTafsir,
  getTafsirSources,
  searchTafsir,
  normalizeArabic,
  toArabicNumerals
} from '../../services/tafsirService';
import { 
  Home, 
  ChevronLeft, 
  Search, 
  X, 
  BookOpen, 
  Volume2, 
  Play,
  Pause,
  Copy, 
  Check, 
  ExternalLink, 
  Bookmark,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Share2,
  FilePlus,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const TafseerPage = () => {
  // Global Audio Player integration
  const { playTrack, currentTrack, isPlaying } = useAudio();

  // Surahs list and current selection
  const [surahs, setSurahs] = useState([]);
  const [surahsLoading, setSurahsLoading] = useState(true);
  const [selectedSurahId, setSelectedSurahId] = useState(18); // Default: Surah Al-Kahf (18)
  const [selectedAyahNumber, setSelectedAyahNumber] = useState(1);
  const [selectedSourceId, setSelectedSourceId] = useState('ar.muyassar');

  // Active Tafseer source list
  const tafsirSources = useMemo(() => getTafsirSources(), []);

  // Quran verse and Tafsir data
  const [ayahsList, setAyahsList] = useState([]);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [tafsirData, setTafsirData] = useState(null);
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');

  // Copy & Share states
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // 1. Fetch Surahs List on component mount
  useEffect(() => {
    let isMounted = true;
    async function loadSurahs() {
      try {
        setSurahsLoading(true);
        const data = await getSurahs();
        if (isMounted) {
          setSurahs(data);
        }
      } catch (err) {
        console.error('Error loading surahs:', err);
      } finally {
        if (isMounted) setSurahsLoading(false);
      }
    }
    loadSurahs();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Ayahs for selected surah
  useEffect(() => {
    let isMounted = true;
    async function loadAyahs() {
      try {
        const data = await getSurahAyahs(selectedSurahId);
        if (isMounted) {
          setAyahsList(data);
        }
      } catch (err) {
        console.error(`Error loading ayahs for surah ${selectedSurahId}:`, err);
      }
    }
    loadAyahs();
    return () => { isMounted = false; };
  }, [selectedSurahId]);

  // Current active surah metadata
  const currentSurah = useMemo(() => {
    return surahs.find(s => Number(s.id) === Number(selectedSurahId)) || {
      id: 18,
      nameArabic: 'الكهف',
      ayahCount: 110,
      revelationPlace: 'Makkah'
    };
  }, [surahs, selectedSurahId]);

  const totalAyahs = currentSurah?.ayahCount || 110;

  // Filtered surahs for the dropdown list live as user types in the search bar
  const displayedSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const term = normalizeArabic(searchQuery).replace(/^سوره\s+/, '').trim();
    const matched = surahs.filter(s => {
      const sNorm = normalizeArabic(s.nameArabic);
      const sEng = (s.nameEnglish || '').toLowerCase();
      return sNorm.includes(term) || sEng.includes(term.toLowerCase());
    });

    if (matched.length === 0) return surahs;

    // Ensure currently selected surah is included in dropdown so selection stays valid
    if (!matched.some(s => Number(s.id) === Number(selectedSurahId))) {
      const current = surahs.find(s => Number(s.id) === Number(selectedSurahId));
      if (current) return [current, ...matched];
    }
    return matched;
  }, [surahs, searchQuery, selectedSurahId]);

  // 3. Fetch Tafsir and Ayah text when selectedSurahId, selectedAyahNumber, or selectedSourceId changes
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch Tafsir from API
        const tafsirRes = await getAyahTafsir(selectedSurahId, selectedAyahNumber, selectedSourceId);
        
        // Find or fallback current Ayah text
        let ayahObj = ayahsList.find(a => Number(a.ayahNumber) === Number(selectedAyahNumber));
        if (!ayahObj) {
          const freshAyahs = await getSurahAyahs(selectedSurahId);
          ayahObj = freshAyahs.find(a => Number(a.ayahNumber) === Number(selectedAyahNumber));
        }

        if (isMounted) {
          setTafsirData(tafsirRes);
          if (ayahObj) {
            setCurrentAyah(ayahObj);
          }
        }
      } catch (err) {
        console.error('Error fetching tafsir details:', err);
        if (isMounted) {
          setError('تعذر تحميل بيانات التفسير. يرجى التحقق من الاتصال بالإنترنت والمحاولة مجدداً.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [selectedSurahId, selectedAyahNumber, selectedSourceId, ayahsList]);

  // Search Action
  const handleSearch = async () => {
    if (!searchQuery || !searchQuery.trim()) {
      handleClearSearch();
      return;
    }

    const trimmed = searchQuery.trim();
    const term = normalizeArabic(trimmed).replace(/^سوره\s+/, '').trim();
    setIsSearching(true);
    setSearchMessage('');

    try {
      // a) First check if search term matches any Surah name
      const matchedSurah = surahs.find(s => {
        const sNorm = normalizeArabic(s.nameArabic);
        const sEng = (s.nameEnglish || '').toLowerCase();
        return sNorm === term || sNorm.includes(term) || sEng === term.toLowerCase();
      });

      if (matchedSurah) {
        setSelectedSurahId(matchedSurah.id);
        setSelectedAyahNumber(1);
        setSearchResults(null);
        setSearchMessage(`تم الانتقال تلقائياً إلى سورة ${matchedSurah.nameArabic}`);
        setIsSearching(false);
        return;
      }

      // b) If verse text or keyword, search ayahs in the current surah
      const results = await searchTafsir(trimmed, selectedSurahId);
      const ayahMatches = results.filter(r => r.type === 'ayah');

      if (ayahMatches.length > 0) {
        // Automatically jump to first matching ayah
        setSelectedAyahNumber(ayahMatches[0].ayahNumber);
        setSearchResults(ayahMatches);
        setSearchMessage(`تم العثور على ${toArabicNumerals(ayahMatches.length)} آية مطابقة في سورة ${currentSurah?.nameArabic}. تم الانتقال إلى الآية ${toArabicNumerals(ayahMatches[0].ayahNumber)}.`);
      } else {
        setSearchResults([]);
        setSearchMessage(`لم يتم العثور على آيات أو سور مطابقة لـ "${trimmed}".`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchMessage('حدث خطأ أثناء إجراء البحث.');
    } finally {
      setIsSearching(false);
    }
  };

  // Clear Action
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchMessage('');
  };

  // Navigation handlers
  const handlePrevAyah = () => {
    if (selectedAyahNumber > 1) {
      setSelectedAyahNumber(prev => prev - 1);
    }
  };

  const handleNextAyah = () => {
    if (selectedAyahNumber < totalAyahs) {
      setSelectedAyahNumber(prev => prev + 1);
    }
  };

  const handleSurahChange = (e) => {
    const newSurahId = Number(e.target.value);
    setSelectedSurahId(newSurahId);
    setSelectedAyahNumber(1); // Reset to first ayah of chosen surah
    setSearchResults(null);
    setSearchMessage('');
  };

  const handleAyahChange = (e) => {
    setSelectedAyahNumber(Number(e.target.value));
  };

  const handleSourceChange = (sourceId) => {
    setSelectedSourceId(sourceId);
  };

  // Copy Verse Text
  const handleCopyAyah = () => {
    const textToCopy = currentAyah?.textUthmani || 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا';
    const citation = `\n[سورة ${currentSurah?.nameArabic} - الآية ${toArabicNumerals(selectedAyahNumber)}]`;
    navigator.clipboard.writeText(`${textToCopy} ${citation}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `تفسير سورة ${currentSurah?.nameArabic} - الآية ${toArabicNumerals(selectedAyahNumber)}`,
        text: `${currentAyah?.textUthmani || ''}\n\nالتفسير: ${tafsirData?.text || ''}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  // Active source object
  const currentSource = useMemo(() => {
    return tafsirSources.find(s => s.id === selectedSourceId) || tafsirSources[0];
  }, [tafsirSources, selectedSourceId]);

  // Calculate verse words and letters count
  const ayahWordCount = useMemo(() => {
    const text = currentAyah?.textUthmani || '';
    return text.trim() ? text.trim().split(/\s+/).length : 12;
  }, [currentAyah]);

  const ayahLetterCount = useMemo(() => {
    const text = currentAyah?.textUthmani || '';
    return text.replace(/\s+/g, '').length || 58;
  }, [currentAyah]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7f6] text-gray-800 p-4 md:p-8 pb-36 md:pb-40 font-sans" dir="rtl">
        {/* Breadcrumb Navigation */}
        <nav className="max-w-7xl mx-auto mb-6 flex items-center justify-between text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-[#e9f0ec] px-4 py-1.5 rounded-full text-gray-700 font-medium">
            <span className="flex items-center gap-1 font-semibold text-gray-800">
              <Home className="w-3.5 h-3.5 text-emerald-800" />
              الرئيسية
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span>القرآن الكريم</span>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold text-[#0b3b2c]">التفسير</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#e2ede7] text-[#0b3b2c] px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#8b6528] inline-block" />
            <span>المرجع المعتمد للتحقيق والتفسير</span>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto space-y-6 pb-6">
          {/* Header Section */}
          <div className="text-right space-y-2 mb-2">
            <div className="flex items-center gap-2 justify-start">
              <span className="w-1.5 h-8 bg-[#0b3b2c] rounded-full inline-block" />
              <h1 className="text-3xl md:text-4xl font-black text-[#0b3b2c]">
                تفسير القرآن الكريم
              </h1>
            </div>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-3xl pr-3.5 font-light">
              تعرّف على معاني الآيات بالرجوع إلى كتب التفسير المعتمدة بصوت وتوجيه فضيلة الشيخ عبدالرحمن الزواوي، مع دراسات تأصيلية مستفيضة لبيان مراد الله تعالى.
            </p>
          </div>

          {/* Filter and Search Box Container Card */}
          <section className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-gray-100 space-y-5">
            {/* Search Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative flex items-center w-full"
            >
              <Search className="absolute right-4 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="ابحث عن سورة أو آية أو كلمة قرآنية في كتب التفسير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="w-full bg-[#f3f7f5] text-gray-800 placeholder-gray-400 pr-12 pl-28 py-3.5 rounded-2xl border border-transparent focus:border-emerald-500 focus:bg-white text-xs md:text-sm transition-all outline-none"
              />
              <div className="absolute left-3 flex items-center gap-2">
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={handleClearSearch} 
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="مسح البحث"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="bg-[#103e2e] hover:bg-[#0a2c20] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>بحث</span>
                </button>
              </div>
            </form>

            {/* Live Search Results / Notifications Bar */}
            {searchMessage && (
              <div className="text-xs text-[#0b3b2c] bg-[#eef7f2] px-4 py-2.5 rounded-xl border border-emerald-100 flex items-center justify-between gap-2">
                <span>{searchMessage}</span>
                <button 
                  onClick={() => setSearchMessage('')} 
                  className="text-gray-400 hover:text-gray-600"
                  title="إغلاق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Matching Ayahs List */}
            {searchResults && searchResults.length > 0 && (
              <div className="bg-[#f5faf7] rounded-2xl p-3 border border-emerald-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[#0b3b2c] flex items-center gap-1 pl-1">
                  <Bookmark className="w-3.5 h-3.5 text-[#8b6528]" />
                  الآيات المطابقة:
                </span>
                {searchResults.slice(0, 10).map((r) => (
                  <button
                    key={r.ayahNumber}
                    type="button"
                    onClick={() => setSelectedAyahNumber(r.ayahNumber)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      selectedAyahNumber === r.ayahNumber
                        ? 'bg-[#103e2e] text-white shadow-sm'
                        : 'bg-white hover:bg-emerald-100 text-[#0b3b2c] border border-emerald-200'
                    }`}
                  >
                    الآية {toArabicNumerals(r.ayahNumber)}
                  </button>
                ))}
              </div>
            )}

            {/* Selectors Row (RTL: Surah -> Ayah -> Tafseer -> Button) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Surah Selection */}
              <div className="md:col-span-4 text-right space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 block pr-1">
                  السورة الكريمة {searchQuery.trim() && displayedSurahs.length < surahs.length ? `(مفلترة: ${toArabicNumerals(displayedSurahs.length)})` : ''}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute right-3 w-7 h-7 rounded-lg bg-[#103e2e] text-white text-xs font-bold flex items-center justify-center z-10">
                    {toArabicNumerals(selectedSurahId)}
                  </span>
                  <select 
                    value={selectedSurahId}
                    onChange={handleSurahChange}
                    className="w-full appearance-none bg-[#edf6f2] text-gray-800 font-bold py-3 pr-12 pl-8 rounded-2xl border border-transparent text-xs md:text-sm outline-none cursor-pointer"
                  >
                    {displayedSurahs.length > 0 ? (
                      displayedSurahs.map((s) => (
                        <option key={s.id} value={s.id}>
                          سورة {s.nameArabic} ({s.revelationPlace === 'Makkah' ? 'مكية' : 'مدنية'} • {toArabicNumerals(s.ayahCount)} آية)
                        </option>
                      ))
                    ) : (
                      <option value={selectedSurahId}>
                        سورة {currentSurah.nameArabic} ({toArabicNumerals(totalAyahs)} آية)
                      </option>
                    )}
                  </select>
                  <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Ayah Selection */}
              <div className="md:col-span-2 text-right space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 block pr-1">رقم الآية</label>
                <div className="relative">
                  <select 
                    value={selectedAyahNumber}
                    onChange={handleAyahChange}
                    className="w-full appearance-none bg-[#edf6f2] text-gray-800 font-bold py-3 px-4 pr-3 rounded-2xl border border-transparent text-xs md:text-sm outline-none cursor-pointer"
                  >
                    {Array.from({ length: totalAyahs }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        الآية: {toArabicNumerals(num)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Tafseer Source Selection */}
              <div className="md:col-span-4 text-right space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 block pr-1">مصدر التفسير المعتمد</label>
                <div className="relative">
                  <BookOpen className="absolute right-3 top-3.5 w-4 h-4 text-[#8b6528] z-10" />
                  <select 
                    value={selectedSourceId}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="w-full appearance-none bg-[#edf6f2] text-gray-800 font-bold py-3 pr-10 pl-8 rounded-2xl border border-transparent text-xs md:text-sm outline-none cursor-pointer"
                  >
                    {tafsirSources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* View Button */}
              <div className="md:col-span-2">
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedAyahNumber(prev => Number(prev));
                  }}
                  className="w-full bg-[#103e2e] hover:bg-[#0a2c20] text-white text-xs md:text-sm font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>عرض التفسير</span>
                </button>
              </div>
            </div>

            {/* Ayah Meta Info Bar */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] md:text-xs text-gray-500 font-medium gap-2">
              <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                <Bookmark className="w-3.5 h-3.5 text-[#8b6528]" />
                <span>موقع الآية:</span>
                <span className="text-gray-900 font-black">
                  {currentAyah?.pageNumber ? `الصفحة ${toArabicNumerals(currentAyah.pageNumber)}` : 'الجزء الخامس عشر'}
                </span>
                <span>•</span>
                <span>سورة {currentSurah?.nameArabic}</span>
                <span>•</span>
                <span>الآية {toArabicNumerals(selectedAyahNumber)} من {toArabicNumerals(totalAyahs)}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-400">
                <span>نوع السورة: {currentSurah?.revelationPlace === 'Makkah' ? 'مكية' : 'مدنية'}</span>
                <span>•</span>
                <span>عدد كلماتها: {toArabicNumerals(ayahWordCount)}</span>
                <span>•</span>
                <span>عدد حروفها: {toArabicNumerals(ayahLetterCount)}</span>
              </div>
            </div>
          </section>

          {/* Verse Display Card */}
          <section className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-8 text-center">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 pb-4">
              <div className="bg-[#e9f3ee] text-[#0b3b2c] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">✓</span>
                <span>سورة {currentSurah?.nameArabic} • الآية {toArabicNumerals(selectedAyahNumber)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => {
                    const surahName = currentSurah?.nameArabic || 'الكهف';
                    const audioUrl = `http://173.212.246.222:8090/%D8%A7%D9%84%D8%AE%D8%AA%D9%85%D8%A9%20%D8%A7%D9%84%D8%B1%D9%85%D8%B6%D8%A7%D9%86%D9%8A%D8%A9/2026/%7B${selectedSurahId}%7D%20%D8%B3%D9%88%D8%B1%D8%A9%20${encodeURIComponent(surahName)}.mp3`;
                    playTrack({
                      id: `surah_${selectedSurahId}`,
                      title: `سورة ${surahName} • الآية ${toArabicNumerals(selectedAyahNumber)}`,
                      reciter: 'فضيلة الشيخ عبدالرحمن الزواوي',
                      audioUrl
                    });
                  }}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isPlaying && currentTrack?.id === `surah_${selectedSurahId}`
                      ? 'bg-[#103e2e] text-white shadow-sm'
                      : 'bg-[#eef5f1] hover:bg-[#e2ede7] text-[#0b3b2c]'
                  }`}
                  title="استماع للتلاوة المباركة"
                >
                  {isPlaying && currentTrack?.id === `surah_${selectedSurahId}` ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#0b3b2c]" />
                  )}
                  <span>
                    {isPlaying && currentTrack?.id === `surah_${selectedSurahId}`
                      ? 'إيقاف التلاوة'
                      : 'استماع للتلاوة بصوت الشيخ عبدالرحمن الزواوي'}
                  </span>
                </button>

                <button 
                  onClick={handleCopyAyah}
                  className="bg-[#eef5f1] hover:bg-[#e2ede7] text-[#0b3b2c] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#0b3b2c]" />}
                  <span>{copied ? 'تم نسخ الآية!' : 'نسخ الآية'}</span>
                </button>

                <a 
                  href={`#ayah-${selectedAyahNumber}`}
                  className="bg-[#eef5f1] hover:bg-[#e2ede7] text-[#0b3b2c] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#0b3b2c]" />
                  <span>عرض في المصحف</span>
                </a>
              </div>
            </div>

            {/* Quranic Text */}
            <div className="py-8 md:py-12 px-4 space-y-6">
              {/* Basmalah for start of surahs (except At-Tawbah 9) */}
              {selectedAyahNumber === 1 && selectedSurahId !== 9 && (
                <p className="text-xl md:text-2xl font-serif text-gray-600 tracking-widest font-medium">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              )}

              {loading && !currentAyah ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0b3b2c]" />
                  <span className="text-sm font-semibold text-gray-500">جاري تحميل نص الآية الكريمة...</span>
                </div>
              ) : (
                <div className="text-3xl md:text-5xl font-serif text-[#0b3b2c] leading-loose md:leading-[2.4] font-black tracking-wide my-4 flex items-center justify-center flex-wrap gap-2">
                  <span>﴿ {currentAyah?.textUthmani || 'ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَـٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجَا ۜ'}</span>
                  <AyahNumber number={toArabicNumerals(selectedAyahNumber)} size={48} className="mx-2" />
                  <span>﴾</span>
                </div>
              )}

              <div className="flex justify-center pt-2">
                <div className="w-6 h-6 border-t-2 border-r-2 border-[#8b6528] transform rotate-45 opacity-60" />
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <button 
                onClick={handlePrevAyah}
                disabled={selectedAyahNumber <= 1}
                className={`text-xs md:text-sm font-semibold px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all ${
                  selectedAyahNumber <= 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#103e2e] hover:bg-[#0a2c20] text-white shadow-sm cursor-pointer'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>الآية السابقة {selectedAyahNumber > 1 ? `(${toArabicNumerals(selectedAyahNumber - 1)})` : ''}</span>
              </button>

              <div className="bg-[#e9f0ec] text-gray-700 text-xs font-bold px-4 py-2 rounded-full">
                الآية {toArabicNumerals(selectedAyahNumber)} من {toArabicNumerals(totalAyahs)}
              </div>

              <button 
                onClick={handleNextAyah}
                disabled={selectedAyahNumber >= totalAyahs}
                className={`text-xs md:text-sm font-semibold px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all ${
                  selectedAyahNumber >= totalAyahs 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#103e2e] hover:bg-[#0a2c20] text-white shadow-sm cursor-pointer'
                }`}
              >
                <span>الآية التالية {selectedAyahNumber < totalAyahs ? `(${toArabicNumerals(selectedAyahNumber + 1)})` : ''}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Tafseer Detail Text Section */}
          <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6 text-right">
            {/* Tafseer Header and Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0b3b2c]" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#0b3b2c]">
                    تفسير الآية الكريمة
                  </h2>
                </div>
                
                <h3 className="text-xs md:text-sm font-bold text-gray-700">
                  {currentSource.fullName}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 pt-1">
                  <span className="bg-[#f3f7f5] px-2.5 py-1 rounded-lg border border-gray-200">
                    {currentSource.edition}
                  </span>
                  <span className="bg-[#f3f7f5] px-2.5 py-1 rounded-lg border border-gray-200">
                    سورة {currentSurah?.nameArabic} • الآية {toArabicNumerals(selectedAyahNumber)}
                  </span>
                  <span className="bg-[#eef6f2] text-[#0b3b2c] font-semibold px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    توثيق معتمد
                  </span>
                </div>
              </div>

              {/* Tafseer Quick Tabs */}
              <div className="flex flex-wrap items-center gap-2 bg-[#f4f7f6] p-1.5 rounded-2xl">
                {tafsirSources.slice(0, 3).map((source) => (
                  <button 
                    key={source.id}
                    onClick={() => handleSourceChange(source.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSourceId === source.id 
                        ? 'bg-[#103e2e] text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center justify-between gap-3 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => setSelectedAyahNumber(prev => Number(prev))} 
                  className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-xs hover:bg-red-700 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0b3b2c]" />
                <p className="text-sm font-semibold text-gray-500">جاري جلب نص التفسير المعتمد من الخادم...</p>
              </div>
            ) : (
              <>
                {/* Primary Explanation Text from Backend API */}
                <div className="text-gray-800 text-sm md:text-base leading-relaxed md:leading-[2.2] space-y-4 font-normal">
                  <p className="bg-[#fbfcfa] p-5 rounded-2xl border border-gray-100 shadow-inner">
                    {tafsirData?.text || 'لا يتوفر تفسير مسجل لهذه الآية حالياً.'}
                  </p>
                </div>

                {/* Callout Box: فوائد وتدبرات الآية */}
                <div className="bg-[#f3f7f5] rounded-2xl p-5 border border-emerald-50 space-y-2">
                  <div className="flex items-center gap-2 text-[#8b6528] font-bold text-xs md:text-sm">
                    <Lightbulb className="w-4 h-4" />
                    <span>فوائد وتدبرات الآية</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed pr-6">
                    الآية الكريمة تقرر الحمد لله على إنزال القرآن هدايةً واستقامةً، وتؤكد على تمام حفظه من أي عوج أو اضطراب، ليكون حجة قائمة على الخلق أجمعين.
                  </p>
                </div>
              </>
            )}

            {/* Footer Source Citation & Share Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-3.5 h-3.5 text-[#8b6528]" />
                <span>
                  المصدر: {currentSource.fullName}، سورة {currentSurah?.nameArabic}، الآية {toArabicNumerals(selectedAyahNumber)}.
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-600 font-medium">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-[#0b3b2c] transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{shared ? 'تم نسخ الرابط!' : 'مشاركة الفائدة'}</span>
                </button>
                <span>•</span>
                <button 
                  onClick={() => alert('تمت إضافة الفائدة إلى ملاحظاتك الشخصية')}
                  className="flex items-center gap-1.5 hover:text-[#0b3b2c] transition-colors cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>إضافة إلى الملاحظات</span>
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Continuation / Next Verses Quick Bar */}
          <section className="bg-[#e9f2ee] rounded-[2rem] p-6 md:p-8 border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 text-right">
              <h3 className="text-lg font-bold text-[#0b3b2c]">
                مواصلة تلاوة وتفسير سورة {currentSurah?.nameArabic}
              </h3>
              <p className="text-xs text-gray-600">
                انتقل مباشرة إلى الآيات التالية من هذا الموضع لمواصلة تدبر معاني السورة
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: 4 }, (_, i) => selectedAyahNumber + i + 1)
                .filter(num => num <= totalAyahs)
                .map(num => (
                  <button 
                    key={num}
                    onClick={() => setSelectedAyahNumber(num)}
                    className="bg-white hover:bg-emerald-50 text-[#0b3b2c] font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-100 transition-colors cursor-pointer"
                  >
                    الآية {toArabicNumerals(num)}
                  </button>
                ))}

              <button 
                onClick={() => setSelectedAyahNumber(1)}
                className="bg-[#103e2e] hover:bg-[#0a2c20] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors mr-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>العودة لأول السورة</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default TafseerPage;