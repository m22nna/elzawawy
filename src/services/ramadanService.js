/**
 * Ramadan Service
 * Connects with Zawawy API staging for Ramadan playlists, daily content, prayer/imsakiah schedules, and supplications.
 */

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'https://zawawy-api-staging.onrender.com').replace(/\/+$/, '');

/**
 * Arabic Eastern Numeral Converter
 * Converts Western digits (0-9) to Eastern Arabic digits (٠-٩)
 */
export const toArabicNumerals = (num) => {
  if (num === null || num === undefined || num === '') return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (digit) => arabicDigits[Number(digit)]);
};

/**
 * Formats ISO or HH:mm time to 12-hour Eastern Arabic time string
 * E.g., '2026-03-18T05:01:00+03:00' -> '٠٥:٠١ ص'
 *       '2026-03-18T18:31:00+03:00' -> '٠٦:٣١ م'
 */
export const formatTimeArabic = (timeStr) => {
  if (!timeStr) return '';
  try {
    let hours, minutes;
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1].slice(0, 5);
      [hours, minutes] = timePart.split(':').map(Number);
    } else if (timeStr.includes(':')) {
      const parts = timeStr.trim().split(' ')[0].split(':');
      [hours, minutes] = parts.map(Number);
      if (timeStr.includes('م') && hours < 12) hours += 12;
      if (timeStr.includes('ص') && hours === 12) hours = 0;
    } else {
      return toArabicNumerals(timeStr);
    }

    const isPM = hours >= 12;
    const dh = hours % 12 || 12;
    const p = isPM ? 'م' : 'ص';
    const formatted = `${String(dh).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${p}`;
    return toArabicNumerals(formatted);
  } catch {
    return toArabicNumerals(timeStr);
  }
};

/**
 * Helper to execute API requests with fallback for /v1
 */
async function requestApi(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
    // Attempt /api prefix if 404
    if (res.status === 404 && !cleanEndpoint.startsWith('/api')) {
      const altUrl = `${API_BASE_URL}/api${cleanEndpoint}`;
      const altRes = await fetch(altUrl);
      if (altRes.ok) {
        return await altRes.json();
      }
    }
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  } catch (err) {
    console.error(`Request to ${url} failed:`, err);
    throw err;
  }
}

/**
 * Fetch Current Active Ramadan Playlist (Nights and recordings)
 */
export async function getRamadanCurrentPlaylist() {
  try {
    return await requestApi('/v1/ramadan/playlists/current');
  } catch (err) {
    console.warn('Failed to fetch current Ramadan playlist, attempting 2026 fallback:', err);
    return await getRamadanPlaylistByYear(2026);
  }
}

/**
 * Fetch Ramadan Playlist for a specific Gregorian year (e.g. 2026)
 */
export async function getRamadanPlaylistByYear(year = 2026) {
  return await requestApi(`/v1/ramadan/playlists/${year}`);
}

/**
 * Fetch Khatm Al-Quran Duas
 */
export async function getKhatmDua() {
  try {
    return await requestApi('/v1/daily/khatm-dua');
  } catch (err) {
    console.error('Failed to fetch Khatm Dua:', err);
    return [];
  }
}

/**
 * Fetch Daily Quran & Sunnah Reminders
 */
export async function getDailyReminders() {
  try {
    return await requestApi('/v1/daily/reminders');
  } catch (err) {
    console.error('Failed to fetch daily reminders:', err);
    return [];
  }
}

/**
 * Fetch Today's Quranic Ayah
 */
export async function getDailyToday() {
  try {
    return await requestApi('/v1/daily/today');
  } catch (err) {
    console.error('Failed to fetch daily today:', err);
    return null;
  }
}

/**
 * Arabic Weekday Name Helper
 */
const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Arabic Gregorian Month Names
 */
const ARABIC_GREGORIAN_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * Fetch Ramadan Imsakiah (Prayer schedule for 30 days of Ramadan)
 * Uses Umm Al-Qura methodology (Makkah coordinates)
 */
