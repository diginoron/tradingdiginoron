import React, { useState, useEffect } from 'react';
import { ALL_UN_COUNTRIES, searchCountries } from '../../data/allCountries';
import { ALL_HS_CHAPTERS, searchHsChapters } from '../../data/hsChapters';
import { AVAILABLE_YEARS } from '../../data/referenceData';
import { fetchComtradeData, fetchBilateralData, fetchTarifflineTransport } from '../../services/comtradeService';
import { formatUSD, formatWeightKg, calculateUnitValue } from '../../lib/utils';
import { 
  Briefcase, 
  Search, 
  ArrowRight, 
  ArrowRightLeft, 
  Globe2, 
  Layers, 
  TrendingUp, 
  Scale, 
  Truck, 
  RefreshCw, 
  AlertCircle, 
  DollarSign, 
  Package, 
  Building2, 
  ExternalLink,
  HelpCircle,
  FileSpreadsheet,
  Zap,
  Tag
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface TraderDashboardViewProps {
  language: 'fa' | 'en';
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export const TraderDashboardView: React.FC<TraderDashboardViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  // Filters State
  const [originCountry, setOriginCountry] = useState<string>('364'); // Iran
  const [destinationCountry, setDestinationCountry] = useState<string>('784'); // UAE
  const [selectedHsCode, setSelectedHsCode] = useState<string>('TOTAL');
  const [customHsInput, setCustomHsInput] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2023');
  const [flowDirection, setFlowDirection] = useState<'both' | 'export' | 'import'>('both');

  // Search states for dropdowns
  const [originSearch, setOriginSearch] = useState<string>('');
  const [destSearch, setDestSearch] = useState<string>('');
  const [hsSearch, setHsSearch] = useState<string>('');

  // Results State
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeRecords, setTradeRecords] = useState<any[]>([]);
  const [bilateralRecords, setBilateralRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logistics' | 'pricing' | 'mirror'>('overview');
  const [isMirrorMode, setIsMirrorMode] = useState<boolean>(false);
  const [mirrorDataSource, setMirrorDataSource] = useState<string | null>(null);

  const executeTraderAnalysis = async (forceMirror: boolean = false) => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    const cmdToQuery = customHsInput.trim() ? customHsInput.trim() : selectedHsCode;
    const shouldRunMirror = forceMirror || isMirrorMode;

    try {
      if (shouldRunMirror && destinationCountry !== '0') {
        // MIRROR MODE: Query from partner country perspective
        // Destination imports from origin = Origin exports to destination
        const mirrorResponse = await fetchComtradeData({
          reporterCode: destinationCountry,
          partnerCode: originCountry,
          period: selectedPeriod,
          cmdCode: cmdToQuery,
          flowCode: 'M,X',
          typeCode: 'C',
          freqCode: 'A',
          clCode: 'HS',
          includeDesc: true
        });

        if (mirrorResponse && mirrorResponse.data && mirrorResponse.data.length > 0) {
          // Normalize records to reflect from Origin's perspective
          const normalized = mirrorResponse.data.map((r: any) => {
            const rawFlow = String(r.flowCode).toUpperCase();
            // In partner's book: M (Imports from Origin) -> is Origin's Export
            // In partner's book: X (Exports to Origin) -> is Origin's Import
            const isOriginExport = rawFlow === 'M';
            return {
              ...r,
              _isMirror: true,
              _mirrorReporter: r.reporterDesc || destObj?.nameEn,
              flowCode: isOriginExport ? 'X' : 'M',
              flowDesc: isOriginExport 
                ? (isFa ? `صادرات ${originName} (اظهار شده توسط ${destName})` : `Export from ${originName} (Reported by ${destName})`)
                : (isFa ? `واردات ${originName} (اظهار شده توسط ${destName})` : `Import to ${originName} (Reported by ${destName})`)
            };
          });

          setTradeRecords(normalized);
          setMirrorDataSource(destName);
          setIsMirrorMode(true);
        } else {
          setTradeRecords([]);
          setMirrorDataSource(null);
        }
      } else {
        // DIRECT MODE
        const flowCodeParam = flowDirection === 'export' ? 'X' : flowDirection === 'import' ? 'M' : 'M,X';
        const mainResponse = await fetchComtradeData({
          reporterCode: originCountry,
          partnerCode: destinationCountry,
          period: selectedPeriod,
          cmdCode: cmdToQuery,
          flowCode: flowCodeParam,
          typeCode: 'C',
          freqCode: 'A',
          clCode: 'HS',
          includeDesc: true
        });

        if (mainResponse && mainResponse.data && mainResponse.data.length > 0) {
          setTradeRecords(mainResponse.data);
          setIsMirrorMode(false);
          setMirrorDataSource(null);
        } else {
          setTradeRecords([]);
          // If direct is empty, check if we can suggest or auto-load mirror mode
          setIsMirrorMode(false);
          setMirrorDataSource(null);
        }
      }

      // 2. Fetch Bilateral Asymmetry tool if specific country pair
      if (destinationCountry !== '0') {
        try {
          const bilateralResponse = await fetchBilateralData({
            reporterCode: originCountry,
            partnerCode: destinationCountry,
            period: selectedPeriod,
            cmdCode: cmdToQuery,
            typeCode: 'C',
            freqCode: 'A',
            clCode: 'HS',
            includeDesc: true
          });
          if (bilateralResponse && bilateralResponse.data) {
            setBilateralRecords(bilateralResponse.data);
          }
        } catch {
          // Non-critical tool
        }
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در واکشی داده‌های گمرکی' : 'Failed to query UN Comtrade'));
    } finally {
      setLoading(false);
    }
  };

  // Origin and destination objects
  const originObj = ALL_UN_COUNTRIES.find(c => String(c.id) === originCountry);
  const destObj = ALL_UN_COUNTRIES.find(c => String(c.id) === destinationCountry);

  const originName = originObj ? (isFa ? originObj.nameFa : originObj.nameEn) : `Country ${originCountry}`;
  const destName = destObj ? (isFa ? destObj.nameFa : destObj.nameEn) : `Country ${destinationCountry}`;

  // Filtered lists for UI Search
  const filteredOrigins = searchCountries(originSearch, language);
  const filteredDests = searchCountries(destSearch, language);
  const filteredHsChapters = searchHsChapters(hsSearch, language);

  // Aggregations
  let totalExportsUSD = 0;
  let totalImportsUSD = 0;
  let totalWeightKg = 0;
  let exportWeightKg = 0;

  for (const r of tradeRecords) {
    const val = Number(r.primaryValue || 0);
    const w = Number(r.netWgt || 0);
    const flow = String(r.flowCode || '').toUpperCase();

    if (flow === 'X') {
      totalExportsUSD += val;
      exportWeightKg += w;
    } else if (flow === 'M') {
      totalImportsUSD += val;
    }
    totalWeightKg += w;
  }

  const tradeBalance = totalExportsUSD - totalImportsUSD;
  const unitPricePerKg = exportWeightKg > 0 ? totalExportsUSD / exportWeightKg : (totalWeightKg > 0 ? (totalExportsUSD + totalImportsUSD) / totalWeightKg : null);

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Clean Modern Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>{isFa ? 'میزکار تحلیلی بازرگانان' : 'Trader Analytics Hub'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {isFa ? 'تحلیل جامع مبادلات تجاری، گمرکی و لجستیک' : 'Commercial Trade & Logistics Intelligence'}
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            {isFa 
              ? 'استعلام ارقام رسمی گمرکات، ارزش دلاری، وزن، قیمت هر کیلوگرم ($/kg) و شیوه‌های حمل'
              : 'Bilateral commercial flows, commodity HS chapters, unit prices ($/kg), and transport logistics.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-xs font-medium">{isFa ? 'مسیرهای متداول:' : 'Quick Presets:'}</span>
          <button
            onClick={() => {
              setOriginCountry('364'); // Iran
              setDestinationCountry('784'); // UAE
              setSelectedHsCode('TOTAL');
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold transition-colors cursor-pointer"
          >
            🇮🇷 {isFa ? 'ایران ↔ امارات' : 'Iran ↔ UAE'}
          </button>
          <button
            onClick={() => {
              setOriginCountry('364'); // Iran
              setDestinationCountry('156'); // China
              setSelectedHsCode('27'); // Energy
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold transition-colors cursor-pointer"
          >
            🇮🇷 {isFa ? 'ایران ↔ چین' : 'Iran ↔ China'}
          </button>
          <button
            onClick={() => {
              setOriginCountry('276'); // Germany
              setDestinationCountry('842'); // USA
              setSelectedHsCode('87'); // Vehicles
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold transition-colors cursor-pointer"
          >
            🇩🇪 {isFa ? 'آلمان ↔ آمریکا' : 'Germany ↔ USA'}
          </button>
        </div>
      </div>

      {/* Advanced Trader Filter Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              {isFa ? 'فیلترهای پیشرفته تحلیل بازرگانی' : 'Commercial Analysis Filters'}
            </h2>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isFa ? '۲۴۰+ کشور جهان و ۹۹ فصل HS' : '240+ Countries & 99 HS Chapters'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Origin (Exporter) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isFa ? 'کشور مبدأ / صادرکننده (Origin):' : 'Origin / Exporter Country:'}
            </label>
            <div className="relative">
              <select
                id="trader-origin-select"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {ALL_UN_COUNTRIES.filter(c => c.id !== 0).map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.flag} {isFa ? c.nameFa : c.nameEn} ({c.iso} - {c.id})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400">
              {isFa ? `انتخاب فعلی: ${originName}` : `Selected: ${originName}`}
            </p>
          </div>

          {/* 2. Destination (Importer / Partner) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isFa ? 'کشور مقصد / خریدار (Destination):' : 'Destination / Partner Country:'}
            </label>
            <div className="relative">
              <select
                id="trader-dest-select"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {ALL_UN_COUNTRIES.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.flag} {isFa ? c.nameFa : c.nameEn} {c.id !== 0 ? `(${c.iso} - ${c.id})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400">
              {isFa ? `انتخاب فعلی: ${destName}` : `Selected: ${destName}`}
            </p>
          </div>

          {/* 3. HS Chapter / Commodity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isFa ? 'نوع کالا (فصل گمرکی HS):' : 'Commodity (HS Chapter):'}
            </label>
            <select
              id="trader-hs-select"
              value={selectedHsCode}
              onChange={(e) => {
                setSelectedHsCode(e.target.value);
                setCustomHsInput('');
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="TOTAL">{isFa ? 'TOTAL - تمام کالاها (مجموع کل)' : 'TOTAL - All Commodities Aggregated'}</option>
              {ALL_HS_CHAPTERS.map((ch) => (
                <option key={ch.code} value={ch.code}>
                  فصل {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder={isFa ? 'یا کد دقیق ۴ تا ۶ رقمی (مثلاً 0802 پسته)' : 'Or exact 4-6 digit code (e.g. 0802)'}
              value={customHsInput}
              onChange={(e) => setCustomHsInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-mono rounded px-2 py-1 mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 4. Year & Flow Direction */}
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isFa ? 'سال آماری:' : 'Year:'}
                </label>
                <select
                  id="trader-year-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isFa ? 'جریان:' : 'Flow:'}
                </label>
                <select
                  id="trader-flow-select"
                  value={flowDirection}
                  onChange={(e) => setFlowDirection(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="both">{isFa ? 'صادرات و واردات' : 'Both Flows'}</option>
                  <option value="export">{isFa ? 'فقط صادرات (X)' : 'Exports only'}</option>
                  <option value="import">{isFa ? 'فقط واردات (M)' : 'Imports only'}</option>
                </select>
              </div>
            </div>

            <button
              id="trader-run-btn"
              onClick={executeTraderAnalysis}
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'استعلام فوری از سازمان ملل' : 'Run Commercial Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mirror Mode Active Badge Banner */}
      {isMirrorMode && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-xl text-xs flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <ArrowRightLeft className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-purple-950 flex items-center gap-2">
                <span>{isFa ? 'داده‌های آینه‌ای فعال است (Mirror Trade Statistics)' : 'Mirror Data Active'}</span>
                <span className="bg-purple-200 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {isFa ? `اظهار شده توسط گمرک ${mirrorDataSource}` : `Reported by ${mirrorDataSource} Customs`}
                </span>
              </div>
              <p className="text-purple-700 mt-1 leading-relaxed">
                {isFa
                  ? `به دلیل عدم ارسال اظهارنامه مستقیم برای این دوره، داده‌ها بر اساس اظهارنامه‌های رسمی واردات و صادرات گمرک ${mirrorDataSource} معکوس و متقارن‌سازی شده‌اند.`
                  : `Trade records are extracted from ${mirrorDataSource} official customs mirror filings to reflect trade flows for this non-reporting period.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsMirrorMode(false);
              executeTraderAnalysis(false);
            }}
            className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline whitespace-nowrap"
          >
            {isFa ? 'بازگشت به حالت مستقیم' : 'Return to Direct Mode'}
          </button>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && tradeRecords.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده استعلام و ارزیابی تجارت بین‌الملل' : 'Ready for Commercial Trade Analysis'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور مبدأ، مقصد و کد کالا را در کادر بالا مشخص کرده و برای دریافت آنی اطلاعات روی دکمه «استعلام فوری از سازمان ملل» کلیک کنید.'
              : 'Configure the origin, destination, and commodity code above, then click "Run Commercial Analysis" to fetch live data.'}
          </p>
        </div>
      )}

      {/* Non-Reporting Country / Empty Data Helper for Iran and similar cases */}
      {hasExecuted && !loading && tradeRecords.length === 0 && !error && (
        <div className="bg-amber-50/90 border border-amber-200 p-5 rounded-xl text-xs text-amber-950 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-amber-900">
                {isFa 
                  ? `عدم وجود اظهارنامه مستقیم برای ${originName} در سال ${selectedPeriod}` 
                  : `No Direct Customs Filings for ${originName} in ${selectedPeriod}`}
              </div>
              <p className="text-amber-800 leading-relaxed">
                {isFa 
                  ? originCountry === '364'
                    ? `گمرک جمهوری اسلامی ایران (IRICA) داده‌های سال‌های ۲۰۲۲، ۲۰۲۳ و ۲۰۲۴ را مستقیماً به سازمان ملل (UN Comtrade) ارسال نکرده است. سازمان ملل و تجار بین‌المللی برای بررسی تجارت ایران در این سال‌ها از «آمار آینه‌ای (Mirror Data)» گمرک کشورهای همکار استفاده می‌کنند.`
                    : `کشور مبدأ انتخابی در سال ${selectedPeriod} اظهارنامه مستقیم به دبیرخانه سازمان ملل ارائه نکرده است. برای بررسی ارقام تجاری می‌توانید از آمار آینه‌ای گمرک کشور مقصد یا سال‌های قبل استفاده نمایید.`
                  : `The origin country has not filed direct annual returns to UN Comtrade for ${selectedPeriod}. Standard UN practice is to examine Mirror Statistics reported by the partner country.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-amber-200/60">
            {destinationCountry !== '0' && (
              <button
                onClick={() => executeTraderAnalysis(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isFa ? `مشاهده آمار آینه‌ای ثبت‌شده توسط گمرک ${destName}` : `Load Mirror Data from ${destName}`}</span>
              </button>
            )}

            <button
              onClick={() => setSelectedPeriod('2021')}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isFa ? 'مشاهده آخرین سال با داده‌های مستقیم (۲۰۲۱)' : 'Switch to Latest Direct Year (2021)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message if any */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام وب‌سرویس سازمان ملل:' : 'UN Comtrade API Message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards for Trader */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Exports */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{isFa ? `صادرات ${originName} به ${destName}` : 'Reported Exports'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatUSD(totalExportsUSD, language)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span>{isFa ? 'خروجی گمرک رسمی (FOB)' : 'Official Export Flow (FOB)'}</span>
          </div>
        </div>

        {/* Total Imports */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{isFa ? `واردات ${originName} از ${destName}` : 'Reported Imports'}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatUSD(totalImportsUSD, language)}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
            <span>{isFa ? 'ورودی گمرک رسمی (CIF)' : 'Official Import Flow (CIF)'}</span>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{isFa ? 'تراز بازرگانی دوجانبه' : 'Bilateral Trade Balance'}</span>
            <Scale className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className={`text-2xl font-black font-mono mt-1 ${tradeBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {tradeBalance >= 0 ? '+' : ''}{formatUSD(tradeBalance, language)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {tradeBalance >= 0 ? (isFa ? 'مازاد تراز تجاری (Surplus)' : 'Trade Surplus') : (isFa ? 'کسری تراز تجاری (Deficit)' : 'Trade Deficit')}
          </div>
        </div>

        {/* Unit Price per Kg ($/kg) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{isFa ? 'قیمت میانگین وزنی ($/kg)' : 'Unit Price ($/kg)'}</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {unitPricePerKg !== null ? `$${unitPricePerKg.toFixed(2)} / kg` : (isFa ? 'بدون گزارش وزن' : 'No weight data')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalWeightKg > 0 ? `${isFa ? 'کل وزن محموله‌ها:' : 'Total Weight:'} ${formatWeightKg(totalWeightKg, language)}` : (isFa ? 'محاسبه شده بر مبنای تناژ' : 'Calculated by tonnage')}
          </div>
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isFa ? 'گزارش و جدول کامل جریان‌ها' : 'Detailed Flow Breakdown'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-5 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{isFa ? 'ارزیابی ارزش و قیمت وزنی ($/kg)' : 'Unit Pricing & Weights'}</span>
          </button>

          <button
            onClick={() => setActiveTab('mirror')}
            className={`px-5 py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mirror'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isFa ? 'تحلیل داده‌های آینه‌ای و مغایرت (Mirror Data)' : 'Mirror Data & Asymmetries'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="p-3 text-start">{isFa ? 'کد کالا (HS)' : 'HS Code'}</th>
                      <th className="p-3 text-start">{isFa ? 'شرح کالا' : 'Commodity Description'}</th>
                      <th className="p-3 text-start">{isFa ? 'نوع جریان' : 'Flow'}</th>
                      <th className="p-3 text-end">{isFa ? 'ارزش دلاری (USD)' : 'Trade Value (USD)'}</th>
                      <th className="p-3 text-end">{isFa ? 'وزن خالص' : 'Net Weight'}</th>
                      <th className="p-3 text-end">{isFa ? 'نرخ واحد ($/kg)' : 'Unit Rate ($/kg)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tradeRecords.length > 0 ? (
                      tradeRecords.map((r: any, idx: number) => {
                        const val = Number(r.primaryValue || 0);
                        const w = Number(r.netWgt || 0);
                        const unitRate = w > 0 ? val / w : null;
                        const isExp = String(r.flowCode).toUpperCase() === 'X';

                        return (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-mono font-bold text-slate-900">{r.cmdCode}</td>
                            <td className="p-3 text-slate-700 max-w-xs truncate">{r.cmdDesc || selectedHsCode}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isExp ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {r.flowDesc || (isExp ? (isFa ? 'صادرات' : 'Export') : (isFa ? 'واردات' : 'Import'))}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-end text-slate-900">{formatUSD(val, language)}</td>
                            <td className="p-3 font-mono text-end text-slate-600">{formatWeightKg(w, language)}</td>
                            <td className="p-3 font-mono text-end text-amber-700 font-semibold">
                              {unitRate !== null ? `$${unitRate.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          {loading ? (isFa ? 'در حال استعلام رکوردهای تجاری...' : 'Querying trade flows...') : (isFa ? 'رکوردی برای این ترکیب فیلتر یافت نشد.' : 'No records found for this combination.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Pricing */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{isFa ? 'راهنمای ارزش‌گذاری گمرکی و قیمت پایه صادرات/واردات:' : 'Customs Valuation & Base Unit Pricing Guide:'}</div>
                  <div className="text-slate-600 mt-1 leading-relaxed">
                    {isFa 
                      ? 'شاخص دلار بر کیلوگرم ($/kg) به بازرگان کمک می‌کند تا قیمت تمام‌شده محموله را با استانداردهای اظهارشده در گمرک جهانی مقایسه کند و از بروز جرایم بیش‌بود یا کم‌اظهاری ارزش در گمرکات جلوگیری نماید.'
                      : 'The $/kg unit value metric helps exporters and importers evaluate real transaction benchmarks against official customs filings.'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 mb-2">{isFa ? 'مجموع ارزش و وزن صادراتی' : 'Export Value & Weight'}</div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">{isFa ? 'ارزش کل صادرات:' : 'Total Export Value:'}</span>
                      <span className="font-bold text-emerald-700">{formatUSD(totalExportsUSD, language)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">{isFa ? 'وزن کل صادرات:' : 'Total Export Weight:'}</span>
                      <span className="font-bold text-slate-800">{formatWeightKg(exportWeightKg, language)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">{isFa ? 'قیمت میانگین صادرات:' : 'Avg Export Price:'}</span>
                      <span className="font-bold text-amber-600">
                        {exportWeightKg > 0 ? `$${(totalExportsUSD / exportWeightKg).toFixed(2)} / kg` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 mb-2">{isFa ? 'مجموع ارزش و وزن وارداتی' : 'Import Value & Weight'}</div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">{isFa ? 'ارزش کل واردات:' : 'Total Import Value:'}</span>
                      <span className="font-bold text-blue-700">{formatUSD(totalImportsUSD, language)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">{isFa ? 'وزن کل واردات:' : 'Total Import Weight:'}</span>
                      <span className="font-bold text-slate-800">{formatWeightKg(totalWeightKg - exportWeightKg, language)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">{isFa ? 'قیمت میانگین واردات:' : 'Avg Import Price:'}</span>
                      <span className="font-bold text-amber-600">
                        {(totalWeightKg - exportWeightKg) > 0 ? `$${(totalImportsUSD / (totalWeightKg - exportWeightKg)).toFixed(2)} / kg` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Mirror Data */}
          {activeTab === 'mirror' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-3">
                <ArrowRightLeft className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{isFa ? 'بررسی عدم تقارن آمار گمرکی (Mirror Data Asymmetries):' : 'Bilateral Mirror Data Verification:'}</div>
                  <div className="text-slate-600 mt-1 leading-relaxed">
                    {isFa 
                      ? `مقایسه صادرات ثبت‌شده از مبدأ ${originName} به مقصد ${destName} با واردات ثبت‌شده توسط گمرک ${destName} از مبدأ ${originName}.`
                      : `Comparing origin reported exports with destination reported imports to spot reporting anomalies.`}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="p-2.5 text-start">{isFa ? 'جریان' : 'Flow'}</th>
                      <th className="p-2.5 text-end">{isFa ? `اظهار ${originName}` : 'Reported'}</th>
                      <th className="p-2.5 text-end">{isFa ? `آمار آینه‌ای ${destName}` : 'Mirror Reported'}</th>
                      <th className="p-2.5 text-end">{isFa ? 'اختلاف (Gap)' : 'Difference'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bilateralRecords.length > 0 ? (
                      bilateralRecords.map((r: any, idx: number) => {
                        const rep = Number(r.primaryValue || r.reporterValue || 0);
                        const mir = Number(r.mirrorPrimaryValue || r.mirrorValue || 0);
                        const diff = rep - mir;

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-800">{r.flowDesc || r.flowCode || 'Trade Flow'}</td>
                            <td className="p-2.5 font-mono text-end font-bold text-purple-700">{formatUSD(rep, language)}</td>
                            <td className="p-2.5 font-mono text-end font-bold text-sky-700">{formatUSD(mir, language)}</td>
                            <td className="p-2.5 font-mono text-end">
                              <span className={`px-2 py-0.5 rounded ${diff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {diff >= 0 ? '+' : ''}{formatUSD(diff, language)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">
                          {isFa ? 'برای این جفت کشور داده آینه‌ای در دیتاسِت ثبت نشده است.' : 'No mirror discrepancy records available.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
