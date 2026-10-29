import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  ChevronLeft, 
  ChevronRight,
  Headphones, 
  Calendar, 
  MapPin, 
  Clock, 
  Sunset, 
  Moon,
  CheckCircle2, 
  Play, 
  Pause,
  Download, 
  BookOpen, 
  Video, 
  FileText, 
  Printer,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Share2,
  X,
  Volume2,
  BookMarked,
  Check
} from 'lucide-react';
import ramadanBg from '../../assets/ramadan.jpg';
import Navbar from '../../components/NavBar';
import {
  getRamadanCurrentPlaylist,
  getRamadanImsakiah,
  getKhatmDua,
  getDailyToday,
  getDailyReminders,
  getHadiths,
  getRecitations,
  getImsakiahPdfUrl,
  downloadKhatmPlanPdf,
  toArabicNumerals
} from '../../services/ramadanService';
import { useAudio } from '../../context/AudioContext';

const RamadanPage = () => {
  // Global Audio Context integration
  const { playTrack, togglePlayPause, currentTrack, isPlaying } = useAudio();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Backend dynamic data states
  const [playlist, setPlaylist] = useState(null);
  const [imsakiahData, setImsakiahData] = useState([]);
  const [khatmDuas, setKhatmDuas] = useState([]);
  const [dailyAyah, setDailyToday] = useState(null);
  const [dailyReminders, setDailyReminders] = useState([]);

  // Selected Day state (1 to 30)
  const [selectedDayNumber, setSelectedDayNumber] = useState(4); // Default: 4 Ramadan


  // Modal states for Resources Cards
  const [hadithModalOpen, setHadithModalOpen] = useState(false);
  const [hadithsList, setHadithsList] = useState([]);
  const [hadithsLoading, setHadithsLoading] = useState(false);
  const [copiedHadithIndex, setCopiedHadithIndex] = useState(null);

  const [shortsModalOpen, setShortsModalOpen] = useState(false);
  const [recitationsList, setRecitationsList] = useState([]);
  const [shortsIndex, setShortsIndex] = useState(0);

  // Hijri & Gregorian Year Labels in Arabic Numerals
  const hijriYear = toArabicNumerals(playlist?.hijriYear || 1447);
  const gregorianYear = toArabicNumerals(playlist?.year || 2026);

  // Fetch all dynamic Ramadan data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadRamadanData() {
      try {
        setLoading(true);
        setError(null);

        const [playlistRes, imsakiahRes, duaRes, todayRes, remindersRes] = await Promise.all([
          getRamadanCurrentPlaylist().catch(() => null),
          getRamadanImsakiah(2026).catch(() => []),
          getKhatmDua().catch(() => []),
          getDailyToday().catch(() => null),
          getDailyReminders().catch(() => [])
        ]);

        if (isMounted) {
          if (playlistRes) setPlaylist(playlistRes);
          if (imsakiahRes && imsakiahRes.length > 0) setImsakiahData(imsakiahRes);
          if (duaRes) setKhatmDuas(duaRes);
          if (todayRes) setDailyToday(todayRes);
          if (remindersRes) setDailyReminders(remindersRes);
        }
      } catch (err) {
        console.error('Failed to load Ramadan data:', err);
        if (isMounted) {
          setError('تعذر تحميل بيانات موسم رمضان من الخادم. يرجى التحقق من اتصالك والمحاولة مجدداً.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRamadanData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get data of current selected day
  const activeDayData = useMemo(() => {
    if (!imsakiahData.length) return null;
    return imsakiahData.find(d => d.dayNumber === selectedDayNumber) || imsakiahData[0];
  }, [imsakiahData, selectedDayNumber]);

  // Get night recordings for selected day from playlist
  const activeNightRecordings = useMemo(() => {
    if (!playlist?.days) return [];
    const night = playlist.days.find(d => Number(d.day) === Number(selectedDayNumber));
    return night?.items || [];
  }, [playlist, selectedDayNumber]);

  // Audio Play/Pause handler using global AudioContext
  const handleToggleAudio = (url, trackInfo = null) => {
    if (!url) return;
    if (currentTrack?.audioUrl === url) {
      togglePlayPause();
    } else {
      playTrack({
        id: trackInfo?.id || url,
        title: trackInfo?.title || 'تسجيل رمضاني مبارك',
        reciter: trackInfo?.subtitle || trackInfo?.reciter || 'فضيلة الشيخ عبدالرحمن الزواوي',
        audioUrl: url
      });
    }
  };

  // Card 1: Trigger Taraweeh and Tahajjud audio from playlist
  const handlePlayTaraweehCard = () => {
    const nightItems = activeNightRecordings.length > 0 
      ? activeNightRecordings 
      : (playlist?.days?.[0]?.items || []);

    const audioTrack = nightItems.find(item => item.url) || {
      title: `تراويح وتهجد ${hijriYear} هـ - الليلة الأولى`,
      url: 'http://173.212.246.222:8090/%D8%B1%D9%85%D8%B6%D8%A7%D9%86%202026/%D8%A7%D9%84%D9%84%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%A3%D9%88%D9%84%D9%89%20%D8%B1%D9%85%D8%B6%D8%A7%D9%86%201447%D9%87%D9%80%20%202026%D9%85%20%20-%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D8%B1%D8%AD%D9%85%D9%86%20%D8%A7%D9%84%D8%B2%D9%88%D8%A7%D9%88%D9%8A.mp3'
    };

    const trackObj = {
      id: audioTrack.id || 'taraweeh',
      title: audioTrack.title || `صلاة التراويح والقيام ${hijriYear} هـ`,
      subtitle: `فضيلة الشيخ عبدالرحمن الزواوي • ليلة ${toArabicNumerals(selectedDayNumber)} رمضان`
    };

    handleToggleAudio(audioTrack.url, trackObj);
  };

  // Card 2: Open Scientific Series & Fasting Hadiths Modal
  const handleOpenHadithsSeries = async () => {
    setHadithModalOpen(true);
    if (hadithsList.length === 0) {
      setHadithsLoading(true);
      try {
        const data = await getHadiths();
        setHadithsList(data.length > 0 ? data : dailyReminders);
      } catch (e) {
        console.error(e);
        setHadithsList(dailyReminders);
      } finally {
        setHadithsLoading(false);
      }
    }
  };

  // Card 3: Download / Print Balanced Khatm Plan PDF
  const handleDownloadKhatmPlan = () => {
    downloadKhatmPlanPdf(khatmDuas);
  };

  // Card 4: Open Ramadan Quick Flash & Reels Modal
  const handleOpenShorts = async () => {
    setShortsModalOpen(true);
    if (recitationsList.length === 0) {
      try {
        const recs = await getRecitations();
        setRecitationsList(recs);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 1. Print Action: Invokes window.print() cleanly isolating #imsakiah-section via CSS
  const handlePrint = () => {
    window.print();
  };

  // 2. Download Colored PDF: Check backend URL or generate printable colored PDF view
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const backendPdfUrl = await getImsakiahPdfUrl(playlist?.year || 2026);
      if (backendPdfUrl) {
        window.open(backendPdfUrl, '_blank');
        setDownloadingPdf(false);
        return;
      }
    } catch (err) {
      console.warn('Backend PDF check failed, falling back to dynamic printable view:', err);
    } finally {
      setDownloadingPdf(false);
    }

    // Dynamic Colored PDF Print View Fallback
    generateColoredImsakiahPdfView();
  };

  // Dynamic Generator for High-Definition Colored PDF / Print
  const generateColoredImsakiahPdfView = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    const tableRowsHtml = imsakiahData.map((row) => `
      <tr style="${row.dayNumber === selectedDayNumber ? 'background-color: #faf6ee; font-weight: bold;' : ''}">
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: right; font-weight: bold;">${row.day}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; color: #0b3b2c; font-weight: bold;">${row.ramadan}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; color: #6b7280;">${row.gregorian}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; font-weight: bold; background-color: #edf6f2; color: #064e3b;">${row.imsak}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center;">${row.fajr}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; color: #6b7280;">${row.shuruq}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center;">${row.dhuhr}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center;">${row.asr}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center; font-weight: 900; background-color: #fff7e6; color: #78350f;">${row.maghrib}</td>
        <td style="padding: 5px 8px; border: 1px solid #d1d5db; text-align: center;">${row.isha}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إمساكية شهر رمضان المبارك ${hijriYear} هـ / ${gregorianYear} م</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Cairo', system-ui, sans-serif;
            margin: 0;
            padding: 20px;
            color: #111827;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0b3b2c;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .title {
            font-size: 20px;
            font-weight: 900;
            color: #0b3b2c;
            margin: 0 0 4px 0;
          }
          .subtitle {
            font-size: 11px;
            color: #4b5563;
            margin: 0;
          }
          .meta-badges {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 8px;
            font-size: 10px;
            font-weight: bold;
          }
          .meta-badge {
            background-color: #edf6f2;
            color: #0b3b2c;
            padding: 3px 12px;
            border-radius: 9999px;
            border: 1px solid #a7f3d0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-top: 10px;
          }
          th {
            background-color: #e9f2ee;
            color: #0b3b2c;
            padding: 6px 8px;
            border: 1px solid #9ca3af;
            font-weight: 800;
            font-size: 9pt;
          }
          .footer {
            margin-top: 12px;
            font-size: 8.5pt;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">إمساكية شهر رمضان المبارك ${hijriYear} هـ / ${gregorianYear} م</h1>
          <p class="subtitle">المواقيت الرسمية المعتمدة لمواقيت الإمساك والصلوات الخمس والإفطار بحسب تقويم أم القرى</p>
          <div class="meta-badges">
            <span class="meta-badge">الموقع: مكة المكرمة (المسجد الحرام)</span>
            <span class="meta-badge">فضيلة الشيخ عبدالرحمن الزواوي</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: right;">اليوم</th>
              <th>رمضان</th>
              <th>التاريخ الميلادي</th>
              <th style="background-color: #d1fae5; color: #064e3b;">الإمساك</th>
              <th>الفجر</th>
              <th>الشروق</th>
              <th>الظهر</th>
              <th>العصر</th>
              <th style="background-color: #fef3c7; color: #78350f;">المغرب (الإفطار)</th>
              <th>العشاء والتراويح</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <div class="footer">
          المرجع المعتمد: تقويم أم القرى الرسمي لمكة المكرمة لموسم ${hijriYear} هـ — منصة فضيلة الشيخ عبدالرحمن الزواوي
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7f6] text-gray-800 p-4 md:p-8 pb-36 md:pb-40 font-sans" dir="rtl">
        {/* Top Breadcrumb Navigation */}
        <nav className="no-print max-w-7xl mx-auto mb-4 flex items-center justify-start text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-[#e9f0ec] px-4 py-1.5 rounded-full text-xs font-medium text-gray-700">
            <span className="flex items-center gap-1 font-semibold text-gray-800">
              <Home className="w-4 h-4 text-emerald-800" />
              الرئيسية
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600">أرشيف موسم رمضان {hijriYear} هـ / {gregorianYear} م</span>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto space-y-8 pb-6">
          {/* Error Banner */}
          {error && (
            <div className="no-print bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}

          {/* Hero Banner Section */}
          <section className="no-print relative rounded-[2rem] overflow-hidden shadow-xl min-h-[440px] flex items-center text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${ramadanBg})` }}
            />
            <div className="absolute inset-0 bg-black/45" />

            <div className="relative z-10 w-full max-w-4xl px-6 md:px-12 py-10 flex flex-col items-start text-right">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs md:text-sm border border-white/20 mb-6">
                <span className="text-[#FFDEA4]">
                  أرشيف التلاوات والمجالس • موسم رمضان {hijriYear} هـ / {gregorianYear} م
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-md text-right w-full">
                رمضان {hijriYear} هـ / {gregorianYear} م
              </h1>

              <p className="text-sm md:text-base text-gray-200 leading-relaxed max-w-2xl mb-8 font-light text-right">
                مستودع التسجيلات والتلاوات الخاشعة من صلوات التراويح والتهجد، والمجالس العلمية التأصيلية، والأدعية المأثورة بصوت وتوجيه فضيلة الشيخ عبدالرحمن الزواوي لموسم شهر رمضان المبارك.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xl items-start">
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-start">
                  <a 
                    href="#night-recordings"
                    className="bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>استكشف تسجيلات وتلاوات الموسم</span>
                    <Headphones className="w-4 h-4 text-emerald-800" />
                  </a>
                </div>

                <div className="w-full bg-white/15 backdrop-blur-md text-gray-200 px-5 py-2.5 rounded-2xl border border-white/20 text-xs flex items-center justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>أرشيف رسمي موثق بحسب تقويم أم القرى لمكة المكرمة</span>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Ramadan Days Strip / Selector */}
          <section className="no-print bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 pb-3">
              <div className="flex items-center gap-2 text-right">
                <Sparkles className="w-4 h-4 text-[#8b6528]" />
                <h3 className="text-sm md:text-base font-bold text-[#0b3b2c]">
                  اختر يوم رمضان لعرض مواقيته وتسجيلاته
                </h3>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                اليوم المختار: <span className="font-bold text-[#0b3b2c]">{toArabicNumerals(selectedDayNumber)} رمضان</span>
              </div>
            </div>

            {/* Scrollable Days Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDayNumber(dayNum)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all duration-200 flex flex-col items-center gap-0.5 cursor-pointer ${
                    selectedDayNumber === dayNum
                      ? 'bg-[#103e2e] text-white shadow-md scale-105'
                      : 'bg-[#f4f7f6] hover:bg-[#e8f1ec] text-gray-700 border border-gray-100'
                  }`}
                >
                  <span className="text-[10px] opacity-75 font-normal">رمضان</span>
                  <span>{toArabicNumerals(dayNum)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Prayer & Iftar Times Container Card */}
          <section className="no-print bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex flex-col gap-1 text-right">
                <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#8b6528]">
                  <Clock className="w-4 h-4 text-[#8b6528]" />
                  <span>المواقيت المرجعية المعتمدة لموسم {hijriYear} هـ</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-emerald-950">
                  مواقيت الإمساك والإفطار المرجعية
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-[#e9f3ee] border border-emerald-100 text-emerald-900 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    المرجع: {activeDayData?.day || 'السبت'} {activeDayData?.ramadan || `٠٤ رمضان`} {hijriYear} هـ ({activeDayData?.gregorian || '٢١ مارس ٢٠٢٦'})
                  </span>
                </div>
                
                <div className="bg-[#134e3b] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                  <MapPin className="w-4 h-4 text-[#e2d595]" />
                  <span>مكة المكرمة (توقيت أم القرى الرسمي)</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0b3b2c]" />
                <span className="text-xs text-gray-500 font-semibold">جاري جلب أحدث مواقيت الصلاة من الخادم...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Imsak Card - Right side in RTL */}
                  <div className="bg-[#edf6f2] border border-emerald-100/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-right">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-200/40 p-2.5 rounded-xl text-emerald-900">
                          <Moon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-emerald-950">موعد الإمساك (المعتمد)</h3>
                          <p className="text-xs text-emerald-800/80">وقت الكف والاحتياط الشرعي قبل الفجر</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium">
                        صيام {hijriYear} هـ
                      </span>
                    </div>

                    <div className="my-2 text-right">
                      <div className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tight flex items-baseline gap-2">
                        <span>{activeDayData?.imsak || '٠٥:٢١ ص'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-800/80 text-right mt-4 pt-3 border-t border-emerald-100/80">
                      يبدأ الإمساك عند {activeDayData?.imsak || '٠٥:٢١ ص'}، وأذان الفجر عند {activeDayData?.fajr || '٠٥:٣١ ص'} حسب تقويم أم القرى.
                    </p>
                  </div>

                  {/* Maghrib / Iftar Card - Left side in RTL */}
                  <div className="relative bg-[#fff7e6] border border-amber-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-right">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-300/40 p-2.5 rounded-xl text-amber-900">
                          <Sunset className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-950">موعد أذان المغرب (الإفطار)</h3>
                          <p className="text-xs text-amber-800/80">حلول وقت الفطر وساعة استجابة الدعاء</p>
                        </div>
                      </div>
                      <span className="bg-amber-200/70 text-amber-900 text-xs px-3 py-1 rounded-full font-medium">
                        الموعد الأبرز
                      </span>
                    </div>

                    <div className="my-2 text-right">
                      <div className="text-4xl md:text-5xl font-black text-amber-950 tracking-tight flex items-baseline gap-2">
                        <span>{activeDayData?.maghrib || '٠٦:٢١ م'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-amber-800/80 text-right mt-4 pt-3 border-t border-amber-200/60">
                      غروب قرص الشمس المؤذن بدخول وقت الإفطار وصلاة المغرب بمكة المكرمة.
                    </p>
                  </div>
                </div>

                {/* Sub-Prayer Times Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#f3f7f5] rounded-xl p-3.5 text-center border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium block mb-1">أذان الفجر</span>
                    <div className="text-lg font-bold text-emerald-950">
                      <span>{activeDayData?.fajr || '٠٥:٣١ ص'}</span>
                    </div>
                  </div>

                  <div className="bg-[#f3f7f5] rounded-xl p-3.5 text-center border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium block mb-1">الشروق</span>
                    <div className="text-lg font-bold text-emerald-950">
                      <span>{activeDayData?.shuruq || '٠٦:٤٧ ص'}</span>
                    </div>
                  </div>

                  <div className="bg-[#f3f7f5] rounded-xl p-3.5 text-center border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium block mb-1">الظهر</span>
                    <div className="text-lg font-bold text-emerald-950">
                      <span>{activeDayData?.dhuhr || '١٢:٣٤ م'}</span>
                    </div>
                  </div>

                  <div className="bg-[#f3f7f5] rounded-xl p-3.5 text-center border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium block mb-1">العصر</span>
                    <div className="text-lg font-bold text-emerald-950">
                      <span>{activeDayData?.asr || '٠٣:٥٣ م'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Section: تسجيلات الليلة من الأرشيف (Dynamic Night Recordings) */}
          <section id="night-recordings" className="no-print bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="text-right space-y-1">
                <span className="text-xs font-semibold text-[#8b6528] block">
                  تسجيلات الليلة {toArabicNumerals(selectedDayNumber)} من رمضان
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-[#0b3b2c]">
                  تلاوات التراويح والقيام والأدعية المرفوعة
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-light">
                  تسجيلات كاملة لصلاة القيام ودعاء الوتر بصوت فضيلة الشيخ عبدالرحمن الزواوي
                </p>
              </div>

              <div className="bg-[#e9f3ee] text-[#0b3b2c] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100">
                <Headphones className="w-4 h-4 text-[#0b3b2c]" />
                <span>
                  {activeNightRecordings.length > 0 
                    ? `${toArabicNumerals(activeNightRecordings.length)} تسجيلات متوفرة`
                    : 'تسجيلات أرشيفية'}
                </span>
              </div>
            </div>

            {activeNightRecordings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeNightRecordings.map((rec) => {
                  const isItemPlaying = isPlaying && currentTrack?.audioUrl === rec.url;
                  return (
                    <div 
                      key={rec.id}
                      className="bg-[#f8faf9] border border-gray-100 hover:border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1 text-right flex-1">
                        <span className="text-[11px] font-bold text-[#8b6528] bg-[#f2eadd] px-2.5 py-0.5 rounded-lg inline-block">
                          {rec.typeLabel || 'تسجيل صوتي'}
                        </span>
                        <h4 className="text-sm md:text-base font-bold text-gray-900 leading-snug">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          الشيخ عبدالرحمن الزواوي • موسم {hijriYear} هـ
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {rec.url && (
                          <>
                            <button
                              onClick={() => handleToggleAudio(rec.url, {
                                title: rec.title,
                                url: rec.url,
                                subtitle: `الشيخ عبدالرحمن الزواوي • ${rec.typeLabel || 'تسجيل الليلة'}`
                              })}
                              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                                isItemPlaying 
                                  ? 'bg-[#8b6528] text-white scale-105' 
                                  : 'bg-[#103e2e] hover:bg-[#0a2c20] text-white'
                              }`}
                              title={isItemPlaying ? 'إيقاف مؤقت' : 'استماع للتسجيل'}
                            >
                              {isItemPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                              )}
                            </button>

                            <a
                              href={rec.url}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center transition-colors"
                              title="تحميل الملف الصوتي"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-[#f9fbf9] rounded-2xl border border-gray-100 text-center space-y-2">
                <Moon className="w-8 h-8 text-[#8b6528] mx-auto opacity-70" />
                <p className="text-sm font-bold text-gray-800">
                  تسجيلات ليلة {toArabicNumerals(selectedDayNumber)} رمضان مسجلة ومحفوظة
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  يمكنك الاستماع لمختارات التراويح والأدعية من بطاقات المكتبة الصوتية أو اختيار ليلة أخرى من الشريط بالأعلى.
                </p>
              </div>
            )}
          </section>

          {/* Section: مختارات إيمانية رمضانية (Interactive Resources Cards) */}
          <section className="no-print space-y-6 pt-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="text-right space-y-1">
                <span className="text-xs font-semibold text-[#8b6528] block">
                  المكتبة الصوتية والمرئية
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-[#0b3b2c]">
                  مختارات إيمانية رمضانية
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-light">
                  تلاوات، مقاطع توعوية، وأحاديث صحيحة مستقاة من تراث المنصة ومجالس الشيخ
                </p>
              </div>

              <div className="self-start md:self-auto">
                <span className="bg-[#e2eae5] text-gray-700 text-xs font-medium px-4 py-2 rounded-full border border-gray-200">
                  كل المحتوى موثق
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: تراويح وتهجد 1447 هـ */}
              <div 
                onClick={handlePlayTaraweehCard}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between text-right group cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                  <img 
                    src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=600" 
                    alt="تراويح وتهجد" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
                    <Headphones className="w-3.5 h-3.5 text-emerald-800" />
                    <span>تسجيل حصري</span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTaraweehCard();
                      }}
                      className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                    >
                      {isPlaying && currentTrack?.id === 'taraweeh' ? (
                        <Pause className="w-4 h-4 fill-gray-900 text-gray-900" />
                      ) : (
                        <Play className="w-4 h-4 fill-gray-900 text-gray-900 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#8b6528] block">
                      تلاوات خاشعة
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors">
                      تراويح وتهجد {hijriYear} هـ
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light line-clamp-3">
                      مختارات صوتية من صلاة التراويح والقيام بصوت فضيلة الشيخ عبدالرحمن الزواوي بتقنية الصوت النقي.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>٣٠ تسجيلاً</span>
                    <span>جودة استوديو ٣٢٠kbps</span>
                  </div>
                </div>
              </div>

              {/* Card 2: أحاديث الصيام الصحيحة */}
              <div 
                onClick={handleOpenHadithsSeries}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between text-right group cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                  <img 
                    src="https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=600" 
                    alt="أحاديث الصيام الصحيحة" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                    <span>سلسلة فقهية</span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenHadithsSeries();
                      }}
                      className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-gray-900" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#8b6528] block">
                      شروح علمية
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors">
                      أحاديث الصيام الصحيحة
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light line-clamp-3">
                      شرح تأصيلي ميسر لأحاديث كتاب الصيام من صحيحي الإمامين البخاري ومسلم وبيان أحكام الصوم.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>١٥ مجلساً علمياً</span>
                    <span>سلسلة يومية</span>
                  </div>
                </div>
              </div>

              {/* Card 3: خطة ختم القرآن المتزنة */}
              <div 
                onClick={handleDownloadKhatmPlan}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between text-right group cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                  <img 
                    src="https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600" 
                    alt="خطة ختم القرآن" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
                    <FileText className="w-3.5 h-3.5 text-emerald-800" />
                    <span>دليل تطبيقي</span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadKhatmPlan();
                      }}
                      className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-gray-900" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#8b6528] block">
                      خطة التدبر
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors">
                      خطة ختم القرآن المتزنة
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light line-clamp-3">
                      جدول مقترح ومدروس لختم القرآن الكريم تلاوةً وتدبراً خلال أيام الشهر المبارك بما يناسب مختلف الأوقات.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>ملف إرشادي PDF</span>
                    <span>٣ مسارات مقترحة</span>
                  </div>
                </div>
              </div>

              {/* Card 4: ومضات رمضانية سريعة */}
              <div 
                onClick={handleOpenShorts}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between text-right group cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                  <img 
                    src="https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=600" 
                    alt="ومضات رمضانية" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
                    <Video className="w-3.5 h-3.5 text-emerald-800" />
                    <span>شورتس ومقاطع</span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenShorts();
                      }}
                      className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-gray-900 text-gray-900 ml-0.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#8b6528] block">
                      دقائق إيمانية
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors">
                      ومضات رمضانية سريعة
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light line-clamp-3">
                      وقفات تدبرية مقتضبة لا تتجاوز الدقيقة تعزز الإخلاص وتذكر بفضائل الأعمال ومكارم الأخلاق.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>أكثر من ٤٠ مقطعاً</span>
                    <span>تحديث يومي</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: إمساكية شهر رمضان المبارك (Full 30 Days Table) */}
          <section id="imsakiah-section" className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex flex-col gap-1 text-right">
                <span className="text-xs font-semibold text-[#8b6528] block">
                  الجدول الزمني المعتمد
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-[#0b3b2c]">
                  إمساكية شهر رمضان المبارك {hijriYear} هـ / {gregorianYear} م
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-light">
                  الجدول الرسمي المعتمد لمواقيت الإمساك والصلوات الخمس والإفطار بحسب تقويم أم القرى لمكة المكرمة لموسم {hijriYear} هـ
                </p>
              </div>

              {/* Print & Download Action Buttons */}
              <div className="no-print flex items-center gap-3">
                <button 
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#eef5f1] hover:bg-[#e2ede7] text-[#0b3b2c] text-xs md:text-sm font-semibold px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-emerald-100 transition-colors cursor-pointer"
                  title="طباعة جدول الإمساكية المعتمد"
                >
                  <Printer className="w-4 h-4 text-[#0b3b2c]" />
                  <span>طباعة الإمساكية</span>
                </button>

                <button 
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="bg-[#103e2e] hover:bg-[#0a2c20] text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                  title="تحميل نسخة PDF ملونة عالية الجودة"
                >
                  {downloadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4 text-white" />
                  )}
                  <span>تحميل PDF ملون</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-right text-xs md:text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#e9f2ee] text-[#0b3b2c] font-bold border-b border-gray-200">
                    <th className="py-3.5 px-4 text-right">اليوم</th>
                    <th className="py-3.5 px-4 text-center">رمضان</th>
                    <th className="py-3.5 px-4 text-center">التاريخ الميلادي</th>
                    <th className="py-3.5 px-4 text-center bg-[#e0eee7]">الإمساك</th>
                    <th className="py-3.5 px-4 text-center">الفجر</th>
                    <th className="py-3.5 px-4 text-center">الشروق</th>
                    <th className="py-3.5 px-4 text-center">الظهر</th>
                    <th className="py-3.5 px-4 text-center">العصر</th>
                    <th className="py-3.5 px-4 text-center bg-[#eee6d5] text-amber-950">المغرب (الإفطار)</th>
                    <th className="py-3.5 px-4 text-center">العشاء والتراويح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {imsakiahData.map((row) => {
                    const isSelected = row.dayNumber === selectedDayNumber;
                    return (
                      <tr 
                        key={row.dayNumber}
                        onClick={() => setSelectedDayNumber(row.dayNumber)}
                        className={`transition-colors cursor-pointer hover:bg-gray-50/80 ${
                          isSelected ? 'bg-[#faf6ee] font-semibold text-gray-900 border-r-4 border-amber-600' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold flex items-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />}
                          <span>{row.day}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#0b3b2c]">{row.ramadan}</td>
                        <td className="py-3.5 px-4 text-center text-gray-500">{row.gregorian}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-900 bg-[#edf6f2]/60">{row.imsak}</td>
                        <td className="py-3.5 px-4 text-center">{row.fajr}</td>
                        <td className="py-3.5 px-4 text-center text-gray-500">{row.shuruq}</td>
                        <td className="py-3.5 px-4 text-center">{row.dhuhr}</td>
                        <td className="py-3.5 px-4 text-center">{row.asr}</td>
                        <td className="py-3.5 px-4 text-center font-black text-amber-950 bg-[#fff7e6]">{row.maghrib}</td>
                        <td className="py-3.5 px-4 text-center">{row.isha}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Subtext */}
            <p className="text-[11px] md:text-xs text-gray-500 text-right font-light">
              <span className="font-semibold text-gray-700">الرسمي المعتمد:</span> التوقيتات الدقيقة بحسب أفق المسجد الحرام بمكة المكرمة لحساب صيام شهر رمضان المبارك {hijriYear} هـ. وتخضع البداية والنهاية لما تقره المحكمة العليا بثبوت الرؤية.
            </p>
          </section>

          {/* Section: أدعية ختم القرآن والمأثورات الرمضانية (Dynamic Khatm Duas) */}
          {khatmDuas.length > 0 && (
            <section className="no-print bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6 text-right">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#8b6528] block">
                    مأثورات رمضانية مباركة
                  </span>
                  <h3 className="text-2xl font-bold text-[#0b3b2c]">
                    من أدعية ختم القرآن الكريم وصلاة الوتر
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    أدعية مباركة يُرجى بها إجابة الدعاء عند الإفطار وفي جوف الليل
                  </p>
                </div>
                <div className="bg-[#e9f0ec] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0b3b2c]">
                  {toArabicNumerals(khatmDuas.length)} أدعية مأثورة
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {khatmDuas.slice(0, 6).map((dua, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#fbfcfa] p-5 rounded-2xl border border-gray-100 shadow-inner flex flex-col justify-between space-y-3"
                  >
                    <p className="text-sm md:text-base text-gray-800 leading-relaxed font-serif font-medium">
                      « {dua.textArabic} »
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                      <span>دعاء رقم {toArabicNumerals(idx + 1)}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(dua.textArabic);
                          alert('تم نسخ الدعاء!');
                        }}
                        className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>نسخ الدعاء</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: قبس قرآني كريم (Dynamic Quranic Verse of the day) */}
          <section className="no-print bg-[#eaf3ee] rounded-[2rem] p-8 md:p-12 text-center space-y-3 shadow-inner border border-emerald-100/60">
            <span className="text-xs font-semibold text-[#8b6528] block">
              قبس قرآني كريم
            </span>
            <h3 className="text-2xl md:text-4xl font-black text-[#0b3b2c] tracking-wide leading-relaxed font-serif">
              {dailyAyah?.textUthmani ? (
                `﴿ ${dailyAyah.textUthmani} ﴾`
              ) : (
                '﴿ شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ وَبَيِّنَاتٍ مِنَ الْهُدَىٰ وَالْفُرْقَانِ ﴾'
              )}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 font-medium pt-1">
              {dailyAyah ? (
                `سورة ${dailyAyah.surahNameArabic} • الآية ${toArabicNumerals(dailyAyah.ayahNumber)}`
              ) : (
                `سورة البقرة • الآية ${toArabicNumerals(185)}`
              )}
            </p>
          </section>
        </main>
      </div>


      {/* Modal: أحاديث الصيام الصحيحة والمجالس العلمية */}
      {hadithModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between bg-[#f8faf9]">
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 text-[#8b6528] font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>المجالس العلمية التأصيلية</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-[#0b3b2c]">
                  أحاديث الصيام الصحيحة وفقه الصيام
                </h3>
              </div>
              <button 
                onClick={() => setHadithModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-4">
              {hadithsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0b3b2c]" />
                  <span className="text-sm text-gray-500 font-semibold">جاري تحميل الأحاديث الشريفة...</span>
                </div>
              ) : (
                hadithsList.map((item, idx) => (
                  <div key={idx} className="bg-[#fbfcfa] border border-gray-100 rounded-2xl p-5 space-y-3 text-right">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#8b6528] bg-[#f4ebe1] px-3 py-1 rounded-full">
                        مجلس رقم {toArabicNumerals(idx + 1)}
                      </span>
                      <span className="text-gray-400 font-medium">
                        {item.source || 'متفق عليه'}
                      </span>
                    </div>

                    <p className="text-base md:text-lg text-[#0b3b2c] font-serif font-bold leading-relaxed">
                      « {item.textArabic} »
                    </p>

                    {item.explanation && (
                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 text-xs md:text-sm text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-800 ml-1">بيان الحديث:</span>
                        {item.explanation}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(item.textArabic);
                          setCopiedHadithIndex(idx);
                          setTimeout(() => setCopiedHadithIndex(null), 2000);
                        }}
                        className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedHadithIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>نسخ الحديث</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-[#f8faf9] flex justify-between items-center text-xs text-gray-500">
              <span>مستودع الأحاديث الصحيحة من منصة فضيلة الشيخ عبدالرحمن الزواوي</span>
              <button 
                onClick={() => setHadithModalOpen(false)}
                className="bg-[#103e2e] text-white px-5 py-2 rounded-xl font-bold cursor-pointer hover:bg-[#0a2c20]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: ومضات رمضانية سريعة (Shorts / Reels) */}
      {shortsModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#0f1f18] text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-800/40 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#FFDEA4]" />
                <span className="text-sm font-bold text-[#FFDEA4]">ومضات رمضانية سريعة</span>
              </div>
              <button 
                onClick={() => setShortsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Display */}
            <div className="p-6 text-center space-y-6 flex-1 flex flex-col justify-center">
              <div className="relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#103e2e] to-[#8b6528] flex items-center justify-center shadow-lg border border-emerald-400/30">
                <Moon className="w-12 h-12 text-white animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#FFDEA4] font-medium bg-white/10 px-3 py-1 rounded-full inline-block">
                  مقطع {toArabicNumerals(shortsIndex + 1)} من {toArabicNumerals(recitationsList.length > 0 ? recitationsList.length : 10)}
                </span>
                <h4 className="text-lg font-bold text-white">
                  {recitationsList[shortsIndex] 
                    ? `تلاوة خاشعة • سورة رقم ${toArabicNumerals(recitationsList[shortsIndex].surahId)}`
                    : 'ومضة إيمانية في فضائل الصيام والقيام'}
                </h4>
                <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed">
                  بصوت فضيلة الشيخ عبدالرحمن الزواوي — استمع وتأمل آيات الذكر الحكيم في ثوانٍ معدودات.
                </p>
              </div>

              {/* Player Audio Element */}
              {recitationsList[shortsIndex]?.audioUrl && (
                <div className="pt-2">
                  <button
                    onClick={() => handleToggleAudio(recitationsList[shortsIndex].audioUrl, {
                      title: `ومضة رمضانية • مقطع ${toArabicNumerals(shortsIndex + 1)}`,
                      url: recitationsList[shortsIndex].audioUrl,
                      subtitle: 'فضيلة الشيخ عبدالرحمن الزواوي'
                    })}
                    className="bg-white hover:bg-gray-100 text-[#0b3b2c] font-black px-6 py-2.5 rounded-full flex items-center justify-center gap-2 mx-auto shadow-lg transition-transform hover:scale-105 cursor-pointer text-sm"
                  >
                    {isPlaying && currentTrack?.audioUrl === recitationsList[shortsIndex].audioUrl ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>إيقاف المقطع</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>تشغيل الومضة</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                <button
                  onClick={() => {
                    const prev = shortsIndex > 0 ? shortsIndex - 1 : (recitationsList.length ? recitationsList.length - 1 : 0);
                    setShortsIndex(prev);
                    if (recitationsList[prev]?.audioUrl) {
                      handleToggleAudio(recitationsList[prev].audioUrl, {
                        title: `ومضة رمضانية • مقطع ${toArabicNumerals(prev + 1)}`,
                        url: recitationsList[prev].audioUrl,
                        subtitle: 'فضيلة الشيخ عبدالرحمن الزواوي'
                      });
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>المقطع السابق</span>
                </button>

                <button
                  onClick={() => {
                    const next = recitationsList.length && shortsIndex < recitationsList.length - 1 ? shortsIndex + 1 : 0;
                    setShortsIndex(next);
                    if (recitationsList[next]?.audioUrl) {
                      handleToggleAudio(recitationsList[next].audioUrl, {
                        title: `ومضة رمضانية • مقطع ${toArabicNumerals(next + 1)}`,
                        url: recitationsList[next].audioUrl,
                        subtitle: 'فضيلة الشيخ عبدالرحمن الزواوي'
                      });
                    }
                  }}
                  className="bg-[#103e2e] hover:bg-emerald-800 text-white px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors font-bold"
                >
                  <span>المقطع التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RamadanPage;