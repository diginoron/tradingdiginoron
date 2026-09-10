import React, { useState } from 'react';
import { fetchMbsData } from '../../services/comtradeService';
import { POPULAR_REPORTERS, MBS_SERIES_TYPES } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { History, TrendingUp, Calendar, RefreshCw, AlertCircle, FileText, Database, Layers, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface HistoricalMbsViewProps {
  language: 'fa' | 'en';
}

export const HistoricalMbsView: React.FC<HistoricalMbsViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedCountry, setSelectedCountry] = useState('842'); // USA
  const [seriesType, setSeriesType] = useState('T35.A.V.$');
  const [periodType, setPeriodType] = useState('A');
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mbsRecords, setMbsRecords] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMbsData({
        country_code: selectedCountry,
        series_type: seriesType,
        period_type: periodType,
        format: 'json'
      });
      setRawResponse(response);
      if (response && response.data) {
        setMbsRecords(response.data);
      } else {
        setMbsRecords([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در دریافت سری‌های تاریخی MBS از API سازمان ملل' : 'Failed to fetch MBS historical data from UN API'));
    } finally {
      setLoading(false);
    }
  };

  const currentCountry = POPULAR_REPORTERS.find(c => String(c.id) === selectedCountry);
  const countryName = currentCountry ? (isFa ? currentCountry.nameFa : currentCountry.nameEn) : `Code ${selectedCountry}`;

  // Process data for the historical line chart
  const chartData = mbsRecords
    .map((r: any) => ({
      period: String(r.period || r.year || 'N/A'),
      value: Number(r.value || r.primaryValue || 0),
      conversionFactor: Number(r.conversion_factor || 0)
    }))
    .filter(item => item.value > 0 || item.conversionFactor > 0)
    .sort((a, b) => a.period.localeCompare(b.period));

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'سری‌های تاریخی تجارت سازمان ملل (از سال ۱۹۴۶ تاکنون)' : 'UN MBS Historical Trade Series (1946-)'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              /public/v1/getMBS
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'دسترسی به جامع‌ترین سری زمانی تاریخی تجارت بین‌الملل (Monthly Bulletin of Statistics) شامل ارقام تجاری بعد از جنگ جهانی دوم و جداول ضرایب تبدیل ارزی T35 و T38.'
              : 'Access the UN Monthly Bulletin of Statistics historical trade time series back to 1946, covering total trade values (T35) and historical currency conversion factors (T38).'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Country */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isFa ? 'کشور انتخابی' : 'Country'}
            </label>
            <select
              id="mbs-country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {POPULAR_REPORTERS.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.flag} {isFa ? c.nameFa : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Series Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isFa ? 'نوع جدول MBS' : 'MBS Series'}
            </label>
            <select
              id="mbs-series-select"
              value={seriesType}
              onChange={(e) => {
                setSeriesType(e.target.value);
                if (e.target.value.includes('.Q.')) setPeriodType('Q');
                else if (e.target.value.includes('.M.')) setPeriodType('M');
                else setPeriodType('A');
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {MBS_SERIES_TYPES.map((s) => (
                <option key={s.code} value={s.code}>
                  {isFa ? s.nameFa : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Period Frequency */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isFa ? 'تواتر زمانی' : 'Frequency'}
            </label>
            <select
              id="mbs-period-type-select"
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="A">{isFa ? 'سالانه (Annual)' : 'Annual (A)'}</option>
              <option value="Q">{isFa ? 'فصلی (Quarterly)' : 'Quarterly (Q)'}</option>
              <option value="M">{isFa ? 'ماهانه (Monthly)' : 'Monthly (M)'}</option>
            </select>
          </div>

          <div className="self-end">
            <button
              id="mbs-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'استعلام' : 'Query'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام سرور سازمان ملل:' : 'UN Server Message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && mbsRecords.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده استعلام سری‌های زمانی و داده‌های تاریخی تجارت جهانی (MBS)' : 'Ready for Historical MBS Series Query'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور، نوع سری آماری و توالی زمانی را در کادر بالا انتخاب کرده و روی دکمه «استعلام» کلیک کنید.'
              : 'Select country, series type, and frequency above, then click "Query" to view long-term trade trends.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No MBS Historical Data Found */}
      {hasExecuted && !loading && mbsRecords.length === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Historical MBS Records Found in UN Database'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${countryName}» در این سری داده تاریخی (MBS)، رکوردی در سرورهای UN Comtrade ثبت نشده است. لطفاً نوع جدول یا کشور دیگری را انتخاب فرمایید.`
                : `No historical trade series found for ${countryName}. Please select another table type or try a different country.`}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCountry('842')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تست با ایالات متحده (USA)' : '🔄 Test with USA'}
              </button>
              <button
                onClick={() => setSelectedCountry('156')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تست با چین (China)' : '🔄 Test with China'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>{isFa ? `روند تاریخی بلندمدت برای ${countryName}` : `Long-Term Historical Trend for ${countryName}`}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {chartData.length} {isFa ? 'نقطه زمانی ثبت شده' : 'Time-points'}
          </span>
        </div>

        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(v) => seriesType.includes('T38') ? v.toFixed(2) : `$${(v / 1e9).toFixed(1)}B`} 
                />
                <RechartsTooltip 
                  formatter={(val: any) => [
                    seriesType.includes('T38') ? val : formatUSD(val, language), 
                    seriesType.includes('T38') ? (isFa ? 'ضریب تبدیل ارز' : 'Conversion Factor') : (isFa ? 'ارزش کل' : 'Total Trade')
                  ]} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={isFa ? 'ارزش تجارت (دلار)' : 'Trade Value (USD)'} 
                  stroke="#d97706" 
                  strokeWidth={2.5} 
                  dot={{ r: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              {loading ? (isFa ? 'در حال بارگذاری سری‌های تاریخی...' : 'Loading MBS Historical Series...') : (isFa ? 'رکوردی برای این جدول یافت نشد.' : 'No data records found.')}
            </div>
          )}
        </div>
      </div>

      {/* Raw Historical Data Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            <span>{isFa ? 'جدول کامل داده‌های تاریخی گمرکی' : 'Historical Data Table'}</span>
          </h3>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {mbsRecords.length} {isFa ? 'رکورد' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-2.5 text-start">{isFa ? 'دوره زمانی (Period)' : 'Period'}</th>
                <th className="p-2.5 text-start">{isFa ? 'سری داده (Series)' : 'Series Type'}</th>
                <th className="p-2.5 text-start">{isFa ? 'جریان (Flow)' : 'Trade Flow'}</th>
                <th className="p-2.5 text-end">{isFa ? 'ارزش ثبتی سازمان ملل' : 'Recorded Value'}</th>
                <th className="p-2.5 text-end">{isFa ? 'واحد' : 'Unit'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mbsRecords.length > 0 ? (
                mbsRecords.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-2.5 font-mono font-semibold text-slate-800">{r.period || r.year || 'N/A'}</td>
                    <td className="p-2.5 font-mono text-slate-600">{r.series_type || seriesType}</td>
                    <td className="p-2.5 text-slate-600">{r.flowDesc || r.flow || (isFa ? 'کل مبادلات' : 'Total')}</td>
                    <td className="p-2.5 font-mono font-bold text-end text-slate-900">
                      {r.value !== undefined ? (seriesType.includes('T38') ? Number(r.value).toFixed(4) : formatUSD(r.value, language)) : 'N/A'}
                    </td>
                    <td className="p-2.5 text-end font-mono text-slate-500">{r.unit || (seriesType.includes('T38') ? 'Factor' : 'USD')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {loading ? (isFa ? 'در حال واکشی داده‌های تاریخی...' : 'Fetching Historical MBS...') : (isFa ? 'هیچ رکوردی برای نمایش وجود ندارد.' : 'No records returned.')}
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