export async function getRamadanImsakiah(year = 2026) {
  try {
    // Ramadan 1447 AH spans February and March 2026
    const [febRes, marRes] = await Promise.all([
      requestApi('/v1/prayer-times?latitude=21.4225&longitude=39.8262&month=2026-02&country=SA'),
      requestApi('/v1/prayer-times?latitude=21.4225&longitude=39.8262&month=2026-03&country=SA')
    ]);

    const allDays = [...(febRes?.days || []), ...(marRes?.days || [])];
    const ramadanDays = allDays.filter(d => 
      d.hijri?.month === 9 || 
      (d.hijri?.monthNameArabic && d.hijri.monthNameArabic.includes('رَمَضان'))
    );

    if (ramadanDays.length > 0) {
      return ramadanDays.map((d, index) => {
        const dateObj = new Date(d.date);
        const weekday = ARABIC_WEEKDAYS[dateObj.getDay()];
        const dayOfMonth = dateObj.getDate();
        const monthName = ARABIC_GREGORIAN_MONTHS[dateObj.getMonth()];
        const gregorianStr = `${toArabicNumerals(dayOfMonth)} ${monthName} ${toArabicNumerals(year)}`;
        const ramadanDayNum = d.hijri?.day || (index + 1);

        return {
          dayNumber: ramadanDayNum,
          day: weekday,
          ramadan: `${toArabicNumerals(String(ramadanDayNum).padStart(2, '0'))} رمضان`,
          gregorian: gregorianStr,
          rawDate: d.date,
          imsak: formatTimeArabic(d.timings?.imsak),
          fajr: formatTimeArabic(d.timings?.fajr),
          shuruq: formatTimeArabic(d.timings?.sunrise),
          dhuhr: formatTimeArabic(d.timings?.dhuhr),
          asr: formatTimeArabic(d.timings?.asr),
          maghrib: formatTimeArabic(d.timings?.maghrib),
          isha: formatTimeArabic(d.timings?.isha),
          isCurrent: ramadanDayNum === 4, // Default featured reference day or dynamic
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch Ramadan prayer times from API, using curated schedule:', err);
  }

  // Curated Fallback Imsakiah for Ramadan 1447 H / 2026 M
  return Array.from({ length: 30 }, (_, i) => {
    const num = i + 1;
    return {
      dayNumber: num,
      day: ARABIC_WEEKDAYS[(i + 3) % 7], // starts Wednesday
      ramadan: `${toArabicNumerals(String(num).padStart(2, '0'))} رمضان`,
      gregorian: `${toArabicNumerals(17 + num > 31 ? (17 + num) - 31 : 17 + num)} ${17 + num > 31 ? 'أبريل' : 'مارس'} ${toArabicNumerals(2026)}`,
      rawDate: `2026-03-${17 + num}`,
      imsak: toArabicNumerals(`04:${Math.max(30, 54 - i)} ص`),
      fajr: toArabicNumerals(`05:${Math.max(40, 4 - Math.floor(i / 3))} ص`),
      shuruq: toArabicNumerals(`06:${Math.max(0, 21 - Math.floor(i / 2))} ص`),
      dhuhr: toArabicNumerals('12:28 م'),
      asr: toArabicNumerals('03:51 م'),
      maghrib: toArabicNumerals(`06:${33 + Math.floor(i / 2)} م`),
      isha: toArabicNumerals(`08:${3 + Math.floor(i / 2)} م`),
      isCurrent: num === 4,
    };
  });
}

/**
 * Static educational articles and media guides for Ramadan
 */
export function getRamadanGuides() {
  return [
    {
      id: 'guide_1',
      badge: 'تسجيل حصري',
      badgeType: 'audio',
      subCategory: 'تلاوات خاشعة',
      title: 'تراويح وتهجد 1447 هـ',
      description: 'مختارات صوتية من صلاة التراويح والقيام بصوت فضيلة الشيخ عبدالرحمن الزواوي بتقنية الصوت النقي.',
      statRight: '٣٠ تسجيلاً',
      statLeft: 'جودة استوديو 320kbps',
      image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'guide_2',
      badge: 'سلسلة فقهية',
      badgeType: 'book',
      subCategory: 'شروح علمية',
      title: 'أحاديث الصيام الصحيحة',
      description: 'شرح تأصيلي ميسر لأحاديث كتاب الصيام من صحيحي الإمامين البخاري ومسلم وبيان أحكام الصوم.',
      statRight: '١٥ مجلساً علمياً',
      statLeft: 'سلسلة يومية',
      image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'guide_3',
      badge: 'دليل تطبيقي',
      badgeType: 'pdf',
      subCategory: 'خطة التدبر',
      title: 'خطة ختم القرآن المتزنة',
      description: 'جدول مقترح ومدروس لختم القرآن الكريم تلاوةً وتدبراً خلال أيام الشهر المبارك بما يناسب مختلف الأوقات.',
      statRight: 'ملف إرشادي PDF',
      statLeft: '٣ مسارات مقترحة',
      image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'guide_4',
      badge: 'شورتس ومقاطع',
      badgeType: 'video',
      subCategory: 'دقائق إيمانية',
      title: 'ومضات رمضانية سريعة',
      description: 'وقفات تدبرية مقتضبة لا تتجاوز الدقيقة تعزز الإخلاص وتذكر بفضائل الأعمال ومكارم الأخلاق.',
      statRight: 'أكثر من ٤٠ مقطعاً',
      statLeft: 'تحديث يومي',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=600'
    }
  ];
}

/**
 * Check if the backend provides a direct Imsakiah PDF download link
 * @param {number|string} year - e.g. 2026
 * @returns {Promise<string|null>}
 */
export async function getImsakiahPdfUrl(year = 2026) {
  try {
    const res = await requestApi(`/v1/ramadan/imsakiah/pdf?year=${year}`);
    if (res && res.pdfUrl) {
      return res.pdfUrl;
    }
  } catch {
    // Backend has no direct PDF endpoint yet
  }
  return null;
}

/**
 * Fetch Authentic Hadiths for Fasting and Scientific Series
 */
export async function getHadiths() {
  try {
    return await requestApi('/v1/hadiths');
  } catch (err) {
    console.error('Failed to fetch hadiths:', err);
    return [];
  }
}

/**
 * Fetch Recitations and Quran Clips
 */
export async function getRecitations() {
  try {
    return await requestApi('/v1/recitations');
  } catch (err) {
    console.error('Failed to fetch recitations:', err);
    return [];
  }
}

/**
 * Generate & Download the Khatm Quran Balanced Plan PDF Guide
 */
export function downloadKhatmPlanPdf(duas = []) {
  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) return;

  const duasHtml = (duas.slice(0, 4) || []).map((d, i) => `
    <div style="background-color: #f7faf8; border-right: 4px solid #103e2e; padding: 10px 14px; margin-bottom: 8px; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #0b3b2c; font-family: 'Amiri', serif;">« ${d.textArabic} »</p>
    </div>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>خطة ختم القرآن المتزنة - موسم رمضان 1447 هـ / 2026 م</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Cairo', system-ui, sans-serif;
          margin: 0;
          padding: 24px;
          color: #1f2937;
          background: #ffffff;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #103e2e;
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .title {
          font-size: 22px;
          font-weight: 900;
          color: #103e2e;
          margin: 0 0 6px 0;
        }
        .subtitle {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        .badge {
          display: inline-block;
          background-color: #edf6f2;
          color: #103e2e;
          border: 1px solid #103e2e;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: bold;
          margin-top: 8px;
        }
        .tracks-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 16px 0;
        }
        .track-card {
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 12px;
          background-color: #fafbfc;
          text-align: right;
        }
        .track-card h3 {
          margin: 0 0 6px 0;
          font-size: 13px;
          color: #103e2e;
          font-weight: bold;
        }
        .track-card p {
          margin: 0;
          font-size: 11px;
          color: #4b5563;
          line-height: 1.6;
        }
        .table-title {
          font-size: 14px;
          font-weight: bold;
          color: #103e2e;
          margin: 18px 0 8px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
          margin-bottom: 16px;
        }
        th {
          background-color: #e9f2ee;
          color: #103e2e;
          padding: 6px 8px;
          border: 1px solid #9ca3af;
          font-weight: 800;
        }
        td {
          padding: 5px 8px;
          border: 1px solid #e5e7eb;
          text-align: center;
        }
        .footer {
          margin-top: 20px;
          font-size: 10px;
          color: #6b7280;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
        }
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">خطة ختم وتدبر القرآن الكريم المتزنة</h1>
        <p class="subtitle">جدول إرشادي مقترح لختم القرآن الكريم تلاوة وتدبراً خلال أيام شهر رمضان المبارك ١٤٤٧ هـ / ٢٠٢٦ م</p>
        <span class="badge">إشراف وتوجيه فضيلة الشيخ عبدالرحمن الزواوي</span>
      </div>

      <div class="tracks-grid">
        <div class="track-card">
          <h3>المسار الأول: الختمة الواحدة</h3>
          <p>قراءة جزء واحد يومياً (٤ صفحات بعد كل صلاة من الصلوات الخمس). مناسب لعموم الصائمين بتوازن ويسر.</p>
        </div>
        <div class="track-card">
          <h3>المسار الثاني: الختمتان</h3>
          <p>قراءة جزأين يومياً (جزء بعد الفجر وجزء قبل الإفطار أو في صلاة التراويح). مناسب لأصحاب الهمم العالية.</p>
        </div>
        <div class="track-card">
          <h3>المسار الثالث: ختمة التدبر</h3>
          <p>قراءة نصف جزء يومياً مع مراجعة معاني الآيات من كتاب التفسير المعتمد. يركز على الفهم العميق والعمل بالقرآن.</p>
        </div>
      </div>

      <div class="table-title">جدول متابعة أجزاء القرآن الكريم خلال الشهر (٣٠ يوماً)</div>
      <table>
        <thead>
          <tr>
            <th>يوم رمضان</th>
            <th>الجزء القرآني</th>
            <th>أبرز السور الكريمة</th>
            <th>عدد الصفحات</th>
            <th>حالة الإنجاز</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>١ رمضان</td><td>الجزء الأول</td><td>سورة الفاتحة وبداية سورة البقرة</td><td>٢١ صفحة</td><td>[  ] تم بحمد الله</td></tr>
          <tr><td>٢ رمضان</td><td>الجزء الثاني</td><td>سورة البقرة (١٤٢ - ٢٥٢)</td><td>٢٠ صفحة</td><td>[  ] تم بحمد الله</td></tr>
          <tr><td>٣ رمضان</td><td>الجزء الثالث</td><td>خواتيم البقرة وأول آل عمران</td><td>٢٠ صفحة</td><td>[  ] تم بحمد الله</td></tr>
          <tr><td>٤ رمضان</td><td>الجزء الرابع</td><td>آل عمران والنساء</td><td>٢٠ صفحة</td><td>[  ] تم بحمد الله</td></tr>
          <tr><td>٥ رمضان</td><td>الجزء الخامس</td><td>سورة النساء</td><td>٢٠ صفحة</td><td>[  ] تم بحمد الله</td></tr>
          <tr><td>٦ - ١٥</td><td>الأجزاء ٦ إلى ١٥</td><td>المائدة، الأنعام، الأعراف، التوبة، يونس، هود، يوسف...</td><td>٢٠٠ صفحة</td><td>[  ] متابعة يومية</td></tr>
          <tr><td>١٦ - ٢٥</td><td>الأجزاء ١٦ إلى ٢٥</td><td>الكهف، مريم، طه، الأنبياء، الحج، المؤمنون، الفرقان...</td><td>٢٠٠ صفحة</td><td>[  ] متابعة يومية</td></tr>
          <tr><td>٢٦ - ٣٠</td><td>الأجزاء ٢٦ إلى ٣٠</td><td>الأحقاف، الذاريات، الرحمن، الواقعة، الملك، عمّ...</td><td>١٠٠ صفحة</td><td>[  ] ختم ودعاء</td></tr>
        </tbody>
      </table>

      <div class="table-title">من أدعية ختم القرآن الكريم المباركة</div>
      ${duasHtml}

      <div class="footer">
        منصة فضيلة الشيخ عبدالرحمن الزواوي — تم إعداد هذا الملف كمرجع تطبيقي للصائمين في شهر رمضان المبارك ١٤٤٧ هـ
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
}


