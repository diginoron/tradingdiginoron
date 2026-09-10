import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, ALL_HS_CHAPTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Calendar, TrendingUp, RefreshCw, AlertCircle, BarChart3, Sun, Snowflake } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MonthlySeasonalityViewProps {
  language: 'fa' | 'en';
}

export const MonthlySeasonalityView: React.FC<MonthlySeasonalityViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [reporterCountry, setReporterCountry] = useState<string>('842'); // USA (Full monthly reporting)
  const [partnerCountry, setPartnerCountry] = useState<string>('0'); // World
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [selectedHsCode, setSelectedHsCode] = useState<string>('08'); // Fruit & Nuts
  const [flowDirection, setFlowDirection] = useState<'X' | 'M'>('M');

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [peakMonth, setPeakMonth] = useState<string | null>(null);
  const [lowMonth, setLowMonth] = useState<string | null>(null);

  const monthNamesFa = ['فروردین/ژانویه', 'اردیبهشت/فوریه', 'خرداد/مارس', 'تیر/آوریل', 'مرداد/مه', 'شهریور/ژوئن', 'مهر/ژوئیه', 'آبان/اوت', 'آذر/سپتامبر', 'دی/اکتبر', 'بهمن/نوامبر', 'اسفند/دسامبر'];
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const loadMonthlySeasonality = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);

    try {
      // Query 12 months for the year: e.g. 202301, 202302, ... 202312
      const months = Array.from({ length: 12 }, (_, i) => `${selectedYear}${String(i + 1).padStart(2, '0')}`);
      const periodParam = months.join(',');

      const res = await fetchComtradeData({
        reporterCode: reporterCountry,
        partnerCode: partnerCountry,
        period: periodParam,
        cmdCode: selectedHsCode,
        flowCode: flowDirection,
        typeCode: 'C',
        freqCode: 'M',
        clCode: 'HS'
      });

      const records = res?.data || [];
      const monthMap = new Map<string, number>();

      records.forEach((r: any) => {
        const periodStr = String(r.period);
        const val = Number(r.primaryValue || 0);
        monthMap.set(periodStr, (monthMap.get(periodStr) || 0) + val);
      });

      const chartPoints = months.map((m, idx) => {
        const val = monthMap.get(m) || 0;
        return {
          monthCode: m,
          name: isFa ? monthNamesFa[idx] : monthNamesEn[idx],
          shortName: isFa ? `ماه ${idx + 1}` : monthNamesEn[idx],
          value: val
        };
      });

      // Find peaks
      let maxVal = -1;
      let minVal = Infinity;
      let pMonth = '';
      let lMonth = '';

      chartPoints.forEach((p) => {
        if (p.value > maxVal) {
          maxVal = p.value;
          pMonth = p.name;
        }
        if (p.value > 0 && p.value < minVal) {
          minVal = p.value;
          lMonth = p.name;
        }
      });

      setMonthlyData(chartPoints);
      setPeakMonth(maxVal > 0 ? pMonth : null);
      setLowMonth(minVal < Infinity ? lMonth : null);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch monthly seasonality');
    } finally {
      setLoading(false);
    }
  };

  const repObj = ALL_UN_COUNTRIES.find(c => String(c.id) === reporterCountry);
  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : `Country ${reporterCountry}`;

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'دیده‌بان نوسانات فصلی و تقویم ماهانه تقاضا (Monthly Seasonality Tracker)' : 'Monthly Seasonality & Demand Peaks Tracker'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              freqCode: M (12 Months)
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'تحلیل ماه‌های اوج تقاضا و افت فصلی بازار در طول ۱۲ ماه سال جهت زمان‌بندی دقیق ثبت سفارش، خرید عمده و پیش‌بینی قیمت‌های جهانی.'
              : 'Analyze month-by-month demand surges and cyclical troughs across 12 months.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={reporterCountry}
            onChange={(e) => setReporterCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {ALL_UN_COUNTRIES.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.flag} {isFa ? c.nameFa : c.nameEn}
              </option>
            ))}
          </select>

          <select
            value={selectedHsCode}
            onChange={(e) => setSelectedHsCode(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium max-w-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {ALL_HS_CHAPTERS.map((ch) => (
              <option key={ch.code} value={ch.code}>
                فصل {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
              </option>
            ))}
          </select>

          <select
            value={flowDirection}
            onChange={(e) => setFlowDirection(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="M">{isFa ? 'تقاضای وارداتی (Monthly Imports)' : 'Monthly Imports (M)'}</option>
            <option value="X">{isFa ? 'فروش صادراتی (Monthly Exports)' : 'Monthly Exports (X)'}</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={loadMonthlySeasonality}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'تحلیل تقویم فصلی' : 'Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Initial Ready State */}
      {!hasExecuted && !loading && (!peakMonth || monthlyData.every(m => m.value === 0)) && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده بررسی تقویم و نوسانات فصلی ۱۲ ماهه تقاضا' : 'Ready for 12-Month Seasonality & Cyclical Demand Analysis'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور، فصل گمرکی، سال و جهت تجارت را در کادر بالا انتخاب کرده و روی دکمه «تحلیل نوسانات فصلی» کلیک کنید.'
              : 'Select country, HS chapter, year, and flow above, then click "Analyze" to inspect seasonal demand patterns.'}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام:' : 'Message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Empty State Banner when No Monthly Data Found */}
      {hasExecuted && !loading && !error && (!peakMonth || monthlyData.every(m => m.value === 0)) && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Monthly Trade Series Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${repName}» در سال «${selectedYear}» سری زمانی ماهانه (۱۲ ماه) در پایگاه داده UN Comtrade ثبت نشده است. توجه فرمایید که داده‌های ماهانه عموماً توسط کشورهای توسعه‌یافته با فرکانس ماهانه ارائه می‌شود. لطفاً کشور یا سال دیگری را انتخاب فرمایید.`
                : `No monthly trade frequency series found for ${repName} in year ${selectedYear}. Please choose another reporting country (e.g. USA, Germany, Japan) or switch year.`}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setReporterCountry('842')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تست با ایالات متحده (USA 2023)' : '🔄 Test with USA 2023'}
              </button>
              <button
                onClick={() => setReporterCountry('276')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تست با آلمان (Germany 2023)' : '🔄 Test with Germany 2023'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Highlights & Charts if data exists */}
      {!loading && peakMonth && monthlyData.some(m => m.value > 0) && (
        <>
          {/* Highlights: Peak & Low Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <span className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Sun className="w-6 h-6" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">{isFa ? 'ماه اوج تقاضا (Peak Month)' : 'Peak Demand Month'}</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{peakMonth || (isFa ? 'در حال ارزیابی' : 'Analyzing')}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Snowflake className="w-6 h-6" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">{isFa ? 'ماه رکود و افت تقاضا (Trough Month)' : 'Trough Month'}</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{lowMonth || (isFa ? 'در حال ارزیابی' : 'Analyzing')}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">{isFa ? 'تعداد ماه‌های فعال' : 'Active Months'}</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">12 {isFa ? 'ماه سال' : 'months'}</div>
              </div>
            </div>
          </div>

          {/* 12 Months Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{isFa ? `روند تغییرات ارزش تجاری در ۱۲ ماه سال ${selectedYear}` : `Monthly Value Trend for ${selectedYear}`}</span>
              <span className="text-xs font-mono text-slate-400">UN Comtrade Monthly Series</span>
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                  <YAxis tickFormatter={(v) => formatUSD(v, language)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [formatUSD(Number(v), language), isFa ? 'ارزش ماهانه' : 'Monthly Value']} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
