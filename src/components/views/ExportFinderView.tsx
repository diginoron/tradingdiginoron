import React, { useState } from 'react';
import { ALL_UN_COUNTRIES } from '../../data/allCountries';
import { ALL_HS_CHAPTERS } from '../../data/hsChapters';
import { AVAILABLE_YEARS } from '../../data/referenceData';
import { fetchComtradeData } from '../../services/comtradeService';
import { formatUSD, formatWeightKg } from '../../lib/utils';
import { 
  Target, 
  TrendingUp, 
  Globe2, 
  RefreshCw, 
  AlertCircle, 
  Award, 
  Search, 
  ArrowUpRight, 
  Layers, 
  PieChart as PieIcon,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

interface ExportFinderViewProps {
  language: 'fa' | 'en';
}

const BAR_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#10b981', '#059669', '#f59e0b', '#d97706', '#8b5cf6', '#7c3aed', '#ec4899'];

export const ExportFinderView: React.FC<ExportFinderViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [originCountry, setOriginCountry] = useState<string>('364'); // Iran
  const [selectedHsCode, setSelectedHsCode] = useState<string>('08'); // Fruits / Nuts (Pistachio)
  const [customHsInput, setCustomHsInput] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2023');
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exportDestinations, setExportDestinations] = useState<any[]>([]);

  const loadExportTargets = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    const cmdCode = customHsInput.trim() ? customHsInput.trim() : selectedHsCode;

    try {
      // Query export flow (X) from origin country to all partners
      const response = await fetchComtradeData({
        reporterCode: originCountry,
        partnerCode: undefined, // all partners
        period: selectedPeriod,
        cmdCode: cmdCode,
        flowCode: 'X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS',
        includeDesc: true
      });

      if (response && response.data) {
        // Exclude World total code 0 to rank individual target countries
        const individualPartners = response.data.filter((r: any) => Number(r.partnerCode) !== 0 && Number(r.primaryValue) > 0);
        // Sort descending by export value
        individualPartners.sort((a: any, b: any) => Number(b.primaryValue || 0) - Number(a.primaryValue || 0));
        setExportDestinations(individualPartners);
      } else {
        setExportDestinations([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در واکشی مقاصد صادراتی' : 'Failed to fetch export destinations'));
    } finally {
      setLoading(false);
    }
  };

  const originObj = ALL_UN_COUNTRIES.find(c => String(c.id) === originCountry);
  const originName = originObj ? (isFa ? originObj.nameFa : originObj.nameEn) : `Country ${originCountry}`;

  const totalExportSum = exportDestinations.reduce((acc, cur) => acc + Number(cur.primaryValue || 0), 0);

  // Top 10 for bar chart
  const chartData = exportDestinations.slice(0, 10).map((r: any) => {
    const partnerObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(r.partnerCode));
    const pName = partnerObj ? (isFa ? partnerObj.nameFa : partnerObj.nameEn) : (r.partnerDesc || `Country ${r.partnerCode}`);
    const val = Number(r.primaryValue || 0);
    const share = totalExportSum > 0 ? (val / totalExportSum) * 100 : 0;

    return {
      name: pName,
      code: r.partnerCode,
      value: val,
      share: share.toFixed(1)
    };
  });

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'کاوشگر بازارهای هدف صادراتی (Export Target Markets Finder)' : 'Global Export Target Markets Finder'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'کشف بزرگترین خریداران و مقاصد تقاضای کالای شما در سراسر جهان؛ رتبه‌بندی کشورها بر اساس ارزش صادرات، سهم بازار و تناژ.'
              : 'Discover top destination markets and global buyers for your commodities; rank target countries by dollar value, share, and tonnage.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Origin */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'کشور صادرکننده' : 'Exporter'}</label>
            <select
              id="export-origin-select"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {ALL_UN_COUNTRIES.filter(c => c.id !== 0).map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.flag} {isFa ? c.nameFa : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* HS Commodity */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'کالای صادراتی' : 'Commodity'}</label>
            <select
              id="export-hs-select"
              value={selectedHsCode}
              onChange={(e) => {
                setSelectedHsCode(e.target.value);
                setCustomHsInput('');
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="TOTAL">{isFa ? 'TOTAL - تمام اقلام صادراتی' : 'TOTAL - All Export Products'}</option>
              {ALL_HS_CHAPTERS.map((ch) => (
                <option key={ch.code} value={ch.code}>
                  فصل {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'سال' : 'Year'}</label>
            <select
              id="export-year-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              id="export-refresh-btn"
              onClick={loadExportTargets}
              disabled={loading}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'کشف بازارها' : 'Find Markets'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام وب‌سرویس سازمان ملل:' : 'UN Comtrade Message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && exportDestinations.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده شناسایی و رتبه‌بندی مقاصد صادراتی' : 'Ready to Discover Export Target Markets'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور صادرکننده، کالای صادراتی و سال را در نوار بالا تعیین کرده و روی دکمه «کشف بازارها» کلیک کنید.'
              : 'Configure exporter country, commodity, and period above, then click "Find Markets" to rank destinations.'}
          </p>
        </div>
      )}

      {/* Non-reporting helper if 0 destinations found */}
      {hasExecuted && !loading && exportDestinations.length === 0 && !error && (
        <div className="bg-amber-50/90 border border-amber-200 p-5 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-900 text-sm">
                {isFa 
                  ? `عدم ثبت گزارش مستقیم صادرات برای ${originName} در سال ${selectedPeriod}` 
                  : `No Direct Export Records for ${originName} in ${selectedPeriod}`}
              </div>
              <p className="text-amber-800 leading-relaxed max-w-2xl">
                {isFa
                  ? originCountry === '364'
                    ? `گمرک ایران فایل‌های رسمی جامع سال‌های ۲۰۲۲، ۲۰۲۳ و ۲۰۲۴ را به سازمان ملل ارائه نکرده است. برای مشاهده مقاصد اصلی صادراتی ایران، سال ۲۰۲۱ (دارای گزارش کامل) را مشاهده نمایید یا در «داشبورد جامع بازرگان» از آمار آینه‌ای گمرکات مقاصد استفاده کنید.`
                    : `داده‌های مستقیم اظهارشده برای این کشور در سال ${selectedPeriod} موجود نیست. می‌توانید سال‌های قبل‌تر مانند ۲۰۲۱ را بررسی نمایید.`
                  : `Direct export returns are not available for ${selectedPeriod}. Consider viewing 2021 or utilizing bilateral mirror tools.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPeriod('2021')}
            className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isFa ? 'بررسی سال ۲۰۲۱ (گزارش کامل)' : 'Switch to 2021'}</span>
          </button>
        </div>
      )}

      {/* Top 3 Destination Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {exportDestinations.slice(0, 3).map((target: any, idx: number) => {
          const pObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(target.partnerCode));
          const pName = pObj ? (isFa ? pObj.nameFa : pObj.nameEn) : (target.partnerDesc || `Country ${target.partnerCode}`);
          const pFlag = pObj?.flag || '🌐';
          const val = Number(target.primaryValue || 0);
          const share = totalExportSum > 0 ? (val / totalExportSum) * 100 : 0;

          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{pFlag}</span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {isFa ? `رتبه ${idx + 1} مقصد صادراتی` : `Rank #${idx + 1} Export Target`}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{pName}</h4>
                  </div>
                </div>
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-2">
                {formatUSD(val, language)}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex justify-between">
                <span>{isFa ? 'سهم از کل صادرات:' : 'Market Share:'}</span>
                <span className="font-bold text-blue-600 font-mono">{share.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top 10 Destinations Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>{isFa ? `۱۰ مقصد اول صادراتی از مبدأ ${originName}` : `Top 10 Export Destinations from ${originName}`}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">USD Value</span>
        </div>

        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                <RechartsTooltip formatter={(val: any) => [formatUSD(val, language), isFa ? 'ارزش صادرات' : 'Export Value']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              {loading ? (isFa ? 'در حال تحلیل بازارهای جهانی...' : 'Analyzing target markets...') : (isFa ? 'رکوردی بازگردانده نشد.' : 'No export targets found.')}
            </div>
          )}
        </div>
      </div>

      {/* Complete Target Markets Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <span>{isFa ? 'جدول کامل تمام کشورهای خریدار و واردکننده' : 'All Destination Markets Ranking Table'}</span>
          </h3>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {exportDestinations.length} {isFa ? 'کشور خریدار' : 'markets'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-2.5 text-start">{isFa ? 'رتبه' : 'Rank'}</th>
                <th className="p-2.5 text-start">{isFa ? 'کشور مقصد / خریدار' : 'Destination Market'}</th>
                <th className="p-2.5 text-start">{isFa ? 'کد ISO' : 'ISO3'}</th>
                <th className="p-2.5 text-end">{isFa ? 'ارزش دلاری (USD)' : 'Export Value (USD)'}</th>
                <th className="p-2.5 text-end">{isFa ? 'سهم از بازار' : 'Market Share'}</th>
                <th className="p-2.5 text-end">{isFa ? 'وزن محموله‌ها' : 'Weight (kg)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exportDestinations.length > 0 ? (
                exportDestinations.map((t: any, idx: number) => {
                  const pObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(t.partnerCode));
                  const pName = pObj ? (isFa ? pObj.nameFa : pObj.nameEn) : (t.partnerDesc || `Country ${t.partnerCode}`);
                  const pFlag = pObj?.flag || '🌐';
                  const val = Number(t.primaryValue || 0);
                  const w = Number(t.netWgt || 0);
                  const share = totalExportSum > 0 ? (val / totalExportSum) * 100 : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-400 font-mono">#{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-2">
                        <span>{pFlag}</span>
                        <span>{pName}</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-500">{pObj?.iso || t.partnerISO || '-'}</td>
                      <td className="p-2.5 font-mono font-bold text-end text-blue-700">{formatUSD(val, language)}</td>
                      <td className="p-2.5 font-mono text-end font-semibold text-emerald-600">{share.toFixed(1)}%</td>
                      <td className="p-2.5 font-mono text-end text-slate-600">{formatWeightKg(w, language)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {loading ? (isFa ? 'در حال واکشی...' : 'Loading...') : (isFa ? 'رکوردی ثبت نشده است.' : 'No destinations found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
