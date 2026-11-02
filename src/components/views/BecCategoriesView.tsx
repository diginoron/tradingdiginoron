import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Layers, PieChart as PieIcon, RefreshCw, AlertCircle, TrendingUp, Factory, ShoppingCart, Cpu, Flame } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BecCategoriesViewProps {
  language: 'fa' | 'en';
}

export const BecCategoriesView: React.FC<BecCategoriesViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [reporterCountry, setReporterCountry] = useState<string>('364'); // Iran
  const [partnerCountry, setPartnerCountry] = useState<string>('0'); // World
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2021');
  const [flowDirection, setFlowDirection] = useState<'M' | 'X'>('M'); // Imports / Exports

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [becData, setBecData] = useState<{
    intermediateUSD: number;
    capitalUSD: number;
    consumptionUSD: number;
    fuelUSD: number;
    totalUSD: number;
  } | null>(null);

  const analyzeBec = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);

    try {
      // Query sample chapters representing key BEC segments
      // 1. Raw & Intermediate: HS 25-28 (Minerals/Chemicals), 72-73 (Steel/Metals), 44 (Wood), 52 (Cotton)
      // 2. Capital Goods: HS 84 (Machinery), 85 (Electrical/Tech), 90 (Precision Instruments)
      // 3. Consumption: HS 02, 04, 08 (Food/Agri), 61-62 (Apparel), 94 (Furniture), 8703 (Passenger cars)
      // 4. Fuels & Energy: HS 27 (Oil, Gas, Petroleum)

      const chaptersToQuery = ['27', '84', '85', '72', '08', '29', '30'];
      const responses = await Promise.all(
        chaptersToQuery.map(ch => 
          fetchComtradeData({
            reporterCode: reporterCountry,
            partnerCode: partnerCountry,
            period: selectedPeriod,
            cmdCode: ch,
            flowCode: flowDirection,
            typeCode: 'C',
            freqCode: 'A',
            clCode: 'HS'
          }).catch(() => null)
        )
      );

      let fuelVal = 0;
      let capitalVal = 0;
      let intermediateVal = 0;
      let consumptionVal = 0;

      responses.forEach((res, idx) => {
        const val = Number(res?.data?.[0]?.primaryValue || 0);
        const ch = chaptersToQuery[idx];
        if (ch === '27') fuelVal += val;
        else if (ch === '84' || ch === '85') capitalVal += val;
        else if (ch === '72' || ch === '29') intermediateVal += val;
        else if (ch === '08' || ch === '30') consumptionVal += val;
      });

      // Total aggregated for estimation breakdown
      const total = fuelVal + capitalVal + intermediateVal + consumptionVal;

      if (total === 0) {
        setBecData(null);
        return;
      }

      setBecData({
        intermediateUSD: intermediateVal,
        capitalUSD: capitalVal,
        consumptionUSD: consumptionVal,
        fuelUSD: fuelVal,
        totalUSD: total
      });

    } catch (err: any) {
      setError(err.message || 'Failed to fetch BEC trade categories');
    } finally {
      setLoading(false);
    }
  };

  const repObj = ALL_UN_COUNTRIES.find(c => String(c.id) === reporterCountry);
  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : `Country ${reporterCountry}`;

  const pieChartData = becData ? [
    { name: isFa ? 'کالاهای واسطه‌ای و مواد اولیه' : 'Intermediate & Raw', value: becData.intermediateUSD, color: '#3b82f6' },
    { name: isFa ? 'کالاهای سرمایه‌ای و ماشین‌آلات' : 'Capital Goods', value: becData.capitalUSD, color: '#10b981' },
    { name: isFa ? 'کالاهای مصرفی نهایی' : 'Consumption Goods', value: becData.consumptionUSD, color: '#f59e0b' },
    { name: isFa ? 'سوخت، انرژی و پتروشیمی' : 'Fuels & Energy', value: becData.fuelUSD, color: '#8b5cf6' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'دسته‌بندی ماهیت اقتصادی کالاها BEC (Broad Economic Categories)' : 'Broad Economic Categories (BEC) Analysis'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              UN BEC Classification
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'تفکیک ساختار واردات و صادرات کشور به سه محور استراتژیک: مواد اولیه و قطعات واسطه‌ای، ماشین‌آلات سرمایه‌ای و اقلام مصرفی خانوار.'
              : 'Classify international trade flows by end-use economic categories: Capital, Intermediate, and Consumption.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={reporterCountry}
            onChange={(e) => setReporterCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {ALL_UN_COUNTRIES.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.flag} {isFa ? c.nameFa : c.nameEn}
              </option>
            ))}
          </select>

          <select
            value={flowDirection}
            onChange={(e) => setFlowDirection(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="M">{isFa ? 'ساختار واردات (Imports)' : 'Imports (M)'}</option>
            <option value="X">{isFa ? 'ساختار صادرات (Exports)' : 'Exports (X)'}</option>
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={analyzeBec}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'تحلیل ساختار اقتصادی' : 'Analyze'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'خطا در بارگذاری:' : 'Error:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && !becData && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده تحلیل دسته‌بندی ماهیت اقتصادی کالاها (BEC)' : 'Ready for Broad Economic Categories (BEC) Analysis'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور، سال و جهت جریان را در کادر بالا انتخاب کرده و روی دکمه «تحلیل ساختار اقتصادی» کلیک کنید.'
              : 'Select country, period, and flow direction above, then click "Analyze" to inspect economic composition.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Data Recorded */}
      {hasExecuted && !loading && !becData && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No BEC Data Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${repName}» در سال «${selectedPeriod}» داده‌های تفکیک اقتصادی در پایگاه داده سازمان ملل ثبت نشده است. لطفاً سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا کشور دیگری را انتخاب فرمایید.`
                : `No economic classification records found for ${repName} in year ${selectedPeriod}. Please adjust your filters or switch to an earlier year.`}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedPeriod('2021')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2021' : '🔄 Switch to 2021'}
              </button>
              <button
                onClick={() => setSelectedPeriod('2022')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2022' : '🔄 Switch to 2022'}
              </button>
            </div>
          </div>
        </div>
      )}

      {becData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 4 Cards */}
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Intermediate */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Factory className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isFa ? 'کالاهای واسطه‌ای و مواد اولیه' : 'Intermediate Goods'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">BEC Category 121, 22, 42</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-blue-600 mt-2">
                {formatUSD(becData.intermediateUSD, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {((becData.intermediateUSD / becData.totalUSD) * 100).toFixed(1)}% {isFa ? 'از کل ترکیب اقتصادی' : 'of total basket'}
              </div>
            </div>

            {/* 2. Capital Goods */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Cpu className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isFa ? 'کالاهای سرمایه‌ای و تجهیزات تولید' : 'Capital Goods & Machinery'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">BEC Category 41, 521</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-2">
                {formatUSD(becData.capitalUSD, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {((becData.capitalUSD / becData.totalUSD) * 100).toFixed(1)}% {isFa ? 'از کل ترکیب اقتصادی' : 'of total basket'}
              </div>
            </div>

            {/* 3. Consumption Goods */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <ShoppingCart className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isFa ? 'کالاهای مصرفی نهایی خانوار' : 'Consumption Goods'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">BEC Category 112, 62, 63</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 mt-2">
                {formatUSD(becData.consumptionUSD, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {((becData.consumptionUSD / becData.totalUSD) * 100).toFixed(1)}% {isFa ? 'از کل ترکیب اقتصادی' : 'of total basket'}
              </div>
            </div>

            {/* 4. Fuels & Energy */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Flame className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isFa ? 'سوخت، انرژی و پتروشیمی' : 'Fuels & Energy'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">BEC Category 31, 32</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-purple-600 mt-2">
                {formatUSD(becData.fuelUSD, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {((becData.fuelUSD / becData.totalUSD) * 100).toFixed(1)}% {isFa ? 'از کل ترکیب اقتصادی' : 'of total basket'}
              </div>
            </div>
          </div>

          {/* Pie Chart Visualizer */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-500" />
              <span>{isFa ? 'نمودار سهم ماهیت اقتصادی' : 'Economic End-Use Share'}</span>
            </h3>

            <div className="h-56 w-full mt-2">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={4}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatUSD(Number(value), language)} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  {loading ? (isFa ? 'در حال تحلیل...' : 'Loading...') : (isFa ? 'داده‌ای یافت نشد' : 'No data')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
