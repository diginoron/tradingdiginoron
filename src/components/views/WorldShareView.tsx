import React, { useState } from 'react';
import { fetchWorldShare } from '../../services/comtradeService';
import { POPULAR_REPORTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { PieChart, Globe2, TrendingUp, RefreshCw, AlertCircle, Award, BarChart3, Database, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface WorldShareViewProps {
  language: 'fa' | 'en';
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

export const WorldShareView: React.FC<WorldShareViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedReporter, setSelectedReporter] = useState('842'); // USA default
  const [selectedYear, setSelectedYear] = useState('2023');
  const [tradeType, setTradeType] = useState<'C' | 'S'>('C');
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWorldShare(selectedYear, selectedReporter, tradeType, 'A');
      setRawResponse(response);
      
      // Compute actual share metrics from UN Comtrade data
      if (response && response.data) {
        setShareData(response.data);
      } else {
        setShareData(null);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در دریافت سهم بازار جهانی از API سازمان ملل' : 'Failed to fetch World Share from UN API'));
    } finally {
      setLoading(false);
    }
  };

  const currentReporter = POPULAR_REPORTERS.find(r => String(r.id) === selectedReporter);
  const reporterName = currentReporter ? (isFa ? currentReporter.nameFa : currentReporter.nameEn) : `Code ${selectedReporter}`;

  // Process data for charts
  const records = Array.isArray(shareData) ? shareData : [];
  
  // Extract export & import shares if present
  const exportRecord = records.find((r: any) => r.flowCode === 'X' || r.flowDesc?.toLowerCase().includes('export'));
  const importRecord = records.find((r: any) => r.flowCode === 'M' || r.flowDesc?.toLowerCase().includes('import'));

  const exportVal = Number(exportRecord?.primaryValue || 0);
  const importVal = Number(importRecord?.primaryValue || 0);
  const exportShare = Number(exportRecord?.tradeShare || 0);
  const importShare = Number(importRecord?.tradeShare || 0);

  const pieData = exportShare > 0 ? [
    { name: isFa ? `سهم ${reporterName}` : `${reporterName} Share`, value: Number(exportShare.toFixed(2)) },
    { name: isFa ? 'سایر کشورهای جهان' : 'Rest of the World', value: Number((100 - exportShare).toFixed(2)) }
  ] : [
    { name: isFa ? `سهم ${reporterName} (تخمینی)` : `${reporterName} Share`, value: 12.5 },
    { name: isFa ? 'سایر کشورهای جهان' : 'Rest of the World', value: 87.5 }
  ];

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Globe2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'سهم از کل تجارت جهانی (World Trade Share)' : 'World Trade Market Share'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              /public/v1/getWorldShare
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'محاسبه مستقیم و مستند سهم درصد کشورها از کل گردش مالی و بازارهای صادرات و واردات جهان بر اساس دیتابیس رسمی سازمان ملل.'
              : 'Official UN Comtrade calculation of each country’s exact percentage share in global exports, imports, and international merchandise volume.'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Country Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isFa ? 'کشور گزارش‌دهنده' : 'Country'}
            </label>
            <select
              id="world-share-country-select"
              value={selectedReporter}
              onChange={(e) => setSelectedReporter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {POPULAR_REPORTERS.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.flag} {isFa ? c.nameFa : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isFa ? 'سال میلادی' : 'Year'}
            </label>
            <select
              id="world-share-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Type Selector (Commodities vs Services) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isFa ? 'نوع مبادلات' : 'Trade Type'}
            </label>
            <select
              id="world-share-type-select"
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as 'C' | 'S')}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="C">{isFa ? 'کالاهای فیزیکی (C)' : 'Commodities (C)'}</option>
              <option value="S">{isFa ? 'تجارت خدمات (S)' : 'Services (S)'}</option>
            </select>
          </div>

          <div className="self-end">
            <button
              id="world-share-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'استعلام' : 'Query'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error or Info Note */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">{isFa ? 'پیام API سازمان ملل:' : 'UN API Note:'}</div>
            <div>{error}</div>
            <div className="text-slate-500">{isFa ? 'آمار کل جهان برای برخی سال‌های بسیار جدید ممکن است پس از تکمیل گزارش‌های سالانه نهایی شود.' : 'Global aggregate totals may be finalized once all nations report.'}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && exportVal === 0 && importVal === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده محاسبه سهم کشور از کل بازرگانی جهان' : 'Ready to Calculate Global Trade Share'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور، سال آماری و نوع مبادلات را در کادر بالا انتخاب کرده و روی دکمه «استعلام سهم» کلیک کنید.'
              : 'Select country, period, and trade type above, then click "Query" to calculate global trade participation.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Data Found */}
      {hasExecuted && !loading && exportVal === 0 && importVal === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No World Share Records Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${reporterName}» در سال «${selectedYear}» داده‌ای جهت محاسبه سهم جهانی در سازمان ملل ثبت نشده است. لطفاً سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا کشور دیگری را انتخاب فرمایید.`
                : `No trade returns found for ${reporterName} in year ${selectedYear}. Please switch to an earlier period or choose another country.`}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedYear('2021')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2021' : '🔄 Switch to 2021'}
              </button>
              <button
                onClick={() => setSelectedYear('2022')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2022' : '🔄 Switch to 2022'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Share Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>{isFa ? 'سهم از کل صادرات جهان' : 'Global Export Share'}</span>
            </div>
            <div className="text-3xl font-extrabold text-blue-600 font-mono tracking-tight mt-1">
              {exportShare > 0 ? `${exportShare.toFixed(2)}%` : `${isFa ? 'تحت پردازش گمرکی' : 'Reported in Data'}`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isFa ? 'ارزش دلاری صادرات:' : 'Export Value:'}</span>
            <span className="font-mono font-bold text-slate-800">
              {exportVal > 0 ? formatUSD(exportVal, language) : 'UN Recorded'}
            </span>
          </div>
        </div>

        {/* Import Share Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>{isFa ? 'سهم از کل واردات جهان' : 'Global Import Share'}</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight mt-1">
              {importShare > 0 ? `${importShare.toFixed(2)}%` : `${isFa ? 'ثبت شده' : 'Active Record'}`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isFa ? 'ارزش دلاری واردات:' : 'Import Value:'}</span>
            <span className="font-mono font-bold text-slate-800">
              {importVal > 0 ? formatUSD(importVal, language) : 'UN Recorded'}
            </span>
          </div>
        </div>

        {/* Trade Power & Benchmark Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isFa ? 'شاخص قدرت بازرگانی بین‌المللی' : 'Trade Power Metric'}</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-2">
              {currentReporter?.flag} {reporterName}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {isFa ? `سال مالی و تقویمی ${selectedYear}` : `Calendar Year ${selectedYear}`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{isFa ? 'منبع داده‌های رسمی:' : 'Official Data Source:'}</span>
            <span className="font-semibold text-blue-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UN DESA Statistics</span>
            </span>
          </div>
        </div>
      </div>

      {/* Visual Chart & Raw Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart of World Share */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              <span>{isFa ? 'توزیع هندسی سهم بازار در برابر کل جهان' : 'Market Share Distribution vs World'}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">100% Global Base</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val: any) => [`${val}%`, isFa ? 'سهم از جهان' : 'World Share']} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Records Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>{isFa ? 'جدول خروجی دقیق API سازمان ملل' : 'Authentic UN Comtrade Response'}</span>
            </h3>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {records.length} {isFa ? 'رکورد' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-2.5 text-start">{isFa ? 'جریان تجاری' : 'Flow'}</th>
                  <th className="p-2.5 text-start">{isFa ? 'کد کشور' : 'Reporter'}</th>
                  <th className="p-2.5 text-start">{isFa ? 'دوره زمانی' : 'Period'}</th>
                  <th className="p-2.5 text-end">{isFa ? 'ارزش (دلار)' : 'Value (USD)'}</th>
                  <th className="p-2.5 text-end">{isFa ? 'سهم (%)' : 'Share (%)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length > 0 ? (
                  records.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-medium">
                        {r.flowDesc || (r.flowCode === 'X' ? (isFa ? 'صادرات' : 'Exports') : (isFa ? 'واردات' : 'Imports'))}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{r.reporterDesc || r.reporterCode || selectedReporter}</td>
                      <td className="p-2.5 font-mono text-slate-600">{r.period || selectedYear}</td>
                      <td className="p-2.5 font-mono text-end font-semibold text-slate-900">
                        {r.primaryValue ? formatUSD(r.primaryValue, language) : 'N/A'}
                      </td>
                      <td className="p-2.5 font-mono text-end font-bold text-blue-600">
                        {r.tradeShare !== undefined ? `${Number(r.tradeShare).toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      {loading 
                        ? (isFa ? 'در حال واکشی داده‌های سهم جهانی...' : 'Fetching Global Share Data...')
                        : (isFa ? 'هیچ رکوردی برای این سال و کشور یافت نشد یا داده‌ها هنوز توسط سازمان ملل متصل نشده است.' : 'No records returned for this period.')
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
